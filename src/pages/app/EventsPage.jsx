import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, Badge, EmptyState } from '../../components/ui'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Car, Users, PartyPopper, Trophy, CalendarDays, MapPin,
  X, Pencil, UserPlus, Plus, Home, Bus, Search,
} from 'lucide-react'
import { getMyEvents, getMyUpcomingMatches } from '../../services/db'
import { supabase } from '../../lib/supabase'

// ─── Config types événements ───────────────────────────────────────────────
const EVENT_TYPE_CONFIG = {
  carpool:    { icon: Car,         label: 'Covoiturage', variant: 'blue'   },
  meeting:    { icon: Users,       label: 'Réunion',     variant: 'gray'   },
  social:     { icon: PartyPopper, label: 'Social',      variant: 'purple' },
  tournament: { icon: Trophy,      label: 'Tournoi',     variant: 'orange' },
}

export default function EventsPage() {
  const { currentUser, is, isOneOf } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('events')

  // ── Données Supabase ───────────────────────────────────────────────────────
  const [events,         setEvents]         = useState([])
  const [matches,        setMatches]        = useState([])
  const [eventsLoading,  setEventsLoading]  = useState(true)
  const [matchesLoading, setMatchesLoading] = useState(true)

  // ── Panel détail événement ─────────────────────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState(null)

  // ── Création événement ────────────────────────────────────────────────────
  const [showCreateEvent, setShowCreateEvent] = useState(false)

  useEffect(() => {
    setEventsLoading(true)
    getMyEvents(currentUser.id, currentUser.current_club_id)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setEventsLoading(false))
  }, [currentUser.id, currentUser.current_club_id])

  useEffect(() => {
    setMatchesLoading(true)
    getMyUpcomingMatches(currentUser.id)
      .then(setMatches)
      .catch(() => {})
      .finally(() => setMatchesLoading(false))
  }, [currentUser.id])

  // ── Regrouper les événements par club ──────────────────────────────────────
  const eventsByClub = events.reduce((acc, ev) => {
    const key  = ev.club_id
    const name = ev.clubs?.name ?? 'Club'
    if (!acc[key]) acc[key] = { name, events: [] }
    acc[key].events.push(ev)
    return acc
  }, {})

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Événements</h1>
          <p className="text-surface-500 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        {activeTab === 'events' && isOneOf('president', 'coach') && (
          <button
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                       text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Créer
          </button>
        )}
      </div>

      {/* ── Onglets ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {[
          { id: 'events',  label: '📣 Événements' },
          { id: 'matches', label: '⚽ Matchs à venir' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Événements ─────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        eventsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-semibold text-surface-700 mb-2">Aucun événement à venir</div>
            <p className="text-sm text-surface-400 mb-5">
              Suivez des clubs ou rejoignez une équipe pour voir leurs événements ici.
            </p>
            <button
              onClick={() => navigate('/app/team')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600
                         hover:bg-brand-700 text-white rounded-xl text-sm font-medium"
            >
              <Search size={15} /> Explorer les clubs
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(eventsByClub).map(([clubId, { name, events: evs }]) => (
              <div key={clubId}>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                  {name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evs.map(ev => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      onClick={() => setSelectedEvent(ev)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Onglet Matchs à venir ─────────────────────────────────────────── */}
      {activeTab === 'matches' && (
        matchesLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={<Trophy size={40} />}
            title="Aucun match à venir"
            description="Suivez des équipes pour voir leurs prochains matchs ici."
            action={
              <button
                onClick={() => navigate('/app/team')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                           text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Search size={15} /> Explorer les équipes
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matches.map(m => (
              <Card
                key={m.id}
                className="p-4 cursor-pointer hover:border-surface-300 transition-all"
                onClick={() => navigate(`/app/matches/${m.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-surface-900">
                    {m.teams?.name}
                  </span>
                  <Badge variant="blue">{m.teams?.category}</Badge>
                </div>
                {m.teams?.clubs?.name && (
                  <div className="text-xs text-surface-400 mb-2">{m.teams.clubs.name}</div>
                )}
                <div className="text-lg font-bold text-surface-900 mb-3">
                  vs {m.opponent_name}
                </div>
                <div className="space-y-1.5 text-xs text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {format(new Date(m.scheduled_at), "EEE d MMM yyyy · HH'h'mm", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    {m.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.is_home
                      ? <><Home size={12} /> Domicile</>
                      : <><Bus size={12} /> Déplacement</>
                    }
                  </div>
                  {m.referee && (
                    <div className="text-surface-400">Arbitre : {m.referee}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── Modal création événement ────────────────────────────────────── */}
      {showCreateEvent && (
        <CreateEventModal
          clubId={currentUser.current_club_id}
          authorId={currentUser.id}
          onClose={() => setShowCreateEvent(false)}
          onCreated={(ev) => {
            setEvents(prev => [ev, ...prev])
            setShowCreateEvent(false)
          }}
        />
      )}

      {/* ── Panel détail événement ──────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-surface-100">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {(() => {
                    const cfg = EVENT_TYPE_CONFIG[selectedEvent.type] ?? EVENT_TYPE_CONFIG.meeting
                    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  })()}
                  {selectedEvent.clubs?.name && (
                    <Badge variant="gray">{selectedEvent.clubs.name}</Badge>
                  )}
                </div>
                <h2 className="font-display font-bold text-xl text-surface-900 leading-snug">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center
                           text-surface-400 hover:text-surface-700 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Corps */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selectedEvent.description && (
                <p className="text-sm text-surface-700 leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
              <div className="space-y-2">
                {selectedEvent.starts_at && (
                  <div className="flex items-start gap-3">
                    <CalendarDays size={15} className="text-surface-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-surface-700">
                      {format(new Date(selectedEvent.starts_at), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      {selectedEvent.ends_at && (
                        <span className="text-surface-400">
                          {' '}→ {format(new Date(selectedEvent.ends_at), "HH'h'mm", { locale: fr })}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-surface-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-surface-700">{selectedEvent.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-surface-100">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white
                                 transition-colors">
                <UserPlus size={15} /> Je participe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal création événement ─────────────────────────────────────────────
function CreateEventModal({ clubId, authorId, onClose, onCreated }) {
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [type,        setType]        = useState('meeting')
  const [location,    setLocation]    = useState('')
  const [startsAt,    setStartsAt]    = useState('')
  const [endsAt,      setEndsAt]      = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  const handleSubmit = async () => {
    if (!title.trim() || !startsAt) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('events')
        .insert({
          club_id:     clubId,
          created_by:  authorId,
          title:       title.trim(),
          description: description.trim() || null,
          type,
          location:    location.trim() || null,
          starts_at:   startsAt,
          ends_at:     endsAt || null,
        })
        .select('*, clubs(name)')
        .single()
      if (err) throw err
      onCreated(data)
    } catch (e) {
      setError('Impossible de créer l\'événement. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-display font-bold text-lg text-surface-900">Nouvel événement</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center
                       text-surface-400 hover:text-surface-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Titre *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nom de l'événement"
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            >
              <option value="meeting">Réunion</option>
              <option value="social">Social</option>
              <option value="tournament">Tournoi</option>
              <option value="carpool">Covoiturage</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détails de l'événement…"
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Lieu
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Adresse ou nom du lieu"
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                         text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                Début *
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                Fin
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5
                           text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-surface-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-surface-600
                       hover:bg-surface-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !startsAt || loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700
                       text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Création…' : 'Créer l\'événement'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Carte événement ───────────────────────────────────────────────────────
function EventCard({ event, onClick }) {
  const cfg  = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.meeting
  const Icon = cfg.icon

  return (
    <Card
      className="p-4 cursor-pointer hover:border-surface-300 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-surface-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <h3 className="font-semibold text-surface-900 text-sm leading-snug">
            {event.title}
          </h3>
          <div className="mt-2 space-y-0.5 text-xs text-surface-500">
            {event.starts_at && (
              <div className="flex items-center gap-1.5">
                <CalendarDays size={11} />
                {format(new Date(event.starts_at), "EEE d MMM 'à' HH'h'mm", { locale: fr })}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin size={11} />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
