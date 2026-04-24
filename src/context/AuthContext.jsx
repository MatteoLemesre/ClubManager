import { createContext, useContext, useState } from 'react'
import { USERS } from '../data/mock'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS[0]) // president par défaut

  function switchUser(userId) {
    const user = USERS.find(u => u.id === userId)
    if (user) setCurrentUser(user)
  }

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, users: USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
