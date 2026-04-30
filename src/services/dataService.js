import { uuid } from '../utils/uuid'
import bcrypt from 'bcryptjs'

const KEYS = {
  clubs:         'cm_clubs',
  persons:       'cm_persons',
  users:         'cm_users',
  teams:         'cm_teams',
  requests:      'cm_requests',
  notifications: 'cm_notifications',
  session:       'cm_session',
}

const get    = (key) => JSON.parse(localStorage.getItem(key) ?? '[]')
const getOne = (key) => JSON.parse(localStorage.getItem(key) ?? 'null')
const set    = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export const db = {
  // CLUBS
  getClubs:  ()     => get(KEYS.clubs),
  getClub:   (id)   => get(KEYS.clubs).find(c => c.id === id),
  addClub:   (club) => { const arr = get(KEYS.clubs); arr.push(club); set(KEYS.clubs, arr); return club },

  // PERSONS
  getPersons: ()       => get(KEYS.persons),
  getPerson:  (id)     => get(KEYS.persons).find(p => p.id === id),
  addPerson:  (person) => { const arr = get(KEYS.persons); arr.push(person); set(KEYS.persons, arr); return person },

  // USERS
  getUsers:       ()       => get(KEYS.users),
  getUserById:    (id)     => get(KEYS.users).find(u => u.id === id),
  getUserByEmail: (email)  => get(KEYS.users).find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUsersByClub: (clubId) => get(KEYS.users).filter(u => u.clubId === clubId),
  addUser:        (user)   => { const arr = get(KEYS.users); arr.push(user); set(KEYS.users, arr); return user },
  updateUser:     (id, changes) => {
    const arr = get(KEYS.users).map(u => u.id === id ? { ...u, ...changes } : u)
    set(KEYS.users, arr)
  },

  // TEAMS
  getTeams:       ()       => get(KEYS.teams),
  getTeamsByClub: (clubId) => get(KEYS.teams).filter(t => t.clubId === clubId),
  addTeam:        (team)   => { const arr = get(KEYS.teams); arr.push(team); set(KEYS.teams, arr); return team },

  // REQUESTS
  getRequests:       ()       => get(KEYS.requests),
  getRequestsByClub: (clubId) => get(KEYS.requests).filter(r => r.clubId === clubId),
  getPendingForCoach: (coachId) => {
    const coach = db.getUserById(coachId)
    return get(KEYS.requests).filter(r =>
      r.status === 'pending' &&
      r.role === 'player' &&
      coach?.teamIds?.includes(r.teamId)
    )
  },
  getPendingForPresident: (clubId) => get(KEYS.requests).filter(r =>
    r.status === 'pending' && r.role === 'coach' && r.clubId === clubId
  ),
  addRequest:    (req) => { const arr = get(KEYS.requests); arr.push(req); set(KEYS.requests, arr); return req },
  updateRequest: (id, changes) => {
    const arr = get(KEYS.requests).map(r => r.id === id ? { ...r, ...changes } : r)
    set(KEYS.requests, arr)
  },

  // NOTIFICATIONS
  getNotifications:  (userId) => get(KEYS.notifications).filter(n => n.toUserId === userId),
  getUnreadCount:    (userId) => get(KEYS.notifications).filter(n => n.toUserId === userId && !n.read).length,
  addNotification:   (notif)  => { const arr = get(KEYS.notifications); arr.push(notif); set(KEYS.notifications, arr) },
  markNotifRead:     (id)     => {
    const arr = get(KEYS.notifications).map(n => n.id === id ? { ...n, read: true } : n)
    set(KEYS.notifications, arr)
  },
  markAllNotifsRead: (userId) => {
    const arr = get(KEYS.notifications).map(n => n.toUserId === userId ? { ...n, read: true } : n)
    set(KEYS.notifications, arr)
  },

  // SESSION
  getSession:   ()       => getOne(KEYS.session),
  setSession:   (userId) => set(KEYS.session, userId),
  clearSession: ()       => localStorage.removeItem(KEYS.session),

  // AUTH HELPERS
  hashPassword:  (pwd)       => bcrypt.hashSync(pwd, 10),
  checkPassword: (pwd, hash) => bcrypt.compareSync(pwd, hash),
}
