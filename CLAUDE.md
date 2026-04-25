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
│   │   └── AppLayout.jsx          # Sidebar rétractable + topbar + <Outlet />
│   └── ui/
│       └── index.jsx              # Avatar, Badge, Card, EmptyState, StatCard...
├── context/
│   └── AuthContext.jsx            # useAuth()
├── data/
│   └── mock.js                    # Toutes les données + helpers
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx          # ❌ À CRÉER
│   │   └── RegisterPage.jsx       # ❌ À CRÉER
│   └── app/
│       ├── EventsPage.jsx         # ✅ FAIT
│       ├── TeamPage.jsx           # ✅ FAIT (à mettre à jour : top stats + classement)
│       ├── MembersPage.jsx        # ❌ À CRÉER
│       ├── CalendarPage.jsx       # ❌ À CRÉER
│       ├── MessagesPage.jsx       # ❌ À CRÉER
│       ├── MatchPage.jsx          # ❌ À CRÉER  (/app/matches/:id)
│       └── ProfilePage.jsx        # ❌ À CRÉER  (/app/profile et /app/profile/:id)
├── App.jsx                        # ❌ À CRÉER
└── main.jsx                       # ✅ existe
```

---

## Navigation par rôle — DÉFINITIVE

La sidebar filtre les items selon le rôle. Voici la nav exacte par rôle :

| Page | Président | Coach | Joueur | Supporter |
|------|:---------:|:-----:|:------:|:---------:|
| Événements `/app/events` | ✅ | ✅ | ✅ | ✅ |
| Équipes `/app/team` | ✅ | ✅ | ✅ | ✅ |
| Membres `/app/members` | ✅ | ✅ (label "Joueurs") | ❌ | ❌ |
| Calendrier `/app/calendar` | ✅ | ✅ | ✅ | ✅ |
| Messagerie `/app/messages` | ✅ | ✅ | ✅ | ❌ |

> Le parent a les mêmes droits que le supporter + messagerie.

```js
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,        label: 'Équipes',    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/members',  icon: Users,         label: (role) => role === 'coach' ? 'Joueurs' : 'Membres',
                                               roles: ['president','coach'] },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie', roles: ['president','coach','player','parent'] },
]
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

**Règle absolue :** ne jamais rediriger — adapter le contenu affiché selon le rôle.

---

## AuthContext — API

```js
const { currentUser, login, logout, is, isOneOf, canManageTeam } = useAuth()
is('president')
isOneOf('president', 'coach')
canManageTeam('team-1')   // président OU coach de cette équipe
login('u-4')              // dev seulement
```

---

## AppLayout.jsx — sidebar rétractable

### États
- **Compact (défaut)** : 64px — logo + icônes seules + avatar en bas
- **Étendu** : 220px — logo + nom club + icônes + labels + nom utilisateur

