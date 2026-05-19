# ClubManager — Corrections sur REFONTE_COMPLETE

Modifications à appliquer sur le code déjà implémenté selon REFONTE_COMPLETE.md v1.

---

## CORRECTIONS À FAIRE

### 1. Supprimer la page "Matchs à venir" standalone

**Fichiers concernés :**
- `src/pages/app/MatchesPage.jsx` → À SUPPRIMER
- `src/App.jsx` → Supprimer la route `/app/matches` (liste)
- Navigation principale → Retirer l'onglet "Matchs à venir"

**Raison :** Les matchs sont maintenant intégrés dans le Calendrier.

---

### 2. Fusionner Matchs + Événements dans Calendrier

**Fichier : `src/pages/app/CalendarPage.jsx`**

#### Modifier le layout pour 70/30

**Avant (actuellement) :**
Probablement un calendrier seul ou avec événements séparés.

**Après :**
```jsx
<div className="flex gap-6 h-screen">
  {/* Colonne gauche 70% - Calendrier */}
  <div className="flex-[7] overflow-hidden">
    <CalendarMonthView 
      events={allEvents}  // matchs + entraînements + événements
      onClickMatch={(matchId) => navigate(`/app/matches/${matchId}`)}
      onClickEvent={(event) => setSelectedEvent(event)}
    />
  </div>

  {/* Colonne droite 30% - Liste prochains */}
  <div className="flex-[3] overflow-y-auto border-l border-surface-200 p-6">
    <h3 className="font-semibold text-gray-900 mb-4">📌 Prochains</h3>
    <div className="space-y-3">
      {upcomingItems.map(item => (
        <EventCard 
          key={item.id}
          item={item}
          onClick={() => {
            if (item.type === 'match') {
              navigate(`/app/matches/${item.id}`)
            } else {
              setSelectedEvent(item)
            }
          }}
        />
      ))}
    </div>
    <button className="mt-4 text-brand-600 text-sm font-medium">
      Voir tous les événements →
    </button>
  </div>
</div>
```

#### Fusionner les données

```js
const upcomingItems = useMemo(() => {
  const items = []
  
  // Ajouter les matchs filtrés
  const filteredMatches = mockUpcomingMatches.filter(match => {
    if (currentUser.followed_clubs?.includes(match.team.club_id)) return true
    if (currentUser.followed_teams?.includes(match.team_id)) return true
    return false
  }).map(m => ({ ...m, type: 'match' }))
  
  // Ajouter les entraînements
  const trainings = mockTrainings
    .filter(t => currentUser.teams?.includes(t.team_id))
    .map(t => ({ ...t, type: 'training' }))
  
  // Ajouter les événements filtrés selon visibilité
  const events = mockEvents
    .filter(e => canSeeEvent(e, currentUser))
    .map(e => ({ ...e, type: 'event' }))
  
  // Fusionner et trier par date
  items.push(...filteredMatches, ...trainings, ...events)
  items.sort((a, b) => new Date(a.starts_at || a.scheduled_at) - new Date(b.starts_at || b.scheduled_at))
  
  return items.slice(0, 10)  // 10 prochains
}, [currentUser])
```

#### Pastilles colorées sur le calendrier

```js
const getEventColor = (event) => {
  switch(event.type) {
    case 'match': return 'bg-red-500'
    case 'training': return 'bg-blue-500'
    case 'event':
      if (event.visibility === 'public') return 'bg-green-500'
      if (event.visibility === 'team') return 'bg-yellow-500'
      if (event.visibility === 'club') return 'bg-orange-500'
    default: return 'bg-gray-500'
  }
}

// Dans le calendrier, afficher les pastilles
{dayEvents.map(event => (
  <div 
    key={event.id}
    className={`w-2 h-2 rounded-full ${getEventColor(event)} cursor-pointer`}
    onClick={() => handleEventClick(event)}
  />
))}
```

---

### 3. Enrichir la page Match détaillé

**Fichier : `src/pages/app/MatchDetailPage.jsx`**

#### Ajouter les infos manquantes dans le header

