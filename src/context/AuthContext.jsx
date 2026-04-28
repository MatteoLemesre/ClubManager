import { createContext, useContext, useState } from 'react'
import { USERS, TEAMS } from '../data/mock'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS[0]) // president par défaut

  function login(userId) {
    const user = USERS.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }

  function logout() {
    setCurrentUser(null)
  }

  function is(role) {
    return currentUser?.role === role
  }

  function isOneOf(...roles) {
    return roles.includes(currentUser?.role)
  }

  function canManageTeam(teamId) {
    if (currentUser?.role === 'president') return true
    if (currentUser?.role === 'coach') return currentUser.teamIds?.includes(teamId)
    return false
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, is, isOneOf, canManageTeam, users: USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
