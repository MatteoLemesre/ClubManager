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
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── app/
│       ├── EventsPage.jsx         # Événements ponctuels + matchs selon rôle
│       ├── TeamPage.jsx           # Vue équipes avec sous-onglets
│       ├── MembersPage.jsx        # Membres du club
│       ├── CalendarPage.jsx       # Calendrier entraînements + matchs + événements
│       ├── MessagesPage.jsx       # Messagerie
│       ├── MatchPage.jsx          # Fiche match (/app/matches/:id)
│       └── ProfilePage.jsx        # Profil (/app/profile et /app/profile/:id)
├── App.jsx
└── main.jsx
```

---

## Navigation par rôle — DÉFINITIVE

| Page | Président | Coach | Joueur | Supporter |
|------|:---------:|:-----:|:------:|:---------:|
| Événements `/app/events` | ✅ | ✅ | ✅ | ✅ |
| Équipes `/app/team` | ✅ | ✅ | ✅ | ✅ |
| Membres `/app/members` | ✅ | ✅ label "Joueurs" | ❌ | ❌ |
| Calendrier `/app/calendar` | ✅ | ✅ | ✅ | ✅ |
| Messagerie `/app/messages` | ✅ | ✅ | ✅ | ✅ discussions libres |

```js
const NAV_ITEMS = [
  { to: '/app/events',   icon: CalendarDays,  label: 'Événements', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/team',     icon: Shield,        label: 'Équipes',    roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/members',  icon: Users,         label: 'Membres',    roles: ['president','coach'],
    labelFn: (role) => role === 'coach' ? 'Joueurs' : 'Membres' },
  { to: '/app/calendar', icon: Calendar,      label: 'Calendrier', roles: ['president','coach','player','supporter','parent'] },
  { to: '/app/messages', icon: MessageCircle, label: 'Messagerie', roles: ['president','coach','player','supporter','parent'] },
]
```

---

## Rôles utilisateurs

| Rôle | id | Description |
|------|-----|-------------|
| `president` | u-1 | Accès complet club |
| `coach` | u-2, u-3 | Ses équipes uniquement |
| `player` | u-4→u-7 | Son équipe, événements, calendrier |
| `supporter` | u-8 | Vision externe — matchs, équipes, événements publics |
| `parent` | u-9 | Comme supporter + messagerie parent |

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

## Mock data — référence complète

### À ajouter / mettre à jour dans mock.js

**Users — ajouter sur chaque joueur :**
```js
birthPlace: 'Paris (75)',
birthDate: '2001-03-15',     // déjà présent, vérifier format ISO string
documents: {
  license:     { uploaded: true,  url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/R36.pdf' },
  medicalCert: { uploaded: false, url: null },
  photo:       { uploaded: true,  url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/R36.pdf' },
}
```

**EVENTS — 3 catégories désormais :**
```js
// category: 'club' = événement principal du club (visible par tous)
// category: 'team' = événement interne équipe (visible pres + coach + joueurs de l'équipe)
// category: 'match' = match programmé (affiché dans EventsPage pour supporters)

export const EVENTS = [
  {
    id: 'ev-1',
    title: 'Covoiturage — Déplacement FC Aubervilliers',
    description: 'Organisation du covoiturage pour le match de samedi.',
    category: 'team',         // ← NOUVEAU CHAMP
    type: 'carpool',
    visibility: 'team',
    teamId: 'team-1',
    startsAt: new Date(2026, 2, 15, 13, 30),
    location: 'Parking Terrain Nord',
    createdBy: 'u-2',
    attendees: ['u-4', 'u-5', 'u-7', 'u-8'],
    carpoolOffers: 4,
    carpoolRequests: 6,
  },
  {
    id: 'ev-2',
    title: 'Réunion coachs — Bilan mi-saison',
    description: 'Point sur les résultats, présences et besoins équipement.',
    category: 'club',
    type: 'meeting',
    visibility: 'role',
    targetRoles: ['president', 'coach'],
    startsAt: new Date(2026, 2, 25, 20, 0),
    location: 'Local du club',
    createdBy: 'u-1',
    attendees: ['u-1', 'u-2', 'u-3'],
  },
  {
    id: 'ev-3',
    title: 'Repas de fin de saison',
    description: 'Grand repas annuel pour tous les membres, familles et supporters.',
    category: 'club',
    type: 'social',
    visibility: 'club',
    startsAt: new Date(2026, 5, 28, 18, 0),
    location: 'Salle des fêtes, Saint-Denis',
    createdBy: 'u-1',
    attendees: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-8'],
    maxAttendees: 80,
  },
  {
    id: 'ev-4',
    title: 'Tournoi de Pâques U9/U11',
    description: '4 équipes de 8 joueurs. Journée complète avec arbitrage.',
    category: 'club',
    type: 'tournament',
    visibility: 'club',
    startsAt: new Date(2026, 3, 6, 9, 0),
    endsAt:   new Date(2026, 3, 6, 17, 0),
    location: 'Terrain Nord',
    createdBy: 'u-1',
    attendees: ['u-1', 'u-3'],
    maxAttendees: 60,
  },
  {
    id: 'ev-5',
    title: 'BBQ de fin de saison',
    description: 'Grand barbecue pour fêter la fin de saison avec tous les membres, familles et supporters. Boissons et grillades offertes par le club !',
    category: 'club',
    type: 'social',
    visibility: 'club',
    startsAt: new Date(2026, 5, 21, 13, 0),
    endsAt:   new Date(2026, 5, 21, 19, 0),
    location: 'Terrain Nord — FC Saint-Denis',
    createdBy: 'u-1',
    attendees: ['u-1', 'u-2', 'u-3', 'u-8'],
    maxAttendees: 80,
  },
]
```

**MATCHES — ajouter champ carpool :**
```js
// Sur chaque match, ajouter :
carpool: [
  {
    id: 'cp-1',
    userId: 'u-5',        // qui propose
    departure: 'Porte de la Chapelle',
    time: '13h30',
    seats: 3,             // places disponibles
    takenBy: ['u-4'],     // qui a pris une place
  }
]
```

---

## EventsPage.jsx — REFAIRE

### Principe des 3 catégories

```
Onglet "Club"   → événements category:'club' visibles par tous
Onglet "Équipe" → événements category:'team' (pres + coach + joueurs concernés)
Onglet "Matchs" → MATCHES programmés (status:'scheduled') — surtout utile pour supporters
```

### Contenu par rôle

**Président :**
- Voit les 3 onglets
- Onglet Club : tous les événements club + bouton "Créer"
- Onglet Équipe : tous les événements d'équipe de toutes les équipes + bouton "Créer"
- Onglet Matchs : tous les matchs programmés

**Coach :**
- Voit les 3 onglets
- Onglet Club : événements club (lecture)
- Onglet Équipe : événements de ses équipes uniquement + bouton "Créer"
- Onglet Matchs : matchs de ses équipes

**Joueur :**
- Voit les 3 onglets
- Onglet Club : événements club (lecture)
- Onglet Équipe : événements de son équipe (lecture)
- Onglet Matchs : matchs de son équipe

**Supporter :**
- Voit 2 onglets : Club + Matchs (pas d'onglet Équipe)
- Onglet Club : événements visibility:'club' uniquement
- Onglet Matchs : tous les matchs programmés du club

### Implémentation

```jsx
// Onglets
const tabs = [
  { id: 'club',   label: 'Club' },
  { id: 'team',   label: 'Équipe', hidden: is('supporter') },
  { id: 'matches',label: 'Matchs' },
].filter(t => !t.hidden)

// Filtrage événements Club
const clubEvents = EVENTS.filter(ev => {
  if (ev.category !== 'club') return false
  if (ev.visibility === 'club') return true
  if (ev.visibility === 'role') return ev.targetRoles?.includes(currentUser.role)
  return false
})

// Filtrage événements Équipe
const teamEvents = EVENTS.filter(ev => {
  if (ev.category !== 'team') return false
  if (is('president')) return true
  return currentUser.teamIds?.includes(ev.teamId)
})

// Matchs programmés
const upcomingMatches = MATCHES.filter(m => {
  if (m.status !== 'scheduled') return false
  if (isOneOf('president','supporter')) return true
  return currentUser.teamIds?.includes(m.teamId)
})
```

### Carte match dans l'onglet Matchs

```jsx
<Card key={m.id} className="p-4" onClick={() => navigate(`/app/matches/${m.id}`)}>
  <div className="flex items-center justify-between mb-2">
    <span className="font-semibold text-gray-900">{getTeamById(m.teamId)?.name}</span>
    <Badge variant="blue">{getTeamById(m.teamId)?.category}</Badge>
  </div>
  <div className="text-lg font-bold text-gray-900 mb-2">
    vs {m.opponentName}
  </div>
  <div className="space-y-1 text-xs text-gray-500">
    <div>📅 {format(m.scheduledAt, "EEE d MMM yyyy · HH'h'mm", { locale: fr })}</div>
    <div>📍 {m.location}</div>
    <div>🟨 {m.referee ?? 'Arbitre non renseigné'}</div>
    <div>{m.isHome ? '🏠 Domicile' : '🚌 Déplacement'}</div>
  </div>
</Card>
```

### Vue détail événement (panel/modal au clic)

Au clic sur une carte événement → afficher un panel latéral droit ou une modal avec :
- Titre + badge type
- Description complète
- Date début + fin si endsAt
- Lieu
- Nombre inscrits / max si maxAttendees
- Avatars + noms des participants
- Bouton toggle "Je viens" / "Je ne viens plus"
- Bouton "Modifier" si createdBy === currentUser.id ou is('president')
- Bouton fermer (×)

```jsx
const [selectedEvent, setSelectedEvent] = useState(null)
// Clic carte → setSelectedEvent(ev)
// Clic × → setSelectedEvent(null)
```

---

## TeamPage.jsx — REFAIRE

### Structure générale

```
Barre sélection équipe (toutes les équipes — visible par tous)
  └── Onglets : [Équipe] [Joueurs & Staff]
```

### Onglet "Équipe" — visible par tous

Affiche pour l'équipe sélectionnée :
- Prochain match : heure, jour, terrain, catégorie, arbitre → cliquable vers `/app/matches/:id`
- Dernier match joué : score + événements (buts, cartons)
- Top stats : top 3 buteurs · passeurs · matchs joués + bouton "Classement complet"

**En plus pour président et coach DE cette équipe :**
- Récapitulatif présences entraînements (barres de progression)
- Réponses convocations (X dispo · X indispo · X en attente)
- Boutons : "Convocations", "Publier compo", "+ Entraînement", "+ Match"

**En plus pour le joueur DE cette équipe :**
- Boutons Présent/Absent pour le prochain entraînement
- Boutons Disponible/Indispo pour le prochain match

### Onglet "Joueurs & Staff" — visible par tous

Liste de tous les membres de l'équipe sélectionnée :

```jsx
// Joueurs
const players = USERS.filter(u => u.role === 'player' && u.teamIds?.includes(activeTeamId))
// Coachs
const coaches = USERS.filter(u => u.role === 'coach' && u.teamIds?.includes(activeTeamId))
```

**Affichage de chaque personne :**
```jsx
// Pour chaque joueur
<div className="flex items-center gap-3 py-3 border-b border-surface-100">
  <Avatar user={u} size="md" />
  <div>
    <div className="font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
    <div className="text-sm text-gray-500">
      {u.position ?? 'Poste non renseigné'} · N°{u.jerseyNumber}
    </div>
    <div className="text-xs text-gray-400">
      {format(new Date(u.birthDate), 'd MMMM yyyy', { locale: fr })}
      {' '}({differenceInYears(new Date(), new Date(u.birthDate))} ans)
    </div>
  </div>
</div>

// Pour chaque coach
<div className="flex items-center gap-3 py-3 border-b border-surface-100">
  <Avatar user={u} size="md" />
  <div>
    <div className="font-semibold text-gray-900">{u.firstName} {u.lastName}</div>
    <div className="text-sm text-gray-500">Coach</div>
  </div>
</div>
```

### Sous-onglets par catégorie d'équipe

Regrouper les équipes par catégorie dans la barre de sélection :
```js
const grouped = TEAMS.reduce((acc, t) => {
  const cat = t.category  // 'Séniors', 'U13', 'U9', 'Vétérans'...
  if (!acc[cat]) acc[cat] = []
  acc[cat].push(t)
  return acc
}, {})
// Afficher : [Séniors] [U13] [U9] [Vétérans]
// Chaque bouton = une équipe, regroupées par catégorie si plusieurs équipes dans la même catégorie
```

---

## MembersPage.jsx

### Président : tous les membres (président + coachs + joueurs)
### Coach : uniquement les joueurs de ses équipes

```jsx
const visibleUsers = USERS.filter(u => {
  // Coach : uniquement ses joueurs
  if (is('coach')) {
    if (u.role !== 'player') return false
    if (!u.teamIds?.some(t => currentUser.teamIds.includes(t))) return false
  }
  const matchSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  const matchTeam   = !teamFilter || u.teamIds?.includes(teamFilter)
  const matchLic    = !licFilter  || u.licenseStatus === licFilter
  return matchSearch && matchTeam && matchLic
})
```

**Colonnes :** Membre (avatar + nom + poste) · Équipe · Rôle · Licence  
**Clic ligne → `/app/profile/:id`**  
**Pas de stats dans cette liste.**

---

## ProfilePage.jsx

**Routes :** `/app/profile` (soi-même) et `/app/profile/:id` (autre membre)

**Accès :**
- Président : tout le monde
- Coach : ses joueurs uniquement
- Joueur/Supporter : soi-même uniquement (`/app/profile` sans `:id`)

**Contenu :**
```jsx
// Infos personnelles — toujours affichées
<Avatar size="xl" />
<h1>{firstName} {lastName}</h1>
<RoleBadge />
{position && <span>{position} · N°{jerseyNumber}</span>}

// Section "Informations"
<Field label="Date de naissance"
  value={`${format(new Date(birthDate), 'd MMMM yyyy', { locale: fr })} (${differenceInYears(new Date(), new Date(birthDate))} ans)`} />
<Field label="Lieu de naissance" value={birthPlace ?? 'Non renseigné'} />
<Field label="Email"    value={email} />
<Field label="Téléphone" value={phone} />

// Section "Licence" — président et coach uniquement
{isOneOf('president','coach') && (
  <section>
    <LicenseBadge status={licenseStatus} />
    <Field label="Numéro"     value="FFF-93-004521" />
    <Field label="Saison"     value="2024-2025" />
    <Field label="Expiration" value="30/06/2025" />
  </section>
)}

// Onglet "Documents" — président et coach uniquement
{isOneOf('president','coach') && (
  <div>
    {Object.entries(user.documents ?? {}).map(([key, doc]) => (
      doc.uploaded
        ? <a key={key} href={doc.url} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 p-3 rounded-xl border hover:bg-surface-50">
            <FileText size={16} className="text-red-500" />
            <span className="text-sm font-medium">{docLabels[key]}</span>
            <ExternalLink size={12} className="text-gray-400 ml-auto" />
          </a>
        : <div key={key} className="flex items-center gap-2 p-3 rounded-xl border border-dashed text-gray-400">
            <FileX size={16} />
            <span className="text-sm">{docLabels[key]} — manquant</span>
          </div>
    ))}
  </div>
)}

const docLabels = {
  license:     'Licence PDF',
  medicalCert: 'Certificat médical',
  photo:       'Photo d\'identité',
}
```

---

## MatchPage.jsx — /app/matches/:id

### Hero (toujours visible par tous)

```jsx
<div>
  <div>{getTeamById(match.teamId)?.name} vs {match.opponentName}</div>
  {match.status === 'played'
    ? <div className="text-4xl font-bold">{match.scoreHome} — {match.scoreAway}</div>
    : <div className="text-lg text-gray-500">À venir</div>
  }
  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
    <div>📅 {format(match.scheduledAt, "EEE d MMM yyyy · HH'h'mm", { locale: fr })}</div>
    <div>📍 {match.location}</div>
    <div>🏷 {getTeamById(match.teamId)?.category}</div>
    <div>🟨 {match.referee ?? 'Arbitre non renseigné'}</div>
    <div>{match.isHome ? '🏠 Domicile' : '🚌 Déplacement'}</div>
  </div>
</div>
```

### Onglets selon rôle

```js
const tabs = [
  {
    id: 'summary',
    label: 'Résumé',
    show: true,
    // Avant match : info + bouton dispo (joueur) ou convocations (coach)
    // Après match : score + événements (buts, cartons)
  },
  {
    id: 'lineup',
    label: 'Composition',
    show: true,
    // Terrain visuel si compo publiée, sinon message
  },
  {
    id: 'carpool',
    label: 'Covoiturage',
    show: true,  // TOUT LE MONDE voit cet onglet
  },
  {
    id: 'squad',
    label: 'Convocations',
    show: isOneOf('president','coach') && canManageTeam(match.teamId),
  },
  {
    id: 'result',
    label: 'Saisir résultat',
    show: isOneOf('president','coach') && canManageTeam(match.teamId),
  },
  {
    id: 'ratings',
    label: 'Notation',
    show: is('player') && match.teamId && currentUser.teamIds?.includes(match.teamId),
    // Joueur de cette équipe : peut noter SI il a joué, peut voir SI il n'a pas joué
  },
].filter(t => t.show)
```

### Onglet Covoiturage (tous les rôles)

```jsx
// Liste des covoiturages proposés
{(match.carpool ?? []).map(cp => {
  const driver = getUserById(cp.userId)
  const taken = cp.takenBy?.length ?? 0
  const available = cp.seats - taken
  return (
    <Card key={cp.id} className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar user={driver} size="sm" />
        <div>
          <div className="font-semibold text-sm">{driver?.firstName} {driver?.lastName}</div>
          <div className="text-xs text-gray-500">Départ : {cp.departure} · {cp.time}</div>
        </div>
        <div className="ml-auto text-sm font-medium text-emerald-600">
          {available} place{available > 1 ? 's' : ''} dispo
        </div>
      </div>
      {available > 0 && cp.userId !== currentUser.id && (
        <button className="w-full text-sm py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100">
          Prendre une place
        </button>
      )}
    </Card>
  )
})}

// Bouton proposer un covoiturage
<button className="w-full py-3 border-2 border-dashed border-surface-300 rounded-2xl
                   text-sm text-gray-400 hover:border-brand-300 hover:text-brand-600">
  + Proposer un covoiturage
</button>
```

### Onglet Résumé — avant match

```jsx
{match.status === 'scheduled' && (
  <>
    {/* Joueur de cette équipe */}
    {is('player') && currentUser.teamIds?.includes(match.teamId) && (
      <div>
        <div className="text-sm text-gray-600 mb-3">Ma disponibilité :</div>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Disponible
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
            ✗ Indisponible
          </button>
        </div>
      </div>
    )}

    {/* Coach/Président de cette équipe */}
    {canManageTeam(match.teamId) && (
      <div>
        <div className="text-sm font-semibold mb-3">Réponses convocations</div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Object.values(match.squad ?? {}).filter(s => s === 'confirmed').length}
            </div>
            <div className="text-xs text-gray-400">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {Object.values(match.squad ?? {}).filter(s => s === 'absent').length}
            </div>
            <div className="text-xs text-gray-400">Indisponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {Object.values(match.squad ?? {}).filter(s => s === 'called').length}
            </div>
            <div className="text-xs text-gray-400">En attente</div>
          </div>
        </div>
      </div>
    )}
  </>
)}
```

### Onglet Résumé — après match

```jsx
{match.status === 'played' && (
  <div className="space-y-2">
    {(match.events ?? []).map((ev, i) => {
      const player = getUserById(ev.userId)
      const assist = getUserById(ev.assistUserId)
      return (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100">
          <span className="text-xs font-mono text-gray-400 w-8">{ev.minute}'</span>
          <span>{ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : '🟥'}</span>
          <span className="text-sm font-medium">{player?.lastName}</span>
          {assist && <span className="text-xs text-gray-400">(pass. {assist.lastName})</span>}
        </div>
      )
    })}
  </div>
)}
```

### Onglet Saisir résultat (coach/président uniquement)

```jsx
// Score
<div className="flex items-center gap-4">
  <input type="number" placeholder="0" className="w-20 text-center text-2xl font-bold" />
  <span className="text-2xl text-gray-400">—</span>
  <input type="number" placeholder="0" className="w-20 text-center text-2xl font-bold" />
</div>

// Ajouter événements
<button>+ But</button>
<button>+ Carton jaune</button>
<button>+ Carton rouge</button>

// Pour chaque événement ajouté : sélectionner le joueur + minute
<select>{players.map(p => <option key={p.id}>{p.firstName} {p.lastName}</option>)}</select>
<input type="number" placeholder="Minute" />

// Valider
<button className="btn-primary">Enregistrer le résultat</button>
```

### Onglet Notation (joueurs de cette équipe uniquement)

```jsx
// Règle : joueur de l'équipe concernée
// - A joué (squad[userId] === 'confirmed' et match joué) → peut noter ET voir
// - N'a pas joué → peut voir uniquement

const hasPlayed = match.status === 'played' && match.squad?.[currentUser.id] === 'confirmed'
const isTeamPlayer = is('player') && currentUser.teamIds?.includes(match.teamId)

{isTeamPlayer && match.status === 'played' && (
  <>
    {!hasPlayed && (
      <div className="text-sm text-gray-500 mb-4 p-3 bg-surface-50 rounded-xl">
        Vous n'avez pas joué ce match — vous pouvez consulter les notes mais pas noter.
      </div>
    )}

    {players
      .filter(p => p.id !== currentUser.id && match.squad?.[p.id] === 'confirmed')
      .map(p => (
        <div key={p.id} className="flex items-center gap-3 py-3 border-b border-surface-100">
          <Avatar user={p} size="md" />
          <span className="font-medium flex-1">{p.firstName} {p.lastName}</span>
          {hasPlayed ? (
            // Étoiles cliquables 1→10
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <button key={i} className="text-lg">
                  {i < (ratings[p.id] ?? 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          ) : (
            // Lecture seule
            <div className="text-sm text-gray-500">
              {ratings[p.id] ? `${ratings[p.id]}/10` : 'Pas encore noté'}
            </div>
          )}
        </div>
      ))}
  </>
)}
```

---

## CalendarPage.jsx

Affiche entraînements + matchs + événements ponctuels.

**Contenu par rôle :**
- Président : tout
- Coach : ses équipes (entraînements + matchs) + événements visibles
- Joueur : son équipe + événements visibles
- Supporter/Parent : matchs uniquement + événements club

Chaque item match dans le panel détail affiche : heure, terrain, catégorie, arbitre + lien "Voir la fiche →".

---

## MessagesPage.jsx

**Supporter :** voit uniquement les conversations `custom` et `direct` dont il est membre.  
Ne voit pas `team_chat` ni `coach_channel`.  
Peut créer une nouvelle discussion.

**Joueur, Coach, Président :** voient leurs conversations habituelles.

**Coach_channel :** joueurs en lecture seule.

```jsx
const isReadOnly = conv.type === 'coach_channel' && is('player')
```

---

## LoginPage.jsx

Layout 2 colonnes : gauche `bg-brand-950` avec logo + tagline, droite formulaire.

```jsx
<details className="mt-4 border rounded-xl p-3">
  <summary className="text-xs text-gray-400 cursor-pointer">Connexion rapide (dev)</summary>
  {USERS.map(u => (
    <button key={u.id} onClick={() => { login(u.id); navigate('/app/events') }}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-100 text-sm">
      <Avatar user={u} size="sm" />
      {u.firstName} {u.lastName} — <RoleBadge role={u.role} />
    </button>
  ))}
</details>
```

---

## RegisterPage.jsx

3 étapes : `['Votre club', 'Vos infos', 'Votre rôle']`

```jsx
const validationInfo = {
  supporter: { icon: '⚡', title: 'Accès immédiat',       desc: 'Compte créé instantanément.' },
  coach:     { icon: '⏳', title: 'Validation président', desc: 'Le président reçoit un email.' },
  player:    { icon: '⏳', title: 'Validation coach',     desc: 'Le coach de ton équipe reçoit un email.' },
}

{selectedRole === 'player' && (
  <select>{TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
)}
```

---

## App.jsx

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
4. **date-fns + locale fr** : `format(date, "EEE d MMM · HH'h'mm", { locale: fr })`
5. **differenceInYears** de date-fns pour calculer l'âge
6. **lucide-react** pour toutes les icônes
7. **Pas d'API calls** — uniquement `src/data/mock.js`

---

## Ordre de priorité

1. **mock.js** — mettre à jour avec category sur EVENTS, carpool sur MATCHES, birthPlace + documents sur USERS
2. **EventsPage.jsx** — refaire avec 3 onglets Club/Équipe/Matchs + vue détail événement
3. **TeamPage.jsx** — refaire avec barre équipes + onglets Équipe/Joueurs&Staff
4. **AppLayout.jsx** — sidebar rétractable + nav par rôle
5. **App.jsx** — routes complètes
6. **MembersPage.jsx**
7. **ProfilePage.jsx**
8. **MatchPage.jsx** — avec onglet covoiturage + notation
9. **CalendarPage.jsx**
10. **MessagesPage.jsx**
11. **LoginPage.jsx**
12. **RegisterPage.jsx**