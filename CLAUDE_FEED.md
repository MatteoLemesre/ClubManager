# ClubManager — Prompt Feed & Page Profil Club

Ce prompt couvre :
1. Le feed type Instagram/Twitter pour les clubs
2. La page profil public d'un club

Tables déjà créées par seed_test_data.sql :
- club_posts (id, club_id, author_id, content, media_url, media_type, created_at)
- post_comments (id, post_id, author_id, content, created_at)
- post_likes (post_id, user_id, created_at)

---

## Partie 1 — Feed (page principale)

### Route : /app/feed
### Visible par : tous les rôles

Le feed affiche les posts des clubs suivis par l'utilisateur
(club_follows + current_club_id).

### Fonctions db.js à ajouter

```js
// Posts du feed personnalisé
export const getFeedPosts = async (userId, currentClubId) => {
  // Récupérer les clubs suivis
  const { data: follows } = await supabase
    .from('club_follows')
    .select('club_id')
    .eq('user_id', userId)

  const followedIds = follows?.map(f => f.club_id) ?? []
  if (currentClubId) followedIds.push(currentClubId)
  const clubIds = [...new Set(followedIds)]

  if (!clubIds.length) return []

  const { data, error } = await supabase
    .from('club_posts')
    .select(`
      *,
      clubs(id, name, city),
      users!author_id(id, first_name, last_name),
      post_comments(count),
      post_likes(count)
    `)
    .in('club_id', clubIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

// Posts d'un club spécifique
export const getClubPosts = async (clubId) => {
  const { data, error } = await supabase
    .from('club_posts')
    .select(`
      *,
      users!author_id(id, first_name, last_name),
      post_comments(id, content, created_at, users!author_id(id, first_name, last_name)),
      post_likes(user_id)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Créer un post
export const createPost = async (clubId, authorId, content, mediaUrl, mediaType) => {
  const { data, error } = await supabase
    .from('club_posts')
    .insert({
      club_id:    clubId,
      author_id:  authorId,
      content:    content.trim(),
      media_url:  mediaUrl  || null,
      media_type: mediaType || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Commenter un post
export const addComment = async (postId, authorId, content) => {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, author_id: authorId, content: content.trim() })
    .select('*, users!author_id(id, first_name, last_name)')
    .single()
  if (error) throw error
  return data
}

// Liker / unliker
export const toggleLike = async (postId, userId) => {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    await supabase.from('post_likes').delete()
      .eq('post_id', postId).eq('user_id', userId)
    return false  // unliked
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
    return true   // liked
  }
}

// Vérifier si l'user peut poster au nom d'un club
export const canPostForClub = (user, clubId) => {
  if (!user || !clubId) return false
  if (user.current_club_id !== clubId) return false
  const roles = user.user_roles ?? []
  return roles.some(r =>
    (r.role_type === 'president' || r.role_type === 'coach') &&
    (r.scope_id === clubId || r.scope_type === 'team')
  )
}
```

### FeedPage.jsx — src/pages/app/FeedPage.jsx

```jsx
export default function FeedPage() {
  const { currentUser } = useAuth()
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [likedPosts,setLikedPosts]= useState(new Set())

  useEffect(() => {
    const load = async () => {
      const data = await getFeedPosts(currentUser.id, currentUser.current_club_id)
      setPosts(data)

      // Récupérer les likes de l'user
      const { data: myLikes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', currentUser.id)
      setLikedPosts(new Set(myLikes?.map(l => l.post_id) ?? []))

      setLoading(false)
    }
    load()
  }, [])

  const handleLike = async (postId) => {
    const liked = await toggleLike(postId, currentUser.id)
    setLikedPosts(prev => {
      const s = new Set(prev)
      liked ? s.add(postId) : s.delete(postId)
      return s
    })
    // Mettre à jour le count localement
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, _likeCount: (p._likeCount ?? 0) + (liked ? 1 : -1) }
        : p
    ))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Feed</h1>
      </div>

      {/* Zone de création de post — si l'user peut poster */}
      {canPostForClub(currentUser, currentUser.current_club_id) && (
        <CreatePostBox
          clubId={currentUser.current_club_id}
          onPost={(post) => setPosts(prev => [post, ...prev])}
        />
      )}

      {/* Liste des posts */}
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
            <button onClick={() => navigate('/app/team')}
              className="btn-primary">
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
```

### Composant CreatePostBox

```jsx
function CreatePostBox({ clubId, onPost }) {
  const { currentUser } = useAuth()
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)

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
        <Avatar user={currentUser} size="md" />
        <div className="flex-1">
          <textarea
            placeholder="Partagez une actualité de votre club..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {/* Bouton image — optionnel pour l'instant */}
              <button className="text-gray-400 hover:text-brand-600 p-1.5 rounded-lg
                                 hover:bg-brand-50 transition-all">
                <Image size={18} />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="btn-primary disabled:opacity-40">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
