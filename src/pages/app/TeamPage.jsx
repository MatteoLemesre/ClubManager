import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Card, Badge, SectionHeader, Avatar, EmptyState } from '../../components/ui'
import { format, isPast, parseISO, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Trophy, Clock, MapPin, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Target, Plus, ClipboardList, LayoutGrid, Home, Bus, Search,
} from 'lucide-react'
import { getFollowedClubs, getTeamsByClub, getCurrentSeason, createNotification } from '../../services/db'
import { supabase } from '../../lib/supabase'

// ─── Groupement équipes par catégorie ──────────────────────────────────────
function groupTeamsByCategory(teams) {
  return teams.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})
}

export default function TeamPage() {
  const { currentUser, is, isOneOf, canManageTeam } = useAuth()
  const navigate = useNavigate()
  const { teams, users, matches, trainings, loading, getUserById, getTeamById, getFullName } = useClubData()

  const defaultTeam = currentUser.teamIds?.[0] ?? teams[0]?.id ?? ''
  const [selectedTeam,    setSelectedTeam]    = useState(defaultTeam)
  const [activeTab,       setActiveTab]       = useState('team')
  const [showFullRanking, setShowFullRanking] = useState(false)

  // Coach — proposer une équipe
  const [showCreateTeam,    setShowCreateTeam]    = useState(false)
  const [newTeamName,       setNewTeamName]       = useState('')
  const [newTeamCategory,   setNewTeamCategory]   = useState('')
  const [newTeamGender,     setNewTeamGender]     = useState('mixed')
  const [createTeamLoading, setCreateTeamLoading] = useState(false)
  const [createTeamError,   setCreateTeamError]   = useState('')

  // Supporter multi-clubs
  const [followedClubs,    setFollowedClubs]    = useState([])
  const [allFollowedTeams, setAllFollowedTeams] = useState([])
  const [clubFilter,       setClubFilter]       = useState('')
  const [followedLoading,  setFollowedLoading]  = useState(false)

  const isSupporter = isOneOf('supporter', 'parent')

  useEffect(() => {
    if (!isSupporter) return
    setFollowedLoading(true)
    getFollowedClubs(currentUser.id)
      .then(async (clubs) => {
        setFollowedClubs(clubs)
        const teamArrays = await Promise.all(clubs.map(c => getTeamsByClub(c.id)))
        const flat = teamArrays.flat()
        setAllFollowedTeams(flat)
        if (flat.length > 0) setSelectedTeam(t => t || flat[0].id)
      })
      .catch(() => {})
      .finally(() => setFollowedLoading(false))
  }, [currentUser.id])

  // Équipes affichées selon le rôle
  const displayTeams = isSupporter
    ? allFollowedTeams.filter(t => !clubFilter || t.club_id === clubFilter)
    : teams

  // getTeamById étendu pour inclure les équipes des clubs suivis
  function findTeam(id) {
    return getTeamById(id) ?? allFollowedTeams.find(t => t.id === id) ?? null
  }

  const team       = findTeam(selectedTeam)
  const isManager  = canManageTeam(selectedTeam)
  const isMyTeam   = is('player') && currentUser.teamIds?.includes(selectedTeam)

  // ── Data ──────────────────────────────────────────────────────────────────
  const teamMatches = matches
    .filter(m => m.teamId === selectedTeam)
    .sort((a, b) => a.scheduledAt - b.scheduledAt)

  const nextMatch  = teamMatches.find(m => m.status === 'scheduled')
  const lastResult = [...teamMatches].reverse().find(m => m.status === 'played')

  const teamTrainings = trainings
    .filter(t => t.teamId === selectedTeam)
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))

  const nextTraining = teamTrainings.find(t => !isPast(parseISO(t.date)))

  const teamPlayers = users.filter(u => u.role === 'player' && u.teamIds?.includes(selectedTeam))
  const teamCoaches = users.filter(u => u.role === 'coach'  && u.teamIds?.includes(selectedTeam))

  const topScorers = [...teamPlayers]
    .filter(u => (u.stats?.goals ?? 0) > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 3)

  const topAssists = [...teamPlayers]
    .filter(u => (u.stats?.assists ?? 0) > 0)
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 3)

  const topMatches = [...teamPlayers]
    .sort((a, b) => (b.stats?.matches ?? 0) - (a.stats?.matches ?? 0))
    .slice(0, 3)

  // Récap convocations prochain match
  const squadStatus = nextMatch?.squad ?? {}
  const nbConfirmed = Object.values(squadStatus).filter(s => s === 'confirmed').length
  const nbAbsent    = Object.values(squadStatus).filter(s => s === 'absent').length
  const nbCalled    = Object.values(squadStatus).filter(s => s === 'called').length

  async function handleCreateTeamRequest() {
    setCreateTeamError('')
    if (!newTeamName.trim()) return setCreateTeamError('Donnez un nom à l\'équipe')
    if (!newTeamCategory)    return setCreateTeamError('Choisissez une catégorie')
    setCreateTeamLoading(true)
    try {
      const season = await getCurrentSeason(currentUser.current_club_id)
      const { data, error } = await supabase.from('team_requests').insert({
        club_id:   currentUser.current_club_id,
        coach_id:  currentUser.id,
        team_name: newTeamName.trim(),
        category:  newTeamCategory,
        gender:    newTeamGender,
        season,
        status:    'pending',
      }).select('id').single()
      if (error) throw error

      const presidents = users.filter(u =>
        u.user_roles?.some(r => r.role_type === 'president') || u.role === 'president'
      )
      for (const p of presidents) {
        await createNotification({
          to_user_id:      p.id,
          type:            'team_request',
          title:           'Nouvelle équipe proposée',
          body:            `${currentUser.firstName} ${currentUser.lastName} propose de créer l'équipe "${newTeamName.trim()}".`,
          team_request_id: data.id,
        })
      }

      setShowCreateTeam(false)
      setNewTeamName('')
      setNewTeamCategory('')
      setNewTeamGender('mixed')
    } catch (err) {
      setCreateTeamError(err.message ?? 'Une erreur est survenue')
    } finally {
      setCreateTeamLoading(false)
    }
  }

  function switchTeam(id) {
    setSelectedTeam(id)
    setShowFullRanking(false)
  }

  if (loading || (isSupporter && followedLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Supporter sans clubs suivis
  if (isSupporter && !followedLoading && allFollowedTeams.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-surface-900">Équipes</h1>
        </div>
        <div className="text-center py-14">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold text-surface-700 mb-2">Vous ne suivez aucun club</div>
          <p className="text-sm text-surface-400 mb-5">
            Suivez des clubs pour voir leurs équipes ici
          </p>
          <button
            onClick={() => navigate('/app/explore')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600
                       hover:bg-brand-700 text-white rounded-xl text-sm font-medium"
          >
            <Search size={15} /> Explorer les clubs
          </button>
        </div>
      </div>
    )
  }

  const grouped = groupTeamsByCategory(displayTeams)

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Équipes</h1>
          <p className="text-surface-500 mt-1">Matchs, entraînements et effectif</p>
        </div>
        {is('coach') && (
          <button
            onClick={() => { setShowCreateTeam(true); setCreateTeamError('') }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                       text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} /> Proposer une équipe
          </button>
        )}
      </div>

      {/* ── Filtre club (supporters uniquement) ─────────────────────────── */}
      {isSupporter && followedClubs.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Club</span>
          <select
            value={clubFilter}
            onChange={e => { setClubFilter(e.target.value); setShowFullRanking(false) }}
            className="bg-surface-50 border border-surface-200 rounded-xl
                       px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">Tous mes clubs suivis</option>
            {followedClubs.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Barre sélection équipes groupées par catégorie ──────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
        {Object.entries(grouped).map(([category, catTeams]) => (
          <div key={category} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
              {category}
            </span>
            {catTeams.map(t => (
              <button
                key={t.id}
                onClick={() => switchTeam(t.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedTeam === t.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── Onglets Équipe / Joueurs & Staff ────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {[
          { id: 'team',   label: 'Équipe'        },
          { id: 'roster', label: 'Joueurs & Staff' },
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

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Onglet Équipe ─────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'team' && (
        <div className="space-y-6">

          {/* Prochain match — tous */}
          <section>
            <SectionHeader title="Prochain match" />
            {!nextMatch ? (
              <EmptyState
                icon={<Trophy size={36} />}
                title="Aucun match programmé"
                description="Les prochains matchs apparaîtront ici."
              />
            ) : (
              <Card className="p-5 cursor-pointer hover:border-surface-300 transition-all"
                    onClick={() => navigate(`/app/matches/${nextMatch.id}`)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="blue">{team?.category}</Badge>
                    <Badge variant={nextMatch.isHome ? 'green' : 'orange'}>
                      {nextMatch.isHome ? 'Domicile' : 'Déplacement'}
                    </Badge>
                    <Badge variant="gray">{nextMatch.competition}</Badge>
                  </div>
                  <ChevronRight size={14} className="text-surface-300 flex-shrink-0" />
                </div>

                <p className="font-display font-bold text-lg text-surface-900 mb-3">
                  vs {nextMatch.opponentName}
                </p>

                <div className="space-y-1 text-xs text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {format(nextMatch.scheduledAt, "EEEE d MMM yyyy · HH'h'mm", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    {nextMatch.location}
                  </div>
                  {nextMatch.isHome
                    ? <div className="flex items-center gap-1.5"><Home size={12} /> Domicile</div>
                    : <div className="flex items-center gap-1.5"><Bus size={12} /> Déplacement</div>
                  }
                  <div className="text-surface-400">
                    Arbitre : {nextMatch.referee ?? 'Non renseigné'}
                  </div>
                </div>

                {/* Joueur de cette équipe → Disponible / Indisponible */}
                {isMyTeam && (
                  <div className="mt-4 pt-3 border-t border-surface-100 flex gap-2"
                       onClick={e => e.stopPropagation()}>
                    <button className="flex-1 py-2 text-xs font-medium bg-emerald-50 text-emerald-700
                                       border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                      ✓ Disponible
                    </button>
                    <button className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-600
                                       border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                      ✗ Indisponible
                    </button>
                  </div>
                )}

                {/* Manager → récap convocations */}
                {isManager && (
                  <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between"
                       onClick={e => e.stopPropagation()}>
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-600 font-medium">{nbConfirmed} dispo</span>
                      <span className="text-red-500 font-medium">{nbAbsent} indispo</span>
                      <span className="text-surface-400">{nbCalled} en attente</span>
                    </div>
                    <button
                      onClick={() => navigate(`/app/matches/${nextMatch.id}`)}
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Convocations →
                    </button>
                  </div>
                )}
              </Card>
            )}
          </section>

          {/* Dernier résultat — tous */}
          {lastResult && (
            <section>
              <SectionHeader title="Dernier résultat" />
              <Card className="p-5 cursor-pointer hover:border-surface-300 transition-all"
                    onClick={() => navigate(`/app/matches/${lastResult.id}`)}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="gray">{lastResult.competition}</Badge>
                  <p className="text-xs text-surface-400">
                    {format(lastResult.scheduledAt, "d MMM yyyy", { locale: fr })}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 py-3">
                  <div className="text-center">
                    <p className="font-display font-bold text-surface-900">{team?.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {lastResult.isHome ? 'Domicile' : 'Extérieur'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-4xl text-surface-900">
                      {lastResult.scoreHome} – {lastResult.scoreAway}
                    </p>
                    <Badge
                      variant={
                        lastResult.scoreHome > lastResult.scoreAway ? 'green' :
                        lastResult.scoreHome < lastResult.scoreAway ? 'red' : 'gray'
                      }
                      className="mt-1"
                    >
                      {lastResult.scoreHome > lastResult.scoreAway ? 'Victoire' :
                       lastResult.scoreHome < lastResult.scoreAway ? 'Défaite' : 'Nul'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-surface-900">{lastResult.opponentName}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {lastResult.isHome ? 'Extérieur' : 'Domicile'}
                    </p>
                  </div>
                </div>

                {/* Événements du match */}
                {(lastResult.events ?? []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-100">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {lastResult.events.map((ev, i) => {
                        const u = getUserById(ev.userId)
                        const assist = getUserById(ev.assistUserId)
                        return (
                          <span key={i} className="text-xs text-surface-600 flex items-center gap-1">
                            {ev.type === 'goal'        && <Target size={11} className="text-brand-600" />}
                            {ev.type === 'yellow_card' && <span>🟨</span>}
                            {ev.type === 'red_card'    && <span>🟥</span>}
                            {u?.lastName} {ev.minute}'
                            {assist && <span className="text-surface-400">(p. {assist.lastName})</span>}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </section>
          )}

          {/* Top stats — tous */}
          {teamPlayers.length > 0 && (
            <section>
              <Card className="p-5">
                <SectionHeader
                  title={`Top stats — ${team?.name}`}
                  action={
                    <button
                      onClick={() => setShowFullRanking(v => !v)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {showFullRanking ? 'Réduire' : 'Classement complet'}
                    </button>
                  }
                />
                {!showFullRanking ? (
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[
                      { label: '⚽ Buteurs',   list: topScorers, stat: u => u.stats.goals },
                      { label: '🅰️ Passeurs',  list: topAssists, stat: u => u.stats.assists },
                      { label: '📋 Matchs',    list: topMatches, stat: u => u.stats?.matches ?? 0 },
                    ].map(col => (
                      <div key={col.label}>
                        <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">{col.label}</p>
                        {col.list.length === 0
                          ? <p className="text-xs text-surface-300">—</p>
                          : col.list.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-2 py-1">
                              <span className="text-xs font-bold text-surface-300 w-4">{i + 1}</span>
                              <Avatar user={u} size="sm" />
                              <span className="text-sm font-medium text-surface-800 flex-1 truncate">
                                {u.lastName}
                              </span>
                              <span className="text-sm font-bold text-surface-900">{col.stat(u)}</span>
                            </div>
                          ))
                        }
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="text-xs text-surface-400 border-b border-surface-200">
                        <th className="text-left py-2 font-semibold">Joueur</th>
                        <th className="text-center py-2 font-semibold">⚽</th>
                        <th className="text-center py-2 font-semibold">🅰️</th>
                        <th className="text-center py-2 font-semibold">📋</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...teamPlayers]
                        .sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
                        .map(u => (
                          <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <Avatar user={u} size="sm" />
                                <span className="font-medium text-surface-900">{getFullName(u)}</span>
                              </div>
                            </td>
                            <td className="text-center font-bold text-surface-900">{u.stats?.goals ?? 0}</td>
                            <td className="text-center text-surface-700">{u.stats?.assists ?? 0}</td>
                            <td className="text-center text-surface-700">{u.stats?.matches ?? 0}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </section>
          )}

          {/* ── En plus pour manager de cette équipe ───────────────────── */}
          {isManager && (
            <>
              {/* Récap présences entraînements */}
              <section>
                <SectionHeader
                  title="Entraînements"
                  action={
                    <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-medium">
                      <Plus size={13} /> Ajouter
                    </button>
                  }
                />
                {teamTrainings.length === 0 ? (
                  <EmptyState
                    icon={<Clock size={36} />}
                    title="Aucun entraînement"
                    description="Ajoutez un entraînement pour commencer."
                  />
                ) : (
                  <div className="space-y-3">
                    {teamTrainings.map(t => {
                      const presentCount = t.attendances.filter(a => a.status === 'present').length
                      const total        = teamPlayers.length || 1
                      const past         = isPast(parseISO(t.date))
                      return (
                        <Card key={t.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                              <Clock size={15} className="text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-surface-700">
                                {format(parseISO(t.date), "EEEE d MMM · HH'h'mm", { locale: fr })}
                                <span className="text-surface-400 font-normal"> · {t.duration} min</span>
                              </p>
                              <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} /> {t.location}
                              </p>
                              {t.theme && (
                                <p className="text-xs text-surface-500 mt-1 italic">{t.theme}</p>
                              )}
                              {past && (
                                <div className="mt-2">
                                  <p className="text-xs text-surface-500 mb-1.5">
                                    {presentCount} présents sur {total} joueurs
                                  </p>
                                  <div className="w-full bg-surface-100 rounded-full h-1.5">
                                    <div
                                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                      style={{ width: `${Math.round((presentCount / total) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                                   text-white rounded-xl text-sm font-medium transition-colors">
                  <ClipboardList size={15} /> Convocations
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200
                                   hover:bg-surface-50 text-surface-700 rounded-xl text-sm font-medium transition-colors">
                  <LayoutGrid size={15} /> Publier compo
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200
                                   hover:bg-surface-50 text-surface-700 rounded-xl text-sm font-medium transition-colors">
                  <Plus size={15} /> Entraînement
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200
                                   hover:bg-surface-50 text-surface-700 rounded-xl text-sm font-medium transition-colors">
                  <Plus size={15} /> Match
                </button>
              </div>
            </>
          )}

          {/* ── En plus pour joueur de cette équipe ────────────────────── */}
          {isMyTeam && nextTraining && (
            <section>
              <SectionHeader title="Prochain entraînement" />
              <Card className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Clock size={15} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-700">
                      {format(parseISO(nextTraining.date), "EEEE d MMM · HH'h'mm", { locale: fr })}
                      <span className="text-surface-400 font-normal"> · {nextTraining.duration} min</span>
                    </p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {nextTraining.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-xs font-medium bg-emerald-50 text-emerald-700
                                     border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                    Présent
                  </button>
                  <button className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-600
                                     border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    Absent
                  </button>
                </div>
              </Card>
            </section>
          )}
        </div>
      )}

      {/* ── Modal proposer une équipe (coach) ──────────────────────────── */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">
              Proposer une nouvelle équipe
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                  Nom de l'équipe *
                </label>
                <input
                  autoFocus
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  placeholder="Ex: Séniors A, U13 1…"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl
                             px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 focus:border-brand-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                  Catégorie *
                </label>
                <select
                  value={newTeamCategory}
                  onChange={e => setNewTeamCategory(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl
                             px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 focus:border-brand-400 transition-all"
                >
                  <option value="">Choisir une catégorie…</option>
                  {['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19','U20','Seniors','Vétérans'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                  Genre
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'mixed',  label: 'Mixte'   },
                    { value: 'male',   label: 'Masculin' },
                    { value: 'female', label: 'Féminin'  },
                  ].map(g => (
                    <button
                      key={g.value}
                      onClick={() => setNewTeamGender(g.value)}
                      className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                        newTeamGender === g.value
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-medium'
                          : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {createTeamError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm
                              rounded-xl px-4 py-3">
                {createTeamError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateTeam(false); setNewTeamName(''); setNewTeamCategory(''); setNewTeamGender('mixed'); setCreateTeamError('') }}
                className="flex-1 py-2.5 border border-surface-200 text-surface-600
                           hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTeamRequest}
                disabled={createTeamLoading}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                           rounded-xl text-sm font-medium transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTeamLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                                  rounded-full animate-spin mx-auto" />
                ) : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── Onglet Joueurs & Staff ────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'roster' && (
        <div className="space-y-6">

          {/* Joueurs */}
          <section>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Joueurs ({teamPlayers.length})
            </p>
            {teamPlayers.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">Aucun joueur dans cette équipe.</p>
            ) : (
              <div className="divide-y divide-surface-100 rounded-2xl border border-surface-200 bg-white overflow-hidden">
                {teamPlayers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors">
                    <Avatar user={u} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-surface-900">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-sm text-surface-500">
                        {u.position ?? 'Poste non renseigné'} · N°{u.jerseyNumber}
                      </div>
                      <div className="text-xs text-surface-400">
                        {format(new Date(u.birthDate), 'd MMMM yyyy', { locale: fr })}
                        {' '}({differenceInYears(new Date(), new Date(u.birthDate))} ans)
                      </div>
                    </div>
                    {u.jerseyNumber && (
                      <span className="text-lg font-bold text-surface-200 flex-shrink-0">
                        {u.jerseyNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Staff / Coachs */}
          <section>
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
              Staff ({teamCoaches.length})
            </p>
            {teamCoaches.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">Aucun coach assigné à cette équipe.</p>
            ) : (
              <div className="divide-y divide-surface-100 rounded-2xl border border-surface-200 bg-white overflow-hidden">
                {teamCoaches.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors">
                    <Avatar user={u} size="md" />
                    <div>
                      <div className="font-semibold text-surface-900">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-sm text-surface-500">Coach</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
