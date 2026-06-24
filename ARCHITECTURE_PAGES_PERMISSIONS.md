# Architecture Pages & Permissions par Rôle

---

## 🎯 Vue d'Ensemble

```
PRÉSIDENT
├── Peut inviter : Président, Intendant, Coach, Joueur
├── Voir/modifier : Tout le club
└── Accès : Tous les onglets

INTENDANT
├── Peut inviter : Coach, Joueur UNIQUEMENT
├── Voir/modifier : Tout le club (sauf infos club)
└── Accès : Tous les onglets sauf paramètres modif

COACH
├── Peut inviter : Joueur UNIQUEMENT (dans ses équipes)
├── Voir/modifier : Ses équipes seulement
└── Accès : Onglets limités

JOUEUR
├── Ne peut rien faire
└── Lecture seulement
```

---

## 📄 PAGE : MON CLUB

### **Vue Générale**

```
┌─────────────────────────────────────────────────┐
│  MON CLUB - [Nom Club] - [Sport]                │
├─────────────────────────────────────────────────┤
│ Onglets:                                        │
│ [Joueurs] [Documents] [Transactions] [Invit...] [Paramètres]
├─────────────────────────────────────────────────┤
│  Contenu de l'onglet sélectionné                │
└─────────────────────────────────────────────────┘
```

### **SUPPRIMÉ**
❌ Onglet "Statistiques par équipe" → SUPPRIMÉ COMPLÈTEMENT

---

## 👥 ONGLET 1 : JOUEURS

### **PRÉSIDENT & INTENDANT**

```
┌─────────────────────────────────────┐
│ JOUEURS DU CLUB                     │
├─────────────────────────────────────┤
│                                     │
│ [Champ recherche]                   │
│                                     │
│ Liste:                              │
│ ├── Jean (Joueur U-13, Équipe A)   │
│ │   ├── [Voir Profil]              │
│ │   ├── [Documents]                │
│ │   └── [Supprimer du club]        │
│ ├── Marc (Coach, Équipe B)         │
│ └── ...                             │
│                                     │
│ [+ Inviter un joueur]               │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir tous les joueurs du club
- ✅ Voir profil d'un joueur
- ✅ Voir documents d'un joueur
- ✅ Supprimer un joueur du club
- ✅ Inviter un joueur

### **COACH**

❌ **N'a PAS d'onglet JOUEURS**
- Voit ses équipes dans une autre page
- Peut inviter joueurs directement depuis ses équipes

### **JOUEUR**

```
┌─────────────────────────────────────┐
│ MES ÉQUIPES                         │
├─────────────────────────────────────┤
│                                     │
│ ├── Équipe A (Football U-13)       │
│ │   ├── Coach : Jean               │
│ │   └── 15 joueurs                 │
│ └── Équipe B (Football U-15)       │
│     ├── Coach : Marc               │
│     └── 12 joueurs                 │
│                                     │
└─────────────────────────────────────┘
```

**Lecture seulement.**

---

## 📋 ONGLET 2 : DOCUMENTS ADMINISTRATIFS

### **PRÉSIDENT & INTENDANT**

```
┌─────────────────────────────────────┐
│ DOCUMENTS DU CLUB                   │
├─────────────────────────────────────┤
│                                     │
│ Filtrer par type :                  │
│ [Tous] [Licences] [Médicaux]       │
│ [Assurances]                        │
│                                     │
│ Documents:                          │
│ ├── Jean_License_2024.pdf          │
│ │   ├── Joueur: Jean               │
│ │   ├── Type: License              │
│ │   └── [Télécharger] [Supprimer]  │
│ ├── Marc_Medical_2024.pdf          │
│ └── ...                             │
│                                     │
│ [+ Ajouter un document]             │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir TOUS les documents du club
- ✅ Filtrer par type
- ✅ Ajouter documents
- ✅ Supprimer documents

### **COACH**

