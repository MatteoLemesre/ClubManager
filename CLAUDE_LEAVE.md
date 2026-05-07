# ClubManager — Prompt Refonte Inscription & Départ de Club

Ce prompt couvre la refonte complète du flux d'inscription
et la gestion du départ d'un club.
SQL correspondant : migration_v2_3.sql (à exécuter avant)
Lire CLAUDE.md et CLAUDE_SUPABASE.md pour le contexte général.

---

## Principe fondamental (à appliquer partout)

```
Toute personne crée d'abord un compte → interface supporter
                    ↓
        Peut rejoindre un club (avec validation selon rôle)
        Ou créer un club (devient président)
                    ↓
        Peut quitter à tout moment → redevient supporter
        Peut rejoindre un autre club
```

Les équipes et les membres sont totalement dissociés :
- Un membre existe indépendamment de tout club
- Un club existe indépendamment de ses membres
- L'appartenance est une relation temporaire avec historique

---

## Partie 1 — Flux d'inscription refondu

### RegisterPage.jsx — REFAIRE

**Route :** `/register`

Créer un compte = créer un profil complet.
Pas de club à ce stade. Compte actif immédiatement avec rôle `supporter`.

```jsx
const handleRegister = async () => {
  // Validations
  if (password !== confirmPwd)  throw 'Les mots de passe ne correspondent pas'
  if (password.length < 8)      throw 'Mot de passe trop court (8 caractères min)'
  const existing = await getUserByEmail(email)
  if (existing)                 throw 'Cet email est déjà utilisé'

  // Créer le compte avec rôle supporter par défaut
  const user = await createUser({
    email:           email.toLowerCase().trim(),
    password_hash:   hashPassword(password),
    first_name:      firstName.trim(),
    last_name:       lastName.trim(),
    birth_date:      birthDate || null,
    phone:           phone.trim() || null,
    birth_place:     birthPlace.trim() || null,
    account_status:  'active',
    current_club_id: null,
    // role par défaut = supporter, pas besoin de user_roles ici
  })

  // Connecter automatiquement
  setSession(user.id)

  // Rediriger vers le profil avec un message de bienvenue
  navigate('/app/profile?welcome=true')
}
```

**Design :** page épurée, fond brand-950, card blanche centrée.
Champs : Prénom, Nom, Date de naissance, Lieu de naissance (optionnel),
Téléphone (optionnel), Email, Mot de passe, Confirmer mot de passe.

Lien en bas : "Déjà un compte ? Se connecter" → `/login`

---

## Partie 2 — Profil avec "Rejoindre un club"

### ProfilePage.jsx — METTRE À JOUR

Quand `currentUser.current_club_id` est null, afficher en haut du profil
une bannière d'action :

```jsx
{!currentUser.current_club_id && viewingOwnProfile && (
  <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-2xl
                  flex items-center justify-between">
    <div>
      <div className="font-semibold text-brand-900">Vous n'êtes dans aucun club</div>
      <div className="text-sm text-brand-600 mt-0.5">
        Rejoignez un club existant ou créez le vôtre
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={() => navigate('/join-club')}
        className="btn-primary text-sm">
        Rejoindre un club
      </button>
      <button onClick={() => navigate('/register/club')}
        className="btn-secondary text-sm">
        Créer un club
      </button>
    </div>
  </div>
)}
```

Quand l'utilisateur est dans un club, afficher à la place
le nom du club + bouton "Quitter le club" :

```jsx
{currentUser.current_club_id && viewingOwnProfile && (
  <div className="mb-6 p-4 bg-surface-100 border border-surface-200 rounded-2xl
                  flex items-center justify-between">
    <div>
      <div className="font-semibold text-gray-900">{club?.name}</div>
      <div className="text-sm text-gray-500 mt-0.5 capitalize">
        {currentUser.role} · {club?.sports?.name} · {club?.city}
      </div>
    </div>
    <button onClick={() => setShowLeaveConfirm(true)}
      className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50
                 px-3 py-1.5 rounded-xl border border-red-200 transition-all">
      Quitter le club
    </button>
  </div>
)}
```

---

## Partie 3 — JoinClubPage.jsx — METTRE À JOUR

**Route :** `/join-club`
**Accessible depuis :** ProfilePage (bannière) ou après inscription

### Recherche de club

La recherche doit permettre de filtrer par **région, département ou ville** :

