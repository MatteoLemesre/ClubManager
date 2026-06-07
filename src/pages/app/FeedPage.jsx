import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MOCK_FEED_POSTS, MOCK_CLUBS } from '../../context/AuthContext'
import { EXTERNAL_CLUBS, SPORTS } from '../../data/mock'

// Retourne les club IDs dont il faut charger le feed (followed_clubs + clubs parents des followed_teams)
function getFeedClubIds(user) {
  const ids = new Set(user.followed_clubs ?? [])
  const followedTeams = user.followed_teams ?? []
  EXTERNAL_CLUBS.forEach(club => {
    if (club.teams?.some(t => followedTeams.includes(t.id))) {
      ids.add(club.id)
    }
  })
  // Always include own club if member
  if (user.current_club_id) ids.add(user.current_club_id)
  return [...ids]
}
import { Card, Avatar, EmptyState } from '../../components/ui'
import { MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import {
  getFeedPosts,
  addComment,
  toggleLike,
  canPostForClub,
} from '../../services/db'

// ─── CreatePostModal ───────────────────────────────────────────────────────

function CreatePostModal({ club, authorId, authorRole, onClose, onPost }) {
  const [content,  setContent]  = useState('')
  const [images,   setImages]   = useState([])
  const [links,    setLinks]    = useState([])
  const [newLink,  setNewLink]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const canPostMedia = authorRole === 'coach' || authorRole === 'president' || authorRole === 'staff'

  const handleAddImage = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setImages(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, data: ev.target.result, type: file.type }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddLink = () => {
    if (newLink.trim() && newLink.includes('http')) {
      setLinks(prev => [...prev, { id: Date.now(), url: newLink.trim() }])
      setNewLink('')
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      setError('Écrivez quelque chose ou ajoutez une image.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: post, error: err } = await supabase
        .from('club_posts')
        .insert({ club_id: club.id, author_id: authorId, content: content.trim() || null })
        .select(`*, clubs(id, name, city), users!author_id(id, first_name, last_name)`)
        .single()
      if (err) throw err
      // Attach images & links locally (mock — not stored in DB)
      onPost({ ...post, images: images.map(i => ({ id: i.id, url: i.data, type: i.type })), links })
      onClose()
    } catch {
      // Fallback: build a local mock post
      const mockPost = {
        id: `post-local-${Date.now()}`,
        club_id: club.id, author_id: authorId,
        clubs: { id: club.id, name: club.name },
        users: null,
        content: content.trim() || null,
        images: images.map(i => ({ id: i.id, url: i.data, type: i.type })),
        links,
        created_at: new Date().toISOString(),
        post_likes: [], post_comments: [],
      }
      onPost(mockPost)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Créer une publication</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {/* Texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="Partagez une bonne nouvelle, un résultat, une annonce..."
              className="w-full resize-none bg-surface-50 border border-surface-200 rounded-xl
                         px-3 py-2 text-sm focus:outline-none focus:border-brand-400 transition-all"
            />
          </div>

          {/* Images (coach/président) */}
          {canPostMedia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos/Vidéos (optionnel)</label>
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed
                               border-surface-200 rounded-xl hover:border-brand-300 cursor-pointer transition-all">
                <span className="text-2xl">📸</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">Ajouter des photos/vidéos</div>
                  <div className="text-xs text-gray-500">PNG, JPG, MP4 (max 10 Mo)</div>
                </div>
                <input type="file" multiple accept="image/*,video/*" onChange={handleAddImage} className="hidden" />
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {images.map(img => (
                    <div key={img.id} className="relative">
                      <img src={img.data} alt="aperçu" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full
                                   w-6 h-6 flex items-center justify-center hover:bg-red-700 text-xs">
                        ✕
                      </button>
                      <div className="text-xs text-gray-500 mt-1 truncate">{img.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liens (coach/président) */}
          {canPostMedia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Liens (optionnel)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                  placeholder="https://..."
                  className="flex-1 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2
                             text-sm focus:outline-none focus:border-brand-400 transition-all"
                />
                <button
                  onClick={handleAddLink}
                  disabled={!newLink.trim() || !newLink.includes('http')}
                  className="px-3 py-2 bg-surface-100 hover:bg-surface-200 text-gray-700
                             text-sm font-medium rounded-xl disabled:opacity-40 transition-colors">
                  + Ajouter
                </button>
              </div>
              {links.length > 0 && (
                <div className="mt-2 space-y-2">
                  {links.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                         className="text-sm text-brand-600 hover:underline truncate flex-1">
                        {link.url}
                      </a>
                      <button onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))}
                              className="text-gray-400 hover:text-red-600 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-700
                       text-sm font-medium rounded-xl transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40
                       text-white text-sm font-medium rounded-xl transition-colors">
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CreatePostBox ─────────────────────────────────────────────────────────

function CreatePostBox({ club, authorId, authorRole, onPost }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-white rounded-2xl border border-surface-200 shadow-sm p-4 mb-6
                   flex items-center gap-3 hover:border-brand-300 transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center text-white font-bold text-lg flex-shrink-0">
          {club.name[0]}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400">Publier au nom de <span className="font-semibold text-brand-600">{club.name}</span></div>
          <div className="text-xs text-gray-300 mt-0.5">
            Actualité, résultat, annonce{(authorRole === 'coach' || authorRole === 'president' || authorRole === 'staff') ? ', photo...' : '...'}
          </div>
        </div>
        <div className="text-brand-600 font-bold text-lg">+</div>
      </button>

      {showModal && (
        <CreatePostModal
          club={club}
          authorId={authorId}
          authorRole={authorRole}
          onClose={() => setShowModal(false)}
          onPost={post => { onPost(post); setShowModal(false) }}
        />
      )}
    </>
  )
}

// ─── PostCard ──────────────────────────────────────────────────────────────

export function PostCard({ post, liked, onLike, currentUser }) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [comments,     setComments]     = useState(post.post_comments ?? [])
  const [newComment,   setNewComment]   = useState('')
  const [likeCount,    setLikeCount]    = useState(
    Array.isArray(post.post_likes) ? post.post_likes.length : 0
  )

  const author = post.users

  const handleComment = async () => {
    if (!newComment.trim()) return
    const comment = await addComment(post.id, currentUser.id, newComment)
    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const handleLike = () => {
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    onLike()
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center text-white font-bold text-lg flex-shrink-0">
          {post.clubs?.name?.[0] ?? '?'}
        </div>
        <div className="flex-1">
          <button
            onClick={() => post.clubs?.id && navigate(`/app/clubs/${post.clubs.id}`)}
            className="font-semibold text-gray-900 hover:text-brand-600 transition-colors"
          >
            {post.clubs?.name}
          </button>
          <div className="text-xs text-gray-400">
            par{' '}
            <button
              onClick={() => post.users?.id && navigate(`/app/profile/${post.users.id}`)}
              className="hover:text-brand-600 transition-colors"
            >
              {post.users?.first_name} {post.users?.last_name}
            </button>
            {' · '}{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      {post.content && (
        <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap text-sm">
          {post.content}
        </p>
      )}

      {/* Image unique (Supabase) */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={post.media_url}
          alt="Post media"
          className="w-full rounded-xl object-cover max-h-80 mb-3"
          onError={e => e.target.style.display = 'none'}
        />
      )}

      {/* Galerie images/vidéos (posts locaux enrichis) */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.map(img => (
            <div key={img.id} className="overflow-hidden rounded-xl">
              {img.type?.startsWith('video') ? (
                <video src={img.url} controls className="w-full h-64 object-cover" />
              ) : (
                <img src={img.url} alt="post" className="w-full h-64 object-cover hover:scale-105 transition-transform cursor-pointer" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Liens */}
      {post.links && post.links.length > 0 && (
        <div className="mb-3 space-y-2">
          {post.links.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 p-3 border border-surface-200 rounded-lg
                          hover:bg-surface-50 transition-all">
              <span className="text-xl">🔗</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-brand-600 truncate">
                  {(() => { try { return new URL(link.url).hostname } catch { return link.url } })()}
                </div>
                <div className="text-xs text-gray-500 truncate">{link.url}</div>
              </div>
              <span className="text-gray-400 flex-shrink-0">→</span>
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-surface-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}>
          <span>{liked ? '❤️' : '🤍'}</span>
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1.5 text-sm text-gray-400
                     hover:text-brand-600 transition-all">
          <MessageCircle size={16} />
          {comments.length > 0 && <span>{comments.length}</span>}
          <span>Commenter</span>
        </button>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-surface-100 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <Avatar user={c.users} size="sm" />
              <div className="flex-1 bg-surface-50 rounded-2xl px-3 py-2">
                <div className="text-xs font-semibold text-gray-700">
                  <button
                    onClick={() => c.users?.id && navigate(`/app/profile/${c.users.id}`)}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {c.users?.first_name} {c.users?.last_name}
                  </button>
                </div>
                <div className="text-sm text-gray-700 mt-0.5">{c.content}</div>
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-2">
            <Avatar user={currentUser} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                className="flex-1 bg-surface-50 border border-surface-200 rounded-xl
                           px-3 py-1.5 text-sm focus:outline-none focus:ring-2
                           focus:ring-brand-200"
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="px-3 py-1.5 bg-brand-600 text-white text-xs
                           rounded-xl disabled:opacity-40 hover:bg-brand-700 transition-colors">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── FeedPage ──────────────────────────────────────────────────────────────

function getPostSport(post) {
  const clubId = post.club_id
  const club = MOCK_CLUBS[clubId]
  return club?.sport ?? 'football'
}

export default function FeedPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [posts,          setPosts]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [likedPosts,     setLikedPosts]     = useState(new Set())
  const [error,          setError]          = useState(null)
  const [canPost,        setCanPost]        = useState(false)
  const [club,           setClub]           = useState(null)
  const [selectedSports, setSelectedSports] = useState(['all'])

  // Supporter sans club → charger les posts des clubs suivis depuis le mock
  const isFollowerMode = !currentUser.current_club_id && (currentUser.role === 'community' || currentUser.role === 'supporter')

  useEffect(() => {
    if (isFollowerMode) {
      const clubIds = getFeedClubIds(currentUser)
      const mockPosts = clubIds.flatMap(clubId => MOCK_FEED_POSTS[clubId] ?? [])
      mockPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setPosts(mockPosts)
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const data = await getFeedPosts(currentUser.id, currentUser.current_club_id)
        if (data && data.length > 0) {
          setPosts(data)

          const { data: myLikes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', currentUser.id)
          setLikedPosts(new Set(myLikes?.map(l => l.post_id) ?? []))
        } else {
          // Fallback to mock posts for all followed clubs
          const clubIds = getFeedClubIds(currentUser)
          const mockPosts = clubIds.flatMap(clubId => MOCK_FEED_POSTS[clubId] ?? [])
          mockPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          setPosts(mockPosts)
        }
      } catch {
        const clubIds = getFeedClubIds(currentUser)
        const mockPosts = clubIds.flatMap(clubId => MOCK_FEED_POSTS[clubId] ?? [])
        mockPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setPosts(mockPosts)
      }

      if (currentUser.current_club_id) {
        try {
          const ok = await canPostForClub(currentUser.id, currentUser.current_club_id)
          setCanPost(ok)

          if (ok) {
            const { data: c } = await supabase
              .from('clubs')
              .select('id, name')
              .eq('id', currentUser.current_club_id)
              .single()
            setClub(c)
          }
        } catch {
          // Mock mode: president/coach/staff can post
          if (['president', 'coach', 'staff'].includes(currentUser.role)) {
            setCanPost(true)
            setClub({ id: currentUser.current_club_id, name: 'FC Lens Académie' })
          }
        }
      }

      setLoading(false)
    }
    load()
  }, [currentUser.id, currentUser.current_club_id, isFollowerMode])

  const handleLike = async (postId) => {
    if (isFollowerMode) {
      setLikedPosts(prev => {
        const s = new Set(prev)
        s.has(postId) ? s.delete(postId) : s.add(postId)
        return s
      })
      return
    }
    const liked = await toggleLike(postId, currentUser.id)
    setLikedPosts(prev => {
      const s = new Set(prev)
      liked ? s.add(postId) : s.delete(postId)
      return s
    })
  }

  const filteredPosts = selectedSports.includes('all')
    ? posts
    : posts.filter(post => {
        const sport = getPostSport(post)
        return selectedSports.includes(sport)
      })

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Feed</h1>
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
        <div className="font-semibold mb-1">Erreur feed :</div>
        <div className="text-sm font-mono">{error}</div>
      </div>
    </div>
  )

  // Supporter sans aucun club suivi
  const noFollowedClubs = isFollowerMode && getFeedClubIds(currentUser).length === 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Feed</h1>

      {canPost && club && (
        <CreatePostBox
          club={club}
          authorId={currentUser.id}
          authorRole={currentUser.role}
          onPost={post => setPosts(prev => [post, ...prev])}
        />
      )}

      {/* Bandeau clubs suivis (mode supporter) */}
      {isFollowerMode && getFeedClubIds(currentUser).length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-gray-400">Clubs suivis :</span>
          {getFeedClubIds(currentUser).map(clubId => {
            const club = (MOCK_FEED_POSTS[clubId]?.[0]?.clubs) ?? { name: clubId }
            return (
              <button
                key={clubId}
                onClick={() => navigate(`/app/clubs/${clubId}`)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50
                           text-brand-700 rounded-full text-xs font-medium hover:bg-brand-100 transition-colors">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center
                                 justify-center text-[10px] font-bold">
                  {club.name[0]}
                </span>
                {club.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Filtres sports */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSports(['all'])}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedSports.includes('all')
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
          }`}
        >
          Tous les sports
        </button>
        {Object.entries(SPORTS).map(([key, sport]) => (
          <button
            key={key}
            onClick={() => {
              if (selectedSports.includes('all')) {
                setSelectedSports([key])
              } else if (selectedSports.includes(key)) {
                const next = selectedSports.filter(s => s !== key)
                setSelectedSports(next.length === 0 ? ['all'] : next)
              } else {
                setSelectedSports([...selectedSports.filter(s => s !== 'all'), key])
              }
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedSports.includes(key)
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
            }`}
          >
            {sport.icon} {sport.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600
                          rounded-full animate-spin" />
        </div>
      ) : noFollowedClubs ? (
        <EmptyState
          icon="📰"
          title="Suivez des clubs pour voir leurs actualités"
          description="Explorez des clubs et cliquez sur Suivre pour voir leurs posts ici."
          action={
            <button
              onClick={() => navigate('/app/team')}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-medium">
              Explorer les clubs
            </button>
          }
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Aucun post pour l'instant"
          description="Les clubs que vous suivez n'ont pas encore publié."
          action={
            <button
              onClick={() => navigate('/app/team')}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-medium">
              Explorer les clubs
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedPosts.has(post.id)}
              onLike={() => handleLike(post.id)}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  )
}
