import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, Avatar, EmptyState, SectionHeader } from '../../components/ui'
import { PostCard } from './FeedPage'
import { differenceInYears } from 'date-fns'
import { supabase } from '../../lib/supabase'
import {
  getClubById,
  getTeamsByClub,
  getClubPosts,
  followClub,
  unfollowClub,
} from '../../services/db'

export default function ClubProfilePage() {
  const { clubId }      = useParams()
  const { currentUser } = useAuth()
  const navigate        = useNavigate()

  const [club,        setClub]        = useState(null)
  const [teams,       setTeams]       = useState([])
  const [posts,       setPosts]       = useState([])
  const [followed,    setFollowed]    = useState(false)
  const [activeTab,   setActiveTab]   = useState('feed')
  const [selectedTeam,  setSelectedTeam]  = useState(null)
  const [teamPlayers,   setTeamPlayers]   = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [c, t, p] = await Promise.all([
        getClubById(clubId),
        getTeamsByClub(clubId),
        getClubPosts(clubId),
      ])

      const { data: follow } = await supabase
        .from('club_follows')
        .select('club_id')
        .eq('user_id', currentUser.id)
        .eq('club_id', clubId)
        .single()

      setClub(c)
      setTeams(t.filter(team => team.status === 'active'))
      setPosts(p)
      setFollowed(!!follow)
      setLoading(false)
    }
    load()
  }, [clubId, currentUser.id])

  useEffect(() => {
    if (!selectedTeam) return
    supabase
      .from('team_players')
      .select('*, users(id, first_name, last_name, birth_date)')
      .eq('team_id', selectedTeam.id)
      .eq('is_active', true)
      .then(({ data }) => setTeamPlayers(data ?? []))
  }, [selectedTeam])

  const handleFollowToggle = async () => {
    if (followed) {
      await unfollowClub(currentUser.id, clubId)
    } else {
      await followClub(currentUser.id, clubId)
    }
    setFollowed(f => !f)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  if (!club) return (
    <div className="p-6 text-gray-500 text-sm">Club introuvable</div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header club */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center
                            justify-center text-white text-2xl font-bold flex-shrink-0">
              {club.name[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {club.name}
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {club.sports?.name}
                {club.city && ` · ${club.city}`}
                {club.department && ` · ${club.department}`}
              </div>
              {club.region && (
                <div className="text-xs text-gray-400 mt-0.5">{club.region}</div>
              )}
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${
              followed
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
            }`}>
            {followed ? '✓ Suivi' : '+ Suivre'}
          </button>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-surface-100">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{teams.length}</div>
            <div className="text-xs text-gray-400">Équipes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{posts.length}</div>
            <div className="text-xs text-gray-400">Posts</div>
          </div>
        </div>
      </Card>

      {/* Onglets */}
      <div className="flex border-b border-surface-200 mb-6">
        {[
          { id: 'feed',  label: '📰 Actualités' },
          { id: 'teams', label: '⚽ Équipes'    },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onglet Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <EmptyState
              icon="📰"
              title="Aucun post"
              description="Ce club n'a pas encore publié d'actualité."
            />
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={false}
                onLike={() => {}}
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      )}

      {/* Onglet Équipes */}
      {activeTab === 'teams' && (
        <div>
          <div className="flex gap-2 flex-wrap mb-6">
            {teams.map(team => (
              <button key={team.id}
                onClick={() => setSelectedTeam(
                  selectedTeam?.id === team.id ? null : team
                )}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedTeam?.id === team.id
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                }`}>
                {team.name}
                {team.category && (
                  <span className="ml-1.5 text-xs opacity-70">{team.category}</span>
                )}
              </button>
            ))}
          </div>

          {selectedTeam ? (
            <div>
              <SectionHeader title={`${selectedTeam.name} — Joueurs`} />
              {teamPlayers.length === 0 ? (
                <EmptyState icon="👤" title="Aucun joueur" description="" />
              ) : (
                <div className="space-y-2">
                  {teamPlayers.map(tp => {
                    const u = tp.users
                    const age = u?.birth_date
                      ? differenceInYears(new Date(), new Date(u.birth_date))
                      : null
                    return (
                      <Card key={tp.user_id} className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center
                                        justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {tp.jersey_number ?? '?'}
                        </div>
                        <Avatar user={u} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {u?.first_name} {u?.last_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tp.position}
                            {age && ` · ${age} ans`}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Sélectionnez une équipe pour voir ses joueurs
            </div>
          )}
        </div>
      )}
    </div>
  )
}
