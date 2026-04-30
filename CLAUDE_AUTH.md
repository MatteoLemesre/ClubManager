# ClubManager — Prompt Auth & Inscription

Ce prompt couvre uniquement le système d'authentification et d'inscription.
À utiliser APRÈS avoir lu CLAUDE.md pour le contexte général du projet.

---

## Objectif

Remplacer le système mock (sélecteur de rôle dev) par un vrai système d'auth :
- Création de compte club + président
- Inscription des membres (coach, joueur, supporter) avec workflow de validation
- Connexion / déconnexion
- Sessions persistantes (localStorage)
- Tout reste frontend only — pas de vrai backend — on simule avec localStorage + état React

---

## Stack auth choisie

**Pas de Supabase pour l'instant.** On simule tout en frontend :
- `localStorage` pour persister les données (clubs, users, demandes)
- Mots de passe hashés avec `bcryptjs` (côté client uniquement — acceptable pour le mock)
- Sessions via `localStorage` (userId courant)
- Notifications "email" simulées : juste une liste de notifications en base mock

```bash
npm install bcryptjs
```

---

## Architecture des données persistées

Tout est stocké dans `localStorage` sous ces clés :

```js
localStorage.getItem('cm_clubs')           // array de clubs
localStorage.getItem('cm_persons')         // array de persons
localStorage.getItem('cm_users')           // array de users avec password_hash
localStorage.getItem('cm_teams')           // array d'équipes
localStorage.getItem('cm_requests')        // array de demandes d'inscription en attente
localStorage.getItem('cm_notifications')   // array de notifications
localStorage.getItem('cm_session')         // userId connecté
```

---

## Schéma des objets

### Club
```js
{
  id: uuid(),
  name: 'FC Saint-Denis',
  sport: 'Football',           // sport principal
  address: '12 rue du Stade',
  postalCode: '93200',
  city: 'Saint-Denis',
  country: 'France',
  email: 'contact@fcsaintdenis.fr',
  createdAt: ISO string,
}
```

### Person
```js
{
  id: uuid(),
  clubId: string,              // référence club
  firstName: 'Jean-Pierre',
  lastName: 'Dupont',
  birthDate: '1975-04-12',     // ISO string
  phone: '06 12 34 56 78',
  birthPlace: '',
  documents: { license: { uploaded: false, url: null }, medicalCert: { uploaded: false, url: null } },
  createdAt: ISO string,
}
```

### User
```js
{
  id: uuid(),
  personId: string,            // référence person
  clubId: string,              // référence club (dénormalisé pour faciliter les requêtes)
  email: 'jp@fcsaintdenis.fr',
  passwordHash: string,        // bcrypt hash
  role: 'president' | 'coach' | 'player' | 'supporter',
  teamIds: [],                 // équipes associées
  accountStatus: 'pending' | 'active' | 'disabled',
  jerseyNumber: null,
  position: null,
  createdAt: ISO string,
}
```

### Team
```js
{
  id: uuid(),
  clubId: string,
  name: 'Séniors A',           // nom libre saisi par le président
  sport: 'Football',
  season: '2024-2025',
  createdAt: ISO string,
}
```

### RegistrationRequest
```js
{
  id: uuid(),
  clubId: string,
  firstName: string,
  lastName: string,
  birthDate: string,
  email: string,
  phone: string,
  role: 'coach' | 'player' | 'supporter',
  teamId: string | null,       // si joueur ou coach : équipe choisie
  status: 'pending' | 'approved' | 'rejected',
  reviewedBy: string | null,   // userId qui a validé/refusé
  reviewedAt: string | null,
  token: string,               // token unique pour activation (uuid)
  createdAt: ISO string,
}
```

### Notification
```js
{
  id: uuid(),
  toUserId: string,            // destinataire
  type: 'registration_request' | 'request_approved' | 'request_rejected',
  title: string,
  body: string,
  requestId: string | null,    // lien vers la demande
  read: false,
  createdAt: ISO string,
}
```

---

## Helper uuid() à créer

```js
// src/utils/uuid.js
export const uuid = () => crypto.randomUUID()
```

---

## DataService — src/services/dataService.js

Créer un service qui encapsule toutes les opérations localStorage :

