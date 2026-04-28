import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge } from '../ui'
import { CLUB, USERS } from '../../data/mock'
import {
  CalendarDays, Shield, Users, Calendar, MessageCircle,
  ChevronLeft, ChevronRight, ChevronUp,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    to: '/app/events',
    icon: CalendarDays,
    label: 'Événements',
    roles: ['president', 'coach', 'player', 'supporter', 'parent'],
  },
  {
    to: '/app/team',
    icon: Shield,
    label: 'Équipes',
    roles: ['president', 'coach', 'player', 'supporter', 'parent'],
  },
  {
    to: '/app/members',
    icon: Users,
    label: (role) => role === 'coach' ? 'Joueurs' : 'Membres',
    roles: ['president', 'coach'],
  },
  {
    to: '/app/calendar',
    icon: Calendar,
    label: 'Calendrier',
    roles: ['president', 'coach', 'player', 'supporter', 'parent'],
  },
  {
    to: '/app/messages',
    icon: MessageCircle,
    label: 'Messagerie',
    roles: ['president', 'coach', 'player', 'supporter', 'parent'],
  },
]

export default function AppLayout() {
  const { currentUser, login } = useAuth()
  const [expanded,  setExpanded]  = useState(false)
  const [devOpen,   setDevOpen]   = useState(false)

  const visibleNav = NAV_ITEMS.filter(item =>
    item.roles.includes(currentUser?.role)
  )

  function getLabel(item) {
    return typeof item.label === 'function' ? item.label(currentUser?.role) : item.label
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside
        className={`${expanded ? 'w-56' : 'w-16'} bg-white border-r border-surface-200
                    flex flex-col transition-all duration-200 flex-shrink-0`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 p-4 h-14 border-b border-surface-100
                      ${!expanded ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
              <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
              <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
            </svg>
          </div>
          {expanded && (
            <span className="font-display font-bold text-sm text-gray-900 truncate">
              {CLUB.name}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2 overflow-hidden">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!expanded ? getLabel(item) : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150
                 ${!expanded ? 'justify-center' : ''}
                 ${isActive
                   ? 'bg-brand-50 text-brand-600'
                   : 'text-gray-400 hover:bg-surface-100 hover:text-gray-700'
                 }`
              }
            >
              <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">{getLabel(item)}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bas de sidebar : profil + dev switcher + toggle */}
        <div className="p-2 border-t border-surface-100 flex flex-col gap-1">

          {/* Avatar → /app/profile */}
          <Link
            to="/app/profile"
            className={`flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100
                        transition-colors ${!expanded ? 'justify-center' : ''}`}
          >
            <Avatar user={currentUser} size="sm" />
            {expanded && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</div>
              </div>
            )}
          </Link>

          {/* Dev switcher */}
          <div className="relative">
            <button
              onClick={() => setDevOpen(o => !o)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl
                         hover:bg-surface-100 text-xs text-gray-400 transition-colors"
            >
              {expanded
                ? <><span>Changer de rôle</span><ChevronUp size={12} className={devOpen ? '' : 'rotate-180'} /></>
                : '⚙'
              }
            </button>
            {devOpen && (
              <div className="absolute bottom-full left-0 mb-1 bg-white rounded-2xl shadow-xl
                              border border-surface-200 p-2 w-52 z-[100]">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Changer de rôle (dev)
                </div>
                {USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { login(u.id); setDevOpen(false) }}
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
            )}
          </div>

          {/* Toggle expand/collapse */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-center p-2 rounded-xl
                       hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="h-14 bg-white border-b border-surface-200 flex items-center
                     justify-between px-6 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-gray-900 text-sm">{CLUB.name}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{CLUB.sport}</span>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <RoleBadge role={currentUser.role} />
              <Link to="/app/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar user={currentUser} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </Link>
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
