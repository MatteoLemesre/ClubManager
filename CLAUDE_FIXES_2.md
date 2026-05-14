# ClubManager — Corrections v2

Corriger ces problèmes dans l'ordre strict. Un problème à la fois.

---

## CORRECTION 1 — Accepter / Refuser les demandes (coach/joueur)

### Fichier : src/components/layout/AppLayout.jsx

Le panel de notifications doit gérer l'approbation et le refus.
Réécrire complètement les deux fonctions :

```js
const handleApproveRequest = async (notif) => {
  try {
    // 1. Récupérer la demande complète
    const { data: req, error: reqErr } = await supabase
      .from('club_join_requests')
      .select('*')
      .eq('id', notif.request_id)
      .single()

    if (reqErr || !req) {
      console.error('Demande introuvable', reqErr)
      return
    }

    // 2. Si coach avec nouvelle équipe → créer l'équipe d'abord
    let teamId = req.team_id
    if (req.role_type === 'coach' && !teamId && req.new_team_name) {
      const { data: club } = await supabase
        .from('clubs').select('sport_id').eq('id', req.club_id).single()

      const now  = new Date()
      const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
      const season = `${year}-${year + 1}`

      const { data: newTeam } = await supabase
        .from('teams')
        .insert({
          club_id:  req.club_id,
          sport_id: club.sport_id,
          name:     req.new_team_name,
          category: req.new_team_cat ?? 'Séniors',
          gender:   'mixed',
          season:   season,
          status:   'active',
        })
        .select().single()

      teamId = newTeam?.id
    }

    // 3. Rattacher l'user au club
    await supabase
      .from('users')
      .update({ current_club_id: req.club_id })
      .eq('id', req.user_id)

    // 4. Créer le rôle
    await supabase.from('user_roles').insert({
      user_id:    req.user_id,
      role_type:  req.role_type,
      scope_type: teamId ? 'team' : 'club',
      scope_id:   teamId ?? req.club_id,
    })

    // 5. Ajouter à l'équipe
    if (teamId && req.role_type === 'coach') {
      const now  = new Date()
      const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
      await supabase.from('team_coaches').insert({
        team_id: teamId, user_id: req.user_id,
        season: `${year}-${year + 1}`, is_active: true,
      })
    }
    if (teamId && req.role_type === 'player') {
      const now  = new Date()
      const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
      await supabase.from('team_players').insert({
        team_id: teamId, user_id: req.user_id,
        season: `${year}-${year + 1}`, is_active: true,
      })
    }

    // 6. Marquer la demande approuvée
    await supabase.from('club_join_requests')
      .update({
        status:       'approved',
        reviewed_by:  currentUser.id,
        reviewed_at:  new Date().toISOString(),
      })
      .eq('id', req.id)

    // 7. Notifier l'utilisateur
    await supabase.from('notifications').insert({
      to_user_id: req.user_id,
      type:       'request_approved',
      title:      'Demande acceptée !',
      body:       teamId
        ? `Vous avez rejoint le club et votre équipe. Connectez-vous pour accéder à votre espace.`
        : `Votre demande a été acceptée.`,
      request_id: req.id,
    })

    // 8. Marquer la notif lue + retirer du panel
    await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
    setNotifs(prev => prev.filter(n => n.id !== notif.id))
    setUnreadCount(c => Math.max(0, c - 1))

  } catch (err) {
    console.error('Erreur approbation:', err)
    alert('Erreur : ' + err.message)
  }
}

const handleRejectRequest = async (notif) => {
  try {
    const { data: req } = await supabase
      .from('club_join_requests')
      .select('user_id')
      .eq('id', notif.request_id)
      .single()

    await supabase.from('club_join_requests')
      .update({
        status:      'rejected',
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', notif.request_id)

    if (req?.user_id) {
      await supabase.from('notifications').insert({
        to_user_id: req.user_id,
        type:       'request_rejected',
        title:      'Demande refusée',
        body:       'Votre demande d\'adhésion n\'a pas été acceptée.',
        request_id: notif.request_id,
      })
    }

    await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
    setNotifs(prev => prev.filter(n => n.id !== notif.id))
    setUnreadCount(c => Math.max(0, c - 1))

  } catch (err) {
    console.error('Erreur refus:', err)
  }
}
```