```js
import { uuid } from '../utils/uuid'
import bcrypt from 'bcryptjs'

const KEYS = {
  clubs:         'cm_clubs',
  persons:       'cm_persons',
  users:         'cm_users',
  teams:         'cm_teams',
  requests:      'cm_requests',
  notifications: 'cm_notifications',
  session:       'cm_session',
}

const get = (key) => JSON.parse(localStorage.getItem(key) ?? '[]')
const getOne = (key) => JSON.parse(localStorage.getItem(key) ?? 'null')
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export const db = {
  // CLUBS
  getClubs:    ()     => get(KEYS.clubs),
  getClub:     (id)   => get(KEYS.clubs).find(c => c.id === id),
  addClub:     (club) => { const arr = get(KEYS.clubs); arr.push(club); set(KEYS.clubs, arr); return club },

  // PERSONS
  getPersons:  ()       => get(KEYS.persons),
  getPerson:   (id)     => get(KEYS.persons).find(p => p.id === id),
  addPerson:   (person) => { const arr = get(KEYS.persons); arr.push(person); set(KEYS.persons, arr); return person },

  // USERS
  getUsers:        ()      => get(KEYS.users),
  getUserById:     (id)    => get(KEYS.users).find(u => u.id === id),
  getUserByEmail:  (email) => get(KEYS.users).find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUsersByClub:  (clubId)=> get(KEYS.users).filter(u => u.clubId === clubId),
  addUser:         (user)  => { const arr = get(KEYS.users); arr.push(user); set(KEYS.users, arr); return user },
  updateUser:      (id, changes) => {
    const arr = get(KEYS.users).map(u => u.id === id ? { ...u, ...changes } : u)
    set(KEYS.users, arr)
  },

  // TEAMS
  getTeams:        ()        => get(KEYS.teams),
  getTeamsByClub:  (clubId)  => get(KEYS.teams).filter(t => t.clubId === clubId),
  addTeam:         (team)    => { const arr = get(KEYS.teams); arr.push(team); set(KEYS.teams, arr); return team },

  // REQUESTS
  getRequests:       ()        => get(KEYS.requests),
  getRequestsByClub: (clubId)  => get(KEYS.requests).filter(r => r.clubId === clubId),
  getPendingForCoach:(coachId) => {
    // Demandes joueurs pour les équipes de ce coach
    const coach = db.getUserById(coachId)
    return get(KEYS.requests).filter(r =>
      r.status === 'pending' &&
      r.role === 'player' &&
      coach?.teamIds?.includes(r.teamId)
    )
  },
  getPendingForPresident: (clubId) => get(KEYS.requests).filter(r =>
    r.status === 'pending' && r.role === 'coach' && r.clubId === clubId
  ),
  addRequest:   (req) => { const arr = get(KEYS.requests); arr.push(req); set(KEYS.requests, arr); return req },
  updateRequest:(id, changes) => {
    const arr = get(KEYS.requests).map(r => r.id === id ? { ...r, ...changes } : r)
    set(KEYS.requests, arr)
  },

  // NOTIFICATIONS
  getNotifications:     (userId) => get(KEYS.notifications).filter(n => n.toUserId === userId),
  getUnreadCount:       (userId) => get(KEYS.notifications).filter(n => n.toUserId === userId && !n.read).length,
  addNotification:      (notif)  => { const arr = get(KEYS.notifications); arr.push(notif); set(KEYS.notifications, arr) },
  markNotifRead:        (id)     => {
    const arr = get(KEYS.notifications).map(n => n.id === id ? { ...n, read: true } : n)
    set(KEYS.notifications, arr)
  },
  markAllNotifsRead:    (userId) => {
    const arr = get(KEYS.notifications).map(n => n.toUserId === userId ? { ...n, read: true } : n)
    set(KEYS.notifications, arr)
  },

  // SESSION
  getSession:   ()       => getOne(KEYS.session),
  setSession:   (userId) => set(KEYS.session, userId),
  clearSession: ()       => localStorage.removeItem(KEYS.session),

  // AUTH HELPERS
  hashPassword:   (pwd)        => bcrypt.hashSync(pwd, 10),
  checkPassword:  (pwd, hash)  => bcrypt.compareSync(pwd, hash),
}
```

---

