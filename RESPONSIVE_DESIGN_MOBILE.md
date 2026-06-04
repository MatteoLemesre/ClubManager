# ClubManager — Design Responsive Mobile-First

Adapter ClubManager pour mobile (comme LinkedIn/Doctolib) + corrections dashboard président.

---

## PARTIE 1 — CORRECTIONS DASHBOARD PRÉSIDENT

### Enlever le nom du club en haut à gauche

**Dans PresidentPage.jsx, cherche et ENLÈVE ceci :**

```jsx
// ❌ À SUPPRIMER
<div className="mb-6">
  <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
    👔 Mon club {myClubs.length > 1 ? '(ou mes clubs)' : ''}
  </h1>
  
  {/* Boutons clubs */}
```

**Remplace par :**

```jsx
// ✅ CORRECT
<div className="mb-6">
  {/* Boutons clubs */}
```

### Nouveau layout buttons clubs (sans titre)

```jsx
<div className="mb-6">
  {/* Boutons clubs uniquement */}
  <div className="flex gap-2 flex-wrap">
    {myClubs.map(club => {
      const clubAlertCount = getAlertCount(club.id)
      const isActive = activeClub.id === club.id

      return (
        <button
          key={club.id}
          onClick={() => setSelectedClubId(club.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            isActive
              ? 'bg-brand-600 text-white shadow-lg'
              : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300'
          }`}>
          
          {/* Emoji icon */}
          <span className="text-xl">{club.emoji_icon || '⚽'}</span>
          
          {/* Nom club */}
          <span>{club.name}</span>
          
          {/* Badge alertes */}
          {clubAlertCount > 0 && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isActive
                ? 'bg-white text-brand-600'
                : 'bg-red-100 text-red-700'
            }`}>
              {clubAlertCount}
            </span>
          )}
        </button>
      )
    })}
  </div>
</div>
```

---

## PARTIE 2 — RESPONSIVE DESIGN MOBILE-FIRST

### Breakpoints

```jsx
// Utiliser dans le code
const breakpoints = {
  mobile: '640px',    // < 640px
  tablet: '768px',    // 768px - 1024px
  desktop: '1024px',  // > 1024px
}

// Dans Tailwind (déjà configuré)
// mobile: pas de préfixe
// md: 768px
// lg: 1024px
// xl: 1280px
```

### Layout principal responsive

```jsx
export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navigation */}
      {isMobile ? <MobileNav /> : <DesktopNav />}
      
      {/* Contenu */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## NAVIGATION MOBILE

### Mobile Bottom Navigation (comme LinkedIn/Doctolib)

```jsx
function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/app/feed', icon: '📰', label: 'Feed' },
    { path: '/app/teams', icon: '⚽', label: 'Équipes' },
    { path: '/app/calendar', icon: '📅', label: 'Calendrier' },
    { path: '/app/messages', icon: '💬', label: 'Messages' },
    { path: '/app/profile', icon: '👤', label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 
                   md:hidden z-40">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex-1 py-3 text-center transition-all ${
              location.pathname.includes(tab.path)
                ? 'text-brand-600 border-t-2 border-brand-600'
                : 'text-gray-600 border-t-2 border-transparent'
            }`}>
            <div className="text-xl mb-1">{tab.icon}</div>
            <div className="text-xs font-medium">{tab.label}</div>
          </button>
        ))}
      </div>
    </nav>
  )
}
```

### Desktop Top Navigation

```jsx
function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-6 px-6 py-4 bg-white border-b border-surface-200">
      <div className="text-2xl font-bold">ClubManager</div>
      
      <div className="flex gap-4 flex-1">
        <a href="/app/feed">Feed</a>
        <a href="/app/teams">Équipes</a>
        <a href="/app/calendar">Calendrier</a>
        <a href="/app/messages">Messages</a>
      </div>
      
      <div className="flex items-center gap-4">
        <button>🔔</button>
        <button>⚙️</button>
      </div>
    </nav>
  )
}
```

---

## PAGES PRINCIPALES RESPONSIVE

### FeedPage

