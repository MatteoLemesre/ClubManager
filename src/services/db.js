// Mock database service — all data is in-memory, no real DB calls

import { supabase } from '../lib/supabase'

const SESSION_KEY = 'clubmanager_session'

// ── Session ───────────────────────────────────────────────────────────────────
export function getSession()        { return localStorage.getItem(SESSION_KEY) }
export function setSession(userId)  { localStorage.setItem(SESSION_KEY, userId) }
export function clearSession()      { localStorage.removeItem(SESSION_KEY) }

// ── Password (mock — plain text comparison) ───────────────────────────────────
export function hashPassword(password) { return password }
export function checkPassword(password, hash) { return password === hash }

// ── Users ─────────────────────────────────────────────────────────────────────
export async function getUserById(id) {
  const { data } = await supabase.from('users').select('*, user_roles(*)').eq('id', id).single()
  return data
}

export async function getUserByEmail(email) {
  const { data } = await supabase.from('users').select('*, user_roles(*)').eq('email', email).single()
  return data
}

export async function updateUser(_id, _updates) {
  return { error: null }
}

export async function createUser(data) {
  return {
    ...data,
    id: `u-${Date.now()}`,
    created_at: new Date().toISOString(),
    user_roles: [],
  }
}

export async function getUsersByClub(clubId) {
  const { data } = await supabase.from('users').select('*, user_roles(*)').eq('current_club_id', clubId)
  return data ?? []
}

// ── Clubs ─────────────────────────────────────────────────────────────────────
export async function getClubs() {
  const { data } = await supabase.from('clubs').select('*, sports(name), teams(id, name, status)').eq('status', 'active')
  return data ?? []
}

export async function getClubById(clubId) {
  const { data } = await supabase.from('clubs').select('*, sports(name)').eq('id', clubId).single()
  return data
}

export async function createClub(clubData) {
  return {
    ...clubData,
    id: `club-${Date.now()}`,
    status: 'active',
    created_at: new Date().toISOString(),
  }
}

// ── Teams ─────────────────────────────────────────────────────────────────────
export async function getTeamsByClub(clubId) {
  const { data } = await supabase.from('teams').select('*, clubs(name, sport_id)').eq('club_id', clubId).eq('status', 'active')
  return data ?? []
}

export async function getMyTeams(userId) {
  const { data: user } = await supabase.from('users').select('*, user_roles(*)').eq('id', userId).single()
  if (!user) return []

  const role    = user.user_roles?.[0]?.role_type
  const teamIds = (user.user_roles ?? []).filter(r => r.scope_type === 'team').map(r => r.scope_id)

  const { data: allTeams } = await supabase.from('teams').select('*, clubs(name)').eq('club_id', user.current_club_id ?? '').eq('status', 'active')
  const teams = allTeams ?? []

  if (role === 'president') return teams.map(t => ({ ...t, _role: 'president' }))
  return teams.filter(t => teamIds.includes(t.id)).map(t => ({ ...t, _role: role }))
}

export async function getNextMatch(teamId) {
  const { data } = await supabase.from('matches').select('*').eq('team_id', teamId)
  return (data ?? []).filter(m => m.status === 'scheduled')[0] ?? null
}

export async function getNextTraining(teamId) {
  const { data } = await supabase.from('trainings').select('*').eq('team_id', teamId)
  return data?.[0] ?? null
}

export async function leaveTeam(_userId, _teamId) {
  return { error: null }
}

// ── Matches ───────────────────────────────────────────────────────────────────
export async function getMatchesByClub(_clubId) {
  const { data } = await supabase.from('matches').select('*')
  return data ?? []
}

// ── Events ────────────────────────────────────────────────────────────────────
export async function getMyEvents(_userId, clubId) {
  const { data } = await supabase.from('events').select('*, clubs(name)').eq('club_id', clubId)
  return data ?? []
}

export async function getEventsByClub(clubId) {
  const { data } = await supabase.from('events').select('*').eq('club_id', clubId)
  return data ?? []
}

export async function getMyUpcomingMatches(userId) {
  const { data: user } = await supabase.from('users').select('*, user_roles(*)').eq('id', userId).single()
  if (!user) return []

  const { data: allMatches } = await supabase.from('matches').select('*, teams(id, name, category, clubs(name))')
  const scheduled = (allMatches ?? []).filter(m => m.status === 'scheduled')

  const role = user.user_roles?.[0]?.role_type
  if (role === 'president') return scheduled

  const teamIds = (user.user_roles ?? []).filter(r => r.scope_type === 'team').map(r => r.scope_id)
  return scheduled.filter(m => teamIds.includes(m.team_id))
}

// ── Posts / Feed ──────────────────────────────────────────────────────────────
export async function getFeedPosts(_userId, _clubId) {
  const { data } = await supabase.from('club_posts').select('*')
  return data ?? []
}

export async function addComment(postId, userId, content) {
  return {
    id: `comment-${Date.now()}`,
    post_id: postId,
    user_id: userId,
    content,
    created_at: new Date().toISOString(),
    users: { id: userId, first_name: 'Moi', last_name: '' },
  }
}

export async function toggleLike(_postId, _userId) {
  return true
}

