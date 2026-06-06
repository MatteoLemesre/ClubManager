import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, Badge, RoleBadge } from '../../components/ui'
import { CLUB, TEAMS, EXTERNAL_CLUBS, getAllClubs, SPORTS } from '../../data/mock'
import { Search, X, Star, MapPin, Users, ChevronRight } from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────────────────────

function getClubById(id) {
  return getAllClubs().find(c => c.id === id) ?? null
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { currentUser, is } = useAuth()
  const navigate = useNavigate()

  const isMember = !!currentUser.current_club_id

  const [activeTab, setActiveTab] = useState('followed')
  const [search, setSearch]       = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [sportFilter, setSportFilter] = useState('all')

  // Suivi local (initialisé depuis le contexte, ne persiste pas)
  const [followedClubIds, setFollowedClubIds] = useState(
    new Set(currentUser.followed_clubs ?? [])
  )
  const [followedTeamIds, setFollowedTeamIds] = useState(
    new Set(currentUser.followed_teams ?? [])
  )

  // Mes équipes (si membre)
  const myTeams = isMember
    ? TEAMS.filter(t =>
        is('president')
          ? true
          : (currentUser.teamIds ?? []).includes(t.id)
      )
    : []

  // Clubs suivis (hors own club)
  const followedClubs = [...followedClubIds]
    .map(getClubById)
    .filter(Boolean)
    .filter(c => c.id !== currentUser.current_club_id)

  // Club de l'utilisateur
  const myClub = isMember ? getClubById(currentUser.current_club_id) : null

  // Explorer : tous les clubs sauf le sien, filtrés par recherche et sport
  const explorerClubs = getAllClubs().filter(c => {
    if (c.id === currentUser.current_club_id) return false
    const matchSport = sportFilter === 'all' || c.sport?.toLowerCase() === sportFilter
    if (!search) return matchSport
    return matchSport && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    )
  })

  function toggleFollowClub(clubId) {
    setFollowedClubIds(prev => {
      const s = new Set(prev)
      s.has(clubId) ? s.delete(clubId) : s.add(clubId)
      return s
    })
  }

  function toggleFollowTeam(teamId) {
    setFollowedTeamIds(prev => {
      const s = new Set(prev)
      s.has(teamId) ? s.delete(teamId) : s.add(teamId)
      return s
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-surface-900">Équipes</h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {[
          { id: 'followed', label: 'Mes équipes' },
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

      {/* ── Onglet Mes équipes ─────────────────────────────────────────────── */}
      {activeTab === 'followed' && (
        <div className="space-y-6">

          {/* Section MON CLUB (membres seulement) */}
          {isMember && myClub && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Mon club
              </p>
              <ClubCard
                club={myClub}
                myTeams={myTeams}
                role={currentUser.role}
                isMember
                isFollowed={followedClubIds.has(myClub.id)}
                followedTeams={followedTeamIds}
                onFollowClub={() => toggleFollowClub(myClub.id)}
                onFollowTeam={toggleFollowTeam}
                onOpenProfile={() => setSelectedClub(myClub)}
                onNavigateTeam={id => navigate(`/app/teams/${id}`)}
              />
            </div>
          )}

          {/* Section CLUBS SUIVIS */}
          {followedClubs.length > 0 && (
            <div>
              {isMember && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Clubs suivis
                  </p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    + Suivre un club
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {followedClubs.map(club => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    myTeams={[]}
                    role={currentUser.role}
                    isMember={false}
                    isFollowed
                    followedTeams={followedTeamIds}
                    onFollowClub={() => toggleFollowClub(club.id)}
                    onFollowTeam={toggleFollowTeam}
                    onOpenProfile={() => setSelectedClub(club)}
                    onNavigateTeam={id => navigate(`/app/teams/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isMember && followedClubs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="text-5xl">⚽</div>
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
                  Vous ne suivez aucun club
                </h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  Explorez des clubs et suivez ceux qui vous intéressent pour voir leurs matchs et actualités.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white
                           rounded-xl text-sm font-medium transition-colors"
              >
                Explorer les clubs
              </button>
            </div>
          )}

          {isMember && followedClubs.length === 0 && (
            <div className="p-4 bg-surface-50 rounded-2xl border border-dashed border-surface-200 text-center">
              <div className="text-sm text-gray-500 mb-2">
                Suivez d'autres clubs pour voir leurs matchs ici.
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-sm text-brand-600 hover:underline font-medium"
              >
                Explorer les clubs →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Explorer ───────────────────────────────────────────────── */}
      {activeTab === 'explore' && (
        <div>
          {/* Filtres par sport */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSportFilter('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                sportFilter === 'all'
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
              }`}
            >
              Tous les sports
            </button>
            {Object.entries(SPORTS).map(([key, sport]) => (
              <button
                key={key}
                onClick={() => setSportFilter(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  sportFilter === key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                }`}
              >
                {sport.icon} {sport.name}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative mb-6">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un club ou une ville…"
              className="w-full pl-9 pr-9 py-2.5 bg-surface-50 border border-surface-200
                         rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300
                         focus:border-brand-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Résultats */}
          {explorerClubs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Aucun club trouvé pour "{search}"
            </div>
          ) : (
            <div className="space-y-3">
              {explorerClubs.map(club => (
                <ClubCard
                  key={club.id}
                  club={club}
                  myTeams={[]}
                  role={currentUser.role}
                  isMember={false}
                  isFollowed={followedClubIds.has(club.id)}
                  followedTeams={followedTeamIds}
                  onFollowClub={() => toggleFollowClub(club.id)}
                  onFollowTeam={toggleFollowTeam}
                  onOpenProfile={() => setSelectedClub(club)}
                  onNavigateTeam={id => navigate(`/app/teams/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal profil club */}
      {selectedClub && (
        <ClubProfileModal
          club={selectedClub}
          isMember={selectedClub.id === currentUser.current_club_id}
          isFollowed={followedClubIds.has(selectedClub.id)}
          followedTeams={followedTeamIds}
          onFollowClub={() => toggleFollowClub(selectedClub.id)}
          onFollowTeam={toggleFollowTeam}
          onClose={() => setSelectedClub(null)}
          onNavigateTeam={id => { setSelectedClub(null); navigate(`/app/teams/${id}`) }}
        />
      )}
    </div>
  )
}

// ─── ClubCard ──────────────────────────────────────────────────────────────

function ClubCard({ club, myTeams, role, isMember, isFollowed, followedTeams, onFollowClub, onFollowTeam, onOpenProfile, onNavigateTeam }) {
  const followedCount  = club.teams?.filter(t => followedTeams.has(t.id)).length ?? 0
  const followingAll   = isFollowed && followedCount === 0  // suit le club entier
  const followedNames  = club.teams?.filter(t => followedTeams.has(t.id)).map(t => t.name) ?? []

  const memberBadgeLabel = {
    president: 'Président',
    coach:     'Coach',
    player:    'Joueur',
    community: 'Communauté',
    supporter: 'Communauté',
  }[role] ?? 'Membre'

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center text-white font-bold text-lg flex-shrink-0">
          {club.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900">{club.name}</span>
            {isMember && (
              <Badge variant="brand">{memberBadgeLabel}</Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {(() => { const s = SPORTS[club.sport?.toLowerCase?.() ?? '']; return s ? `${s.icon} ${s.name}` : club.sport })()}{club.city && ` · ${club.city}`}
          </div>

          {/* Équipes impliquées (si membre) — cliquables */}
          {myTeams.length > 0 && (
            <div className="mt-2 space-y-1">
              {myTeams.map(t => (
                <div
                  key={t.id}
                  onClick={() => onNavigateTeam?.(t.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg
                             bg-surface-50 hover:bg-brand-50 hover:border-brand-200
                             border border-transparent cursor-pointer transition-all group"
                >
                  <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">
                    {t.name}
                    <span className="font-normal text-gray-400 ml-1">· {t.category}</span>
                  </span>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-brand-500" />
                </div>
              ))}
            </div>
          )}

          {/* Indication suivi */}
          {!isMember && (
            <div className="text-xs text-gray-400 mt-1">
              {followingAll || isFollowed
                ? `Toutes les équipes (${club.teams?.length ?? 0})`
                : followedNames.length > 0
                ? `Équipes suivies : ${followedNames.join(', ')}`
                : `${club.teams?.length ?? 0} équipe${(club.teams?.length ?? 0) > 1 ? 's' : ''}`
              }
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenProfile}
            className="text-xs px-3 py-1.5 rounded-full border border-surface-200
                       bg-white text-gray-600 hover:border-brand-300 transition-all"
          >
            Voir
          </button>
          {!isMember && (
            <button
              onClick={onFollowClub}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                isFollowed
                  ? 'bg-brand-50 text-brand-700 border-brand-200'
                  : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
              }`}
            >
              {isFollowed ? '★ Suivi' : '+ Suivre'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── ClubProfileModal ──────────────────────────────────────────────────────

function ClubProfileModal({ club, isMember, isFollowed, followedTeams, onFollowClub, onFollowTeam, onClose, onNavigateTeam }) {
  const [activeTab, setActiveTab] = useState('teams')

  // Fermeture Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                            justify-center text-white font-bold text-lg">
              {club.name[0]}
            </div>
            <div>
              <div className="font-bold text-gray-900">{club.name}</div>
              <div className="text-xs text-gray-400">
                {(() => { const s = SPORTS[club.sport?.toLowerCase?.() ?? '']; return s ? `${s.icon} ${s.name}` : club.sport })()}
                {club.city && ` · ${club.city}`}
                {club.department && ` · ${club.department}`}
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

        {/* Stats + actions */}
        <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users size={14} />
            {club.teams?.length ?? 0} équipe{(club.teams?.length ?? 0) > 1 ? 's' : ''}
          </div>
          {!isMember && (
            <button
              onClick={onFollowClub}
              className={`text-sm px-4 py-1.5 rounded-xl border transition-all font-medium ${
                isFollowed
                  ? 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                  : 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'
              }`}
            >
              {isFollowed ? '★ Suivi' : '+ Suivre le club'}
            </button>
          )}
          {isMember && <Badge variant="brand">Membre</Badge>}
        </div>

        {/* Onglets */}
        <div className="flex border-b border-surface-200 px-5">
          {[
            { id: 'teams', label: `${SPORTS[club.sport?.toLowerCase?.() ?? '']?.icon ?? '🏆'} Équipes` },
            { id: 'info',  label: '📋 Infos'   },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'teams' && (
            <div className="space-y-2">
              {(club.teams ?? []).map(team => {
                const isTeamFollowed = followedTeams.has(team.id)
                return (
                  <div
                    key={team.id}
                    onClick={() => onNavigateTeam?.(team.id)}
                    className="flex items-center justify-between p-3 bg-surface-50
                               hover:bg-brand-50 rounded-xl border border-surface-100
                               hover:border-brand-200 cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900 group-hover:text-brand-700">
                        {team.name}
                      </div>
                      <div className="text-xs text-gray-400">{team.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isMember && (
                        <button
                          onClick={e => { e.stopPropagation(); onFollowTeam(team.id) }}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            isTeamFollowed
                              ? 'bg-orange-50 text-orange-600 border-orange-200'
                              : 'text-gray-500 border-surface-200 hover:border-orange-300'
                          }`}
                        >
                          {isTeamFollowed ? '★ Suivi' : '☆ Suivre'}
                        </button>
                      )}
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3">
              {club.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {club.city}{club.department ? `, ${club.department}` : ''}
                </div>
              )}
              {club.region && (
                <div className="text-sm text-gray-500">
                  Région : {club.region}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Sport : {(() => { const s = SPORTS[club.sport?.toLowerCase?.() ?? '']; return s ? `${s.icon} ${s.name}` : club.sport })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