```jsx
export default function FeedPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Mobile : full width, padding petit */}
      <div className="max-w-full md:max-w-2xl mx-auto px-4 md:px-0 py-4 md:py-6">
        
        {/* Posts */}
        <div className="space-y-3 md:space-y-4">
          {posts.map(post => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedPost({ post }) {
  return (
    <div className="bg-white rounded-lg md:rounded-2xl border-b md:border border-surface-200 p-4 md:p-6">
      {/* Contenu du post */}
    </div>
  )
}
```

### TeamDetailPage

```jsx
export default function TeamDetailPage() {
  const [activeTab, setActiveTab] = useState('joueurs')

  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-full md:max-w-4xl mx-auto">
        
        {/* Header team */}
        <div className="bg-gradient-to-b from-brand-600 to-brand-700 text-white p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold">{team.name}</h1>
          <p className="text-sm md:text-base opacity-90">{team.club.name}</p>
        </div>

        {/* Tabs horizontal scrollable sur mobile */}
        <div className="sticky top-0 bg-white border-b border-surface-200 overflow-x-auto 
                       md:overflow-x-visible z-10">
          <div className="flex gap-0 md:gap-2 px-4 md:px-6">
            {['joueurs', 'matchs', 'entraînements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 py-4 px-4 border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-600'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div className="px-4 md:px-6 py-4 md:py-6">
          {activeTab === 'joueurs' && <JoueursTab />}
          {activeTab === 'matchs' && <MatchsTab />}
          {activeTab === 'entraînements' && <EntraînementsTab />}
        </div>
      </div>
    </div>
  )
}
```

### ProfilePage

```jsx
export default function ProfilePage() {
  return (
    <div className="pb-20 md:pb-0">
      <div className="max-w-full md:max-w-3xl mx-auto">
        
        {/* Header profil */}
        <div className="bg-gradient-to-b from-surface-200 to-white p-4 md:p-8 text-center md:rounded-b-2xl">
          <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-4 rounded-full 
                         bg-brand-600 flex items-center justify-center text-white 
                         font-bold text-2xl md:text-4xl">
            {initials}
          </div>
          
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
            {user.first_name} {user.last_name}
          </h1>
          
          <p className="text-sm md:text-base text-gray-600 mb-4">
            {user.age} ans
          </p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-2
                         bg-brand-50 rounded-full text-xs md:text-sm text-brand-700 font-medium">
            {getRoleIcon(user.current_role)} {getRoleLabel(user.current_role)}
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Bio */}
          <BioSection user={user} />
          
          {/* Rôles */}
          <RolesSection user={user} />
          
          {/* Historique */}
          <ExperienceSection user={user} />
          
          {/* Documents */}
          <DocumentsSection user={user} />
        </div>
      </div>
    </div>
  )
}
```

---

## MODALS RESPONSIVE

### Modal sur mobile : fullscreen

```jsx
function PlayerDetailModal({ player, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 md:flex md:items-center md:justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-2xl shadow-lg md:shadow-xl 
                     w-full md:w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] 
                     flex flex-col overflow-hidden md:overflow-visible">
        
        {/* Header avec close button */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-200">
          <h2 className="text-lg md:text-xl font-bold">
            {player.first_name} {player.last_name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Contenu modal */}
        </div>
      </div>
    </div>
  )
}
```

---

## DASHBOARD PRÉSIDENT RESPONSIVE

### PresidentPage mobile

