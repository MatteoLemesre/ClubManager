# ClubManager — Prompt Profils Indépendants & Saisons

Ce prompt couvre la refonte du système d'inscription et de gestion des saisons.
Lire CLAUDE.md et CLAUDE_SUPABASE.md pour le contexte général.
Le SQL correspondant est dans migration_v2_2.sql — à exécuter avant ce prompt.

---

## Changements d'architecture

### Avant
- On s'inscrivait directement dans un club avec un rôle
- Le club créait les équipes
- Le président invitait les joueurs

### Après
- On crée d'abord son compte (profil complet, indépendant)
- Ensuite on choisit un club et un rôle → demande de validation
- Les coachs créent leurs équipes → validées par le président
- Bouton "Nouvelle saison" → tout le monde doit refaire une demande

---

## Flux complet

```
1. Créer un compte (profil complet)
        ↓
2. Chercher un club → choisir son rôle → envoyer une demande
        ↓
3a. Supporter  → accès immédiat
3b. Coach      → président reçoit notification → valide
3c. Joueur     → coach reçoit notification → valide
3d. Président  → président existant reçoit notification → valide
        ↓
4. Accès au club
        ↓
5. Coach crée une équipe → président valide → équipe active
   Joueur demande à rejoindre une équipe → coach valide
```

---

## Partie 1 — Inscription (nouveau flux)

### Étape 1 — Créer son compte (RegisterPage.jsx — REFAIRE)

**Route :** `/register`

Un seul formulaire, pas de stepper. Créer le profil complet :

```jsx
// Champs du formulaire
const fields = [
  { name: 'firstName',  label: 'Prénom',           required: true },
  { name: 'lastName',   label: 'Nom',               required: true },
  { name: 'birthDate',  label: 'Date de naissance', required: true, type: 'date' },
  { name: 'phone',      label: 'Téléphone',         required: false },
  { name: 'birthPlace', label: 'Lieu de naissance', required: false },
  { name: 'email',      label: 'Email',             required: true, type: 'email' },
  { name: 'password',   label: 'Mot de passe',      required: true, type: 'password', min: 8 },
  { name: 'confirmPwd', label: 'Confirmer le mdp',  required: true, type: 'password' },
]
```

**À la soumission :**
```js
const handleRegister = async () => {
  // Validations
  if (password !== confirmPwd)   throw 'Les mots de passe ne correspondent pas'
  if (password.length < 8)       throw 'Mot de passe trop court (8 caractères min)'
  const existing = await getUserByEmail(email)
  if (existing)                  throw 'Cet email est déjà utilisé'

  // Créer le compte — pas de club pour l'instant
  const user = await createUser({
    email:          email.toLowerCase().trim(),
    password_hash:  hashPassword(password),
    first_name:     firstName.trim(),
    last_name:      lastName.trim(),
    birth_date:     birthDate,
    phone:          phone.trim() || null,
    birth_place:    birthPlace.trim() || null,
    account_status: 'active',          // actif immédiatement
    current_club_id: null,             // pas de club encore
  })

  // Connecter automatiquement
  setSession(user.id)

  // Rediriger vers la page de choix du club
  navigate('/join-club')
}
```

---

### Étape 2 — Rejoindre un club (JoinClubPage.jsx — CRÉER)

**Route :** `/join-club`
**Accessible aussi depuis :** `/app/profile` si `current_club_id` est null