```
┌─────────────────────────────────────┐
│ DOCUMENTS DE MES ÉQUIPES            │
├─────────────────────────────────────┤
│                                     │
│ Équipe A (Football U-13)           │
│ ├── Jean_License_2024.pdf          │
│ ├── [Télécharger] [Supprimer*]     │
│ └── ...                             │
│                                     │
│ Équipe B (Football U-15)           │
│ └── ...                             │
│                                     │
│ [+ Ajouter un document]             │
│ (*) Dépend des permissions          │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir documents de SES ÉQUIPES seulement
- ✅ Ajouter documents
- ⚠️ Supprimer : Uniquement si c'est un document qu'il a créé

### **JOUEUR**

```
┌─────────────────────────────────────┐
│ MES DOCUMENTS                       │
├─────────────────────────────────────┤
│                                     │
│ ├── Ma_License_2024.pdf            │
│ ├── Mon_Medical_2024.pdf           │
│ └── ...                             │
│                                     │
│ [Télécharger uniquement]            │
└─────────────────────────────────────┘
```

**Lecture seulement** (ses propres documents).

---

## 💰 ONGLET 3 : TRANSACTIONS

### **PRÉSIDENT & INTENDANT**

```
┌─────────────────────────────────────┐
│ TRANSACTIONS DU CLUB                │
├─────────────────────────────────────┤
│                                     │
│ Solde total : 1500€                │
│ Revenus : +2000€ | Dépenses: -500€ │
│                                     │
│ Historique:                         │
│ ├── 15/06 | Cotisation joueur      │
│ │   Montant: +150€ | Par: Jean     │
│ ├── 14/06 | Équipements            │
│ │   Montant: -200€ | Par: Marc     │
│ └── ...                             │
│                                     │
│ [+ Ajouter une transaction]         │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir toutes les transactions
- ✅ Voir qui a créé chaque transaction
- ✅ Ajouter transaction
- ✅ Voir statistiques (total, revenus, dépenses)

### **COACH**

