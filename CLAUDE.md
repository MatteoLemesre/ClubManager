# ClubManager — CLAUDE.md

Contexte complet du projet pour Claude Code. Ce fichier est la référence unique — lis-le entièrement avant de toucher au code.

---

## Stack & commandes

```bash
npm run dev      # http://localhost:5173
npm run build    # build prod
npm run preview  # tester le build
```

**Dépendances installées :** React 18, Vite, React Router v6, Tailwind CSS v3, lucide-react, date-fns  
**Déploiement :** Render (Static Site) — build: `npm run build` — publish: `dist`  
**Backend :** aucun pour l'instant — tout est mock data dans `src/data/mock.js`

---

## Structure des fichiers

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.jsx        # Sidebar icônes + topbar + <Outlet />
│   └── ui/
│       └── index.jsx            # Avatar, Badge, Card, EmptyState, StatCard...
├── context/
│   └── AuthContext.jsx          # useAuth() — rôle courant, is(), isOneOf(), canManageTeam()
├── data/
│   └── mock.js                  # Toutes les données + helpers
├── pages/
│   ├── auth/                    # À CRÉER
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── app/
│       ├── EventsPage.jsx       # ✅ FAIT — page d'accueil
│       ├── TeamPage.jsx         # ✅ FAIT — équipe, matchs, entraînements
│       ├── MembersPage.jsx      # ❌ À CRÉER
│       ├── CalendarPage.jsx     # ❌ À CRÉER
│       ├── MessagesPage.jsx     # ❌ À CRÉER
│       └── MatchPage.jsx        # ❌ À CRÉER  (route /app/matches/:id)
├── App.jsx                      # ❌ À CRÉER — routes React Router
└── main.jsx                     # ✅ existe (entrée Vite)
```

---

## Rôles utilisateurs

| Rôle | id exemple | Accès |
|------|-----------|-------|
| `president` | u-1 | Tout le club |
| `coach` | u-2, u-3 | Ses équipes uniquement |
| `player` | u-4 à u-7 | Son profil + son équipe |
| `supporter` | u-8 | Matchs, équipes favoris, discussions |
| `parent` | u-9 | Supporter + conv parent avec coach + joueur |

**Toujours vérifier le rôle** avec `useAuth()` avant d'afficher un contenu sensible.

---

## AuthContext — API disponible

```js
const { currentUser, login, logout, is, isOneOf, canManageTeam } = useAuth()

is('president')                    // true si rôle exact
isOneOf('president', 'coach')      // true si un des rôles
canManageTeam('team-1')            // true si président OU coach de cette équipe
login('u-4')                       // changer d'utilisateur (dev seulement)
```

Le sélecteur de rôle en dev est dans `AppLayout.jsx` (hover sur l'avatar en bas de la sidebar).

---

## Mock data — ce qui existe dans src/data/mock.js

```js
// Constantes
CLUB          // { id, name, sport, city, department, region, phone, email, address }
TEAMS         // 4 équipes : team-1 Séniors A, team-2 U13 B, team-3 U9 A, team-4 Vétérans
USERS         // 9 utilisateurs (u-1 à u-9) avec tous les rôles
EVENTS        // 4 événements (carpool, meeting, social, tournament)
TRAININGS     // 3 entraînements (tr-1, tr-2 équipe Séniors A ; tr-3 U13)
MATCHES       // 3 matchs (m-1 scheduled, m-2 played avec events, m-3 scheduled)
CONVERSATIONS // 3 convs (conv-1 team_chat, conv-2 coach_channel, conv-3 parent_chat)

// Helpers
getUserById(id)    // retourne un user ou undefined
getTeamById(id)    // retourne une équipe ou undefined
getFullName(user)  // "Prénom Nom"
getInitials(user)  // "PN"

// Maps de labels/couleurs
ROLE_LABELS        // { president: 'Président', coach: 'Coach', ... }
LICENSE_STATUS     // { active: { label, color }, expiring, expired }
EVENT_TYPES        // { carpool: { label, color, text }, meeting, social, tournament, other }
```

**Structure d'un MATCH :**
```js
{ id, teamId, opponentName, scheduledAt, location, isHome, referee,
  status: 'scheduled'|'played'|'cancelled',
  squad: { userId: 'called'|'confirmed'|'absent' },
  scoreHome, scoreAway,
  events: [{ type: 'goal'|'yellow_card'|'red_card', minute, userId, assistUserId? }] }