```jsx
export default function PresidentPage() {
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [activeTab, setActiveTab] = useState('alertes')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // ... logique
  
  return (
    <div className="pb-20 md:pb-0 bg-surface-50">
      <div className="max-w-full md:max-w-6xl mx-auto">
        
        {/* Sélection clubs - scroll horizontal sur mobile */}
        <div className="px-4 md:px-6 py-4 md:py-6 overflow-x-auto md:overflow-x-visible">
          <div className="flex gap-2 md:gap-3 flex-nowrap md:flex-wrap md:w-full">
            {myClubs.map(club => (
              <button
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                className={`flex-shrink-0 md:flex-shrink flex items-center gap-2 px-4 py-3 
                           rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive ? 'bg-brand-600 text-white shadow-lg' : 'bg-white border border-surface-200'
                }`}>
                {club.emoji_icon || '⚽'}
                <span className="hidden md:inline">{club.name}</span>
                {clubAlertCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-brand-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {clubAlertCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs scrollable sur mobile */}
        <div className="sticky top-0 bg-white border-b border-surface-200 overflow-x-auto md:overflow-x-visible z-10">
          <div className="flex gap-0 md:gap-2 px-4 md:px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-4 px-3 md:px-4 border-b-2 text-sm md:text-base transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-600'
                }`}>
                {isMobile ? tab.icon : `${tab.icon} ${tab.label}`}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 md:p-6">
          {/* Contenu onglet */}
        </div>
      </div>
    </div>
  )
}
```

---

## CARTES ET LISTES RESPONSIVE

### Liste joueurs

```jsx
function JoueursTab({ club }) {
  return (
    <div className="space-y-2 md:space-y-3">
      {filtered.map(player => (
        <div
          key={player.id}
          className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border border-surface-200 
                    hover:border-brand-300 transition-all cursor-pointer">
          
          {/* Mobile : stack vertical */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 mb-2 md:mb-0">
              <div className="font-semibold text-sm md:text-base text-gray-900">
                {player.first_name} {player.last_name}
              </div>
              <div className="text-xs md:text-sm text-gray-600 mt-1 md:mt-0">
                {player.teams?.map(teamId => 
                  mockTeams.find(t => t.id === teamId)?.name
                ).join(', ')}
              </div>
            </div>
            
            <button className="w-full md:w-auto text-xs md:text-sm text-brand-600 hover:underline 
                             mt-2 md:mt-0 py-2 md:py-0 px-3 md:px-0">
              Voir profil
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Stat cards

```jsx
function StatsTab({ club }) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Grid responsive : 2 colonnes mobile, 4 sur desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatCard label="Joueurs" value={players.length} icon="⚽" />
        <StatCard label="Coachs" value={coachs.length} icon="👨‍🏫" />
        <StatCard label="Équipes" value={teams.length} icon="🏟️" />
        <StatCard label="Total" value={clubMembers.length} icon="👥" />
      </div>

      {/* Teams list */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Par équipe</h3>
        <div className="space-y-2">
          {teams.map(team => (
            <div key={team.id} className="p-3 md:p-4 bg-surface-50 rounded-lg md:rounded-xl 
                                        flex justify-between items-center">
              <div className="font-medium text-sm md:text-base text-gray-900">{team.name}</div>
              <div className="text-xs md:text-sm text-gray-600">{teamPlayers.length} j.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
      <div className="text-xl md:text-2xl mb-1">{icon}</div>
      <div className="text-lg md:text-3xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-[10px] md:text-xs text-gray-500">{label}</div>
    </div>
  )
}
```

---

## TAILWIND CONFIG (Responsive)

```js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '375px',   // iPhone SE
        'sm': '640px',   // Standard mobile
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop
        'xl': '1280px',  // Large desktop
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-bottom))',
      },
    },
  },
}
```

---

## RÉSUMÉ RESPONSIVE

1. ✅ **Bottom nav mobile** (Feed, Équipes, Calendrier, Messages, Profil)
2. ✅ **Top nav desktop** (navbar classique)
3. ✅ **Modals fullscreen** sur mobile, centré sur desktop
4. ✅ **Padding responsive** : 4px mobile, 6px desktop
5. ✅ **Font sizes responsive** : petit sur mobile, normal desktop
6. ✅ **Grid responsive** : 1-2 col mobile, 4 col desktop
7. ✅ **Tabs scrollables** sur mobile, statiques desktop
8. ✅ **Boutons clubs** : scroll horizontal mobile

---

## POUR CLAUDE CODE

```
Implémenter RESPONSIVE_DESIGN_MOBILE.md :

1. Enlever nom club en haut PresidentPage
2. Créer MobileNav bottom navigation
3. Créer DesktopNav top navigation
4. Adapter pages (Feed, Teams, Profile, President)
5. Modals responsive (fullscreen mobile)
6. Stat cards grid responsive
7. Tabs et listes scrollables mobile
8. Tailwind breakpoints

Objectif : site responsive comme LinkedIn/Doctolib mobile
```
