# ClubManager — Prompt Historique, Suppression Club & Supporters

Ce prompt couvre 3 fonctionnalités liées :
1. Suppression d'un club par le président
2. Historique des appartenances (clubs, postes, équipes)
3. Supporters multi-clubs avec abonnements explicites

Lire CLAUDE.md et CLAUDE_SUPABASE.md pour le contexte général.

---

## Partie 1 — Suppression d'un club

### Comportement attendu

Quand le président supprime son club :
- Le club passe en statut `deleted` (pas de vraie suppression SQL)
- Tous les users du club sont **détachés** : leur `current_club_id` devient NULL
- Leurs comptes restent actifs — ils peuvent se connecter
- Ils voient une page "Votre club n'est plus actif" avec un bouton
  "Rejoindre un autre club"
- Leurs données personnelles (profil, historique) sont conservées
- Les données du club (matchs, entraînements, événements) sont archivées
  mais plus accessibles depuis l'interface

### Modifications SQL à exécuter dans Supabase

```sql
-- 1. Ajouter statut sur clubs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS 
  status VARCHAR(16) NOT NULL DEFAULT 'active' 
  CHECK (status IN ('active', 'deleted'));

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS 
  deleted_at TIMESTAMPTZ;

-- 2. Ajouter current_club_id sur users (club actuel, peut être NULL)
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
  current_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;

-- Migrer les données existantes : remplir current_club_id 
-- depuis persons pour les users existants
UPDATE users u
SET current_club_id = p.club_id
FROM persons p
WHERE p.id = u.person_id
  AND u.current_club_id IS NULL;

-- 3. Table d'historique des appartenances
CREATE TABLE IF NOT EXISTS club_memberships (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id      UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    role_type    role_type_enum NOT NULL,
    team_id      UUID        REFERENCES teams(id) ON DELETE SET NULL,
    team_name    VARCHAR(128),   -- snapshot du nom au moment du départ
    club_name    VARCHAR(128),   -- snapshot du nom du club
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at      TIMESTAMPTZ,    -- NULL si encore actif
    leave_reason VARCHAR(32),    -- 'club_deleted', 'left', 'excluded'
    season       VARCHAR(16),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memberships_user ON club_memberships(user_id);
CREATE INDEX idx_memberships_club ON club_memberships(club_id);
```

### Logique de suppression dans db.js

```js
// Ajouter dans src/services/db.js

export const deleteClub = async (clubId, presidentUserId) => {
  // 1. Récupérer tous les membres du club
  const { data: members } = await supabase
    .from('users')
    .select('id, persons(club_id)')
    .eq('current_club_id', clubId)

  // 2. Récupérer les équipes pour l'historique
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('club_id', clubId)

  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  // 3. Créer une entrée d'historique pour chaque membre
  for (const member of members ?? []) {
    // Récupérer le rôle actuel
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type, scope_id, scope_type')
      .eq('user_id', member.id)

    const clubRole = roles?.find(r => r.scope_type === 'club' && r.scope_id === clubId)
    const teamRole = roles?.find(r => r.scope_type === 'team')

    const teamInfo = teamRole
      ? teams?.find(t => t.id === teamRole.scope_id)
      : null

    await supabase.from('club_memberships').insert({
      user_id:      member.id,
      club_id:      clubId,
      club_name:    club?.name,
      role_type:    clubRole?.role_type ?? 'player',
      team_id:      teamInfo?.id ?? null,
      team_name:    teamInfo?.name ?? null,
      joined_at:    new Date().toISOString(), // idéalement depuis user_roles.created_at
      left_at:      new Date().toISOString(),
      leave_reason: 'club_deleted',
      season:       new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    })

    // Détacher le membre du club
    await supabase
      .from('users')
      .update({ current_club_id: null })
      .eq('id', member.id)
  }

  // 4. Supprimer les rôles liés au club
  await supabase
    .from('user_roles')
    .delete()
    .eq('scope_id', clubId)

  // 5. Marquer le club comme supprimé (pas de DELETE SQL)
  await supabase
    .from('clubs')
    .update({
      status:     'deleted',
      deleted_at: new Date().toISOString(),
    })
    .eq('id', clubId)
}

export const getMemberships = async (userId) => {
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
```

### Page "Club supprimé" — src/pages/app/NoClubPage.jsx

Affichée quand `currentUser.current_club_id` est null après connexion.