```jsx
// Header actuel à enrichir
<div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6">
  <button onClick={() => navigate('/app/calendar')} className="text-sm text-gray-500 mb-4">
    ← Retour au calendrier
  </button>
  
  <div className="text-center">
    <div className="text-sm text-gray-400 mb-2">
      🏆 {match.category || 'Championnat Régional'} — J{match.round || '15'}
    </div>
    
    <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
      {match.team.club.name} — {match.team.name}
    </h1>
    <div className="text-xl text-gray-500 mb-1">vs</div>
    <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
      {match.opponent}
    </h2>
    
    {match.score && (
      <div className="text-3xl font-bold text-brand-600 mb-4">
        {match.score_home} - {match.score_away}
      </div>
    )}
    
    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
      <div>📅 {format(new Date(match.scheduled_at), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}</div>
      <div>🏟️ {match.location} — {match.is_home ? 'Domicile' : 'Extérieur'}</div>
      {match.referee && (
        <div>👨‍⚖️ Arbitre : {match.referee}</div>
      )}
    </div>
  </div>
</div>
```

#### Restructurer en 5 onglets internes

**Actuellement :** Probablement des sections empilées verticalement.

**Après :** Onglets horizontaux comme dans TeamDetailPage.

```jsx
const [activeTab, setActiveTab] = useState('disponibilites')

const tabs = [
  { id: 'disponibilites', label: 'Disponibilités', icon: '✋' },
  { id: 'composition', label: 'Composition', icon: '📋' },
  { id: 'covoiturages', label: 'Covoiturages', icon: '🚗' },
  { id: 'statistiques', label: 'Statistiques', icon: '📊' },
  { id: 'evenements', label: 'Événements', icon: '⏱️' },
]

// Onglets
<div className="flex border-b border-surface-200 mb-6">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        activeTab === tab.id
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}>
      {tab.icon} {tab.label}
    </button>
  ))}
</div>

// Contenu selon onglet actif
{activeTab === 'disponibilites' && <DisponibilitesSection match={match} />}
{activeTab === 'composition' && <CompositionSection match={match} />}
{activeTab === 'covoiturages' && <CovoituragesSection match={match} />}
{activeTab === 'statistiques' && <StatistiquesSection match={match} />}
{activeTab === 'evenements' && <EvenementsSection match={match} />}
```

#### Section Statistiques (nouvelle)

```jsx
function StatistiquesSection({ match }) {
  if (!match.stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <div className="text-sm">Statistiques disponibles après le match</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <StatBar label="Possession" home={match.stats.possession_home} away={match.stats.possession_away} />
      <StatRow label="Tirs" home={match.stats.shots_home} away={match.stats.shots_away} />
      <StatRow label="Tirs cadrés" home={match.stats.shots_on_target_home} away={match.stats.shots_on_target_away} />
      <StatRow label="Corners" home={match.stats.corners_home} away={match.stats.corners_away} />
      <StatRow label="Fautes" home={match.stats.fouls_home} away={match.stats.fouls_away} />
      <StatRow label="Cartons jaunes" home={match.stats.yellow_cards_home} away={match.stats.yellow_cards_away} />
      <StatRow label="Cartons rouges" home={match.stats.red_cards_home} away={match.stats.red_cards_away} />
    </div>
  )
}

function StatBar({ label, home, away }) {
  const total = home + away
  const homePercent = (home / total) * 100
  const awayPercent = (away / total) * 100
  
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold text-gray-900 w-12 text-right">{home}%</div>
        <div className="flex-1 h-6 bg-surface-100 rounded-full overflow-hidden flex">
          <div className="bg-brand-600 h-full" style={{ width: `${homePercent}%` }} />
          <div className="bg-gray-300 h-full" style={{ width: `${awayPercent}%` }} />
        </div>
        <div className="text-sm font-semibold text-gray-900 w-12 text-left">{away}%</div>
      </div>
    </div>
  )
}

function StatRow({ label, home, away }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-100">
      <div className="text-sm font-semibold text-gray-900 w-16 text-right">{home}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900 w-16 text-left">{away}</div>
    </div>
  )
}
```