```
┌─────────────────────────────────────┐
│ MES TRANSACTIONS                    │
├─────────────────────────────────────┤
│                                     │
│ Historique de MES transactions:    │
│ ├── 15/06 | Équipements Équipe A   │
│ │   Montain: -100€                 │
│ ├── 14/06 | Arbitrage              │
│ │   Montain: -50€                  │
│ └── ...                             │
│                                     │
│ [+ Ajouter une transaction]         │
│                                     │
│ NOTE: Ne voit que ce qu'il a créé   │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir UNIQUEMENT ses transactions
- ✅ Ajouter transaction
- ❌ Voir transactions des autres

### **JOUEUR**

❌ **N'a PAS accès à cet onglet**

---

## 📧 ONGLET 4 : INVITATIONS

### **PRÉSIDENT**

```
┌─────────────────────────────────────┐
│ INVITER QUELQU'UN                   │
├─────────────────────────────────────┤
│                                     │
│ Email : [________________]          │
│                                     │
│ Rôle :                              │
│ (o) Président                       │
│ (o) Intendant                       │
│ (o) Coach                           │
│ (o) Joueur                          │
│                                     │
│ Équipe (si Coach/Joueur):          │
│ [Dropdown : Équipe A, Équipe B...] │
│                                     │
│ [Envoyer l'invitation]              │
│                                     │
├─────────────────────────────────────┤
│ INVITATIONS ENVOYÉES                │
│                                     │
│ ├── jean@email.com - Coach (pending)│
│ └── marc@email.com - Joueur (✓ acc)│
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Inviter TOUS les rôles : Président, Intendant, Coach, Joueur
- ✅ Sélectionner équipe (si Coach/Joueur)
- ✅ Voir invitations envoyées

### **INTENDANT**

```
┌─────────────────────────────────────┐
│ INVITER QUELQU'UN                   │
├─────────────────────────────────────┤
│                                     │
│ Email : [________________]          │
│                                     │
│ Rôle :                              │
│ (o) Coach          ← UNIQUEMENT     │
│ (o) Joueur         ← UNIQUEMENT     │
│                                     │
│ ❌ Pas Président                     │
│ ❌ Pas Intendant                     │
│                                     │
│ Équipe (si Coach/Joueur):          │
│ [Dropdown : Équipe A, Équipe B...] │
│                                     │
│ [Envoyer l'invitation]              │
│                                     │
├─────────────────────────────────────┤
│ INVITATIONS ENVOYÉES                │
│ ...                                 │
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Inviter UNIQUEMENT : Coach, Joueur
- ❌ Pas Président
- ❌ Pas Intendant
- ✅ Sélectionner équipe

### **COACH**

```
┌─────────────────────────────────────┐
│ INVITER UN JOUEUR                   │
├─────────────────────────────────────┤
│                                     │
│ Email : [________________]          │
│                                     │
│ Rôle : Joueur (fixe)               │
│                                     │
│ Équipe (obligatoire):              │
│ [Dropdown: Équipe A, Équipe B...] │
│ (Uniquement ses équipes)            │
│                                     │
│ [Envoyer l'invitation]              │
│                                     │
├─────────────────────────────────────┤
│ MES INVITATIONS ENVOYÉES            │
│ ├── jean@email.com - Joueur Éq. A   │
│ └── ...                             │
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Inviter UNIQUEMENT des joueurs
- ✅ Sélectionner équipe (SES équipes seulement)
- ❌ Inviter Coach ou Président/Intendant

### **JOUEUR**

❌ **N'a PAS d'onglet INVITATIONS**

---

## ⚙️ ONGLET 5 : PARAMÈTRES

### **PRÉSIDENT**

```
┌─────────────────────────────────────┐
│ PARAMÈTRES DU CLUB                  │
├─────────────────────────────────────┤
│                                     │
│ Nom du club : [________________]   │
│ Sport : [Football________v]         │
│ Ville : [________________]          │
│ Logo : [Télécharger]                │
│ Description : [_____________________]
│                                     │
│ [✅ Sauvegarder] [Annuler]          │
│                                     │
├─────────────────────────────────────┤
│ DANGER ZONE                         │
│ [Supprimer le club]                 │
│ [Quitter le club] (si autre pres)  │
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Modifier TOUTES les infos du club
- ✅ Supprimer le club
- ✅ Quitter le club (si un autre président existe)

### **INTENDANT & COACH**

```
┌─────────────────────────────────────┐
│ INFOS DU CLUB (Lecture)             │
├─────────────────────────────────────┤
│                                     │
│ Nom du club : Football Club Lens   │
│ Sport : Football                    │
│ Ville : Lens                        │
│ Description : ...                   │
│                                     │
│ ❌ Pas de bouton modifier            │
│                                     │
├─────────────────────────────────────┤
│ ACTIONS                             │
│ [Quitter le club]                   │
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir infos du club
- ❌ Modifier infos
- ✅ Quitter le club

### **JOUEUR**

```
┌─────────────────────────────────────┐
│ MON PROFIL DANS LE CLUB             │
├─────────────────────────────────────┤
│                                     │
│ Rôle : Joueur                       │
│ Équipes : Équipe A, Équipe B       │
│ Catégories : U-13, U-15             │
│ Depuis : 15/06/2024                 │
│                                     │
│ [Quitter le club]                   │
│                                     │
└─────────────────────────────────────┘
```

**Actions :**
- ✅ Voir infos
- ✅ Quitter le club

---

## 🔐 Matrice des Permissions

| Action | Président | Intendant | Coach | Joueur |
|--------|-----------|-----------|-------|--------|
| **JOUEURS** | Voir/Gérer tous | Voir/Gérer tous | ❌ | ❌ |
| **DOCUMENTS** | Voir/Créer tous | Voir/Créer tous | Ses équipes | Ses docs |
| **TRANSACTIONS** | Voir toutes | Voir toutes | Ses trans | ❌ |
| **INVITER Président** | ✅ | ❌ | ❌ | ❌ |
| **INVITER Intendant** | ✅ | ❌ | ❌ | ❌ |
| **INVITER Coach** | ✅ | ✅ | ❌ | ❌ |
| **INVITER Joueur** | ✅ | ✅ | ✅ | ❌ |
| **MODIFIER Club** | ✅ | ❌ | ❌ | ❌ |
| **QUITTER Club** | ✅* | ✅ | ✅ | ✅ |

*Président : seulement si autre président existe

---

## 📝 Structure Frontend

```
packages/web/src/pages/app/
├── MonClubPage.tsx (wrapper avec onglets)
│
├── club-tabs/
│  ├── JoueursTab.tsx (Pres/Intendant seulement)
│  ├── DocumentsTab.tsx (Tous, mais contenu différent)
│  ├── TransactionsTab.tsx (Tous, mais contenu différent)
│  ├── InvitationsTab.tsx (Tous, mais contenu différent)
│  └── ParametresTab.tsx (Tous, mais contenu différent)
│
└── components/
   ├── RoleGuard.tsx (wrapper pour permissions)
   ├── InviteForm.tsx (formulaire dynamique)
   └── DocumentUpload.tsx
```

---

## 🎯 Logique d'Affichage (TypeScript)

```typescript
// Déterminer les onglets visibles
function getVisibleTabs(userRole: string, clubId: string) {
  const baseTabs = ['documents', 'transactions', 'invitations', 'parametres']
  
  if (userRole === 'président' || userRole === 'intendant') {
    return ['joueurs', ...baseTabs] // Ajoute JOUEURS
  }
  
  if (userRole === 'coach') {
    return baseTabs // Sans JOUEURS
  }
  
  if (userRole === 'joueur') {
    return ['parametres'] // Seulement PARAMETRES
  }
}

// Déterminer les rôles qu'on peut inviter
function getInvitableRoles(userRole: string) {
  if (userRole === 'président') {
    return ['président', 'intendant', 'coach', 'joueur']
  }
  if (userRole === 'intendant') {
    return ['coach', 'joueur']
  }
  if (userRole === 'coach') {
    return ['joueur']
  }
  return []
}
```

---

## ✅ À Faire

- [ ] Créer MonClubPage.tsx (router onglets par rôle)
- [ ] Créer onglets (JoueursTab, DocumentsTab, etc.)
- [ ] Créer RoleGuard.tsx
- [ ] Créer InviteForm.tsx dynamique
- [ ] Supprimer onglet "Statistiques" complètement
- [ ] Tester permissions pour chaque rôle
- [ ] Tester invitations par rôle

---

## 🚀 Prêt pour Claude Code ?

Oui ! Donne-lui le prompt ci-après. 👇
