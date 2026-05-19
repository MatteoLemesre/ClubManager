# ClubManager — Refonte complète navigation et visibilité

Corrections majeures de la logique de suivi et fusion Calendrier/Événements.

---

## 1. SUIVI CLUBS/ÉQUIPES — Nouvelle logique

### Règle fondamentale
**On peut suivre :**
- Des clubs entiers (= tous leurs matchs + feed complet)
- Des équipes spécifiques (= matchs de ces équipes uniquement + feed complet du club parent)
- Plusieurs clubs + plusieurs équipes de plusieurs clubs différents
- **Tous les rôles** (supporter, joueur, coach, président) ont les mêmes capacités de suivi

### Différence club vs équipe

| Je suis | Je veux voir | J'active |
|---------|--------------|----------|
| Fan de TOUT le club | Tous les matchs de toutes les équipes + feed | Suivre le club |
| Fan de 2 équipes précises | Matchs de ces 2 équipes uniquement + feed du club | Suivre les 2 équipes |

### Accès au feed
**Règle :** Si je suis **au moins une équipe** d'un club (ou le club entier), j'ai accès à **tout le feed du club**.

Pas de distinction — le feed est au niveau club, pas équipe.

### Accès aux matchs à venir
**Règle :**
- Je suis **le club** → tous les matchs de toutes ses équipes
- Je suis **2 équipes** → matchs de ces 2 équipes uniquement
- Je suis **3 clubs + 5 équipes d'autres clubs** → matchs de tous

---

## 2. PAGE ÉQUIPES — 2 onglets simplifiés

### Onglet "Mes équipes"

**Pour TOUS les rôles (supporter inclus)**

Structure visuelle :
```
┌────────────────────────────────────────────┐
│  MES ÉQUIPES                               │
├────────────────────────────────────────────┤
│  (si joueur/coach/président)               │
│  🏆 MON CLUB                               │
│  FC Lens Académie                          │
│  [Carte club avec badge "Membre"]         │
│                                            │
│  Mes équipes dans ce club :                │
│  • Séniors A (Joueur)                     │
│  • U17 (Coach)                            │
│                                            │
├────────────────────────────────────────────┤
│  ⭐ CLUBS SUIVIS                           │
│  AS Saint-Denis United                     │
│  [Carte club]                              │
│  📊 Toutes les équipes (5)                │
│                                            │
│  Olympique Lyonnais Amateur               │
│  [Carte club]                              │
│  📊 Équipes suivies : Séniors A, U19      │
└────────────────────────────────────────────┘
```

**Affichage :**
1. **Si membre d'un club** (joueur/coach/président) :
   - Section "MON CLUB" en haut avec badge "Membre"
   - Liste des équipes dans lesquelles on est impliqué
   - Puis section "CLUBS SUIVIS" en dessous

2. **Si supporter uniquement** :
   - Pas de section "MON CLUB"
   - Directement la liste "CLUBS SUIVIS" (mais SANS le titre "Clubs suivis")
   - Visuellement identique, juste pas de distinction

**Carte club :**
- Avatar club + nom + ville
- Badge si membre ("Membre" ou "Président" ou "Coach" ou "Joueur")
- Indication : "Toutes les équipes (5)" OU "Équipes suivies : U13, U17"
- Bouton "⭐ Suivi" (rempli) ou "+ Suivre"
- Clic carte → pop-up présentation club

### Onglet "Explorer"

**Pour tous les rôles**

Recherche de clubs avec filtres région/département + nom.

Résultats sous forme de cartes → clic carte → pop-up club.

Dans le pop-up club, onglet Équipes :
- Bouton "+ Suivre le club entier" (étoile)
- Liste équipes avec bouton "⭐ Suivre" individuel par équipe

**Comportement suivi :**
- Suivre club entier → coche toutes les équipes automatiquement
- Suivre 2 équipes → seules ces 2 équipes cochées
- Décocher toutes équipes → décoche le club entier

---

## 3. PAGE MATCHS À VENIR — Filtre intelligent

### Route : `/app/matches` (renommer depuis /app/calendar)

**Contenu :**
Liste de TOUS les matchs à venir des clubs/équipes suivis.

**Filtrage selon le suivi :**
```js
const upcomingMatches = mockMatches.filter(match => {
  // Si je suis le club entier → tous ses matchs
  if (user.followed_clubs.includes(match.team.club_id)) {
    return true
  }
  
  // Si je suis des équipes spécifiques → matchs de ces équipes
  if (user.followed_teams.includes(match.team_id)) {
    return true
  }
  
  return false
})
```

**Affichage :**
```
┌────────────────────────────────────────────┐
│  ⚽ MATCHS À VENIR                         │
│                                            │
│  Filtrer par club                         │
│  [Tous] [FC Lens] [AS Saint-Denis] ...   │
│                                            │
├────────────────────────────────────────────┤
│  Samedi 22 Mai · 15h00                    │
│  🏟️ Stade Bollaert (Domicile)            │
│                                            │
│  FC Lens — Séniors A                      │
│  vs FC Valenciennes                       │
│                                            │
│  🚗 3 covoiturages disponibles            │
│  [Voir les détails]                       │
│                                            │
├────────────────────────────────────────────┤
│  Dimanche 23 Mai · 14h00                  │
│  🏟️ Stade Bauer (Déplacement)            │
│                                            │
│  AS Saint-Denis — U17                     │
│  vs Red Star FC                           │
│                                            │
│  🚗 1 covoiturage disponible              │
│  [Voir les détails]                       │
└────────────────────────────────────────────┘
```

