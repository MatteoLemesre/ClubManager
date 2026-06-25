# Architecture : Récap Profil + Permissions par Rôle

---

## 👤 PAGE PROFIL JOUEUR (JoueurProfilePage.tsx)

### **Nouvelle Structure**

```
┌──────────────────────────────────────────────────────────────┐
│ [← Retour]                                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│          RÉCAP PROFIL (VISIBLE POUR TOUS)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  👤 JEAN DUPONT                                        │ │
│  │                                                        │ │
│  │  📅 13 ans (2010) • 📍 Lens • 📱 06...XX XX XX        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│      INFOS COMPLÈTES (Pres/Coach/Intendant uniquement)      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Si permissions] Fiche Complète + Documents + Historique   │
│  [Sinon] Message "Vous n'avez pas accès à ces infos"       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 PARTIE 1 : RÉCAP PROFIL

### **Affichage**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  👤 JEAN DUPONT                                              │
│                                                              │
│  📅 13 ans (2010) • 📍 Lens • 📱 06...XX XX XX              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Infos Affichées (TOUT LE MONDE)**

```
✅ Nom : Jean
✅ Prénom : Dupont
✅ Âge : 13 (calculé de la date naissance)
✅ Année naissance : 2010
✅ Ville : Lens
✅ Contact masqué : 
   - Email : jean...@example.com
   - Téléphone : 06...XX XX XX
```

### **Logique du Contact Masqué**

```typescript
// Si email
email: "jean.dupont@example.com"
display: "jean...@example.com"

// Si téléphone
phone: "06 12 34 56 78"
display: "06...56 78"

// Affiche juste "◆◆◆ [derniers chiffres]"
```

---

## 🔐 PARTIE 2 : INFOS COMPLÈTES (PERMISSIONS)

### **Qui Peut Voir ?**

```
CAS 1 : Président du Club
├── Voit TOUT les infos de ses joueurs ✅

CAS 2 : Intendant du Club
├── Voit TOUT les infos de ses joueurs ✅

CAS 3 : Coach (regardant ses propres joueurs)
├── Voit TOUT les infos de ses joueurs ✅

CAS 4 : Coach (regardant joueurs d'autre équipe)
├── Voit JUSTE le récap ❌

CAS 5 : Joueur (regardant autre joueur)
├── Voit JUSTE le récap ❌

CAS 6 : Communauté (visiteur anonyme)
├── Voit JUSTE le récap ❌
```

### **Affichage des Infos Complètes**

Si permissions OK :

```
┌──────────────────────────────────────────────────────────────┐
│ FICHE COMPLÈTE                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📧 Email : jean.dupont@example.com                    │ │
│  │ 📱 Téléphone : 06 12 34 56 78                         │ │
│  │ 🎂 Date Naissance : 10/03/2010                        │ │
│  │ 📍 Adresse : 123 Rue X, Lens 62300                   │ │
│  │ 📅 Membre depuis : 15/06/2024                         │ │
│  │                                                        │ │
│  │ [✏️ Modifier] [🗑️ Supprimer]                          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│ DOCUMENTS DU JOUEUR                                         │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📋 License - 15/06/2024                               │ │
│ │ 🏥 Medical - 14/06/2024                               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ HISTORIQUE                                                  │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ✅ 15/06/2024 - Jointure au club                       │ │
│ │ ✅ 01/07/2024 - Changement catégorie                   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Si permissions NON OK :

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ℹ️ Vous n'avez pas accès à ces informations                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Logique Permissions

### **Fonction Vérifier Permissions**

```typescript
function canViewCompleteProfile(viewerId: string, joueurId: string, clubId: string): boolean {
  const viewerRole = getUserRoleInClub(viewerId, clubId)
  const joueurTeamIds = getJoueurTeamIds(joueurId, clubId)
  
  // Président ou Intendant : voit tout
  if (viewerRole === 'président' || viewerRole === 'intendant') {
    return true
  }
  
  // Coach : voir si c'est ses joueurs
  if (viewerRole === 'coach') {
    const coachTeamIds = getCoachTeamIds(viewerId, clubId)
    return coachTeamIds.some(teamId => joueurTeamIds.includes(teamId))
  }
  
  // Tous les autres : non
  return false
}
```

---

## 📊 Structure Complète Page

### **TypeScript**

```typescript
export default function JoueurProfilePage() {
  const { clubId, joueurId } = useParams()
  const { user } = useAuth()
  
  // Joueur data
  const [joueur] = useState({ /* ... */ })
  
  // Vérifier permissions
  const canViewComplete = canViewCompleteProfile(
    user.id,
    joueurId,
    clubId
  )
  
  // Calculer âge
  const age = calculateAge(joueur.dateOfBirth)
  
  // Masquer contact
  const maskedContact = maskContact(joueur.email || joueur.phone)
  
  return (
    <div>
      {/* RÉCAP - Toujours visible */}
      <RecapCard 
        name={joueur.firstName}
        surname={joueur.lastName}
        age={age}
        year={joueur.dateOfBirth.getFullYear()}
        city={joueur.city}
        contact={maskedContact}
      />
      
      {/* INFOS COMPLÈTES - Si permissions */}
      {canViewComplete ? (
        <CompleteProfileCard joueur={joueur} />
      ) : (
        <LockedCard />
      )}
    </div>
  )
}
```

---

## 🎨 Design

### **Récap Card (Toujours Visible)**

```
┌──────────────────────────────────────────────────────┐
│  👤 JEAN DUPONT                                      │
│                                                      │
│  📅 13 ans (2010) • 📍 Lens • 📱 06...XX XX XX       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Style :**
- Fond blanc/gris clair
- Texte grand et lisible
- Icônes emoji
- Pas de boutons
- Compact

### **Infos Complètes Card (Si Permissions)**

```
┌──────────────────────────────────────────────────────┐
│ Fiche Complète                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 📧 Email : [complet]                               │
│ 📱 Téléphone : [complet]                            │
│ 🎂 Date Naissance : [date]                          │
│ 📍 Adresse : [complète]                             │
│ 📅 Membre depuis : [date]                           │
│                                                      │
│ [✏️ Modifier] [🗑️ Supprimer]                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### **Locked Card (Si PAS Permissions)**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ℹ️ Vous n'avez pas accès à ces informations        │
│                                                      │
│  Seuls le président, l'intendant ou le coach       │
│  (de son équipe) peuvent voir les infos complètes. │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Récap en haut (visible pour tous)
  - [ ] Nom + Prénom
  - [ ] Âge calculé
  - [ ] Année naissance
  - [ ] Ville
  - [ ] Contact masqué
  
- [ ] Infos Complètes (permissions)
  - [ ] Affichage si permissions OK
  - [ ] Message locked si pas permissions
  - [ ] Email complet
  - [ ] Téléphone complet
  - [ ] Date naissance
  - [ ] Adresse complète
  - [ ] Date membre
  - [ ] Boutons Modifier/Supprimer (si permissions)
  
- [ ] Documents (si permissions)
- [ ] Historique (si permissions)
- [ ] Responsive mobile

---

## 🚀 Prêt pour Claude Code ?

Oui ! Je crée le prompt mis à jour. 👇
