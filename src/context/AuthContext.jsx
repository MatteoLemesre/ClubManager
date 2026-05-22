import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ── Mock personas ─────────────────────────────────────────────────────────────
const PERSONAS = {
  president: {
    id: 'u-1', email: 'president@test.fr', password_hash: 'password',
    first_name: 'Jean', last_name: 'Dupont', firstName: 'Jean', lastName: 'Dupont',
    role: 'president', teamIds: [], team_ids: [], account_status: 'active',
    birth_date: '1985-03-15', birthDate: '1985-03-15',
    phone: '06 12 34 56 78', address: '12 rue du Stade',
    postal_code: '62300', postalCode: '62300',
    city: 'Lens', country: 'France', department: 'Pas-de-Calais', region: 'Hauts-de-France',
    current_club_id: 'club-1',
    user_roles: [{ role_type: 'president', scope_type: 'club', scope_id: 'club-1' }],
    member_of_clubs: ['club-1'],
    teams: ['team-1', 'team-2', 'team-3', 'team-4'],
    followed_clubs: ['club-1', 'mock-club-ol'],
    followed_teams: ['mock-team-bx-2'],
  },
  coach: {
    id: 'u-2', email: 'coach@test.fr', password_hash: 'password',
    first_name: 'Marc', last_name: 'Leroy', firstName: 'Marc', lastName: 'Leroy',
    role: 'coach', teamIds: ['team-1'], team_ids: ['team-1'], account_status: 'active',
    birth_date: '1980-07-20', birthDate: '1980-07-20',
    phone: '06 98 76 54 32', address: '5 avenue Foch',
    postal_code: '62300', postalCode: '62300',
    city: 'Lens', country: 'France', department: 'Pas-de-Calais', region: 'Hauts-de-France',
    current_club_id: 'club-1',
    user_roles: [{ role_type: 'coach', scope_type: 'team', scope_id: 'team-1' }],
    member_of_clubs: ['club-1'],
    teams: ['team-1'],
    followed_clubs: ['club-1', 'mock-club-sd'],
    followed_teams: ['mock-team-bx-1', 'mock-team-ol-1'],
  },
  player: {
    id: 'u-3', email: 'joueur@test.fr', password_hash: 'password',
    first_name: 'Lucas', last_name: 'Martin', firstName: 'Lucas', lastName: 'Martin',
    role: 'player', teamIds: ['team-1'], team_ids: ['team-1'], account_status: 'active',
    birth_date: '2001-03-15', birthDate: '2001-03-15',
    phone: '07 11 22 33 44', address: '8 rue Victor Hugo',
    postal_code: '62300', postalCode: '62300',
    city: 'Lens', country: 'France', department: 'Pas-de-Calais', region: 'Hauts-de-France',
    current_club_id: 'club-1',
    user_roles: [{ role_type: 'player', scope_type: 'team', scope_id: 'team-1' }],
    member_of_clubs: ['club-1'],
    teams: ['team-1'],
    followed_clubs: ['club-1'],
    followed_teams: ['mock-team-sd-1', 'mock-team-bx-1'],
  },
  supporter: {
    id: 'u-4', email: 'supporter@test.fr', password_hash: 'password',
    first_name: 'Sophie', last_name: 'Durand', firstName: 'Sophie', lastName: 'Durand',
    role: 'supporter', teamIds: [], team_ids: [], account_status: 'active',
    birth_date: '1992-08-20', birthDate: '1992-08-20',
    phone: '06 55 44 33 22', address: '3 place de la Mairie',
    postal_code: '93200', postalCode: '93200',
    city: 'Saint-Denis', country: 'France', department: 'Seine-Saint-Denis', region: 'Île-de-France',
    current_club_id: null,
    user_roles: [],
    followed_clubs: ['mock-club-sd', 'mock-club-ol'],
    followed_teams: ['mock-team-bx-1', 'mock-team-bx-2'],
    member_of_clubs: [],
    teams: [],
  },
}

export const MOCK_CLUBS = {
  'club-1':      { id: 'club-1',      name: 'FC Lens Académie',       city: 'Lens',        sports: { name: 'Football' } },
  'mock-club-sd':{ id: 'mock-club-sd',name: 'AS Saint-Denis United',  city: 'Saint-Denis', sports: { name: 'Football' } },
}