Dans le JSX du panel notifications, afficher les boutons
Accepter/Refuser uniquement pour les demandes en attente :

```jsx
{notifs.map(notif => (
  <div key={notif.id}
    className={`p-4 border-b border-surface-100 ${!notif.read ? 'bg-brand-50' : ''}`}>
    <div className="font-semibold text-sm text-gray-900 mb-0.5">{notif.title}</div>
    <div className="text-xs text-gray-500 mb-2">{notif.body}</div>
    {notif.type === 'registration_request' && notif.request_id && (
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => handleApproveRequest(notif)}
          className="flex-1 text-xs py-2 rounded-xl bg-emerald-100
                     text-emerald-700 font-medium hover:bg-emerald-200 transition-all">
          ✓ Accepter
        </button>
        <button
          onClick={() => handleRejectRequest(notif)}
          className="flex-1 text-xs py-2 rounded-xl bg-red-100
                     text-red-600 font-medium hover:bg-red-200 transition-all">
          ✗ Refuser
        </button>
      </div>
    )}
    <div className="text-[10px] text-gray-300 mt-1">
      {format(new Date(notif.created_at), "d MMM · HH'h'mm", { locale: fr })}
    </div>
  </div>
))}
```

---

## CORRECTION 2 — Feed : impossible de poster

### Fichier : src/pages/app/FeedPage.jsx + src/services/db.js

**Problème 1 — canPostForClub doit être async**

Remplacer dans db.js :

```js
export const canPostForClub = async (userId, clubId) => {
  if (!userId || !clubId) return false

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role_type, scope_type, scope_id')
    .eq('user_id', userId)

  if (!roles?.length) return false

  // Président du club
  if (roles.some(r =>
    r.role_type === 'president' &&
    r.scope_type === 'club' &&
    r.scope_id === clubId
  )) return true

  // Coach d'une équipe du club
  const { data: clubTeams } = await supabase
    .from('teams')
    .select('id')
    .eq('club_id', clubId)
    .eq('status', 'active')

  const teamIds = clubTeams?.map(t => t.id) ?? []
  return roles.some(r =>
    r.role_type === 'coach' &&
    r.scope_type === 'team' &&
    teamIds.includes(r.scope_id)
  )
}
```

**Problème 2 — FeedPage doit appeler canPostForClub en async**

Dans FeedPage.jsx :

```jsx
const [canPost, setCanPost] = useState(false)
const [club,    setClub]    = useState(null)

useEffect(() => {
  const load = async () => {
    // Charger les posts
    try {
      const data = await getFeedPosts(currentUser.id, currentUser.current_club_id)
      setPosts(data)
    } catch (err) {
      setError(err.message)
    }

    // Vérifier si l'user peut poster
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
}, [])

// Afficher CreatePostBox seulement si canPost est true
{canPost && club && (
  <CreatePostBox
    club={club}
    authorId={currentUser.id}
    onPost={(post) => setPosts(prev => [post, ...prev])}
  />
)}
```

**Problème 3 — CreatePostBox doit recevoir le club et poster correctement**

