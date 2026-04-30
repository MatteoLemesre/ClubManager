# ClubManager — Prompt Supabase & Auth réelle

Ce prompt remplace CLAUDE_AUTH.md (système localStorage mock).
On branche maintenant le vrai backend Supabase.
Lire CLAUDE.md pour le contexte général avant de commencer.

---

## Contexte

Le schéma SQL est déjà exécuté dans Supabase (fichier schema_complet.sql).
Les tables existent : sports, clubs, persons, users, user_roles, teams,
registration_requests, notifications, matches, trainings, events, etc.

On va maintenant :
1. Installer et configurer le client Supabase
2. Créer un service de données qui remplace localStorage
3. Refaire l'auth avec Supabase Auth
4. Créer toutes les pages d'inscription et connexion
5. Brancher les pages existantes sur les vraies données

---

## Variables d'environnement

Créer le fichier `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
```

Ces valeurs se trouvent dans Supabase → Settings → API.

---

## Installation

```bash
npm install @supabase/supabase-js
```

---

## Client Supabase — src/lib/supabase.js

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## Architecture auth choisie

On N'utilise PAS Supabase Auth (système email/password natif de Supabase).
Raison : notre table `users` est séparée de `auth.users` et contient
le `password_hash` bcrypt — c'est notre propre système d'auth.

À la place :
- Hash bcrypt côté client avec `bcryptjs`
- Session stockée dans `localStorage` (juste le `user_id`)
- Le client Supabase utilise la `anon key` pour toutes les requêtes
- La sécurité est gérée par les Row Level Security (RLS) policies

```bash
npm install bcryptjs
```

---

## Row Level Security (RLS)

Exécuter ces policies dans Supabase SQL Editor APRÈS avoir créé le schéma :

```sql
-- Activer RLS sur toutes les tables sensibles
ALTER TABLE clubs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents             ENABLE ROW LEVEL SECURITY;

-- Pour l'instant : politique permissive (tout le monde peut tout lire/écrire)
-- À durcir plus tard avec des policies basées sur club_id

CREATE POLICY "allow_all" ON clubs                 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON persons               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON users                 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON user_roles            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON teams                 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON team_players          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON team_coaches          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON matches               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON match_squad           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON match_events          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON match_carpool         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON match_carpool_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON match_ratings         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON trainings             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON training_attendances  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON events                FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON event_responses       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON notifications         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON registration_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON conversations         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON conversation_members  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON messages              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON licenses              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON documents             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON registration_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON parent_links          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON supporter_favorites   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON sport_positions       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON sports                FOR ALL USING (true) WITH CHECK (true);
```

---

## Service de données — src/services/db.js

Ce fichier remplace dataService.js (localStorage).
Toutes les opérations passent par Supabase.