```jsx
export default function NoClubPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">🏟️</div>
        <h1 className="font-display text-2xl font-bold mb-3">
          Votre club n'est plus actif
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Le club auquel vous étiez rattaché a été supprimé.
          Votre compte est intact — vous pouvez rejoindre un autre club.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/register/member')}
            className="btn-primary justify-center"
          >
            Rejoindre un autre club
          </button>
          <button
            onClick={() => navigate('/app/profile')}
            className="btn-secondary justify-center"
          >
            Voir mon profil et historique
          </button>
        </div>
      </Card>
    </div>
  )
}
```

### Mise à jour AppLayout.jsx

```jsx
// Après la vérification de currentUser, vérifier le club actif
if (currentUser && !currentUser.current_club_id) {
  return <NoClubPage />
}
```

### Bouton suppression dans les paramètres du club (président uniquement)

Dans une page `/app/admin` ou dans les paramètres :

```jsx
{is('president') && (
  <div className="mt-8 p-4 border border-red-200 rounded-2xl bg-red-50">
    <h3 className="font-semibold text-red-700 mb-2">Zone dangereuse</h3>
    <p className="text-sm text-red-600 mb-4">
      La suppression du club est irréversible. Tous les membres
      seront détachés mais conserveront leur compte.
    </p>
    <button
      onClick={() => setShowDeleteConfirm(true)}
      className="bg-red-600 hover:bg-red-700 text-white text-sm
                 font-medium px-4 py-2 rounded-xl"
    >
      Supprimer le club
    </button>

    {showDeleteConfirm && (
      <div className="mt-4 p-4 bg-white rounded-xl border border-red-300">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Tapez le nom du club pour confirmer :
        </p>
        <input
          placeholder={club?.name}
          value={confirmName}
          onChange={e => setConfirmName(e.target.value)}
          className="mb-3"
        />
        <button
          disabled={confirmName !== club?.name}
          onClick={handleDeleteClub}
          className="w-full bg-red-600 disabled:opacity-40 text-white
                     text-sm font-medium py-2 rounded-xl"
        >
          Confirmer la suppression
        </button>
      </div>
    )}
  </div>
)}
```

---

## Partie 2 — Historique des appartenances

### Principe

Un user peut avoir appartenu à plusieurs clubs et joué plusieurs rôles.
La table `club_memberships` trace tout cet historique.

### Réinscription dans un nouveau club

Quand un user sans club (`current_club_id = null`) s'inscrit dans un
nouveau club via `/register/member` :

```js
// Dans RegisterMemberPage.jsx, détecter si l'user existe déjà
const handleSubmit = async () => {
  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    // User existant qui se réinscrit
    if (existingUser.current_club_id) {
      throw new Error('Vous êtes déjà membre d\'un club actif.')
    }

    // Créer une demande de réinscription
    const request = await createRequest({
      club_id:       selectedClub.id,
      first_name:    existingUser.persons.first_name,
      last_name:     existingUser.persons.last_name,
      email:         existingUser.email,
      role_type:     role,
      team_id:       selectedTeamId ?? null,
      password_hash: existingUser.password_hash, // réutiliser le hash existant
      status:        'pending',
      token:         crypto.randomUUID(),
      is_returning:  true,   // flag pour indiquer une réinscription
      existing_user_id: existingUser.id,
    })
    // Notifier président/coach comme d'habitude
    navigate('/register/pending')

  } else {
    // Nouvel utilisateur — flux normal
    // ... (code existant)
  }
}
```

Ajouter dans le SQL :
```sql
ALTER TABLE registration_requests
  ADD COLUMN IF NOT EXISTS is_returning BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS existing_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

Quand le président valide une réinscription (`is_returning = true`) :

```js
const handleApprove = async (notif) => {
  const request = await getRequestById(notif.request_id)

  if (request.is_returning && request.existing_user_id) {
    // Réactiver l'user existant
    await updateUser(request.existing_user_id, {
      current_club_id: request.club_id,
      account_status: 'active',
    })

    // Créer le nouveau rôle
    await createUserRole({
      user_id:    request.existing_user_id,
      role_type:  request.role_type,
      scope_type: request.team_id ? 'team' : 'club',
      scope_id:   request.team_id ?? request.club_id,
    })

    // Créer l'entrée d'historique pour le nouveau club
    await supabase.from('club_memberships').insert({
      user_id:   request.existing_user_id,
      club_id:   request.club_id,
      role_type: request.role_type,
      team_id:   request.team_id ?? null,
      joined_at: new Date().toISOString(),
      season:    getCurrentSeason(),
    })

  } else {
    // Nouveau user — flux normal existant
    // ... (code existant)
  }
}
```

### Affichage de l'historique sur ProfilePage.jsx

Ajouter une section "Historique" sur le profil :

```jsx
const [memberships, setMemberships] = useState([])

