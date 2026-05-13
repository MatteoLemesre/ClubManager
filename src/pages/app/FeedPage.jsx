import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, Avatar, EmptyState } from '../../components/ui'
import { MessageCircle, Image } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import {
  getFeedPosts,
  createPost,
  addComment,
  toggleLike,
  canPostForClub,
} from '../../services/db'

// ─── CreatePostBox ─────────────────────────────────────────────────────────

function CreatePostBox({ clubId, club, onPost }) {
  const { currentUser } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const post = await createPost(clubId, currentUser.id, content)
      setContent('')
      onPost(post)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center text-white font-bold text-lg flex-shrink-0">
          {club?.name?.[0] ?? '?'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Publier en tant que <span className="text-brand-600">{club?.name ?? '…'}</span>
          </div>
          <textarea
            placeholder="Partagez une actualité de votre club..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2
                       text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div className="flex items-center justify-between mt-3">
            <button className="text-gray-400 hover:text-brand-600 p-1.5 rounded-lg
                               hover:bg-brand-50 transition-all">
              <Image size={18} />
            </button>
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
    </Card>
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

  const author   = post.users
  const clubName = post.clubs?.name
  const timeAgo  = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: fr,
  })

  const handleComment = async () => {
    if (!newComment.trim()) return
    const comment = await addComment(post.id, currentUser.id, newComment)
    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const handleLike = () => {
    // Optimistic update du count
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    onLike()
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={author} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/app/clubs/${post.club_id}`)}
              className="font-semibold text-gray-900 hover:underline">
              {clubName}
            </button>
            <span className="text-xs text-gray-400">
              par {author?.first_name} {author?.last_name}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{timeAgo}</div>
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
  const [club,       setClub]       = useState(null)

  useEffect(() => {
    if (!currentUser.current_club_id) return
    import('../../services/db').then(db =>
      db.getClubById(currentUser.current_club_id).then(setClub).catch(() => {})
    )
  }, [currentUser.current_club_id])

  useEffect(() => {
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser.id, currentUser.current_club_id])

  const handleLike = async (postId) => {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Feed</h1>

      {canPostForClub(currentUser, currentUser.current_club_id) && (
        <CreatePostBox
          clubId={currentUser.current_club_id}
          club={club}
          onPost={post => setPosts(prev => [post, ...prev])}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600
                          rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon="📰"
          title="Aucun post pour l'instant"
          description="Suivez des clubs pour voir leurs actualités ici."
          action={
            <button
              onClick={() => navigate('/app/team')}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl
                         px-4 py-2 text-sm font-medium">
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
