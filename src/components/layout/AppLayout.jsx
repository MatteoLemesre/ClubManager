import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge } from '../ui'
import {
  CalendarDays,
  Users,
  MessageSquare,
  Trophy,
  LayoutDashboard,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { getFullName } from '../../data/mock'

const NAV_ITEMS = [
  { to: '/app/events',   icon: LayoutDashboard, label: 'Événements' },
  { to: '/app/team',     icon: Trophy,           label: 'Équipe' },
  { to: '/app/members',  icon: Users,            label: 'Membres' },
  { to: '/app/calendar', icon: CalendarDays,     label: 'Calendrier' },
  { to: '/app/messages', icon: MessageSquare,    label: 'Messages' },
]

export default function AppLayout() {
  const { currentUser, users, switchUser } = useAuth()
  const navigate = useNavigate()
  const [devOpen, setDevOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-surface-900 text-sm leading-tight">FC Saint-Martin</p>
              <p className="text-xs text-surface-500">Football</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-brand-600' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* DEV — user switcher */}
        <div className="px-3 pb-3 border-t border-surface-200 pt-3">
          <button
            onClick={() => setDevOpen(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-50 transition-colors"
          >
            <Avatar user={currentUser} size="sm" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-surface-800 truncate">{getFullName(currentUser)}</p>
              <p className="text-xs text-surface-500 capitalize">{currentUser.role}</p>
            </div>
            <ChevronDown size={14} className={`text-surface-400 flex-shrink-0 transition-transform ${devOpen ? 'rotate-180' : ''}`} />
          </button>

          {devOpen && (
            <div className="mt-1 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-2 bg-surface-50 border-b border-surface-200">
                <p className="text-xs text-surface-500 font-medium">DEV — changer d'utilisateur</p>
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u.id); setDevOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-50 transition-colors ${u.id === currentUser.id ? 'bg-brand-50' : ''}`}
                >
                  <Avatar user={u} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-surface-800 truncate">{getFullName(u)}</p>
                    <p className="text-xs text-surface-500 capitalize">{u.role}</p>
                  </div>
                  {u.id === currentUser.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />}
                </button>
              ))}
              <div className="border-t border-surface-200">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-surface-500 hover:bg-surface-50 transition-colors"
                >
                  <LogOut size={12} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}
