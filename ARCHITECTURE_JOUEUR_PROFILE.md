# Architecture : Profil Joueur + Suppression Documents

---

## 🎯 Changements

### **AVANT**
```
Page "Mon Club"
├── Onglet Joueurs
├── Onglet Documents       ← À SUPPRIMER
├── Onglet Transactions
├── Onglet Invitations
└── Onglet Paramètres
```

### **APRÈS**
```
Page "Mon Club"
├── Onglet Joueurs
│  └── Clic sur "Profil" → Page JoueurProfilePage.tsx
│     ├── Fiche Joueur (infos perso)
│     ├── Documents du Joueur
│     └── Historique
├── Onglet Transactions
├── Onglet Invitations
└── Onglet Paramètres
```

---

## 📄 ONGLET JOUEURS (Modified)

### **Affichage**

```
┌────────────────────────────────────────────────────────────┐
│ 👥 JOUEURS DU CLUB                   [+ Inviter]          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 🔍 Chercher un joueur...                                  │
│                                                            │
│ [Tous] [Équipe A] [Équipe B]                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 👤 Jean Dupont                                       │  │
│ │ ⚽ Joueur, U-13 • Équipe A                           │  │
│ │ 📧 jean@example.com • 📱 06 XX XX XX XX             │  │
│ │ [Profil] ← CLIQUE ICI                                │  │
│ │ [Supprimer]                                          │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 👤 Marc Martin                                       │  │
│ │ 🎓 Coach • Équipe B                                 │  │
│ │ 📧 marc@example.com • 📱 06 XX XX XX XX             │  │
│ │ [Profil]  [Supprimer]                                │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Logique**

```typescript
// Quand on clique sur [Profil]
onClick={() => navigate(`/mon-club/${clubId}/joueur/${joueur.id}`)}

// Navigue vers :
/mon-club/club-1/joueur/joueur-1
```

---

## 👤 PAGE PROFIL JOUEUR (NOUVELLE)

### **Path**
```
packages/web/src/pages/app/JoueurProfilePage.tsx
```

### **URL**
```
/mon-club/:clubId/joueur/:joueurId
```

### **Structure**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [← Retour]                                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  FICHE JOUEUR                                          │ │
│  │  ════════════════════════════════════════════════════ │ │
│  │                                                        │ │
│  │  👤 Jean Dupont                                        │ │
│  │                                                        │ │
│  │  ⚽ Joueur, U-13                                       │ │
│  │  📍 Équipe A                                           │ │
│  │  📅 Inscrit depuis : 15/06/2024                        │ │
│  │                                                        │ │
│  │  📧 Email : jean@example.com                           │ │
│  │  📱 Tél : 06 XX XX XX XX                              │ │
│  │  🎂 Né le : 10/03/2010                                 │ │
│  │  📍 Adresse : 123 Rue X, Lens                         │ │
│  │                                                        │ │
│  │  [Modifier le profil] [Supprimer] [Retour]            │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  DOCUMENTS DU JOUEUR                                         │
│  ════════════════════════════════════════════════════════   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ 📋 License                           │                   │
│  │ Jean_License_2024.pdf                │                   │
│  │ 📅 15/06/2024                        │                   │
│  │ [Télécharger] [Supprimer]            │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ 🏥 Medical                           │                   │
│  │ Jean_Medical_2024.pdf                │                   │
│  │ 📅 14/06/2024                        │                   │
│  │ [Télécharger] [Supprimer]            │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  [+ Ajouter un document]                                     │
│                                                              │
│  HISTORIQUE                                                  │
│  ════════════════════════════════════════════════════════   │
│                                                              │
│  Rejoins le 15/06/2024                                       │
│  Équipe : Équipe A (U-13)                                    │
│  Statut : Actif                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Sections de la Page

### **1. FICHE JOUEUR**

```
┌──────────────────────────────────────────┐
│ Avatar (optionnel)                       │
├──────────────────────────────────────────┤
│                                          │
│ 👤 JEAN DUPONT                          │
│                                          │
│ ⚽ Joueur, Catégorie U-13                │
│ 📍 Équipe A                              │
│ 📅 Membre depuis 15/06/2024              │
│                                          │
├──────────────────────────────────────────┤
│ INFOS DE CONTACT                         │
│ ────────────────────────────────────────│
│                                          │
│ 📧 Email : jean@example.com              │
│ 📱 Téléphone : 06 XX XX XX XX            │
│ 🎂 Date Naissance : 10/03/2010           │
│ 📍 Adresse : 123 Rue X, Lens             │
│                                          │
├──────────────────────────────────────────┤
│ ACTIONS                                  │
│                                          │
│ [✏️ Modifier] [🗑️ Supprimer]             │
│                                          │
└──────────────────────────────────────────┘
```

### **2. DOCUMENTS DU JOUEUR**

```
┌──────────────────────────────────────────┐
│ 📋 DOCUMENTS                             │
│ [+ Ajouter un document]                  │
├──────────────────────────────────────────┤
│                                          │
│ 📋 License                               │
│ ────────────────────────────────────────│
│ Jean_License_2024.pdf                    │
│ 📅 15/06/2024                            │
│ [Télécharger] [Supprimer]                │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│ 🏥 Medical                               │
│ ────────────────────────────────────────│
│ Jean_Medical_2024.pdf                    │
│ 📅 14/06/2024                            │
│ [Télécharger] [Supprimer]                │
│                                          │
└──────────────────────────────────────────┘
```

### **3. HISTORIQUE (optionnel)**

```
┌──────────────────────────────────────────┐
│ 📝 HISTORIQUE                            │
├──────────────────────────────────────────┤
│                                          │
│ ✅ 15/06/2024 - Jointure au club        │
│    Équipe : Équipe A (U-13)              │
│                                          │
│ ✅ 01/07/2024 - Changement catégorie    │
│    U-13 → U-15                           │
│                                          │
│ ✅ 01/08/2024 - Transfert équipe        │
│    Équipe A → Équipe B                   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎨 Design

