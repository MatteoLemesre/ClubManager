# ClubManager — Enlever le nom du club dans la navigation

Supprimer "FC Saint-Martin" (ou tout nom de club) qui s'affiche en haut à gauche.

---

## LE PROBLÈME

Actuellement, en haut à gauche de chaque page, il y a :

```
🏢 FC Saint-Martin
```

**À ENLEVER complètement**

---

## LA SOLUTION

### Component Navigation/Header principal

**Cherche ce code :**

```jsx
export default function AppLayout() {
  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Logo + Nom du club */}
          <div className="w-12 h-12 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xl">
            🏢
          </div>
          
          {/* ❌ À ENLEVER */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeClub?.name || 'FC Saint-Martin'}
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-6 ml-auto">
            {/* ... */}
          </nav>
        </div>
      </header>
      
      <Outlet />
    </div>
  )
}
```

### CORRECTION

**Enlève complètement :**

```jsx
{/* ❌ À ENLEVER */}
<div>
  <h1 className="text-xl font-bold text-gray-900">
    {activeClub?.name || 'FC Saint-Martin'}
  </h1>
</div>
```

**Garde seulement le logo :**

```jsx
export default function AppLayout() {
  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Logo UNIQUEMENT */}
          <div className="w-12 h-12 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xl">
            🏢
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-6 ml-auto">
            <a href="/app/feed">Feed</a>
            <a href="/app/teams">Équipes</a>
            <a href="/app/calendar">Calendrier</a>
            <a href="/app/messages">Messagerie</a>
            <a href="/app/profile">Profil</a>
            <a href="/app/president">Mon club</a>
          </nav>
        </div>
      </header>
      
      <Outlet />
    </div>
  )
}
```

---

## VERSION COMPLÈTE AVEC RESPONSIVE

```jsx
export default function AppLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop Header */}
      {!isMobile && (
        <header className="bg-white border-b border-surface-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
            {/* Logo seulement */}
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center 
                           text-white font-bold text-lg flex-shrink-0">
              🏢
            </div>
            
            {/* Navigation */}
            <nav className="flex gap-8">
              <a href="/app/feed" className="text-gray-700 hover:text-brand-600 font-medium">
                Feed
              </a>
              <a href="/app/teams" className="text-gray-700 hover:text-brand-600 font-medium">
                Équipes
              </a>
              <a href="/app/calendar" className="text-gray-700 hover:text-brand-600 font-medium">
                Calendrier
              </a>
              <a href="/app/messages" className="text-gray-700 hover:text-brand-600 font-medium">
                Messagerie
              </a>
              <a href="/app/profile" className="text-gray-700 hover:text-brand-600 font-medium">
                Profil
              </a>
              <a href="/app/president" className="text-gray-700 hover:text-brand-600 font-medium">
                Mon club
              </a>
            </nav>

            {/* Actions droite */}
            <div className="ml-auto flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900">
                🔔
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                ⚙️
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 z-40">
          <div className="flex justify-around">
            <a href="/app/feed" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">📰</div>
              <div className="text-xs text-gray-600">Feed</div>
            </a>
            <a href="/app/teams" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">⚽</div>
              <div className="text-xs text-gray-600">Équipes</div>
            </a>
            <a href="/app/calendar" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">📅</div>
              <div className="text-xs text-gray-600">Calendrier</div>
            </a>
            <a href="/app/messages" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">💬</div>
              <div className="text-xs text-gray-600">Messagerie</div>
            </a>
            <a href="/app/profile" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">👤</div>
              <div className="text-xs text-gray-600">Profil</div>
            </a>
            <a href="/app/president" className="flex-1 py-3 text-center hover:bg-surface-50">
              <div className="text-xl">🏢</div>
              <div className="text-xs text-gray-600">Mon club</div>
            </a>
          </div>
        </nav>
      )}

      {/* Contenu */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## RÉSUMÉ

- ❌ Enlever complètement le `<h1>` avec le nom du club
- ✅ Garder le logo/icône (🏢)
- ✅ Garder la navigation (Feed, Équipes, etc.)
- ✅ Garder responsive (desktop + mobile)

---

## POUR CLAUDE CODE

```
Implémenter ENLEVER_NOM_CLUB_NAVIGATION.md :

1. Ouvrir component AppLayout ou Header
2. Chercher le <h1> avec le nom du club
3. Supprimer complètement ce <h1> et son div parent
4. Garder le logo et la navigation
5. Vérifier responsive (desktop et mobile)

Résultat : Plus de "FC Saint-Martin" en haut à gauche
```
