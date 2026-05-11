import { useState, useEffect, useCallback } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge, Card } from '../ui'
import * as db from '../../services/db'
import { supabase } from '../../lib/supabase'
import {
  CalendarDays, Shield, Calendar, MessageCircle, Newspaper,
  ChevronLeft, ChevronRight, ChevronUp, Bell, LogOut, X, User,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app/feed',     icon: Newspaper,     label: 'Feed'       },
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements' },
  { to: '/app/team',     icon: Shield,        label: 'Équipes'    },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier' },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie' },
  { to: '/app/profile',  icon: User,          label: 'Profil'     },
]

export default function AppLayout() {
  const { currentUser, logout, devLogin } = useAuth()
  const navigate = useNavigate()

  const [expanded,     setExpanded]     = useState(false)
  const [devOpen,      setDevOpen]      = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [notifs,       setNotifs]       = useState([])
  const [unreadCount,  setUnreadCount]  = useState(0)
  const [club,         setClub]         = useState(null)
  const [devUsers,     setDevUsers]     = useState([])

  const clubId = currentUser?.current_club_id

  // Charger le club
  useEffect(() => {
    if (!clubId) return
    db.getClubById(clubId).then(setClub).catch(() => {})
  }, [clubId])

  // Charger les notifications + rafraîchir toutes les 30s
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

  // Charger les utilisateurs du club pour le dev switcher
  useEffect(() => {
    if (!clubId) return
    db.getUsersByClub(clubId).then(setDevUsers).catch(() => {})
  }, [clubId])

  // Nom affiché d'un user Supabase
  function userName(u) {
    return `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim()
  }

  // User normalisé pour Avatar (attend firstName/lastName)
  function avatarUser(u) {
    return {
      ...u,
      firstName: u?.first_name ?? u?.firstName,
      lastName:  u?.last_name  ?? u?.lastName,
    }
  }

  // ── Validation demande de membre (nouveau système : club_join_requests) ──
  async function handleApprove(notif) {
    try {
      // Essayer d'abord club_join_requests (nouveau flux)
      const { data: joinReq } = await supabase
        .from('club_join_requests')
        .select('id')
        .eq('id', notif.request_id)
        .maybeSingle()

      if (joinReq) {
        await db.approveJoinRequest(notif.request_id, currentUser.id)
        await db.markNotificationRead(notif.id)
        setNotifs(prev => prev.filter(n => n.id !== notif.id))
        setUnreadCount(c => Math.max(0, c - 1))
        return
      }

      // Fallback : ancien système (registration_requests)
      const { data: request } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('id', notif.request_id)
        .single()
      if (!request) return

      const person = await db.createPerson({
        club_id:    request.club_id,
        first_name: request.first_name,
        last_name:  request.last_name,
        birth_date: request.birth_date,
        phone:      request.phone,
      })
      const user = await db.createUser({
        person_id:      person.id,
        email:          request.email,
        password_hash:  request.password_hash,
        account_status: 'active',
      })
      await db.createUserRole({
        user_id:    user.id,
        role_type:  request.role_type,
        scope_type: 'team',
        scope_id:   request.team_id ?? request.club_id,
      })
      if (request.role_type === 'coach'  && request.team_id) await db.addCoachToTeam(request.team_id, user.id)
      if (request.role_type === 'player' && request.team_id) await db.addPlayerToTeam(request.team_id, user.id, null, null)
      await db.updateRequest(request.id, {
        status: 'approved', reviewed_by: currentUser.id, reviewed_at: new Date().toISOString(),
      })
      await db.createNotification({
        to_user_id: user.id,
        type:       'request_approved',
        title:      'Demande approuvée !',
        body:       'Votre inscription a été validée. Vous pouvez maintenant vous connecter.',
        request_id: request.id,
      })
      await db.markNotificationRead(notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur validation', err)
    }
  }

  async function handleReject(notif) {
    try {
      const { data: joinReq } = await supabase
        .from('club_join_requests')
        .select('id')
        .eq('id', notif.request_id)
        .maybeSingle()

      if (joinReq) {
        await db.rejectJoinRequest(notif.request_id, currentUser.id)
      } else {
        await db.updateRequest(notif.request_id, {
          status: 'rejected', reviewed_by: currentUser.id, reviewed_at: new Date().toISOString(),
        })
      }
      await db.markNotificationRead(notif.id)
      setNotifs(prev => prev.filter(n => n.id !== notif.id))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Erreur refus', err)
    }
  }

  // ── Validation demande d'équipe (coach → président) ───────────────────────
  async function handleApproveTeam(notif) {
    try {
      const { data: req } = await supabase
        .from('team_requests')
        .select('*')
        .eq('id', notif.team_request_id)
        .single()
      if (!req) return

      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert({
          club_id:  req.club_id,
          sport_id: club?.sport_id ?? null,
          name:     req.team_name,
          category: req.category,
          gender:   req.gender,
          season:   req.season,
          status:   'active',
        })
        .select()
        .single()
      if (teamErr) throw teamErr

      await supabase.from('team_coaches').insert({
        team_id:   team.id,
        user_id:   req.coach_id,
        season:    req.season,
        is_active: true,
      })

      await supabase.from('user_roles').upsert({
        user_id:    req.coach_id,
        role_type:  'coach',
        scope_type: 'team',
        scope_id:   team.id,
      })

      await supabase
        .from('team_requests')
        .update({
          status:      'approved',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          team_id:     team.id,
        })
        .eq('id', req.id)

      await db.createNotification({
        to_user_id: req.coach_id,
        type:       'request_approved',
        title:      'Équipe validée !',
        body:       `L'équipe "${req.team_name}" a été créée avec succès.`,
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
        .from('team_requests')
        .select('coach_id, team_name')
        .eq('id', notif.team_request_id)
        .single()

      await supabase
        .from('team_requests')
        .update({
          status:      'rejected',
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', notif.team_request_id)

      if (req) {
        await db.createNotification({
          to_user_id: req.coach_id,
          type:       'request_rejected',
          title:      'Équipe refusée',
          body:       `La proposition d'équipe "${req.team_name}" a été refusée.`,
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

  const clubName  = club?.name ?? '…'
  const clubSport = club?.sports?.name ?? ''

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`${expanded ? 'w-56' : 'w-16'} bg-white border-r border-surface-200
                    flex flex-col transition-all duration-200 flex-shrink-0`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 h-14 border-b border-surface-100 ${!expanded ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
              <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
              <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
            </svg>
          </div>
          {expanded && (
            <span className="font-display font-bold text-sm text-gray-900 truncate">{clubName}</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 p-2 overflow-hidden">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!expanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150
                 ${!expanded ? 'justify-center' : ''}
                 ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-700'}`
              }
            >
              <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bas sidebar */}
        <div className="p-2 border-t border-surface-100 flex flex-col gap-1">

          {/* Profil */}
          <Link
            to="/app/profile"
            className={`flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 transition-colors ${!expanded ? 'justify-center' : ''}`}
          >
            <Avatar user={avatarUser(currentUser)} size="sm" />
            {expanded && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-800 truncate">{userName(currentUser)}</div>
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
                              border border-surface-200 p-2 w-56 z-[100]">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Changer de rôle (dev)
                </div>
                {devUsers.map(u => {
                  const role = u.user_roles?.[0]?.role_type
                  return (
                    <button
                      key={u.id}
                      onClick={() => { devLogin(u.id); setDevOpen(false) }}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left
                                  hover:bg-surface-50 transition-colors
                                  ${currentUser?.id === u.id ? 'bg-brand-50' : ''}`}
                    >
                      <Avatar user={avatarUser(u)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800 truncate">{userName(u)}</div>
                        <div className="text-xs text-gray-400 capitalize">{role}</div>
                      </div>
                      {currentUser?.id === u.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
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

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-gray-900 text-sm">{clubName}</span>
            {clubSport && <><span className="text-gray-300">·</span><span className="text-sm text-gray-500">{clubSport}</span></>}
          </div>

          {currentUser && (
            <div className="flex items-center gap-2">

              {/* Cloche */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(o => !o)}
                  className="relative p-2 rounded-xl hover:bg-surface-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px]
                                     rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panel notifications */}
                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl
                                  border border-surface-200 z-[100] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                      <span className="font-semibold text-sm text-gray-900">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-brand-600 hover:underline"
                          >
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
                      ) : notifs.map(n => (
                        <div key={n.id} className={`p-4 ${!n.read ? 'bg-brand-50' : ''}`}>
                          <div className="font-semibold text-sm text-gray-900 mb-0.5">{n.title}</div>
                          <div className="text-xs text-gray-500">{n.body}</div>

                          {/* Demande de membre (ancien + nouveau système) */}
                          {n.type === 'registration_request' && n.request_id && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleApprove(n)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium"
                              >
                                ✓ Valider
                              </button>
                              <button
                                onClick={() => handleReject(n)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium"
                              >
                                ✗ Refuser
                              </button>
                            </div>
                          )}

                          {/* Demande de création d'équipe (coach → président) */}
                          {n.type === 'team_request' && n.team_request_id && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleApproveTeam(n)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium"
                              >
                                ✓ Créer l'équipe
                              </button>
                              <button
                                onClick={() => handleRejectTeam(n)}
                                className="flex-1 text-xs py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-medium"
                              >
                                ✗ Refuser
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <RoleBadge role={currentUser.role} />

              <Link to="/app/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar user={avatarUser(currentUser)} size="sm" />
                <span className="text-sm font-medium text-gray-700">{userName(currentUser)}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2 rounded-xl hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
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
