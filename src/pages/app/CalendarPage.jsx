import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  parseISO, format, addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { getUpcomingMatchesForUser, TEAMS, USERS } from '../../data/mock'
import { Card, Badge } from '../../components/ui'
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Car } from 'lucide-react'

// ─── Helpers visibilité ─────────────────────────────────────────────────────

function canSeeEvent(ev, user) {
  const userClub    = user.current_club_id
  const userTeams   = user.teamIds ?? user.teams ?? []
  const followed    = user.followed_clubs ?? []

  // Président voit tout son club
  if (user.role === 'president' && userClub === ev.club_id) return true

  switch (ev.visibility) {
    case 'public':
      return followed.includes(ev.club_id) || userClub === ev.club_id
    case 'coachs':
      return user.role === 'coach' && userClub === ev.club_id
    case 'team':
      return userTeams.includes(ev.teamId)
    case 'invite':
      return (ev.invited_users ?? []).includes(user.id)
    // Héritage anciens events
    case 'club':
      return userClub === ev.club_id && user.role !== 'supporter'
    default:
      return false
  }
}

function getRoleLabel(role) {
  const labels = { president: 'Président', coach: 'Coach', player: 'Joueur', supporter: 'Supporter', parent: 'Parent' }
  return labels[role] ?? role
}