useEffect(() => {
  if (profileUser?.id) {
    getMemberships(profileUser.id).then(setMemberships)
  }
}, [profileUser])

{memberships.length > 0 && (
  <section className="mt-6">
    <SectionHeader title="Historique" />
    <div className="space-y-3">
      {memberships.map(m => (
        <Card key={m.id} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-gray-900">{m.club_name}</div>
              {m.team_name && (
                <div className="text-sm text-gray-500">{m.team_name}</div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={m.role_type} />
                {m.season && (
                  <span className="text-xs text-gray-400">Saison {m.season}</span>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div>{format(new Date(m.joined_at), 'MMM yyyy', { locale: fr })}</div>
              {m.left_at && (
                <div>→ {format(new Date(m.left_at), 'MMM yyyy', { locale: fr })}</div>
              )}
              {!m.left_at && (
                <span className="text-emerald-600 font-medium">Actuel</span>
              )}
            </div>
          </div>
          {m.leave_reason === 'club_deleted' && (
            <div className="mt-2 text-xs text-orange-600 bg-orange-50
                            px-2 py-1 rounded-lg">
              Club dissous
            </div>
          )}
        </Card>
      ))}
    </div>
  </section>
)}
```

---

## Partie 3 — Supporters multi-clubs

### Principe

Un supporter peut :
- Suivre explicitement N clubs (`club_follows`)
- Mettre des équipes en favoris (`supporter_favorites` — déjà existant)
- Voir les événements publics de tous ses clubs suivis
- Suivre une équipe = pas automatiquement suivre le club
  (il doit cliquer "Suivre ce club" séparément)

### Table SQL à créer

```sql
CREATE TABLE IF NOT EXISTS club_follows (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id    UUID        NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, club_id)
);

CREATE INDEX idx_club_follows_user ON club_follows(user_id);
CREATE INDEX idx_club_follows_club ON club_follows(club_id);
```

### Fonctions db.js à ajouter

```js
// Suivre / ne plus suivre un club
export const followClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('club_follows')
    .insert({ user_id: userId, club_id: clubId })
  if (error) throw error
}

export const unfollowClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('club_follows')
    .delete()
    .eq('user_id', userId)
    .eq('club_id', clubId)
  if (error) throw error
}

export const getFollowedClubs = async (userId) => {
  const { data, error } = await supabase
    .from('club_follows')
    .select('clubs(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map(d => d.clubs) ?? []
}

export const isFollowingClub = async (userId, clubId) => {
  const { data } = await supabase
    .from('club_follows')
    .select('id')
    .eq('user_id', userId)
    .eq('club_id', clubId)
    .single()
  return !!data
}

// Événements publics des clubs suivis
export const getEventsFromFollowedClubs = async (userId) => {
  // D'abord récupérer les clubs suivis
  const followed = await getFollowedClubs(userId)
  if (!followed.length) return []

  const clubIds = followed.map(c => c.id)

  const { data, error } = await supabase
    .from('events')
    .select('*, clubs(name, sport_id)')
    .in('club_id', clubIds)
    .eq('visibility', 'club_wide')  // uniquement les événements publics
    .eq('clubs.status', 'active')
    .order('starts_at')
  if (error) throw error
  return data ?? []
}

// Tous les clubs actifs (pour la recherche supporter)
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

### Page Découverte des clubs — src/pages/app/ExploreClubsPage.jsx

Accessible depuis le menu supporter : "Explorer les clubs"

```jsx
export default function ExploreClubsPage() {
  const { currentUser } = useAuth()
  const [clubs,     setClubs]     = useState([])
  const [followed,  setFollowed]  = useState(new Set())
  const [search,    setSearch]    = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      const [allClubs, followedClubs] = await Promise.all([
        getAllActiveClubs(),
        getFollowedClubs(currentUser.id),
      ])
      setClubs(allClubs)
      setFollowed(new Set(followedClubs.map(c => c.id)))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clubs.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
      || c.city?.toLowerCase().includes(search.toLowerCase())
    const matchSport = !sportFilter || c.sport_id === sportFilter
    return matchSearch && matchSport
  })

  const handleToggleFollow = async (clubId) => {
    if (followed.has(clubId)) {
      await unfollowClub(currentUser.id, clubId)
      setFollowed(prev => { const s = new Set(prev); s.delete(clubId); return s })
    } else {
      await followClub(currentUser.id, clubId)
      setFollowed(prev => new Set(prev).add(clubId))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Explorer les clubs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Suivez les clubs pour recevoir leurs événements
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Rechercher un club ou une ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
          <option value="">Tous les sports</option>
          {/* charger depuis getSports() */}
        </select>
      </div>

      {/* Liste des clubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(club => {
          const isFollowed = followed.has(club.id)
          return (
            <Card key={club.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{club.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {club.sports?.name} · {club.city}
                    {club.postal_code && ` (${club.postal_code.slice(0,2)})`}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleFollow(club.id)}
                  className={`flex-shrink-0 text-sm font-medium px-3 py-1.5
                              rounded-full border transition-all ${
                    isFollowed
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                  }`}
                >
                  {isFollowed ? '✓ Suivi' : '+ Suivre'}
                </button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

### Mise à jour EventsPage.jsx pour les supporters

```jsx
// Pour les supporters : charger les événements des clubs suivis
useEffect(() => {
  if (!is('supporter') && !is('parent')) return
  getEventsFromFollowedClubs(currentUser.id)
    .then(setFollowedEvents)
}, [])

// Dans l'onglet "Club" pour les supporters :
{is('supporter') && followedEvents.length === 0 && (
  <div className="text-center py-12">
    <div className="text-4xl mb-3">🔍</div>
    <div className="font-semibold text-gray-700 mb-2">
      Vous ne suivez aucun club
    </div>
    <p className="text-sm text-gray-400 mb-4">
      Suivez des clubs pour voir leurs événements ici
    </p>
    <button
      onClick={() => navigate('/app/explore')}
      className="btn-primary"
    >
      Explorer les clubs
    </button>
  </div>
)}
```

### Mise à jour de la navigation — AppLayout.jsx

Ajouter "Explorer" dans le menu des supporters :

```js
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,        label: 'Équipes',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/explore',  icon: Search,        label: 'Explorer',
    roles: ['supporter','parent'] },
  { to: '/app/members',  icon: Users,
    labelFn: (role) => role === 'coach' ? 'Joueurs' : 'Membres',
    roles: ['president','coach'] },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier',
    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie',
    roles: ['president','coach','player','supporter','parent'] },
]
```

### Mise à jour TeamPage.jsx pour les supporters

Un supporter peut voir les équipes de **tous les clubs qu'il suit**,
pas uniquement son club d'inscription.

```jsx
// Pour les supporters : charger les équipes de tous les clubs suivis
const [allFollowedTeams, setAllFollowedTeams] = useState([])

