# ClubManager — Corrections prioritaires

Corriger ces 6 problèmes dans l'ordre.

---

## 1. Page Équipes — président sans équipe

Un président vient de créer son club. Il n'a pas d'équipe.
La page doit afficher un état vide avec deux options :

```jsx
// Dans TeamPage.jsx, onglet "Mes équipes"
// Si is('president') et aucune équipe dans le club :

if (is('president') && myTeams.length === 0) return (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="text-5xl">⚽</div>
    <h2 className="font-display text-xl font-bold">Aucune équipe pour l'instant</h2>
    <p className="text-sm text-gray-500 text-center max-w-sm">
      Les coachs peuvent proposer des équipes depuis leur interface,
      ou vous pouvez en créer une directement.
    </p>
    <button onClick={() => setShowCreateTeam(true)} className="btn-primary">
      + Créer une équipe
    </button>
  </div>
)
```

Le président peut créer une équipe directement (sans validation) :

```js
// Quand le président crée une équipe — pas de team_request, création directe
const handlePresidentCreateTeam = async () => {
  if (!teamName.trim() || !category) return
  const season = await getCurrentSeason(currentUser.current_club_id)

  const { data: club } = await supabase
    .from('clubs').select('sport_id').eq('id', currentUser.current_club_id).single()

  const team = await supabase
    .from('teams')
    .insert({
      club_id:  currentUser.current_club_id,
      sport_id: club.sport_id,
      name:     teamName.trim(),
      category: category,
      gender:   gender || 'mixed',
      season:   season,
      status:   'active',
    })
    .select().single()
    .then(r => r.data)

  setShowCreateTeam(false)
  setTeamName('')
  setCategory('')
  // Recharger les équipes
  refreshTeams()
}
```

---

## 2. Feed — poster au nom du club

Le bouton "Publier" doit poster au nom du club, pas au nom perso.
Afficher le nom du club comme auteur, pas le prénom/nom.

Dans `CreatePostBox` :
```jsx
// Afficher le club comme auteur visuel
<div className="flex gap-3">
  {/* Avatar du club (initiale) au lieu de l'avatar perso */}
  <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                  justify-center text-white font-bold text-lg flex-shrink-0">
    {club?.name?.[0] ?? '?'}
  </div>
  <div className="flex-1">
    <div className="text-sm font-semibold text-gray-700 mb-2">
      Publier en tant que <span className="text-brand-600">{club?.name}</span>
    </div>
    <textarea
      placeholder="Partagez une actualité..."
      value={content}
      onChange={e => setContent(e.target.value)}
      rows={3}
      className="resize-none w-full"
    />
    ...
  </div>
</div>
```

Vérifier que `canPostForClub` retourne bien true pour le président :
```js
export const canPostForClub = (user, clubId) => {
  if (!user || !clubId) return false
  // Président : current_club_id suffit
  if (user.current_club_id === clubId) {
    const roles = user.user_roles ?? []
    const isPresOrCoach = roles.some(r =>
      (r.role_type === 'president' || r.role_type === 'coach')
    )
    return isPresOrCoach
  }
  return false
}
```

Si `user.user_roles` est vide, faire une requête séparée au chargement :
```js
// Dans FeedPage.jsx ou AuthContext, charger les rôles si manquants
const { data: roles } = await supabase
  .from('user_roles')
  .select('*')
  .eq('user_id', currentUser.id)
// Attacher au currentUser ou stocker dans un state
```

Dans `PostCard`, afficher le club comme auteur :
```jsx
// Remplacer "author.first_name author.last_name" par le nom du club
<span className="font-semibold text-gray-900">{post.clubs?.name}</span>
<span className="text-xs text-gray-400 ml-2">
  par {post.users?.first_name} {post.users?.last_name}
</span>
```

---

## 3. Recherche de clubs — filtres région/département

Dans `TeamPage.jsx` onglet Explorer, charger les valeurs
depuis `fr_postal_codes` et afficher deux selects :

