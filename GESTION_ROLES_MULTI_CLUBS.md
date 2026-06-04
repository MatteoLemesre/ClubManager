# ClubManager — Gestion des rôles et multi-clubs

Structure complète pour gérer plusieurs rôles et clubs simultanément.

---

## 1. NOUVEAU SYSTÈME DE RÔLES

### 5 rôles possibles (renommés)

```
1. 👔 Président
2. 👔 Intendant (NEW - mêmes droits que président)
3. 👨‍🏫 Coach
4. ⚽ Joueur
5. 👥 Communauté (RENOMMÉ de "supporter")
```

**"Communauté" = personnes sans club actuel** (ancien joueur, fan, sympathisant)

---

## 2. STRUCTURE DE DONNÉES UTILISATEUR

### Schema user enrichi

```js
const mockUsers = [
  {
    id: 'user-1',
    first_name: 'Karim',
    last_name: 'Diallo',
    email: 'karim@test.fr',
    
    // ⭐ NEW : Rôles multiples
    roles: [
      {
        role: 'player',
        club_id: 'club-1',
        teams: ['team-1', 'team-2'], // Joueur dans 2 équipes du même club
      },
      {
        role: 'coach',
        club_id: 'club-2',
        teams: ['team-5'], // Coach d'une équipe dans autre club
      },
    ],
    
    // Clubs suivis (en plus des clubs où il a un rôle)
    followed_clubs: ['club-3', 'club-4'],
    followed_teams: ['team-10'],
    
    // Pour compatibilité : déduire du premier rôle
    current_role: 'player', // player (priorité joueur > coach > président > intendant > communauté)
    current_club_id: 'club-1', // club du rôle principal
    teams: ['team-1', 'team-2'], // teams du rôle principal
    
    // Profil
    bio: 'Passionné de foot...',
    photo: null,
    
    // Historique éditable
    experiences: [/* ExperienceModal data */],
  },
  
  // Exemple 2 : Président de 2 clubs
  {
    id: 'pres-1',
    first_name: 'Jean',
    last_name: 'Dupont',
    roles: [
      {
        role: 'president',
        club_id: 'club-1',
      },
      {
        role: 'president',
        club_id: 'club-2',
      },
    ],
    current_role: 'president',
    current_club_id: 'club-1', // Par défaut le premier
  },
  
  // Exemple 3 : Intendant + Joueur
  {
    id: 'user-3',
    first_name: 'Sophie',
    last_name: 'Martin',
    roles: [
      {
        role: 'staff', // Intendant
        club_id: 'club-1',
      },
      {
        role: 'player',
        club_id: 'club-1',
        teams: ['team-3'],
      },
    ],
    current_role: 'player', // Joueur est prioritaire
    current_club_id: 'club-1',
    teams: ['team-3'],
  },
  
  // Exemple 4 : Communauté (ancien joueur)
  {
    id: 'user-4',
    first_name: 'Alice',
    last_name: 'Lemoine',
    roles: [
      {
        role: 'community', // RENOMMÉ de 'supporter'
        club_id: null, // Pas de club actuel
      },
    ],
    current_role: 'community',
    current_club_id: null,
    followed_clubs: ['club-1', 'club-2'],
  },
]
```

---

## 3. LOGIQUE DE PRIORITÉ DE RÔLE

Quand un user a plusieurs rôles, le `current_role` est déterminé par cette priorité :

```
1. Joueur ⚽ (plus haut niveau)
2. Coach 👨‍🏫
3. Président 👔
4. Intendant 👔
5. Communauté 👥 (plus bas niveau)
```

```jsx
function getCurrentRole(roles) {
  const priority = {
    'player': 1,
    'coach': 2,
    'president': 3,
    'staff': 4, // Intendant
    'community': 5,
  }
  
  return roles.sort((a, b) => priority[a.role] - priority[b.role])[0]
}
```

---