### **Style**

```
- Hero section bleu (comme Mon Club)
- Fiche joueur en card
- Documents en liste/grille
- Bouton retour en haut
- Responsive mobile
- Icons emoji
```

### **Couleurs**

```
Primary : #0066cc
Light : #e0f0ff
Neutral : #6b7280
Success : #10b981
Error : #ef4444
```

---

## 📱 Responsive

### **Mobile (< 640px)**
```
- Stack vertical
- Fiche joueur pleine largeur
- Documents en liste (1 colonne)
- Boutons empilés
```

### **Desktop (≥ 640px)**
```
- Fiche joueur à gauche
- Documents à droite
- 2 colonnes pour documents
- Boutons inline
```

---

## 🔄 Navigation

### **Flux**

```
MonClubPage (Onglet Joueurs)
         ↓ (clic "Profil")
JoueurProfilePage
         ↓ (clic "← Retour")
MonClubPage
```

### **Route**

```typescript
// App.tsx
{
  path: '/mon-club/:clubId/joueur/:joueurId',
  element: <JoueurProfilePage />
}
```

---

## 👥 Permissions

### **QUI PEUT VOIR ?**

```
Président/Intendant : Tous les joueurs ✅
Coach               : Joueurs de ses équipes ✅
Joueur              : Son profil uniquement ✅
Communauté          : Aucun accès ❌
```

### **QUI PEUT MODIFIER/SUPPRIMER ?**

```
Président/Intendant : Oui ✅
Coach               : Non (sauf ses joueurs) ❌
Joueur              : Son profil seulement ✅
```

---

## ✅ À Faire

- [ ] Supprimer l'onglet Documents de MonClubPage
- [ ] Créer JoueurProfilePage.tsx
- [ ] Ajouter route dans App.tsx
- [ ] Créer fiche joueur
- [ ] Afficher documents du joueur
- [ ] Ajouter bouton retour
- [ ] Tester permissions
- [ ] Responsive mobile

---

## 📊 Structure Fichiers

```
packages/web/src/pages/app/
├── MonClubPage.tsx (modifiée - sans Documents)
├── JoueurProfilePage.tsx (NOUVELLE)
│
└── club-tabs/
   ├── JoueursTab.tsx (modifiée - navigation vers profil)
   ├── TransactionsTab.tsx
   ├── InvitationsTab.tsx
   └── ParametresTab.tsx
```

---

## 🚀 Prêt pour Claude Code ?

Oui ! Je crée le prompt complet. 👇
