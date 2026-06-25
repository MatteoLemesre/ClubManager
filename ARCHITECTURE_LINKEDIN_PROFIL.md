# Architecture : Profil Joueur - Format LinkedIn

---

## 👤 PAGE PROFIL JOUEUR (Style LinkedIn)

### **Structure Générale**

```
┌──────────────────────────────────────────────────────────────┐
│ [← Retour]                                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    HEADER PROFIL                             │
│  (Fond bleu gradient + Photo profil + Infos principales)    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  1/ INFORMATIONS PERSONNELLES                                │
│     (Email, Téléphone, Date Naissance, Adresse, Ville)      │
│                                                              │
│  2/ RÔLES & EXPÉRIENCE (PARCOURS)                            │
│     (Clubs, Équipes, Catégories, Historique)                │
│                                                              │
│  3/ DOCUMENTS                                                │
│     (Licenses, Certificats, etc.)                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 SECTION 1 : HEADER PROFIL (Visible pour TOUS)

### **Design**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Fond Gradient Bleu]                                        │
│                                                              │
│  ┌────────┐                                                  │
│  │        │  👤 JEAN DUPONT                                 │
│  │ Avatar │  ⚽ Joueur • U-13 • Équipe A                    │
│  │        │  📍 Lens • 13 ans                               │
│  │        │                                                  │
│  └────────┘  [✏️ Modifier]  (si c'est son propre profil)    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Infos Affichées**

```
✅ Photo de Profil (Avatar)
✅ Nom + Prénom
✅ Rôle (Joueur/Coach)
✅ Catégorie (U-13, U-15, etc.)
✅ Équipe principale
✅ Localisation (Ville)
✅ Âge
✅ Bouton Modifier (si propre profil)
```

### **CSS**

```
- Background : Linear gradient blue (#0066cc → #003d99)
- Texte : Blanc
- Avatar : Cercle 100x100px
- Typography : Grande et lisible
- Bouton : Bleu clair, survolable
```

---

## 📋 SECTION 1 : INFORMATIONS PERSONNELLES

### **Affichage**

```
┌──────────────────────────────────────────────────────────────┐
│ 📋 INFORMATIONS PERSONNELLES                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📧 Email                                                    │
│     jean.dupont@example.com                                 │
│                                                              │
│  📱 Téléphone                                                │
│     06 12 34 56 78                                          │
│                                                              │
│  🎂 Date de Naissance                                        │
│     10 Mars 1997 (13 ans)                                   │
│                                                              │
│  📍 Adresse                                                  │
│     123 Rue X, Lens 62300, France                           │
│                                                              │
│  🏙️ Ville                                                    │
│     Lens                                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Permissions**

```
VISIBLE POUR :
✅ Tout le monde (si elle est publique)
✅ Seulement Pres/Intendant/Coach (si c'est un détail)

À décider selon ta logique
```

---

## 🎯 SECTION 2 : RÔLES & EXPÉRIENCE (PARCOURS)

### **Affichage**

```
┌──────────────────────────────────────────────────────────────┐
│ 🎖️ RÔLES & EXPÉRIENCE                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⚽ Joueur - Équipe A (Football)                        │ │
│  │   FC Lens                                              │ │
│  │   📅 Juin 2024 - Présent (depuis 1 an)                │ │
│  │                                                        │ │
│  │   Catégorie : U-13                                     │ │
│  │   Matches : 24                                         │ │
│  │   Buts : 5                                             │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⚽ Joueur - Équipe B (Football)                        │ │
│  │   FC Lens                                              │ │
│  │   📅 Juillet 2024 - Présent (depuis 5 mois)           │ │
│  │                                                        │ │
│  │   Catégorie : U-15                                     │ │
│  │   Matches : 12                                         │ │
│  │   Buts : 3                                             │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Infos par Rôle**

```
JOUEUR :
├── Équipe
├── Club
├── Catégorie
├── Date début - Date fin (ou "Présent")
├── Durée
├── Matches joués
├── Buts/Points
└── Description (optionnel)

COACH :
├── Équipe
├── Club
├── Catégories encadrées
├── Date début - Date fin (ou "Présent")
├── Durée
├── Matches dirigés
├── Palmarès/Résultats
└── Description

PRÉSIDENT/INTENDANT :
├── Rôle
├── Club
├── Date début - Date fin (ou "Présent")
├── Durée
└── Responsabilités
```

### **Permissions**

```
VISIBLE POUR :
✅ Tout le monde (infos publiques)
```

---

## 📄 SECTION 3 : DOCUMENTS

### **Affichage**

```
┌──────────────────────────────────────────────────────────────┐
│ 📄 DOCUMENTS                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 License                                                  │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 Jean_License_2024.pdf                             │  │
│  │    Délivré le : 15 Juin 2024                         │  │
│  │    Validité : 2024-2025                              │  │
│  │    [Télécharger]  [Supprimer] (si permissions)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🏥 Medical                                                  │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 Jean_Medical_2024.pdf                             │  │
│  │    Délivré le : 14 Juin 2024                         │  │
│  │    Validité : 2024-2025                              │  │
│  │    [Télécharger]  [Supprimer] (si permissions)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🛡️ Assurance                                                │
│  ────────────────────────────────────────────────────────   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 Insurance_Club_2024.pdf                           │  │
│  │    Délivré le : 01 Janvier 2024                      │  │
│  │    Validité : 2024-2025                              │  │
│  │    [Télécharger]                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### **Permissions**

```
VISIBLE POUR :
✅ Président/Intendant/Coach (ses équipes)

PAS VISIBLE POUR :
❌ Joueurs
❌ Autres visiteurs
```

---

## 🎨 Design Global (Style LinkedIn)

### **Couleurs**

```
Primary Blue : #0066cc
Light Blue   : #e0f0ff
Dark Blue    : #003d99
Neutral      : #6b7280
White        : #ffffff
Border       : #d1d5db
```

### **Typography**

```
Heading 1 (Nom) : 32px, Bold, #000000
Heading 2 (Section) : 24px, Bold, #0066cc
Body : 14px, Regular, #4b5563
Small : 12px, Regular, #6b7280
```

### **Spacing**

```
Section gap : 24px
Card padding : 16px
Item margin : 12px
Border radius : 8px
```

### **Cards**

```
Couleur : Blanc (#ffffff)
Border : 1px solid #d1d5db
Padding : 16px
Border radius : 8px
Shadow : Légère (shadow-sm)
Hover : Shadow augmente
```

---

## 📱 Layout Responsive

### **Desktop (≥ 768px)**

```
┌────────────────────┐
│   Header Profil    │ (full width)
├────────────────────┤
│  Section 1         │ (full width)
│  Section 2         │ (full width)
│  Section 3         │ (full width)
└────────────────────┘
```

### **Mobile (< 768px)**

```
┌──────────┐
│ Header   │ (adapté)
├──────────┤
│ Section  │ (stack)
│ Section  │
│ Section  │
└──────────┘

- Avatar réduit
- Texte compact
- Pas de colonnes
- Full width cards
```

---

## ✅ Checklist

- [ ] Header Profil (gradient + avatar + infos)
- [ ] Section 1 : Infos Perso
  - [ ] Email
  - [ ] Téléphone
  - [ ] Date naissance
  - [ ] Adresse
  - [ ] Ville
- [ ] Section 2 : Rôles & Expérience
  - [ ] Équipe/Club
  - [ ] Rôle
  - [ ] Catégorie/Dates
  - [ ] Stats (matches, buts, etc.)
- [ ] Section 3 : Documents
  - [ ] Groupés par type
  - [ ] Dates
  - [ ] Boutons Télécharger/Supprimer
- [ ] Permissions correctes
- [ ] Responsive mobile
- [ ] Style LinkedIn

---

## 🚀 Prêt pour Claude Code ?

Oui ! Je crée le prompt complet. 👇
