# Guide : Enlever les Smileys du Site

**Garder les smileys UNIQUEMENT dans :** FeedPage (reactions)

---

## 1️⃣ TeamsPage (`packages/web/src/pages/app/TeamsPage.tsx`)

### Enlever imports lucide-react :
```tsx
// ❌ AVANT
import { Users, Trophy, Mail, Edit2, Plus, ChevronDown } from 'lucide-react';

// ✅ APRÈS
// Enlever complètement l'import lucide-react
```

### Remplacer les icônes par du texte :

**Sport icons** (ligne ~36)
```tsx
// ❌ AVANT
<Trophy className="w-5 h-5 text-blue-600" />

// ✅ APRÈS
<span className="text-lg font-bold text-blue-600">⚽</span>
// ou juste du texte: "Football"
```

**Edit button** (ligne ~42)
```tsx
// ❌ AVANT
<Edit2 className="w-4 h-4" />

// ✅ APRÈS
// Juste le texte du bouton, pas d'icône
<button className="btn btn-sm">Modifier</button>
```

**Players count** (ligne ~48)
```tsx
// ❌ AVANT
<Users className="w-4 h-4" /> {players.length} joueurs

// ✅ APRÈS
{players.length} joueurs
```

**Mail icon** (ligne ~51)
```tsx
// ❌ AVANT
<Mail className="w-4 h-4" />

// ✅ APRÈS
// Enlever l'icône
```

---

## 2️⃣ CalendarPage (`packages/web/src/pages/app/CalendarPage.tsx`)

### Enlever imports lucide-react :
```tsx
// ❌ AVANT
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, X } from 'lucide-react';

// ✅ APRÈS
// Enlever complètement l'import lucide-react
```

### Remplacer icônes par texte :

**MapPin** (ligne ~27)
```tsx
// ❌ AVANT
<MapPin className="w-4 h-4" /> {event.location}

// ✅ APRÈS
📍 {event.location}
// ou juste: {event.location}
```

**Clock** (ligne ~23)
```tsx
// ❌ AVANT
<Clock className="w-4 h-4" /> {event.startTime}

// ✅ APRÈS
🕐 {event.startTime}
// ou juste: {event.startTime}
```

**Users** (ligne ~30)
```tsx
// ❌ AVANT
<Users className="w-4 h-4" /> {event.participants?.length || 0}

// ✅ APRÈS
{event.participants?.length || 0} participants
```

**Chevron buttons** (ligne ~18, 19)
```tsx
// ❌ AVANT
<ChevronLeft className="w-5 h-5" />
<ChevronRight className="w-5 h-5" />

// ✅ APRÈS
&lt; ou &gt;
// ou juste du texte
```

**X close button** (ligne ~35)
```tsx
// ❌ AVANT
<X className="w-5 h-5" />

// ✅ APRÈS
✕ ou juste "Fermer"
```

---

## 3️⃣ ProfilePage (`packages/web/src/pages/app/ProfilePage.tsx`)

### Enlever imports lucide-react :
```tsx
// ❌ AVANT
import { Mail, Phone, MapPin, Edit, FileText, Camera, X } from 'lucide-react';

// ✅ APRÈS
// Enlever complètement l'import lucide-react
```

### Remplacer icônes par texte :

**Mail, Phone, MapPin** (lignes contact info)
```tsx
// ❌ AVANT
<Mail className="w-4 h-4" /> {user.email}
<Phone className="w-4 h-4" /> {user.phone}
<MapPin className="w-4 h-4" /> {user.city}

// ✅ APRÈS
📧 {user.email}
📱 {user.phone}
📍 {user.city}
// ou juste le texte sans icônes
```

**Edit button** (ligne ~25)
```tsx
// ❌ AVANT
<Edit className="w-4 h-4" />

// ✅ APRÈS
// Juste "Modifier" sans icône
```

**Documents/Files** (ligne ~60+)
```tsx
// ❌ AVANT
<FileText className="w-4 h-4" /> Document

// ✅ APRÈS
📄 Document
// ou juste "Document"
```

---

## 4️⃣ PresidentPage (`packages/web/src/pages/app/PresidentPage.tsx`)

### Enlever imports lucide-react :
```tsx
// ❌ AVANT
import { CheckCircle, XCircle, Edit, Trash2, Download, Upload, Plus } from 'lucide-react';

// ✅ APRÈS
// Enlever complètement l'import lucide-react
```

### ⭐ IMPORTANT : Remplacer les 3 checks (✅❌) par bouton "Profil" :

**Ligne ~310-320** (joueurs avec status) :
```tsx
// ❌ AVANT
{player.certifications?.includes('medical') ? (
  <CheckCircle className="w-5 h-5 text-green-500" />
) : (
  <XCircle className="w-5 h-5 text-red-500" />
)}

// ✅ APRÈS
<button 
  className="btn btn-sm btn-primary"
  onClick={() => openPlayerProfile(player.id)}
>
  Profil
</button>
```

**Ce bouton doit ouvrir :**
- Fiche complète du joueur
- Accès aux fichiers/certificats
- Modifications possibles

### Autres icônes à enlever :

**Edit, Trash, Download, Upload, Plus**
```tsx
// ❌ AVANT
<Edit className="w-4 h-4" />

// ✅ APRÈS
// Juste le texte du bouton: "Modifier", "Supprimer", etc.
```

---

## 5️⃣ MessagesPage (`packages/web/src/pages/app/MessagesPage.tsx`)

### Enlever imports lucide-react :
```tsx
// ❌ AVANT
import { Send, Paperclip, Search, ChevronDown } from 'lucide-react';

// ✅ APRÈS
// Enlever complètement l'import lucide-react
```

### Remplacer icônes :

**Send button** (ligne ~180)
```tsx
// ❌ AVANT
<Send className="w-4 h-4" />

// ✅ APRÈS
Envoyer
```

**Paperclip** (pièces jointes)
```tsx
// ❌ AVANT
<Paperclip className="w-4 h-4" />

// ✅ APRÈS
📎 ou juste "Fichiers"
```

**Search icon**
```tsx
// ❌ AVANT
<Search className="w-4 h-4" />

// ✅ APRÈS
// Enlever, garder juste le placeholder
```

---

## 6️⃣ FeedPage (`packages/web/src/pages/app/FeedPage.tsx`)

### ✅ NE RIEN CHANGER
Les emojis/smileys dans FeedPage sont corrects. On les garde pour les réactions sur les posts.

---

## Checklist d'exécution :

- [ ] TeamsPage : imports supprimés, icônes remplacées
- [ ] CalendarPage : imports supprimés, icônes remplacées
- [ ] ProfilePage : imports supprimés, icônes remplacées
- [ ] PresidentPage : imports supprimés, check/cross → bouton "Profil"
- [ ] MessagesPage : imports supprimés, icônes remplacées
- [ ] FeedPage : rien à changer ✅
- [ ] Test local : `npm run dev:web`
- [ ] Commit : `git add . && git commit -m "refactor: remove emojis from all pages except feed"`
- [ ] Push : `git push origin main`
- [ ] Vercel redeploy auto ✅

---

## Conseil : Utilise Claude Code

Ouvre chaque fichier dans Claude Code et fais les remplacements directement. C'est plus rapide que de les faire à la main ! 

```bash
# Une fois fini, teste :
npm run dev:web

# Si ça marche :
git add .
git commit -m "refactor: remove emojis from all pages except feed"
git push origin main
```

Vercel redéploiera automatiquement ! 🚀