## AuthContext — REFAIRE src/context/AuthContext.jsx

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../services/dataService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaurer la session au démarrage
  useEffect(() => {
    const userId = db.getSession()
    if (userId) {
      const user = db.getUserById(userId)
      if (user && user.accountStatus === 'active') {
        setCurrentUser(user)
      } else {
        db.clearSession()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const user = db.getUserByEmail(email)
    if (!user) throw new Error('Email introuvable')
    if (!db.checkPassword(password, user.passwordHash)) throw new Error('Mot de passe incorrect')
    if (user.accountStatus === 'pending') throw new Error('Votre compte est en attente de validation')
    if (user.accountStatus === 'disabled') throw new Error('Votre compte a été désactivé')
    db.setSession(user.id)
    setCurrentUser(user)
    return user
  }

  const logout = () => {
    db.clearSession()
    setCurrentUser(null)
  }

  // Rafraîchir l'user courant (après modification)
  const refreshUser = () => {
    if (currentUser) {
      const updated = db.getUserById(currentUser.id)
      setCurrentUser(updated)
    }
  }

  const is = (role) => currentUser?.role === role
  const isOneOf = (...roles) => roles.includes(currentUser?.role)
  const canManageTeam = (teamId) =>
    is('president') || (is('coach') && currentUser?.teamIds?.includes(teamId))

  // Dev switcher — connexion directe par userId (sans mot de passe)
  const devLogin = (userId) => {
    const user = db.getUserById(userId)
    if (user) {
      db.setSession(user.id)
      setCurrentUser(user)
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      login, logout, refreshUser, devLogin,
      is, isOneOf, canManageTeam,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

---

## App.jsx — ajouter ProtectedRoute

```jsx
// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

// Dans les routes :
<Route path="/app" element={
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
}>
  ...
</Route>
```

---

## Pages à créer

### 1. Page d'accueil publique — /

Si connecté → redirect `/app/events`
Si non connecté → afficher deux boutons :
- "Se connecter" → `/login`
- "Inscrire mon club" → `/register/club`

```jsx
// src/pages/public/HomePage.jsx
export default function HomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  useEffect(() => { if (currentUser) navigate('/app/events') }, [currentUser])
  return (
    <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-6">
      <div className="text-white text-center">
        <div className="text-4xl font-display font-bold mb-2">ClubManager</div>
        <div className="text-brand-300">Gérez votre club sportif simplement</div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => navigate('/login')}
          className="px-6 py-3 bg-white text-brand-950 font-semibold rounded-xl hover:bg-brand-50">
          Se connecter
        </button>
        <button onClick={() => navigate('/register/club')}
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 border border-brand-500">
          Inscrire mon club
        </button>
      </div>
    </div>
  )
}
```

---

### 2. Inscription club + président — /register/club

**src/pages/auth/RegisterClubPage.jsx**

Formulaire en 2 sections sur une seule page (pas de stepper) :

#### Section 1 — Le club
```
Nom de l'association *
Sport *              → select : Football | Handball | Volleyball | Rugby | Tennis | Autre
Adresse *
Code postal *        → auto-remplit Ville et Pays si code postal FR
Ville *
Pays *               → défaut : France
Email du club *
```

#### Section 2 — Le président (compte admin)
```
Prénom *
Nom *
Date de naissance *
Email *              (sera l'identifiant de connexion)
Numéro de téléphone
Mot de passe *       (min 8 caractères)
Confirmer mdp *
```

#### Bouton "Créer le club"

**À la soumission :**
```js
const handleSubmit = async () => {
  // Validation
  if (password !== confirmPassword) throw 'Les mots de passe ne correspondent pas'
  if (password.length < 8) throw 'Mot de passe trop court (8 caractères min)'
  if (db.getUserByEmail(email)) throw 'Cet email est déjà utilisé'

  // Créer le club
  const club = db.addClub({
    id: uuid(), name: clubName, sport, address, postalCode, city, country,
    email: clubEmail, createdAt: new Date().toISOString(),
  })

  // Créer la person du président
  const person = db.addPerson({
    id: uuid(), clubId: club.id, firstName, lastName,
    birthDate, phone, birthPlace: '', documents: {}, createdAt: new Date().toISOString(),
  })

  // Créer le user président
  const user = db.addUser({
    id: uuid(), personId: person.id, clubId: club.id,
    email, passwordHash: db.hashPassword(password),
    role: 'president', teamIds: [], accountStatus: 'active',
    jerseyNumber: null, position: null, createdAt: new Date().toISOString(),
  })

  // Connecter automatiquement
  db.setSession(user.id)

  // Rediriger vers le dashboard
  navigate('/app/events')
}
```

---

### 3. Page de connexion — /login

**src/pages/auth/LoginPage.jsx** — REFAIRE

Layout 2 colonnes : gauche `bg-brand-950`, droite formulaire.

```jsx
const handleLogin = async () => {
  try {
    await login(email, password)
    navigate('/app/events')
  } catch (err) {
    setError(err.message)
  }
}
```

Liens en bas :
- "Pas encore membre ? → Rejoindre un club"  → `/register/member`
- "Vous êtes un club ? → Inscrire votre club" → `/register/club`

**Supprimer le dev switcher de LoginPage** — le mettre uniquement dans AppLayout (sidebar).

---

### 4. Inscription membre — /register/member

**src/pages/auth/RegisterMemberPage.jsx**

Formulaire en 3 étapes :

#### Étape 1 — Choisir son club
```jsx
// Recherche parmi tous les clubs en base
const [search, setSearch] = useState('')
const clubs = db.getClubs().filter(c =>
  c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.city.toLowerCase().includes(search.toLowerCase())
)

// Afficher les clubs sous forme de cartes cliquables
// Card : nom du club · sport · ville
// Clic → selectedClub = club, passer à l'étape 2
```

#### Étape 2 — Informations personnelles
```
Prénom *
Nom *
Date de naissance *
Email *
Numéro de téléphone
Mot de passe *
Confirmer mot de passe *
```

#### Étape 3 — Fonction dans le club
```jsx
// Sélecteur de rôle visuel (3 boutons)
// Joueur | Coach | Supporter

// Si Joueur ou Coach → select équipe
// Les équipes sont celles du club sélectionné à l'étape 1
const teams = db.getTeamsByClub(selectedClub.id)
<select>
  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
</select>

// Panel info validation selon le rôle :
// Supporter  → "Accès immédiat ⚡"
// Coach      → "En attente de validation par le président ⏳"
// Joueur     → "En attente de validation par le coach ⏳"
```

#### À la soumission :

```js
const handleSubmit = async () => {
  if (db.getUserByEmail(email)) throw 'Cet email est déjà utilisé'

  if (role === 'supporter') {
    // Supporter : compte actif immédiatement
    const person = db.addPerson({ id: uuid(), clubId: selectedClub.id, firstName, lastName,
      birthDate, phone, birthPlace: '', documents: {}, createdAt: new Date().toISOString() })
    const user = db.addUser({ id: uuid(), personId: person.id, clubId: selectedClub.id,
      email, passwordHash: db.hashPassword(password),
      role: 'supporter', teamIds: [], accountStatus: 'active',
      createdAt: new Date().toISOString() })
    db.setSession(user.id)
    navigate('/app/events')

  } else {
    // Coach ou Joueur : demande en attente
    const request = db.addRequest({
      id: uuid(), clubId: selectedClub.id,
      firstName, lastName, birthDate, email, phone,
      role, teamId: selectedTeamId,
      status: 'pending', reviewedBy: null, reviewedAt: null,
      token: uuid(), createdAt: new Date().toISOString(),
      passwordHash: db.hashPassword(password), // stocker le hash pour activer plus tard
    })

    // Notifier la bonne personne
    if (role === 'coach') {
      // Notifier le président du club
      const president = db.getUsersByClub(selectedClub.id).find(u => u.role === 'president')
      if (president) {
        db.addNotification({
          id: uuid(), toUserId: president.id,
          type: 'registration_request',
          title: 'Nouvelle demande de coach',
          body: `${firstName} ${lastName} souhaite rejoindre comme coach.`,
          requestId: request.id, read: false, createdAt: new Date().toISOString(),
        })
      }
    }

    if (role === 'player') {
      // Notifier le(s) coach(s) de l'équipe choisie
      const coaches = db.getUsersByClub(selectedClub.id)
        .filter(u => u.role === 'coach' && u.teamIds?.includes(selectedTeamId))
      coaches.forEach(coach => {
        db.addNotification({
          id: uuid(), toUserId: coach.id,
          type: 'registration_request',
          title: 'Nouvelle demande de joueur',
          body: `${firstName} ${lastName} souhaite rejoindre votre équipe.`,
          requestId: request.id, read: false, createdAt: new Date().toISOString(),
        })
      })
    }

    // Rediriger vers page de confirmation
    navigate('/register/pending')
  }
}
```

---

### 5. Page confirmation en attente — /register/pending

**src/pages/auth/PendingPage.jsx**

```jsx
export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <Card className="p-8 max-w-md text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="font-display text-xl font-bold mb-2">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6">
          Votre demande a été transmise. Vous recevrez une confirmation
          dès qu'elle sera validée.
        </p>
        <Link to="/login" className="text-brand-600 text-sm hover:underline">
          Retour à la connexion
        </Link>
      </Card>
    </div>
  )
}
```

---

## Interface de validation des demandes — dans AppLayout / Dashboard

### Icône cloche dans la topbar

```jsx
// Dans AppLayout topbar
const unreadCount = db.getUnreadCount(currentUser.id)

<button onClick={() => setNotifOpen(true)} className="relative p-2 rounded-xl hover:bg-surface-100">
  <Bell size={18} />
  {unreadCount > 0 && (
    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px]
                     rounded-full flex items-center justify-center font-bold">
      {unreadCount}
    </span>
  )}
</button>
```

### Panel notifications (dropdown ou drawer)

```jsx
const notifs = db.getNotifications(currentUser.id)

{notifs.map(n => (
  <div key={n.id} className={`p-3 rounded-xl ${n.read ? 'opacity-60' : 'bg-brand-50'}`}>
    <div className="font-semibold text-sm">{n.title}</div>
    <div className="text-xs text-gray-500">{n.body}</div>
    {n.requestId && n.type === 'registration_request' && (
      <div className="flex gap-2 mt-2">
        <button onClick={() => handleApprove(n.requestId, n.id)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-100 text-emerald-700">
          ✓ Valider
        </button>
        <button onClick={() => handleReject(n.requestId, n.id)}
          className="flex-1 text-xs py-1.5 rounded-lg bg-red-100 text-red-600">
          ✗ Refuser
        </button>
      </div>
    )}
  </div>
))}
```

### Logique de validation

```js
const handleApprove = (requestId, notifId) => {
  const request = db.getRequests().find(r => r.id === requestId)
  if (!request) return

  // Créer la person
  const person = db.addPerson({
    id: uuid(), clubId: request.clubId,
    firstName: request.firstName, lastName: request.lastName,
    birthDate: request.birthDate, phone: request.phone,
    birthPlace: '', documents: {}, createdAt: new Date().toISOString(),
  })

  // Créer le user actif
  const user = db.addUser({
    id: uuid(), personId: person.id, clubId: request.clubId,
    email: request.email, passwordHash: request.passwordHash,
    role: request.role,
    teamIds: request.teamId ? [request.teamId] : [],
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
  })

  // Mettre à jour la demande
  db.updateRequest(requestId, {
    status: 'approved', reviewedBy: currentUser.id,
    reviewedAt: new Date().toISOString(),
  })

  // Notifier le demandeur (simulation)
  db.addNotification({
    id: uuid(), toUserId: user.id,
    type: 'request_approved',
    title: 'Demande approuvée !',
    body: 'Votre inscription a été validée. Vous pouvez maintenant vous connecter.',
    requestId, read: false, createdAt: new Date().toISOString(),
  })

  // Marquer la notif comme lue
  db.markNotifRead(notifId)
}

const handleReject = (requestId, notifId) => {
  db.updateRequest(requestId, {
    status: 'rejected', reviewedBy: currentUser.id,
    reviewedAt: new Date().toISOString(),
  })
  db.markNotifRead(notifId)
}
```

---

## Gestion des équipes par le président

### Dans TeamPage ou une page dédiée /app/teams/manage

Le président peut créer des équipes depuis son interface :

```jsx
// Bouton "+ Nouvelle équipe" → formulaire simple
const handleCreateTeam = () => {
  if (!teamName.trim()) return
  db.addTeam({
    id: uuid(), clubId: currentUser.clubId,
    name: teamName, sport: club.sport,
    season: currentSeason, createdAt: new Date().toISOString(),
  })
  // Rafraîchir la liste des équipes
}

// Formulaire minimal
<input placeholder="Nom de l'équipe (ex: Séniors A, U13...)" value={teamName}
  onChange={e => setTeamName(e.target.value)} />
<button onClick={handleCreateTeam}>Créer l'équipe</button>
```

---

## Migration des mock data

Les pages existantes utilisent USERS, TEAMS, etc. depuis `src/data/mock.js`.
Après ce refactor, elles doivent utiliser `db.getUsersByClub()`, `db.getTeamsByClub()`, etc.

**Stratégie de migration :**

1. Dans `src/data/mock.js`, garder les données mock UNIQUEMENT pour le mode dev
2. Créer un hook `useClubData()` qui retourne les données selon le mode :

```js
// src/hooks/useClubData.js
import { useAuth } from '../context/AuthContext'
import { db } from '../services/dataService'
import { USERS, TEAMS, MATCHES, TRAININGS, EVENTS, CONVERSATIONS } from '../data/mock'

export function useClubData() {
  const { currentUser } = useAuth()

  // Si on a des données en localStorage → utiliser celles-là
  const lsUsers = db.getUsersByClub(currentUser?.clubId ?? '')
  const lsTeams = db.getTeamsByClub(currentUser?.clubId ?? '')

  // Fallback sur mock si localStorage vide (mode dev initial)
  const users = lsUsers.length > 0 ? lsUsers : USERS
  const teams = lsTeams.length > 0 ? lsTeams : TEAMS

  return {
    users, teams,
    matches: MATCHES,       // pas encore en localStorage
    trainings: TRAININGS,
    events: EVENTS,
    conversations: CONVERSATIONS,
  }
}
```

---

## Routes à ajouter dans App.jsx

```jsx
import HomePage          from './pages/public/HomePage'
import RegisterClubPage  from './pages/auth/RegisterClubPage'
import RegisterMemberPage from './pages/auth/RegisterMemberPage'
import PendingPage       from './pages/auth/PendingPage'

<Route path="/"                 element={<HomePage />} />
<Route path="/login"            element={<LoginPage />} />
<Route path="/register/club"    element={<RegisterClubPage />} />
<Route path="/register/member"  element={<RegisterMemberPage />} />
<Route path="/register/pending" element={<PendingPage />} />
<Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  ...
</Route>
```

---

## Dev switcher dans AppLayout — adapter

Le dev switcher doit maintenant utiliser `devLogin(userId)` au lieu de `login(userId)`.
Il doit aussi lister les users depuis `db.getUsers()` SI il y en a en localStorage,
sinon fallback sur les USERS mock.

```jsx
const devUsers = db.getUsers().length > 0 ? db.getUsers() : USERS
// Afficher devUsers dans le dropdown
// Au clic : devLogin(u.id)
```

---

## Ordre de priorité

1. **Installer bcryptjs** : `npm install bcryptjs`
2. **Créer src/utils/uuid.js**
3. **Créer src/services/dataService.js** (le service localStorage complet)
4. **Refaire src/context/AuthContext.jsx** avec le vrai système auth
5. **Créer src/pages/public/HomePage.jsx**
6. **Créer src/pages/auth/RegisterClubPage.jsx**
7. **Créer src/pages/auth/LoginPage.jsx** (refaire)
8. **Créer src/pages/auth/RegisterMemberPage.jsx**
9. **Créer src/pages/auth/PendingPage.jsx**
10. **Mettre à jour App.jsx** avec les nouvelles routes + ProtectedRoute
11. **Mettre à jour AppLayout.jsx** : cloche notifs + panel + devLogin adapté
12. **Créer src/hooks/useClubData.js** pour la migration mock → localStorage

---

## Règles strictes

1. **Pas de vrai backend** — tout passe par localStorage via dataService.js
2. **bcryptjs côté client** — hashSync(pwd, 10) pour le hash, compareSync pour la vérif
3. **Ne jamais stocker le mot de passe en clair** — toujours passwordHash
4. **accountStatus 'pending'** pour coach/joueur en attente, 'active' pour supporter et président
5. **Tailwind uniquement** — pas de style inline
6. **Toutes les dates** en ISO string dans localStorage (new Date().toISOString())
7. **Le token** dans RegistrationRequest est un uuid() — sert d'identifiant unique de la demande
