# ClubManager — Support Multi-Sports (5 sports)

Ajouter 4 nouveaux sports + interfaces complètes pour tous les rôles/sports.

---

## 1. SPORTS SUPPORTÉS

```js
const SPORTS = {
  'football': {
    name: 'Football',
    icon: '⚽',
    positions: ['Gardien', 'Défenseur', 'Latéral', 'Milieu', 'Ailier', 'Attaquant'],
  },
  'basketball': {
    name: 'Basketball',
    icon: '🏀',
    positions: ['Meneur de jeu', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'],
  },
  'rugby': {
    name: 'Rugby',
    icon: '🏉',
    positions: ['Pilier', 'Talonneur', 'Deuxième ligne', 'Troisième ligne aile', 'Troisième ligne centre', 'Demi de mêlée', 'Demi d\'ouverture', 'Centre', 'Ailier', 'Arrière'],
  },
  'handball': {
    name: 'Handball',
    icon: '🤾',
    positions: ['Gardien', 'Pivot', 'Ailier gauche', 'Ailier droit', 'Arrière gauche', 'Arrière centre', 'Arrière droit'],
  },
  'volleyball': {
    name: 'Volleyball',
    icon: '🏐',
    positions: ['Passeur', 'Opposant', 'Réceptionneur-attaquant', 'Centrale', 'Libéro'],
  },
}
```

---

## 2. STRUCTURE CLUBS ET ÉQUIPES

### Club avec sport

```js
const mockClubs = [
  {
    id: 'club-foot-1',
    name: 'FC Lens Académie',
    sport: 'football',
    emoji_icon: '⚽',
    city: 'Lens',
    department: 'Pas-de-Calais',
    created_at: '2020-01-01',
  },
  {
    id: 'club-basket-1',
    name: 'Lens Basket Club',
    sport: 'basketball',
    emoji_icon: '🏀',
    city: 'Lens',
    department: 'Pas-de-Calais',
    created_at: '2019-06-15',
  },
  {
    id: 'club-rugby-1',
    name: 'AS Liévin Rugby',
    sport: 'rugby',
    emoji_icon: '🏉',
    city: 'Liévin',
    department: 'Pas-de-Calais',
  },
  {
    id: 'club-handball-1',
    name: 'Saint-Denis Handball',
    sport: 'handball',
    emoji_icon: '🤾',
    city: 'Saint-Denis',
    department: 'Seine-Saint-Denis',
  },
  {
    id: 'club-volley-1',
    name: 'OL Volley',
    sport: 'volleyball',
    emoji_icon: '🏐',
    city: 'Lyon',
    department: 'Rhône',
  },
]
```

### Équipe avec sport hérité du club

```js
const mockTeams = [
  {
    id: 'team-foot-1',
    name: 'Séniors A',
    club_id: 'club-foot-1',
    sport: 'football', // Hérité du club
    category: 'Séniors',
  },
  {
    id: 'team-basket-1',
    name: 'Séniors Hommes',
    club_id: 'club-basket-1',
    sport: 'basketball',
    category: 'Séniors',
  },
  {
    id: 'team-volley-1',
    name: 'Séniors Femmes',
    club_id: 'club-volley-1',
    sport: 'volleyball',
    category: 'Séniors',
  },
]
```

---

## 3. USERS AVEC RÔLES MULTI-SPORTS

### Exemple 1 : Dupont (Président foot + Joueur volley)

```js
{
  id: 'user-dupont',
  first_name: 'Jean',
  last_name: 'Dupont',
  bio: 'Président du FC Lens et joueur de volleyball',
  
  roles: [
    {
      id: 'role-dupont-pres-foot',
      role: 'president',
      sport: 'football',
      club_id: 'club-foot-1',
      club_name: 'FC Lens Académie',
    },
    {
      id: 'role-dupont-player-volley',
      role: 'player',
      sport: 'volleyball',
      club_id: 'club-volley-1',
      club_name: 'OL Volley',
      teams: ['team-volley-1'],
      position: 'Centrale',
      jersey_number: 12,
    },
  ],
  
  followed_clubs: [
    { club_id: 'club-basket-1', sport: 'basketball' },
    { club_id: 'club-rugby-1', sport: 'rugby' },
  ],
  followed_teams: [
    { team_id: 'team-basket-1', sport: 'basketball' },
  ],
  
  current_role_id: 'role-dupont-pres-foot',
  current_role: 'president',
  current_sport: 'football',
  current_club_id: 'club-foot-1',
}
```

### Exemple 2 : Sophie (Coach basket + Joueuse handball)

