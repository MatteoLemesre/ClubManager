import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  parseISO, format, addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { getUpcomingMatchesForUser } from '../../data/mock'
import { Card, Badge } from '../../components/ui'
import {
  ChevronLeft, ChevronRight, Calendar,
  Clock, MapPin, Home, Bus, Car,
} from 'lucide-react'

// ─── Couleurs par type ──────────────────────────────────────────────────────
const TYPE_COLOR = {
  match:    { dot: 'bg-brand-500',   label: 'Match',        badgeVariant: 'brand'  },
  training: { dot: 'bg-emerald-400', label: 'Entraînement', badgeVariant: 'green'  },
  social:   { dot: 'bg-violet-400',  label: 'Événement',    badgeVariant: 'purple' },
  meeting:  { dot: 'bg-amber-400',   label: 'Réunion',      badgeVariant: 'orange' },
  carpool:  { dot: 'bg-sky-400',     label: 'Covoiturage',  badgeVariant: 'blue'   },
  tournament:{ dot: 'bg-pink-400',   label: 'Tournoi',      badgeVariant: 'red'    },
}

function dotFor(item) {
  if (item._kind === 'match')    return TYPE_COLOR.match.dot
  if (item._kind === 'training') return TYPE_COLOR.training.dot
  return TYPE_COLOR[item.type]?.dot ?? TYPE_COLOR.social.dot
}