```

**Structure d'un TRAINING :**
```js
{ id, teamId, title, scheduledAt, durationMinutes, location, createdBy,
  attendances: { userId: 'present'|'absent'|'excused' } }
```

**Structure d'une CONVERSATION :**
```js
{ id, type: 'team_chat'|'coach_channel'|'parent_chat',
  teamId?, name, members: [userId],
  messages: [{ id, senderId, content, sentAt, isPinned? }] }
```

---

## Composants UI disponibles — src/components/ui/index.jsx

```jsx
<Avatar user={userObj} size="sm|md|lg|xl" className="" />
// Affiche initiales colorées (couleur dérivée du nom)

<Badge variant="blue|green|orange|red|purple|gray|brand">texte</Badge>

<LicenseBadge status="active|expiring|expired" />
// Affiche "Valide" (vert), "Bientôt" (orange), "Expirée" (rouge)

<RoleBadge role="president|coach|player|supporter|parent" />

<Card className="" onClick={fn}>contenu</Card>
// bg-white rounded-2xl border shadow-sm — cliquable si onClick

<EmptyState icon="📅" title="Titre" description="desc" action={<button>} />

<StatCard value="12" label="Matchs joués" sub={<Badge>} color="text-emerald-600" />

<SectionHeader title="TITRE" action={<button>} />
```

---

## Design system Tailwind

```
Couleurs custom (tailwind.config.js) :
  brand-50  #eef6ff     brand-100 #daeaff    brand-400 #5c96ff
  brand-600 #1f4fe8     brand-700 #1a3dd4    brand-950 #151f52
  surface-0 #ffffff     surface-50 #f7f8fc   surface-100 #eef0f7
  surface-200 #dde0ed   surface-300 #c4c9df

Fonts :
  font-sans    → DM Sans (corps de texte)
  font-display → Syne (titres de page — font-bold)

Patterns récurrents :
  Fond page     : bg-surface-50
  Carte         : bg-white rounded-2xl border border-surface-200 shadow-sm
  Bouton CTA    : bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm font-medium
  Bouton ghost  : hover:bg-surface-100 text-gray-600 rounded-xl px-3 py-2 text-sm
  Badge pill    : px-2.5 py-0.5 rounded-full text-xs font-medium
  Input         : bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm
  Section title : text-xs font-semibold text-gray-400 uppercase tracking-wider
```

---

## App.jsx — à créer

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import EventsPage   from './pages/app/EventsPage'
import TeamPage     from './pages/app/TeamPage'
import MembersPage  from './pages/app/MembersPage'
import CalendarPage from './pages/app/CalendarPage'
import MessagesPage from './pages/app/MessagesPage'
import MatchPage    from './pages/app/MatchPage'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app"      element={<AppLayout />}>
            <Route index          element={<Navigate to="/app/events" replace />} />
            <Route path="events"  element={<EventsPage />} />
            <Route path="team"    element={<TeamPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="calendar"element={<CalendarPage />} />
            <Route path="messages"element={<MessagesPage />} />
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

## Pages à créer — specs détaillées

### MembersPage.jsx — /app/members

**Accès :**
- Président : tous les membres + colonne Licence
- Coach : membres de ses équipes uniquement + colonne Licence
- Joueur/Supporter/Parent : tous les membres MAIS sans colonne Licence, sans actions

**Mise en page :**
- Toolbar en haut : input recherche (filtre temps réel sur nom/prénom) + select équipe + select rôle + select statut licence (si président/coach) + toggle vue liste/grille
- Vue liste : tableau avec colonnes Membre (avatar+nom+poste), Équipe, Rôle, Licence (si droit), Matchs, Buts, Présence
- Vue grille : cartes 3 colonnes avec avatar large, nom, équipe, stats
- Clic sur une ligne/carte → modal ou page profil (peut rester un simple alert pour l'instant)

**Filtrage :**
```js
// Filtrage côté client sur USERS
const filtered = USERS.filter(u => {
  const matchSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  const matchTeam   = !teamFilter   || u.teamIds?.includes(teamFilter)
  const matchRole   = !roleFilter   || u.role === roleFilter
  const matchLic    = !licFilter    || u.licenseStatus === licFilter
  return matchSearch && matchTeam && matchRole && matchLic
})
```

**Colonnes stats :** afficher `u.stats?.matches ?? '—'`, `u.stats?.goals ?? '—'`, etc.
**Colonne présence :** `u.stats?.attendanceRate` → barre de progression colorée (vert ≥80%, orange 60-79%, rouge <60%)

---

### CalendarPage.jsx — /app/calendar

**Mise en page :**
- Panneau gauche (flex-1) : grille calendrier
- Panneau droit (w-64) : détail du jour sélectionné

**Toolbar :**
- Navigation mois : `‹ Mars 2025 ›`
- Filtres toggle : `[Entraînements]` `[Matchs]` `[Événements]` (désactivables)
- Select équipe (filtre)
- Vue : `[Mois] [Semaine] [Liste]` — implémenter au moins Mois et Liste

**Grille mois :**
- 7 colonnes Lun→Dim
- Chaque case : numéro du jour + événements du jour sous forme de petits pills colorés
- Couleurs : bleu = entraînement, vert = match, orange = événement
- Aujourd'hui : bordure brand-600
- Jours du mois précédent/suivant : opacity-40
- Clic sur un jour → affiche le détail dans le panneau droit

**Panneau droit :**
- Titre : "Lundi 15 mars"
- Liste des événements du jour sélectionné, chacun avec :
  - Badge type coloré
  - Titre + heure + lieu
  - Bouton action contextuel : "Présent/Absent" si entraînement joueur, "Voir fiche" si match, "Participer" si événement

**Données à agréger :**
```js
// Fusionner les 3 sources pour le calendrier
const allItems = [
  ...TRAININGS.map(t => ({ ...t, _type: 'training', date: t.scheduledAt })),
  ...MATCHES.map(m => ({ ...m, _type: 'match', date: m.scheduledAt })),
  ...EVENTS.map(e => ({ ...e, _type: 'event', date: e.startsAt })),
]
// Filtrer par rôle : joueur ne voit que ses équipes, supporter ne voit pas les entraînements
```

**État local :**
```js
const [currentMonth, setCurrentMonth] = useState(new Date())
const [selectedDay, setSelectedDay]   = useState(new Date())
const [showTrainings, setShowTrainings] = useState(true)
const [showMatches, setShowMatches]     = useState(true)
const [showEvents, setShowEvents]       = useState(true)
const [teamFilter, setTeamFilter]       = useState('')
```

**Helpers date-fns à utiliser :**
```js
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek,
         isSameDay, isSameMonth, isToday, format, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

