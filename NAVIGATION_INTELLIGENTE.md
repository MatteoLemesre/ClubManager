# ClubManager — Navigation intelligente (tout cliquable)

Rendre tous les noms cliquables avec navigation vers pages détaillées + respect permissions.

---

## PRINCIPE

**Tout doit être cliquable et navigable :**
- Nom de club → page/pop-up club
- Nom de personne → pop-up profil joueur OU page profil
- Nom d'équipe → page détail équipe
- Match → page détail match
- Entraînement → page détail entraînement (si convoqué/coach/président)

---

## 1. NOMS DE CLUBS CLIQUABLES

### Où on trouve des noms de clubs

- Feed : posts de clubs
- Calendrier : matchs/entraînements
- TeamPage : cartes clubs
- Messagerie : rôle des personnes
- Profil joueur : historique

### Comportement clic

**Si club suivi ou mon club :**
```jsx
<button
  onClick={() => navigate(`/app/clubs/${club.id}`)}
  className="hover:text-brand-600 transition-colors">
  {club.name}
</button>
```

**Si club non suivi :**
```jsx
<button
  onClick={() => setShowClubPopup(club)}
  className="hover:text-brand-600 transition-colors">
  {club.name}
</button>
```

### Exemples

**Feed :**
```jsx
// Dans FeedPost
<div className="flex items-center gap-2 mb-2">
  <div className="w-10 h-10 rounded-full bg-brand-100" />
  <div>
    <button
      onClick={() => navigate(`/app/clubs/${post.club_id}`)}
      className="font-semibold text-gray-900 hover:text-brand-600">
      {post.club.name}
    </button>
    <div className="text-xs text-gray-500">
      {format(new Date(post.created_at), 'd MMM', { locale: fr })}
    </div>
  </div>
</div>
```

**Calendrier :**
```jsx
// Dans UpcomingItemCard pour un match
<button
  onClick={() => navigate(`/app/matches/${item.id}`)}
  className="p-4 bg-white rounded-xl border hover:border-brand-300">
  <div className="font-semibold text-sm text-gray-900 mb-1">
    ⚽ 
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigate(`/app/teams/${item.team_id}`)
      }}
      className="hover:text-brand-600">
      {item.team.name}
    </button>
    {' vs '}
    {item.opponent}
  </div>
</button>
```

---

## 2. NOMS DE PERSONNES CLIQUABLES

### Règle : joueur = pop-up détaillé, autres = page profil

**Si joueur :**
```jsx
<button
  onClick={() => setShowPlayerModal(player)}
  className="hover:text-brand-600 transition-colors">
  {player.first_name} {player.last_name}
</button>
```

**Si coach/président/supporter :**
```jsx
<button
  onClick={() => navigate(`/app/profile/${user.id}`)}
  className="hover:text-brand-600 transition-colors">
  {user.first_name} {user.last_name}
</button>
```

### Où on trouve des noms de personnes

- Feed : auteur du post, commentaires
- Messagerie : liste conversations
- Composition match : joueurs
- Convocations : liste convoqués
- Documents : uploadé par
- Covoiturages : proposé par

### Exemples

**Feed commentaire :**
```jsx
<div className="flex gap-2 p-3 bg-surface-50 rounded-xl">
  <div className="w-8 h-8 rounded-full bg-brand-100" />
  <div className="flex-1">
    <div className="text-sm">
      <button
        onClick={() => {
          if (comment.author.role === 'player') {
            setShowPlayerModal(comment.author)
          } else {
            navigate(`/app/profile/${comment.author_id}`)
          }
        }}
        className="font-semibold text-gray-900 hover:text-brand-600">
        {comment.author.first_name} {comment.author.last_name}
      </button>
      <span className="text-gray-600"> {comment.content}</span>
    </div>
  </div>
</div>
```

**Composition match :**
```jsx
{composition.titulaires.map(player => (
  <button
    key={player.id}
    onClick={() => setShowPlayerModal(player)}
    className="flex items-center gap-2 p-2 hover:bg-surface-50 rounded-lg transition-all">
    <span className="text-gray-500">#{player.jersey_number}</span>
    <span className="font-medium text-gray-900 hover:text-brand-600">
      {player.first_name} {player.last_name}
    </span>
    <span className="text-sm text-gray-500">{player.position}</span>
    {player.goals > 0 && (
      <span className="text-sm">⚽ {player.goals}</span>
    )}
  </button>
))}
```