---

### 4. Mock data à ajouter

**Fichier : `src/data/mockData.js`**

#### Ajouter catégorie, arbitre, stats aux matchs

```js
export const mockUpcomingMatches = [
  {
    id: 'm1',
    team_id: 'mock-team-sd-1',
    team: { 
      id: 'mock-team-sd-1', 
      name: 'Séniors A', 
      club_id: 'mock-club-2',
      club: { name: 'AS Saint-Denis United' },
    },
    opponent: 'Red Star FC',
    scheduled_at: '2026-05-22T15:00:00Z',
    location: 'Stade Bauer',
    is_home: false,
    category: 'Championnat Régional',  // AJOUT
    round: 15,  // AJOUT
    referee: 'M. Jean Dupont',  // AJOUT
    carpools: 2,
  },
  // ... autres matchs
]

export const mockPastMatches = [
  {
    id: 'm-past-1',
    team_id: 'mock-team-sd-1',
    team: { 
      id: 'mock-team-sd-1', 
      name: 'Séniors A', 
      club_id: 'mock-club-2',
      club: { name: 'AS Saint-Denis United' },
    },
    opponent: 'RC Arras',
    scheduled_at: '2026-05-15T15:00:00Z',
    location: 'Stade Bollaert',
    is_home: true,
    category: 'Championnat Régional',
    round: 14,
    referee: 'M. Pierre Martin',
    score_home: 3,
    score_away: 1,
    stats: {  // AJOUT
      possession_home: 58,
      possession_away: 42,
      shots_home: 14,
      shots_away: 8,
      shots_on_target_home: 7,
      shots_on_target_away: 3,
      corners_home: 6,
      corners_away: 2,
      fouls_home: 12,
      fouls_away: 15,
      yellow_cards_home: 1,
      yellow_cards_away: 2,
      red_cards_home: 0,
      red_cards_away: 0,
    },
    events: [  // Événements du match
      {
        minute: 23,
        type: 'goal',
        player: 'Karim Diallo',
        assist: 'Nolan Garcia',
      },
      {
        minute: 45,
        type: 'yellow_card',
        player: 'Lucas Simon',
        reason: 'Faute tactique',
      },
      {
        minute: 56,
        type: 'goal',
        player: 'Nolan Garcia',
      },
      {
        minute: 67,
        type: 'substitution',
        player_out: 'Mehdi Bensaid',
        player_in: 'Adam Traoré',
      },
      {
        minute: 78,
        type: 'goal',
        player: 'Karim Diallo',
        detail: 'Penalty',
        earned_by: 'Noah Lecomte',
      },
    ],
  },
]
```

---

### 5. Navigation — Supprimer onglet Matchs

**Fichier : `src/components/layout/AppLayout.jsx`**

**Avant (5 ou 6 onglets) :**
- Feed
- Équipes
- Matchs à venir  ← À SUPPRIMER
- Calendrier
- Messagerie
- Profil

**Après (5 onglets) :**
- Feed
- Équipes
- Calendrier  ← Contient maintenant les matchs
- Messagerie
- Profil

```jsx
const navItems = [
  { path: '/app/feed', icon: Newspaper, label: 'Feed' },
  { path: '/app/team', icon: Shield, label: 'Équipes' },
  { path: '/app/calendar', icon: Calendar, label: 'Calendrier' },
  { path: '/app/messages', icon: MessageCircle, label: 'Messagerie' },
  { path: '/app/profile', icon: User, label: 'Profil' },
]
```

---

## RÉSUMÉ DES CHANGEMENTS

✅ **Supprimer** la page `/app/matches` (liste)  
✅ **Fusionner** matchs + événements dans `/app/calendar` (layout 70/30)  
✅ **Enrichir** page match détaillé (catégorie, arbitre, 5 onglets)  
✅ **Ajouter** onglet Statistiques dans page match  
✅ **Simplifier** navigation (5 onglets au lieu de 6)

---