// Générer les jours de la grille (inclut jours du mois précédent/suivant)
const monthStart = startOfMonth(currentMonth)
const monthEnd   = endOfMonth(currentMonth)
const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 })
const gridEnd    = endOfWeek(monthEnd,   { weekStartsOn: 1 })
const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })
```

---

### MessagesPage.jsx — /app/messages

**Mise en page :**
- Colonne gauche (w-72) : liste des conversations
- Colonne droite (flex-1) : zone de chat

**Conversations visibles selon rôle :**
```js
const myConvs = CONVERSATIONS.filter(c => c.members.includes(currentUser.id))
// + pour président : toutes les convs du club
```

**Liste conversations (colonne gauche) :**
- Header "Messagerie" + bouton "+ Nouveau" (pour supporter et président)
- Input recherche conversations
- Groupes de conversations :
  - "Équipes" : team_chat et coach_channel
  - "Parents" : parent_chat (visible coach + joueur concerné + parent)
  - "Discussions" : convs directes et custom
- Chaque item : avatar équipe ou initiales + nom conv + aperçu dernier message + heure
- Indicateur non-lu (point bleu)
- Conversation active : fond brand-50 + bordure gauche brand-600

**Zone de chat (colonne droite) :**
- Header : nom de la conv + badge type + nombre de membres
- Badge spécial pour coach_channel : "📣 Canal coach — lecture seule" visible pour les joueurs
- Messages regroupés par expéditeur + horodatage
- Message épinglé (isPinned) affiché en haut avec fond violet clair (pour coach_channel)
- Bulles : mes messages à droite (bg-brand-100), autres à gauche (bg-surface-100)
- Heure sous chaque groupe
- Input en bas : désactivé si coach_channel ET rôle joueur avec message "Lecture seule"

**État local :**
```js
const [activeConvId, setActiveConvId] = useState(myConvs[0]?.id)
const [messages, setMessages]         = useState({}) // { convId: [...messages] }
const [input, setInput]               = useState('')