// ─── Couleurs pastilles ─────────────────────────────────────────────────────
function getItemColor(item) {
  if (item._kind === 'match')    return 'bg-brand-500'
  if (item._kind === 'training') return 'bg-emerald-400'
  if (item.type === 'meeting')   return 'bg-amber-400'
  if (item.type === 'social' || item.type === 'tournament') return 'bg-violet-400'
  return 'bg-violet-400'
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { currentUser, is, isOneOf } = useAuth()
  const navigate = useNavigate()
  const { events, trainings, matches, getTeamById, loading } = useClubData()

  const isPresident  = is('president')
  const isSupporter  = is('supporter')
  const isParent     = is('parent')
  const isPrivileged = isOneOf('president', 'coach')

  const [selectedDate,     setSelectedDate]     = useState(new Date())
  const [selectedEvent,    setSelectedEvent]     = useState(null)
  const [showCreateEvent,  setShowCreateEvent]  = useState(false)
  const [localEvents,      setLocalEvents]      = useState([])

  // Matchs filtrés selon suivi
  const followedMatches = useMemo(
    () => getUpcomingMatchesForUser(currentUser),
    [currentUser]
  )

  const userTeams = currentUser.teamIds ?? currentUser.teams ?? []

  // Fusion de tous les items (filtrage par rôle selon spec EVENEMENTS_VISIBILITE_FINALE)
  const allItems = useMemo(() => {
    const items = []

    // ── Matchs du club (useClubData) ──────────────────────────────────────────
    // Président = tous · Coach/Joueur = tous les matchs du club · Supporter = aucun (pas de club)
    matches.forEach(m => {
      const d = m.scheduledAt instanceof Date ? m.scheduledAt : new Date(m.scheduledAt)
      const isMember = isPresident || isOneOf('coach', 'player')
      if (isMember) items.push({ ...m, _kind: 'match', _date: d })
    })

    // ── Matchs suivis multi-clubs (mock) ──────────────────────────────────────
    followedMatches.forEach(m => {
      if (items.some(i => i.id === m.id)) return
      items.push({ ...m, _kind: 'match', _date: m.scheduledAt })
    })

    // ── Entraînements ─────────────────────────────────────────────────────────
    // Président = tous · Coach/Joueur = son équipe uniquement · Supporter = aucun
    if (!isSupporter && !isParent) {
      trainings.forEach(t => {
        const d = t.date ? parseISO(t.date) : null
        if (!d) return
        const canSee = isPresident || userTeams.includes(t.teamId)
        const teamName = getTeamById(t.teamId)?.name ?? ''
        if (canSee) items.push({ ...t, _kind: 'training', _date: d, teamName })
      })
    }

    // ── Événements (canSeeEvent par rôle) ─────────────────────────────────────
    ;[...events, ...localEvents].forEach(ev => {
      if (!canSeeEvent(ev, currentUser)) return
      const d = ev.startsAt instanceof Date ? ev.startsAt
              : ev.startsAt                 ? new Date(ev.startsAt)
              : ev.starts_at               ? new Date(ev.starts_at)
              : null
      if (d) items.push({ ...ev, _kind: 'event', _date: d })
    })

    return items
  }, [matches, followedMatches, trainings, events, localEvents, currentUser, isPresident, isSupporter, isParent, userTeams, getTeamById])

  // 10 prochains items
  const now = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const upcomingItems = useMemo(() =>
    allItems
      .filter(i => i._date >= now)
      .sort((a, b) => a._date - b._date)
      .slice(0, 10)
  , [allItems, now])

  function handleItemClick(item) {
    if (item._kind === 'match') {
      navigate(`/app/matches/${item.id}`)
    } else {
      setSelectedEvent(item)
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
    <div className="flex flex-col" style={{ height: 'calc(100vh - 112px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Calendrier</h1>
          <div className="flex items-center gap-3 mt-1">
            {[
              { dot: 'bg-brand-500',   label: 'Match'        },
              { dot: 'bg-emerald-400', label: 'Entraînement' },
              { dot: 'bg-violet-400',  label: 'Événement'    },
              { dot: 'bg-amber-400',   label: 'Réunion'      },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-1 text-xs text-surface-400">
                <span className={`w-2 h-2 rounded-full ${f.dot}`} />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {isOneOf('president', 'coach') && (
          <button
            onClick={() => setShowCreateEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                       text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Créer un événement
          </button>
        )}
      </div>

      {/* Layout 70/30 */}
      <div className="flex flex-1 overflow-hidden">

        {/* Colonne gauche 70% - Calendrier mensuel */}
        <div className="flex-[7] p-6 overflow-auto">
          <CalendarMonthView
            items={allItems}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onClickItem={handleItemClick}
          />
        </div>

        {/* Colonne droite 30% - Prochains événements */}
        <div className="flex-[3] border-l border-surface-200 p-5 overflow-auto">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📌</span> Prochains
          </h3>

          {upcomingItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm">Aucun événement à venir</div>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingItems.map((item, idx) => (
                <UpcomingItemCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal création événement */}
      {showCreateEvent && (
        <CreateEventModal
          currentUser={currentUser}
          onClose={() => setShowCreateEvent(false)}
          onCreated={ev => {
            setLocalEvents(prev => [...prev, ev])
            setShowCreateEvent(false)
          }}
        />
      )}

      {/* Pop-up détail événement/entraînement */}
      {selectedEvent && (
        <EventDetailPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

// ─── CalendarMonthView ──────────────────────────────────────────────────────

function CalendarMonthView({ items, selectedDate, onSelectDate, onClickItem }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const itemsByDay = useMemo(() => {
    const grouped = {}
    items.forEach(item => {
      if (!item._date) return
      const key = format(item._date, 'yyyy-MM-dd')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })
    return grouped
  }, [items])

  return (
    <div>
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={18} className="text-surface-600" />
        </button>
        <h2 className="font-display font-semibold text-lg text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
        >
          <ChevronRight size={18} className="text-surface-600" />
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-surface-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const key        = format(day, 'yyyy-MM-dd')
          const dayItems   = itemsByDay[key] ?? []
          const inMonth    = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isTodayDay = isToday(day)

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[88px] p-2 border rounded-xl cursor-pointer transition-all
                ${isTodayDay  ? 'border-brand-400 bg-brand-50' : 'border-surface-200'}
                ${isSelected  ? 'ring-2 ring-brand-600 ring-offset-1' : ''}
                ${!inMonth    ? 'opacity-30' : 'hover:bg-surface-50'}
              `}
            >
              <div className={`text-xs font-semibold mb-1.5 ${isTodayDay ? 'text-brand-700' : 'text-surface-700'}`}>
                {format(day, 'd')}
              </div>

              <div className="flex flex-wrap gap-1">
                {dayItems.slice(0, 4).map((item, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); onClickItem(item) }}
                    title={item._kind === 'match' ? `vs ${item.opponentName}` : item._kind === 'training' ? `Entraînement ${item.teamName ?? ''}`.trim() : (item.title ?? 'Événement')}
                    className={`w-2 h-2 rounded-full flex-shrink-0 hover:scale-125 transition-transform ${getItemColor(item)}`}
                  />
                ))}
                {dayItems.length > 4 && (
                  <span className="text-[9px] text-surface-400 leading-none self-end">
                    +{dayItems.length - 4}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── UpcomingItemCard ───────────────────────────────────────────────────────

function UpcomingItemCard({ item, onClick }) {
  const navigate = useNavigate()
  const dateStr = format(item._date, "EEE d MMM · HH'h'mm", { locale: fr })

  if (item._kind === 'match') {
    const hasCarpools = (item.carpoolCount ?? item.carpool?.length ?? 0) > 0
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 bg-white rounded-xl border border-surface-200
                   hover:border-brand-300 cursor-pointer transition-all"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
          <span className="text-[10px] text-gray-400">{dateStr}</span>
          {hasCarpools && (
            <span className="ml-auto text-[10px] text-emerald-600 flex items-center gap-0.5">
              <Car size={9} /> {item.carpoolCount ?? item.carpool?.length}
            </span>
          )}
        </div>
        <div className="text-xs font-semibold text-gray-900">
          ⚽ {item.teamName ?? item.teams?.name} vs {item.opponentName ?? item.opponent}
        </div>
        {item.location && (
          <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={9} /> {item.location}
          </div>
        )}
        <div className="text-[10px] text-brand-600 font-medium mt-1">Voir la fiche →</div>
      </button>
    )
  }

  if (item._kind === 'training') {
    return (
      <div className="p-3 bg-white rounded-xl border border-surface-200">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[10px] text-gray-400">{dateStr}</span>
        </div>
        <div className="text-xs font-semibold text-gray-900">
          🏃 Entraînement{' '}
          {item.teamId ? (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/app/teams/${item.teamId}`) }}
              className="hover:text-brand-600 transition-colors"
            >
              {item.teamName}
            </button>
          ) : item.teamName}
        </div>
        {item.location && (
          <div className="text-[10px] text-gray-500 mt-0.5">{item.location}</div>
        )}
      </div>
    )
  }

  // event
  const dot = item.type === 'meeting' ? 'bg-amber-400' : 'bg-violet-400'
  const icon = item.type === 'meeting' ? '📋' : item.type === 'social' ? '🎉' : item.type === 'tournament' ? '🏆' : '📌'
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white rounded-xl border border-surface-200
                 hover:border-violet-300 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
        <span className="text-[10px] text-gray-400">{dateStr}</span>
      </div>
      <div className="text-xs font-semibold text-gray-900 truncate">
        {icon} {item.title}
      </div>
      {item.location && (
        <div className="text-[10px] text-gray-500 mt-0.5 truncate">{item.location}</div>
      )}
    </button>
  )
}

// ─── CreateEventModal ───────────────────────────────────────────────────────

const VISIBILITY_OPTIONS = {
  president: [
    { value: 'public',  label: '🌍 Public',               desc: 'Visible par tous les followers du club' },
    { value: 'coachs',  label: '👔 Coachs uniquement',    desc: 'Président + tous les coachs du club' },
    { value: 'team',    label: '⚽ Équipe',                desc: 'Coach + joueurs de l\'équipe choisie' },
    { value: 'invite',  label: '✉️ Invitation nominative', desc: 'Uniquement les personnes invitées' },
  ],
  coach: [
    { value: 'public',  label: '🌍 Public',               desc: 'Visible par tous les followers du club' },
    { value: 'team',    label: '⚽ Mon équipe',            desc: 'Moi + les joueurs de mon équipe' },
    { value: 'invite',  label: '✉️ Invitation nominative', desc: 'Uniquement les personnes invitées' },
  ],
}

function CreateEventModal({ currentUser, onClose, onCreated }) {
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [location,     setLocation]     = useState('')
  const [startsAt,     setStartsAt]     = useState('')
  const [endsAt,       setEndsAt]       = useState('')
  const [link,         setLink]         = useState('')
  const [visibility,   setVisibility]   = useState('public')
  const [teamId,       setTeamId]       = useState('')
  const [invitedUsers, setInvitedUsers] = useState([])
  const [error,        setError]        = useState('')

  const isPresident = currentUser.role === 'president'
  const isCoach     = currentUser.role === 'coach'

  const visOptions    = VISIBILITY_OPTIONS[currentUser.role] ?? VISIBILITY_OPTIONS.coach
  const availableTeams = isPresident
    ? TEAMS
    : TEAMS.filter(t => (currentUser.teamIds ?? currentUser.teams ?? []).includes(t.id))

  // Membres du club disponibles pour l'invitation
  const clubMembers = USERS.filter(u =>
    u.role !== 'supporter' && u.role !== 'parent' && u.id !== currentUser.id
  )

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function handleVisibilityChange(val) {
    setVisibility(val)
    if (val !== 'team')   setTeamId('')
    if (val !== 'invite') setInvitedUsers([])
  }

  function toggleInvite(userId) {
    setInvitedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  function handleSubmit() {
    if (!title.trim())                         { setError('Titre requis'); return }
    if (!startsAt)                             { setError('Date de début requise'); return }
    if (visibility === 'team' && !teamId)      { setError('Équipe requise'); return }
    if (visibility === 'invite' && invitedUsers.length === 0) { setError('Invitez au moins une personne'); return }

    const newEvent = {
      id:            `local-${Date.now()}`,
      category:      'club',
      type:          'social',
      visibility,
      teamId:        visibility === 'team'   ? teamId       : null,
      invited_users: visibility === 'invite' ? [currentUser.id, ...invitedUsers] : null,
      club_id:       currentUser.current_club_id,
      title:         title.trim(),
      description:   description.trim() || null,
      location:      location.trim() || null,
      startsAt:      new Date(startsAt),
      endsAt:        endsAt ? new Date(endsAt) : null,
      link:          link.trim() || null,
      createdBy:     currentUser.id,
      attendees:     [],
    }
    onCreated(newEvent)
  }

  const inputCls = "w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-display font-bold text-lg">Nouvel événement</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-xl text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Titre *
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Repas de fin de saison…" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Détails de l'événement…" className={inputCls + " resize-none"} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Lieu
            </label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Adresse ou nom du lieu" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                Début *
              </label>
              <input type="datetime-local" value={startsAt}
                onChange={e => setStartsAt(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                Fin
              </label>
              <input type="datetime-local" value={endsAt}
                onChange={e => setEndsAt(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              Lien externe
            </label>
            <input value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://…" className={inputCls} />
          </div>

          {/* ── Visibilité ──────────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
              Visibilité *
            </label>
            <div className="space-y-2">
              {visOptions.map(v => (
                <label key={v.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    visibility === v.value
                      ? 'bg-brand-50 border-brand-300'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input type="radio" name="vis" value={v.value}
                    checked={visibility === v.value}
                    onChange={() => handleVisibilityChange(v.value)}
                    className="accent-brand-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{v.label}</div>
                    <div className="text-xs text-gray-400">{v.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Si équipe */}
            {visibility === 'team' && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
                  Quelle équipe ? *
                </label>
                {availableTeams.length > 0 ? (
                  <select value={teamId} onChange={e => setTeamId(e.target.value)} className={inputCls}>
                    <option value="">Choisir une équipe…</option>
                    {availableTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-surface-50 rounded-xl text-xs text-gray-500">
                    Aucune équipe disponible.
                  </div>
                )}
              </div>
            )}

            {/* Si invitation nominative */}
            {visibility === 'invite' && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    Inviter des membres *
                  </label>
                  <span className="text-xs text-brand-600 font-medium">
                    {invitedUsers.length} sélectionné{invitedUsers.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="border border-surface-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {clubMembers.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">Aucun membre trouvé</div>
                  ) : (
                    clubMembers.map(user => (
                      <label
                        key={user.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-surface-100 last:border-0 ${
                          invitedUsers.includes(user.id) ? 'bg-brand-50' : 'hover:bg-surface-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={invitedUsers.includes(user.id)}
                          onChange={() => toggleInvite(user.id)}
                          className="rounded accent-brand-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName ?? user.first_name} {user.lastName ?? user.last_name}
                          </div>
                          <div className="text-xs text-gray-400">{getRoleLabel(user.role)}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-surface-600
                       hover:bg-surface-100 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-600
                       hover:bg-brand-700 text-white transition-colors">
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── EventDetailPopup ───────────────────────────────────────────────────────

function EventDetailPopup({ event, onClose }) {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [participating, setParticipating] = useState(null)

  const isTraining = event._kind === 'training'
  const isFuture   = event._date > new Date()

  const icon = isTraining ? '🏃'
    : event.type === 'meeting'    ? '📋'
    : event.type === 'social'     ? '🎉'
    : event.type === 'tournament' ? '🏆'
    : event.type === 'carpool'    ? '🚗'
    : '📌'

  const dateStr = event._date
    ? format(event._date, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })
    : '—'

  const endStr = event.endsAt
    ? format(event.endsAt instanceof Date ? event.endsAt : new Date(event.endsAt), "HH'h'mm")
    : event.ends_at
    ? format(new Date(event.ends_at), "HH'h'mm")
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>{icon}</span>
            {isTraining ? (
              <span>
                Entraînement{' '}
                {event.teamId ? (
                  <button
                    onClick={() => { onClose(); navigate(`/app/teams/${event.teamId}`) }}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {event.teamName}
                  </button>
                ) : event.teamName}
              </span>
            ) : (
              <span>{event.title ?? 'Événement'}</span>
            )}
          </h2>
          <button onClick={onClose}
            className="p-1.5 hover:bg-surface-100 rounded-xl text-gray-400 ml-4">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Visibilité badge */}
          {!isTraining && event.visibility && (
            <div className="flex">
              {{
                public:  <span className="text-xs px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full font-medium">🌍 Public</span>,
                coachs:  <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">👔 Coachs</span>,
                team:    <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">⚽ Équipe</span>,
                invite:  <span className="text-xs px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full font-medium">✉️ Invitation</span>,
                club:    <span className="text-xs px-2.5 py-1 bg-surface-200 text-surface-600 rounded-full font-medium">🏛 Club</span>,
              }[event.visibility] ?? null}
            </div>
          )}

          {/* Date */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="mt-0.5">📅</span>
            <span>
              {dateStr}
              {endStr && <span className="text-gray-400"> — {endStr}</span>}
            </span>
          </div>

          {/* Lieu */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}

          {/* Thème (entraînement) */}
          {isTraining && event.theme && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🎯</span>
              <span>{event.theme}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">📝 Description</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Lien */}
          {(event.link ?? event.link) && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">🔗 Lien</p>
              <a href={event.link} target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline break-all">
                {event.link}
              </a>
            </div>
          )}

          {/* Participation (événement futur, pas entraînement) */}
          {!isTraining && isFuture && (
            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">✋ Votre participation</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setParticipating(true)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    participating === true
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  ✓ Je participe
                </button>
                <button
                  onClick={() => setParticipating(false)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    participating === false
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  ✗ Je ne participe pas
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-surface-600
                       hover:bg-surface-100 border border-surface-200 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