```jsx
export default function JoinClubPage() {
  const { currentUser, refreshUser } = useAuth()
  const [clubs,          setClubs]          = useState([])
  const [selectedClub,   setSelectedClub]   = useState(null)
  const [selectedRole,   setSelectedRole]   = useState('')
  const [selectedTeam,   setSelectedTeam]   = useState('')
  const [teams,          setTeams]          = useState([])
  const [message,        setMessage]        = useState('')
  const [search,         setSearch]         = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')
  const [done,           setDone]           = useState(false)

  // Charger tous les clubs actifs
  useEffect(() => {
    getAllActiveClubs().then(setClubs)
  }, [])

  // Charger les équipes quand un club est sélectionné
  useEffect(() => {
    if (!selectedClub) return
    getTeamsByClub(selectedClub.id)
      .then(t => setTeams(t.filter(team => team.status === 'active')))
  }, [selectedClub])

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (!selectedClub)  throw new Error('Choisissez un club')
      if (!selectedRole)  throw new Error('Choisissez un rôle')
      if ((selectedRole === 'player' || selectedRole === 'coach') && !selectedTeam) {
        // Pour joueur : équipe obligatoire
        // Pour coach : équipe optionnelle (il peut en créer une)
        if (selectedRole === 'player') throw new Error('Choisissez une équipe')
      }

      // Obtenir la saison courante du club
      const currentSeason = await getCurrentSeason(selectedClub.id)

      if (selectedRole === 'supporter') {
        // Accès immédiat
        await updateUser(currentUser.id, { current_club_id: selectedClub.id })
        await createUserRole({
          user_id:    currentUser.id,
          role_type:  'supporter',
          scope_type: 'club',
          scope_id:   selectedClub.id,
        })
        // Suivre automatiquement le club
        await followClub(currentUser.id, selectedClub.id)
        await refreshUser()
        navigate('/app/events')

      } else {
        // Coach, joueur, président → demande de validation
        await createJoinRequest({
          user_id:    currentUser.id,
          club_id:    selectedClub.id,
          role_type:  selectedRole,
          team_id:    selectedTeam || null,
          message:    message.trim() || null,
          season:     currentSeason,
          status:     'pending',
        })

        // Notifier selon le rôle
        await notifyForJoinRequest(selectedRole, selectedClub, selectedTeam, currentUser)

        setDone(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return <PendingConfirmation role={selectedRole} clubName={selectedClub?.name} />

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Rejoindre un club</h1>
        <p className="text-gray-500 text-sm mb-6">
          Connecté en tant que {currentUser?.first_name} {currentUser?.last_name}
        </p>

        {/* Recherche club */}
        {!selectedClub ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher votre club
            </label>
            <input
              placeholder="Nom du club ou ville..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-3"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clubs
                .filter(c =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.city?.toLowerCase().includes(search.toLowerCase())
                )
                .map(club => (
                  <button key={club.id}
                    onClick={() => setSelectedClub(club)}
                    className="w-full text-left p-3 rounded-xl border border-surface-200
                               hover:border-brand-300 hover:bg-brand-50 transition-all">
                    <div className="font-semibold text-gray-900">{club.name}</div>
                    <div className="text-xs text-gray-500">
                      {club.sports?.name} · {club.city}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Club sélectionné */}
            <div className="flex items-center justify-between p-3 bg-brand-50
                            rounded-xl border border-brand-200">
              <div>
                <div className="font-semibold text-brand-900">{selectedClub.name}</div>
                <div className="text-xs text-brand-600">
                  {selectedClub.sports?.name} · {selectedClub.city}
                </div>
              </div>
              <button onClick={() => { setSelectedClub(null); setSelectedRole('') }}
                className="text-xs text-gray-400 hover:text-gray-600">
                Changer
              </button>
            </div>

            {/* Choix du rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre rôle
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'player',    label: '⚽ Joueur',    desc: 'Validé par le coach' },
                  { value: 'coach',     label: '📋 Coach',     desc: 'Validé par le président' },
                  { value: 'president', label: '🏆 Président', desc: 'Validé par un président' },
                  { value: 'supporter', label: '🎉 Supporter', desc: 'Accès immédiat' },
                ].map(r => (
                  <button key={r.value}
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === r.value
                        ? 'bg-brand-50 border-brand-400 text-brand-900'
                        : 'border-surface-200 hover:border-surface-300'
                    }`}>
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Équipe — si joueur ou coach */}
            {(selectedRole === 'player' || selectedRole === 'coach') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedRole === 'player' ? 'Équipe souhaitée *' : 'Équipe à rejoindre (optionnel)'}
                </label>
                {teams.length > 0 ? (
                  <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                    <option value="">Choisir une équipe...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} — {t.category}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-400 p-3 bg-surface-50 rounded-xl">
                    Aucune équipe active dans ce club pour l'instant.
                    {selectedRole === 'coach' && ' Vous pourrez en créer une une fois votre demande validée.'}
                  </div>
                )}
              </div>
            )}

            {/* Message optionnel */}
            {selectedRole && selectedRole !== 'supporter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  placeholder="Présentez-vous brièvement..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedRole}
              className="w-full btn-primary justify-center disabled:opacity-40"
            >
              {loading ? 'Envoi...' : selectedRole === 'supporter' ? 'Rejoindre' : 'Envoyer la demande'}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

// Composant confirmation en attente
function PendingConfirmation({ role, clubName }) {
  const navigate = useNavigate()
  const messages = {
    coach:     `Votre demande a été envoyée au président de ${clubName}.`,
    player:    `Votre demande a été envoyée au coach de l'équipe.`,
    president: `Votre demande a été envoyée aux présidents de ${clubName}.`,
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-display text-2xl font-bold mb-3">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">{messages[role]}</p>
        <button onClick={() => navigate('/login')}
          className="text-brand-600 text-sm hover:underline">
          ← Retour à la connexion
        </button>
      </Card>
    </div>
  )
}
```

---

## Partie 2 — Fonctions db.js à ajouter

```js
// Demande de rejoindre un club
export const createJoinRequest = async (request) => {
  const { data, error } = await supabase
    .from('club_join_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getJoinRequestsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('club_join_requests')
    .select('*, users(first_name, last_name, email, phone)')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const getJoinRequestsForCoach = async (teamIds) => {
  if (!teamIds?.length) return []
  const { data, error } = await supabase
    .from('club_join_requests')
    .select('*, users(first_name, last_name, email, phone)')
    .in('team_id', teamIds)
    .eq('status', 'pending')
    .eq('role_type', 'player')
  if (error) throw error
  return data ?? []
}

export const approveJoinRequest = async (requestId, reviewerId) => {
  // 1. Récupérer la demande
  const { data: req } = await supabase
    .from('club_join_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!req) throw new Error('Demande introuvable')

  // 2. Mettre à jour current_club_id du user
  await supabase
    .from('users')
    .update({ current_club_id: req.club_id })
    .eq('id', req.user_id)

  // 3. Créer le rôle
  await supabase.from('user_roles').insert({
    user_id:    req.user_id,
    role_type:  req.role_type,
    scope_type: req.team_id ? 'team' : 'club',
    scope_id:   req.team_id ?? req.club_id,
  })

  // 4. Si joueur → ajouter à team_players
  if (req.role_type === 'player' && req.team_id) {
    await supabase.from('team_players').insert({
      team_id:   req.team_id,
      user_id:   req.user_id,
      season:    req.season,
      is_active: true,
    })
  }

  // 5. Si coach → ajouter à team_coaches
  if (req.role_type === 'coach' && req.team_id) {
    await supabase.from('team_coaches').insert({
      team_id:   req.team_id,
      user_id:   req.user_id,
      season:    req.season,
      is_active: true,
    })
  }

  // 6. Créer l'entrée d'historique
  await supabase.from('club_memberships').insert({
    user_id:   req.user_id,
    club_id:   req.club_id,
    role_type: req.role_type,
    team_id:   req.team_id,
    season:    req.season,
    joined_at: new Date().toISOString(),
  })

  // 7. Marquer la demande comme approuvée
  await supabase
    .from('club_join_requests')
    .update({ status: 'approved', reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId)

  // 8. Notifier le demandeur
  await createNotification({
    to_user_id: req.user_id,
    type:       'request_approved',
    title:      'Demande approuvée !',
    body:       'Vous pouvez maintenant accéder au club.',
    request_id: requestId,
  })
}

export const rejectJoinRequest = async (requestId, reviewerId) => {
  const { data: req } = await supabase
    .from('club_join_requests')
    .select('user_id')
    .eq('id', requestId)
    .single()

  await supabase
    .from('club_join_requests')
    .update({ status: 'rejected', reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId)

  await createNotification({
    to_user_id: req.user_id,
    type:       'request_rejected',
    title:      'Demande refusée',
    body:       'Votre demande d\'adhésion a été refusée.',
    request_id: requestId,
  })
}

// Saison courante d'un club
export const getCurrentSeason = async (clubId) => {
  const { data } = await supabase
    .from('seasons')
    .select('name')
    .eq('club_id', clubId)
    .eq('is_current', true)
    .single()
  // Si pas de saison créée : calculer automatiquement
  if (!data) {
    const now = new Date()
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
    return `${year}-${year + 1}`
  }
  return data.name
}

// Nouvelle saison — appelle la fonction PostgreSQL
export const startNewSeason = async (clubId, seasonName, userId) => {
  const { error } = await supabase.rpc('start_new_season', {
    p_club_id: clubId,
    p_season:  seasonName,
    p_user_id: userId,
  })
  if (error) throw error
}

// Historique équipes d'un joueur
export const getPlayerHistory = async (userId) => {
  const { data, error } = await supabase
    .from('player_history')
    .select('*, teams(name, category), clubs(name)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Notification pour une demande de rejoindre
export const notifyForJoinRequest = async (role, club, teamId, user) => {
  const clubUsers = await getUsersByClub(club.id)

  if (role === 'coach' || role === 'president') {
    // Notifier tous les présidents du club
    const presidents = clubUsers.filter(u =>
      u.user_roles?.some(r => r.role_type === 'president')
    )
    for (const p of presidents) {
      await createNotification({
        to_user_id: p.id,
        type:       'registration_request',
        title:      `Nouvelle demande — ${role === 'coach' ? 'Coach' : 'Président'}`,
        body:       `${user.first_name} ${user.last_name} souhaite rejoindre comme ${role}.`,
      })
    }
  }

  if (role === 'player' && teamId) {
    // Notifier les coachs de l'équipe
    const { data: coaches } = await supabase
      .from('team_coaches')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('is_active', true)

    for (const { user_id } of coaches ?? []) {
      await createNotification({
        to_user_id: user_id,
        type:       'registration_request',
        title:      'Nouvelle demande de joueur',
        body:       `${user.first_name} ${user.last_name} souhaite rejoindre votre équipe.`,
      })
    }
  }
}
```

---

## Partie 3 — Création d'équipe par un coach

Un coach validé dans un club peut créer une équipe.
Le président reçoit une notification et valide.

### Dans TeamPage.jsx — bouton pour les coachs

```jsx
// Remplacer le bouton "+ Nouvelle équipe" (président) par ce flux pour les coachs
{is('coach') && (
  <button onClick={() => setShowCreateTeam(true)}
    className="btn-primary">
    + Proposer une équipe
  </button>
)}

// Modal de création
{showCreateTeam && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-md p-6">
      <h2 className="font-display text-xl font-bold mb-4">Proposer une équipe</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nom de l'équipe *
          </label>
          <input placeholder="Ex: Séniors A, U13 Groupe B..." value={teamName}
            onChange={e => setTeamName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Catégorie *
          </label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Choisir...</option>
            {['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15',
              'U16','U17','U18','U19','U20','Séniors','Vétérans'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Genre</label>
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="mixed">Mixte</option>
            <option value="male">Masculin</option>
            <option value="female">Féminin</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => setShowCreateTeam(false)} className="flex-1 btn-secondary justify-center">
          Annuler
        </button>
        <button onClick={handleCreateTeamRequest} className="flex-1 btn-primary justify-center">
          Envoyer au président
        </button>
      </div>
    </Card>
  </div>
)}
```

### Logique handleCreateTeamRequest

```js
const handleCreateTeamRequest = async () => {
  if (!teamName.trim() || !category) return
  const season = await getCurrentSeason(currentUser.current_club_id)

  // Créer la demande d'équipe
  const { error } = await supabase
    .from('team_requests')
    .insert({
      club_id:   currentUser.current_club_id,
      coach_id:  currentUser.id,
      team_name: teamName.trim(),
      category,
      gender,
      season,
      status:    'pending',
    })
  if (error) throw error

  // Notifier les présidents
  const presidents = clubUsers.filter(u =>
    u.user_roles?.some(r => r.role_type === 'president')
  )
  for (const p of presidents) {
    await createNotification({
      to_user_id: p.id,
      type:       'registration_request',
      title:      'Nouvelle équipe proposée',
      body:       `${currentUser.first_name} ${currentUser.last_name} propose de créer l'équipe "${teamName}".`,
    })
  }

  setShowCreateTeam(false)
  // Toast de confirmation
}
```

### Dans AppLayout — validation des demandes d'équipes (président)

Dans le panel de notifications, ajouter la gestion des team_requests :

```js
// Valider une équipe
const handleApproveTeam = async (teamRequestId) => {
  const { data: req } = await supabase
    .from('team_requests')
    .select('*')
    .eq('id', teamRequestId)
    .single()

  // Créer l'équipe
  const { data: team } = await supabase
    .from('teams')
    .insert({
      club_id:  req.club_id,
      sport_id: club.sport_id,
      name:     req.team_name,
      category: req.category,
      gender:   req.gender,
      season:   req.season,
      status:   'active',
    })
    .select()
    .single()

  // Attacher le coach à l'équipe
  await supabase.from('team_coaches').insert({
    team_id:   team.id,
    user_id:   req.coach_id,
    season:    req.season,
    is_active: true,
  })

  // Mettre à jour le rôle du coach
  await supabase.from('user_roles').upsert({
    user_id:    req.coach_id,
    role_type:  'coach',
    scope_type: 'team',
    scope_id:   team.id,
  })

  // Mettre à jour la demande
  await supabase
    .from('team_requests')
    .update({ status: 'approved', reviewed_by: currentUser.id,
              reviewed_at: new Date().toISOString(), team_id: team.id })
    .eq('id', teamRequestId)

  // Notifier le coach
  await createNotification({
    to_user_id: req.coach_id,
    type:       'request_approved',
    title:      'Équipe validée !',
    body:       `L'équipe "${req.team_name}" a été créée avec succès.`,
  })
}
```

---

## Partie 4 — Bouton Nouvelle Saison (président)

Dans la page d'administration du club :

```jsx
{is('president') && (
  <Card className="p-6 mt-6">
    <SectionHeader title="Gestion des saisons" />
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="font-semibold text-gray-900">Saison courante</div>
        <div className="text-sm text-gray-500">{currentSeason?.name ?? 'Non définie'}</div>
      </div>
    </div>

    <div className="border-t border-surface-200 pt-4 mt-4">
      <div className="font-semibold text-gray-900 mb-1">Démarrer une nouvelle saison</div>
      <p className="text-sm text-gray-500 mb-4">
        Tous les joueurs et coachs seront détachés de leurs équipes.
        Ils devront refaire une demande pour la nouvelle saison.
        Les historiques sont conservés.
      </p>

      {!showNewSeason ? (
        <button onClick={() => setShowNewSeason(true)} className="btn-secondary">
          Nouvelle saison
        </button>
      ) : (
        <div className="space-y-3">
          <input
            placeholder="Ex: 2025-2026"
            value={newSeasonName}
            onChange={e => setNewSeasonName(e.target.value)}
          />
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl
                          text-sm text-orange-700">
            ⚠️ Cette action est irréversible. Tous les joueurs et coachs
            devront refaire une demande d'inscription pour la saison {newSeasonName}.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowNewSeason(false)} className="flex-1 btn-secondary justify-center">
              Annuler
            </button>
            <button
              disabled={!newSeasonName.match(/^\d{4}-\d{4}$/)}
              onClick={handleNewSeason}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm
                         font-medium px-4 py-2 rounded-xl disabled:opacity-40 transition-all">
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  </Card>
)}
```

```js
const handleNewSeason = async () => {
  try {
    await startNewSeason(currentUser.current_club_id, newSeasonName, currentUser.id)
    // Notifier tous les membres du club
    const members = await getUsersByClub(currentUser.current_club_id)
    for (const member of members) {
      if (member.id === currentUser.id) continue
      await createNotification({
        to_user_id: member.id,
        type:       'registration_request',
        title:      `Nouvelle saison ${newSeasonName}`,
        body:       'Une nouvelle saison a démarré. Rejoignez une équipe pour continuer.',
      })
    }
    setShowNewSeason(false)
    setNewSeasonName('')
    // Rafraîchir la page
    window.location.reload()
  } catch (err) {
    setError(err.message)
  }
}
```

---

## Partie 5 — Historique personnel sur ProfilePage

Ajouter deux sections sur le profil :

```jsx
// Section historique des équipes (saisons passées)
const [playerHistory, setPlayerHistory] = useState([])

useEffect(() => {
  if (profileUser?.id) getPlayerHistory(profileUser.id).then(setPlayerHistory)
}, [profileUser])

{playerHistory.length > 0 && (
  <section className="mt-6">
    <SectionHeader title="Mes équipes — historique" />
    <div className="space-y-3">
      {playerHistory.map(h => (
        <Card key={h.id} className="p-4 cursor-pointer hover:shadow-md"
          onClick={() => navigate(`/app/team-history/${h.team_id}/${h.season}`)}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{h.teams?.name}</div>
              <div className="text-sm text-gray-500">{h.clubs?.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={h.role_type} />
                <span className="text-xs text-gray-400">Saison {h.season}</span>
                {h.jersey_number && (
                  <span className="text-xs text-gray-400">N°{h.jersey_number}</span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-400 text-right">
              <div>{format(new Date(h.joined_at), 'MMM yyyy', { locale: fr })}</div>
              {h.left_at && (
                <div>→ {format(new Date(h.left_at), 'MMM yyyy', { locale: fr })}</div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </section>
)}
```

---

## Mise à jour App.jsx — nouvelles routes

```jsx
import JoinClubPage    from './pages/auth/JoinClubPage'
import RegisterPage    from './pages/auth/RegisterPage'   // remplace RegisterMemberPage

// Routes à ajouter
<Route path="/register"   element={<RegisterPage />} />
<Route path="/join-club"  element={<JoinClubPage />} />

// La route /register/member et /register/club restent pour compatibilité
// mais pointent vers les nouvelles pages
```

---

## Mise à jour LoginPage — changer les liens

```jsx
// Remplacer les liens vers /register/member et /register/club par :
<Link to="/register">Créer un compte</Link>
// Puis une fois connecté sans club → redirect automatique vers /join-club
```

---

## Mise à jour AppLayout — redirect si pas de club

```jsx
// Après vérification currentUser :
if (currentUser && !currentUser.current_club_id) {
  // Rediriger vers join-club avec message
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-8 max-w-md text-center">
        <div className="text-4xl mb-4">🏟️</div>
        <h1 className="font-display text-xl font-bold mb-2">
          Vous n'êtes rattaché à aucun club
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Rejoignez un club pour accéder à l'application.
        </p>
        <Link to="/join-club" className="btn-primary justify-center">
          Rejoindre un club
        </Link>
      </Card>
    </div>
  )
}
```

---

## Ordre de priorité

1. **db.js** — ajouter createJoinRequest, approveJoinRequest, rejectJoinRequest,
   getJoinRequestsByClub, getJoinRequestsForCoach, getCurrentSeason,
   startNewSeason, getPlayerHistory, notifyForJoinRequest
2. **RegisterPage.jsx** — refaire pour créer un profil complet sans club
3. **JoinClubPage.jsx** — créer la page de choix de club + rôle
4. **AppLayout.jsx** — redirect si pas de club + validation team_requests
   dans le panel de notifications
5. **LoginPage.jsx** — mettre à jour les liens
6. **App.jsx** — ajouter /register et /join-club
7. **TeamPage.jsx** — bouton "Proposer une équipe" pour les coachs
8. **ProfilePage.jsx** — ajouter section historique des équipes
9. **Page admin** (dans AppLayout ou nouvelle page /app/admin) — bouton nouvelle saison

---

## Règles strictes

1. Un user peut exister sans club (current_club_id NULL) — c'est normal
2. current_club_id NULL après connexion → toujours rediriger vers /join-club
3. Les supporters rejoignent sans validation — accès immédiat
4. Coach/Joueur/Président → toujours passer par club_join_requests
5. Les équipes sont créées uniquement via team_requests (coach propose, président valide)
6. Nouvelle saison → appeler la fonction PostgreSQL start_new_season via supabase.rpc()
7. Ne jamais supprimer player_history ou club_memberships
8. Un coach peut rejoindre plusieurs équipes → plusieurs entrées club_join_requests
ENDOFFILE