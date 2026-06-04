# ClubManager — Modifications Finales

Trois modifications importantes à appliquer.

---

## 1. INTENDANT PEUT ÉCRIRE DANS LE FEED

### Permettre aux Intendants de publier

**Actuellement :**
```jsx
const canPostInFeed = currentUser.role === 'coach' || currentUser.role === 'president'
```

**Modifier en :**
```jsx
const canPostInFeed = currentUser.role === 'coach' || 
                      currentUser.role === 'president' || 
                      currentUser.role === 'staff' // Intendant
```

### Bouton créer post dans FeedPage

```jsx
{(currentUser.role === 'coach' || 
  currentUser.role === 'president' || 
  currentUser.role === 'staff') && (
  <button onClick={() => setShowCreatePostModal(true)}>
    Créer une publication
  </button>
)}
```

---

## 2. EN HAUT À DROITE : NOM UNIQUEMENT (SANS POSTE)

### Header Profil utilisateur

**AVANT :**
```jsx
<div className="flex items-center gap-4 ml-auto">
  <div className="text-right">
    <div className="font-semibold text-gray-900">
      {currentUser.first_name} {currentUser.last_name}
    </div>
    {/* ❌ À ENLEVER */}
    <div className="text-xs text-gray-500">
      {getRoleLabel(currentUser.current_role)} - {currentTeam?.name}
    </div>
  </div>
  <button className="text-gray-600 hover:text-gray-900">
    🔔
  </button>
</div>
```

**APRÈS :**
```jsx
<div className="flex items-center gap-4 ml-auto">
  <div className="text-right">
    <div className="font-semibold text-gray-900">
      {currentUser.first_name} {currentUser.last_name}
    </div>
  </div>
  <button className="text-gray-600 hover:text-gray-900">
    🔔
  </button>
</div>
```

### Code complet simplifié

```jsx
export default function AppLayout() {
  const { currentUser } = useAuth()

  return (
    <header className="bg-white border-b border-surface-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        
        {/* Logo */}
        <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center 
                       text-white font-bold text-lg flex-shrink-0">
          🏢
        </div>
        
        {/* Navigation */}
        <nav className="flex gap-8">
          <a href="/app/feed" className="text-gray-700 hover:text-brand-600">Feed</a>
          
          {/* Mon club entre Feed et Équipes */}
          <a href="/app/president" className="text-gray-700 hover:text-brand-600">
            Mon club
          </a>
          
          <a href="/app/teams" className="text-gray-700 hover:text-brand-600">Équipes</a>
          <a href="/app/calendar" className="text-gray-700 hover:text-brand-600">Calendrier</a>
          <a href="/app/messages" className="text-gray-700 hover:text-brand-600">Messagerie</a>
          <a href="/app/profile" className="text-gray-700 hover:text-brand-600">Profil</a>
        </nav>

        {/* Profil utilisateur (nom + cloche) */}
        <div className="ml-auto flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900">
            🔔
          </button>
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-sm">
              {currentUser.first_name} {currentUser.last_name}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
```

---

## 3. ONGLET "MON CLUB" ENTRE FEED ET ÉQUIPES

### Ordre des onglets

**AVANT :**
```
Feed | Équipes | Calendrier | Messagerie | Profil | Mon club
```

**APRÈS :**
```
Feed | Mon club | Équipes | Calendrier | Messagerie | Profil
```

### Navigation mobile

```jsx
{isMobile && (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200">
    <div className="flex justify-around">
      <a href="/app/feed">
        <div className="text-xl">📰</div>
        <div className="text-xs">Feed</div>
      </a>
      
      {/* Mon club ici */}
      <a href="/app/president">
        <div className="text-xl">🏢</div>
        <div className="text-xs">Mon club</div>
      </a>
      
      <a href="/app/teams">
        <div className="text-xl">⚽</div>
        <div className="text-xs">Équipes</div>
      </a>
      <a href="/app/calendar">
        <div className="text-xl">📅</div>
        <div className="text-xs">Calendrier</div>
      </a>
      <a href="/app/messages">
        <div className="text-xl">💬</div>
        <div className="text-xs">Messagerie</div>
      </a>
      <a href="/app/profile">
        <div className="text-xl">👤</div>
        <div className="text-xs">Profil</div>
      </a>
    </div>
  </nav>
)}
```

---

## 4. ENLEVER EMOJIS DES NOMS DE CLUBS

### Sélection clubs (Dashboard Président)

**AVANT :**
```jsx
<button>
  <span className="text-xl">⚽</span>
  <span>FC Lens Académie</span>
</button>
```

**APRÈS (sans emoji à côté du nom):**
```jsx
<button>
  <span>FC Lens Académie</span>
</button>
```

### Code complet dashboard président

```jsx
<div className="mb-6 overflow-x-auto">
  <div className="flex gap-2 flex-nowrap md:flex-wrap md:w-full">
    {myClubs.map(club => {
      const clubAlertCount = getAlertCount(club.id)
      const isActive = activeClub.id === club.id

      return (
        <button
          key={club.id}
          onClick={() => setSelectedClubId(club.id)}
          className={`flex-shrink-0 md:flex-shrink px-4 py-3 rounded-xl font-medium 
                     transition-all whitespace-nowrap ${
            isActive
              ? 'bg-brand-600 text-white shadow-lg'
              : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300'
          }`}>
          
          {/* Juste le nom du club, pas d'emoji */}
          {club.name}
          
          {/* Badge alertes */}
          {clubAlertCount > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
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

## RÉSUMÉ DES MODIFICATIONS

1. Intendant (staff) peut publier dans le feed
2. En haut à droite : NOM UNIQUEMENT + cloche notif
3. Ordre onglets : Feed → Mon club → Équipes → Calendrier → Messagerie → Profil
4. Sélection clubs : Plus d'emojis, juste le nom

---

## POUR CLAUDE CODE

```
Implémenter MODIFICATIONS_FINALES.md :

1. Permettre staff (intendant) publier dans feed
2. Header : enlever poste/rôle, garder nom + cloche
3. Déplacer Mon club entre Feed et Équipes
4. Enlever emojis des noms de clubs

Tester navigation complète et feed intendant.
```
