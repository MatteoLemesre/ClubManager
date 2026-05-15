import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MOCK_FEED_POSTS } from '../../context/AuthContext'
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

// ─── CreatePostBox ─────────────────────────────────────────────────────────

function CreatePostBox({ club, authorId, onPost }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data: post, error: err } = await supabase
        .from('club_posts')
        .insert({
          club_id:   club.id,
          author_id: authorId,
          content:   content.trim(),
        })
        .select(`
          *,
          clubs(id, name, city),
          users!author_id(id, first_name, last_name)
        `)
        .single()

      if (err) throw err
      setContent('')
      onPost(post)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-4 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center text-white font-bold text-lg flex-shrink-0">
          {club.name[0]}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-2">
            Publier au nom de <span className="font-semibold text-brand-600">{club.name}</span>
          </div>
          <textarea
            placeholder="Partagez une actualité, un résultat, une annonce..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full resize-none bg-surface-50 border border-surface-200
                       rounded-xl px-3 py-2 text-sm focus:outline-none
                       focus:border-brand-400 transition-all"
          />
          {error && (
            <div className="text-xs text-red-500 mt-1">{error}</div>
          )}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2
                         text-sm font-medium disabled:opacity-40 transition-colors">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PostCard ──────────────────────────────────────────────────────────────

export function PostCard({ post, liked, onLike, currentUser }) {
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
          <div className="font-semibold text-gray-900">{post.clubs?.name}</div>
          <div className="text-xs text-gray-400">
            par {post.users?.first_name} {post.users?.last_name}
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

      {/* Image */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={post.media_url}
          alt="Post media"
          className="w-full rounded-xl object-cover max-h-80 mb-3"
          onError={e => e.target.style.display = 'none'}
        />
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
                  {c.users?.first_name} {c.users?.last_name}
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

export default function FeedPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [error,      setError]      = useState(null)
  const [canPost,    setCanPost]    = useState(false)
  const [club,       setClub]       = useState(null)

  // Supporter sans club → charger les posts des clubs suivis depuis le mock
  const isFollowerMode = !currentUser.current_club_id && currentUser.role === 'supporter'

  useEffect(() => {
    if (isFollowerMode) {
      const followedClubs = currentUser.followed_clubs ?? []
      const mockPosts = followedClubs.flatMap(clubId => MOCK_FEED_POSTS[clubId] ?? [])
      mockPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setPosts(mockPosts)
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const data = await getFeedPosts(currentUser.id, currentUser.current_club_id)
        setPosts(data)

        const { data: myLikes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUser.id)
        setLikedPosts(new Set(myLikes?.map(l => l.post_id) ?? []))
      } catch (err) {
        console.error('FeedPage error:', err)
        setError(err.message)
      }

      if (currentUser.current_club_id) {
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
  const noFollowedClubs = isFollowerMode && (currentUser.followed_clubs ?? []).length === 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Feed</h1>

      {canPost && club && (
        <CreatePostBox
          club={club}
          authorId={currentUser.id}
          onPost={post => setPosts(prev => [post, ...prev])}
        />
      )}

      {/* Bandeau clubs suivis (mode supporter) */}
      {isFollowerMode && (currentUser.followed_clubs ?? []).length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-gray-400">Clubs suivis :</span>
          {(currentUser.followed_clubs ?? []).map(clubId => {
            const club = (MOCK_FEED_POSTS[clubId]?.[0]?.clubs) ?? { name: clubId }
            return (
              <span key={clubId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50
                           text-brand-700 rounded-full text-xs font-medium">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center
                                 justify-center text-[10px] font-bold">
                  {club.name[0]}
                </span>
                {club.name}
              </span>
            )
          })}
        </div>
      )}

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
      ) : posts.length === 0 ? (
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
          {posts.map(post => (
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