```jsx
const [searchMode, setSearchMode] = useState('name') // 'name' | 'city' | 'region'
const [search, setSearch] = useState('')

const filtered = clubs.filter(c => {
  const q = search.toLowerCase()
  if (searchMode === 'name')   return c.name.toLowerCase().includes(q)
  if (searchMode === 'city')   return c.city?.toLowerCase().includes(q)
  if (searchMode === 'region') return c.region?.toLowerCase().includes(q)
                                   || c.postal_code?.startsWith(q)
  return false
})
```

Toolbar de recherche :
```jsx
<div className="flex gap-2 mb-3">
  {['name','city','region'].map(mode => (
    <button key={mode}
      onClick={() => setSearchMode(mode)}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        searchMode === mode
          ? 'bg-brand-600 text-white border-brand-600'
          : 'bg-white text-gray-600 border-surface-200'
      }`}>
      {mode === 'name'   ? 'Nom'     : ''}
      {mode === 'city'   ? 'Ville'   : ''}
      {mode === 'region' ? 'Région / Dép.' : ''}
    </button>
  ))}
</div>
<input
  placeholder={
    searchMode === 'name'   ? 'Nom du club...' :
    searchMode === 'city'   ? 'Ville...' :
    'Région ou code postal...'
  }
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
```

Affichage des résultats :
```jsx
{filtered.map(club => (
  <button key={club.id}
    onClick={() => setSelectedClub(club)}
    className={`w-full text-left p-4 rounded-2xl border transition-all ${
      selectedClub?.id === club.id
        ? 'border-brand-400 bg-brand-50'
        : 'border-surface-200 hover:border-surface-300 bg-white'
    }`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="font-semibold text-gray-900">{club.name}</div>
        <div className="text-sm text-gray-500 mt-0.5">
          {club.sports?.name}
        </div>
      </div>
      <div className="text-right text-xs text-gray-400">
        <div>{club.city}</div>
        {club.postal_code && <div>{club.postal_code}</div>}
        {club.region && <div>{club.region}</div>}
      </div>
    </div>
  </button>
))}
```

---

## Partie 4 — RegisterClubPage.jsx — METTRE À JOUR

Ajouter le champ **région** dans le formulaire club :

```jsx
// Champs club à mettre à jour
{
  name:        'Nom de l\'association',
  sport:       'Sport',
  address:     'Adresse',
  postalCode:  'Code postal',
  city:        'Ville',
  region:      'Région',        // ← AJOUTER
  country:     'Pays',
  email:       'Email du club',
  phone:       'Téléphone',
}
```

Ajouter dans la table clubs via db.js :
```js
// Dans createClub, ajouter le champ region
const club = await createClub({
  ...
  region: region.trim() || null,
})
```

Ajouter dans Supabase :
```sql
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS region VARCHAR(128);
```

---

## Partie 5 — Quitter un club

### Logique dans db.js

```js
export const leaveClub = async (userId, clubId) => {
  const { error } = await supabase.rpc('leave_club', {
    p_user_id: userId,
    p_club_id: clubId,
    p_reason:  'left',
  })
  if (error) throw error
}

export const canPresidentLeave = async (userId, clubId) => {
  const { data, error } = await supabase.rpc('can_president_leave', {
    p_user_id: userId,
    p_club_id: clubId,
  })
  if (error) throw error
  return data // boolean
}
```

### Modal de confirmation dans ProfilePage.jsx

```jsx
{showLeaveConfirm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-md p-6">
      <h2 className="font-display text-xl font-bold mb-2">
        Quitter {club?.name} ?
      </h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Vous perdrez immédiatement accès aux informations internes du club.
        Votre historique sera conservé dans votre profil.
        Vous pourrez rejoindre un autre club quand vous le souhaitez.
      </p>

      {/* Blocage si président seul */}
      {isLastPresident && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                        text-sm text-red-700 mb-4">
          ⚠️ Vous êtes le seul président de ce club.
          Nommez un autre président avant de partir.
        </div>
      )}

      {leaveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                        text-sm text-red-700 mb-4">
          {leaveError}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setShowLeaveConfirm(false)}
          className="flex-1 btn-secondary justify-center">
          Annuler
        </button>
        <button
          disabled={isLastPresident || leaveLoading}
          onClick={handleLeaveClub}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40
                     text-white text-sm font-medium px-4 py-2 rounded-xl
                     transition-all justify-center flex items-center gap-2">
          {leaveLoading ? 'En cours...' : 'Confirmer le départ'}
        </button>
      </div>
    </Card>
  </div>
)}
```

### Logique handleLeaveClub dans ProfilePage.jsx

```js
const handleLeaveClub = async () => {
  setLeaveLoading(true)
  setLeaveError('')
  try {
    // Vérifier si président peut partir
    if (currentUser.role === 'president') {
      const canLeave = await canPresidentLeave(currentUser.id, currentUser.current_club_id)
      if (!canLeave) {
        setLeaveError('Vous devez nommer un autre président avant de partir.')
        return
      }
    }

    // Si c'était le seul coach d'une équipe → le président devient coach
    // (géré côté DB dans la fonction leave_club)

    await leaveClub(currentUser.id, currentUser.current_club_id)

    // Rafraîchir le user
    await refreshUser()

    setShowLeaveConfirm(false)

    // Rediriger vers le profil (maintenant sans club)
    navigate('/app/profile')

  } catch (err) {
    setLeaveError(err.message)
  } finally {
    setLeaveLoading(false)
  }
}
```

---

## Partie 6 — Règles de départ selon le rôle

### Si le dernier président part → BLOQUÉ

```js
// Vérification avant d'afficher le bouton "Confirmer"
useEffect(() => {
  if (!currentUser || currentUser.role !== 'president') return
  canPresidentLeave(currentUser.id, currentUser.current_club_id)
    .then(can => setIsLastPresident(!can))
}, [currentUser])
```

### Si un coach part → le président prend le relais

La fonction SQL `leave_club` gère déjà le retrait du coach des équipes.
Côté UI, afficher un message informatif dans la modale si rôle = coach :

```jsx
{currentUser.role === 'coach' && (
  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl
                  text-sm text-orange-700 mb-4">
    ℹ️ Si vous étiez le seul coach d'une équipe, le président
    sera assigné comme responsable jusqu'à la nomination d'un nouveau coach.
  </div>
)}
```

### Si un joueur part → rien de spécial

Juste le message de confirmation standard.

---

## Partie 7 — Vue résultats inter-clubs (tous les rôles)

Tout le monde (y compris les supporters sans club) peut voir
les résultats des matchs de toutes les équipes enregistrées.

### Page résultats publics — src/pages/app/ResultsPage.jsx

**Route :** `/app/results`
**Visible par tous les rôles** (ajouter dans NAV_ITEMS)

```jsx
export default function ResultsPage() {
  const { currentUser } = useAuth()
  const [matches,     setMatches]     = useState([])
  const [clubs,       setClubs]       = useState([])
  const [clubFilter,  setClubFilter]  = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [m, c] = await Promise.all([
        getAllPlayedMatches(),   // tous les matchs joués, tous clubs
        getAllActiveClubs(),
      ])
      setMatches(m)
      setClubs(c)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = matches.filter(m => {
    const matchClub  = !clubFilter  || m.teams?.club_id === clubFilter
    const matchSport = !sportFilter || m.teams?.clubs?.sport_id === sportFilter
    return matchClub && matchSport
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Résultats</h1>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={clubFilter} onChange={e => setClubFilter(e.target.value)}>
          <option value="">Tous les clubs</option>
          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Liste des matchs */}
      <div className="space-y-3">
        {filtered.map(match => (
          <Card key={match.id} className="p-4"
            onClick={() => navigate(`/app/matches/${match.id}`)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">
                  {match.teams?.name} · {match.teams?.clubs?.name}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    {match.teams?.name}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 tabular-nums">
                    {match.score_home} — {match.score_away}
                  </span>
                  <span className="font-semibold text-gray-500">
                    {match.opponent_name}
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>
                  {format(new Date(match.scheduled_at), 'd MMM yyyy', { locale: fr })}
                </div>
                <div className="mt-0.5">{match.is_home ? 'Domicile' : 'Déplacement'}</div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && !loading && (
          <EmptyState
            icon="🏆"
            title="Aucun résultat"
            description="Les résultats des matchs joués apparaîtront ici."
          />
        )}
      </div>
    </div>
  )
}
```

### Fonctions db.js à ajouter

```js
export const getAllPlayedMatches = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select('*, teams(name, category, club_id, clubs(name, sport_id))')
    .eq('status', 'played')
    .order('scheduled_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

export const getAllActiveClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .eq('status', 'active')
    .order('name')
  if (error) throw error
  return data ?? []
}
```

---

## Partie 8 — Navigation mise à jour

### NAV_ITEMS dans AppLayout.jsx

```js
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,        label: 'Équipes',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/results',  icon: Trophy,        label: 'Résultats',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/members',  icon: Users,
    labelFn: (role) => role === 'coach' ? 'Joueurs' : 'Membres',
    roles: ['president','coach'] },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie',
    roles: ['president','coach','player','supporter','parent'] },
]
```

> Importer `Trophy` depuis lucide-react.

---

## Partie 9 — AppLayout — ne plus bloquer si pas de club

**IMPORTANT :** Supprimer la redirection automatique vers NoClubPage.
À la place, un user sans club accède normalement à l'app
avec l'interface supporter (résultats, équipes publiques, explorer).

```jsx
// SUPPRIMER ce bloc dans AppLayout :
// if (currentUser && !currentUser.current_club_id) {
//   return <NoClubPage />
// }