function labelFor(item) {
  if (item._kind === 'match')    return `vs ${item.opponentName ?? item.opponentName}`
  if (item._kind === 'training') return 'Entraînement'
  return item.title ?? 'Événement'
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { events, trainings, matches, teams, getTeamById, loading } = useClubData()

  const isPresident  = currentUser.role === 'president'
  const isSupporter  = currentUser.role === 'supporter'
  const isParent     = currentUser.role === 'parent'
  const isPrivileged = isPresident || currentUser.role === 'coach'

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay,  setSelectedDay]  = useState(new Date())

  // Grille du mois
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Matchs à venir depuis la logique de suivi
  const followedMatches = useMemo(
    () => getUpcomingMatchesForUser(currentUser),
    [currentUser]
  )

  // Tous les items : matchs (club + suivis) + entraînements + événements
  const allItems = useMemo(() => {
    const items = []

    // Matchs club (via useClubData)
    matches
      .filter(m => isPresident || isSupporter || isParent || currentUser.teamIds?.includes(m.teamId))
      .forEach(m => {
        const date = m.scheduledAt instanceof Date ? m.scheduledAt : new Date(m.scheduledAt)
        items.push({ ...m, _kind: 'match', _dateObj: date, _source: 'club' })
      })

    // Matchs suivis (multi-clubs, depuis mock UPCOMING_MATCHES)
    followedMatches.forEach(m => {
      // éviter les doublons avec les matchs du club
      if (items.some(i => i.id === m.id)) return
      items.push({ ...m, _kind: 'match', _dateObj: m.scheduledAt, _source: 'followed' })
    })

    // Entraînements (pas pour supporter/parent)
    if (!isSupporter && !isParent) {
      trainings
        .filter(t => isPresident || currentUser.teamIds?.includes(t.teamId))
        .forEach(t => {
          const date = t.date ? parseISO(t.date) : null
          if (date) items.push({ ...t, _kind: 'training', _dateObj: date })
        })
    }

    // Événements
    events
      .filter(ev => {
        if (ev.category === 'club') {
          if (ev.visibility === 'public' || ev.visibility === 'club') return true
          if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
          return false
        }
        if (ev.category === 'team') {
          return isPrivileged || currentUser.teamIds?.includes(ev.teamId)
        }
        return false
      })
      .forEach(ev => {
        const date = ev.startsAt instanceof Date ? ev.startsAt : ev.startsAt ? new Date(ev.startsAt) : null
        if (date) items.push({ ...ev, _kind: 'event', _dateObj: date })
      })

    return items
  }, [matches, followedMatches, trainings, events, currentUser, isPresident, isSupporter, isParent, isPrivileged])

  function itemsForDay(day) {
    const str = format(day, 'yyyy-MM-dd')
    return allItems.filter(i => i._dateObj && format(i._dateObj, 'yyyy-MM-dd') === str)
  }

  // 10 prochains items (pour colonne droite)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = useMemo(() =>
    allItems
      .filter(i => i._dateObj >= today)
      .sort((a, b) => a._dateObj - b._dateObj)
      .slice(0, 10)
  , [allItems])

  const selectedDayItems = itemsForDay(selectedDay)

  function handleItemClick(item) {
    if (item._kind === 'match') {
      navigate(`/app/matches/${item.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Calendrier</h1>
        <p className="text-surface-500 text-sm mt-0.5">Matchs, entraînements et événements</p>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {[
          { dot: 'bg-brand-500',   label: 'Match'        },
          { dot: 'bg-emerald-400', label: 'Entraînement' },
          { dot: 'bg-violet-400',  label: 'Événement'    },
          { dot: 'bg-amber-400',   label: 'Réunion'      },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1.5 text-xs text-surface-500">
            <span className={`w-2 h-2 rounded-full ${f.dot}`} />
            {f.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ── Calendrier (70%) ── */}
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
                const dayItems   = itemsForDay(day)
                const inMonth    = isSameMonth(day, currentMonth)
                const isSelected = isSameDay(day, selectedDay)
                const isTodayDay = isToday(day)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[72px] p-2 border-b border-r border-surface-100 text-left
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
                      {dayItems.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotFor(item)}`} />
                          <span className="text-[10px] text-surface-600 truncate leading-tight">
                            {labelFor(item)}
                          </span>
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[10px] text-surface-400">+{dayItems.length - 3}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* ── Colonne droite (30%) ── */}
        <div className="flex flex-col gap-4">

          {/* Jour sélectionné */}
          <div>
            <h3 className="font-display font-semibold text-surface-800 text-base mb-2 capitalize">
              {format(selectedDay, "EEEE d MMMM", { locale: fr })}
            </h3>

            {selectedDayItems.length === 0 ? (
              <Card className="p-4 text-center">
                <Calendar size={24} className="text-surface-300 mx-auto mb-2" />
                <p className="text-xs text-surface-500">Aucun événement ce jour</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {selectedDayItems.map((item, idx) => (
                  <ItemCard
                    key={idx}
                    item={item}
                    getTeamById={getTeamById}
                    onClick={() => handleItemClick(item)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Prochains événements */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                À venir
              </p>
              <div className="space-y-2">
                {upcoming.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDay(item._dateObj)
                      setCurrentMonth(item._dateObj)
                      handleItemClick(item)
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 bg-white rounded-xl
                               border border-surface-200 hover:border-surface-300
                               text-left transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotFor(item)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {labelFor(item)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {format(item._dateObj, "EEE d MMM · HH'h'mm", { locale: fr })}
                      </div>
                    </div>
                    {item._kind === 'match' && (
                      <span className="text-[10px] text-brand-600 font-medium flex-shrink-0">→</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ItemCard ───────────────────────────────────────────────────────────────

function ItemCard({ item, getTeamById, onClick }) {
  const navigate = useNavigate()
  const isMatch    = item._kind === 'match'
  const isTraining = item._kind === 'training'
  const team = item.teamId ? getTeamById(item.teamId) : null
  const time = item._dateObj ? format(item._dateObj, "HH'h'mm") : '—'

  if (isMatch) {
    return (
      <Card
        className="p-3 cursor-pointer hover:border-brand-200 transition-all"
        onClick={onClick}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
          <Badge variant={item.isHome ? 'brand' : 'orange'}>
            {item.isHome ? 'Domicile' : 'Déplacement'}
          </Badge>
          {team && <Badge variant="gray">{team.name ?? item.teamName}</Badge>}
          {item._source === 'followed' && item.clubName && (
            <Badge variant="gray">{item.clubName}</Badge>
          )}
        </div>
        <p className="font-semibold text-sm text-surface-900">
          vs {item.opponentName}
        </p>
        <div className="mt-1.5 space-y-0.5 text-xs text-surface-500">
          <div className="flex items-center gap-1"><Clock size={10} /> {time}</div>
          {item.location && (
            <div className="flex items-center gap-1"><MapPin size={10} /> {item.location}</div>
          )}
          {(item.carpoolCount > 0 || (item.carpool?.length > 0)) && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <Car size={10} />
              {item.carpoolCount ?? item.carpool?.length} covoiturage{(item.carpoolCount ?? item.carpool?.length) > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="mt-2 text-[10px] text-brand-600 font-medium">Voir la fiche →</div>
      </Card>
    )
  }

  if (isTraining) {
    const tc = TYPE_COLOR.training
    return (
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
          <Badge variant={tc.badgeVariant}>{tc.label}</Badge>
          {team && <Badge variant="gray">{team.name}</Badge>}
        </div>
        <div className="text-xs text-surface-500 space-y-0.5">
          <div className="flex items-center gap-1"><Clock size={10} /> {time} · {item.duration} min</div>
          {item.location && <div className="flex items-center gap-1"><MapPin size={10} /> {item.location}</div>}
        </div>
      </Card>
    )
  }

  // Événement
  const tc = TYPE_COLOR[item.type] ?? TYPE_COLOR.social
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
        <Badge variant={tc.badgeVariant}>{tc.label}</Badge>
      </div>
      <p className="font-semibold text-sm text-surface-900">{item.title}</p>
      <div className="mt-1.5 text-xs text-surface-500 space-y-0.5">
        <div className="flex items-center gap-1"><Clock size={10} /> {time}</div>
        {item.location && <div className="flex items-center gap-1"><MapPin size={10} /> {item.location}</div>}
      </div>
    </Card>
  )
}
