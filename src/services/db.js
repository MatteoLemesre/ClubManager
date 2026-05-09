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
    .insert({
      email:           user.email,
      password_hash:   user.password_hash,
      first_name:      user.first_name,
      last_name:       user.last_name,
      birth_date:      user.birth_date ?? null,
      phone:           user.phone ?? null,
      birth_place:     user.birth_place ?? null,
      account_status:  user.account_status ?? 'active',
      current_club_id: user.current_club_id ?? null,
      address:         user.address     ?? null,
      postal_code:     user.postal_code ?? null,
      city:            user.city        ?? null,
      country:         user.country     ?? 'France',
      department:      user.department  ?? null,
      code_dep:        user.code_dep    ?? null,
      region:          user.region      ?? null,
      // person_id intentionnellement omis — nullable
    })
    .select()
    .single()
  if (error) {
    console.error('createUser error:', error)
    throw error
  }
  return data
}

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles(*)')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (error && error.code !== 'PGRST116') throw error  // PGRST116 = not found
  return data ?? null
}

export const getUsersByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles(*)')
    .eq('current_club_id', clubId)
  if (error) {
    console.error('getUsersByClub error:', error)
    throw error
  }
  return data ?? []
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

// ── CLUB JOIN REQUESTS ────────────────────────────────────
export const createJoinRequest = async (request) => {
  const { data, error } = await supabase
    .from('club_join_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getJoinRequestsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('club_join_requests')
    .select('*, users(first_name, last_name, email, phone)')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const getJoinRequestsForCoach = async (teamIds) => {
  if (!teamIds?.length) return []
  const { data, error } = await supabase
    .from('club_join_requests')
    .select('*, users(first_name, last_name, email, phone)')
    .in('team_id', teamIds)
    .eq('status', 'pending')
    .eq('role_type', 'player')
  if (error) throw error
  return data ?? []
}

export const approveJoinRequest = async (requestId, reviewerId) => {
  const { data: req } = await supabase
    .from('club_join_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!req) throw new Error('Demande introuvable')

  // Mettre à jour current_club_id du user
  await supabase
    .from('users')
    .update({ current_club_id: req.club_id })
    .eq('id', req.user_id)

  // Créer le rôle
  await supabase.from('user_roles').insert({
    user_id:    req.user_id,
    role_type:  req.role_type,
    scope_type: req.team_id ? 'team' : 'club',
    scope_id:   req.team_id ?? req.club_id,
  })

  // Si joueur → ajouter à team_players
  if (req.role_type === 'player' && req.team_id) {
    await supabase.from('team_players').insert({
      team_id:   req.team_id,
      user_id:   req.user_id,
      season:    req.season,
      is_active: true,
    })
  }

  // Si coach → ajouter à team_coaches
  if (req.role_type === 'coach' && req.team_id) {
    await supabase.from('team_coaches').insert({
      team_id:   req.team_id,
      user_id:   req.user_id,
      season:    req.season,
      is_active: true,
    })
  }

  // Créer l'entrée d'historique
  await supabase.from('club_memberships').insert({
    user_id:   req.user_id,
    club_id:   req.club_id,
    role_type: req.role_type,
    team_id:   req.team_id ?? null,
    season:    req.season,
    joined_at: new Date().toISOString(),
  })

  // Marquer la demande comme approuvée
  await supabase
    .from('club_join_requests')
    .update({
      status:      'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  // Notifier le demandeur
  await createNotification({
    to_user_id: req.user_id,
    type:       'request_approved',
    title:      'Demande approuvée !',
    body:       'Vous pouvez maintenant accéder au club.',
    request_id: requestId,
  })
}

export const rejectJoinRequest = async (requestId, reviewerId) => {
  const { data: req } = await supabase
    .from('club_join_requests')
    .select('user_id')
    .eq('id', requestId)
    .single()

  await supabase
    .from('club_join_requests')
    .update({
      status:      'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  await createNotification({
    to_user_id: req.user_id,
    type:       'request_rejected',
    title:      'Demande refusée',
    body:       "Votre demande d'adhésion a été refusée.",
    request_id: requestId,
  })
}

// ── SEASONS ───────────────────────────────────────────────
export const getCurrentSeason = async (clubId) => {
  const { data } = await supabase
    .from('seasons')
    .select('name')
    .eq('club_id', clubId)
    .eq('is_current', true)
    .single()
  if (!data) {
    const now  = new Date()
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
    return `${year}-${year + 1}`
  }
  return data.name
}

export const startNewSeason = async (clubId, seasonName, userId) => {
  const { error } = await supabase.rpc('start_new_season', {
    p_club_id: clubId,
    p_season:  seasonName,
    p_user_id: userId,
  })
  if (error) throw error
}

// ── PLAYER HISTORY ────────────────────────────────────────
export const getPlayerHistory = async (userId) => {
  const { data, error } = await supabase
    .from('player_history')
    .select('*, teams(name, category), clubs(name)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── NOTIFY FOR JOIN REQUEST ───────────────────────────────
export const notifyForJoinRequest = async (role, club, teamId, user) => {
  const clubUsers = await getUsersByClub(club.id)

  if (role === 'coach' || role === 'president') {
    const presidents = clubUsers.filter(u =>
      u.user_roles?.some(r => r.role_type === 'president')
    )
    for (const p of presidents) {
      await createNotification({
        to_user_id: p.id,
        type:       'registration_request',
        title:      `Nouvelle demande — ${role === 'coach' ? 'Coach' : 'Président'}`,
        body:       `${user.first_name} ${user.last_name} souhaite rejoindre comme ${role}.`,
      })
    }
  }

  if (role === 'player' && teamId) {
    const { data: coaches } = await supabase
      .from('team_coaches')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('is_active', true)

    for (const { user_id } of coaches ?? []) {
      await createNotification({
        to_user_id: user_id,
        type:       'registration_request',
        title:      'Nouvelle demande de joueur',
        body:       `${user.first_name} ${user.last_name} souhaite rejoindre votre équipe.`,
      })
    }
  }
}

// ── LEAVE CLUB ────────────────────────────────────────────
export const leaveClub = async (userId, clubId) => {
  const { error } = await supabase.rpc('leave_club', {
    p_user_id: userId,
    p_club_id: clubId,
    p_reason:  'left',
  })
  if (error) throw error
}

export const canPresidentLeave = async (userId, clubId) => {
  const { data, error } = await supabase.rpc('can_president_leave', {
    p_user_id: userId,
    p_club_id: clubId,
  })
  if (error) throw error
  return data
}

// ── RESULTS (inter-clubs) ─────────────────────────────────
export const getAllPlayedMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select('*, teams(name, category, club_id, clubs(name, sport_id))')
    .eq('status', 'played')
    .order('scheduled_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

// ── TEAM HISTORY ──────────────────────────────────────────
export const getTeamById = async (teamId) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*, clubs(name)')
    .eq('id', teamId)
    .single()
  if (error) throw error
  return data
}

export const getMatchesByTeamAndSeason = async (teamId, season) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .eq('season', season)
    .order('scheduled_at')
  if (error) throw error
  return data ?? []
}

// ── TEAM PAGE — SEARCH & FOLLOW ──────────────────────────

// Résoudre un code postal français → { departement, code_dep, region }
export const resolvePostalCode = async (postalCode) => {
  const { data, error } = await supabase.rpc('resolve_postal_code', {
    p_postal: postalCode,
  })
  if (error) throw error
  return data?.[0] ?? null
}

// Rechercher des clubs avec leurs équipes actives
export const searchClubs = async (query, mode = 'name') => {
  let qb = supabase
    .from('clubs')
    .select('*, sports(name), teams(id, name, category, status)')
    .eq('status', 'active')
    .eq('teams.status', 'active')

  if (mode === 'name')       qb = qb.ilike('name',     `%${query}%`)
  if (mode === 'city')       qb = qb.ilike('city',     `%${query}%`)
  if (mode === 'department') qb = qb.ilike('code_dep',  `${query}%`)
  if (mode === 'region')     qb = qb.ilike('region',   `%${query}%`)

  const { data, error } = await qb.limit(20)
  if (error) throw error
  return data ?? []
}

// Équipes actives d'un utilisateur (joueur ou coach)
export const getMyTeams = async (userId) => {
  const [players, coaches] = await Promise.all([
    supabase
      .from('team_players')
      .select('teams(*, clubs(name, sport_id))')
      .eq('user_id', userId)
      .eq('is_active', true)
      .then(r => r.data?.map(d => ({ ...d.teams, _role: 'player' })) ?? []),
    supabase
      .from('team_coaches')
      .select('teams(*, clubs(name, sport_id))')
      .eq('user_id', userId)
      .eq('is_active', true)
      .then(r => r.data?.map(d => ({ ...d.teams, _role: 'coach' })) ?? []),
  ])
  return [...players, ...coaches]
}

// Quitter une équipe (sans quitter le club)
export const leaveTeam = async (userId, teamId) => {
  await Promise.all([
    supabase
      .from('team_players')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('team_id', teamId),
    supabase
      .from('team_coaches')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('team_id', teamId),
    supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('scope_id', teamId)
      .eq('scope_type', 'team'),
  ])
  // Archiver dans player_history
  await supabase
    .from('player_history')
    .update({ left_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .is('left_at', null)
}

// Suivre / ne plus suivre une équipe (favoris supporter)
export const followTeam = async (userId, teamId) => {
  const { error } = await supabase
    .from('supporter_favorites')
    .insert({ user_id: userId, team_id: teamId })
  if (error && error.code !== '23505') throw error // ignorer doublon
}

export const unfollowTeam = async (userId, teamId) => {
  const { error } = await supabase
    .from('supporter_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId)
  if (error) throw error
}

export const getFollowedTeams = async (userId) => {
  const { data, error } = await supabase
    .from('supporter_favorites')
    .select('team_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set(data?.map(d => d.team_id) ?? [])
}

// Prochain match programmé d'une équipe
export const getNextMatch = async (teamId) => {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(1)
    .single()
  return data ?? null
}

// Prochain entraînement d'une équipe
export const getNextTraining = async (teamId) => {
  const { data } = await supabase
    .from('trainings')
    .select('*')
    .eq('team_id', teamId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(1)
    .single()
  return data ?? null
}

// ── AUTH HELPERS ──────────────────────────────────────────
export const hashPassword  = (pwd)       => bcrypt.hashSync(pwd, 10)
export const checkPassword = (pwd, hash) => bcrypt.compareSync(pwd, hash)

// ── SESSION (localStorage) ────────────────────────────────
const SESSION_KEY = 'cm_session'
export const getSession   = ()       => localStorage.getItem(SESSION_KEY)
export const setSession   = (userId) => localStorage.setItem(SESSION_KEY, userId)
export const clearSession = ()       => localStorage.removeItem(SESSION_KEY)