// Le profil affiche la bannière "Rejoindre un club" — c'est suffisant
```

Le user sans club voit :
- Événements (publics uniquement)
- Équipes (toutes, en lecture)
- Résultats (tous)
- Calendrier (matchs publics)
- Pas de messagerie (pas de club → pas de conversation)

---

## Partie 10 — Historique accessible depuis le profil

Quand on clique sur une entrée de l'historique dans ProfilePage,
naviguer vers une page de consultation de l'historique :

**Route :** `/app/history/:teamId/:season`

```jsx
// src/pages/app/TeamHistoryPage.jsx
export default function TeamHistoryPage() {
  const { teamId, season } = useParams()
  const [team,    setTeam]    = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [t, m] = await Promise.all([
        getTeamById(teamId),
        getMatchesByTeamAndSeason(teamId, season),
      ])
      setTeam(t)
      setMatches(m)
      setLoading(false)
    }
    load()
  }, [teamId, season])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-gray-700 mb-6">
        ← Retour
      </button>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">{team?.name}</h1>
        <div className="text-gray-500 text-sm mt-1">
          Saison {season} · {team?.clubs?.name}
        </div>
      </div>

      <SectionHeader title="Matchs de la saison" />
      <div className="space-y-3">
        {matches.map(m => (
          <Card key={m.id} className="p-4 cursor-pointer"
            onClick={() => navigate(`/app/matches/${m.id}`)}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">vs {m.opponent_name}</span>
              {m.status === 'played' ? (
                <span className="text-xl font-bold tabular-nums">
                  {m.score_home} — {m.score_away}
                </span>
              ) : (
                <span className="text-sm text-gray-400">À venir</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {format(new Date(m.scheduled_at), "d MMM yyyy · HH'h'mm", { locale: fr })}
              · {m.location}
            </div>
          </Card>
        ))}
        {matches.length === 0 && !loading && (
          <EmptyState icon="📋" title="Aucun match cette saison" description="" />
        )}
      </div>
    </div>
  )
}
```

Ajouter dans db.js :
```js
export const getMatchesByTeamAndSeason = async (teamId, season) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .eq('season', season)   // si on a un champ season sur matches, sinon filtrer par date
    .order('scheduled_at')
  if (error) throw error
  return data ?? []
}

