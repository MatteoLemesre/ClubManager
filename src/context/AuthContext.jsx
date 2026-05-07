import { createContext, useContext, useState, useEffect } from 'react'
import * as db from '../services/db'

const AuthContext = createContext(null)

// Dérive role et team_ids depuis user_roles pour compatibilité avec is() / canManageTeam()
function normalizeUser(user) {
  if (!user) return null
  const roles = user.user_roles ?? []
  const primaryRole = roles[0]?.role_type ?? null
  const teamIds = roles
    .filter(r => r.scope_type === 'team')
    .map(r => r.scope_id)
  return {
    ...user,
    role:      primaryRole,
    team_ids:  teamIds,
    teamIds,
    firstName:  user.first_name  ?? user.firstName  ?? '',
    lastName:   user.last_name   ?? user.lastName   ?? '',
    birthDate:  user.birth_date  ?? user.birthDate  ?? null,
    birthPlace: user.birth_place ?? user.birthPlace ?? null,
    phone:      user.phone ?? null,
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  // Restaurer la session au démarrage
  useEffect(() => {
    const restore = async () => {
      const userId = db.getSession()
      if (userId) {
        try {
          const { supabase } = await import('../lib/supabase')
          const { data, error } = await supabase
            .from('users')
            .select('*, user_roles(*)')
            .eq('id', userId)
            .single()
          if (error || !data) {
            db.clearSession()
          } else if (data.account_status === 'active') {
            setCurrentUser(normalizeUser(data))
          } else {
            db.clearSession()
          }
        } catch (err) {
          console.error('Session restore error:', err)
          db.clearSession()
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = async (email, password) => {
    const user = await db.getUserByEmail(email)
    if (!user)                               throw new Error('Email introuvable')
    if (!db.checkPassword(password, user.password_hash))
                                             throw new Error('Mot de passe incorrect')
    if (user.account_status === 'pending')   throw new Error('Votre compte est en attente de validation')
    if (user.account_status === 'disabled')  throw new Error('Votre compte a été désactivé')

    await db.updateUser(user.id, { last_login_at: new Date().toISOString() })

    db.setSession(user.id)
    const normalized = normalizeUser(user)
    setCurrentUser(normalized)
    return normalized
  }

  const logout = () => {
    db.clearSession()
    setCurrentUser(null)
  }

  const refreshUser = async () => {
    if (currentUser) {
      const updated = await db.getUserById(currentUser.id)
      setCurrentUser(normalizeUser(updated))
    }
  }

  // Dev : connexion directe sans mot de passe
  const devLogin = async (userId) => {
    try {
      const user = await db.getUserById(userId)
      if (user) {
        db.setSession(user.id)
        setCurrentUser(normalizeUser(user))
      }
    } catch {}
  }

  const is            = (role)    => currentUser?.role === role
  const isOneOf       = (...roles) => roles.includes(currentUser?.role)
  const canManageTeam = (teamId)  =>
    is('president') || (is('coach') && currentUser?.team_ids?.includes(teamId))

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      login, logout, refreshUser, devLogin,
      is, isOneOf, canManageTeam,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
