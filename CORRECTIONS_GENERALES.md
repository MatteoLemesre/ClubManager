# ClubManager — Corrections Générales

Résumé de toutes les corrections et améliorations à appliquer.

---

## 1. EMOJIS SUPERFLUS

**À ENLEVER partout sauf sur les onglets :**
- ❌ Supprimer les ✅ et ❌ des listes
- ❌ Supprimer les 📱 🖥️ 🏥 🔥 etc. des descriptions
- ❌ Supprimer les emojis des instructions
- ❌ Supprimer les emojis des titres de sections

**À GARDER UNIQUEMENT :**
- Emojis des onglets (Feed 📰, Équipes ⚽, Calendrier 📅, Messages 💬, Profil 👤, Mon club 🏢)

---

## 2. ONGLET "MON CLUB"

### Ajouter dans la navigation

**Ajouter à la liste des onglets :**

```jsx
const tabs = [
  { path: '/app/feed', icon: '📰', label: 'Feed' },
  { path: '/app/teams', icon: '⚽', label: 'Équipes' },
  { path: '/app/calendar', icon: '📅', label: 'Calendrier' },
  { path: '/app/messages', icon: '💬', label: 'Messages' },
  { path: '/app/profile', icon: '👤', label: 'Profil' },
  { path: '/app/president', icon: '🏢', label: 'Mon club' },
]
```

**Emoji choisi :** 🏢 (bâtiment simple et clair)

---

## 3. ENLEVER NOM DU CLUB EN HAUT À GAUCHE

### Dashboard Président

**AVANT :**
```jsx
<h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
  Mon club {myClubs.length > 1 ? '(ou mes clubs)' : ''}
</h1>
```

**APRÈS :** Supprimer complètement cette ligne

Garder seulement les boutons de sélection des clubs.

---

## 4. RÔLE "INTENDANT" (STAFF)

### Ajouter partout

**Nouveau rôle :** `staff` (Intendant)

**Mêmes droits que Président :**
- Accès au dashboard `/app/president`
- Voir tous les documents du club
- Gérer les joueurs et équipes
- Vue complète des alertes

**Modifier les guards :**

```jsx
// AVANT
const canAccess = currentUser.role === 'president'

// APRÈS
const canAccess = currentUser.role === 'president' || currentUser.role === 'staff'
```

---

## 5. RENOMMER "SUPPORTER" EN "COMMUNITY"

### Partout dans le code

**Remplacements :**

```
AVANT : role === 'supporter'
APRÈS : role === 'community'

AVANT : 'supporter' (string)
APRÈS : 'community'

AVANT : "Supporter"
APRÈS : "Communauté"
```

**Signification :** Personne sans club actuel (ancien joueur, fan, sympathisant)

---

## 6. RÔLES MULTIPLES

### Structure mockUsers

**Chaque user peut avoir plusieurs rôles et plusieurs clubs :**

```jsx
const mockUsers = [
  {
    id: 'user-1',
    first_name: 'Karim',
    roles: [
      { role: 'player', club_id: 'club-1', teams: ['team-1', 'team-2'] },
      { role: 'coach', club_id: 'club-2', teams: ['team-5'] },
    ],
    current_role: 'player', // Rôle principal (priorité)
    current_club_id: 'club-1',
  },
]
```

**Priorité des rôles :**
1. Joueur
2. Coach
3. Président
4. Intendant
5. Communauté

---

## 7. RESPONSIVE MOBILE

### Navigation

**Mobile :** Bottom nav avec 6 onglets (Feed, Équipes, Calendrier, Messages, Profil, Mon club)

**Desktop :** Top nav classique

### Pages

**Mobile-first :**
- Full width, padding 1rem
- Modals fullscreen
- Tabs scroll horizontal
- Stat cards 2 colonnes

**Desktop :**
- Max-width 1280px
- Padding normal
- Modals centrées
- Stat cards 4 colonnes

---

## 8. CLUBS AVEC EMOJI

### Ajouter champ emoji_icon

**Dans mockClubs :**

```js
const mockClubs = [
  {
    id: 'club-1',
    name: 'FC Lens Académie',
    emoji_icon: '⚽',
    city: 'Lens',
  },
  {
    id: 'club-2',
    name: 'AS Saint-Denis',
    emoji_icon: '🏆',
    city: 'Saint-Denis',
  },
]
```

**Utilisation :** Dans les boutons de sélection clubs

---

## 9. HISTORIQUE ÉDITABLE (LinkedIn-STYLE)

### Chaque user peut ajouter/modifier son historique

```jsx
roles: [
  {
    role: 'player',
    club_id: 'club-1',
    team_name: 'Séniors A',
    position: 'Attaquant',
    start_date: '2024-09-01',
    end_date: null,
    description: 'Joueur titulaire...',
  },
]
```

**Pas auto-généré** : l'utilisateur remplit lui-même son profil

---

## 10. AUTORISER PHOTOS ET LIENS DANS LE FEED

### Coach et Président uniquement

**Peuvent uploader :**
- Photos et vidéos
- Liens externes

**Joueur et Communauté :**
- Texte uniquement

---

## 11. RÉACTIONS RAPIDES MESSAGERIE

### 6 réactions sur les messages

```
👍 ❤️ 😂 😮 😢 🔥
```

**Affichage :** Bubble avec emoji en bas du message

---

## 12. BIO PERSONNELLE

### Tous les users

**Champ bio (300 caractères max) :**

```jsx
{
  id: 'user-1',
  bio: 'Passionné de foot depuis toujours...',
}
```

**Modifiable dans le profil**

---

## CHECKLIST CORRECTIONS

- [ ] Enlever emojis superflus (garder seulement sur onglets)
- [ ] Ajouter onglet "Mon club" (🏢)
- [ ] Enlever titre "Mon club" du dashboard président
- [ ] Ajouter rôle Intendant (staff) avec mêmes droits
- [ ] Renommer Supporter → Communauté partout
- [ ] Implémenter rôles multiples dans mockUsers
- [ ] Ajouter navigation responsive (bottom nav mobile)
- [ ] Ajouter emoji_icon sur clubs
- [ ] Historique éditable (user remplit lui-même)
- [ ] Upload photos/liens feed (coach/président)
- [ ] Réactions messagerie (6 emojis)
- [ ] Bio personnelle (300 char)

---

## PRIORITÉ

1. **Urgent :** Enlever emojis, ajouter onglet Mon club, rôle intendant
2. **Important :** Responsive mobile, rôles multiples
3. **Nice-to-have :** Bio, réactions, historique éditable

---

## POUR CLAUDE CODE

```
Implémenter CORRECTIONS_GENERALES.md :

1. Enlever emojis superflus partout
2. Ajouter onglet "Mon club" (🏢)
3. Ajouter rôle staff (Intendant)
4. Renommer supporter → community
5. Responsive mobile (bottom nav)
6. Clubs avec emoji_icon
7. Rôles multiples structure
8. Bio personnelle
9. Réactions messagerie
10. Upload photos/liens feed

Tester tous les rôles et appareils.
```
