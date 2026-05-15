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
  },
  supporter: {
    id: 'u-4', email: 'supporter@test.fr', password_hash: 'password',
    first_name: 'Sophie', last_name: 'Durand', firstName: 'Sophie', lastName: 'Durand',
    role: 'supporter', teamIds: [], team_ids: [], account_status: 'active',
    birth_date: '1992-08-20', birthDate: '1992-08-20',
    phone: '06 55 44 33 22', address: '3 place de la Mairie',
    postal_code: '62300', postalCode: '62300',
    city: 'Lens', country: 'France', department: 'Pas-de-Calais', region: 'Hauts-de-France',
    current_club_id: null,
    user_roles: [],
  },
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