useEffect(() => {
  if (!is('supporter')) return
  getFollowedClubs(currentUser.id).then(async followedClubs => {
    const allTeams = await Promise.all(
      followedClubs.map(c => getTeamsByClub(c.id))
    )
    setAllFollowedTeams(allTeams.flat())
  })
}, [])

// Afficher un select de club en plus du select d'équipe pour les supporters
{is('supporter') && (
  <select onChange={e => setClubFilter(e.target.value)}>
    <option value="">Tous mes clubs suivis</option>
    {followedClubs.map(c => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))}
  </select>
)}
```

---

## Ordre de priorité

> Le SQL correspondant est dans le fichier `migration_v2_1.sql` — à exécuter dans Supabase avant de commencer le code.

### Code à créer / modifier
1. **db.js** — ajouter deleteClub, getMemberships, followClub, unfollowClub,
   getFollowedClubs, isFollowingClub, getEventsFromFollowedClubs, getAllActiveClubs
2. **NoClubPage.jsx** — page pour user détaché de son club
3. **ExploreClubsPage.jsx** — découverte et suivi de clubs
4. **AppLayout.jsx** — vérification current_club_id + nav "Explorer" pour supporters
5. **RegisterMemberPage.jsx** — détecter les users existants qui se réinscrivent
6. **AppLayout.jsx** — handleApprove mis à jour pour les réinscriptions
7. **ProfilePage.jsx** — section historique des appartenances
8. **EventsPage.jsx** — événements des clubs suivis pour supporters
9. **TeamPage.jsx** — équipes de tous les clubs suivis pour supporters
10. **App.jsx** — ajouter la route /app/explore

---

## Règles strictes

1. Ne jamais faire de DELETE SQL sur clubs ou users — toujours soft delete
2. Toujours créer une entrée club_memberships avant de détacher un user
3. current_club_id NULL = user sans club = redirection NoClubPage
4. Un supporter sans clubs suivis voit une page "Explorer les clubs"
5. Les événements des clubs suivis = visibility 'club_wide' uniquement
6. Les équipes favorites (supporter_favorites) sont indépendantes
   des clubs suivis (club_follows)
