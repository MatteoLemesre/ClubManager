import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  parseISO, format, addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Card, Badge, Avatar } from '../../components/ui'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

// ─── Couleurs par type ──────────────────────────────────────────────────────
const TYPE_COLOR = {
  training: { dot: 'bg-emerald-400', badge: 'green',  label: 'Entraînement' },
  match:    { dot: 'bg-brand-500',   badge: 'brand',  label: 'Match' },
  event:    { dot: 'bg-violet-400',  badge: 'purple', label: 'Événement' },
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { currentUser } = useAuth()
  const { events, trainings, matches, teams, users, loading, getTeamById, getFullName } = useClubData()

  const isPresident  = currentUser.role === 'president'
  const isSupporter  = currentUser.role === 'supporter'
  const isParent     = currentUser.role === 'parent'
  const isPrivileged = isPresident || currentUser.role === 'coach'

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay,  setSelectedDay]  = useState(new Date())
  const [showTrainings, setShowTrainings] = useState(true)
  const [showMatches,   setShowMatches]   = useState(true)
  const [showEvents,    setShowEvents]    = useState(true)
  const [teamFilter,       setTeamFilter]       = useState('')
  const [manageAttendanceId, setManageAttendanceId] = useState(null)

  // ── Grille calendrier ────────────────────────────────────────────────────
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // ── Items visibles selon rôle ────────────────────────────────────────────
  const allItems = useMemo(() => {
    const items = []

    // Entraînements — pas pour supporter / parent
    if (showTrainings && !isSupporter && !isParent) {
      trainings
        .filter(t => isPresident || currentUser.teamIds?.includes(t.teamId))
        .forEach(t => items.push({ ...t, _type: 'training', _dateObj: parseISO(t.date) }))
    }

    // Matchs — tout le monde, filtrés par équipe sauf président/supporter/parent
    if (showMatches) {
      matches
        .filter(m => isPresident || isSupporter || isParent || currentUser.teamIds?.includes(m.teamId))
        .forEach(m => items.push({ ...m, _type: 'match', _dateObj: m.scheduledAt }))
    }

    // Événements — category club = visible par tous (filtre visibility), team = selon équipe
    if (showEvents) {
      events
        .filter(ev => {
          if (ev.category === 'club') {
            if (ev.visibility === 'club') return true
            if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
            return false
          }
          if (ev.category === 'team') {
            return isPrivileged || currentUser.teamIds?.includes(ev.teamId)
          }
          return false
        })
        .forEach(e => items.push({ ...e, _type: 'event', _dateObj: e.startsAt }))
    }

    if (teamFilter) return items.filter(i => !i.teamId || i.teamId === teamFilter)
    return items
  }, [showTrainings, showMatches, showEvents, teamFilter, currentUser, isPresident, isSupporter, isParent, isPrivileged, events, trainings, matches])

  function itemsForDay(day) {
    const str = format(day, 'yyyy-MM-dd')
    return allItems.filter(i => i._dateObj && format(i._dateObj, 'yyyy-MM-dd') === str)
  }

  const selectedDayItems = itemsForDay(selectedDay)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Calendrier</h1>
          <p className="text-surface-500 text-sm mt-0.5">Entraînements, matchs et événements</p>
        </div>

        {/* Filtres toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'training', label: 'Entraînements', setter: setShowTrainings, state: showTrainings, dot: 'bg-emerald-400' },
            { key: 'match',    label: 'Matchs',         setter: setShowMatches,   state: showMatches,   dot: 'bg-brand-500' },
            { key: 'event',    label: 'Événements',     setter: setShowEvents,    state: showEvents,    dot: 'bg-violet-400' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => f.setter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                          border transition-colors ${
                f.state
                  ? 'bg-white border-surface-200 text-surface-800'
                  : 'bg-surface-50 border-surface-200 text-surface-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${f.state ? f.dot : 'bg-surface-300'}`} />
              {f.label}
            </button>
          ))}

          {/* Filtre équipe */}
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-surface-200 rounded-xl text-xs
                       text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">Toutes les équipes</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ── Grille calendrier (col-span-2) ── */}
        <div className="col-span-2">
          <Card className="overflow-hidden">

            {/* Navigation mois */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ChevronLeft size={18} className="text-surface-600" />
              </button>
              <h2 className="font-display font-semibold text-surface-900 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ChevronRight size={18} className="text-surface-600" />
              </button>
            </div>

            {/* Jours semaine */}
            <div className="grid grid-cols-7 border-b border-surface-100">
              {WEEK_DAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-surface-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Cases jours */}
            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const dayItems      = itemsForDay(day)
                const inMonth       = isSameMonth(day, currentMonth)
                const isSelected    = isSameDay(day, selectedDay)
                const isTodayDay    = isToday(day)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[80px] p-2 border-b border-r border-surface-100 text-left
                                transition-colors ${isSelected ? 'bg-brand-50' : 'hover:bg-surface-50'}
                                ${!inMonth ? 'opacity-40' : ''}`}
                  >
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full
                                      text-xs font-medium mb-1 ${
                      isTodayDay
                        ? 'bg-brand-600 text-white'
                        : isSelected
                        ? 'text-brand-700 font-bold'
                        : 'text-surface-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {dayItems.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                                           ${TYPE_COLOR[item._type]?.dot}`} />
                          <span className="text-xs text-surface-600 truncate leading-tight">
                            {item._type === 'training' && 'Entraînement'}
                            {item._type === 'match'    && `vs ${item.opponentName}`}
                            {item._type === 'event'    && item.title}
                          </span>
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-xs text-surface-400">+{dayItems.length - 2}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── Panel jour sélectionné ── */}
        <div>
          <h3 className="font-display font-semibold text-surface-800 text-base mb-3 capitalize">
            {format(selectedDay, "EEEE d MMMM", { locale: fr })}
          </h3>

          {selectedDayItems.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar size={28} className="text-surface-300 mx-auto mb-2" />
              <p className="text-sm text-surface-500">Aucun événement ce jour</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDayItems.map((item, idx) => {
                const tc   = TYPE_COLOR[item._type]
                const team = item.teamId ? getTeamById(item.teamId) : null
                const time = item._dateObj ? format(item._dateObj, "HH'h'mm") : '—'

                // ── Entraînement ──
                if (item._type === 'training') {
                  const trainingPlayers = users.filter(u => u.role === 'player' && u.teamIds?.includes(item.teamId))
                  const presentCount    = item.attendances?.filter(a => a.status === 'present').length ?? 0
                  const absentCount     = item.attendances?.filter(a => a.status === 'absent').length ?? 0
                  const noResponseCount = trainingPlayers.filter(p => !item.attendances?.find(a => a.userId === p.id)).length
                  const isManaging      = manageAttendanceId === item.id

                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
                        <Badge variant={tc.badge}>{tc.label}</Badge>
                        {team && <Badge variant="gray">{team.name}</Badge>}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Clock size={11} /> {time} · {item.duration} min
                        </p>
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <MapPin size={11} /> {item.location}
                        </p>
                      </div>
                      {isPrivileged ? (
                        <div className="mt-3 pt-3 border-t border-surface-100">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-surface-500">
                              {presentCount} présents · {absentCount} absents · {noResponseCount} sans réponse
                            </p>
                            <button
                              onClick={() => setManageAttendanceId(isManaging ? null : item.id)}
                              className="text-xs text-brand-600 hover:underline flex-shrink-0"
                            >
                              {isManaging ? 'Fermer' : 'Gérer'}
                            </button>
                          </div>
                          {isManaging && (
                            <div className="mt-2 space-y-1.5">
                              {trainingPlayers.map(player => {
                                const att = item.attendances?.find(a => a.userId === player.id)
                                return (
                                  <div key={player.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Avatar user={player} size="sm" />
                                      <span className="text-xs text-surface-800">{getFullName(player)}</span>
                                    </div>
                                    {att?.status === 'present' ? (
                                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                                        <CheckCircle2 size={12} /> Présent
                                      </span>
                                    ) : att?.status === 'absent' ? (
                                      <span className="flex items-center gap-1 text-xs text-red-500">
                                        <XCircle size={12} /> Absent
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-xs text-surface-400">
                                        <AlertCircle size={12} /> Sans réponse
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 py-1.5 text-xs font-medium bg-emerald-50
                                             text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                            Présent
                          </button>
                          <button className="flex-1 py-1.5 text-xs font-medium bg-red-50
                                             text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            Absent
                          </button>
                        </div>
                      )}
                    </Card>
                  )
                }

                // ── Match ──
                if (item._type === 'match') {
                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.isHome ? 'bg-brand-500' : 'bg-orange-400'
                        }`} />
                        <Badge variant={item.isHome ? 'brand' : 'orange'}>
                          {item.isHome ? 'Domicile' : 'Déplacement'}
                        </Badge>
                        {team && <Badge variant="gray">{team.name}</Badge>}
                      </div>
                      <p className="font-semibold text-surface-900 text-sm">
                        vs {item.opponentName}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{item.competition}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Clock size={11} /> {time}
                        </p>
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <MapPin size={11} /> {item.location}
                        </p>
                        {team && (
                          <p className="text-xs text-surface-500">🏷 {team.category}</p>
                        )}
                        <p className="text-xs text-surface-500">
                          🟨 {item.referee ?? 'Arbitre non renseigné'}
                        </p>
                      </div>
                      {item.status === 'played' && (
                        <p className="text-sm font-bold text-surface-900 text-center mt-2 pt-2
                                      border-t border-surface-100">
                          {item.scoreHome} – {item.scoreAway}
                        </p>
                      )}
                      <Link
                        to={`/app/matches/${item.id}`}
                        className="block mt-3 text-xs font-medium text-brand-600
                                   hover:text-brand-700 transition-colors"
                      >
                        Voir la fiche →
                      </Link>
                    </Card>
                  )
                }

                // ── Événement ──
                return (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
                      <Badge variant={tc.badge}>{tc.label}</Badge>
                    </div>
                    <p className="font-semibold text-surface-900 text-sm">{item.title}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <Clock size={11} /> {time}
                      </p>
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <MapPin size={11} /> {item.location}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