## 4. ACCÈS AU DASHBOARD PRÉSIDENT/INTENDANT

### Page "/app/president" : accès aux deux rôles

```jsx
// Guard
export default function PresidentPage() {
  const { currentUser } = useAuth()
  
  const canAccessDashboard = currentUser.roles.some(r => 
    r.role === 'president' || r.role === 'staff'
  )
  
  if (!canAccessDashboard) {
    return <AccessDenied />
  }
  
  // Clubs où l'user est président OU intendant
  const myClubs = mockClubs.filter(c =>
    currentUser.roles.some(r =>
      (r.role === 'president' || r.role === 'staff') && r.club_id === c.id
    )
  )
  
  return (
    <div>
      <h1>👔 Mes clubs {myClubs.length > 1 && `(${myClubs.length})`}</h1>
      {/* Reste du dashboard */}
    </div>
  )
}
```

---

## 5. ONGLET CLUB - DESIGN NOUVEAU

### En haut : pas de nom du club, nouveau logo

```
┌────────────────────────────────────────────────┐
│  👔 MES CLUBS                                  │
├────────────────────────────────────────────────┤
│                                                │
│  Sélectionner un club :                        │
│                                                │
│  [⚽ FC Lens]  [🏆 AS Saint-Denis]  [🔵 OL]   │
│                                                │
│  13 alertes                                    │
│                                                │
└────────────────────────────────────────────────┘
```

