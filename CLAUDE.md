# ClubManager — CLAUDE.md

Contexte complet du projet pour Claude Code. Lis entièrement avant de toucher au code.

---

## Stack & commandes

```bash
npm run dev      # http://localhost:5173
npm run build    # build prod
npm run preview  # tester le build
```

**Dépendances :** React 18, Vite, React Router v6, Tailwind CSS v3, lucide-react, date-fns  
**Déploiement :** Render Static Site — build: `npm run build` — publish: `dist`  
**Backend :** aucun — tout est mock data dans `src/data/mock.js`

---

## Structure des fichiers

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.jsx        # Sidebar rétractable + topbar + <Outlet />
│   └── ui/
│       └── index.jsx            # Avatar, Badge, Card, EmptyState, StatCard...
├── context/
│   └── AuthContext.jsx          # useAuth() — rôle courant, is(), isOneOf(), canManageTeam()
├── data/
│   └── mock.js                  # Toutes les données + helpers
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx        # ❌ À CRÉER
│   │   └── RegisterPage.jsx     # ❌ À CRÉER
│   └── app/
│       ├── EventsPage.jsx       # ✅ FAIT
│       ├── TeamPage.jsx         # ✅ FAIT
│       ├── MembersPage.jsx      # ❌ À CRÉER
│       ├── CalendarPage.jsx     # ❌ À CRÉER
│       ├── MessagesPage.jsx     # ❌ À CRÉER
│       └── MatchPage.jsx        # ❌ À CRÉER  (/app/matches/:id)
├── App.jsx                      # ❌ À CRÉER — routes React Router
└── main.jsx                     # ✅ existe
```

---

## Rôles utilisateurs

| Rôle | id | Description |
|------|-----|-------------|
| `president` | u-1 | Accès complet club |
| `coach` | u-2, u-3 | Ses équipes uniquement |
| `player` | u-4→u-7 | Son profil + son équipe |
| `supporter` | u-8 | Matchs, favoris, discussions |
| `parent` | u-9 | Supporter + conv parent |

**Règle absolue :** toujours vérifier le rôle avec `useAuth()` avant d'afficher du contenu sensible. Ne jamais rediriger — adapter le contenu affiché.

---

## AuthContext — API

```js
const { currentUser, login, logout, is, isOneOf, canManageTeam } = useAuth()

is('president')                  // true si rôle exact
isOneOf('president', 'coach')    // true si un des rôles
canManageTeam('team-1')          // true si président OU coach de cette équipe
login('u-4')                     // switcher d'user (dev uniquement)
```

---

## AppLayout.jsx — REFAIRE ENTIÈREMENT

**La sidebar doit être rétractable.** Voici le comportement exact :

### État compact (défaut) — largeur 64px
- Logo club (icône football) centré
- 5 icônes de navigation centrées, sans label
- En bas : avatar de l'utilisateur connecté
- Bouton flèche `ChevronRight` centré tout en bas pour ouvrir

### État étendu — largeur 220px
- Logo + nom du club sur une ligne
- 5 items de navigation avec icône + label texte
- En bas : avatar + nom + rôle de l'utilisateur
- Bouton flèche `ChevronLeft` pour refermer

### Implémentation

```jsx
// État géré localement dans AppLayout
const [expanded, setExpanded] = useState(false)

// La sidebar change de largeur avec une transition CSS
<aside className={`${expanded ? 'w-56' : 'w-16'} transition-all duration-200 ...`}>
```

### Navigation — items selon le rôle

```js
// Items visibles pour chaque rôle
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements',  roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,        label: 'Équipe',      roles: ['president','coach','player'] },
  { to: '/app/members',  icon: Users,         label: 'Membres',     roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier',  roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie',  roles: ['president','coach','player','parent'] },
]

