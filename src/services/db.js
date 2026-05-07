import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

// ── SPORTS ────────────────────────────────────────────────
export const getSports = async () => {
  const { data, error } = await supabase
    .from('sports')
    .select('id, name')
    .order('name')
  if (error) {
    console.error('getSports error:', error)
    throw error
  }
  return data ?? []
}

// ── CLUBS ─────────────────────────────────────────────────
export const getClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .order('name')
  if (error) throw error
  return data
}

export const getClubById = async (id) => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createClub = async (club) => {
  const { data, error } = await supabase
    .from('clubs')
    .insert(club)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── PERSONS ───────────────────────────────────────────────
export const createPerson = async (person) => {
  const { data, error } = await supabase
    .from('persons')
    .insert(person)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getPersonsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('club_id', clubId)
  if (error) throw error
  return data
}

// ── USERS ─────────────────────────────────────────────────
export const createUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons(*), user_roles(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons(*), user_roles(*)')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (error && error.code !== 'PGRST116') throw error  // PGRST116 = not found
  return data ?? null
}

export const getUsersByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons!inner(*), user_roles(*)')
    .eq('persons.club_id', clubId)
  if (error) throw error
  return data
}

export const updateUser = async (id, changes) => {
  const { data, error } = await supabase
    .from('users')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── USER_ROLES ────────────────────────────────────────────
export const createUserRole = async (role) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert(role)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserRoles = async (userId) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

// ── TEAMS ─────────────────────────────────────────────────
export const getTeamsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('club_id', clubId)
    .order('name')
  if (error) throw error
  return data
}

export const createTeam = async (team) => {
  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single()
  if (error) throw error
  return data
}

export const addPlayerToTeam = async (teamId, userId, jerseyNumber, position) => {
  const { error } = await supabase
    .from('team_players')
    .insert({ team_id: teamId, user_id: userId, jersey_number: jerseyNumber, position })
  if (error) throw error
}

export const addCoachToTeam = async (teamId, userId) => {
  const { error } = await supabase
    .from('team_coaches')
    .insert({ team_id: teamId, user_id: userId })
  if (error) throw error
}

// ── REGISTRATION REQUESTS ─────────────────────────────────
export const createRequest = async (request) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getRequestsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getPendingRequestsForPresident = async (clubId) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .eq('role_type', 'coach')
  if (error) throw error
  return data
}

export const getPendingRequestsForCoach = async (teamIds) => {
  if (!teamIds?.length) return []
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .in('team_id', teamIds)
    .eq('status', 'pending')
    .eq('role_type', 'player')
  if (error) throw error
  return data
}

export const updateRequest = async (id, changes) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export const createNotification = async (notif) => {
  const { error } = await supabase
    .from('notifications')
    .insert(notif)
  if (error) throw error
}

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('read', false)
  if (error) throw error
  return count ?? 0
}

export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('to_user_id', userId)
  if (error) throw error
}