**Covoiturage :**
```jsx
<div className="p-4 bg-surface-50 rounded-xl">
  <div className="flex items-center gap-2 mb-2">
    <button
      onClick={() => {
        if (carpool.author.role === 'player') {
          setShowPlayerModal(carpool.author)
        } else {
          navigate(`/app/profile/${carpool.author_id}`)
        }
      }}
      className="font-semibold text-gray-900 hover:text-brand-600">
      {carpool.author.first_name} {carpool.author.last_name}
    </button>
    <span className="text-sm text-gray-600">
      propose {carpool.seats} places
    </span>
  </div>
  <div className="text-sm text-gray-600">
    📍 Départ {carpool.departure_location} · {carpool.departure_time}
  </div>
</div>
```

---

## 3. NOMS D'ÉQUIPES CLIQUABLES

### Partout où on voit un nom d'équipe

```jsx
<button
  onClick={() => navigate(`/app/teams/${team.id}`)}
  className="hover:text-brand-600 transition-colors">
  {team.name}
</button>
```

### Exemples

**Calendrier entraînement :**
```jsx
<div className="font-semibold text-sm text-gray-900 mb-1">
  🏃 Entraînement{' '}
  <button
    onClick={(e) => {
      e.stopPropagation()
      navigate(`/app/teams/${item.team_id}`)
    }}
    className="hover:text-brand-600">
    {item.team.name}
  </button>
</div>
```

**Messagerie rôle :**
```jsx
<div className="text-xs text-gray-500">
  Coach{' '}
  <button
    onClick={() => navigate(`/app/teams/${user.team_id}`)}
    className="hover:text-brand-600">
    {user.team.name}
  </button>
  {' · '}
  <button
    onClick={() => navigate(`/app/clubs/${user.club_id}`)}
    className="hover:text-brand-600">
    {user.club.name}
  </button>
</div>
```

---

## 4. PAGE PROFIL AUTRE USER

### Nouvelle route : `/app/profile/:userId`

**Comportement :**
- Si `userId` absent ou égal à currentUser → affiche profil connecté (éditable)
- Si `userId` différent → affiche profil en lecture seule

```jsx
// App.jsx
<Route path="/app/profile" element={<ProfilePage />} />
<Route path="/app/profile/:userId" element={<ProfilePage />} />
```

**ProfilePage.jsx :**
```jsx
export default function ProfilePage() {
  const { userId } = useParams()
  const { currentUser } = useAuth()
  
  // Si pas d'userId ou userId = currentUser, c'est mon profil
  const isMyProfile = !userId || userId === currentUser.id
  
  // Récupérer le user à afficher
  const displayedUser = isMyProfile 
    ? currentUser 
    : mockUsers.find(u => u.id === userId)
  
  if (!displayedUser) {
    return <div>Utilisateur introuvable</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
        {/* ... */}
        
        {/* Bouton modifier uniquement si c'est mon profil */}
        {isMyProfile && (
          <button className="btn-secondary">
            Modifier mon profil
          </button>
        )}
        
        {/* Bouton message si ce n'est pas moi */}
        {!isMyProfile && (
          <button
            onClick={() => navigate('/app/messages', {
              state: { startConversationWith: displayedUser.id }
            })}
            className="btn-primary">
            💬 Envoyer un message
          </button>
        )}
      </div>
      
      {/* ... reste du profil en lecture seule */}
    </div>
  )
}
```

---

## 5. PERMISSIONS AFFICHAGE

### Règle de notation match

**UNIQUEMENT joueurs ayant joué peuvent noter :**

```jsx
// Dans MatchDetailPage, onglet Événements
const canRate = 
  currentUser.role === 'player' &&
  match.team_id === currentUser.teams?.[0] && // Joueur de cette équipe
  match.composition?.some(c => c.user_id === currentUser.id && c.played) && // A joué
  match.score_home !== undefined // Match terminé

{canRate && (
  <div className="mt-6">
    <button 
      onClick={() => setShowRatingModal(true)}
      className="btn-primary">
      ⭐ Noter mes coéquipiers
    </button>
  </div>
)}

{currentUser.role === 'player' && !canRate && (
  <div className="text-center py-6 text-gray-400 text-sm">
    Seuls les joueurs ayant participé au match peuvent noter.
  </div>
)}
```

