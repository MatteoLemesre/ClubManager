import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EVENTS, MATCHES, TRAININGS, getTeamById, getUserById, getFullName } from '../../data/mock'
import { Card, Badge, SectionHeader, StatCard, EmptyState, Avatar } from '../../components/ui'
import { format, isAfter, parseISO, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Car, Users, PartyPopper, Trophy, Calendar, MapPin, Clock, ChevronRight,
  X, Pencil, CheckCircle2, UserPlus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EVENT_TYPE_CONFIG = {
  carpooling: { icon: Car,         label: 'Covoiturage', variant: 'blue' },
  meeting:    { icon: Users,       label: 'Réunion',     variant: 'gray' },
  social:     { icon: PartyPopper, label: 'Social',      variant: 'purple' },
  tournament: { icon: Trophy,      label: 'Tournoi',     variant: 'orange' },
}

// Gère à la fois Date objects (ev-5) et ISO strings (anciens events)
function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  return parseISO(val)
}

function getStartDate(event) {
  return toDate(event.startsAt ?? event.date)
}

function getEndDate(event) {
  return toDate(event.endsAt ?? null)
}

export default function EventsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [selectedEvent,       setSelectedEvent]       = useState(null)
  const [attendanceOverrides, setAttendanceOverrides] = useState({})

  // ── Data ──────────────────────────────────────────────────────────────────
  const upcomingEvents = EVENTS
    .filter(e => { const d = getStartDate(e); return d && isAfter(d, new Date()) })
    .sort((a, b) => getStartDate(a) - getStartDate(b))

  const upcomingMatches = MATCHES
    .filter(m => m.status === 'upcoming' && isAfter(parseISO(m.date), new Date()))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))
    .slice(0, 3)

  const nextTraining = TRAININGS
    .filter(t => isAfter(parseISO(t.date), new Date()))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))[0]

  // ── Attendance helpers ────────────────────────────────────────────────────
  function isAttending(event) {
    if (event.id in attendanceOverrides) return attendanceOverrides[event.id]
    return (event.attendees ?? []).includes(currentUser.id)
  }

  function toggleAttendance(event, e) {
    e?.stopPropagation()
    setAttendanceOverrides(prev => ({ ...prev, [event.id]: !isAttending(event) }))
  }

  // Attendees list for a given event (reflecting local toggles)
  function getDisplayAttendees(event) {
    const base = (event.attendees ?? []).filter(id => id !== currentUser.id)
    return isAttending(event) ? [...base, currentUser.id] : base
  }

  // ── Detail panel helpers ──────────────────────────────────────────────────
  const detailEvent    = selectedEvent
  const detailCfg      = detailEvent ? (EVENT_TYPE_CONFIG[detailEvent.type] ?? EVENT_TYPE_CONFIG.meeting) : null
  const detailStart    = detailEvent ? getStartDate(detailEvent) : null
  const detailEnd      = detailEvent ? getEndDate(detailEvent) : null
  const detailAttend   = detailEvent ? getDisplayAttendees(detailEvent) : []
  const isCreatorOrPres = detailEvent &&
    (detailEvent.createdBy === currentUser.id || currentUser.role === 'president')

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-surface-900">
          Bonjour, {currentUser.firstName} 👋
        </h1>
        <p className="text-surface-500 mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          value={upcomingMatches.length}
          label="Matchs à venir"
          color="brand"
          icon={<Trophy size={20} />}
        />
        <StatCard
          value={upcomingEvents.length}
          label="Événements"
          color="purple"
          icon={<Calendar size={20} />}
        />
        <StatCard
          value={nextTraining ? '1' : '0'}
          label="Prochain entraînement"
          sub={nextTraining ? format(parseISO(nextTraining.date), 'EEE d MMM', { locale: fr }) : 'Aucun'}
          color="green"
          icon={<Clock size={20} />}
        />
      </div>

      <div className="grid grid-cols-5 gap-6">

        {/* Événements — colonne principale */}
        <div className="col-span-3 space-y-6">
          <SectionHeader title="Événements à venir" />

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="Aucun événement prévu"
              description="Aucun événement n'est programmé pour le moment."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const cfg      = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.meeting
                const Icon     = cfg.icon
                const team     = event.teamId ? getTeamById(event.teamId) : null
                const start    = getStartDate(event)
                const attending = isAttending(event)

                return (
                  <Card
                    key={event.id}
                    className="p-4 hover:border-surface-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                       ${attending ? 'bg-brand-50' : 'bg-surface-100'}`}>
                        <Icon size={18} className={attending ? 'text-brand-600' : 'text-surface-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          {team && <Badge variant="gray">{team.name}</Badge>}
                          {attending && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} /> Inscrit
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-surface-900 text-sm leading-snug">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                          {start && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {format(start, "EEE d MMM 'à' HH'h'mm", { locale: fr })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </span>
                        </div>
                        {(event.attendees ?? []).length > 0 && (
                          <div className="flex items-center gap-1 mt-3">
                            <div className="flex -space-x-1">
                              {(event.attendees ?? []).slice(0, 4).map(uid => {
                                const u = getUserById(uid)
                                return u ? <Avatar key={uid} user={u} size="xs" className="ring-2 ring-white" /> : null
                              })}
                            </div>
                            <span className="text-xs text-surface-400 ml-1">
                              {event.attendees.length}
                              {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} participant{event.attendees.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-surface-300 flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar droite */}
        <div className="col-span-2 space-y-6">

          {/* Prochains matchs */}
          <div>
            <SectionHeader title="Prochains matchs" />
            {upcomingMatches.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">Aucun match prévu</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map(match => {
                  const team = getTeamById(match.teamId)
                  return (
                    <Card
                      key={match.id}
                      className="p-3"
                      onClick={() => navigate(`/app/matches/${match.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-surface-500 mb-0.5">{team?.name}</p>
                          <p className="text-sm font-semibold text-surface-900 leading-tight">
                            {match.location === 'home' ? 'vs' : '@'} {match.opponent}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {format(parseISO(match.date), "d MMM · HH'h'mm", { locale: fr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={match.location === 'home' ? 'green' : 'orange'}>
                            {match.location === 'home' ? 'Dom.' : 'Ext.'}
                          </Badge>
                          <ChevronRight size={14} className="text-surface-300" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Prochain entraînement */}
          {nextTraining && (
            <div>
              <SectionHeader title="Prochain entraînement" />
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 mb-0.5">{getTeamById(nextTraining.teamId)?.name}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {format(parseISO(nextTraining.date), "EEEE d MMM 'à' HH'h'mm", { locale: fr })} · {nextTraining.duration} min
                    </p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {nextTraining.location}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel détail événement ───────────────────────────────────────────── */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setSelectedEvent(null)}
          />

          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* Header panel */}
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

              {/* Description */}
              {detailEvent.description && (
                <p className="text-sm text-surface-700 leading-relaxed">
                  {detailEvent.description}
                </p>
              )}

              {/* Infos date + lieu */}
              <div className="space-y-2">
                {detailStart && (
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-surface-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-surface-700">
                      <span className="font-medium">
                        {format(detailStart, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </span>
                      {detailEnd && (
                        <span className="text-surface-400">
                          {' '}→ {format(detailEnd, "HH'h'mm", { locale: fr })}
                          {' '}
                          <span className="text-xs">
                            ({differenceInMinutes(detailEnd, detailStart)} min)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                    {detailEvent.maxAttendees ? (
                      <span>
                        {' / '}{detailEvent.maxAttendees}
                        {' '}
                        <span className={detailAttend.length >= detailEvent.maxAttendees ? 'text-red-500' : 'text-emerald-600'}>
                          {detailAttend.length >= detailEvent.maxAttendees ? '(complet)' : 'places'}
                        </span>
                      </span>
                    ) : ' inscrits'}
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

            {/* Footer actions */}
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
                {isAttending(detailEvent) ? (
                  <><X size={15} /> Je ne viens plus</>
                ) : (
                  <><UserPlus size={15} /> Je viens</>
                )}
              </button>

              {isCreatorOrPres && (
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                             text-sm font-medium bg-white border border-surface-200
                             hover:bg-surface-50 text-surface-700 transition-colors"
                >
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
