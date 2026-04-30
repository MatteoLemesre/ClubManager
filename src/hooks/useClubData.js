import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import * as db from '../services/db'
import { TRAININGS, CONVERSATIONS } from '../data/mock'

// ── Normalizers ────────────────────────────────────────────────────────────

function normalizeUser(u) {
  if (!u) return null
  const roles   = u.user_roles ?? []
  const role    = roles[0]?.role_type ?? null
  const teamIds = roles.filter(r => r.scope_type === 'team').map(r => r.scope_id)
  return {
    ...u,
    role,
    team_ids:  teamIds,
    teamIds,
    firstName: u.persons?.first_name ?? u.firstName,
    lastName:  u.persons?.last_name  ?? u.lastName,
    birthDate: u.persons?.birth_date ?? u.birthDate,
    birthPlace: u.persons?.birth_place ?? u.birthPlace,
    phone:     u.persons?.phone ?? u.phone,
  }
}

function normalizeMatch(m) {
  if (!m) return null
  return {
    ...m,
    teamId:       m.team_id       ?? m.teamId,
    scheduledAt:  m.scheduled_at  ? new Date(m.scheduled_at) : (m.scheduledAt ?? null),
    isHome:       m.is_home       ?? m.isHome ?? false,
    opponentName: m.opponent_name ?? m.opponentName ?? '',
    scoreHome:    m.score_home    ?? m.scoreHome,
    scoreAway:    m.score_away    ?? m.scoreAway,
    competition:  m.competition   ?? '',
    squad:        m.squad   ?? {},
    events:       m.events  ?? [],
    carpool:      m.carpool ?? [],
  }
}

function normalizeEvent(e) {
  if (!e) return null
  return {
    ...e,
    teamId:       e.team_id       ?? e.teamId,
    startsAt:     e.starts_at     ? new Date(e.starts_at)  : (e.startsAt ?? null),
    endsAt:       e.ends_at       ? new Date(e.ends_at)    : (e.endsAt   ?? null),
    createdBy:    e.created_by    ?? e.createdBy,
    targetRoles:  e.target_roles  ?? e.targetRoles  ?? [],
    maxAttendees: e.max_attendees ?? e.maxAttendees ?? null,
    attendees:    e.event_responses
      ? e.event_responses.filter(r => r.attending).map(r => r.user_id)
      : (e.attendees ?? []),
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useClubData() {
  const { currentUser } = useAuth()
  const clubId = currentUser?.persons?.club_id

  const [teams,   setTeams]   = useState([])
  const [users,   setUsers]   = useState([])
  const [matches, setMatches] = useState([])
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!clubId) { setLoading(false); return }
    try {
      const [rawTeams, rawUsers, rawMatches, rawEvents] = await Promise.all([
        db.getTeamsByClub(clubId),
        db.getUsersByClub(clubId),
        db.getMatchesByClub(clubId),
        db.getEventsByClub(clubId),
      ])
      setTeams(rawTeams  ?? [])
      setUsers((rawUsers ?? []).map(normalizeUser))
      setMatches((rawMatches ?? []).map(normalizeMatch))
      setEvents((rawEvents  ?? []).map(normalizeEvent))
    } catch (err) {
      console.error('useClubData error', err)
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => { load() }, [load])

  function getUserById(id)  { return users.find(u => u.id === id) ?? null }
  function getTeamById(id)  { return teams.find(t => t.id === id) ?? null }
  function getFullName(u) {
    if (!u) return 'Inconnu'
    const fn = u.firstName ?? u.persons?.first_name ?? ''
    const ln = u.lastName  ?? u.persons?.last_name  ?? ''
    return `${fn} ${ln}`.trim() || 'Inconnu'
  }

  return {
    teams,
    users,
    matches,
    events,
    trainings:     TRAININGS,
    conversations: CONVERSATIONS,
    loading,
    clubId,
    getUserById,
    getTeamById,
    getFullName,
  }
}
