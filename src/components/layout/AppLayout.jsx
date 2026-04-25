import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge } from '../ui'
import { CLUB, USERS } from '../../data/mock'
import {
  CalendarDays, Shield, Users, Calendar, MessageCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,   label: 'Événements', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,         label: 'Équipe',     roles: ['president','coach','player'] },
  { to: '/app/members',  icon: Users,          label: 'Membres',    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/calendar', icon: Calendar,       label: 'Calendrier', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle,  label: 'Messagerie', roles: ['president','coach','player','parent'] },
]

export default function AppLayout() {
  const { currentUser, switchUser } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(currentUser?.role))

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`${expanded ? 'w-56' : 'w-16'} bg-white border-r border-surface-200
                         flex flex-col transition-all duration-200 flex-shrink-0`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-surface-100 h-14
                         ${!expanded ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            {/* Icône football */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 6.32 2.26L12 8.5 5.68 4.26A10 10 0 0 1 12 2z" fill="white" fillOpacity=".3" />
              <path d="M2.46 8.26L7.5 11l-1 5.5H4a10 10 0 0 1-1.54-8.24z" fill="white" fillOpacity=".1" />
              <path d="M21.54 8.26A10 10 0 0 1 20 16.5h-2.5L16.5 11l5.04-2.74z" fill="white" fillOpacity=".1" />
              <path d="M6.5 22a10 10 0 0 1-2.5-5.5H6.5L9 21.5a10 10 0 0 1-2.5.5z" fill="white" fillOpacity=".1" />
              <path d="M17.5 22a10 10 0 0 1-2.5.5L17 17h2.5A10 10 0 0 1 17.5 22z" fill="white" fillOpacity=".1" />
              <path d="M12 8.5l2.5 7.5h-5L12 8.5z" fill="white" fillOpacity=".3" />
            </svg>
          </div>
          {expanded && (
            <span className="font-display font-bold text-sm text-gray-900 truncate">
              {CLUB.name}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150
                 ${!expanded ? 'justify-center' : ''}
                 ${isActive
                   ? 'bg-brand-50 text-brand-600'
                   : 'text-gray-400 hover:bg-surface-100 hover:text-gray-700'
                 }`
              }
              title={!expanded ? item.label : undefined}
            >
              <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
              {expanded && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + toggle */}
        <div className="p-2 border-t border-surface-100 flex flex-col gap-1">

          {/* Dev role switcher */}
          <div className="relative group">
            <button
              className={`w-full flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100
                          transition-colors ${!expanded ? 'justify-center' : ''}`}
            >
              <Avatar user={currentUser} size="sm" />
              {expanded && (
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-semibold text-gray-800 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</div>
                </div>
              )}
            </button>

            {/* Dropdown */}
            <div className="absolute bottom-full left-0 mb-1 bg-white rounded-2xl shadow-xl
                            border border-surface-200 p-2 w-52 hidden group-hover:block z-50">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                Changer de rôle (dev)
              </div>
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left
                               hover:bg-surface-50 transition-colors
                               ${currentUser?.id === u.id ? 'bg-brand-50' : ''}`}
                >
                  <Avatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{u.role}</div>
                  </div>
                  {currentUser?.id === u.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className={`flex items-center justify-center p-2 rounded-xl hover:bg-surface-100
                        text-gray-400 hover:text-gray-600 transition-all
                        ${expanded ? 'self-end w-8 h-8' : 'w-full'}`}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-surface-200 flex items-center
                           justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-gray-900 text-sm">{CLUB.name}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{CLUB.sport}</span>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <RoleBadge role={currentUser.role} />
              <Avatar user={currentUser} size="sm" />
              <span className="text-sm font-medium text-gray-700">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