```js
const [allDeps, setAllDeps] = useState([])
const [allRegs, setAllRegs] = useState([])
const [regionFilter, setRegionFilter] = useState('')
const [depFilter,    setDepFilter]    = useState('')

useEffect(() => {
  const load = async () => {
    const { data } = await supabase
      .from('fr_postal_codes')
      .select('departement, code_dep, region')
      .order('region')

    if (!data) return

    // Régions uniques
    const regs = [...new Set(data.map(d => d.region))].sort()
    setAllRegs(regs)

    // Tous les départements avec leur région
    const deps = [...new Map(data.map(d => [d.code_dep, d])).values()]
      .sort((a, b) => a.departement.localeCompare(b.departement))
    setAllDeps(deps)
  }
  load()
}, [])

// Départements filtrés selon la région choisie
const filteredDeps = regionFilter
  ? allDeps.filter(d => d.region === regionFilter)
  : allDeps
```

Afficher les selects AVANT la barre de recherche texte :
```jsx
<div className="flex flex-col gap-3 mb-4">
  {/* Région */}
  <select value={regionFilter} onChange={e => {
    setRegionFilter(e.target.value)
    setDepFilter('')  // reset département quand région change
  }}>
    <option value="">Toutes les régions</option>
    {allRegs.map(r => <option key={r} value={r}>{r}</option>)}
  </select>

  {/* Département — filtré selon la région */}
  <select value={depFilter} onChange={e => setDepFilter(e.target.value)}>
    <option value="">Tous les départements</option>
    {filteredDeps.map(d => (
      <option key={d.code_dep} value={d.departement}>
        {d.departement}
      </option>
    ))}
  </select>

  {/* Recherche texte */}
  <input
    placeholder="Nom du club ou ville..."
    value={search}
    onChange={e => setSearch(e.target.value)}
  />
</div>
```

Filtrage des clubs :
```js
const filteredClubs = allClubs.filter(club => {
  const matchReg = !regionFilter || club.region     === regionFilter
  const matchDep = !depFilter    || club.department === depFilter
  const matchTxt = !search       ||
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    club.city?.toLowerCase().includes(search.toLowerCase())
  return matchReg && matchDep && matchTxt
})
```

---

## 4. Page Événements — corriger les sources

La page Événements doit afficher 3 types de contenu :

```js
// 1. Événements des clubs suivis + club actuel
const getMyEvents = async (userId, currentClubId) => {
  // Clubs suivis
  const { data: follows } = await supabase
    .from('club_follows').select('club_id').eq('user_id', userId)
  const clubIds = [...new Set([
    ...(follows?.map(f => f.club_id) ?? []),
    ...(currentClubId ? [currentClubId] : [])
  ])]

  if (!clubIds.length) return []

  const { data } = await supabase
    .from('events')
    .select('*, clubs(name)')
    .in('club_id', clubIds)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
  return data ?? []
}

// 2. Matchs à venir des équipes suivies (supporter_favorites)
//    + équipes dont l'user est membre (team_players/team_coaches)
const getMyUpcomingMatches = async (userId) => {
  // Équipes favorites
  const { data: favs } = await supabase
    .from('supporter_favorites').select('team_id').eq('user_id', userId)
  // Équipes dont membre
  const { data: playerTeams } = await supabase
    .from('team_players').select('team_id').eq('user_id', userId).eq('is_active', true)
  const { data: coachTeams } = await supabase
    .from('team_coaches').select('team_id').eq('user_id', userId).eq('is_active', true)

  const teamIds = [...new Set([
    ...(favs?.map(f => f.team_id) ?? []),
    ...(playerTeams?.map(t => t.team_id) ?? []),
    ...(coachTeams?.map(t => t.team_id) ?? []),
  ])]

  if (!teamIds.length) return []

  const { data } = await supabase
    .from('matches')
    .select('*, teams(name, category, clubs(name))')
    .in('team_id', teamIds)
    .eq('status', 'scheduled'::text)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
  return data ?? []
}
```

