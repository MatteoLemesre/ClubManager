# ClubManager — Prompt Refonte TeamPage & Flux Supporter

Ce prompt repart sur la ligne directrice claire.
SQL de reset : reset_db.sql (à exécuter avant dans Supabase)

---

## Principe fondamental — IMMUABLE

```
Toute personne crée un compte
        ↓
Interface supporter immédiatement :
  - Événements (publics)
  - Calendrier
  - Messagerie
  - Profil
  - Page Équipes (avec suivre/intégrer)
        ↓
Depuis la page Équipes :
  - "Suivre un club/équipe" → mode supporter
  - "Intégrer une équipe"   → demande de validation
```

---

## Navigation — DÉFINITIVE

```js
// Même nav pour TOUS les rôles (y compris sans club)
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements'  },
  { to: '/app/team',     icon: Shield,        label: 'Équipes'     },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier'  },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie'  },
  { to: '/app/profile',  icon: User,          label: 'Profil'      },
]
// Pas de filtre par rôle sur la nav — tout le monde voit tout
// Le contenu s'adapte selon le rôle
```

---

## TeamPage.jsx — REFAIRE ENTIÈREMENT

### Logique d'affichage

```js
// Déterminer la situation de l'utilisateur
const myTeams    = /* équipes où l'user est joueur/coach actif */
const myClub     = currentUser?.current_club_id
const hasTeam    = myTeams.length > 0
const isInClub   = !!myClub
```

### Structure de la page

```
┌─────────────────────────────────────────┐
│  Onglet "Mes équipes"  |  Onglet "Explorer" │
└─────────────────────────────────────────┘
```

---

### Onglet "Mes équipes"

#### Cas 1 — L'utilisateur n'est dans aucune équipe

```jsx
<div className="flex flex-col items-center justify-center py-16 gap-6">
  <div className="text-6xl">⚽</div>
  <div className="text-center">
    <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
      Vous n'êtes dans aucune équipe
    </h2>
    <p className="text-gray-500 text-sm max-w-sm">
      Rejoignez une équipe pour accéder aux entraînements,
      matchs et à la messagerie d'équipe.
    </p>
  </div>
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      onClick={() => setActiveTab('explore')}
      className="btn-primary">
      Intégrer une équipe
    </button>
    <button
      onClick={() => setActiveTab('explore')}
      className="btn-secondary">
      Suivre un club
    </button>
  </div>
</div>
```

#### Cas 2 — L'utilisateur est dans une ou plusieurs équipes

Afficher pour chaque équipe :
```jsx
{myTeams.map(team => (
  <Card key={team.id} className="p-4 mb-4">
    {/* Header équipe */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="font-bold text-lg text-gray-900">{team.name}</div>
        <div className="text-sm text-gray-500">
          {team.clubs?.name} · {team.category}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RoleBadge role={userRoleInTeam(team.id)} />
        <button
          onClick={() => setShowLeaveTeam(team.id)}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1
                     rounded-lg border border-red-200 hover:bg-red-50">
          Quitter
        </button>
      </div>
    </div>

    {/* Prochain match */}
    {nextMatch(team.id) && (
      <div className="bg-surface-50 rounded-xl p-3 mb-3">
        <div className="text-xs text-gray-400 mb-1">Prochain match</div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">vs {nextMatch(team.id).opponent_name}</span>
          <span className="text-sm text-gray-500">
            {format(new Date(nextMatch(team.id).scheduled_at), "d MMM · HH'h'mm", { locale: fr })}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {nextMatch(team.id).location} ·
          {nextMatch(team.id).is_home ? ' Domicile' : ' Déplacement'}
        </div>
        {/* Bouton dispo pour joueur */}
        {isPlayer && (
          <div className="flex gap-2 mt-3">
            <button className="flex-1 text-xs py-2 rounded-xl bg-emerald-50
                               text-emerald-700 border border-emerald-200">
              ✓ Disponible
            </button>
            <button className="flex-1 text-xs py-2 rounded-xl bg-red-50
                               text-red-600 border border-red-200">
              ✗ Indisponible
            </button>
          </div>
        )}
      </div>
    )}

    {/* Prochain entraînement */}
    {nextTraining(team.id) && (
      <div className="bg-surface-50 rounded-xl p-3 mb-3">
        <div className="text-xs text-gray-400 mb-1">Prochain entraînement</div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {format(new Date(nextTraining(team.id).scheduled_at),
              "EEE d MMM · HH'h'mm", { locale: fr })}
          </span>
          <span className="text-sm text-gray-500">
            {nextTraining(team.id).location}
          </span>
        </div>
        {/* Bouton présence pour joueur */}
        {isPlayer && (
          <div className="flex gap-2 mt-3">
            <button className="flex-1 text-xs py-2 rounded-xl bg-emerald-50
                               text-emerald-700 border border-emerald-200">
              ✓ Présent
            </button>
            <button className="flex-1 text-xs py-2 rounded-xl bg-red-50
                               text-red-600 border border-red-200">
              ✗ Absent
            </button>
          </div>
        )}
      </div>
    )}

    {/* Stats équipe (top 3) */}
    <TopStats teamId={team.id} />
  </Card>
))}
```