const sendMessage = () => {
  if (!input.trim()) return
  const newMsg = { id: Date.now(), senderId: currentUser.id, content: input, sentAt: new Date() }
  setMessages(prev => ({
    ...prev,
    [activeConvId]: [...(prev[activeConvId] || activeConv.messages), newMsg]
  }))
  setInput('')
}
```

---

### MatchPage.jsx — /app/matches/:id

**Accès via :** `<Link to={`/app/matches/${match.id}`}>` depuis TeamPage ou CalendarPage

**Récupération des données :**
```js
import { useParams } from 'react-router-dom'
const { id } = useParams()
const match = MATCHES.find(m => m.id === id)
```

**Structure :**

1. **Hero match** (toujours visible)
   - Équipe maison vs Adversaire
   - Score (si joué) ou heure (si scheduled)
   - Meta : date, lieu, domicile/extérieur, arbitre
   - Badge statut : "À venir" (bleu), "Victoire" (vert), "Défaite" (rouge), "Nul" (gris)

2. **Onglets selon rôle :**

| Onglet | Qui voit |
|--------|----------|
| Résumé | Tous |
| Composition | Tous (si publiée) |
| Convocations | Coach + Président uniquement |
| Saisie résultat | Coach + Président (après match) |
| Notation | Joueurs ayant joué (status=played dans squad) |

3. **Onglet Résumé :**
   - Liste chronologique des événements du match (goals, cards, subs)
   - Icône : ⚽ but, 🟨 jaune, 🟥 rouge, 🔄 remplacement
   - Format : `34' — Diallo (pass. Martin)`
   - Si match à venir : message "Le résumé sera disponible après le match"

4. **Onglet Composition :**
   - Terrain SVG simple avec joueurs positionnés par ligne (attaque / milieu / défense / GK)
   - Chaque joueur : numéro + nom
   - Liste remplaçants en dessous
   - Si pas de compo publiée : message "La composition n'a pas encore été publiée"

5. **Onglet Convocations (coach/président) :**
   - Liste des joueurs de l'équipe avec leur statut : confirmed (✓ vert), called (⏳ gris), absent (✗ rouge)
   - Boutons pour changer le statut de chaque joueur

6. **Onglet Saisie résultat (coach/président, match joué) :**
   - Input score maison / score extérieur
   - Liste d'événements avec bouton "+ Ajouter"
   - Bouton "Verrouiller la feuille" (désactive les modifications)

---

### LoginPage.jsx — /login

**Design :** deux colonnes — gauche fond sombre avec nom du club et slogan, droite formulaire blanc

**Formulaire :**
```
Email
Mot de passe
[Se connecter]
Lien : "Pas encore membre ? S'inscrire"
```

**Mock login :** afficher une liste déroulante "Connexion rapide (dev)" avec tous les utilisateurs mock. Au clic → `login(userId)` puis `navigate('/app/events')`

---

### RegisterPage.jsx — /register

**3 étapes avec stepper visuel :**

**Étape 1 — Choisir son club**
- Input recherche club (filtre sur CLUB.name)
- Affiche les clubs trouvés sous forme de cartes cliquables
- Mock : un seul club "FC Saint-Denis"

**Étape 2 — Informations personnelles**
- Nom, Prénom, Email, Téléphone

**Étape 3 — Choisir son rôle**
- 3 boutons visuels : Joueur / Coach / Supporter
- Si Joueur → select équipe apparaît (liste des TEAMS)
- Panel droit : explication du flux de validation selon le rôle
  - Supporter → accès immédiat
  - Coach → validation par le président
  - Joueur → validation par le coach de l'équipe
- Bouton "Envoyer ma demande" → toast de confirmation + redirect /login

---

## Règles strictes

1. **Ne jamais recréer** un composant déjà dans `src/components/ui/index.jsx`
2. **Tailwind uniquement** — pas de style inline sauf cas impossible autrement
3. **date-fns + locale fr** pour tout affichage de date : `format(date, "EEE d MMM", { locale: fr })`
4. **lucide-react** pour toutes les icônes — importer depuis `'lucide-react'`
5. **Vérifier le rôle** avec `useAuth()` avant tout accès conditionnel
6. **Pas d'API calls** — tout vient de `src/data/mock.js`
7. **Modifier le mock** si besoin de nouvelles données (ajouter des entrées, pas changer la structure)
8. **Pas de useState inutile** — utiliser des variables dérivées si aucune interaction n'est nécessaire

---

## Ordre de priorité pour coder

1. `App.jsx` — routes (indispensable pour que tout fonctionne)
2. `MembersPage.jsx` — liste membres avec recherche et filtres
3. `CalendarPage.jsx` — calendrier mensuel avec détail
4. `MessagesPage.jsx` — messagerie avec canal coach
5. `LoginPage.jsx` — page de connexion mock
6. `RegisterPage.jsx` — inscription 3 étapes
7. `MatchPage.jsx` — fiche match avec onglets