Dans `EventsPage.jsx`, 3 onglets :
```jsx
const tabs = [
  { id: 'events',  label: '📣 Événements' },
  { id: 'matches', label: '⚽ Matchs à venir' },
]
```

---

## 5. Coach — intégrer ou créer une équipe

Dans le formulaire de demande d'intégration pour un coach,
deux modes au lieu d'un :

```jsx
const [joinMode, setJoinMode] = useState('existing') // 'existing' | 'new'

{/* Toggle */}
<div className="flex gap-2 mb-4">
  <button onClick={() => setJoinMode('existing')}
    className={joinMode === 'existing' ? 'btn-primary flex-1 justify-center' : 'btn-secondary flex-1 justify-center'}>
    Rejoindre une équipe existante
  </button>
  <button onClick={() => setJoinMode('new')}
    className={joinMode === 'new' ? 'btn-primary flex-1 justify-center' : 'btn-secondary flex-1 justify-center'}>
    Créer une nouvelle équipe
  </button>
</div>

{/* Mode existant */}
{joinMode === 'existing' && teams.length > 0 && (
  <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
    <option value="">Choisir une équipe...</option>
    {teams.map(t => (
      <option key={t.id} value={t.id}>{t.name} — {t.category}</option>
    ))}
  </select>
)}

{joinMode === 'existing' && teams.length === 0 && (
  <p className="text-sm text-gray-400 p-3 bg-surface-50 rounded-xl">
    Aucune équipe active dans ce club. Proposez-en une nouvelle.
  </p>
)}

{/* Mode nouvelle équipe */}
{joinMode === 'new' && (
  <div className="space-y-3">
    <input
      placeholder="Nom de l'équipe (ex: Séniors A, U13...)"
      value={newTeamName}
      onChange={e => setNewTeamName(e.target.value)}
    />
    <select value={newTeamCategory} onChange={e => setNewTeamCategory(e.target.value)}>
      <option value="">Catégorie...</option>
      {['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15',
        'U16','U17','U18','U19','U20','Séniors','Vétérans'].map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  </div>
)}
```