```

### Composant PostCard

```jsx
function PostCard({ post, liked, onLike, currentUser }) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [comments,     setComments]     = useState(post.post_comments ?? [])
  const [newComment,   setNewComment]   = useState('')
  const [likeCount,    setLikeCount]    = useState(post.post_likes?.length ?? 0)

  const author    = post.users
  const clubName  = post.clubs?.name
  const timeAgo   = formatDistanceToNow(new Date(post.created_at),
                      { addSuffix: true, locale: fr })

  const handleComment = async () => {
    if (!newComment.trim()) return
    const comment = await addComment(post.id, currentUser.id, newComment)
    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={author} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {author?.first_name} {author?.last_name}
            </span>
            <span className="text-xs text-gray-400">au nom de</span>
            <button
              onClick={() => navigate(`/app/clubs/${post.club_id}`)}
              className="text-sm font-medium text-brand-600 hover:underline">
              {clubName}
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{timeAgo}</div>
        </div>
      </div>

      {/* Contenu */}
      {post.content && (
        <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Image */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={post.media_url}
          alt="Post media"
          className="w-full rounded-xl object-cover max-h-80 mb-3"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-surface-100">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm transition-all ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}>
          {liked ? '❤️' : '🤍'}
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button
          onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1.5 text-sm text-gray-400
                     hover:text-brand-600 transition-all">
          <MessageCircle size={16} />
          <span>{comments.length > 0 ? comments.length : ''}</span>
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

          {/* Ajouter un commentaire */}
          <div className="flex gap-2 mt-2">
            <Avatar user={currentUser} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                className="flex-1 text-sm"
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="px-3 py-1.5 bg-brand-600 text-white text-xs
                           rounded-xl disabled:opacity-40 hover:bg-brand-700">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
```

---

## Partie 2 — Page Profil Club

### Route : /app/clubs/:clubId
### Visible par : tous les rôles

```jsx
// src/pages/app/ClubProfilePage.jsx
export default function ClubProfilePage() {
  const { clubId }     = useParams()
  const { currentUser }= useAuth()
  const navigate       = useNavigate()
  const [club,     setClub]     = useState(null)
  const [teams,    setTeams]    = useState([])
  const [posts,    setPosts]    = useState([])
  const [followed, setFollowed] = useState(false)
  const [activeTab,setActiveTab]= useState('feed')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamPlayers,  setTeamPlayers]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      const [c, t, p] = await Promise.all([
        getClubById(clubId),
        getTeamsByClub(clubId),
        getClubPosts(clubId),
      ])

      // Vérifier si l'user suit ce club
      const { data: follow } = await supabase
        .from('club_follows')
        .select('club_id')
        .eq('user_id', currentUser.id)
        .eq('club_id', clubId)
        .single()

      setClub(c)
      setTeams(t.filter(t => t.status === 'active'))
      setPosts(p)
      setFollowed(!!follow)
      setLoading(false)
    }
    load()
  }, [clubId])

  // Charger les joueurs quand une équipe est sélectionnée
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

  if (loading) return <Spinner />
  if (!club) return <div className="p-6">Club introuvable</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header club */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Logo ou initiales */}
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center
                            justify-center text-white text-2xl font-bold">
              {club.name[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                {club.name}
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {club.sports?.name} · {club.city}
                {club.department && ` · ${club.department}`}
              </div>
              {club.region && (
                <div className="text-xs text-gray-400 mt-0.5">{club.region}</div>
              )}
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              followed
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
            }`}>
            {followed ? '✓ Suivi' : '+ Suivre'}
          </button>
        </div>

        {/* Stats rapides */}
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
          { id: 'feed',   label: '📰 Actualités' },
          { id: 'teams',  label: '⚽ Équipes' },
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
            <EmptyState icon="📰" title="Aucun post" description="Ce club n'a pas encore publié." />
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
          {/* Sélection d'équipe */}
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
                <span className="ml-1.5 text-xs opacity-70">{team.category}</span>
              </button>
            ))}
          </div>

          {/* Joueurs de l'équipe sélectionnée */}
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
                                        justify-center text-brand-700 font-bold text-sm">
                          {tp.jersey_number ?? '?'}
                        </div>
                        <Avatar user={u} size="sm" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
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
```

---

## Partie 3 — Navigation mise à jour

Ajouter le Feed dans la nav :

```js
const NAV_ITEMS = [
  { to: '/app/feed',     icon: Newspaper,     label: 'Feed'       },
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements' },
  { to: '/app/team',     icon: Shield,        label: 'Équipes'    },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier' },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie' },
  { to: '/app/profile',  icon: User,          label: 'Profil'     },
]
// Importer Newspaper depuis lucide-react
```

---

## App.jsx — nouvelles routes

```jsx
import FeedPage        from './pages/app/FeedPage'
import ClubProfilePage from './pages/app/ClubProfilePage'

<Route path="feed"            element={<FeedPage />} />
<Route path="clubs/:clubId"   element={<ClubProfilePage />} />
```

---

## Règles strictes

1. Seuls président et coach peuvent créer un post (canPostForClub)
2. Tout le monde peut liker et commenter
3. Les posts sont publics — visibles par tous les membres du club
   et par les followers
4. Un post peut avoir du texte seul, une image seule, ou les deux
5. PostCard est un composant partagé entre FeedPage et ClubProfilePage
6. formatDistanceToNow de date-fns pour les heures relatives
7. Importer differenceInYears de date-fns pour l'âge des joueurs

---

## Ordre de priorité

1. seed_test_data.sql — exécuter dans Supabase
2. db.js — ajouter getFeedPosts, getClubPosts, createPost,
   addComment, toggleLike, canPostForClub
3. FeedPage.jsx + composants CreatePostBox et PostCard
4. ClubProfilePage.jsx
5. AppLayout.jsx — ajouter Feed dans la nav
6. App.jsx — routes /app/feed et /app/clubs/:clubId
ENDOFFILE