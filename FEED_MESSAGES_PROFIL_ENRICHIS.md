# ClubManager — Feed enrichi + Réactions messages + Profil enrichi

Trois nouvelles fonctionnalités pour un site plus complet.

---

## PARTIE 1 — FEED ENRICHI (photos/liens pour coach/président)

### Modal création post (FeedPage)

**Avant :** juste texte

**Après :** texte + images/vidéos + liens

```jsx
function CreatePostModal({ clubId, authorId, authorRole, onClose, onCreate }) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [links, setLinks] = useState([])
  const [newLink, setNewLink] = useState('')
  const [loading, setLoading] = useState(false)

  const canPostMedia = authorRole === 'coach' || authorRole === 'president'

  const handleAddImage = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now(),
          name: file.name,
          data: e.target.result, // base64
          type: file.type,
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddLink = () => {
    if (newLink.trim() && newLink.includes('http')) {
      setLinks(prev => [...prev, {
        id: Date.now(),
        url: newLink.trim(),
      }])
      setNewLink('')
    }
  }

  const handleCreate = async () => {
    if (!content.trim() && images.length === 0) {
      alert('Veuillez écrire quelque chose ou ajouter une image')
      return
    }

    setLoading(true)

    const newPost = {
      id: `post-${Date.now()}`,
      club_id: clubId,
      author_id: authorId,
      author: mockUsers.find(u => u.id === authorId),
      content: content.trim() || null,
      images: images.map(img => ({
        id: img.id,
        url: img.data,
        type: img.type,
      })),
      links: links,
      created_at: new Date().toISOString(),
      likes: [],
      comments: [],
    }

    onCreate(newPost)
    setLoading(false)
    onClose()
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Votre message
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="Partagez une bonne nouvelle, une info, un moment important..."
              className="w-full"
            />
          </div>

          {/* Images (si coach/président) */}
          {canPostMedia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos/Vidéos (optionnel)
              </label>
              
              {/* Upload */}
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed 
                               border-surface-200 rounded-xl hover:border-brand-300 cursor-pointer 
                               transition-all">
                <span className="text-2xl">📸</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Ajouter des photos/vidéos
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, MP4 (max 10 Mo)
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleAddImage}
                  className="hidden"
                />
              </label>

              {/* Aperçu images */}
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {images.map(img => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.data}
                        alt="aperçu"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full 
                                 w-6 h-6 flex items-center justify-center hover:bg-red-700">
                        ✕
                      </button>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {img.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liens (si coach/président) */}
          {canPostMedia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liens (optionnel)
              </label>
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <button
                  onClick={handleAddLink}
                  disabled={!newLink.trim() || !newLink.includes('http')}
                  className="btn-secondary disabled:opacity-40">
                  + Ajouter
                </button>
              </div>

              {/* Liens ajoutés */}
              {links.length > 0 && (
                <div className="mt-2 space-y-2">
                  {links.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-2 
                                                bg-surface-50 rounded-lg">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:underline truncate">
                        {link.url}
                      </a>
                      <button
                        onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))}
                        className="text-gray-400 hover:text-red-600">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 btn-primary justify-center disabled:opacity-40">
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Affichage post avec images/liens

```jsx
function FeedPost({ post }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand-100" />
        <div>
          <button
            onClick={() => {/* navigate club */}}
            className="font-semibold text-gray-900 hover:text-brand-600">
            {post.club.name}
          </button>
          <div className="text-xs text-gray-500">
            {format(new Date(post.created_at), 'd MMM', { locale: fr })}
          </div>
        </div>
      </div>

      {/* Contenu texte */}
      {post.content && (
        <p className="text-gray-900 mb-4">{post.content}</p>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {post.images.map(img => (
            <div key={img.id} className="overflow-hidden rounded-xl">
              {img.type.startsWith('video') ? (
                <video
                  src={img.url}
                  controls
                  className="w-full h-64 object-cover">
                </video>
              ) : (
                <img
                  src={img.url}
                  alt="post"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Liens */}
      {post.links && post.links.length > 0 && (
        <div className="mb-4 space-y-2">
          {post.links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 border border-surface-200 rounded-lg
                       hover:bg-surface-50 transition-all">
              <span className="text-xl">🔗</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-brand-600 truncate">
                  {new URL(link.url).hostname}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {link.url}
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </a>
          ))}
        </div>
      )}

      {/* Likes & Comments */}
      <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-surface-200 pt-4">
        <button className="hover:text-brand-600">
          👍 {post.likes?.length || 0}
        </button>
        <button className="hover:text-brand-600">
          💬 {post.comments?.length || 0}
        </button>
      </div>
    </div>
  )
}
```

---

## PARTIE 2 — RÉACTIONS RAPIDES MESSAGERIE

### Dans MessagesPage, messages individuels

```jsx
function MessageBubble({ message, currentUserId }) {
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState(null)

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥']

  const handleReaction = (emoji) => {
    setSelectedReaction(emoji)
    // Enregistrer la réaction
    // updateMessageReaction(message.id, emoji)
    setShowReactions(false)
  }

  const isOwn = message.author_id === currentUserId

  return (
    <div className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group">
        {/* Message bubble */}
        <div
          className={`max-w-xs px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-brand-600 text-white rounded-br-none'
              : 'bg-surface-100 text-gray-900 rounded-bl-none'
          }`}>
          <p className="text-sm">{message.content}</p>
          <div className="text-xs opacity-70 mt-1">
            {format(new Date(message.created_at), 'HH:mm')}
          </div>
        </div>

        {/* Bouton réactions (visible au hover) */}
        <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="text-xl hover:scale-125 transition-transform">
            😊
          </button>
        </div>

        {/* Menu réactions */}
        {showReactions && (
          <div className="absolute bottom-10 right-0 bg-white rounded-2xl shadow-lg p-2 
                         flex gap-1 border border-surface-200 z-10">
            {reactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform hover:bg-surface-50 
                         rounded-lg p-1">
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Reaction affichée */}
        {selectedReaction && (
          <div className="absolute -bottom-2 -right-2 text-lg bg-white rounded-full 
                         w-6 h-6 flex items-center justify-center border-2 border-brand-600">
            {selectedReaction}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Mock data messages avec réactions

```js
const mockMessages = [
  {
    id: 'msg1',
    conversation_id: 'conv1',
    author_id: 'player-1',
    author: { first_name: 'Karim', last_name: 'Diallo' },
    content: 'Salut, ça va ? Tu es dispo pour l\'entraînement de demain ?',
    created_at: '2026-05-20T14:30:00Z',
    reactions: [
      { emoji: '👍', count: 2, users: ['coach-1', 'player-2'] },
    ],
  },
  {
    id: 'msg2',
    conversation_id: 'conv1',
    author_id: 'coach-1',
    author: { first_name: 'Marie', last_name: 'Martin' },
    content: 'Oui, 100% dispo !',
    created_at: '2026-05-20T14:35:00Z',
    reactions: [
      { emoji: '❤️', count: 1, users: ['player-1'] },
      { emoji: '🔥', count: 1, users: ['player-2'] },
    ],
  },
]
```

---

## PARTIE 3 — PROFIL ENRICHI (photo + bio)

### Section profil à ajouter

```
┌────────────────────────────────────────────────────┐
│                  [Photo cliquable]                 │
│              [Modifier photo] [Supprimer]          │
│                                                    │
│             Karim Diallo                           │
│                24 ans                              │
│                                                    │
│  ⚽ Joueur Séniors A · FC Lens Académie           │
│                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                    │
│  📝 À PROPOS                                       │
│                                                    │
│  "Passionné de foot depuis toujours, je joue     │
│   en attaque et j'adore les défis. Toujours      │
│   prêt à aider mes coéquipiers !"                │
│                                                    │
│  [Modifier ma bio]                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Code ProfilePage enrichi

```jsx
function ProfilePage() {
  const { userId } = useParams()
  const { currentUser } = useAuth()
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showBioEdit, setShowBioEdit] = useState(false)
  
  const isMyProfile = !userId || userId === currentUser.id
  const displayedUser = isMyProfile 
    ? currentUser 
    : mockUsers.find(u => u.id === userId)

  const handleUploadPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      // Enregistrer la photo
      // updateUserPhoto(currentUser.id, e.target.result)
      setShowPhotoUpload(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveBio = (newBio) => {
    // Enregistrer la bio
    // updateUserBio(currentUser.id, newBio)
    setShowBioEdit(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header profil */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
        
        {/* Photo profil */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="w-32 h-32 rounded-full bg-brand-600 
                          flex items-center justify-center text-white 
                          font-bold text-4xl">
            {displayedUser.first_name[0]}{displayedUser.last_name[0]}
          </div>
          
          {/* Bouton modifier photo (si mon profil) */}
          {isMyProfile && (
            <div className="absolute bottom-0 right-0 flex gap-1">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="w-10 h-10 bg-brand-600 text-white rounded-full 
                         flex items-center justify-center hover:bg-brand-700
                         shadow-lg">
                ✏️
              </button>
            </div>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          {displayedUser.first_name} {displayedUser.last_name}
        </h1>
        
        <div className="text-lg text-gray-500 mb-4">
          {differenceInYears(new Date(), new Date(displayedUser.birth_date))} ans
        </div>
        
        {/* Badge rôle */}
        {displayedUser.current_club_id && (
          <div className="inline-flex items-center gap-2 px-4 py-2 
                          bg-brand-50 rounded-full text-brand-700 text-sm font-medium mb-4">
            {displayedUser.role === 'player' && '⚽ Joueur'}
            {displayedUser.role === 'coach' && '👔 Coach'}
            {displayedUser.role === 'president' && '👔 Président'}
            {displayedUser.role === 'supporter' && '👥 Supporter'}
            {' · '}
            {mockClubs.find(c => c.id === displayedUser.current_club_id)?.name}
          </div>
        )}
      </div>

      {/* Section Bio */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">📝 À propos</h2>
          {isMyProfile && (
            <button
              onClick={() => setShowBioEdit(true)}
              className="text-sm text-brand-600 hover:underline">
              Modifier
            </button>
          )}
        </div>
        
        {displayedUser.bio ? (
          <p className="text-gray-700">{displayedUser.bio}</p>
        ) : (
          <p className="text-gray-400 italic">
            {isMyProfile 
              ? 'Présentez-vous ! Cliquez sur "Modifier" pour ajouter une description.'
              : 'Aucune description pour l\'instant.'}
          </p>
        )}
      </div>

      {/* ... reste du profil */}

      {/* Modal upload photo */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold mb-4">Changer votre photo</h2>
            
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed 
                           border-surface-200 rounded-xl hover:border-brand-300 cursor-pointer">
              <span className="text-4xl">📸</span>
              <div>
                <div className="font-medium text-gray-900">Choisir une photo</div>
                <div className="text-sm text-gray-500">PNG, JPG (max 5 Mo)</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setShowPhotoUpload(false)}
              className="w-full mt-4 btn-secondary justify-center">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal edit bio */}
      {showBioEdit && (
        <EditBioModal
          currentBio={displayedUser.bio}
          onSave={handleSaveBio}
          onClose={() => setShowBioEdit(false)}
        />
      )}
    </div>
  )
}

function EditBioModal({ currentBio, onSave, onClose }) {
  const [bio, setBio] = useState(currentBio || '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold mb-4">Modifiez votre bio</h2>
        
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={300}
          rows={5}
          placeholder="Présentez-vous en quelques lignes..."
          className="w-full mb-2"
        />
        
        <div className="text-xs text-gray-500 text-right mb-4">
          {bio.length}/300
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={() => onSave(bio)} className="flex-1 btn-primary justify-center">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Mock data utilisateur enrichi

```js
const mockUsers = [
  {
    id: 'player-1',
    first_name: 'Karim',
    last_name: 'Diallo',
    photo: null, // URL ou base64
    bio: 'Passionné de foot depuis toujours, je joue en attaque et j\'adore les défis. Toujours prêt à aider mes coéquipiers !',
    // ... autres champs
  },
  {
    id: 'coach-1',
    first_name: 'Marie',
    last_name: 'Martin',
    photo: null,
    bio: 'Coach depuis 15 ans. Spécialisée en technique offensive. Croyante au développement des jeunes talents.',
    // ... autres champs
  },
]
```

---

## RÉSUMÉ

1. ✅ Feed : coach/président peuvent ajouter photos/vidéos + liens
2. ✅ Messagerie : réactions rapides (👍 ❤️ 😂 😮 😢 🔥)
3. ✅ Profil : photo modifiable + bio personnelle (300 caractères max)

---

## POUR CLAUDE CODE

```
Implémenter FEED_MESSAGES_PROFIL_ENRICHIS.md :

Partie 1 - Feed enrichi
- Modal création avec upload images/vidéos (coach/président uniquement)
- Champ liens URL
- Affichage post avec galerie images

Partie 2 - Réactions messagerie
- Menu réactions au hover (👍 ❤️ 😂 😮 😢 🔥)
- Affichage réactions sur messages
- Mock data avec réactions

Partie 3 - Profil enrichi
- Photo de profil modifiable
- Bio personnelle (300 caractères max)
- Sections dans page profil

Tester avec coach/président pour feed enrichi.
```