```jsx
const [expanded, setExpanded] = useState(false)

<aside className={`${expanded ? 'w-56' : 'w-16'} bg-white border-r border-surface-200
                   flex flex-col transition-all duration-200 flex-shrink-0`}>

  {/* Logo */}
  <div className={`flex items-center gap-3 p-4 border-b border-surface-100 ${!expanded && 'justify-center'}`}>
    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
      {/* SVG foot */}
    </div>
    {expanded && <span className="font-display font-bold text-sm truncate">{CLUB.name}</span>}
  </div>

  {/* Nav */}
  <nav className="flex-1 flex flex-col gap-1 p-2 overflow-hidden">
    {visibleNav.map(item => (
      <NavLink key={item.to} to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all
           ${!expanded && 'justify-center'}
           ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-surface-100 hover:text-gray-700'}`
        }>
        <item.icon size={20} strokeWidth={1.8} className="flex-shrink-0" />
        {expanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
      </NavLink>
    ))}
  </nav>

  {/* Profil + toggle */}
  <div className="p-2 border-t border-surface-100">
    {/* Clic avatar → /app/profile */}
    <Link to="/app/profile"
      className={`flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 mb-2
                  ${!expanded && 'justify-center'}`}>
      <Avatar user={currentUser} size="sm" />
      {expanded && (
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">
            {currentUser?.firstName} {currentUser?.lastName}
          </div>
          <div className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</div>
        </div>
      )}
    </Link>

    {/* Dev switcher */}
    <div className="relative group mb-2">
      <button className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl
                          hover:bg-surface-100 text-xs text-gray-400`}>
        {expanded ? 'Changer de rôle (dev)' : '⚙'}
      </button>
      <div className="absolute bottom-full left-0 mb-1 bg-white rounded-2xl shadow-xl
                      border border-surface-200 p-2 w-52 hidden group-hover:block z-50">
        {USERS.map(u => (
          <button key={u.id} onClick={() => login(u.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left
                        hover:bg-surface-50 ${currentUser?.id === u.id ? 'bg-brand-50' : ''}`}>
            <Avatar user={u} size="sm" />
            <div>
              <div className="text-sm font-medium">{u.firstName} {u.lastName}</div>
              <div className="text-xs text-gray-400 capitalize">{u.role}</div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Bouton toggle */}
    <button onClick={() => setExpanded(e => !e)}
      className="w-full flex items-center justify-center p-2 rounded-xl
                 hover:bg-surface-100 text-gray-400 hover:text-gray-600">
      {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </div>
</aside>
```

---

## EventsPage.jsx ✅ — clarification

**Les événements sont UNIQUEMENT les événements ponctuels du club** : covoiturage, réunions, repas, tournois internes, etc.  
**Les entraînements et matchs ne sont PAS des événements** — ils ont leurs propres pages (TeamPage, CalendarPage).

Filtrage visibilité :
```js
const visibleEvents = EVENTS.filter(ev => {
  if (ev.visibility === 'club') return true
  if (ev.visibility === 'team') return isOneOf('president','coach') || currentUser.teamIds?.includes(ev.teamId)
  if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
  return false
})
```

Bouton "Créer" : visible uniquement pour `president` et `coach`.

---

## TeamPage.jsx ✅ — METTRE À JOUR

### Ce qui change

**1. Affichage des matchs à venir — infos visibles AVANT d'entrer dans la fiche :**

Sur la carte "Prochain match" et dans la liste des matchs, afficher directement :
- Heure et jour (`format(scheduledAt, "EEE d MMM · HH'h'mm", { locale: fr })`)
- Terrain (`location`)
- Arbitre(s) (`referee` — peut être null → afficher "Arbitre non renseigné")
- Catégorie de l'équipe (`team.category` : U9, U13, Séniors…)

```jsx
<div className="text-xs text-gray-500 space-y-0.5">
  <div>📅 {format(match.scheduledAt, "EEE d MMM · HH'h'mm", { locale: fr })}</div>
  <div>📍 {match.location}</div>
  <div>🏷 {team.category}</div>
  <div>🟨 {match.referee ?? 'Arbitre non renseigné'}</div>
</div>
```

**2. Top stats et classement (section en bas de TeamPage) :**

Uniquement pour le football (Phase 1). Stats affichées : **Buts · Passes décisives · Matchs joués** — pas plus.

```jsx
// Top 3 buteurs de l'équipe
const topScorers = USERS
  .filter(u => u.role === 'player' && u.teamIds?.includes(activeTeamId) && u.stats?.goals > 0)
  .sort((a, b) => b.stats.goals - a.stats.goals)
  .slice(0, 3)

// Top 3 passeurs
const topAssists = USERS
  .filter(u => u.role === 'player' && u.teamIds?.includes(activeTeamId) && u.stats?.assists > 0)
  .sort((a, b) => b.stats.assists - a.stats.assists)
  .slice(0, 3)
```

**Affichage top stats :**
```jsx
<Card className="p-4">
  <SectionHeader title="Top stats — Séniors A" action={
    <button onClick={() => setShowFullRanking(!showFullRanking)}
      className="text-xs text-brand-600 hover:underline">
      {showFullRanking ? 'Réduire' : 'Classement complet'}
    </button>
  } />

  {/* Top 3 compacts */}
  {!showFullRanking && (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">⚽ Buteurs</div>
        {topScorers.map((u, i) => (
          <div key={u.id} className="flex items-center gap-2 py-1">
            <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
            <Avatar user={u} size="sm" />
            <span className="text-sm font-medium flex-1">{u.lastName}</span>
            <span className="text-sm font-bold text-gray-900">{u.stats.goals}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">🅰️ Passeurs</div>
        {topAssists.map((u, i) => (
          <div key={u.id} className="flex items-center gap-2 py-1">
            <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
            <Avatar user={u} size="sm" />
            <span className="text-sm font-medium flex-1">{u.lastName}</span>
            <span className="text-sm font-bold text-gray-900">{u.stats.assists}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">📋 Matchs</div>
        {[...USERS]
          .filter(u => u.role === 'player' && u.teamIds?.includes(activeTeamId))
          .sort((a,b) => (b.stats?.matches ?? 0) - (a.stats?.matches ?? 0))
          .slice(0,3)
          .map((u, i) => (
            <div key={u.id} className="flex items-center gap-2 py-1">
              <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
              <Avatar user={u} size="sm" />
              <span className="text-sm font-medium flex-1">{u.lastName}</span>
              <span className="text-sm font-bold text-gray-900">{u.stats?.matches ?? 0}</span>
            </div>
          ))}
      </div>
    </div>
  )}

  {/* Classement complet — tableau déroulant */}
  {showFullRanking && (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 border-b border-surface-200">
          <th className="text-left py-2">Joueur</th>
          <th className="text-center py-2">⚽ Buts</th>
          <th className="text-center py-2">🅰️ Passes</th>
          <th className="text-center py-2">📋 Matchs</th>
        </tr>
      </thead>
      <tbody>
        {USERS
          .filter(u => u.role === 'player' && u.teamIds?.includes(activeTeamId))
          .sort((a,b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
          .map(u => (
            <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50">
              <td className="py-2 flex items-center gap-2">
                <Avatar user={u} size="sm" />
                <span className="font-medium">{u.firstName} {u.lastName}</span>
              </td>
              <td className="text-center font-bold">{u.stats?.goals ?? 0}</td>
              <td className="text-center">{u.stats?.assists ?? 0}</td>
              <td className="text-center">{u.stats?.matches ?? 0}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )}
</Card>
```

---

## MembersPage.jsx ❌ — specs mises à jour

### Accès

| Rôle | Accès |
|------|-------|
| Président | Tous les membres du club, avec licences |
| Coach | Uniquement ses joueurs (filtre automatique), avec licences |
| Joueur | ❌ Pas dans sa nav |
| Supporter | ❌ Pas dans sa nav |

### Ce qu'on supprime
- ❌ Les colonnes stats (matchs, buts, présence) dans la liste membres
- ❌ La vue grille

### Ce qu'on garde / ajoute
- ✅ Liste avec colonnes : Membre (avatar + nom + poste) · Équipe · Rôle · Licence
- ✅ Tri par équipe (select équipe)
- ✅ Recherche par nom/prénom
- ✅ Filtre statut licence
- ✅ Clic sur une ligne → `ProfilePage` du membre (`/app/profile/:id`)

```jsx
// Filtrage automatique pour le coach
const visibleUsers = USERS.filter(u => {
  if (is('coach')) {
    const myPlayerIds = USERS
      .filter(p => p.role === 'player' && p.teamIds?.some(t => currentUser.teamIds.includes(t)))
      .map(p => p.id)
    if (!myPlayerIds.includes(u.id)) return false
  }
  const matchSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  const matchTeam   = !teamFilter || u.teamIds?.includes(teamFilter)
  const matchLic    = !licFilter  || u.licenseStatus === licFilter
  return matchSearch && matchTeam && matchLic
})
```

**Toolbar :**
```jsx
<input placeholder="Rechercher..." />
<select> Toutes les équipes | team-1 | team-2... </select>
<select> Toutes licences | Valide | Expirée | Bientôt </select>
{is('president') && <button>+ Ajouter membre</button>}
```

**Colonnes du tableau :**
```
Membre (avatar + Prénom Nom + poste)  |  Équipe  |  Rôle  |  Licence
```

---

## ProfilePage.jsx ❌ — À CRÉER

**Deux routes :**
- `/app/profile` → profil de l'utilisateur connecté (accessible depuis l'avatar dans la sidebar)
- `/app/profile/:id` → profil d'un autre membre (accessible depuis MembersPage)

**Accès au profil d'un autre membre :**
- Président : tout le monde
- Coach : uniquement ses joueurs
- Joueur/Supporter/Parent : uniquement son propre profil (`/app/profile` uniquement, pas `/:id`)

**Contenu de la fiche profil :**

```jsx
// Section infos personnelles
<section>
  <Avatar user={u} size="xl" />
  <h1>{u.firstName} {u.lastName}</h1>
  <RoleBadge role={u.role} />
  {u.position && <span>{u.position}</span>}
  {u.jerseyNumber && <span>N°{u.jerseyNumber}</span>}
</section>

// Données personnelles (toujours visibles par le membre lui-même, et par président/coach)
<section title="Informations personnelles">
  <Field label="Date de naissance" value={format(new Date(u.birthDate), 'd MMMM yyyy', { locale: fr })} />
  <Field label="Âge"               value={`${differenceInYears(new Date(), new Date(u.birthDate))} ans`} />
  <Field label="Lieu de naissance"  value={u.birthPlace ?? 'Non renseigné'} />
  <Field label="Email"              value={u.email} />
  <Field label="Téléphone"          value={u.phone} />
</section>

// Licence (visible uniquement par président et coach)
{isOneOf('president','coach') && (
  <section title="Licence">
    <LicenseBadge status={u.licenseStatus} />
    <Field label="Numéro"      value="FFF-93-004521" />
    <Field label="Saison"      value="2024-2025" />
    <Field label="Expiration"  value="30/06/2025" />
    {/* Bouton "Voir document" si doc uploadé */}
  </section>
)}

// Documents (visible uniquement par président et coach)
{isOneOf('president','coach') && (
  <section title="Documents">
    <DocItem label="Licence PDF"            status="uploaded" />
    <DocItem label="Certificat médical"     status="missing" />
    <DocItem label="Photo d'identité"       status="uploaded" />
  </section>
)}
```

**Ajouter dans mock.js** les champs manquants sur les users :
```js
birthPlace: 'Paris',          // lieu de naissance
documents: {
  license: true,              // licence uploadée
  medicalCert: false,         // certificat médical manquant
  photo: true,
}
```

---

## CalendarPage.jsx ❌

Le calendrier affiche **entraînements + matchs + événements ponctuels**.  
Sur chaque item match affiché dans le calendrier et dans le panel de détail, afficher :
- Heure, terrain, catégorie équipe, arbitre(s)

Filtrage par rôle :
```js
const getVisibleItems = () => {
  const items = []

  // Entraînements — pas pour supporter/parent
  if (showTrainings && !isOneOf('supporter','parent')) {
    TRAININGS
      .filter(t => is('president') || currentUser.teamIds?.includes(t.teamId))
      .forEach(t => items.push({ ...t, _type: 'training', _date: t.scheduledAt }))
  }

  // Matchs — tout le monde
  if (showMatches) {
    MATCHES
      .filter(m => is('president') || isOneOf('supporter','parent') || currentUser.teamIds?.includes(m.teamId))
      .forEach(m => items.push({ ...m, _type: 'match', _date: m.scheduledAt }))
  }

  // Événements ponctuels — selon visibilité
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

Panel de détail d'un match :
```jsx
{item._type === 'match' && (
  <div className="space-y-1 text-xs text-gray-500">
    <div>📅 {format(item._date, "HH'h'mm", { locale: fr })}</div>
    <div>📍 {item.location}</div>
    <div>🏷 {getTeamById(item.teamId)?.category}</div>
    <div>🟨 {item.referee ?? 'Arbitre non renseigné'}</div>
    <Link to={`/app/matches/${item.id}`} className="text-brand-600 text-xs font-medium mt-2 block">
      Voir la fiche →
    </Link>
  </div>
)}
```

---

## MessagesPage.jsx ❌

Accessible à : président, coach, joueur, parent. **Pas au supporter.**

Types de conversations :
- `team_chat` : tous les membres de l'équipe peuvent écrire
- `coach_channel` : coach écrit, joueurs lisent uniquement
- `parent_chat` : parent + joueur concerné + coach(s)

```js
const myConvs = CONVERSATIONS.filter(c => c.members.includes(currentUser.id))
```

Règle lecture seule coach_channel :
```jsx
const isReadOnly = conv.type === 'coach_channel' && is('player')
{isReadOnly ? (
  <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-400 flex items-center gap-2">
    <Lock size={14} /> Canal coach — lecture seule
  </div>
) : (
  <input placeholder="Écrire un message..." ... />
)}
```

---

## MatchPage.jsx ❌

Infos visibles AVANT d'entrer dans les onglets (hero toujours affiché) :
```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
  <div>📅 {format(match.scheduledAt, "EEE d MMM · HH'h'mm", { locale: fr })}</div>
  <div>📍 {match.location}</div>
  <div>🏷 {getTeamById(match.teamId)?.category}</div>
  <div>🟨 {match.referee ?? 'Non renseigné'}</div>
</div>
```

Onglets selon rôle :
```js
const tabs = [
  { id: 'summary',  label: 'Résumé',          show: true },
  { id: 'lineup',   label: 'Composition',      show: true },
  { id: 'squad',    label: 'Convocations',     show: isOneOf('president','coach') },
  { id: 'result',   label: 'Saisir résultat',  show: isOneOf('president','coach') && match.status === 'played' },
  { id: 'ratings',  label: 'Notation',         show: is('player') && match.squad?.[currentUser.id] === 'confirmed' },
].filter(t => t.show)
```

---

## LoginPage.jsx ❌

Layout 2 colonnes : gauche `bg-brand-950` avec logo + tagline, droite formulaire blanc.

Connexion rapide dev :
```jsx
<details className="mt-6 border border-surface-200 rounded-xl p-3">
  <summary className="text-xs text-gray-400 cursor-pointer select-none">Connexion rapide (dev)</summary>
  <div className="mt-3 flex flex-col gap-1">
    {USERS.map(u => (
      <button key={u.id}
        onClick={() => { login(u.id); navigate('/app/events') }}
        className="text-left px-3 py-2 rounded-xl hover:bg-surface-100 flex items-center gap-2 text-sm">
        <Avatar user={u} size="sm" />
        <span>{u.firstName} {u.lastName}</span>
        <RoleBadge role={u.role} />
      </button>
    ))}
  </div>
</details>
```

---

## RegisterPage.jsx ❌

3 étapes : `['Votre club', 'Vos infos', 'Votre rôle']`

Étape 3 — sélecteur de rôle avec affichage conditionnel :
```jsx
// Si joueur → select équipe
{selectedRole === 'player' && (
  <select>
    {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
  </select>
)}

// Panel info validation
const validationInfo = {
  supporter: { icon: '⚡', title: 'Accès immédiat',        desc: 'Compte créé instantanément.' },
  coach:     { icon: '⏳', title: 'Validation président',  desc: 'Le président reçoit un email.' },
  player:    { icon: '⏳', title: 'Validation coach',      desc: 'Le coach de ton équipe reçoit un email.' },
}
```

---

## App.jsx ❌

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout    from './components/layout/AppLayout'
import EventsPage   from './pages/app/EventsPage'
import TeamPage     from './pages/app/TeamPage'
import MembersPage  from './pages/app/MembersPage'
import CalendarPage from './pages/app/CalendarPage'
import MessagesPage from './pages/app/MessagesPage'
import MatchPage    from './pages/app/MatchPage'
import ProfilePage  from './pages/app/ProfilePage'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index              element={<Navigate to="/app/events" replace />} />
            <Route path="events"      element={<EventsPage />} />
            <Route path="team"        element={<TeamPage />} />
            <Route path="members"     element={<MembersPage />} />
            <Route path="calendar"    element={<CalendarPage />} />
            <Route path="messages"    element={<MessagesPage />} />
            <Route path="matches/:id" element={<MatchPage />} />
            <Route path="profile"     element={<ProfilePage />} />
            <Route path="profile/:id" element={<ProfilePage />} />
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
CLUB      // { id, name, sport, city, department, region, phone, email, address }
TEAMS     // [{ id, name, category, season, gender }]
USERS     // [{ id, firstName, lastName, email, phone, role, teamIds,
           //    licenseStatus, stats?, position?, jerseyNumber?,
           //    birthPlace?,     ← À AJOUTER
           //    documents?       ← À AJOUTER { license, medicalCert, photo } }]
EVENTS    // événements ponctuels UNIQUEMENT (pas entraînements, pas matchs)
TRAININGS // [{ id, teamId, title, scheduledAt, durationMinutes, location, attendances }]
MATCHES   // [{ id, teamId, opponentName, scheduledAt, location, isHome,
           //    referee, status, squad, scoreHome, scoreAway, events? }]
CONVERSATIONS // [{ id, type, teamId?, name, members, messages }]

getUserById(id), getTeamById(id), getFullName(user), getInitials(user)
ROLE_LABELS, LICENSE_STATUS, EVENT_TYPES
```

**Ajouter dans mock.js sur chaque user player :**
```js
birthPlace: 'Paris (75)',
documents: { license: true, medicalCert: false, photo: true }
```

---

## Composants UI — src/components/ui/index.jsx

```jsx
<Avatar user={u} size="sm|md|lg|xl" />
<Badge variant="blue|green|orange|red|purple|gray|brand" />
<LicenseBadge status="active|expiring|expired" />
<RoleBadge role="president|coach|player|supporter|parent" />
<Card className="" onClick={fn} />
<EmptyState icon="" title="" description="" action={} />
<StatCard value="" label="" sub={} color="" />
<SectionHeader title="" action={} />
```

---

## Design system

```
brand-600 #1f4fe8   surface-50 #f7f8fc   surface-200 #dde0ed

Carte       : bg-white rounded-2xl border border-surface-200 shadow-sm
Bouton CTA  : bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-medium
Bouton ghost: hover:bg-surface-100 text-gray-600 rounded-xl px-3 py-2 text-sm
Input       : bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm
Titre page  : font-display text-2xl font-bold text-gray-900
Section hd  : text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3
```

---

## Règles strictes

1. **Ne jamais rediriger** — adapter le contenu selon le rôle
2. **Ne jamais recréer** un composant de `src/components/ui/index.jsx`
3. **Tailwind uniquement** — pas de style inline
4. **date-fns + locale fr** pour toutes les dates
5. **lucide-react** pour toutes les icônes
6. **Pas d'API calls** — uniquement `src/data/mock.js`
7. **differenceInYears** de date-fns pour calculer l'âge

---

## Ordre de priorité

1. **`AppLayout.jsx`** — refaire entièrement (sidebar rétractable + nav par rôle + lien profil)
2. **`App.jsx`** — routes complètes
3. **`MembersPage.jsx`** — liste sans stats, avec licences
4. **`ProfilePage.jsx`** — profil perso + profil d'un autre
5. **`CalendarPage.jsx`** — calendrier avec infos match complètes
6. **`MessagesPage.jsx`** — messagerie
7. **`TeamPage.jsx`** — ajouter top stats + classement + infos match avant fiche
8. **`LoginPage.jsx`**
9. **`RegisterPage.jsx`**
10. **`MatchPage.jsx`**