export async function canPostForClub(userId, _clubId) {
  const { data } = await supabase.from('users').select('user_roles(*)').eq('id', userId).single()
  const role = data?.user_roles?.[0]?.role_type
  return role === 'president' || role === 'coach'
}

export async function getClubPosts(clubId) {
  const { data } = await supabase.from('club_posts').select('*, users!author_id(id, first_name, last_name)').eq('club_id', clubId)
  return data ?? []
}

// ── Follow / Unfollow ─────────────────────────────────────────────────────────
export async function followTeam(_userId, _teamId)   { return null }
export async function unfollowTeam(_userId, _teamId) { return null }
export async function getFollowedTeams(_userId)      { return new Set() }

export async function followClub(_userId, _clubId)   { return null }
export async function unfollowClub(_userId, _clubId) { return null }
export async function getFollowedClubs(_userId)      { return [] }

// ── Join Requests ─────────────────────────────────────────────────────────────
export async function createJoinRequest(data) {
  return { id: `req-${Date.now()}`, ...data, created_at: new Date().toISOString() }
}

export async function notifyForJoinRequest(_role, _club, _teamId, _user, _newTeam) {
  return null
}

export async function createRequest(data) {
  return { id: `req-${Date.now()}`, ...data, created_at: new Date().toISOString() }
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function getNotifications(userId) {
  const { data } = await supabase.from('notifications').select('*').eq('to_user_id', userId)
  return data ?? []
}

export async function getUnreadCount(userId) {
  const { data } = await supabase.from('notifications').select('*').eq('to_user_id', userId)
  return (data ?? []).filter(n => !n.read).length
}

export async function createNotification(data) {
  return { id: `notif-${Date.now()}`, ...data, created_at: new Date().toISOString() }
}

export async function markNotificationRead(_id)        { return { error: null } }
export async function markAllNotificationsRead(_userId) { return { error: null } }

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getMemberships(_userId)     { return [] }
export async function getPlayerHistory(_userId)   { return [] }
export async function leaveClub(_userId, _clubId) { return { error: null } }
export async function canPresidentLeave(_userId, _clubId) { return true }
export async function createUserRole(data) {
  return { id: `role-${Date.now()}`, ...data }
}

// ── Clubs (extra) ─────────────────────────────────────────────────────────────
export async function getAllActiveClubs() {
  const { data } = await supabase.from('clubs').select('*, sports(name), teams(id, name, status)').eq('status', 'active')
  return data ?? []
}

// ── Teams (extra) ─────────────────────────────────────────────────────────────
export async function getTeamById(teamId) {
  const { data } = await supabase.from('teams').select('*, clubs(name)').eq('id', teamId).single()
  return data
}

export async function getMatchesByTeamAndSeason(teamId, _season) {
  const { data } = await supabase.from('matches').select('*').eq('team_id', teamId)
  return data ?? []
}

// ── Matches (extra) ───────────────────────────────────────────────────────────
export async function getAllPlayedMatches() {
  const { data } = await supabase.from('matches').select('*, teams(id, name, category, clubs(name))')
  return (data ?? []).filter(m => m.status === 'played')
}

// ── Season ────────────────────────────────────────────────────────────────────
export async function getCurrentSeason(_clubId) {
  const now  = new Date()
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${year}-${year + 1}`
}

export async function startNewSeason(_clubId) {
  return { error: null }
}

// ── Misc ──────────────────────────────────────────────────────────────────────
export async function getSports() {
  const { data } = await supabase.from('sports').select('*')
  return data ?? []
}

export async function resolvePostalCode(code) {
  const POSTAL_MAP = {
    '75': { departement: 'Paris',               code_dep: '75', region: 'Île-de-France' },
    '77': { departement: 'Seine-et-Marne',      code_dep: '77', region: 'Île-de-France' },
    '78': { departement: 'Yvelines',            code_dep: '78', region: 'Île-de-France' },
    '91': { departement: 'Essonne',             code_dep: '91', region: 'Île-de-France' },
    '92': { departement: 'Hauts-de-Seine',      code_dep: '92', region: 'Île-de-France' },
    '93': { departement: 'Seine-Saint-Denis',   code_dep: '93', region: 'Île-de-France' },
    '94': { departement: 'Val-de-Marne',        code_dep: '94', region: 'Île-de-France' },
    '95': { departement: "Val-d'Oise",          code_dep: '95', region: 'Île-de-France' },
    '59': { departement: 'Nord',                code_dep: '59', region: 'Hauts-de-France' },
    '60': { departement: 'Oise',                code_dep: '60', region: 'Hauts-de-France' },
    '62': { departement: 'Pas-de-Calais',       code_dep: '62', region: 'Hauts-de-France' },
    '80': { departement: 'Somme',               code_dep: '80', region: 'Hauts-de-France' },
    '33': { departement: 'Gironde',             code_dep: '33', region: 'Nouvelle-Aquitaine' },
    '38': { departement: 'Isère',               code_dep: '38', region: 'Auvergne-Rhône-Alpes' },
    '69': { departement: 'Rhône',               code_dep: '69', region: 'Auvergne-Rhône-Alpes' },
    '13': { departement: 'Bouches-du-Rhône',    code_dep: '13', region: "Provence-Alpes-Côte d'Azur" },
  }
  const key = String(code).slice(0, 2)
  return POSTAL_MAP[key] ?? null
}