export const MOCK_FEED_POSTS = {
  'club-1': [
    {
      id: 'post-cl1-1',
      club_id: 'club-1',
      clubs: { id: 'club-1', name: 'FC Lens Académie', city: 'Lens' },
      users: { id: 'u-1', first_name: 'Jean', last_name: 'Dupont' },
      content: '🏆 Victoire 2-0 face au FC Échirolles ce dimanche ! Super performance des Séniors A, bien joués les gars !',
      media_url: null, media_type: null,
      post_likes: [1, 2, 3],
      post_comments: [],
      created_at: new Date(2026, 4, 14, 18, 0).toISOString(),
    },
    {
      id: 'post-cl1-2',
      club_id: 'club-1',
      clubs: { id: 'club-1', name: 'FC Lens Académie', city: 'Lens' },
      users: { id: 'u-1', first_name: 'Jean', last_name: 'Dupont' },
      content: '📣 Rappel : Journée portes ouvertes le 20 avril au terrain principal. Venez nombreux pour découvrir notre club !',
      media_url: null, media_type: null,
      post_likes: [1, 2],
      post_comments: [],
      created_at: new Date(2026, 4, 10, 10, 0).toISOString(),
    },
    {
      id: 'post-cl1-3',
      club_id: 'club-1',
      clubs: { id: 'club-1', name: 'FC Lens Académie', city: 'Lens' },
      users: { id: 'u-1', first_name: 'Jean', last_name: 'Dupont' },
      content: '⚽ Les U13 B s\'imposent 4-2 contre Vizille ! Super match, mention spéciale à Théo Moreau (doublé).',
      media_url: null, media_type: null,
      post_likes: [1, 2, 3, 4, 5],
      post_comments: [],
      created_at: new Date(2026, 4, 7, 16, 30).toISOString(),
    },
  ],
  'mock-club-sd': [
    {
      id: 'post-sd-1',
      club_id: 'mock-club-sd',
      clubs: { id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis' },
      users: { id: 'staff-sd', first_name: 'Karim', last_name: 'Oussama' },
      content: '🏆 Victoire 3-1 face au Red Star FC ce dimanche ! Belle performance collective, mention spéciale à notre gardien Souleymane. Prochain match samedi à domicile.',
      media_url: null, media_type: null,
      post_likes: [1, 2, 3, 4, 5, 6, 7],
      post_comments: [],
      created_at: new Date(2026, 4, 14, 18, 30).toISOString(),
    },
    {
      id: 'post-sd-2',
      club_id: 'mock-club-sd',
      clubs: { id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis' },
      users: { id: 'staff-sd', first_name: 'Karim', last_name: 'Oussama' },
      content: '📋 Convocation pour le match de samedi 17 mai vs FC Aubervilliers (15h00, Stade Marcel-Cerdan). Rendez-vous à 13h30 au stade. Tenue complète obligatoire.',
      media_url: null, media_type: null,
      post_likes: [1, 2],
      post_comments: [],
      created_at: new Date(2026, 4, 12, 10, 0).toISOString(),
    },
    {
      id: 'post-sd-3',
      club_id: 'mock-club-sd',
      clubs: { id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis' },
      users: { id: 'staff-sd', first_name: 'Karim', last_name: 'Oussama' },
      content: '🎉 Bienvenue à nos 3 nouvelles recrues pour la fin de saison : Moussa Diarra (milieu), Ahmed Benali (défenseur) et Kevin Traoré (attaquant). Bonne chance à eux !',
      media_url: null, media_type: null,
      post_likes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      post_comments: [],
      created_at: new Date(2026, 4, 8, 14, 15).toISOString(),
    },
    {
      id: 'post-sd-4',
      club_id: 'mock-club-sd',
      clubs: { id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis' },
      users: { id: 'staff-sd', first_name: 'Karim', last_name: 'Oussama' },
      content: '📊 Bilan à 4 journées de la fin : 8 victoires, 3 nuls, 2 défaites. On est 2ème du classement, à 3 points du leader. Tout se jouera lors des dernières journées !',
      media_url: null, media_type: null,
      post_likes: [1, 2, 3, 4],
      post_comments: [],
      created_at: new Date(2026, 4, 5, 9, 0).toISOString(),
    },
  ],
}

const MOCK_CLUB = {
  id: 'club-1',
  name: 'FC Lens Académie',
  city: 'Lens',
  status: 'active',
  sports: { name: 'Football' },
}

const PERSONAS_LIST = Object.values(PERSONAS)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(PERSONAS.president)

  const login = async (emailOrId, _password) => {
    const user = PERSONAS_LIST.find(u => u.id === emailOrId || u.email === emailOrId)
    if (user) setCurrentUser(user)
    return user ?? PERSONAS.president
  }

  const logout = () => setCurrentUser(PERSONAS.president)

  const refreshUser = () => Promise.resolve()

  const devLogin = (userId) => {
    const user = PERSONAS_LIST.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }

  // Switche directement par rôle clé ('president' | 'coach' | 'player' | 'supporter')
  const switchRole = (roleKey) => {
    if (PERSONAS[roleKey]) setCurrentUser(PERSONAS[roleKey])
  }

  const is            = (role)     => currentUser?.role === role
  const isOneOf       = (...roles) => roles.includes(currentUser?.role)
  const canManageTeam = (teamId)   =>
    is('president') || (is('coach') && currentUser?.teamIds?.includes(teamId))

  return (
    <AuthContext.Provider value={{
      currentUser,
      club: MOCK_CLUB,
      loading: false,
      login, logout, refreshUser, devLogin, switchRole,
      is, isOneOf, canManageTeam,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