// ── MATCHES ───────────────────────────────────────────────
export const getMatchesByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*, teams!inner(club_id, name, category)')
    .eq('teams.club_id', clubId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const getMatchesByTeam = async (teamId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const createMatch = async (match) => {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateMatch = async (id, changes) => {
  const { data, error } = await supabase
    .from('matches')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── TRAININGS ─────────────────────────────────────────────
export const getTrainingsByTeam = async (teamId) => {
  const { data, error } = await supabase
    .from('trainings')
    .select('*, training_attendances(*)')
    .eq('team_id', teamId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const createTraining = async (training) => {
  const { data, error } = await supabase
    .from('trainings')
    .insert(training)
    .select()
    .single()
  if (error) throw error
  return data
}

export const upsertAttendance = async (trainingId, userId, status) => {
  const { error } = await supabase
    .from('training_attendances')
    .upsert({ training_id: trainingId, user_id: userId, status, declared_at: new Date().toISOString() })
  if (error) throw error
}

// ── EVENTS ────────────────────────────────────────────────
export const getEventsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_responses(*)')
    .eq('club_id', clubId)
    .order('starts_at')
  if (error) throw error
  return data
}

export const createEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data
}

export const upsertEventResponse = async (eventId, userId, attending) => {
  const { error } = await supabase
    .from('event_responses')
    .upsert({ event_id: eventId, user_id: userId, attending })
  if (error) throw error
}

// ── MESSAGES ──────────────────────────────────────────────
export const getConversationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from('conversation_members')
    .select('conversations(*, messages(*))')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map(d => d.conversations) ?? []
}

export const sendMessage = async (conversationId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── CLUB MEMBERSHIPS (historique) ────────────────────────
export const getMemberships = async (userId) => {
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── DELETE CLUB (soft) ────────────────────────────────────
export const deleteClub = async (clubId) => {
  const { data: members } = await supabase
    .from('users')
    .select('id')
    .eq('current_club_id', clubId)

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('club_id', clubId)

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  const season =
    new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)

  for (const member of members ?? []) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type, scope_id, scope_type')
      .eq('user_id', member.id)

    const clubRole = roles?.find(
      r => r.scope_type === 'club' && r.scope_id === clubId
    )
    const teamRole = roles?.find(r => r.scope_type === 'team')
    const teamInfo = teamRole
      ? teams?.find(t => t.id === teamRole.scope_id)
      : null

    await supabase.from('club_memberships').insert({
      user_id:      member.id,
      club_id:      clubId,
      club_name:    club?.name,
      role_type:    clubRole?.role_type ?? 'player',
      team_id:      teamInfo?.id ?? null,
      team_name:    teamInfo?.name ?? null,
      joined_at:    new Date().toISOString(),
      left_at:      new Date().toISOString(),
      leave_reason: 'club_deleted',
      season,
    })

    await supabase
      .from('users')
      .update({ current_club_id: null })
      .eq('id', member.id)
  }

  await supabase
    .from('user_roles')
    .delete()
    .eq('scope_id', clubId)

  await supabase
    .from('clubs')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', clubId)
}

// ── CLUB FOLLOWS (supporters) ─────────────────────────────
export const followClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('club_follows')
    .insert({ user_id: userId, club_id: clubId })
  if (error) throw error
}

export const unfollowClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('club_follows')
    .delete()
    .eq('user_id', userId)
    .eq('club_id', clubId)
  if (error) throw error
}

export const getFollowedClubs = async (userId) => {
  const { data, error } = await supabase
    .from('club_follows')
    .select('clubs(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map(d => d.clubs) ?? []
}

export const isFollowingClub = async (userId, clubId) => {
  const { data } = await supabase
    .from('club_follows')
    .select('id')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .single()
  return !!data
}

export const getEventsFromFollowedClubs = async (userId) => {
  const followed = await getFollowedClubs(userId)
  if (!followed.length) return []

  const clubIds = followed.map(c => c.id)

  const { data, error } = await supabase
    .from('events')
    .select('*, clubs(name, sport_id)')
    .in('club_id', clubIds)
    .eq('visibility', 'club_wide')
    .order('starts_at')
  if (error) throw error
  return data ?? []
}

export const getAllActiveClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .eq('status', 'active')
    .order('name')
  if (error) throw error
  return data ?? []
}

// ── AUTH HELPERS ──────────────────────────────────────────
export const hashPassword  = (pwd)       => bcrypt.hashSync(pwd, 10)
export const checkPassword = (pwd, hash) => bcrypt.compareSync(pwd, hash)

// ── SESSION (localStorage) ────────────────────────────────
const SESSION_KEY = 'cm_session'
export const getSession   = ()       => localStorage.getItem(SESSION_KEY)
export const setSession   = (userId) => localStorage.setItem(SESSION_KEY, userId)
export const clearSession = ()       => localStorage.removeItem(SESSION_KEY)
