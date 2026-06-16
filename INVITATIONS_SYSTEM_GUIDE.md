# Guide : Nouveau Système d'Invitations et Rôles aux Clubs

---

## 📋 Contexte Actuel → Nouveau

### ❌ AVANT
- Coachs envoient notif au président (attente validation)
- Joueurs envoient notif aux coachs et président (attente validation)
- Système de validation complexe

### ✅ APRÈS
- Système hiérarchique d'invitations
- Acceptation/Refus simple
- Changement de statut automatique à l'acceptation

---

## 🏗️ Nouvelle Hiérarchie d'Invitations

### **CAS 1 : Club n'existe pas**

```
1. PRÉSIDENT crée le club
   ↓
2. PRÉSIDENT invite CO-PRÉSIDENT(S)
   → Ils deviennent tous PRÉSIDENT du club
   ↓
3. PRÉSIDENT(S) invitent INTENDANT(S)
   ↓
4. PRÉSIDENT(S) + INTENDANT(S) invitent COACH(S)
   ↓
5. PRÉSIDENT(S) + INTENDANT(S) + COACH(S) invitent JOUEUR(S)
```

### **CAS 2 : Club existe**

**Condition importante :**
```
Un PRÉSIDENT ne peut quitter le club que s'il existe 
au minimum UN AUTRE PRÉSIDENT dans le club.
```

Puis même logique que CAS 1.

---

## 💌 Notification d'Invitation

### Contenu de l'invitation reçue :

```
┌─────────────────────────────┐
│   Invitation au Club        │
├─────────────────────────────┤
│ Club:      [Nom du club]    │
│ Sport:     [Football, ...]  │
│ Rôle:      [Président,      │
│            Intendant,       │
│            Coach,           │
│            Joueur]          │
│ Catégorie: [U-13, U-15...] │
│            (si Coach/Joueur)│
├─────────────────────────────┤
│ [✅ Accepter] [❌ Refuser] │
└─────────────────────────────┘
```

### Actions :

**Si REFUSER :**
```
→ Rien ne se passe
→ L'utilisateur reste dans son état actuel
→ L'invitation disparaît
```

**Si ACCEPTER :**
```
→ Profil/Statut de l'utilisateur change
→ Utilisateur devient [RÔLE] du [CLUB]
→ Invitation acceptée
→ Accès aux pages du club
```

---

## 🔧 Modifications à Faire

### 1. **Schema/Model (Database)**

#### Nouvelle table : `ClubInvitations`
```typescript
interface ClubInvitation {
  id: string
  clubId: string
  clubName: string
  sport: string
  invitedUserId: string
  invitedUserEmail: string
  invitingUserId: string        // Qui envoie l'invitation
  role: 'president' | 'intendant' | 'coach' | 'joueur'
  category?: string             // U-13, U-15, etc. (coach/joueur)
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  expiresAt?: Date              // Optionnel : expiration
}
```

#### Mettre à jour : `User` (ajouter champs)
```typescript
interface User {
  // ... existant
  clubRoles: {
    [clubId: string]: {
      role: 'president' | 'intendant' | 'coach' | 'joueur'
      category?: string
      joinedAt: Date
    }
  }
}
```

### 2. **Pages à Créer/Modifier**

#### Créer : `InvitationsPage.tsx`
```
- Affiche toutes les invitations en attente de l'utilisateur
- Pour chaque invitation :
  - Info du club (nom, sport, rôle, catégorie)
  - Boutons [Accepter] [Refuser]
  - Gestion des actions
```

#### Modifier : `PresidentPage.tsx` (Mon club → Gestion)
```
- Section "Inviter des personnes"
- Input pour email/nom
- Dropdown pour sélectionner rôle
- Input catégorie (si coach/joueur)
- Bouton "Inviter"
- Liste des invitations envoyées (pending/accepted)
- Gérer les membres actuels (view, remove, change role?)
```

#### Modifier : `ProfilePage.tsx`
```
- Afficher tous les clubs de l'utilisateur avec ses rôles
- Pour chaque club : role + catégorie
- Bouton "Quitter" (avec condition : pas seul président)
```

### 3. **API/Endpoints à Créer**

```typescript
// Envoyer une invitation
POST /api/clubs/{clubId}/invitations
{
  invitedEmail: string
  role: 'president' | 'intendant' | 'coach' | 'joueur'
  category?: string
}
→ Retourne : ClubInvitation

// Accepter une invitation
PUT /api/invitations/{invitationId}/accept
→ Met à jour User + invitation status → 'accepted'

// Refuser une invitation
PUT /api/invitations/{invitationId}/reject
→ Supprime invitation ou status → 'rejected'

// Lister invitations de l'utilisateur
GET /api/invitations/pending
→ Retourne : ClubInvitation[]

// Vérifier permissions (peut inviter qui ?)
GET /api/clubs/{clubId}/invitation-permissions
→ Retourne : { canInviteCoach: boolean, canInviteJoueur: boolean, ... }

// Quitter un club
DELETE /api/clubs/{clubId}/membership
→ Vérifie condition (si président, au moins 1 autre président existe)
```

### 4. **Logique de Permissions**