### Règle convocations

**Coach/président gèrent, joueurs déclarent :**

```jsx
// Bouton "Gérer convocations" visible uniquement coach/président
{(isCoachOfTeam || isPresident) && (
  <button 
    onClick={() => setShowManageConvocations(true)}
    className="btn-secondary">
    Gérer les convocations
  </button>
)}

// Déclaration dispo visible uniquement si joueur convoqué
{isPlayerConvoked && (
  <div>
    <label>Votre disponibilité :</label>
    <div className="flex gap-2">
      <button onClick={() => setAvailability('available')}>
        ✓ Disponible
      </button>
      <button onClick={() => setAvailability('unavailable')}>
        ✗ Indisponible
      </button>
    </div>
  </div>
)}
```

### Règle documents

**Visibilité hiérarchique :**

```jsx
const canViewDocuments = 
  displayedUser.id === currentUser.id || // Moi-même
  (currentUser.role === 'coach' && 
   currentUser.teams?.some(t => displayedUser.teams?.includes(t))) || // Mon joueur
  (currentUser.role === 'president' && 
   currentUser.current_club_id === displayedUser.current_club_id) // Mon club

{canViewDocuments ? (
  <div>
    {/* Liste documents */}
  </div>
) : (
  <div className="text-center py-6 text-gray-400 text-sm">
    🔒 Documents accessibles uniquement au coach et président
  </div>
)}
```

### Règle coordonnées RGPD

```jsx
const canViewContact = 
  displayedUser.id === currentUser.id || // Moi-même
  currentUser.teams?.some(t => displayedUser.teams?.includes(t)) || // Coéquipier
  (currentUser.role === 'coach' && 
   currentUser.teams?.some(t => displayedUser.teams?.includes(t))) || // Mon joueur
  (currentUser.role === 'president' && 
   currentUser.current_club_id === displayedUser.current_club_id) // Mon club

{canViewContact ? (
  <div>
    <div>📧 {displayedUser.email}</div>
    <div>📞 {displayedUser.phone}</div>
    <div>🏠 {displayedUser.address}</div>
  </div>
) : (
  <div className="text-center py-6 text-gray-400 text-sm">
    🔒 Coordonnées accessibles uniquement aux coéquipiers, coach et président
  </div>
)}
```

---

## 6. COMPOSANT HELPER : ClickableName

Pour simplifier, créer un composant réutilisable :

```jsx
function ClickableName({ user, className = '' }) {
  const navigate = useNavigate()
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  const handleClick = () => {
    if (user.role === 'player') {
      setShowPlayerModal(true)
    } else {
      navigate(`/app/profile/${user.id}`)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`hover:text-brand-600 transition-colors ${className}`}>
        {user.first_name} {user.last_name}
      </button>
      
      {showPlayerModal && (
        <PlayerDetailModal
          player={user}
          onClose={() => setShowPlayerModal(false)}
        />
      )}
    </>
  )
}

// Usage
<ClickableName user={author} className="font-semibold" />
```

---

## RÉSUMÉ

1. ✅ Noms de clubs cliquables → page club ou pop-up
2. ✅ Noms de personnes cliquables → pop-up joueur ou page profil
3. ✅ Noms d'équipes cliquables → page détail équipe
4. ✅ Route `/app/profile/:userId` pour profil autre user
5. ✅ Permissions notation : uniquement joueurs ayant joué
6. ✅ Permissions convocations : coach/président gèrent, joueurs déclarent
7. ✅ Permissions documents : hiérarchique
8. ✅ Permissions coordonnées : RGPD strict
9. ✅ Composant helper ClickableName réutilisable

---

## POUR CLAUDE CODE

```
Implémenter NAVIGATION_INTELLIGENTE.md :

1. Rendre tous les noms de clubs cliquables (Feed, Calendrier, Messagerie...)
2. Rendre tous les noms de personnes cliquables (Feed, Compo, Convoc, Covoit...)
3. Rendre tous les noms d'équipes cliquables
4. Créer route /app/profile/:userId avec mode lecture seule
5. Vérifier permissions partout (notation, convoc, docs, contact)
6. Créer composant ClickableName helper
7. Tester navigation complète entre pages

Objectif : site cohérent où tout est cliquable et explorable.
```