Clic "Voir les détails" → page `/app/matches/:matchId` complète.

---

## 4. PAGE MATCH DÉTAILLÉ — Section covoiturage

### Route : `/app/matches/:matchId`

**Accessible depuis :**
- Page "Matchs à venir"
- Page détail équipe, onglet Matchs
- Notification

**Sections :**
1. Header (équipes, date, lieu, score si joué)
2. Disponibilités (si joueur de l'équipe)
3. **Covoiturages** (NOUVEAU)
4. Composition (si match joué)
5. Événements (buts, cartons)
6. Noter coéquipiers (si joueur + match joué)

### Section Covoiturages

```
┌────────────────────────────────────────────┐
│  🚗 COVOITURAGES (3)                      │
│                                            │
│  Sophie Durand propose 3 places           │
│  📍 Départ Lens centre · 13h30            │
│  💬 "Je passe par Liévin"                 │
│  [Contacter]                               │
│                                            │
│  Jean Martin cherche 1 place              │
│  📍 Depuis Hénin-Beaumont                 │
│  [Contacter]                               │
│                                            │
│  [+ Proposer un covoiturage]              │
└────────────────────────────────────────────┘
```

**Clic "+ Proposer un covoiturage" → Modal :**
```
┌────────────────────────────────────────────┐
│  Proposer un covoiturage               [✕] │
├────────────────────────────────────────────┤
│  Type                                      │
│  ( ) Je propose des places                │
│  ( ) Je cherche des places                │
│                                            │
│  Nombre de places *                       │
│  [  3  ]                                  │
│                                            │
│  Point de départ *                        │
│  [Lens centre-ville          ]            │
│                                            │
│  Heure de départ *                        │
│  [13:30]                                  │
│                                            │
│  Message (optionnel)                      │
│  [Je passe par Liévin si besoin...]      │
│                                            │
│  [Annuler]  [Publier]                    │
└────────────────────────────────────────────┘
```

**Stockage :**
Les covoiturages sont des événements avec `type = 'carpool'` + `match_id` référencé.

---

## 5. FUSION CALENDRIER + ÉVÉNEMENTS

### Nouvelle page : `/app/calendar`

**Layout :**
```
┌──────────────────────────────────────────────────────┐
│  📅 CALENDRIER & ÉVÉNEMENTS                          │
├────────────────┬─────────────────────────────────────┤
│                │                                     │
│                │  📌 PROCHAINS ÉVÉNEMENTS            │
│                │                                     │
│  [Calendrier]  │  Dim 23 Mai · 14h00                │
│  [mensuel]     │  🎉 Repas de fin de saison         │
│  [avec]        │  Club house                        │
│  [pastilles]   │  [Voir]                            │
│  [colorées]    │                                     │
│                │  Mar 25 Mai · 19h00                │
│                │  📋 Réunion coachs                 │
│                │  Salle de réunion                  │
│                │  [Voir]                            │
│                │                                     │
│                │  Sam 29 Mai · 10h00                │
│                │  ⚽ Tournoi U13                     │
│                │  Stade annexe                      │
│                │  [Voir]                            │
│                │                                     │
│                │  [Voir tous les événements →]      │
└────────────────┴─────────────────────────────────────┘
```

**Colonne gauche — Calendrier mensuel (70%) :**
- Vue mois avec grille jours
- Pastilles colorées par type :
  - 🔴 Match
  - 🔵 Entraînement
  - 🟢 Événement club
  - 🟡 Événement équipe
  - 🟠 Réunion
- Clic sur un jour → filtre colonne droite sur ce jour
- Clic sur pastille → ouvre pop-up événement

**Colonne droite — Prochains événements (30%) :**
- Liste chronologique des 5-10 prochains événements
- Scroll si plus
- Bouton "Voir tous" → bascule en vue liste complète

**Vue liste complète (toggle) :**
Remplace le calendrier par une liste paginée avec filtres :
- Par type (match, entraînement, événement, réunion)
- Par équipe/club
- Par visibilité (public, équipe, club)

**Bouton "+ Créer un événement" :**
- Visible pour coach/président
- Modal création avec choix visibilité (public/équipe/club)

---

## 6. MOCK DATA MIS À JOUR

### User supporter Sophie

```js
const mockUsers = {
  supporter: {
    id: 'mock-user-2',
    role: 'supporter',
    first_name: 'Sophie',
    last_name: 'Durand',
    current_club_id: null,  // pas membre
    
    // Suit 2 clubs entiers + 2 équipes d'un 3ème club
    followed_clubs: ['mock-club-2', 'mock-club-3'],  // Saint-Denis + Lyon
    followed_teams: ['mock-team-bx-1', 'mock-team-bx-2'],  // Bordeaux Séniors A + B
    
    member_of_clubs: [],  // pas membre
    teams: [],  // pas dans d'équipe
  },
}
```

### Clubs et équipes

```js
const mockClubs = [
  { 
    id: 'mock-club-1', 
    name: 'FC Lens Académie', 
    city: 'Lens',
    teams: ['mock-team-lens-1', 'mock-team-lens-2', 'mock-team-lens-3'],
  },
  { 
    id: 'mock-club-2', 
    name: 'AS Saint-Denis United', 
    city: 'Saint-Denis',
    teams: ['mock-team-sd-1', 'mock-team-sd-2'],
  },
  { 
    id: 'mock-club-3', 
    name: 'Olympique Lyonnais Amateur', 
    city: 'Lyon',
    teams: ['mock-team-ol-1', 'mock-team-ol-2'],
  },
  { 
    id: 'mock-club-4', 
    name: 'SC Bordeaux Rive Droite', 
    city: 'Bordeaux',
    teams: ['mock-team-bx-1', 'mock-team-bx-2'],
  },
]
```

### Matchs à venir

```js
const mockUpcomingMatches = [
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
    carpools: 2,
  },
  {
    id: 'm2',
    team_id: 'mock-team-ol-1',
    team: { 
      id: 'mock-team-ol-1', 
      name: 'Séniors A', 
      club_id: 'mock-club-3',
      club: { name: 'Olympique Lyonnais Amateur' },
    },
    opponent: 'FC Villefranche',
    scheduled_at: '2026-05-23T14:00:00Z',
    location: 'Stade de Gerland',
    is_home: true,
    carpools: 0,
  },
  {
    id: 'm3',
    team_id: 'mock-team-bx-1',
    team: { 
      id: 'mock-team-bx-1', 
      name: 'Séniors A', 
      club_id: 'mock-club-4',
      club: { name: 'SC Bordeaux Rive Droite' },
    },
    opponent: 'FC Mérignac',
    scheduled_at: '2026-05-24T15:00:00Z',
    location: 'Stade Chaban-Delmas',
    is_home: true,
    carpools: 1,
  },
]

// Sophie voit m1 + m2 (clubs entiers) + m3 (équipe suivie)
```

### Événements

```js
const mockEvents = [
  {
    id: 'ev1',
    type: 'social',
    visibility: 'public',
    club_id: 'mock-club-2',
    title: 'Repas de fin de saison',
    starts_at: '2026-05-23T20:00:00Z',
    location: 'Club house',
    // Sophie voit (public + suit le club)
  },
  {
    id: 'ev2',
    type: 'team',
    visibility: 'team',
    club_id: 'mock-club-2',
    team_id: 'mock-team-sd-1',
    title: 'Sortie bowling équipe A',
    starts_at: '2026-05-25T18:00:00Z',
    // Sophie ne voit PAS (équipe interne, pas membre)
  },
  {
    id: 'ev3',
    type: 'meeting',
    visibility: 'club',
    club_id: 'mock-club-2',
    title: 'Réunion coachs',
    starts_at: '2026-05-25T19:00:00Z',
    // Sophie ne voit PAS (réunion, pas coach/président)
  },
]
```

### Covoiturages (type événement spécial)

```js
const mockCarpools = [
  {
    id: 'cp1',
    type: 'carpool',
    match_id: 'm1',
    author_id: 'mock-user-2',  // Sophie
    carpool_type: 'offer',  // 'offer' ou 'request'
    seats: 3,
    departure_location: 'Lens centre-ville',
    departure_time: '13:30',
    message: 'Je passe par Liévin si besoin',
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'cp2',
    type: 'carpool',
    match_id: 'm1',
    author_id: 'mock-user-3',  // Jean
    carpool_type: 'request',
    seats: 1,
    departure_location: 'Hénin-Beaumont',
    departure_time: null,
    message: null,
    created_at: '2026-05-21T14:00:00Z',
  },
]
```

---

## 7. NAVIGATION MIS À JOUR

### Nav principale

- Feed (📰)
- Équipes (⚽) — 2 onglets : Mes équipes / Explorer
- Matchs à venir (🏟️) — liste filtrée + détails match avec covoiturages
- Calendrier (📅) — vue mois + événements latéral
- Messagerie (💬)
- Profil (👤)

**Supprimé :**
- ❌ Page "Événements" standalone (fusionnée dans Calendrier)

---

## 8. ORDRE D'IMPLÉMENTATION

### Phase 1 — Logique suivi
1. Mock data : followed_clubs + followed_teams
2. TeamPage : 2 onglets simplifiés
3. Filtre matchs selon suivi

### Phase 2 — Matchs
1. Renommer /app/calendar → /app/matches
2. Liste matchs à venir avec filtres
3. Page détail match avec section covoiturages
4. Modal création covoiturage

### Phase 3 — Calendrier
1. Créer /app/calendar avec layout 70/30
2. Calendrier mensuel avec pastilles
3. Colonne événements latérale
4. Toggle vue liste complète

### Phase 4 — Feed
1. Charger posts de tous followed_clubs
2. Charger posts des clubs parents de followed_teams

---
