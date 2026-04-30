import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Card, Badge, EmptyState, Avatar } from '../../components/ui'
import { format, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Car, Users, PartyPopper, Trophy, CalendarDays, MapPin,
  X, Pencil, UserPlus, Plus, Home, Bus,
} from 'lucide-react'

// ─── Config types événements ───────────────────────────────────────────────
const EVENT_TYPE_CONFIG = {
  carpool:    { icon: Car,         label: 'Covoiturage', variant: 'blue'   },
  meeting:    { icon: Users,       label: 'Réunion',     variant: 'gray'   },
  social:     { icon: PartyPopper, label: 'Social',      variant: 'purple' },
  tournament: { icon: Trophy,      label: 'Tournoi',     variant: 'orange' },
}

// ─── Onglets ───────────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: 'club',    label: 'Club'   },
  { id: 'team',    label: 'Équipe' },
  { id: 'matches', label: 'Matchs' },
]

export default function EventsPage() {
  const { currentUser, is, isOneOf, canManageTeam } = useAuth()
  const navigate = useNavigate()
  const { events, matches, loading, getUserById, getTeamById, getFullName } = useClubData()

  const [activeTab,          setActiveTab]          = useState('club')
  const [selectedEvent,      setSelectedEvent]      = useState(null)
  const [attendanceOverrides, setAttendanceOverrides] = useState({})

  // ── Onglets visibles selon le rôle ─────────────────────────────────────
  const tabs = ALL_TABS.filter(t => {
    if (t.id === 'team') return !isOneOf('supporter', 'parent')
    return true
  })

  // Si l'onglet actif n'est plus visible (ex: supporter passe à 'team'), reset
  const safeTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id

  // ── Filtrage événements Club ────────────────────────────────────────────
  const clubEvents = events.filter(ev => {
    if (ev.category !== 'club') return false
    if (ev.visibility === 'club') return true
    if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
    return false
  }).sort((a, b) => a.startsAt - b.startsAt)

  // ── Filtrage événements Équipe ──────────────────────────────────────────
  const teamEvents = events.filter(ev => {
    if (ev.category !== 'team') return false
    if (is('president')) return true
    return currentUser.teamIds?.includes(ev.teamId)
  }).sort((a, b) => a.startsAt - b.startsAt)

  // ── Matchs programmés ──────────────────────────────────────────────────
  const upcomingMatches = matches.filter(m => {
    if (m.status !== 'scheduled') return false
    if (isOneOf('president', 'supporter', 'parent')) return true
    return currentUser.teamIds?.includes(m.teamId)
  }).sort((a, b) => a.scheduledAt - b.scheduledAt)

  // ── Peut créer selon l'onglet ──────────────────────────────────────────
  function canCreate(tab) {
    if (tab === 'club')    return is('president')
    if (tab === 'team')    return isOneOf('president', 'coach')
    return false
  }

  // ── Attendance helpers ─────────────────────────────────────────────────
  function isAttending(event) {
    if (event.id in attendanceOverrides) return attendanceOverrides[event.id]
    return (event.attendees ?? []).includes(currentUser.id)
  }

  function toggleAttendance(event, e) {
    e?.stopPropagation()
    setAttendanceOverrides(prev => ({ ...prev, [event.id]: !isAttending(event) }))
  }

  function getDisplayAttendees(event) {
    const base = (event.attendees ?? []).filter(id => id !== currentUser.id)
    return isAttending(event) ? [...base, currentUser.id] : base
  }

  // ── Panel détail ───────────────────────────────────────────────────────
  const detailEvent     = selectedEvent
  const detailCfg       = detailEvent ? (EVENT_TYPE_CONFIG[detailEvent.type] ?? EVENT_TYPE_CONFIG.meeting) : null
  const detailAttend    = detailEvent ? getDisplayAttendees(detailEvent) : []
  const isCreatorOrPres = detailEvent &&
    (detailEvent.createdBy === currentUser.id || is('president'))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

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
        {canCreate(safeTab) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                             text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Créer
          </button>
        )}
      </div>

      {/* ── Onglets ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              safeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Onglet Club ─────────────────────────────────────────────────── */}
      {safeTab === 'club' && (
        clubEvents.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={40} />}
            title="Aucun événement club"
            description="Aucun événement club n'est programmé pour le moment."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clubEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={currentUser.id}
                attending={isAttending(event)}
                onToggle={toggleAttendance}
                onClick={() => setSelectedEvent(event)}
                getTeamById={getTeamById}
                getUserById={getUserById}
              />
            ))}
          </div>
        )
      )}

      {/* ── Onglet Équipe ───────────────────────────────────────────────── */}
      {safeTab === 'team' && (
        teamEvents.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title="Aucun événement d'équipe"
            description={
              isOneOf('president', 'coach')
                ? "Créez un covoiturage, une réunion ou un événement pour votre équipe."
                : "Aucun événement n'est prévu pour votre équipe."
            }
            action={
              isOneOf('president', 'coach') && (
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                                   text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus size={15} /> Créer un événement
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={currentUser.id}
                attending={isAttending(event)}
                onToggle={toggleAttendance}
                onClick={() => setSelectedEvent(event)}
                getTeamById={getTeamById}
                getUserById={getUserById}
              />
            ))}
          </div>
        )
      )}

      {/* ── Onglet Matchs ───────────────────────────────────────────────── */}
      {safeTab === 'matches' && (
        upcomingMatches.length === 0 ? (
          <EmptyState
            icon={<Trophy size={40} />}
            title="Aucun match programmé"
            description="Les prochains matchs apparaîtront ici."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingMatches.map(m => {
              const team = getTeamById(m.teamId)
              return (
                <Card
                  key={m.id}
                  className="p-4 cursor-pointer hover:border-surface-300 transition-all"
                  onClick={() => navigate(`/app/matches/${m.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-surface-900">{team?.name}</span>
                    <Badge variant="blue">{team?.category}</Badge>
                  </div>
                  <div className="text-lg font-bold text-surface-900 mb-3">
                    vs {m.opponentName}
                  </div>
                  <div className="space-y-1.5 text-xs text-surface-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {format(m.scheduledAt, "EEE d MMM yyyy · HH'h'mm", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {m.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {m.isHome
                        ? <><Home size={12} /> Domicile</>
                        : <><Bus size={12} /> Déplacement</>
                      }
                    </div>
                    {m.referee && (
                      <div className="text-surface-400">Arbitre : {m.referee}</div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* ── Panel détail événement ──────────────────────────────────────── */}
      {detailEvent && (
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
                  <Badge variant={detailCfg.variant}>{detailCfg.label}</Badge>
                  {detailEvent.teamId && (
                    <Badge variant="gray">{getTeamById(detailEvent.teamId)?.name}</Badge>
                  )}
                </div>
                <h2 className="font-display font-bold text-xl text-surface-900 leading-snug">
                  {detailEvent.title}
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
              {detailEvent.description && (
                <p className="text-sm text-surface-700 leading-relaxed">
                  {detailEvent.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CalendarDays size={15} className="text-surface-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-surface-700">
                    <span className="font-medium">
                      {format(detailEvent.startsAt, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </span>
                    {detailEvent.endsAt && (
                      <span className="text-surface-400">
                        {' '}→ {format(detailEvent.endsAt, "HH'h'mm", { locale: fr })}
                        <span className="text-xs ml-1">
                          ({differenceInMinutes(detailEvent.endsAt, detailEvent.startsAt)} min)
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-surface-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-surface-700">{detailEvent.location}</span>
                </div>
              </div>

              {/* Participants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Participants
                  </p>
                  <span className="text-xs text-surface-500">
                    {detailAttend.length}
                    {detailEvent.maxAttendees
                      ? ` / ${detailEvent.maxAttendees} ${detailAttend.length >= detailEvent.maxAttendees ? '(complet)' : 'places'}`
                      : ' inscrits'
                    }
                  </span>
                </div>

                {detailEvent.maxAttendees && (
                  <div className="w-full bg-surface-100 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((detailAttend.length / detailEvent.maxAttendees) * 100))}%` }}
                    />
                  </div>
                )}

                {detailAttend.length === 0 ? (
                  <p className="text-sm text-surface-400">Aucun participant pour l'instant.</p>
                ) : (
                  <div className="space-y-2">
                    {detailAttend.map(uid => {
                      const u = getUserById(uid)
                      if (!u) return null
                      return (
                        <div key={uid} className="flex items-center gap-2.5">
                          <Avatar user={u} size="sm" />
                          <span className="text-sm text-surface-800">{getFullName(u)}</span>
                          {uid === currentUser.id && (
                            <span className="text-xs text-brand-600 font-medium ml-auto">Vous</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-surface-100 space-y-2">
              <button
                onClick={(e) => toggleAttendance(detailEvent, e)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                            text-sm font-medium transition-colors ${
                  isAttending(detailEvent)
                    ? 'bg-surface-100 hover:bg-surface-200 text-surface-700'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                {isAttending(detailEvent)
                  ? <><X size={15} /> Je ne viens plus</>
                  : <><UserPlus size={15} /> Je viens</>
                }
              </button>
              {isCreatorOrPres && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                   text-sm font-medium bg-white border border-surface-200
                                   hover:bg-surface-50 text-surface-700 transition-colors">
                  <Pencil size={14} /> Modifier
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Carte événement ───────────────────────────────────────────────────────
function EventCard({ event, currentUserId, attending, onToggle, onClick, getTeamById, getUserById }) {
  const cfg  = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.meeting
  const Icon = cfg.icon
  const team = event.teamId ? getTeamById(event.teamId) : null

  return (
    <Card
      className="p-4 cursor-pointer hover:border-surface-300 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                         ${attending ? 'bg-brand-50' : 'bg-surface-100'}`}>
          <Icon size={18} className={attending ? 'text-brand-600' : 'text-surface-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {team && <Badge variant="gray">{team.name}</Badge>}
          </div>
          <h3 className="font-semibold text-surface-900 text-sm leading-snug">
            {event.title}
          </h3>
          <div className="mt-2 space-y-0.5 text-xs text-surface-500">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={11} />
              {format(event.startsAt, "EEE d MMM 'à' HH'h'mm", { locale: fr })}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={11} />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          {(event.attendees ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="flex -space-x-1">
                {(event.attendees ?? []).slice(0, 4).map(uid => {
                  const u = getUserById(uid)
                  return u ? <Avatar key={uid} user={u} size="xs" className="ring-2 ring-white" /> : null
                })}
              </div>
              <span className="text-xs text-surface-400">
                {event.attendees.length}
                {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