```js
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

// ── SPORTS ────────────────────────────────────────────────
export const getSports = async () => {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

// ── CLUBS ─────────────────────────────────────────────────
export const getClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .order('name')
  if (error) throw error
  return data
}

export const getClubById = async (id) => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*, sports(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createClub = async (club) => {
  const { data, error } = await supabase
    .from('clubs')
    .insert(club)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── PERSONS ───────────────────────────────────────────────
export const createPerson = async (person) => {
  const { data, error } = await supabase
    .from('persons')
    .insert(person)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getPersonsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('club_id', clubId)
  if (error) throw error
  return data
}

// ── USERS ─────────────────────────────────────────────────
export const createUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons(*)')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (error && error.code !== 'PGRST116') throw error  // PGRST116 = not found
  return data ?? null
}

export const getUsersByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, persons(*), user_roles(*)')
    .eq('persons.club_id', clubId)
  if (error) throw error
  return data
}

export const updateUser = async (id, changes) => {
  const { data, error } = await supabase
    .from('users')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── USER_ROLES ────────────────────────────────────────────
export const createUserRole = async (role) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert(role)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserRoles = async (userId) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

// ── TEAMS ─────────────────────────────────────────────────
export const getTeamsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('club_id', clubId)
    .order('name')
  if (error) throw error
  return data
}

export const createTeam = async (team) => {
  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single()
  if (error) throw error
  return data
}

export const addPlayerToTeam = async (teamId, userId, jerseyNumber, position) => {
  const { error } = await supabase
    .from('team_players')
    .insert({ team_id: teamId, user_id: userId, jersey_number: jerseyNumber, position })
  if (error) throw error
}

export const addCoachToTeam = async (teamId, userId) => {
  const { error } = await supabase
    .from('team_coaches')
    .insert({ team_id: teamId, user_id: userId })
  if (error) throw error
}

// ── REGISTRATION REQUESTS ─────────────────────────────────
export const createRequest = async (request) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getRequestsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getPendingRequestsForPresident = async (clubId) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', 'pending')
    .eq('role_type', 'coach')
  if (error) throw error
  return data
}

export const getPendingRequestsForCoach = async (teamIds) => {
  if (!teamIds?.length) return []
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .in('team_id', teamIds)
    .eq('status', 'pending')
    .eq('role_type', 'player')
  if (error) throw error
  return data
}

export const updateRequest = async (id, changes) => {
  const { data, error } = await supabase
    .from('registration_requests')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export const createNotification = async (notif) => {
  const { error } = await supabase
    .from('notifications')
    .insert(notif)
  if (error) throw error
}

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('read', false)
  if (error) throw error
  return count ?? 0
}

export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('to_user_id', userId)
  if (error) throw error
}

// ── MATCHES ───────────────────────────────────────────────
export const getMatchesByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*, teams!inner(club_id, name, category)')
    .eq('teams.club_id', clubId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const getMatchesByTeam = async (teamId) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('team_id', teamId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const createMatch = async (match) => {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateMatch = async (id, changes) => {
  const { data, error } = await supabase
    .from('matches')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── TRAININGS ─────────────────────────────────────────────
export const getTrainingsByTeam = async (teamId) => {
  const { data, error } = await supabase
    .from('trainings')
    .select('*, training_attendances(*)')
    .eq('team_id', teamId)
    .order('scheduled_at')
  if (error) throw error
  return data
}

export const createTraining = async (training) => {
  const { data, error } = await supabase
    .from('trainings')
    .insert(training)
    .select()
    .single()
  if (error) throw error
  return data
}

export const upsertAttendance = async (trainingId, userId, status) => {
  const { error } = await supabase
    .from('training_attendances')
    .upsert({ training_id: trainingId, user_id: userId, status, declared_at: new Date().toISOString() })
  if (error) throw error
}

// ── EVENTS ────────────────────────────────────────────────
export const getEventsByClub = async (clubId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_responses(*)')
    .eq('club_id', clubId)
    .order('starts_at')
  if (error) throw error
  return data
}

export const createEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data
}

export const upsertEventResponse = async (eventId, userId, attending) => {
  const { error } = await supabase
    .from('event_responses')
    .upsert({ event_id: eventId, user_id: userId, attending })
  if (error) throw error
}

// ── MESSAGES ──────────────────────────────────────────────
export const getConversationsByUser = async (userId) => {
  const { data, error } = await supabase
    .from('conversation_members')
    .select('conversations(*, messages(*))')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map(d => d.conversations) ?? []
}

export const sendMessage = async (conversationId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── AUTH HELPERS ──────────────────────────────────────────
export const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10)
export const checkPassword = (pwd, hash) => bcrypt.compareSync(pwd, hash)

// ── SESSION (localStorage) ────────────────────────────────
const SESSION_KEY = 'cm_session'
export const getSession    = ()       => localStorage.getItem(SESSION_KEY)
export const setSession    = (userId) => localStorage.setItem(SESSION_KEY, userId)
export const clearSession  = ()       => localStorage.removeItem(SESSION_KEY)
```