export const getTeamById = async (teamId) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*, clubs(name)')
    .eq('id', teamId)
    .single()
  if (error) throw error
  return data
}
```

---

## App.jsx — nouvelles routes

```jsx
import ResultsPage     from './pages/app/ResultsPage'
import TeamHistoryPage from './pages/app/TeamHistoryPage'

// Dans les routes /app :
<Route path="results"                        element={<ResultsPage />} />
<Route path="history/:teamId/:season"        element={<TeamHistoryPage />} />
```

---

## Ordre de priorité

1. **db.js** — ajouter leaveClub, canPresidentLeave, getAllPlayedMatches,
   getMatchesByTeamAndSeason, getTeamById, getAllActiveClubs (si pas déjà là)
2. **RegisterPage.jsx** — refaire sans club, juste profil complet
3. **JoinClubPage.jsx** — ajouter recherche par région/département/ville
4. **RegisterClubPage.jsx** — ajouter champ région
5. **ProfilePage.jsx** — bannière rejoindre/quitter + modal confirmation départ
6. **AppLayout.jsx** — supprimer redirect NoClubPage + mettre à jour NAV_ITEMS
7. **ResultsPage.jsx** — créer page résultats inter-clubs
8. **TeamHistoryPage.jsx** — créer page historique d'équipe
9. **App.jsx** — ajouter routes /app/results et /app/history/:teamId/:season

---

## Règles strictes

1. Un user sans club = interface supporter, pas de blocage
2. Le bouton "Quitter" est toujours sur le profil personnel uniquement
3. Un président seul ne peut pas partir → bouton désactivé + message explicatif
4. leaveClub() appelle toujours la fonction PostgreSQL via supabase.rpc()
5. Après départ : refreshUser() pour mettre à jour le state React
6. L'historique (player_history, club_memberships) n'est JAMAIS supprimé
7. La page résultats est accessible sans être dans un club
8. Recherche clubs : toujours chercher sur name + city + region + postal_code
ENDOFFILE