```jsx
function CreatePostBox({ club, authorId, onPost }) {
  const [content,  setContent]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

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
    <div className="bg-white rounded-2xl border border-surface-200
                    shadow-sm p-4 mb-6">
      <div className="flex gap-3">
        {/* Avatar du club */}
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
              className="btn-primary disabled:opacity-40 text-sm px-4 py-2">
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Dans PostCard, afficher le club comme auteur :**

```jsx
// Header du post
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
```

---

## CORRECTION 3 — Recherche clubs : région/département vides

### Fichier : src/pages/app/TeamPage.jsx (onglet Explorer)

Le problème vient du chargement depuis fr_postal_codes.
Réécrire complètement le chargement :

```js
const [allRegs,  setAllRegs]  = useState([])
const [allDeps,  setAllDeps]  = useState([])
const [allClubs, setAllClubs] = useState([])
const [regionFilter, setRegionFilter] = useState('')
const [depFilter,    setDepFilter]    = useState('')
const [search,       setSearch]       = useState('')

// Charger régions, départements ET tous les clubs au montage
useEffect(() => {
  const load = async () => {
    // Régions et départements depuis fr_postal_codes
    const { data: postal, error: postalErr } = await supabase
      .from('fr_postal_codes')
      .select('departement, code_dep, region')
      .order('region')

    if (postalErr) {
      console.error('Erreur chargement postal_codes:', postalErr)
    } else if (postal) {
      const regs = [...new Set(postal.map(d => d.region))].sort()
      setAllRegs(regs)

      const deps = [...new Map(
        postal.map(d => [d.code_dep, { departement: d.departement, code_dep: d.code_dep, region: d.region }])
      ).values()].sort((a, b) => a.departement.localeCompare(b.departement))
      setAllDeps(deps)
    }

    // Tous les clubs actifs avec leurs équipes
    const { data: clubs, error: clubsErr } = await supabase
      .from('clubs')
      .select('*, sports(name), teams(id, name, category, status)')
      .eq('status', 'active')
      .order('name')

    if (clubsErr) {
      console.error('Erreur chargement clubs:', clubsErr)
    } else {
      setAllClubs(clubs ?? [])
    }
  }
  load()
}, [])

// Départements filtrés selon la région choisie
const filteredDeps = regionFilter
  ? allDeps.filter(d => d.region === regionFilter)
  : allDeps