À la soumission pour un coach :
```js
const handleCoachJoin = async () => {
  const season = await getCurrentSeason(selectedClub.id)

  // Créer la demande
  const request = await createJoinRequest({
    user_id:        currentUser.id,
    club_id:        selectedClub.id,
    role_type:      'coach',
    team_id:        joinMode === 'existing' ? selectedTeamId : null,
    new_team_name:  joinMode === 'new' ? newTeamName : null,
    new_team_cat:   joinMode === 'new' ? newTeamCategory : null,
    message:        joinMessage || null,
    season:         season,
    status:         'pending',
  })

  // Notifier le/les présidents
  const { data: presidents } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('scope_id', selectedClub.id)
    .eq('role_type', 'president'::text)
    .eq('scope_type', 'club'::text)

  for (const { user_id } of presidents ?? []) {
    await createNotification({
      to_user_id: user_id,
      type:       'registration_request',
      title:      joinMode === 'new'
        ? `Demande de création d'équipe — ${newTeamName}`
        : 'Demande de coach',
      body: joinMode === 'new'
        ? `${currentUser.first_name} ${currentUser.last_name} souhaite rejoindre comme coach et créer l'équipe "${newTeamName}" (${newTeamCategory}).`
        : `${currentUser.first_name} ${currentUser.last_name} souhaite rejoindre comme coach.`,
      request_id: request.id,
    })
  }

  navigate('/register/pending')
}
```

Ajouter les colonnes dans Supabase (SQL séparé) :
```
ALTER TABLE club_join_requests ADD COLUMN IF NOT EXISTS new_team_name VARCHAR(128);
ALTER TABLE club_join_requests ADD COLUMN IF NOT EXISTS new_team_cat  VARCHAR(32);
```

---

## 6. Validation des demandes par le président

Dans `AppLayout.jsx`, le panel de notifications doit gérer
la validation avec création d'équipe si nécessaire :

```js
const handleApproveRequest = async (notif) => {
  const { data: req } = await supabase
    .from('club_join_requests')
    .select('*')
    .eq('id', notif.request_id)
    .single()

  if (!req) return

  // 1. Si le coach veut créer une nouvelle équipe → créer l'équipe d'abord
  let teamId = req.team_id
  if (!teamId && req.new_team_name && req.role_type === 'coach') {
    const { data: club } = await supabase
      .from('clubs').select('sport_id').eq('id', req.club_id).single()

    const { data: newTeam } = await supabase
      .from('teams')
      .insert({
        club_id:  req.club_id,
        sport_id: club.sport_id,
        name:     req.new_team_name,
        category: req.new_team_cat ?? 'Séniors',
        season:   req.season,
        status:   'active',
        gender:   'mixed',
      })
      .select().single()

    teamId = newTeam?.id
  }

  // 2. Mettre à jour current_club_id du user
  await supabase.from('users')
    .update({ current_club_id: req.club_id })
    .eq('id', req.user_id)

  // 3. Créer le rôle
  await supabase.from('user_roles').insert({
    user_id:    req.user_id,
    role_type:  req.role_type,
    scope_type: teamId ? 'team' : 'club',
    scope_id:   teamId ?? req.club_id,
  })

  // 4. Ajouter à l'équipe si coach
  if (req.role_type === 'coach' && teamId) {
    await supabase.from('team_coaches').insert({
      team_id: teamId, user_id: req.user_id,
      season: req.season, is_active: true,
    })
  }

  // 5. Ajouter à l'équipe si joueur
  if (req.role_type === 'player' && teamId) {
    await supabase.from('team_players').insert({
      team_id: teamId, user_id: req.user_id,
      season: req.season, is_active: true,
    })
  }

  // 6. Valider la demande
  await supabase.from('club_join_requests')
    .update({ status: 'approved', reviewed_by: currentUser.id,
              reviewed_at: new Date().toISOString() })
    .eq('id', req.id)

  // 7. Notifier l'utilisateur
  await supabase.from('notifications').insert({
    to_user_id: req.user_id,
    type:       'request_approved',
    title:      'Demande acceptée !',
    body:       teamId
      ? `Vous avez été ajouté au club et à votre équipe.`
      : `Votre demande d'adhésion a été acceptée.`,
    request_id: req.id,
  })

  // 8. Marquer la notif comme lue et rafraîchir
  await supabase.from('notifications')
    .update({ read: true }).eq('id', notif.id)

  setNotifs(prev => prev.filter(n => n.id !== notif.id))
  setUnreadCount(c => Math.max(0, c - 1))
}

const handleRejectRequest = async (notif) => {
  await supabase.from('club_join_requests')
    .update({ status: 'rejected', reviewed_by: currentUser.id,
              reviewed_at: new Date().toISOString() })
    .eq('id', notif.request_id)

  await supabase.from('notifications').insert({
    to_user_id: notif.request?.user_id,
    type:       'request_rejected',
    title:      'Demande refusée',
    body:       'Votre demande n\'a pas été acceptée.',
  })

  await supabase.from('notifications')
    .update({ read: true }).eq('id', notif.id)

  setNotifs(prev => prev.filter(n => n.id !== notif.id))
  setUnreadCount(c => Math.max(0, c - 1))
}
```

---

## SQL à exécuter dans Supabase AVANT Claude Code

```sql
ALTER TABLE club_join_requests ADD COLUMN IF NOT EXISTS new_team_name VARCHAR(128);
ALTER TABLE club_join_requests ADD COLUMN IF NOT EXISTS new_team_cat  VARCHAR(32);
```

---

## Ordre de priorité

1. TeamPage.jsx — état vide président + bouton créer équipe directement
2. FeedPage.jsx + db.js — poster au nom du club, fix canPostForClub
3. TeamPage.jsx onglet Explorer — selects région/département
4. EventsPage.jsx — onglets événements + matchs à venir
5. JoinClubPage.jsx ou modal intégration — coach : rejoindre ou créer équipe
6. AppLayout.jsx — handleApproveRequest avec création d'équipe