```js
{
  id: 'user-sophie',
  first_name: 'Sophie',
  last_name: 'Martin',
  bio: 'Coach basketball et joueuse de handball',
  
  roles: [
    {
      id: 'role-sophie-coach-basket',
      role: 'coach',
      sport: 'basketball',
      club_id: 'club-basket-1',
      club_name: 'Lens Basket Club',
      teams: ['team-basket-1'],
    },
    {
      id: 'role-sophie-player-hand',
      role: 'player',
      sport: 'handball',
      club_id: 'club-handball-1',
      club_name: 'Saint-Denis Handball',
      teams: ['team-handball-1'],
      position: 'Arrière gauche',
      jersey_number: 7,
    },
  ],
  
  followed_clubs: [
    { club_id: 'club-foot-1', sport: 'football' },
    { club_id: 'club-volley-1', sport: 'volleyball' },
  ],
  
  current_role_id: 'role-sophie-coach-basket',
}
```

### Exemple 3 : Karim (Joueur foot + Joueur rugby)

```js
{
  id: 'user-karim',
  first_name: 'Karim',
  last_name: 'Diallo',
  bio: 'Joueur polyvalent - Football et Rugby',
  
  roles: [
    {
      id: 'role-karim-player-foot',
      role: 'player',
      sport: 'football',
      club_id: 'club-foot-1',
      club_name: 'FC Lens Académie',
      teams: ['team-foot-1'],
      position: 'Attaquant',
      jersey_number: 9,
    },
    {
      id: 'role-karim-player-rugby',
      role: 'player',
      sport: 'rugby',
      club_id: 'club-rugby-1',
      club_name: 'AS Liévin Rugby',
      teams: ['team-rugby-1'],
      position: 'Ailier',
      jersey_number: 11,
    },
  ],
  
  followed_clubs: [
    { club_id: 'club-basket-1', sport: 'basketball' },
  ],
  
  current_role_id: 'role-karim-player-foot',
}
```

### Exemple 4 : Alain (Intendant foot + Coach handball)

```js
{
  id: 'user-alain',
  first_name: 'Alain',
  last_name: 'Bernard',
  bio: 'Intendant du FC Lens et coach handball',
  
  roles: [
    {
      id: 'role-alain-staff-foot',
      role: 'staff',
      sport: 'football',
      club_id: 'club-foot-1',
      club_name: 'FC Lens Académie',
    },
    {
      id: 'role-alain-coach-hand',
      role: 'coach',
      sport: 'handball',
      club_id: 'club-handball-1',
      club_name: 'Saint-Denis Handball',
      teams: ['team-handball-1'],
    },
  ],
  
  followed_clubs: [
    { club_id: 'club-volley-1', sport: 'volleyball' },
  ],
  
  current_role_id: 'role-alain-staff-foot',
}
```

### Exemple 5 : Claire (Supporter multi-sports)

```js
{
  id: 'user-claire',
  first_name: 'Claire',
  last_name: 'Dubois',
  bio: 'Supporter de tous les sports !',
  
  roles: [
    {
      id: 'role-claire-community',
      role: 'community',
    },
  ],
  
  followed_clubs: [
    { club_id: 'club-foot-1', sport: 'football' },
    { club_id: 'club-basket-1', sport: 'basketball' },
    { club_id: 'club-rugby-1', sport: 'rugby' },
    { club_id: 'club-handball-1', sport: 'handball' },
    { club_id: 'club-volley-1', sport: 'volleyball' },
  ],
  
  followed_teams: [
    { team_id: 'team-foot-1', sport: 'football' },
    { team_id: 'team-basket-1', sport: 'basketball' },
    { team_id: 'team-volley-1', sport: 'volleyball' },
  ],
}
```

---

## 4. INTERFACE : RECHERCHE ÉQUIPES (TOUS LES SPORTS)

### TeamPage enrichie