// Clubs filtrés
const filteredClubs = allClubs.filter(club => {
  const matchReg = !regionFilter || club.region     === regionFilter
  const matchDep = !depFilter    || club.department === depFilter
  const matchTxt = !search       ||
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    club.city?.toLowerCase().includes(search.toLowerCase())
  return matchReg && matchDep && matchTxt
})
```

Afficher les filtres dans cet ordre :

```jsx
<div className="space-y-3 mb-6">
  {/* 1. Région */}
  <div>
    <label className="block text-xs font-semibold text-gray-400
                      uppercase tracking-wider mb-1">Région</label>
    <select
      value={regionFilter}
      onChange={e => { setRegionFilter(e.target.value); setDepFilter('') }}
      className="w-full bg-surface-50 border border-surface-200
                 rounded-xl px-3 py-2 text-sm">
      <option value="">Toutes les régions</option>
      {allRegs.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  </div>

  {/* 2. Département (filtré selon région) */}
  <div>
    <label className="block text-xs font-semibold text-gray-400
                      uppercase tracking-wider mb-1">Département</label>
    <select
      value={depFilter}
      onChange={e => setDepFilter(e.target.value)}
      className="w-full bg-surface-50 border border-surface-200
                 rounded-xl px-3 py-2 text-sm">
      <option value="">Tous les départements</option>
      {filteredDeps.map(d => (
        <option key={d.code_dep} value={d.departement}>
          {d.departement}
        </option>
      ))}
    </select>
  </div>

  {/* 3. Recherche texte */}
  <div>
    <label className="block text-xs font-semibold text-gray-400
                      uppercase tracking-wider mb-1">Nom ou ville</label>
    <input
      placeholder="Rechercher un club..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="w-full bg-surface-50 border border-surface-200
                 rounded-xl px-3 py-2 text-sm"
    />
  </div>
</div>

{/* Résultats */}
<div className="space-y-3">
  {filteredClubs.length === 0 ? (
    <div className="text-center py-8 text-gray-400 text-sm">
      {regionFilter || depFilter || search
        ? 'Aucun club trouvé pour ces critères'
        : 'Sélectionnez une région ou tapez un nom'}
    </div>
  ) : (
    filteredClubs.map(club => (
      <ClubCard
        key={club.id}
        club={club}
        onViewProfile={() => setSelectedClubProfile(club)}
        followed={followedClubs.has(club.id)}
        onFollow={() => handleFollowClub(club.id)}
      />
    ))
  )}
</div>
```

---

## CORRECTION 4 — Profil club en pop-up

Dans TeamPage.jsx onglet Explorer, au clic sur une carte club
afficher un pop-up (drawer latéral) avec le profil complet :

```jsx
const [selectedClubProfile, setSelectedClubProfile] = useState(null)

// Drawer latéral
{selectedClubProfile && (
  <ClubProfileDrawer
    club={selectedClubProfile}
    currentUser={currentUser}
    onClose={() => setSelectedClubProfile(null)}
  />
)}
```

```jsx
function ClubProfileDrawer({ club, currentUser, onClose }) {
  const navigate = useNavigate()
  const [teams,     setTeams]     = useState([])
  const [posts,     setPosts]     = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamPlayers,  setTeamPlayers]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('teams').select('*').eq('club_id', club.id).eq('status', 'active'),
        supabase.from('club_posts')
          .select('*, users!author_id(id, first_name, last_name)')
          .eq('club_id', club.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ])
      setTeams(t ?? [])
      setPosts(p ?? [])
      setLoading(false)
    }
    load()
  }, [club.id])

  useEffect(() => {
    if (!selectedTeam) return
    supabase
      .from('team_players')
      .select('*, users(id, first_name, last_name, birth_date)')
      .eq('team_id', selectedTeam.id)
      .eq('is_active', true)
      .then(({ data }) => setTeamPlayers(data ?? []))
  }, [selectedTeam])

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto
                      shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-200
                        flex items-center justify-between px-5 py-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                            justify-center text-white font-bold text-lg">
              {club.name[0]}
            </div>
            <div>
              <div className="font-bold text-gray-900">{club.name}</div>
              <div className="text-xs text-gray-400">
                {club.sports?.name} · {club.city}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
            ✕
          </button>
        </div>

        {/* Infos club */}
        <div className="px-5 py-4 border-b border-surface-100">
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{teams.length}</div>
              <div className="text-xs text-gray-400">Équipes</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
          </div>
          {(club.department || club.region) && (
            <div className="text-sm text-gray-500 mt-3">
              📍 {[club.department, club.region].filter(Boolean).join(' — ')}
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex border-b border-surface-200 px-5">
          {[
            { id: 'info',  label: '📋 Infos' },
            { id: 'feed',  label: '📰 Posts' },
            { id: 'teams', label: '⚽ Équipes' },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600
                              rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Onglet Infos */}
              {activeTab === 'info' && (
                <div className="space-y-3">
                  {club.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">✉️</span> {club.email}
                    </div>
                  )}
                  {club.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">📞</span> {club.phone}
                    </div>
                  )}
                  {club.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">🏠</span>
                      {club.address}, {club.postal_code} {club.city}
                    </div>
                  )}
                  <div className="pt-3">
                    <button
                      onClick={() => navigate(`/app/clubs/${club.id}`)}
                      className="w-full btn-secondary justify-center text-sm">
                      Voir la page complète →
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Posts */}
              {activeTab === 'feed' && (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Aucun post publié
                    </div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id}
                        className="p-4 bg-surface-50 rounded-2xl border border-surface-200">
                        <div className="text-xs text-gray-400 mb-2">
                          {post.users?.first_name} {post.users?.last_name}
                          {' · '}
                          {format(new Date(post.created_at), "d MMM", { locale: fr })}
                        </div>
                        <p className="text-sm text-gray-800">{post.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Onglet Équipes */}
              {activeTab === 'teams' && (
                <div>
                  {/* Sélecteurs d'équipes */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teams.map(team => (
                      <button key={team.id}
                        onClick={() => setSelectedTeam(
                          selectedTeam?.id === team.id ? null : team
                        )}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium
                                    border transition-all ${
                          selectedTeam?.id === team.id
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                        }`}>
                        {team.name}
                        <span className="ml-1 text-xs opacity-70">
                          {team.category}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Joueurs de l'équipe sélectionnée */}
                  {selectedTeam ? (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-400
                                      uppercase tracking-wider mb-3">
                        {selectedTeam.name}
                      </div>
                      {teamPlayers.length === 0 ? (
                        <div className="text-sm text-gray-400">
                          Aucun joueur dans cette équipe
                        </div>
                      ) : (
                        teamPlayers.map(tp => {
                          const u   = tp.users
                          const age = u?.birth_date
                            ? differenceInYears(new Date(), new Date(u.birth_date))
                            : null
                          return (
                            <div key={tp.user_id}
                              className="flex items-center gap-3 p-3 bg-surface-50
                                         rounded-xl border border-surface-100">
                              <div className="w-7 h-7 rounded-full bg-brand-100
                                              flex items-center justify-center
                                              text-brand-700 font-bold text-xs">
                                {tp.jersey_number ?? '?'}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-gray-900">
                                  {u?.first_name} {u?.last_name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {tp.position ?? '—'}
                                  {age && ` · ${age} ans`}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-400 py-4">
                      Sélectionnez une équipe pour voir ses joueurs
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## CORRECTION 5 — Messagerie : supprimer les messages de base

### Fichier : src/pages/app/MessagesPage.jsx

Réécrire la page entièrement avec une interface propre et vide par défaut.

**Structure :**
- Colonne gauche : liste des conversations + bouton "Nouvelle discussion"
- Colonne droite : conversation active OU état vide

**Si aucune conversation :**
```jsx
// État vide colonne gauche
<div className="flex flex-col items-center justify-center h-full py-12 px-4 gap-3">
  <div className="text-4xl">💬</div>
  <div className="font-semibold text-gray-700 text-sm text-center">
    Aucune conversation
  </div>
  <p className="text-xs text-gray-400 text-center">
    Recherchez un membre de votre club pour démarrer une discussion.
  </p>
</div>

// État vide colonne droite
<div className="flex flex-col items-center justify-center h-full gap-4">
  <div className="text-5xl">💬</div>
  <div className="font-semibold text-gray-700">Vos messages</div>
  <p className="text-sm text-gray-400 text-center max-w-xs">
    Sélectionnez une conversation ou recherchez un membre pour commencer.
  </p>
  <button onClick={() => setShowSearch(true)} className="btn-primary">
    Rechercher un membre
  </button>
</div>
```

**Recherche de membres pour démarrer une conversation :**
```jsx
const [showSearch,    setShowSearch]    = useState(false)
const [searchMembers, setSearchMembers] = useState('')
const [members,       setMembers]       = useState([])

// Charger les membres du club de l'user
useEffect(() => {
  if (!currentUser.current_club_id) return
  supabase
    .from('users')
    .select('id, first_name, last_name, current_club_id')
    .eq('current_club_id', currentUser.current_club_id)
    .neq('id', currentUser.id)
    .then(({ data }) => setMembers(data ?? []))
}, [currentUser.current_club_id])

const filteredMembers = members.filter(m =>
  `${m.first_name} ${m.last_name}`
    .toLowerCase()
    .includes(searchMembers.toLowerCase())
)

// Modal recherche membre
{showSearch && (
  <div className="fixed inset-0 bg-black/40 flex items-center
                  justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Nouvelle conversation</h3>
        <button onClick={() => setShowSearch(false)}
          className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <input
        placeholder="Rechercher un membre..."
        value={searchMembers}
        onChange={e => setSearchMembers(e.target.value)}
        className="mb-3"
        autoFocus
      />
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-4">
            Aucun membre trouvé
          </div>
        ) : (
          filteredMembers.map(m => (
            <button key={m.id}
              onClick={() => handleStartConversation(m)}
              className="w-full flex items-center gap-3 p-3 rounded-xl
                         hover:bg-surface-50 text-left transition-all">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center
                              justify-center text-brand-700 font-semibold text-sm">
                {m.first_name[0]}{m.last_name[0]}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">
                  {m.first_name} {m.last_name}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
)}
```

**Créer ou ouvrir une conversation directe :**
```js
const handleStartConversation = async (member) => {
  // Vérifier si une conv directe existe déjà
  const { data: existing } = await supabase
    .from('conversation_members')
    .select('conversation_id, conversations(id, type)')
    .eq('user_id', currentUser.id)

  // Chercher une conv de type 'direct' avec ce membre
  let convId = null
  for (const row of existing ?? []) {
    if (row.conversations?.type !== 'direct') continue
    const { data: members } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', row.conversation_id)
    if (members?.some(m => m.user_id === member.id)) {
      convId = row.conversation_id
      break
    }
  }

  // Créer une nouvelle conv si elle n'existe pas
  if (!convId) {
    const { data: conv } = await supabase
      .from('conversations')
      .insert({
        club_id:    currentUser.current_club_id,
        type:       'direct',
        name:       `${member.first_name} ${member.last_name}`,
        created_by: currentUser.id,
      })
      .select().single()

    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: currentUser.id,    can_write: true },
      { conversation_id: conv.id, user_id: member.id, can_write: true },
    ])

    convId = conv.id
    // Recharger les conversations
    await loadConversations()
  }

  setActiveConvId(convId)
  setShowSearch(false)
}
```

**Charger les conversations de l'user :**
```js
const loadConversations = async () => {
  const { data } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      can_write,
      conversations (
        id, type, name, created_at,
        messages (id, content, sent_at, sender_id)
      )
    `)
    .eq('user_id', currentUser.id)
    .order('created_at', { foreignTable: 'conversations', ascending: false })

  const convs = data?.map(d => ({
    ...d.conversations,
    can_write: d.can_write,
  })) ?? []
  setConversations(convs)
}

useEffect(() => { loadConversations() }, [])
```

**Affichage des messages dans la conversation active :**
```jsx
// Bulles de messages
{activeMessages.map(msg => {
  const isMe = msg.sender_id === currentUser.id
  return (
    <div key={msg.id}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
        isMe
          ? 'bg-brand-600 text-white rounded-br-sm'
          : 'bg-surface-100 text-gray-800 rounded-bl-sm'
      }`}>
        {msg.content}
        <div className={`text-[10px] mt-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
          {format(new Date(msg.sent_at), "HH'h'mm", { locale: fr })}
        </div>
      </div>
    </div>
  )
})}
```

**Envoyer un message :**
```js
const handleSend = async () => {
  if (!newMessage.trim() || !activeConvId) return
  const content = newMessage.trim()
  setNewMessage('')

  const { data: msg } = await supabase
    .from('messages')
    .insert({
      conversation_id: activeConvId,
      sender_id:       currentUser.id,
      content:         content,
    })
    .select().single()

  if (msg) setActiveMessages(prev => [...prev, msg])
}
```

---

## Ordre d'exécution

1. AppLayout.jsx — handleApproveRequest + handleRejectRequest
2. db.js — canPostForClub async
3. FeedPage.jsx — canPost state, CreatePostBox corrigé, PostCard corrigé
4. TeamPage.jsx — chargement régions/départements + ClubProfileDrawer
5. MessagesPage.jsx — réécriture complète sans données de base
