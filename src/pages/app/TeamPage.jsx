import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, RoleBadge } from '../../components/ui'
import { format, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, MapPin, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  getMyTeams,
  followTeam, unfollowTeam, getFollowedTeams,
  followClub, unfollowClub, getFollowedClubs,
  leaveTeam, getNextMatch, getNextTraining,
  createJoinRequest, notifyForJoinRequest,
} from '../../services/db'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentSeasonName() {
  const now  = new Date()
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${year}-${year + 1}`
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { currentUser, is } = useAuth()

  // ── Onglets ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('my_teams')

  // ── Mes équipes ────────────────────────────────────────────────────────────
  const [myTeams,        setMyTeams]        = useState([])
  const [myTeamsLoading, setMyTeamsLoading] = useState(true)
  const [nextMatches,    setNextMatches]    = useState({}) // teamId → match
  const [nextTrainings,  setNextTrainings]  = useState({}) // teamId → training

  // ── Suivis ─────────────────────────────────────────────────────────────────
  const [followedTeams,   setFollowedTeams]   = useState(new Set())
  const [followedClubIds, setFollowedClubIds] = useState(new Set())

  // ── Explorer ───────────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('')
  const [allClubs,        setAllClubs]        = useState([])
  const [allClubsLoading, setAllClubsLoading] = useState(false)
  const [allKnownTeams,   setAllKnownTeams]   = useState([]) // pour lookup des favoris
  // Filtres géographiques
  const [allDeps,      setAllDeps]      = useState([])
  const [allRegs,      setAllRegs]      = useState([])
  const [depFilter,    setDepFilter]    = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  // Profil club en drawer
  const [selectedClubProfile, setSelectedClubProfile] = useState(null)

  // ── Modale rejoindre équipe ────────────────────────────────────────────────
  const [showJoinModal,   setShowJoinModal]   = useState(false)
  const [joinTeam,        setJoinTeam]        = useState(null)
  const [joinClub,        setJoinClub]        = useState(null)
  const [joinRole,        setJoinRole]        = useState('player')
  const [selectedTeamId,  setSelectedTeamId]  = useState('')
  const [joinMessage,   setJoinMessage]   = useState('')
  const [joinLoading,   setJoinLoading]   = useState(false)
  const [joinError,     setJoinError]     = useState('')
  const [joinSuccess,   setJoinSuccess]   = useState(false)

  // ── Modale quitter équipe ──────────────────────────────────────────────────
  const [showLeaveTeam, setShowLeaveTeam] = useState(null)
  const [leaveLoading,  setLeaveLoading]  = useState(false)

  // ── Créer équipe (président) ───────────────────────────────────────────────
  const [showCreateTeam,    setShowCreateTeam]    = useState(false)
  const [presTeamName,      setPresTeamName]      = useState('')
  const [presTeamGender,    setPresTeamGender]    = useState('mixed')
  const [createTeamLoading, setCreateTeamLoading] = useState(false)

  // ── Mode coach dans modal rejoindre ────────────────────────────────────────
  const [joinMode,       setJoinMode]       = useState('existing') // 'existing' | 'new'
  const [newJoinTeamName,setNewJoinTeamName]= useState('')

  // ── Rechargement équipes du club (pour président) ─────────────────────────
  const refreshTeams = async () => {
    const { data } = await supabase
      .from('teams')
      .select('*, clubs(name, sport_id)')
      .eq('club_id', currentUser.current_club_id)
      .eq('status', 'active')
      .order('name')
    setMyTeams(data ?? [])
  }

  // Pour le président : charger les équipes du club au montage
  useEffect(() => {
    if (!currentUser.current_club_id || !is('president')) return
    refreshTeams()
  }, [currentUser.current_club_id])

  // ── Chargement initial ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return
    Promise.all([
      getMyTeams(currentUser.id),
      getFollowedTeams(currentUser.id),
      getFollowedClubs(currentUser.id),
    ])
      .then(async ([teams, favTeams, favClubs]) => {
        setFollowedTeams(favTeams)
        setFollowedClubIds(new Set(favClubs.map(c => c.id)))
        setMyTeams(teams)
        if (teams.length > 0) {
          const [matchEntries, trainingEntries] = await Promise.all([
            Promise.all(teams.map(t => getNextMatch(t.id).then(m  => [t.id, m]))),
            Promise.all(teams.map(t => getNextTraining(t.id).then(tr => [t.id, tr]))),
          ])
          setNextMatches(Object.fromEntries(matchEntries))
          setNextTrainings(Object.fromEntries(trainingEntries))
        }
      })
      .catch(() => {})
      .finally(() => setMyTeamsLoading(false))
  }, [currentUser?.id])

  // ── Charger régions, départements et clubs au montage ────────────────────
  useEffect(() => {
    setAllClubsLoading(true)
    const load = async () => {
      const { data: postal } = await supabase
        .from('fr_postal_codes')
        .select('departement, code_dep, region')
        .order('region')

      if (postal) {
        const regs = [...new Set(postal.map(d => d.region))].sort()
        setAllRegs(regs)

        const deps = [...new Map(
          postal.map(d => [d.code_dep, { departement: d.departement, code_dep: d.code_dep, region: d.region }])
        ).values()].sort((a, b) => a.departement.localeCompare(b.departement))
        setAllDeps(deps)
      }

      const { data: clubs } = await supabase
        .from('clubs')
        .select('*, sports(name), teams(id, name, category, status)')
        .eq('status', 'active')
        .order('name')

      const clubList = clubs ?? []
      setAllClubs(clubList)
      const teams = clubList.flatMap(c =>
        (c.teams ?? []).map(t => ({ ...t, club_id: c.id }))
      )
      setAllKnownTeams(prev => {
        const ids = new Set(prev.map(t => t.id))
        return [...prev, ...teams.filter(t => !ids.has(t.id))]
      })

      setAllClubsLoading(false)
    }
    load().catch(() => setAllClubsLoading(false))
  }, [])

  // ── Filtrage client-side des clubs ─────────────────────────────────────────
  const filteredDeps = useMemo(() =>
    regionFilter ? allDeps.filter(d => d.region === regionFilter) : allDeps
  , [allDeps, regionFilter])

  const filteredClubs = useMemo(() => allClubs.filter(club => {
    const matchDep    = !depFilter    || club.department === depFilter
    const matchRegion = !regionFilter || club.region     === regionFilter
    const matchText   = !search       ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.city?.toLowerCase().includes(search.toLowerCase())
    return matchDep && matchRegion && matchText
  }), [allClubs, depFilter, regionFilter, search])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function isAlreadyInTeam(teamId) {
    return myTeams.some(t => t.id === teamId)
  }
  function isAlreadyInClub(clubId) {
    return currentUser.current_club_id === clubId
  }

  // ── Follow / unfollow club ─────────────────────────────────────────────────
  async function handleFollowClub(clubId) {
    try {
      if (followedClubIds.has(clubId)) {
        await unfollowClub(currentUser.id, clubId)
        setFollowedClubIds(prev => { const s = new Set(prev); s.delete(clubId); return s })
      } else {
        await followClub(currentUser.id, clubId)
        setFollowedClubIds(prev => new Set([...prev, clubId]))
      }
    } catch {}
  }

  // ── Follow / unfollow équipe ───────────────────────────────────────────────
  async function handleFollowTeam(teamId) {
    try {
      if (followedTeams.has(teamId)) {
        await unfollowTeam(currentUser.id, teamId)
        setFollowedTeams(prev => { const s = new Set(prev); s.delete(teamId); return s })
      } else {
        await followTeam(currentUser.id, teamId)
        setFollowedTeams(prev => new Set([...prev, teamId]))
      }
    } catch {}
  }

  // ── Ouvrir modale rejoindre (depuis bouton par équipe) ────────────────────
  function handleJoinTeam(team, club) {
    setJoinClub(club)
    setJoinTeam(team)
    setSelectedTeamId(team.id)
    setJoinRole('player')
    setJoinMode('existing')
    setNewJoinTeamName('')
    setJoinMessage('')
    setJoinError('')
    setJoinSuccess(false)
    setShowJoinModal(true)
  }

  // ── Ouvrir modale rejoindre (depuis bouton au niveau du club) ─────────────
  function handleJoinClub(club) {
    setJoinClub(club)
    setJoinTeam(null)
    setSelectedTeamId('')
    setJoinRole('player')
    setJoinMode('existing')
    setNewJoinTeamName('')
    setJoinMessage('')
    setJoinError('')
    setJoinSuccess(false)
    setShowJoinModal(true)
  }

  // ── Envoyer demande d'intégration ─────────────────────────────────────────
  async function handleSubmitJoin() {
    setJoinError('')
    if (joinRole === 'coach' && joinMode === 'new' && !newJoinTeamName.trim()) {
      return setJoinError("Saisissez le nom de l'équipe")
    }
    setJoinLoading(true)
    const isCoachNewTeam = joinRole === 'coach' && joinMode === 'new'
    try {
      await createJoinRequest({
        user_id:       currentUser.id,
        club_id:       joinClub.id,
        team_id:       isCoachNewTeam ? null : (selectedTeamId || null),
        role_type:     joinRole,
        status:        'pending',
        season:        getCurrentSeasonName(),
        message:       joinMessage || null,
        new_team_name: isCoachNewTeam ? newJoinTeamName.trim() : null,
        new_team_cat:  null,
      })
      await notifyForJoinRequest(
        joinRole,
        joinClub,
        isCoachNewTeam ? null : (selectedTeamId || null),
        {
          first_name: currentUser.firstName ?? currentUser.first_name ?? '',
          last_name:  currentUser.lastName  ?? currentUser.last_name  ?? '',
        },
        isCoachNewTeam ? { name: newJoinTeamName.trim() } : null,
      )
      setJoinSuccess(true)
    } catch (err) {
      setJoinError(err.message ?? 'Une erreur est survenue')
    } finally {
      setJoinLoading(false)
    }
  }

  // ── Quitter une équipe ─────────────────────────────────────────────────────
  async function handleLeaveTeam(teamId) {
    setLeaveLoading(true)
    try {
      await leaveTeam(currentUser.id, teamId)
      setMyTeams(prev => prev.filter(t => t.id !== teamId))
      setShowLeaveTeam(null)
    } catch {}
    finally { setLeaveLoading(false) }
  }

  // ── Créer équipe directement (président) ──────────────────────────────────
  async function handlePresidentCreateTeam() {
    if (!presTeamName.trim()) return
    setCreateTeamLoading(true)
    try {
      const { data: clubData } = await supabase
        .from('clubs').select('sport_id').eq('id', currentUser.current_club_id).single()
      await supabase.from('teams').insert({
        club_id:  currentUser.current_club_id,
        sport_id: clubData?.sport_id ?? null,
        name:     presTeamName.trim(),
        category: null,
        gender:   presTeamGender,
        season:   getCurrentSeasonName(),
        status:   'active',
      })
      setShowCreateTeam(false)
      setPresTeamName('')
      setPresTeamGender('mixed')
      await refreshTeams()
    } catch (err) {
      console.error('Erreur création équipe', err)
    } finally {
      setCreateTeamLoading(false)
    }
  }

  // ── Loader ─────────────────────────────────────────────────────────────────
  if (myTeamsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-surface-900">Équipes</h1>
      </div>

      {/* ── Onglets ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {[
          { id: 'my_teams', label: 'Mes équipes' },
          { id: 'explore',  label: 'Explorer'    },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Onglet Mes équipes ───────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'my_teams' && (
        myTeams.length === 0 ? (
          is('president') ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-5xl">⚽</div>
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
                  Aucune équipe pour l'instant
                </h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  Les coachs peuvent proposer des équipes depuis leur interface,
                  ou vous pouvez en créer une directement.
                </p>
              </div>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white
                           rounded-xl text-sm font-medium transition-colors"
              >
                + Créer une équipe
              </button>
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="text-6xl">⚽</div>
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
                Vous n'êtes dans aucune équipe
              </h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Rejoignez une équipe pour accéder aux entraînements,
                matchs et à la messagerie d'équipe.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white
                           rounded-xl text-sm font-medium transition-colors"
              >
                Intégrer une équipe
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-white border border-surface-200 hover:bg-surface-50
                           text-surface-700 rounded-xl text-sm font-medium transition-colors"
              >
                Suivre un club
              </button>
            </div>
          </div>
          )
        ) : (
          <div className="space-y-4">
            {myTeams.map(team => {
              const role      = team._role
              const isPlayer  = role === 'player'
              const nMatch    = nextMatches[team.id]
              const nTraining = nextTrainings[team.id]
              return (
                <Card key={team.id} className="p-5">

                  {/* Header équipe */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-500">
                        {team.clubs?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={role} />
                      <button
                        onClick={() => setShowLeaveTeam(team.id)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1
                                   rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Quitter
                      </button>
                    </div>
                  </div>

                  {/* Prochain match */}
                  {nMatch && (
                    <div className="bg-surface-50 rounded-xl p-3 mb-3">
                      <div className="text-xs text-gray-400 mb-1">Prochain match</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">
                          vs {nMatch.opponent_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(nMatch.scheduled_at), "d MMM · HH'h'mm", { locale: fr })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={11} />
                        {nMatch.location}
                        {' · '}{nMatch.is_home ? 'Domicile' : 'Déplacement'}
                      </div>
                      {isPlayer && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 text-xs py-2 rounded-xl bg-emerald-50
                                             text-emerald-700 border border-emerald-200
                                             hover:bg-emerald-100 transition-colors">
                            ✓ Disponible
                          </button>
                          <button className="flex-1 text-xs py-2 rounded-xl bg-red-50
                                             text-red-600 border border-red-200
                                             hover:bg-red-100 transition-colors">
                            ✗ Indisponible
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prochain entraînement */}
                  {nTraining && (
                    <div className="bg-surface-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-1">Prochain entraînement</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">
                          {format(new Date(nTraining.scheduled_at), "EEE d MMM · HH'h'mm", { locale: fr })}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={11} />
                          {nTraining.location}
                        </span>
                      </div>
                      {isPlayer && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 text-xs py-2 rounded-xl bg-emerald-50
                                             text-emerald-700 border border-emerald-200
                                             hover:bg-emerald-100 transition-colors">
                            ✓ Présent
                          </button>
                          <button className="flex-1 text-xs py-2 rounded-xl bg-red-50
                                             text-red-600 border border-red-200
                                             hover:bg-red-100 transition-colors">
                            ✗ Absent
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!nMatch && !nTraining && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      Aucun événement prévu pour le moment.
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Onglet Explorer ──────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'explore' && (
        <div className="space-y-8">

          {/* Section recherche */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Rechercher un club</h3>

            {/* Filtres géographiques */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1">Région</label>
                <select
                  value={regionFilter}
                  onChange={e => { setRegionFilter(e.target.value); setDepFilter('') }}
                  className="w-full bg-surface-50 border border-surface-200
                             rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 focus:border-brand-400"
                >
                  <option value="">Toutes les régions</option>
                  {allRegs.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1">Département</label>
                <select
                  value={depFilter}
                  onChange={e => setDepFilter(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200
                             rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 focus:border-brand-400"
                >
                  <option value="">Tous les départements</option>
                  {filteredDeps.map(d => (
                    <option key={d.code_dep} value={d.departement}>{d.departement}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1">Nom ou ville</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un club..."
                    className="w-full pl-9 pr-9 py-2 bg-surface-50 border border-surface-200
                               rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300
                               focus:border-brand-400 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Spinner */}
            {allClubsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600
                                rounded-full animate-spin" />
              </div>
            )}

            {/* Résultats */}
            {!allClubsLoading && filteredClubs.map(club => (
              <Card key={club.id} className="p-4 mb-3">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-gray-900">{club.name}</div>
                    <div className="text-sm text-gray-500">
                      {club.sports?.name}
                      {club.city && ` · ${club.city}`}
                    </div>
                    {(club.department || club.region) && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {club.department && `${club.department} — `}{club.region}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedClubProfile(club)}
                      className="text-sm px-3 py-1.5 rounded-full border border-surface-200
                                 bg-white text-gray-600 hover:border-brand-300 transition-all"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => handleFollowClub(club.id)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        followedClubIds.has(club.id)
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                      }`}
                    >
                      {followedClubIds.has(club.id) ? '♥ Suivi' : '+ Suivre'}
                    </button>
                  </div>
                </div>

                {/* Équipes du club */}
                {(club.teams ?? []).filter(t => t.status === 'active').length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Équipes
                    </div>
                    <div className="space-y-2">
                      {club.teams.filter(t => t.status === 'active').map(team => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-2
                                     bg-surface-50 rounded-xl"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {team.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFollowTeam(team.id)}
                              className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                                followedTeams.has(team.id)
                                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                                  : 'text-gray-500 border-surface-200 hover:border-orange-300'
                              }`}
                            >
                              {followedTeams.has(team.id) ? '★ Favori' : '☆ Suivre'}
                            </button>
                            {isAlreadyInTeam(team.id) ? (
                              <span className="text-xs text-emerald-600 font-medium">✓ Membre</span>
                            ) : (
                              <button
                                onClick={() => handleJoinTeam(team, club)}
                                className="text-xs px-2 py-1 rounded-lg bg-brand-600
                                           text-white hover:bg-brand-700 transition-all"
                              >
                                Intégrer
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton Intégrer une équipe (niveau club) */}
                {!isAlreadyInClub(club.id) && (
                  <button
                    onClick={() => handleJoinClub(club)}
                    className="mt-3 w-full py-2 border-2 border-dashed border-surface-300
                               rounded-xl text-sm text-gray-500 hover:border-brand-400
                               hover:text-brand-600 transition-all"
                  >
                    + Intégrer une équipe
                  </button>
                )}
              </Card>
            ))}

            {/* Aucun résultat */}
            {!allClubsLoading && filteredClubs.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                {regionFilter || depFilter || search
                  ? 'Aucun club trouvé pour ces critères'
                  : 'Sélectionnez une région ou tapez un nom'}
              </div>
            )}
          </div>

          {/* Section équipes favorites */}
          {followedTeams.size > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Mes équipes favorites</h3>
              <div className="space-y-3">
                {Array.from(followedTeams).map(teamId => {
                  const team = allKnownTeams.find(t => t.id === teamId)
                  if (!team) return null
                  return (
                    <Card key={teamId} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{team.name}</div>
                      </div>
                      <button
                        onClick={() => handleFollowTeam(teamId)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Retirer
                      </button>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Modale Intégrer une équipe ───────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showJoinModal && joinClub && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            {joinSuccess ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="font-display text-xl font-bold mb-2">Demande envoyée !</h2>
                <p className="text-sm text-gray-500 mb-5">
                  {joinRole === 'player'
                    ? "Le coach de l'équipe va valider votre demande."
                    : 'Le président du club va valider votre demande.'}
                </p>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white
                             rounded-xl text-sm font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl font-bold mb-1">
                  Rejoindre {joinClub.name}
                </h2>
                {joinClub.sports?.name && (
                  <p className="text-sm text-gray-500 mb-4">{joinClub.sports.name}</p>
                )}

                {/* Sélection équipe / création */}
                <div className="mb-4">
                  {/* Toggle coach */}
                  {joinRole === 'coach' && (
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setJoinMode('existing')}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                          joinMode === 'existing'
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-gray-600 border-surface-200 hover:border-surface-300'
                        }`}
                      >
                        Rejoindre une équipe
                      </button>
                      <button
                        type="button"
                        onClick={() => setJoinMode('new')}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                          joinMode === 'new'
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-gray-600 border-surface-200 hover:border-surface-300'
                        }`}
                      >
                        Créer une équipe
                      </button>
                    </div>
                  )}

                  {/* Mode existant (toujours visible pour joueur, visible quand 'existing' pour coach) */}
                  {(joinRole === 'player' || joinMode === 'existing') && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {joinRole === 'player' ? 'Équipe *' : 'Équipe existante (optionnel)'}
                      </label>
                      {(joinClub.teams ?? []).filter(t => t.status === 'active').length > 0 ? (
                        <select
                          value={selectedTeamId}
                          onChange={e => setSelectedTeamId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200
                                     rounded-xl text-sm focus:outline-none focus:ring-2
                                     focus:ring-brand-300 focus:border-brand-400"
                        >
                          <option value="">Choisir une équipe…</option>
                          {joinClub.teams
                            .filter(t => t.status === 'active')
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-400 p-3 bg-surface-50 rounded-xl">
                          Ce club n'a pas encore d'équipe active.
                          {joinRole === 'coach' && ' Proposez-en une via l\'autre option.'}
                        </div>
                      )}
                    </>
                  )}

                  {/* Mode nouvelle équipe (coach uniquement) */}
                  {joinRole === 'coach' && joinMode === 'new' && (
                    <input
                      placeholder="Nom de l'équipe (ex: Séniors A, U13 Groupe B…)"
                      value={newJoinTeamName}
                      onChange={e => setNewJoinTeamName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200
                                 rounded-xl text-sm focus:outline-none focus:ring-2
                                 focus:ring-brand-300 focus:border-brand-400"
                    />
                  )}
                </div>

                {/* Choix du rôle */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-gray-700">Votre rôle</label>
                  {[
                    { value: 'player', label: '⚽ Joueur', desc: 'Votre demande sera envoyée au coach' },
                    { value: 'coach',  label: '📋 Coach',  desc: 'Votre demande sera envoyée au président' },
                  ].map(r => (
                    <button
                      key={r.value}
                      onClick={() => setJoinRole(r.value)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        joinRole === r.value
                          ? 'bg-brand-50 border-brand-400'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{r.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Message optionnel */}
                <textarea
                  placeholder="Message optionnel…"
                  value={joinMessage}
                  onChange={e => setJoinMessage(e.target.value)}
                  rows={2}
                  className="w-full mb-4 bg-surface-50 border border-surface-200 rounded-xl
                             px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 resize-none transition-all"
                />

                {joinError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                                  text-sm text-red-700 mb-4">
                    {joinError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2.5 border border-surface-200 text-surface-600
                               hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmitJoin}
                    disabled={joinLoading}
                    className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                               rounded-xl text-sm font-medium transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {joinLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent
                                      rounded-full animate-spin mx-auto" />
                    ) : 'Envoyer la demande'}
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Modale Créer une équipe (président) ──────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6">
            <h2 className="font-display text-xl font-bold mb-4">Créer une équipe</h2>
            <div className="space-y-3 mb-5">
              <input
                placeholder="Nom de l'équipe (ex: Séniors A, U13 Groupe B…)"
                value={presTeamName}
                onChange={e => setPresTeamName(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl
                           text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <select
                value={presTeamGender}
                onChange={e => setPresTeamGender(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl
                           text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="mixed">Mixte</option>
                <option value="male">Masculin</option>
                <option value="female">Féminin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreateTeam(false); setPresTeamName(''); setPresTeamGender('mixed') }}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600
                           hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePresidentCreateTeam}
                disabled={createTeamLoading || !presTeamName.trim()}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl
                           text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createTeamLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  : 'Créer'
                }
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Modale Quitter l'équipe ──────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showLeaveTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🚪</div>
            <h2 className="font-display text-xl font-bold mb-2">Quitter l'équipe ?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Vous perdrez l'accès aux entraînements et à la messagerie
              de cette équipe. Votre historique sera conservé.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveTeam(null)}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600
                           hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleLeaveTeam(showLeaveTeam)}
                disabled={leaveLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white
                           rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {leaveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                                  rounded-full animate-spin mx-auto" />
                ) : 'Confirmer'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Profil club en modal ─────────────────────────────────────────── */}
      {selectedClubProfile && (
        <ClubProfileModal
          club={selectedClubProfile}
          currentUser={currentUser}
          onClose={() => setSelectedClubProfile(null)}
        />
      )}
    </div>
  )
}

// ─── ClubProfileModal ──────────────────────────────────────────────────────

function ClubProfileModal({ club, currentUser, onClose }) {
  const navigate = useNavigate()
  const [teams,       setTeams]       = useState([])
  const [posts,       setPosts]       = useState([])
  const [activeTab,   setActiveTab]   = useState('info')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamPlayers,  setTeamPlayers]  = useState([])
  const [loading,     setLoading]     = useState(true)

  // Fermeture par Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const load = async () => {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('teams').select('*').eq('club_id', club.id).eq('status', 'active'),
        supabase.from('club_posts')
          .select('*, users!author_id(id, first_name, last_name)')
          .eq('club_id', club.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])
      setTeams(t ?? [])
      setPosts(p ?? [])
      setLoading(false)
    }
    load()
  }, [club.id])

  useEffect(() => {
    if (!selectedTeam) return
    supabase
      .from('team_players')
      .select('*, users(id, first_name, last_name, birth_date)')
      .eq('team_id', selectedTeam.id)
      .eq('is_active', true)
      .then(({ data }) => setTeamPlayers(data ?? []))
  }, [selectedTeam])

  function handleTeamClick(team) {
    onClose()
    navigate(`/app/teams/${team.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col
                   max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                            justify-center text-white font-bold text-lg">
              {club.name[0]}
            </div>
            <div>
              <div className="font-bold text-gray-900">{club.name}</div>
              <div className="text-xs text-gray-400">
                {club.sports?.name} · {club.city}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats club */}
        <div className="px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{teams.length}</div>
              <div className="text-xs text-gray-400">Équipes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
          </div>
          {(club.department || club.region) && (
            <div className="text-sm text-gray-500 mt-3">
              📍 {[club.department, club.region].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex border-b border-surface-200 px-6 flex-shrink-0">
          {[
            { id: 'info',  label: '📋 Infos' },
            { id: 'feed',  label: '📰 Posts' },
            { id: 'teams', label: '⚽ Équipes' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600
                              rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'info' && (
                <div className="space-y-3">
                  {club.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">✉️</span> {club.email}
                    </div>
                  )}
                  {club.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">📞</span> {club.phone}
                    </div>
                  )}
                  {club.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">🏠</span>
                      {club.address}, {club.postal_code} {club.city}
                    </div>
                  )}
                  <div className="pt-3">
                    <button
                      onClick={() => { onClose(); navigate(`/app/clubs/${club.id}`) }}
                      className="w-full py-2 border border-surface-200 text-surface-600
                                 hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors text-center">
                      Voir la page complète →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'feed' && (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Aucun post publié</div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id}
                        className="p-4 bg-surface-50 rounded-2xl border border-surface-200">
                        <div className="text-xs text-gray-400 mb-2">
                          {post.users?.first_name} {post.users?.last_name}
                          {' · '}
                          {format(new Date(post.created_at), "d MMM", { locale: fr })}
                        </div>
                        <p className="text-sm text-gray-800">{post.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'teams' && (
                <div>
                  {teams.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Aucune équipe active dans ce club
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamClick(team)}
                          className="w-full flex items-center justify-between p-4 bg-surface-50
                                     hover:bg-brand-50 border border-surface-200 hover:border-brand-200
                                     rounded-xl transition-colors text-left group"
                        >
                          <div>
                            <div className="font-semibold text-sm text-gray-900 group-hover:text-brand-700">
                              {team.name}
                            </div>
                            {team.category && (
                              <div className="text-xs text-gray-400 mt-0.5">{team.category}</div>
                            )}
                          </div>
                          <span className="text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Voir l'équipe →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