```jsx
export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('all') // all, football, basketball, rugby, handball, volleyball
  const [myTeams, setMyTeams] = useState(getCurrentUserTeams())

  const allClubs = mockClubs
  const allTeams = mockTeams

  // Filtrer par sport et recherche
  const filteredTeams = allTeams.filter(team => {
    const matchSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mockClubs.find(c => c.id === team.club_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSport = selectedSport === 'all' || team.sport === selectedSport
    
    return matchSearch && matchSport
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Onglets */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        <button onClick={() => setSelectedSport('all')} className={selectedSport === 'all' ? 'active' : ''}>
          Tous les sports
        </button>
        {Object.entries(SPORTS).map(([key, sport]) => (
          <button
            key={key}
            onClick={() => setSelectedSport(key)}
            className={selectedSport === key ? 'active' : ''}>
            {sport.icon} {sport.name}
          </button>
        ))}
      </div>

      {/* Section Mes équipes */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes équipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTeams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>

      {/* Section Clubs suivis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes clubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentUser.followed_clubs?.map(follow => {
            const club = mockClubs.find(c => c.id === follow.club_id)
            return <ClubCard key={club.id} club={club} />
          })}
        </div>
      </div>

      {/* Section Explorer */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explorer d'autres équipes</h2>
        
        {/* Recherche */}
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher un club ou une équipe..."
          className="w-full mb-6"
        />

        {/* Équipes trouvées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map(team => {
            const club = mockClubs.find(c => c.id === team.club_id)
            const sport = SPORTS[team.sport]
            
            return (
              <div key={team.id} className="p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {sport.icon} {team.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {club.name}
                    </div>
                  </div>
                </div>
                
                <button className="text-sm text-brand-600 hover:underline">
                  Suivre
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

---

## 5. INTERFACE : FEED MULTI-SPORTS

```jsx
export default function FeedPage() {
  const [selectedSports, setSelectedSports] = useState(['all'])
  
  // Récupérer les posts des clubs suivis
  const relevantPosts = mockFeedPosts.filter(post => {
    const club = mockClubs.find(c => c.id === post.club_id)
    
    if (selectedSports.includes('all')) return true
    return selectedSports.includes(club.sport)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Filtres sports */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedSports(['all'])}
          className={selectedSports.includes('all') ? 'btn-primary' : 'btn-secondary'}>
          Tous les sports
        </button>
        {Object.entries(SPORTS).map(([key, sport]) => (
          <button
            key={key}
            onClick={() => {
              if (selectedSports.includes(key)) {
                setSelectedSports(selectedSports.filter(s => s !== key))
              } else {
                setSelectedSports([...selectedSports, key])
              }
            }}
            className={selectedSports.includes(key) ? 'btn-primary' : 'btn-secondary'}>
            {sport.icon} {sport.name}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {relevantPosts.map(post => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
```

---

## 6. INTERFACE : CALENDRIER MULTI-SPORTS

```jsx
export default function CalendarPage() {
  const [selectedSports, setSelectedSports] = useState(['all'])
  
  // Filtrer matchs/entraînements par sports
  const relevantEvents = getCalendarItems().filter(item => {
    const team = mockTeams.find(t => t.id === item.team_id)
    
    if (selectedSports.includes('all')) return true
    return selectedSports.includes(team?.sport)
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Filtres sports */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedSports(['all'])}
          className={selectedSports.includes('all') ? 'btn-primary' : 'btn-secondary'}>
          Tous les sports
        </button>
        {Object.entries(SPORTS).map(([key, sport]) => (
          <button
            key={key}
            onClick={() => toggleSportFilter(key)}
            className={selectedSports.includes(key) ? 'btn-primary' : 'btn-secondary'}>
            {sport.icon} {sport.name}
          </button>
        ))}
      </div>

      {/* Calendrier + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={relevantEvents} />
        </div>
        <div>
          <UpcomingEventsList events={relevantEvents.slice(0, 10)} />
        </div>
      </div>
    </div>
  )
}
```

---

## 7. PROFIL : AFFICHER RÔLES PAR SPORT

```jsx
function RolesSection({ currentUser }) {
  // Grouper les rôles par sport
  const rolesBySSport = {}
  
  currentUser.roles.forEach(role => {
    if (!rolesBySport[role.sport]) {
      rolesBySport[role.sport] = []
    }
    rolesBySport[role.sport].push(role)
  })

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Mes rôles ({currentUser.roles.length})
      </h2>
      
      <div className="space-y-6">
        {Object.entries(rolesBySport).map(([sport, roles]) => {
          const sportInfo = SPORTS[sport]
          
          return (
            <div key={sport}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-200">
                <span className="text-2xl">{sportInfo.icon}</span>
                <h3 className="font-semibold text-gray-900">{sportInfo.name}</h3>
              </div>
              
              <div className="space-y-2 ml-4">
                {roles.map(role => (
                  <div key={role.id} className="p-3 bg-surface-50 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {getRoleLabel(role.role)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {role.club_name}
                      {role.teams?.length > 0 && (
                        <> · {role.teams.map(tId => 
                          mockTeams.find(t => t.id === tId)?.name
                        ).join(', ')}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## RÉSUMÉ

1. **5 sports** : Football, Basketball, Rugby, Handball, Volleyball
2. **Postes spécifiques** pour chaque sport
3. **Users multi-sports** : Président foot + Joueur volley, etc.
4. **Feed/Calendrier** : Filtres par sport
5. **Recherche équipes** : Tous les sports mélangés
6. **Clubs suivis** : Multi-sports possibles
7. **Profil** : Rôles groupés par sport

---

## POUR CLAUDE CODE

```
Implémenter SUPPORT_MULTI_SPORTS.md :

1. Ajouter champ sport à clubs/équipes/teams
2. Créer SPORTS constant avec postes
3. Mock users avec rôles multi-sports
4. TeamPage avec filtres sports
5. FeedPage avec filtres sports
6. CalendarPage avec filtres sports
7. ProfilePage : rôles groupés par sport
8. SearchTeam : tous les sports mélangés

Tester Dupont (président foot + joueur volley)
```