**Nouveau design boutons clubs :**
```jsx
<button
  onClick={() => setSelectedClubId(club.id)}
  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
    isActive
      ? 'bg-brand-600 text-white shadow-lg'
      : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300'
  }`}>
  
  {/* Emoji logo du club (personnalisable) */}
  <span className="text-2xl">
    {club.emoji_icon || '⚽'}
  </span>
  
  {/* Nom du club */}
  <div className="flex-1 text-left">
    <div className="font-semibold">{club.name}</div>
  </div>
  
  {/* Badge alertes */}
  {clubAlertCount > 0 && (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
      isActive
        ? 'bg-white text-brand-600'
        : 'bg-red-100 text-red-700'
    }`}>
      {clubAlertCount}
    </span>
  )}
</button>
```

**Ajouter à mockClubs :**
```js
const mockClubs = [
  {
    id: 'club-1',
    name: 'FC Lens Académie',
    emoji_icon: '⚽', // Nouveau champ
    city: 'Lens',
    // ...
  },
  {
    id: 'club-2',
    name: 'AS Saint-Denis',
    emoji_icon: '🏆',
    city: 'Saint-Denis',
  },
  {
    id: 'club-3',
    name: 'OL Amateur',
    emoji_icon: '🔵',
    city: 'Lyon',
  },
]
```

---

## 6. RÔLES MULTIPLES DANS LA MÊME PAGE

### Affichage "Vos rôles"

Dans ProfilePage, ajouter section :

```jsx
function RolesSection({ currentUser }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">👔 Vos rôles</h2>
      
      <div className="space-y-2">
        {currentUser.roles.map((r, idx) => {
          const club = mockClubs.find(c => c.id === r.club_id)
          const roleIcon = {
            'president': '👔',
            'staff': '🏥',
            'coach': '👨‍🏫',
            'player': '⚽',
            'community': '👥',
          }[r.role]
          
          const roleLabel = {
            'president': 'Président',
            'staff': 'Intendant',
            'coach': 'Coach',
            'player': 'Joueur',
            'community': 'Communauté',
          }[r.role]

          return (
            <div
              key={idx}
              className="p-3 bg-surface-50 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {roleIcon} {roleLabel}
                </div>
                {club && (
                  <div className="text-sm text-gray-600">
                    {club.name}
                    {r.teams?.length > 0 && (
                      <span> · {r.teams.map(tId => 
                        mockTeams.find(t => t.id === tId)?.name
                      ).join(', ')}</span>
                    )}
                  </div>
                )}
              </div>
              
              {r.role === 'player' && r.teams?.[0] && (
                <button
                  onClick={() => navigate(`/app/teams/${r.teams[0]}`)}
                  className="text-sm text-brand-600 hover:underline">
                  Équipe →
                </button>
              )}
            </div>
          )
        })}
      </div>

      {currentUser.roles.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
          ℹ️ Votre rôle principal est <strong>{getRoleLabel(currentUser.current_role)}</strong>. 
          Vous pouvez basculer vers vos autres rôles dans vos paramètres.
        </div>
      )}
    </div>
  )
}
```

---

## 7. RENAMING "SUPPORTER" → "COMMUNAUTÉ"

**Partout dans le code :**

```
AVANT : role === 'supporter'
APRÈS : role === 'community'

AVANT : "Supporter"
APRÈS : "Communauté"
```

**Exemples :**

```jsx
// Calendrier
if (currentUser.role === 'community') {
  // Voir uniquement matchs clubs suivis + événements publics
}

// Feed
if (currentUser.role === 'community') {
  // Voir uniquement posts publics
}

// ProfilePage
const roles = [
  { value: 'player', label: '⚽ Joueur' },
  { value: 'coach', label: '👨‍🏫 Coach' },
  { value: 'president', label: '👔 Président' },
  { value: 'staff', label: '🏥 Intendant' },
  { value: 'community', label: '👥 Communauté' },
]
```

---

## 8. FONCTION HELPER

```jsx
function getUserRole(user, clubId) {
  // Récupérer le rôle de l'user pour un club spécifique
  return user.roles.find(r => r.club_id === clubId)
}

function getUserClubs(user) {
  // Récupérer tous les clubs où l'user a un rôle
  return [...new Set(user.roles.map(r => r.club_id))].map(cId =>
    mockClubs.find(c => c.id === cId)
  )
}

function canAccessPresident(user) {
  // Check si user peut accéder dashboard président/intendant
  return user.roles.some(r => r.role === 'president' || r.role === 'staff')
}

function getRoleLabel(role) {
  return {
    'player': 'Joueur',
    'coach': 'Coach',
    'president': 'Président',
    'staff': 'Intendant',
    'community': 'Communauté',
  }[role] || role
}
```

---

## 9. MIGRATION MOCK DATA

**AVANT :**
```js
{
  id: 'user-1',
  role: 'player',
  current_club_id: 'club-1',
  teams: ['team-1'],
}
```

**APRÈS :**
```js
{
  id: 'user-1',
  roles: [
    { role: 'player', club_id: 'club-1', teams: ['team-1'] }
  ],
  current_role: 'player',
  current_club_id: 'club-1',
  teams: ['team-1'],
}
```

---

## RÉSUMÉ

1. ✅ **5 rôles** : Joueur, Coach, Président, Intendant (NEW), Communauté (renommé)
2. ✅ **Rôles multiples** : Un user peut avoir plusieurs rôles dans plusieurs clubs
3. ✅ **Structure roles** : Array de rôles avec club_id et teams
4. ✅ **Dashboard Président** → accessible Président ET Intendant
5. ✅ **Page "Mes clubs"** : pas de nom club en haut, nouveau design avec emojis
6. ✅ **Supporter → Communauté** : partout
7. ✅ **Helper functions** : gérer rôles multiples facilement

---

## POUR CLAUDE CODE

```
Implémenter GESTION_ROLES_MULTI_CLUBS.md :

1. Modifier structure mockUsers avec roles array
2. Renommer 'supporter' → 'community' partout
3. Ajouter rôle 'staff' (Intendant) avec mêmes droits président
4. Implémenter helper functions
5. Mettre à jour PresidentPage pour "Mes clubs"
6. Nouveau design boutons clubs avec emoji icons
7. RolesSection dans ProfilePage
8. Guard PresidentPage : president OR staff

Gestion complète rôles multiples et multi-clubs ✅
```
