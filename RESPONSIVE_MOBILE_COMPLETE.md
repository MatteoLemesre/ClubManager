# ClubManager — Design Responsive Mobile-First Complet

Adapter toutes les pages pour mobile (comme LinkedIn/Doctolib).

---

## 1. PRINCIPES MOBILE-FIRST

### Breakpoints

```css
/* Mobile first (par défaut) */
/* xs: 0px - 374px (petits téléphones) */
/* sm: 375px - 640px (standard mobile) */
/* md: 641px - 1024px (tablette) */
/* lg: 1025px + (desktop) */
```

### Règles générales

**Mobile :**
- Full width (0 padding horizontal)
- Padding: 0.5rem lateral
- Font size: 14px (body), 16px (h3)
- Spacing: 1rem (vertical)
- Buttons: 44px min height (touch)
- Bottom nav: 60px fixed
- Pb: 80px sur les pages (pour bot nav)

**Desktop :**
- Max-width: 1200px
- Padding: 1.5rem lateral
- Font size: 16px (body), 18px (h3)
- Spacing: 1.5rem (vertical)
- Top nav: 60px fixed
- Pb: 0

---

## 2. NAVIGATION MOBILE

### Bottom Navigation (Mobile)

```jsx
function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/app/feed', icon: '📰', label: 'Feed' },
    { path: '/app/mon-club', icon: '🏢', label: 'Mon club' },
    { path: '/app/teams', icon: '⚽', label: 'Équipes' },
    { path: '/app/calendar', icon: '📅', label: 'Calendrier' },
    { path: '/app/messages', icon: '💬', label: 'Messages' },
    { path: '/app/profile', icon: '👤', label: 'Profil' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e0e0e0',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 0,
      zIndex: 40,
      '@media (min-width: 768px)': { display: 'none' }
    }}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            flex: 1,
            padding: '8px 0',
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderTop: location.pathname.includes(tab.path) ? '2px solid #0066cc' : 'none',
            color: location.pathname.includes(tab.path) ? '#0066cc' : '#999',
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '2px' }}>{tab.icon}</div>
          <div style={{ fontSize: '10px', fontWeight: '500' }}>{tab.label}</div>
        </button>
      ))}
    </nav>
  )
}
```

### Top Navigation (Desktop)

```jsx
function DesktopNav() {
  return (
    <nav style={{
      display: 'none',
      '@media (min-width: 768px)': { display: 'flex' },
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 1.5rem',
      alignItems: 'center',
      height: '60px',
      gap: '2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ fontSize: '18px', fontWeight: '600' }}>ClubManager</div>
      <a href="/app/feed">Feed</a>
      <a href="/app/mon-club">Mon club</a>
      <a href="/app/teams">Équipes</a>
      <a href="/app/calendar">Calendrier</a>
      <a href="/app/messages">Messages</a>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
        <button>🔔</button>
        <button>👤</button>
      </div>
    </nav>
  )
}
```

---

## 3. PAGES RESPONSIVE

### FeedPage