---

### Onglet "Explorer"

Deux sections :

#### Section 1 — Rechercher un club/équipe

```jsx
<div className="mb-8">
  <h3 className="font-semibold text-gray-900 mb-4">Rechercher</h3>

  {/* Filtres géographiques */}
  <div className="flex gap-2 mb-3 flex-wrap">
    {['name', 'city', 'department', 'region'].map(mode => (
      <button key={mode}
        onClick={() => setSearchMode(mode)}
        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
          searchMode === mode
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
        }`}>
        {mode === 'name'       ? 'Nom du club'  : ''}
        {mode === 'city'       ? 'Ville'        : ''}
        {mode === 'department' ? 'Département'  : ''}
        {mode === 'region'     ? 'Région'       : ''}
      </button>
    ))}
  </div>

  <input
    placeholder={placeholders[searchMode]}
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="mb-4"
  />

  {/* Résultats */}
  {searchResults.map(club => (
    <Card key={club.id} className="p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-gray-900">{club.name}</div>
          <div className="text-sm text-gray-500">
            {club.sports?.name} · {club.city}
            {club.postal_code && ` (${club.postal_code.slice(0,2)})`}
          </div>
          {club.region && (
            <div className="text-xs text-gray-400">{club.region}</div>
          )}
        </div>
        {/* Bouton suivre le club */}
        <button
          onClick={() => handleFollowClub(club.id)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
            followedClubs.has(club.id)
              ? 'bg-brand-50 text-brand-700 border-brand-200'
              : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
          }`}>
          {followedClubs.has(club.id) ? '♥ Suivi' : '+ Suivre'}
        </button>
      </div>

      {/* Équipes du club */}
      {club.teams?.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Équipes
          </div>
          {club.teams.map(team => (
            <div key={team.id}
              className="flex items-center justify-between p-2
                         bg-surface-50 rounded-xl">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {team.name}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {team.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Suivre l'équipe en mode supporter */}
                <button
                  onClick={() => handleFollowTeam(team.id)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                    followedTeams.has(team.id)
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'text-gray-500 border-surface-200 hover:border-orange-300'
                  }`}>
                  {followedTeams.has(team.id) ? '★ Favori' : '☆ Suivre'}
                </button>
                {/* Intégrer l'équipe */}
                {!isAlreadyInTeam(team.id) && (
                  <button
                    onClick={() => handleJoinTeam(team, club)}
                    className="text-xs px-2 py-1 rounded-lg bg-brand-600
                               text-white hover:bg-brand-700 transition-all">
                    Intégrer
                  </button>
                )}
                {isAlreadyInTeam(team.id) && (
                  <span className="text-xs text-emerald-600 font-medium">
                    ✓ Membre
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  ))}

  {search.length >= 2 && searchResults.length === 0 && (
    <EmptyState
      icon="🔍"
      title="Aucun club trouvé"
      description="Essayez avec un autre terme de recherche."
    />
  )}
</div>
```

#### Section 2 — Mes équipes favorites (mode supporter)

```jsx
{followedTeams.size > 0 && (
  <div>
    <h3 className="font-semibold text-gray-900 mb-4">
      Mes équipes favorites
    </h3>
    <div className="space-y-3">
      {Array.from(followedTeams).map(teamId => {
        const team = allTeams.find(t => t.id === teamId)
        if (!team) return null
        return (
          <Card key={teamId} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{team.name}</div>
              <div className="text-xs text-gray-400">
                {team.clubs?.name} · {team.category}
              </div>
            </div>
            <button
              onClick={() => handleUnfollowTeam(teamId)}
              className="text-xs text-gray-400 hover:text-red-500 transition-all">
              Retirer
            </button>
          </Card>
        )
      })}
    </div>
  </div>
)}
```

---

### Modal "Intégrer une équipe"

```jsx
{showJoinModal && selectedTeam && (
  <div className="fixed inset-0 bg-black/40 flex items-center
                  justify-center z-50 p-4">
    <Card className="w-full max-w-md p-6">
      <h2 className="font-display text-xl font-bold mb-1">
        Rejoindre {selectedTeam.name}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {selectedClub?.name} · {selectedTeam.category}
      </p>

      {/* Choix du rôle */}
      <div className="space-y-2 mb-4">
        <label className="text-sm font-medium text-gray-700">
          Votre rôle
        </label>
        {[
          { value: 'player', label: '⚽ Joueur',
            desc: 'Votre demande sera envoyée au coach' },
          { value: 'coach',  label: '📋 Coach',
            desc: 'Votre demande sera envoyée au président' },
        ].map(r => (
          <button key={r.value}
            onClick={() => setJoinRole(r.value)}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              joinRole === r.value
                ? 'bg-brand-50 border-brand-400'
                : 'border-surface-200 hover:border-surface-300'
            }`}>
            <div className="font-semibold text-sm">{r.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Message optionnel */}
      <textarea
        placeholder="Message optionnel pour le coach..."
        value={joinMessage}
        onChange={e => setJoinMessage(e.target.value)}
        rows={2}
        className="mb-4"
      />

      {joinError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                        text-sm text-red-700 mb-4">
          {joinError}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setShowJoinModal(false)}
          className="flex-1 btn-secondary justify-center">
          Annuler
        </button>
        <button onClick={handleSubmitJoin}
          disabled={!joinRole || joinLoading}
          className="flex-1 btn-primary justify-center disabled:opacity-40">
          {joinLoading ? 'Envoi...' : 'Envoyer la demande'}
        </button>
      </div>
    </Card>
  </div>
)}
```

---

### Modal "Quitter l'équipe"

```jsx
{showLeaveTeam && (
  <div className="fixed inset-0 bg-black/40 flex items-center
                  justify-center z-50 p-4">
    <Card className="w-full max-w-sm p-6 text-center">
      <div className="text-4xl mb-3">🚪</div>
      <h2 className="font-display text-xl font-bold mb-2">
        Quitter l'équipe ?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Vous perdrez l'accès aux entraînements et à la messagerie
        de cette équipe. Votre historique sera conservé.
      </p>
      <div className="flex gap-3">
        <button onClick={() => setShowLeaveTeam(null)}
          className="flex-1 btn-secondary justify-center">
          Annuler
        </button>
        <button onClick={() => handleLeaveTeam(showLeaveTeam)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white
                     text-sm font-medium px-4 py-2 rounded-xl transition-all">
          Confirmer
        </button>
      </div>
    </Card>
  </div>
)}
```

---

## Fonctions db.js à ajouter / mettre à jour

```js
// Rechercher des clubs avec leurs équipes actives
export const searchClubs = async (query, mode = 'name') => {
  let qb = supabase
    .from('clubs')
    .select('*, sports(name), teams(id, name, category, status)')
    .eq('status', 'active')
    .eq('teams.status', 'active')

  if (mode === 'name')       qb = qb.ilike('name', `%${query}%`)
  if (mode === 'city')       qb = qb.ilike('city', `%${query}%`)
  if (mode === 'department') qb = qb.ilike('postal_code', `${query}%`)
  if (mode === 'region')     qb = qb.ilike('region', `%${query}%`)

  const { data, error } = await qb.limit(20)
  if (error) throw error
  return data ?? []
}

// Équipes actives d'un user (joueur ou coach)
export const getMyTeams = async (userId) => {
  const [players, coaches] = await Promise.all([
    supabase
      .from('team_players')
      .select('teams(*, clubs(name, sport_id))')
      .eq('user_id', userId)
      .eq('is_active', true)
      .then(r => r.data?.map(d => ({ ...d.teams, _role: 'player' })) ?? []),
    supabase
      .from('team_coaches')
      .select('teams(*, clubs(name, sport_id))')
      .eq('user_id', userId)
      .eq('is_active', true)
      .then(r => r.data?.map(d => ({ ...d.teams, _role: 'coach' })) ?? []),
  ])
  return [...players, ...coaches]
}

// Quitter une équipe (pas tout le club)
export const leaveTeam = async (userId, teamId) => {
  await Promise.all([
    supabase
      .from('team_players')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('team_id', teamId),
    supabase
      .from('team_coaches')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('team_id', teamId),
    supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('scope_id', teamId)
      .eq('scope_type', 'team'),
  ])
  // Archiver dans player_history
  await supabase.from('player_history').update({ left_at: new Date().toISOString() })
    .eq('user_id', userId).eq('team_id', teamId).is('left_at', null)
}

// Suivre / ne plus suivre une équipe (favoris supporter)
export const followTeam = async (userId, teamId) => {
  const { error } = await supabase
    .from('supporter_favorites')
    .insert({ user_id: userId, team_id: teamId })
  if (error && error.code !== '23505') throw error // ignorer doublon
}

export const unfollowTeam = async (userId, teamId) => {
  const { error } = await supabase
    .from('supporter_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId)
  if (error) throw error
}

export const getFollowedTeams = async (userId) => {
  const { data, error } = await supabase
    .from('supporter_favorites')
    .select('team_id')
    .eq('user_id', userId)
  if (error) throw error
  return new Set(data?.map(d => d.team_id) ?? [])
}

// Prochain match d'une équipe
export const getNextMatch = async (teamId) => {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(1)
    .single()
  return data
}

// Prochain entraînement d'une équipe
export const getNextTraining = async (teamId) => {
  const { data } = await supabase
    .from('trainings')
    .select('*')
    .eq('team_id', teamId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(1)
    .single()
  return data
}
```

---

## Ordre de priorité

1. **reset_db.sql** — exécuter dans Supabase en premier
2. **db.js** — ajouter searchClubs, getMyTeams, leaveTeam,
   followTeam, unfollowTeam, getFollowedTeams, getNextMatch, getNextTraining
3. **TeamPage.jsx** — refaire entièrement selon ce prompt
4. **AppLayout.jsx** — nav unifiée pour tous les rôles, pas de filtre
5. Vérifier que RegisterPage, LoginPage et AuthContext
   n'utilisent plus persons mais directement users

---

## Règles strictes

1. Tout le monde a la même nav — le contenu s'adapte
2. TeamPage : onglets "Mes équipes" et "Explorer" uniquement
3. Pas de bouton "Créer une équipe" visible — ça passe par team_requests
4. Recherche clubs : minimum 2 caractères pour déclencher la recherche
5. Suivre une équipe ≠ intégrer une équipe (deux actions distinctes)
6. Quitter une équipe = quitter l'équipe uniquement, pas le club entier
7. Jamais de redirection forcée selon le rôle
ENDOFFILE