// Filtrer selon le rôle courant
const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(currentUser?.role))
```

> Note : les supporters n'ont PAS accès à la messagerie d'équipe (pas dans leur nav), mais peuvent créer des discussions libres depuis la page Membres.

### Topbar
- Gauche : nom du club + sport
- Droite : `<RoleBadge>` + `<Avatar>` + nom complet

### Sélecteur de rôle dev
- Uniquement en mode dev (toujours visible pour l'instant)
- Dans la sidebar, hover sur l'avatar → dropdown avec tous les USERS
- Format : avatar + "Prénom Nom" + rôle en dessous

### Structure JSX finale AppLayout

```jsx
<div className="flex h-screen bg-surface-50 overflow-hidden">
  {/* SIDEBAR */}
  <aside className={`${expanded ? 'w-56' : 'w-16'} bg-white border-r border-surface-200 
                     flex flex-col transition-all duration-200 flex-shrink-0`}>
    
    {/* Logo */}
    <div className={`flex items-center gap-3 p-4 border-b border-surface-100 ${!expanded && 'justify-center'}`}>
      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
        {/* icône foot SVG */}
      </div>
      {expanded && <span className="font-display font-bold text-sm text-gray-900 truncate">{CLUB.name}</span>}
    </div>

    {/* Nav items */}
    <nav className="flex-1 flex flex-col gap-1 p-2">
      {visibleNav.map(item => (
        <NavLink key={item.to} to={item.to}
          className={({ isActive }) => `flex items-center gap-3 px-2 py-2.5 rounded-xl
            transition-all duration-150 ${expanded ? '' : 'justify-center'}
            ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-700'}`}
        >
          <item.icon size={20} strokeWidth={1.8} />
          {expanded && <span className="text-sm font-medium">{item.label}</span>}
        </NavLink>
      ))}
    </nav>

    {/* User + toggle */}
    <div className="p-2 border-t border-surface-100 flex flex-col gap-2">
      {/* Dev role switcher */}
      <div className="relative group">
        <button className={`w-full flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 
                           ${!expanded && 'justify-center'}`}>
          <Avatar user={currentUser} size="sm" />
          {expanded && (
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-semibold text-gray-800 truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</div>
            </div>
          )}
        </button>
        {/* Dropdown dev */}
        <div className="absolute bottom-full left-0 mb-1 bg-white rounded-2xl shadow-xl 
                        border border-surface-200 p-2 w-52 hidden group-hover:block z-50">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
            Changer de rôle (dev)
          </div>
          {USERS.map(u => (
            <button key={u.id} onClick={() => login(u.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left 
                         hover:bg-surface-50 ${currentUser?.id === u.id ? 'bg-brand-50' : ''}`}>
              <Avatar user={u} size="sm" />
              <div>
                <div className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</div>
                <div className="text-xs text-gray-400 capitalize">{u.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bouton toggle expand/collapse */}
      <button onClick={() => setExpanded(e => !e)}
        className={`flex items-center justify-center p-2 rounded-xl hover:bg-surface-100 
                   text-gray-400 hover:text-gray-600 transition-all ${expanded ? 'self-end w-8 h-8' : 'w-full'}`}>
        {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  </aside>

  {/* MAIN */}
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="h-14 bg-white border-b border-surface-200 flex items-center 
                       justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-gray-900">{CLUB.name}</span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-500">{CLUB.sport}</span>
      </div>
      {currentUser && (
        <div className="flex items-center gap-3">
          <RoleBadge role={currentUser.role} />
          <Avatar user={currentUser} size="sm" />
          <span className="text-sm font-medium text-gray-700">
            {currentUser.firstName} {currentUser.lastName}
          </span>
        </div>
      )}
    </header>
    <div className="flex-1 overflow-y-auto">
      <Outlet />
    </div>
  </main>
</div>
```

---

## Contenu des pages selon le rôle

### Principe général
**Ne jamais rediriger.** Afficher la page pour tous, mais adapter les sections visibles :
- Masquer les boutons d'action (créer, modifier, supprimer) si pas le droit
- Masquer les colonnes/sections sensibles (licences, stats privées)
- Afficher un message contextuel si une section est vide pour ce rôle

---

### EventsPage.jsx ✅ — contenu par rôle

| Élément | Président | Coach | Joueur | Supporter | Parent |
|---------|:---------:|:-----:|:------:|:---------:|:------:|
| Voir tous les événements du club | ✅ | ✅ équipe | ✅ | ✅ | ✅ |
| Bouton "Créer un événement" | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bouton "Participer" | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir événements privés (réunions coachs) | ✅ | ✅ | ❌ | ❌ | ❌ |

**Filtrage des événements selon le rôle :**
```js
const visibleEvents = EVENTS.filter(ev => {
  if (ev.visibility === 'club') return true
  if (ev.visibility === 'team') return isOneOf('president','coach') || currentUser.teamIds?.includes(ev.teamId)
  if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
  return false
})
```

---

### TeamPage.jsx ✅ — contenu par rôle

| Élément | Président | Coach | Joueur | Supporter | Parent |
|---------|:---------:|:-----:|:------:|:---------:|:------:|
| Voir toutes les équipes | ✅ | ✅ siennes | ✅ sienne | ❌ (pas dans nav) | ❌ |
| Onglets équipes | ✅ toutes | ✅ siennes | ❌ (pas de choix) | — | — |
| Boutons "Convocations" / "Publier compo" | ✅ | ✅ | ❌ | — | — |
| Boutons présence/dispo | ❌ | ❌ | ✅ | — | — |
| Boutons "+ Entraînement" / "+ Match" | ✅ | ✅ | ❌ | — | — |
| Bouton "+ Nouvelle équipe" | ✅ | ❌ | ❌ | — | — |

---

### MembersPage.jsx ❌ — specs complètes

**Contenu par rôle :**

| Élément | Président | Coach | Joueur | Supporter | Parent |
|---------|:---------:|:-----:|:------:|:---------:|:------:|
| Liste tous les membres | ✅ | ✅ ses équipes | ✅ tous | ✅ tous | ✅ tous |
| Colonne Licence | ✅ | ✅ | ❌ | ❌ | ❌ |
| Filtre par statut licence | ✅ | ✅ | ❌ | ❌ | ❌ |
| Bouton "+ Ajouter membre" | ✅ | ❌ | ❌ | ❌ | ❌ |
| Clic profil → voir détail | ✅ | ✅ (ses joueurs) | ✅ (soi uniquement) | ✅ (noms seulement) | ✅ |
| Voir stats (matchs, buts) | ✅ | ✅ | ✅ | ✅ | ✅ |

**Toolbar :**
```jsx
<input placeholder="Rechercher par nom, prénom..." />  // filtre temps réel
<select> Toutes les équipes / team-1 / team-2... </select>
<select> Tous les rôles / Joueur / Coach / Supporter... </select>
{isOneOf('president','coach') && (
  <select> Toutes licences / Valide / Expirée / Bientôt </select>
)}
// Toggle vue liste / grille
```

**Vue liste — colonnes :**
```
Membre (avatar + nom + poste)  |  Équipe  |  Rôle  |  [Licence si droit]  |  Matchs  |  Buts  |  Présence
```

**Vue grille — carte par membre :**
```
Avatar large centré
Prénom Nom (font-semibold)
Équipe + Poste (text-sm text-gray-500)
[LicenseBadge si droit]
Stats en ligne : 12 matchs · 8 buts · 78%
```

**Filtrage :**
```js
const visibleUsers = USERS.filter(u => {
  // Coach ne voit que ses joueurs
  if (is('coach')) {
    const myTeamPlayerIds = USERS
      .filter(p => p.role === 'player' && p.teamIds?.some(t => currentUser.teamIds.includes(t)))
      .map(p => p.id)
    if (!myTeamPlayerIds.includes(u.id) && u.id !== currentUser.id) return false
  }
  const matchSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  const matchTeam   = !teamFilter || u.teamIds?.includes(teamFilter)
  const matchRole   = !roleFilter || u.role === roleFilter
  const matchLic    = !licFilter  || u.licenseStatus === licFilter
  return matchSearch && matchTeam && matchRole && matchLic
})
```

**Barre de présence colorée :**
```jsx
const rate = u.stats?.attendanceRate
const color = !rate ? 'bg-gray-200' : rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-orange-400' : 'bg-red-400'
<div className="w-full bg-surface-100 rounded-full h-1.5">
  <div className={`${color} h-1.5 rounded-full`} style={{ width: `${rate ?? 0}%` }} />
</div>
```

---

### CalendarPage.jsx ❌ — specs complètes

**Contenu par rôle :**

| Élément | Président | Coach | Joueur | Supporter | Parent |
|---------|:---------:|:-----:|:------:|:---------:|:------:|
| Entraînements | ✅ tous | ✅ ses équipes | ✅ son équipe | ❌ | ❌ |
| Matchs | ✅ tous | ✅ ses équipes | ✅ son équipe | ✅ tous | ✅ tous |
| Événements | ✅ tous | ✅ les siens | ✅ les siens | ✅ les siens | ✅ les siens |
| Bouton présence entraînement | ❌ | ❌ | ✅ | ❌ | ❌ |
| Bouton confirmer match | ❌ | ❌ | ✅ | ✅ déplacement | ✅ |
| Filtre entraînements | ✅ | ✅ | ❌ (pas d'entr. à filtrer) | ❌ | ❌ |

**Filtrage des items du calendrier :**
```js
const getVisibleItems = () => {
  const items = []

  if (showTrainings && !isOneOf('supporter', 'parent')) {
    TRAININGS
      .filter(t => is('president') || currentUser.teamIds?.includes(t.teamId))
      .forEach(t => items.push({ ...t, _type: 'training', _date: t.scheduledAt }))
  }

  if (showMatches) {
    MATCHES
      .filter(m => is('president') || isOneOf('supporter','parent') || currentUser.teamIds?.includes(m.teamId))
      .forEach(m => items.push({ ...m, _type: 'match', _date: m.scheduledAt }))
  }

  if (showEvents) {
    EVENTS
      .filter(ev => {
        if (ev.visibility === 'club') return true
        if (ev.visibility === 'team') return isOneOf('president','coach') || currentUser.teamIds?.includes(ev.teamId)
        if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
        return false
      })
      .forEach(e => items.push({ ...e, _type: 'event', _date: e.startsAt }))
  }

  if (teamFilter) return items.filter(i => !i.teamId || i.teamId === teamFilter)
  return items
}
```

**Layout :**
```jsx
<div className="flex h-full">
  <div className="flex-1 flex flex-col p-6">
    {/* Toolbar */}
    {/* Grille mois */}
  </div>
  <div className="w-64 border-l border-surface-200 bg-white overflow-y-auto">
    {/* Détail du jour sélectionné */}
  </div>
</div>
```

**Bouton action contextuel dans le panel droit :**
```jsx
{item._type === 'training' && is('player') && (
  <button className="...">Déclarer présence</button>
)}
{item._type === 'match' && is('player') && (
  <button className="...">Confirmer dispo</button>
)}
{item._type === 'match' && isOneOf('supporter','parent') && (
  <button className="...">Je viens supporter</button>
)}
{item._type === 'match' && (
  <Link to={`/app/matches/${item.id}`} className="...">Voir la fiche →</Link>
)}
```

---

### MessagesPage.jsx ❌ — specs complètes

**Contenu par rôle :**

| Élément | Président | Coach | Joueur | Parent |
|---------|:---------:|:-----:|:------:|:------:|
| Voir team_chat de ses équipes | ✅ toutes | ✅ siennes | ✅ sienne | ❌ |
| Voir coach_channel | ✅ toutes | ✅ écriture | ✅ lecture seule | ❌ |
| Voir parent_chat | ✅ toutes | ✅ si lié | ✅ si lié | ✅ |
| Créer discussion libre | ✅ | ✅ | ❌ | ✅ |
| Écrire dans coach_channel | ✅ | ✅ | ❌ (lecture seule) | ❌ |

> Les supporters n'ont PAS accès à la messagerie — ils ne voient pas cette page dans leur nav.

**Règle coach_channel :**
```jsx
const isReadOnly = conv.type === 'coach_channel' && is('player')

// Input désactivé visuellement
{isReadOnly ? (
  <div className="p-3 bg-surface-50 rounded-xl text-sm text-gray-400 flex items-center gap-2">
    <Lock size={14} />
    Canal coach — lecture seule
  </div>
) : (
  <input ... />
)}
```

**Groupes de conversations dans la liste gauche :**
```js
const groups = [
  {
    label: 'Équipes',
    convs: myConvs.filter(c => c.type === 'team_chat' || c.type === 'coach_channel')
  },
  {
    label: 'Parents',
    convs: myConvs.filter(c => c.type === 'parent_chat')
  },
  {
    label: 'Discussions',
    convs: myConvs.filter(c => c.type === 'direct' || c.type === 'custom')
  },
].filter(g => g.convs.length > 0)
```

---

### MatchPage.jsx ❌ — specs complètes

**Onglets visibles selon le rôle :**
```js
const tabs = [
  { id: 'summary',   label: 'Résumé',         show: true },
  { id: 'lineup',    label: 'Composition',     show: true },
  { id: 'squad',     label: 'Convocations',    show: isOneOf('president','coach') },
  { id: 'result',    label: 'Saisir résultat', show: isOneOf('president','coach') && match.status === 'played' },
  { id: 'ratings',   label: 'Notation',        show: is('player') && match.squad?.[currentUser.id] === 'confirmed' },
].filter(t => t.show)
```

---

### LoginPage.jsx ❌

**Layout 2 colonnes :**
- Gauche (hidden md) : fond `bg-brand-950` avec logo, nom club, tagline
- Droite : formulaire centré sur fond blanc

**Connexion rapide dev :**
```jsx
<details className="mt-6">
  <summary className="text-xs text-gray-400 cursor-pointer">Connexion rapide (dev)</summary>
  <div className="mt-2 flex flex-col gap-1">
    {USERS.map(u => (
      <button key={u.id} onClick={() => { login(u.id); navigate('/app/events') }}
        className="text-left text-sm px-3 py-2 rounded-xl hover:bg-surface-100 flex items-center gap-2">
        <Avatar user={u} size="sm" />
        {u.firstName} {u.lastName} — <span className="text-gray-400 capitalize">{u.role}</span>
      </button>
    ))}
  </div>
</details>
```

---

### RegisterPage.jsx ❌

**Stepper 3 étapes :**
```jsx
const steps = ['Votre club', 'Vos infos', 'Votre rôle']
```

**Étape 3 — affichage conditionnel selon le rôle choisi :**
```jsx
{selectedRole === 'player' && (
  <div>
    <label>Équipe souhaitée</label>
    <select>
      {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  </div>
)}

// Panel info flux de validation
const validationInfo = {
  supporter: { icon: '⚡', title: 'Accès immédiat', desc: 'Votre compte est créé instantanément.' },
  coach:     { icon: '⏳', title: 'Validation président', desc: 'Le président recevra un email pour valider votre inscription.' },
  player:    { icon: '⏳', title: 'Validation coach', desc: "Le coach de l'équipe choisie recevra un email pour vous valider." },
}
```

---

## App.jsx ❌ — à créer

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout     from './components/layout/AppLayout'
import EventsPage    from './pages/app/EventsPage'
import TeamPage      from './pages/app/TeamPage'
import MembersPage   from './pages/app/MembersPage'
import CalendarPage  from './pages/app/CalendarPage'
import MessagesPage  from './pages/app/MessagesPage'
import MatchPage     from './pages/app/MatchPage'
import LoginPage     from './pages/auth/LoginPage'
import RegisterPage  from './pages/auth/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app"      element={<AppLayout />}>
            <Route index              element={<Navigate to="/app/events" replace />} />
            <Route path="events"      element={<EventsPage />} />
            <Route path="team"        element={<TeamPage />} />
            <Route path="members"     element={<MembersPage />} />
            <Route path="calendar"    element={<CalendarPage />} />
            <Route path="messages"    element={<MessagesPage />} />
            <Route path="matches/:id" element={<MatchPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/app/events" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

---

## Mock data — référence rapide

```js
CLUB     // { id, name:'FC Saint-Denis', sport:'Football', city, department, region, phone, email, address }
TEAMS    // [{ id:'team-1', name:'Séniors A' }, { id:'team-2', name:'U13 B' }, ...]
USERS    // [{ id, firstName, lastName, email, phone, role, teamIds, licenseStatus, stats?, position?, jerseyNumber? }]
EVENTS   // [{ id, title, description, type, visibility, teamId?, startsAt, location, createdBy, attendees }]
TRAININGS // [{ id, teamId, title, scheduledAt, durationMinutes, location, attendances:{userId:status} }]
MATCHES  // [{ id, teamId, opponentName, scheduledAt, location, isHome, referee, status, squad, scoreHome, scoreAway, events? }]
CONVERSATIONS // [{ id, type, teamId?, name, members:[userId], messages:[{id,senderId,content,sentAt,isPinned?}] }]

// Helpers
getUserById(id), getTeamById(id), getFullName(user), getInitials(user)
ROLE_LABELS, LICENSE_STATUS, EVENT_TYPES
```

---

## Composants UI — src/components/ui/index.jsx

```jsx
<Avatar user={u} size="sm|md|lg|xl" className="" />
<Badge variant="blue|green|orange|red|purple|gray|brand">texte</Badge>
<LicenseBadge status="active|expiring|expired" />
<RoleBadge role="president|coach|player|supporter|parent" />
<Card className="" onClick={fn}>…</Card>
<EmptyState icon="📅" title="" description="" action={} />
<StatCard value="" label="" sub={} color="" />
<SectionHeader title="" action={} />
```

---

## Design system

```
brand-600 #1f4fe8  (CTA)      surface-50 #f7f8fc  (fond page)
surface-100 #eef0f7 (hover)   surface-200 #dde0ed  (bordures)

Carte       : bg-white rounded-2xl border border-surface-200 shadow-sm
Bouton CTA  : bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-medium
Bouton ghost: hover:bg-surface-100 text-gray-600 rounded-xl px-3 py-2 text-sm
Input       : bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm
Titre page  : font-display text-2xl font-bold text-gray-900
Section hd  : text-xs font-semibold text-gray-400 uppercase tracking-wider
```

---

## Règles strictes

1. **Ne jamais rediriger** quand un rôle n'a pas accès — adapter le contenu affiché
2. **Ne jamais recréer** un composant déjà dans `src/components/ui/index.jsx`
3. **Tailwind uniquement** — pas de style inline
4. **date-fns + locale fr** : `format(date, "EEE d MMM · HH'h'mm", { locale: fr })`
5. **lucide-react** pour toutes les icônes
6. **Pas d'API calls** — uniquement `src/data/mock.js`
7. **useAuth()** pour toute logique conditionnelle basée sur le rôle

---

## Ordre de priorité

1. `AppLayout.jsx` — **refaire** avec sidebar rétractable + nav filtrée par rôle
2. `App.jsx` — routes (nécessaire pour tout le reste)
3. `MembersPage.jsx`
4. `CalendarPage.jsx`
5. `MessagesPage.jsx`
6. `LoginPage.jsx`
7. `RegisterPage.jsx`
8. `MatchPage.jsx`