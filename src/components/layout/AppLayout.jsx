import React, { useState, useEffect, useCallback } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge } from '../ui'
import * as db from '../../services/db'
import { supabase } from '../../lib/supabase'
import { getClubById as getMockClubById } from '../../data/mock'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Shield, Calendar, MessageCircle, Newspaper,
  Bell, LogOut, X, User, Mail,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app/feed',        icon: Newspaper,     label: 'Feed'         },
  { to: '/app/team',        icon: Shield,        label: 'Équipes'      },
  { to: '/app/calendar',    icon: Calendar,      label: 'Calendrier'   },
  { to: '/app/messages',    icon: MessageCircle, label: 'Messagerie'   },
  { to: '/app/invitations', icon: Mail,          label: 'Invitations'  },
  { to: '/app/profile',     icon: User,          label: 'Profil'       },
]

const PRESIDENT_NAV = { to: '/app/mon-club', label: '🏢 Mon club' }

// ── Mobile Bottom Navigation ─────────────────────────────────────────────────
function MobileBottomNav({ currentUser, switchRole, pendingInvitationCount }) {
  const location = useLocation()
  const navigate = useNavigate()

  const baseTabs = [
    { to: '/app/feed',        icon: Newspaper,     label: 'Feed'       },
    { to: '/app/team',        icon: Shield,        label: 'Équipes'    },
    { to: '/app/calendar',    icon: Calendar,      label: 'Agenda'     },
    { to: '/app/messages',    icon: MessageCircle, label: 'Messages'   },
    { to: '/app/invitations', icon: Mail,          label: 'Invitations', badge: pendingInvitationCount },
    { to: '/app/profile',     icon: User,          label: 'Profil'     },
  ]

  const tabs = (currentUser?.role === 'president' || currentUser?.role === 'staff')
    ? [baseTabs[0], { to: '/app/mon-club', label: 'Mon club', emoji: '🏢' }, ...baseTabs.slice(1)]
    : baseTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 md:hidden z-40 pb-safe">
      <div className="flex">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.to)
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className={`relative flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              {tab.emoji ? (
                <span className="text-lg leading-none">{tab.emoji}</span>
              ) : (
                <span className="relative">
                  <tab.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white
                                     text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </span>
              )}
              <span className="text-[9px] font-medium">{tab.label}</span>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-full" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function AppLayout() {
  const { currentUser, logout, switchRole, getPendingInvitations } = useAuth()
  const pendingInvitationCount = getPendingInvitations ? getPendingInvitations(currentUser?.id).length : 0
  const navigate = useNavigate()

  const [notifOpen,   setNotifOpen]   = useState(false)
  const [notifs,      setNotifs]      = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [club,        setClub]        = useState(null)

  const clubId = currentUser?.current_club_id

  // Charger le club (mock d'abord, Supabase en fallback)
  useEffect(() => {
    if (!clubId) { setClub(null); return }
    const mockClub = getMockClubById(clubId)
    if (mockClub) { setClub(mockClub); return }
    db.getClubById(clubId).then(setClub).catch(() => {})
  }, [clubId])

  // Charger les notifications
  const loadNotifs = useCallback(async () => {
    if (!currentUser) return
    try {
      const [count, list] = await Promise.all([
        db.getUnreadCount(currentUser.id),
        db.getNotifications(currentUser.id),
      ])
      setUnreadCount(count)
      setNotifs(list)
    } catch {}
  }, [currentUser])

  useEffect(() => {
    loadNotifs()
    const interval = setInterval(loadNotifs, 30000)
    return () => clearInterval(interval)
  }, [loadNotifs])

  // ── Validation demande de membre ──────────────────────────────────────────
  const handleApproveRequest = async (notif) => {
    try {
      const { data: req, error: reqErr } = await supabase
        .from('club_join_requests')
        .select('*')
        .eq('id', notif.request_id)
        .single()

      if (reqErr || !req) return

      let teamId = req.team_id
      if (req.role_type === 'coach' && !teamId && req.new_team_name) {
        const { data: clubData } = await supabase
          .from('clubs').select('sport_id').eq('id', req.club_id).single()

        const now  = new Date()
        const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
        const { data: newTeam } = await supabase.from('teams').insert({
          club_id: req.club_id, sport_id: clubData?.sport_id,
          name: req.new_team_name, category: null, gender: 'mixed',
          season: `${year}-${year + 1}`, status: 'active',
        }).select().single()
        teamId = newTeam?.id
      }

      await supabase.from('users').update({ current_club_id: req.club_id }).eq('id', req.user_id)
      await supabase.from('user_roles').insert({
        user_id: req.user_id, role_type: req.role_type,
        scope_type: teamId ? 'team' : 'club', scope_id: teamId ?? req.club_id,
      })

      if (teamId && req.role_type === 'coach') {
        const now = new Date()
        const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
        await supabase.from('team_coaches').insert({
          team_id: teamId, user_id: req.user_id,
          season: `${year}-${year + 1}`, is_active: true,
        })
      }
      if (teamId && req.role_type === 'player') {
        const now = new Date()
        const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
        await supabase.from('team_players').insert({
          team_id: teamId, user_id: req.user_id,
          season: `${year}-${year + 1}`, is_active: true,
        })
      }

      await supabase.from('club_join_requests').update({
        status: 'approved', reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', req.id)

      await supabase.from('notifications').insert({
        to_user_id: req.user_id, type: 'request_approved',
        title: 'Demande acceptée !',
        body: teamId
          ? 'Vous avez rejoint le club et votre équipe.'
          : 'Votre demande a été acceptée.',
        request_id: req.id,
      })

      await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur approbation:', err)
    }
  }

  const handleRejectRequest = async (notif) => {
    try {
      const { data: req } = await supabase
        .from('club_join_requests').select('user_id').eq('id', notif.request_id).single()

      await supabase.from('club_join_requests').update({
        status: 'rejected', reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', notif.request_id)

      if (req?.user_id) {
        await supabase.from('notifications').insert({
          to_user_id: req.user_id, type: 'request_rejected',
          title: 'Demande refusée',
          body: "Votre demande d'adhésion n'a pas été acceptée.",
          request_id: notif.request_id,
        })
      }

      await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur refus:', err)
    }
  }

  async function handleApproveTeam(notif) {
    try {
      const { data: req } = await supabase
        .from('team_requests').select('*').eq('id', notif.team_request_id).single()
      if (!req) return

      const { data: team, error: teamErr } = await supabase.from('teams').insert({
        club_id: req.club_id, sport_id: club?.sport_id ?? null,
        name: req.team_name, category: req.category,
        gender: req.gender, season: req.season, status: 'active',
      }).select().single()
      if (teamErr) throw teamErr

      await supabase.from('team_coaches').insert({
        team_id: team.id, user_id: req.coach_id, season: req.season, is_active: true,
      })
      await supabase.from('user_roles').upsert({
        user_id: req.coach_id, role_type: 'coach', scope_type: 'team', scope_id: team.id,
      })
      await supabase.from('team_requests').update({
        status: 'approved', reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(), team_id: team.id,
      }).eq('id', req.id)
      await db.createNotification({
        to_user_id: req.coach_id, type: 'request_approved',
        title: 'Équipe validée !',
        body: `L'équipe "${req.team_name}" a été créée avec succès.`,
      })
      await db.markNotificationRead(notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur validation équipe', err)
    }
  }

  async function handleRejectTeam(notif) {
    try {
      const { data: req } = await supabase
        .from('team_requests').select('coach_id, team_name').eq('id', notif.team_request_id).single()
      await supabase.from('team_requests').update({
        status: 'rejected', reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', notif.team_request_id)

      if (req) {
        await db.createNotification({
          to_user_id: req.coach_id, type: 'request_rejected',
          title: 'Équipe refusée',
          body: `La proposition d'équipe "${req.team_name}" a été refusée.`,
        })
      }
      await db.markNotificationRead(notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur refus équipe', err)
    }
  }

  async function handleMarkAllRead() {
    try {
      await db.markAllNotificationsRead(currentUser.id)
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function userName(u) {
    return `${u?.first_name ?? u?.firstName ?? ''} ${u?.last_name ?? u?.lastName ?? ''}`.trim()
  }
  function avatarUser(u) {
    return { ...u, firstName: u?.first_name ?? u?.firstName, lastName: u?.last_name ?? u?.lastName }
  }


  return (
    <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-surface-200 flex-shrink-0 z-20">

        {/* Ligne haute : logo + club + user actions */}
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          {/* Logo */}
          <Link to="/app/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
                <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
                <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
              </svg>
            </div>
            <span className="text-base font-semibold" style={{ color: '#0066cc' }}>ClubManager</span>
          </Link>

          {/* Actions utilisateur */}
          {currentUser && (
            <div className="flex items-center gap-2">
              {/* Cloche */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="relative p-2 rounded-xl hover:bg-surface-100
                             text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white
                                     text-[9px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panel notifications */}
                {notifOpen && (
                  <div className="fixed md:absolute inset-x-0 md:inset-x-auto top-14 md:top-full right-0 md:mt-2
                                  md:w-80 bg-white md:rounded-2xl shadow-xl border border-surface-200 z-[100] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                      <span className="font-semibold text-sm text-gray-900">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-brand-600 hover:underline">
                            Tout marquer lu
                          </button>
                        )}
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="p-1 rounded-lg hover:bg-surface-100 text-gray-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-surface-100">
                      {notifs.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Aucune notification</p>
                      ) : notifs.map(notif => (
                        <div key={notif.id}
                          className={`p-4 ${!notif.read ? 'bg-brand-50' : ''}`}>
                          <div className="font-semibold text-sm text-gray-900 mb-0.5">{notif.title}</div>
                          <div className="text-xs text-gray-500 mb-2">{notif.body}</div>

                          {notif.type === 'registration_request' && notif.request_id && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleApproveRequest(notif)}
                                className="flex-1 text-xs py-2 rounded-xl bg-emerald-100
                                           text-emerald-700 font-medium hover:bg-emerald-200">
                                ✓ Accepter
                              </button>
                              <button onClick={() => handleRejectRequest(notif)}
                                className="flex-1 text-xs py-2 rounded-xl bg-red-100
                                           text-red-600 font-medium hover:bg-red-200">
                                ✗ Refuser
                              </button>
                            </div>
                          )}

                          {notif.type === 'team_request' && notif.team_request_id && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleApproveTeam(notif)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-100
                                           text-emerald-700 hover:bg-emerald-200 font-medium">
                                ✓ Créer l'équipe
                              </button>
                              <button onClick={() => handleRejectTeam(notif)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-red-100
                                           text-red-600 hover:bg-red-200 font-medium">
                                ✗ Refuser
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] text-gray-300 mt-1">
                            {notif.created_at && format(new Date(notif.created_at), "d MMM · HH'h'mm", { locale: fr })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/app/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar user={avatarUser(currentUser)} size="sm" />
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {userName(currentUser)}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2 rounded-xl hover:bg-surface-100 text-gray-400
                           hover:text-gray-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Ligne basse : navigation */}
        <nav className="hidden md:flex items-center gap-1 px-4 overflow-x-auto border-t border-surface-100">
          {NAV_ITEMS.map((item, i) => (
            <React.Fragment key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px
                   whitespace-nowrap transition-colors
                   ${isActive
                     ? 'border-brand-600 text-brand-600'
                     : 'border-transparent text-gray-400 hover:text-gray-700'
                   }`
                }
              >
                <span className="relative">
                  <item.icon size={16} strokeWidth={1.8} />
                  {item.to === '/app/invitations' && pendingInvitationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white
                                     text-[8px] rounded-full flex items-center justify-center font-bold leading-none">
                      {pendingInvitationCount > 9 ? '9+' : pendingInvitationCount}
                    </span>
                  )}
                </span>
                {item.label}
              </NavLink>
              {i === 0 && (currentUser?.role === 'president' || currentUser?.role === 'staff') && (
                <NavLink
                  to={PRESIDENT_NAV.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px
                     whitespace-nowrap transition-colors
                     ${isActive
                       ? 'border-brand-600 text-brand-600'
                       : 'border-transparent text-gray-400 hover:text-gray-700'
                     }`
                  }
                >
                  {PRESIDENT_NAV.label}
                </NavLink>
              )}
            </React.Fragment>
          ))}
        </nav>
      </header>

      {/* ── CONTENU ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-nav-safe md:pb-0">
        <Outlet />
      </main>

      {/* ── Dev role switcher ────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-2 md:bottom-4 md:right-4 bg-white rounded-2xl shadow-lg
                      border border-surface-200 p-1.5 md:p-2 flex items-center gap-1 md:gap-1.5 z-50
                      max-w-[calc(100vw-1rem)] overflow-x-auto">
        <span className="text-[10px] text-gray-400 font-medium pl-0.5 pr-0.5 hidden md:inline">DEV</span>
        {[
          { key: 'president', label: 'Président',  icon: '👔' },
          { key: 'staff',     label: 'Intendant',  icon: '🏥' },
          { key: 'coach',     label: 'Coach',      icon: '📋' },
          { key: 'player',    label: 'Joueur',     icon: '⚽' },
          { key: 'community', label: 'Communauté', icon: '👥' },
        ].map(({ key, label, icon }) => {
          const active = currentUser?.role === key
          return (
            <button
              key={key}
              onClick={() => switchRole(key)}
              title={label}
              className={`px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-xl text-xs font-medium transition-colors ${
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:bg-surface-100'
              }`}
            >
              {icon} <span className="hidden md:inline">{label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────────────────────────────── */}
      <MobileBottomNav currentUser={currentUser} pendingInvitationCount={pendingInvitationCount} />
    </div>
  )
}