---

## AuthContext — src/context/AuthContext.jsx — REFAIRE

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import * as db from '../services/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  // Restaurer la session au démarrage
  useEffect(() => {
    const restore = async () => {
      const userId = db.getSession()
      if (userId) {
        try {
          const user = await db.getUserById(userId)
          if (user?.account_status === 'active') {
            setCurrentUser(user)
          } else {
            db.clearSession()
          }
        } catch {
          db.clearSession()
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = async (email, password) => {
    const user = await db.getUserByEmail(email)
    if (!user)                              throw new Error('Email introuvable')
    if (!db.checkPassword(password, user.password_hash))
                                            throw new Error('Mot de passe incorrect')
    if (user.account_status === 'pending')  throw new Error('Votre compte est en attente de validation')
    if (user.account_status === 'disabled') throw new Error('Votre compte a été désactivé')

    // Mettre à jour last_login_at
    await db.updateUser(user.id, { last_login_at: new Date().toISOString() })

    db.setSession(user.id)
    setCurrentUser(user)
    return user
  }

  const logout = () => {
    db.clearSession()
    setCurrentUser(null)
  }

  const refreshUser = async () => {
    if (currentUser) {
      const updated = await db.getUserById(currentUser.id)
      setCurrentUser(updated)
    }
  }

  // Dev : connexion directe sans mot de passe (désactiver en prod)
  const devLogin = async (userId) => {
    try {
      const user = await db.getUserById(userId)
      if (user) { db.setSession(user.id); setCurrentUser(user) }
    } catch {}
  }

  const is        = (role)      => currentUser?.role === role
  const isOneOf   = (...roles)  => roles.includes(currentUser?.role)
  const canManageTeam = (teamId) =>
    is('president') ||
    (is('coach') && currentUser?.team_ids?.includes(teamId))

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

## Hook useClubData — src/hooks/useClubData.js

Remplace les imports directs depuis mock.js dans les pages.

```js
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as db from '../services/db'

export function useClubData() {
  const { currentUser } = useAuth()
  const clubId = currentUser?.persons?.club_id

  const [teams,     setTeams]     = useState([])
  const [users,     setUsers]     = useState([])
  const [matches,   setMatches]   = useState([])
  const [trainings, setTrainings] = useState([])
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!clubId) return
    const load = async () => {
      setLoading(true)
      const [t, u, m, tr, ev] = await Promise.all([
        db.getTeamsByClub(clubId),
        db.getUsersByClub(clubId),
        db.getMatchesByClub(clubId),
        // trainings : charger par équipe
        Promise.resolve([]),
        db.getEventsByClub(clubId),
      ])
      setTeams(t)
      setUsers(u)
      setMatches(m)
      setTrainings(tr)
      setEvents(ev)
      setLoading(false)
    }
    load()
  }, [clubId])

  return { teams, users, matches, trainings, events, loading, clubId }
}
```

---

## Pages à créer / refaire

### 1. Page d'accueil — src/pages/public/HomePage.jsx

```jsx
export default function HomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) navigate('/app/events')
  }, [currentUser])

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-8 p-6">
      {/* Logo + titre */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          {/* SVG football */}
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">ClubManager</h1>
        <p className="text-brand-300 text-lg">Gérez votre club sportif simplement</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => navigate('/login')}
          className="px-8 py-3 bg-white text-brand-950 font-semibold rounded-xl hover:bg-brand-50">
          Se connecter
        </button>
        <button onClick={() => navigate('/register/club')}
          className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 border border-brand-500">
          Inscrire mon club
        </button>
      </div>

      <p className="text-brand-400 text-sm">
        Membre d'un club ?{' '}
        <button onClick={() => navigate('/register/member')} className="text-brand-200 underline">
          Rejoindre un club
        </button>
      </p>
    </div>
  )
}
```

---

### 2. Inscription club — src/pages/auth/RegisterClubPage.jsx

Formulaire en 2 sections + stepper visuel.

**Section 1 — Le club :**
```
Nom de l'association *
Sport *              → charger depuis db.getSports()
Adresse
Code postal *
Ville *
Pays *               → défaut "France"
Email du club *
Téléphone du club
```

**Section 2 — Le président :**
```
Prénom *
Nom *
Date de naissance *
Email *              (identifiant de connexion)
Téléphone
Mot de passe *       (min 8 caractères)
Confirmer mdp *
```

**Logique de soumission :**
```js
const handleSubmit = async () => {
  // Validations
  if (password !== confirmPassword) throw 'Les mots de passe ne correspondent pas'
  if (password.length < 8)          throw 'Mot de passe trop court (8 caractères min)'

  const existing = await db.getUserByEmail(presidentEmail)
  if (existing) throw 'Cet email est déjà utilisé'

  // 1. Créer le club
  const club = await db.createClub({
    name: clubName, sport_id: sportId,
    address, postal_code: postalCode, city, country,
    email: clubEmail, phone: clubPhone,
  })

  // 2. Créer la person du président
  const person = await db.createPerson({
    club_id: club.id, first_name: firstName, last_name: lastName,
    birth_date: birthDate, phone: presidentPhone,
  })

  // 3. Créer le user président (actif directement)
  const user = await db.createUser({
    person_id: person.id,
    email: presidentEmail.toLowerCase().trim(),
    password_hash: db.hashPassword(password),
    account_status: 'active',
  })

  // 4. Créer le rôle président
  await db.createUserRole({
    user_id: user.id,
    role_type: 'president',
    scope_type: 'club',
    scope_id: club.id,
  })

  // 5. Connecter automatiquement
  db.setSession(user.id)

  // 6. Rediriger
  navigate('/app/events')
}
```

---

### 3. Connexion — src/pages/auth/LoginPage.jsx

Layout 2 colonnes : gauche `bg-brand-950`, droite formulaire.

```jsx
const handleLogin = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await login(email, password)
    navigate('/app/events')
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

Liens :
- "Rejoindre un club existant" → `/register/member`
- "Inscrire un nouveau club" → `/register/club`

**Pas de dev switcher ici** — le mettre uniquement dans AppLayout.

---

### 4. Inscription membre — src/pages/auth/RegisterMemberPage.jsx

3 étapes avec stepper.

**Étape 1 — Choisir son club :**
```jsx
const [clubs, setClubs] = useState([])
useEffect(() => { db.getClubs().then(setClubs) }, [])

// Recherche filtrée par nom ou ville
const filtered = clubs.filter(c =>
  c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.city?.toLowerCase().includes(search.toLowerCase())
)

// Afficher chaque club : Card cliquable avec nom + sport + ville
```

**Étape 2 — Informations personnelles :**
```
Prénom *
Nom *
Date de naissance *
Email *
Téléphone
Mot de passe *
Confirmer mot de passe *
```

**Étape 3 — Rôle dans le club :**
```jsx
// 3 boutons visuels : Joueur | Coach | Supporter

// Si Joueur ou Coach → select équipe
const [teams, setTeams] = useState([])
useEffect(() => {
  if (selectedClub) db.getTeamsByClub(selectedClub.id).then(setTeams)
}, [selectedClub])

// Info validation selon le rôle
const validationInfo = {
  supporter: { icon: '⚡', title: 'Accès immédiat',       desc: 'Compte créé instantanément, pas de validation requise.' },
  coach:     { icon: '⏳', title: 'Validation président', desc: 'Le président reçoit une notification pour valider votre inscription.' },
  player:    { icon: '⏳', title: 'Validation coach',     desc: 'Le coach de votre équipe reçoit une notification pour vous valider.' },
}
```

**Logique de soumission :**
```js
const handleSubmit = async () => {
  const existing = await db.getUserByEmail(email)
  if (existing) throw 'Cet email est déjà utilisé'

  if (role === 'supporter') {
    // Compte actif immédiatement
    const person = await db.createPerson({
      club_id: selectedClub.id, first_name: firstName, last_name: lastName,
      birth_date: birthDate, phone,
    })
    const user = await db.createUser({
      person_id: person.id,
      email: email.toLowerCase().trim(),
      password_hash: db.hashPassword(password),
      account_status: 'active',
    })
    await db.createUserRole({
      user_id: user.id, role_type: 'supporter',
      scope_type: 'club', scope_id: selectedClub.id,
    })
    db.setSession(user.id)
    navigate('/app/events')

  } else {
    // Coach ou Joueur : demande en attente
    const { crypto } = window
    const token = crypto.randomUUID()

    const request = await db.createRequest({
      club_id: selectedClub.id, first_name: firstName, last_name: lastName,
      birth_date: birthDate, email: email.toLowerCase().trim(), phone,
      role_type: role,
      team_id: selectedTeamId ?? null,
      password_hash: db.hashPassword(password),
      status: 'pending', token,
    })

    // Notifier
    if (role === 'coach') {
      // Trouver le président
      const clubUsers = await db.getUsersByClub(selectedClub.id)
      const president = clubUsers.find(u => {
        const roles = u.user_roles ?? []
        return roles.some(r => r.role_type === 'president')
      })
      if (president) {
        await db.createNotification({
          to_user_id: president.id,
          type: 'registration_request',
          title: 'Nouvelle demande de coach',
          body: `${firstName} ${lastName} souhaite rejoindre comme coach.`,
          request_id: request.id,
        })
      }
    }

    if (role === 'player' && selectedTeamId) {
      // Trouver les coachs de l'équipe
      const { data: coaches } = await supabase
        .from('team_coaches')
        .select('user_id')
        .eq('team_id', selectedTeamId)

      for (const { user_id } of coaches ?? []) {
        await db.createNotification({
          to_user_id: user_id,
          type: 'registration_request',
          title: 'Nouvelle demande de joueur',
          body: `${firstName} ${lastName} souhaite rejoindre votre équipe.`,
          request_id: request.id,
        })
      }
    }

    navigate('/register/pending')
  }
}
```

---

### 5. Page en attente — src/pages/auth/PendingPage.jsx

```jsx
export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-display text-2xl font-bold mb-3">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Votre demande est en cours de traitement.
          Vous serez notifié dès qu'elle sera validée par un responsable.
        </p>
        <Link to="/login"
          className="text-brand-600 text-sm font-medium hover:underline">
          ← Retour à la connexion
        </Link>
      </Card>
    </div>
  )
}
```

---

## Validation des demandes — dans AppLayout

### Cloche de notifications

```jsx
// Dans la topbar d'AppLayout
const [unreadCount, setUnreadCount] = useState(0)
const [notifOpen,   setNotifOpen]   = useState(false)
const [notifs,      setNotifs]      = useState([])

useEffect(() => {
  if (!currentUser) return
  const loadNotifs = async () => {
    const [count, list] = await Promise.all([
      db.getUnreadCount(currentUser.id),
      db.getNotifications(currentUser.id),
    ])
    setUnreadCount(count)
    setNotifs(list)
  }
  loadNotifs()
  // Rafraîchir toutes les 30 secondes
  const interval = setInterval(loadNotifs, 30000)
  return () => clearInterval(interval)
}, [currentUser])

<button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-surface-100">
  <Bell size={18} className="text-gray-600" />
  {unreadCount > 0 && (
    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px]
                     rounded-full flex items-center justify-center font-bold">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

### Panel notifications

```jsx
{notifOpen && (
  <div className="absolute top-14 right-4 w-80 bg-white rounded-2xl shadow-xl
                  border border-surface-200 z-50 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
      <span className="font-semibold text-sm">Notifications</span>
      <button onClick={() => { db.markAllNotificationsRead(currentUser.id); setUnreadCount(0) }}
        className="text-xs text-brand-600 hover:underline">
        Tout marquer lu
      </button>
    </div>

    <div className="max-h-96 overflow-y-auto divide-y divide-surface-100">
      {notifs.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-400">Aucune notification</div>
      )}
      {notifs.map(n => (
        <div key={n.id} className={`p-4 ${!n.read ? 'bg-brand-50' : ''}`}>
          <div className="font-semibold text-sm text-gray-900 mb-0.5">{n.title}</div>
          <div className="text-xs text-gray-500 mb-2">{n.body}</div>

          {/* Boutons valider/refuser si demande d'inscription */}
          {n.type === 'registration_request' && n.request_id && (
            <div className="flex gap-2">
              <button onClick={() => handleApprove(n)}
                className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200">
                ✓ Valider
              </button>
              <button onClick={() => handleReject(n)}
                className="flex-1 text-xs py-1.5 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200">
                ✗ Refuser
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

### Logique validation / refus

```js
const handleApprove = async (notif) => {
  const request = await supabase
    .from('registration_requests')
    .select('*')
    .eq('id', notif.request_id)
    .single()
    .then(r => r.data)

  if (!request) return

  // Créer la person
  const person = await db.createPerson({
    club_id: request.club_id,
    first_name: request.first_name, last_name: request.last_name,
    birth_date: request.birth_date, phone: request.phone,
  })

  // Créer le user actif
  const user = await db.createUser({
    person_id: person.id,
    email: request.email,
    password_hash: request.password_hash,
    account_status: 'active',
  })

  // Créer le rôle
  await db.createUserRole({
    user_id: user.id,
    role_type: request.role_type,
    scope_type: 'team',
    scope_id: request.team_id ?? request.club_id,
  })

  // Si coach → ajouter à team_coaches
  if (request.role_type === 'coach' && request.team_id) {
    await db.addCoachToTeam(request.team_id, user.id)
  }

  // Si joueur → ajouter à team_players
  if (request.role_type === 'player' && request.team_id) {
    await db.addPlayerToTeam(request.team_id, user.id, null, null)
  }

  // Mettre à jour la demande
  await db.updateRequest(request.id, {
    status: 'approved',
    reviewed_by: currentUser.id,
    reviewed_at: new Date().toISOString(),
  })

  // Notifier la personne
  await db.createNotification({
    to_user_id: user.id,
    type: 'request_approved',
    title: 'Demande approuvée !',
    body: 'Votre inscription a été validée. Vous pouvez maintenant vous connecter.',
    request_id: request.id,
  })

  // Marquer la notif comme lue
  await db.markNotificationRead(notif.id)

  // Rafraîchir
  setNotifs(prev => prev.filter(n => n.id !== notif.id))
  setUnreadCount(c => Math.max(0, c - 1))
}

const handleReject = async (notif) => {
  await db.updateRequest(notif.request_id, {
    status: 'rejected',
    reviewed_by: currentUser.id,
    reviewed_at: new Date().toISOString(),
  })
  await db.markNotificationRead(notif.id)
  setNotifs(prev => prev.filter(n => n.id !== notif.id))
  setUnreadCount(c => Math.max(0, c - 1))
}
```

---

## Création d'équipes par le président

Dans TeamPage.jsx, le président voit un bouton "+ Nouvelle équipe".

```jsx
const handleCreateTeam = async () => {
  if (!teamName.trim()) return
  const sport = await supabase
    .from('clubs')
    .select('sport_id')
    .eq('id', currentUser.persons.club_id)
    .single()
    .then(r => r.data)

  await db.createTeam({
    club_id: currentUser.persons.club_id,
    sport_id: sport.sport_id,
    name: teamName.trim(),
    season: currentSeason,  // ex : "2024-2025"
    gender: 'mixed',
  })

  // Rafraîchir la liste
  setTeamName('')
  setShowForm(false)
  // reload teams
}
```

---

## Migration des pages existantes

Toutes les pages qui importent depuis `src/data/mock.js` doivent
utiliser `useClubData()` à la place.

```jsx
// AVANT (mock)
import { TEAMS, USERS, MATCHES } from '../../data/mock'

// APRÈS (Supabase)
import { useClubData } from '../../hooks/useClubData'
const { teams, users, matches, loading } = useClubData()
```

Afficher un loader pendant le chargement :
```jsx
if (loading) return (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
  </div>
)
```

---

## App.jsx — routes complètes

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout          from './components/layout/AppLayout'
import HomePage           from './pages/public/HomePage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterClubPage   from './pages/auth/RegisterClubPage'
import RegisterMemberPage from './pages/auth/RegisterMemberPage'
import PendingPage        from './pages/auth/PendingPage'
import EventsPage         from './pages/app/EventsPage'
import TeamPage           from './pages/app/TeamPage'
import MembersPage        from './pages/app/MembersPage'
import CalendarPage       from './pages/app/CalendarPage'
import MessagesPage       from './pages/app/MessagesPage'
import MatchPage          from './pages/app/MatchPage'
import ProfilePage        from './pages/app/ProfilePage'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register/club"     element={<RegisterClubPage />} />
          <Route path="/register/member"   element={<RegisterMemberPage />} />
          <Route path="/register/pending"  element={<PendingPage />} />
          <Route path="/app" element={
            <ProtectedRoute><AppLayout /></ProtectedRoute>
          }>
            <Route index                   element={<Navigate to="/app/events" replace />} />
            <Route path="events"           element={<EventsPage />} />
            <Route path="team"             element={<TeamPage />} />
            <Route path="members"          element={<MembersPage />} />
            <Route path="calendar"         element={<CalendarPage />} />
            <Route path="messages"         element={<MessagesPage />} />
            <Route path="matches/:id"      element={<MatchPage />} />
            <Route path="profile"          element={<ProfilePage />} />
            <Route path="profile/:id"      element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

---

## Règles strictes

1. **Toutes les requêtes BDD** passent par `src/services/db.js` — jamais d'appel Supabase direct dans les pages
2. **Pas de mot de passe en clair** — toujours `db.hashPassword()` avant insertion
3. **Gestion d'erreurs** — tout appel async dans un try/catch avec message d'erreur affiché
4. **Loading states** — chaque page affiche un spinner pendant le chargement Supabase
5. **Variables d'env** — ne jamais hardcoder l'URL ou la clé Supabase dans le code
6. **RLS permissive** pour l'instant — à durcir en Phase 2 avec des policies par club_id
7. **Session** dans localStorage — juste le `user_id`, jamais le mot de passe

---

## Ordre de priorité

1. **Créer `.env`** avec les variables Supabase
2. **Créer `src/lib/supabase.js`**
3. **Installer** `@supabase/supabase-js` et `bcryptjs`
4. **Créer `src/services/db.js`**
5. **Refaire `src/context/AuthContext.jsx`**
6. **Créer `src/pages/public/HomePage.jsx`**
7. **Créer `src/pages/auth/RegisterClubPage.jsx`**
8. **Refaire `src/pages/auth/LoginPage.jsx`**
9. **Créer `src/pages/auth/RegisterMemberPage.jsx`**
10. **Créer `src/pages/auth/PendingPage.jsx`**
11. **Mettre à jour `App.jsx`** avec toutes les routes + ProtectedRoute
12. **Mettre à jour `AppLayout.jsx`** : cloche notifs + validation demandes
13. **Créer `src/hooks/useClubData.js`**
14. **Migrer les pages existantes** de mock.js vers useClubData()