```typescript
// Qui peut inviter qui ?

function canInvite(inviter: User, clubId: string, role: string) {
  const inviterRole = inviter.clubRoles[clubId]?.role
  
  switch (inviterRole) {
    case 'president':
      // Peut inviter : co-president, intendant, coach, joueur
      return ['president', 'intendant', 'coach', 'joueur'].includes(role)
    
    case 'intendant':
      // Peut inviter : coach, joueur
      return ['coach', 'joueur'].includes(role)
    
    case 'coach':
      // Peut inviter : joueur
      return role === 'joueur'
    
    case 'joueur':
      // Ne peut inviter personne
      return false
  }
}

// Peut quitter le club ?

function canLeaveClub(user: User, clubId: string) {
  const userRole = user.clubRoles[clubId]?.role
  
  if (userRole !== 'president') return true
  
  // Si président, vérifier s'il existe un autre président
  const otherPresidents = club.members.filter(
    m => m.userId !== user.id && m.role === 'president'
  )
  
  return otherPresidents.length > 0
}
```

### 5. **UI Components à Créer**

```typescript
// InvitationCard.tsx
- Affiche 1 invitation
- Info : club, sport, rôle, catégorie
- Boutons : Accepter / Refuser

// InviteMemberForm.tsx
- Input : email/search
- Dropdown : rôle
- Input : catégorie (conditionnel)
- Bouton : Inviter

// ClubMembersManager.tsx
- Liste des membres du club
- Rôles
- Actions (remove, etc.)
```

---

## 📝 Checklist d'Implémentation

### Backend :
- [ ] Créer/mettre à jour models (ClubInvitation, User)
- [ ] Créer endpoints d'invitations
- [ ] Implémenter logique de permissions
- [ ] Implémenter logique de "quitter club"
- [ ] Ajouter validations

### Frontend :
- [ ] Créer InvitationsPage.tsx
- [ ] Créer InvitationCard.tsx
- [ ] Créer InviteMemberForm.tsx
- [ ] Modifier PresidentPage.tsx (section invitations)
- [ ] Modifier ProfilePage.tsx (afficher clubs + rôles)
- [ ] Ajouter navigation vers InvitationsPage
- [ ] Tester flux complet

### UX :
- [ ] Messages de confirmation/erreur
- [ ] Toasts pour actions (invitation envoyée, acceptée, etc.)
- [ ] Loading states
- [ ] Validation des emails

---

## 🎯 Flux d'Exemple Complet

### Scénario : Matteo (président) invite Jean (futur joueur)

```
1. Matteo va dans "Mon club" → "Gérer les membres"
2. Click "Inviter une personne"
3. Entre : jean@email.com
4. Sélectionne : Rôle = "Joueur", Catégorie = "U-13"
5. Click "Inviter"
6. ✅ "Invitation envoyée à jean@email.com"

---

7. Jean reçoit une notification
8. Clique sur "Voir invitations"
9. Voit : "FC Lens vous invite comme Joueur U-13"
10. Click "Accepter"
11. ✅ Jean devient Joueur U-13 de FC Lens
12. Jean a accès à la page du club, calendrier, etc.

---

13. Si Jean clique "Refuser"
14. → Invitation refusée, Jean reste dans son état
```

---

## 🔄 Migration des Données (si club existe déjà)

Pour les clubs existants, il faut :
- Récupérer les membres actuels
- Créer les entrées `User.clubRoles` correspondantes
- Supprimer les anciennes notifications
- Marquer les "demandes" existantes comme acceptées

```typescript
// Exemple migration
async function migrateExistingClubs() {
  const clubs = await Club.find()
  
  for (const club of clubs) {
    for (const member of club.members) {
      // Ajouter rôle au profil utilisateur
      await User.updateOne(
        { _id: member.userId },
        { $set: { [`clubRoles.${club._id}`]: { role: member.role } } }
      )
    }
  }
}
```

---

## 💡 Notes Importantes

1. **Permissions strictes** : Vérifier côté backend qui peut inviter qui
2. **Validation email** : S'assurer que l'email existe dans la DB
3. **Notifications** : Notifier l'utilisateur quand il reçoit une invitation
4. **Expiration** : Optionnel : les invitations expirent après 30j
5. **Confirmation** : Avant quitter un club comme seul président, confirmer
6. **Historique** : Garder un log des invitations (accepted/rejected)

---

## 📚 Fichiers à Créer/Modifier

```
packages/web/src/
├── api/
│   └── clubs.ts                     [Modifier] + endpoints invitations
├── pages/app/
│   ├── PresidentPage.tsx            [Modifier] + section invitations
│   ├── ProfilePage.tsx              [Modifier] + afficher clubs
│   └── InvitationsPage.tsx          [CRÉER]
├── components/
│   ├── InvitationCard.tsx           [CRÉER]
│   ├── InviteMemberForm.tsx         [CRÉER]
│   └── ClubMembersManager.tsx       [CRÉER]
└── context/
    └── AuthContext.tsx              [Modifier] + clubRoles
```

---

## ✅ Prêt pour Claude Code ?

Oui ! Donne ce guide à Claude Code avec le prompt ci-dessous.