**Mobile :**
```jsx
export default function FeedPage() {
  return (
    <div style={{
      paddingBottom: '80px', // Pour bottom nav
      background: '#f9f9f9',
    }}>
      <div style={{
        maxWidth: '100%',
        paddingLeft: 0,
        paddingRight: 0,
      }}>
        {/* Créer post */}
        <div style={{
          background: '#fff',
          padding: '1rem 0.5rem',
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '0.5rem',
        }}>
          {/* Voir FEED MOBILE plus bas */}
        </div>

        {/* Posts */}
        <div>
          {posts.map(post => (
            <div key={post.id} style={{
              background: '#fff',
              padding: '1rem 0.5rem',
              borderBottom: '1px solid #e0e0e0',
              marginBottom: '0.5rem',
            }}>
              {/* Post card */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### TeamsPage

**Mobile :**
```jsx
export default function TeamsPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Filtres scrollables horizontales */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '0.5rem',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
      }}>
        {/* Boutons scroll horizontal */}
      </div>

      {/* Mes équipes */}
      <div style={{ padding: '1rem 0.5rem' }}>
        {myTeams.map(team => (
          <div key={team.id} style={{
            background: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '8px',
            cursor: 'pointer',
          }}>
            {/* Card équipe */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### CalendarPage

**Mobile :**
```jsx
export default function CalendarPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Mini calendrier */}
      <div style={{
        background: '#fff',
        padding: '1rem 0.5rem',
        borderBottom: '1px solid #e0e0e0',
      }}>
        {/* Calendrier mini sur 1 ligne */}
      </div>

      {/* Liste prochains matchs */}
      <div style={{ padding: '1rem 0.5rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
          Prochains événements
        </h3>
        {events.map(event => (
          <div key={event.id} style={{
            background: '#fff',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '8px',
            borderLeft: '4px solid #0066cc',
          }}>
            {/* Event card compact */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### MessagesPage

**Mobile :**
```jsx
export default function MessagesPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Conversations */}
      <div>
        {conversations.map(conv => (
          <button key={conv.id} style={{
            width: '100%',
            background: '#fff',
            border: 'none',
            borderBottom: '1px solid #e0e0e0',
            padding: '0.75rem 0.5rem',
            cursor: 'pointer',
            textAlign: 'left',
          }}>
            {/* Conversation item compact */}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### ProfilePage

**Mobile :**
```jsx
export default function ProfilePage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header profil */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem 0.5rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#fff',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: '600',
        }}>
          {initials}
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          {user.first_name} {user.last_name}
        </h1>
        <p style={{ fontSize: '12px', margin: '4px 0 0' }}>
          {user.age} ans • {user.city}
        </p>
      </div>

      {/* Sections */}
      <div style={{ padding: '1rem 0.5rem' }}>
        {/* Bio */}
        <div style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 0.5rem', color: '#666' }}>
            À propos
          </h3>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
            {user.bio}
          </p>
        </div>

        {/* Rôles */}
        <div style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          {/* Rôles compacts */}
        </div>

        {/* Historique */}
        <div style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
        }}>
          {/* Expériences */}
        </div>
      </div>
    </div>
  )
}
```

### PresidentPage (Mon club)

**Mobile :**
```jsx
export default function PresidentPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Sélection clubs (scroll horizontal) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '0.75rem 0.5rem',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
      }}>
        {myClubs.map(club => (
          <button
            key={club.id}
            style={{
              flex: '0 0 auto',
              padding: '8px 12px',
              background: isActive ? '#0066cc' : '#f5f5f5',
              color: isActive ? '#fff' : '#333',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {club.name}
          </button>
        ))}
      </div>

      {/* Tabs scrollables */}
      <div style={{
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        borderBottom: '1px solid #e0e0e0',
        background: '#fff',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              flex: '0 0 auto',
              padding: '12px 1rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #0066cc' : 'none',
              color: activeTab === tab.id ? '#0066cc' : '#999',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ padding: '1rem 0.5rem' }}>
        {/* Onglet actif */}
      </div>
    </div>
  )
}
```

---

## 4. MODALS RESPONSIVE

**Mobile :**
```jsx
function Modal({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
    }}>
      <div style={{
        marginTop: 'auto',
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        padding: '1rem 0.5rem',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}
```

**Desktop :**
```jsx
function Modal({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}
```

---

## 5. COMPOSANTS MOBILE

### Boutons

```jsx
// Mobile : full width par défaut
<button style={{
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  minHeight: '44px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'pointer',
}}>
  Action
</button>

// Desktop : width auto
<button style={{
  padding: '10px 20px',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  cursor: 'pointer',
}}>
  Action
</button>
```

### Inputs

```jsx
// Mobile : full width
<input style={{
  width: '100%',
  padding: '12px',
  fontSize: '16px', // Évite zoom on iOS
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
}} />

// Desktop : width contrôlé
<input style={{
  width: '300px',
  padding: '10px',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
}} />
```

### Images

```jsx
// Mobile : full width avec aspect ratio
<img style={{
  width: '100%',
  aspectRatio: '16/9',
  objectFit: 'cover',
  borderRadius: '6px',
}} />

// Ou avec srcSet pour différentes résolutions
<img
  src="image-sm.jpg"
  srcSet="image-sm.jpg 375w, image-md.jpg 768w, image-lg.jpg 1024w"
  style={{ width: '100%' }}
/>
```

---

## 6. SPACING RESPONSIVE

```jsx
const spacing = {
  mobile: {
    paddingX: '0.5rem',
    paddingY: '1rem',
    gapCards: '8px',
    gapGroup: '1rem',
  },
  desktop: {
    paddingX: '1.5rem',
    paddingY: '1.5rem',
    gapCards: '12px',
    gapGroup: '2rem',
  }
}
```

---

## 7. TYPOGRAPHIE RESPONSIVE

```jsx
const typography = {
  h1: {
    mobile: { fontSize: '18px', fontWeight: '600' },
    desktop: { fontSize: '28px', fontWeight: '600' },
  },
  h2: {
    mobile: { fontSize: '16px', fontWeight: '500' },
    desktop: { fontSize: '22px', fontWeight: '500' },
  },
  body: {
    mobile: { fontSize: '14px', lineHeight: '1.5' },
    desktop: { fontSize: '16px', lineHeight: '1.6' },
  },
}
```

---

## 8. MEDIA QUERIES CSS

```css
/* Mobile first */
@media (max-width: 640px) {
  body {
    font-size: 14px;
  }
  .container {
    padding: 0.5rem;
  }
  .modal {
    border-radius: 16px 16px 0 0;
    margin-top: auto;
  }
}

@media (min-width: 641px) {
  body {
    font-size: 16px;
  }
  .container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  .modal {
    border-radius: 12px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@media (min-width: 1025px) {
  .bottom-nav {
    display: none;
  }
  .top-nav {
    display: flex;
  }
}
```

---

## 9. LISTE DE VÉRIFICATION MOBILE

- [ ] Bottom nav 6 items (mobile seulement)
- [ ] Top nav (desktop seulement)
- [ ] Padding bottom 80px sur toutes les pages mobiles
- [ ] Buttons 44px min height (touch-friendly)
- [ ] Font size 16px sur inputs (iOS zoom)
- [ ] Modal fullscreen mobile, centré desktop
- [ ] Images responsive avec aspectRatio
- [ ] Scroll horizontal pour listes longues (clubs, équipes)
- [ ] Tabs scrollables sur mobile
- [ ] Espacements réduits sur mobile
- [ ] No fixed position (sauf nav)
- [ ] Touch targets 44x44px minimum

---

## 10. OUTILS DE TEST

```
Chrome DevTools :
1. Ouvrir DevTools (F12)
2. Cliquer sur icône téléphone/tablette (Ctrl+Shift+M)
3. Tester les breakpoints : 375px, 768px, 1024px

Tester sur appareil réel :
1. npm run dev sur localhost
2. Accéder via IP locale (192.168.x.x:5173)
3. Tester sur iPhone/Android
```

---

## POUR CLAUDE CODE

```
Adapter TOUTES les pages au format mobile :

1. Navigation : Bottom nav mobile + Top nav desktop
2. Pages : FeedPage, TeamsPage, CalendarPage, MessagesPage, ProfilePage, PresidentPage
3. Modals : Fullscreen mobile, centré desktop
4. Composants : Buttons, Inputs, Images responsive
5. Spacing : Réduit mobile, normal desktop
6. Typography : Petit mobile, normal desktop
7. Media queries : 640px breakpoint principal

Architecture : CSS variables + media queries OR inline styles avec breakpoints

Résultat : Site mobile-first prêt pour iOS/Android + desktop
```
