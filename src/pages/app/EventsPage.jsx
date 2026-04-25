import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EVENTS, getTeamById, getUserById, getFullName } from '../../data/mock'
import { Card, Badge, EmptyState, Avatar } from '../../components/ui'
import { format, isAfter, isPast, parseISO, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Car, Users, PartyPopper, Trophy, Calendar, MapPin,
  X, Pencil, CheckCircle2, UserPlus, Plus,
} from 'lucide-react'

const EVENT_TYPE_CONFIG = {
  carpooling: { icon: Car,         label: 'Covoiturage', variant: 'blue'   },
  meeting:    { icon: Users,       label: 'Réunion',     variant: 'gray'   },
  social:     { icon: PartyPopper, label: 'Social',      variant: 'purple' },
  tournament: { icon: Trophy,      label: 'Tournoi',     variant: 'orange' },
}

const FILTERS = [
  { key: 'upcoming',    label: 'À venir'      },
  { key: 'all',         label: 'Tous'         },
  { key: 'club',        label: 'Club entier'  },
  { key: 'team',        label: 'Équipe'       },
  { key: 'carpooling',  label: 'Covoiturage'  },
  { key: 'past',        label: 'Passés'       },
]

// Gère Date objects (ev-5) et ISO strings (anciens events)
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

  const [activeFilter,        setActiveFilter]        = useState('upcoming')
  const [selectedEvent,       setSelectedEvent]       = useState(null)
  const [attendanceOverrides, setAttendanceOverrides] = useState({})

  const canCreate = currentUser.role === 'president' || currentUser.role === 'coach'

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const visibleEvents = EVENTS.filter(event => {
    const d = getStartDate(event)
    switch (activeFilter) {
      case 'upcoming':   return d && isAfter(d, new Date())
      case 'past':       return d && isPast(d)
      case 'club':       return !event.teamId
      case 'team':       return !!event.teamId
      case 'carpooling': return event.type === 'carpooling'
      default:           return true
    }
  }).sort((a, b) => {
    const da = getStartDate(a)
    const db = getStartDate(b)
    if (!da || !db) return 0
    return activeFilter === 'past' ? db - da : da - db
  })

  // ── Attendance helpers ────────────────────────────────────────────────────
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

  // ── Detail panel ──────────────────────────────────────────────────────────
  const detailEvent     = selectedEvent
  const detailCfg       = detailEvent ? (EVENT_TYPE_CONFIG[detailEvent.type] ?? EVENT_TYPE_CONFIG.meeting) : null
  const detailStart     = detailEvent ? getStartDate(detailEvent) : null
  const detailEnd       = detailEvent ? getEndDate(detailEvent) : null
  const detailAttend    = detailEvent ? getDisplayAttendees(detailEvent) : []
  const isCreatorOrPres = detailEvent &&
    (detailEvent.createdBy === currentUser.id || currentUser.role === 'president')

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Événements</h1>
          <p className="text-surface-500 mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        {canCreate && (
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                             text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Créer
          </button>
        )}
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Grille événements ───────────────────────────────────────────────── */}
      {visibleEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="Aucun événement"
          description="Aucun événement ne correspond à ce filtre."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {visibleEvents.map(event => {
            const cfg      = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.meeting
            const Icon     = cfg.icon
            const team     = event.teamId ? getTeamById(event.teamId) : null
            const start    = getStartDate(event)
            const attending = isAttending(event)
            const past     = start && isPast(start)

            return (
              <Card
                key={event.id}
                className={`p-4 cursor-pointer transition-all hover:border-surface-300
                            ${past ? 'opacity-60' : ''}`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                   ${attending ? 'bg-brand-50' : 'bg-surface-100'}`}>
                    <Icon size={18} className={attending ? 'text-brand-600' : 'text-surface-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {team && <Badge variant="gray">{team.name}</Badge>}
                      {attending && !past && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 size={11} /> Inscrit
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-surface-900 text-sm leading-snug">
                      {event.title}
                    </h3>
                    <div className="mt-2 space-y-0.5 text-xs text-surface-500">
                      {start && (
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          {format(start, "EEE d MMM 'à' HH'h'mm", { locale: fr })}
                        </div>
                      )}
                      <div className="flex items-center gap-1 truncate">
                        <MapPin size={11} />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    {(event.attendees ?? []).length > 0 && (
                      <div className="flex items-center gap-1 mt-2.5">
                        <div className="flex -space-x-1">
                          {(event.attendees ?? []).slice(0, 4).map(uid => {
                            const u = getUserById(uid)
                            return u ? <Avatar key={uid} user={u} size="xs" className="ring-2 ring-white" /> : null
                          })}
                        </div>
                        <span className="text-xs text-surface-400 ml-1">
                          {event.attendees.length}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── CTA créer en bas ─────────────────────────────────────────────────── */}
      {canCreate && (
        <div className="mt-10 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-surface-200
                             hover:bg-surface-50 text-surface-700 rounded-2xl text-sm font-medium
                             transition-colors shadow-sm">
            <Plus size={16} /> Créer un nouvel événement
          </button>
        </div>
      )}

      {/* ── Panel détail ─────────────────────────────────────────────────────── */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/25 backdrop-blur-[1px]"
            onClick={() => setSelectedEvent(null)}
          />
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

              {detailEvent.description && (
                <p className="text-sm text-surface-700 leading-relaxed">
                  {detailEvent.description}
                </p>
              )}

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
                          <span className="text-xs ml-1">
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

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    Participants
                  </p>
                  <span className="text-xs text-surface-500">
                    {detailAttend.length}
                    {detailEvent.maxAttendees ? (
                      <>
                        {' / '}{detailEvent.maxAttendees}{' '}
                        <span className={detailAttend.length >= detailEvent.maxAttendees
                          ? 'text-red-500' : 'text-emerald-600'}>
                          {detailAttend.length >= detailEvent.maxAttendees ? '(complet)' : 'places'}
                        </span>
                      </>
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
