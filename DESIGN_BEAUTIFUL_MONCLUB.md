# Design "Mon Club" - Version Améliorée + Navigation Fixée

---

## 🎯 Navigation (FIXÉE)

### **QUI VOIT "MON CLUB" ?**

```
✅ PRÉSIDENT      → Voit "Mon Club"
✅ INTENDANT      → Voit "Mon Club"
✅ COACH          → Voit "Mon Club"
❌ JOUEUR         → N'a PAS "Mon Club"
❌ COMMUNAUTÉ     → N'a PAS "Mon Club"
```

### **Navigation Bottom/Top**

```
MON CLUB VISIBLE :
🏠 Home | 📰 Feed | 🏢 MON CLUB | ⚽ Équipes | 📅 Calendrier | 💬 Messages | 👤 Profil

MON CLUB INVISIBLE (Joueur/Communauté) :
🏠 Home | 📰 Feed | ⚽ Équipes | 📅 Calendrier | 💬 Messages | 👤 Profil
```

---

## 🎨 Design Amélioré (BEAU & MODERNE)

### **HEADER - Hero Section**

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ⚽ FC LENS                                            │ │
│  │  Football Club Lens                                   │ │
│  │                                                         │ │
│  │  🏆 Football • 📍 Lens • 👥 65 membres              │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Logo/Image du club]                                         │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Gradient Background: Blue -> Light Blue
Texte blanc
Icônes colorées
```

---

### **ONGLETS - Style Moderne**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  👥 Joueurs   │   📄 Documents   │   💰 Transactions   │ 📧 Invitations   │   ⚙️ Paramètres
│                                                                │
│  Underline bleu sous l'onglet actif                           │
│  Smooth transition                                             │
│  Hover effect (léger)                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📋 ONGLET 1 : JOUEURS (Beau Design)

```
╔════════════════════════════════════════════════════════════════╗
║                      👥 JOUEURS DU CLUB                        ║
║                    Gérer tous les membres                      ║
║                                                                ║
║  [+ Inviter un joueur]   🔍 Chercher...   [Filtres ∨]        ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │  👤 Jean Dupont                                        │  ║
║  │                                                         │  ║
║  │  ⚽ Joueur, U-13 • Équipe A                           │  ║
║  │  📧 jean@example.com • 📱 06 XX XX XX XX             │  ║
║  │                                                         │  ║
║  │  [Profil]  [Supprimer]                                 │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │  👤 Marc Martin                                        │  ║
║  │                                                         │  ║
║  │  🎓 Coach • Équipe B                                  │  ║
║  │  📧 marc@example.com • 📱 06 XX XX XX XX             │  ║
║  │                                                         │  ║
║  │  [Profil]  [Supprimer]                                 │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │                                                         │  ║
║  │  👤 Sophie Lemoine                                     │  ║
║  │                                                         │  ║
║  │  ⚽ Joueur, U-15 • Équipe A, Équipe B                │  ║
║  │  📧 sophie@example.com • 📱 06 XX XX XX XX           │  ║
║  │                                                         │  ║
║  │  [Profil]  [Supprimer]                                 │  ║
║  │                                                         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Style :
- Cards avec ombre douce
- Avatar (cercle) à gauche
- Icônes pour chaque info
- Boutons arrondis
- Hover : légère élévation
```

---

## 📄 ONGLET 2 : DOCUMENTS (Beau Design)

```
╔════════════════════════════════════════════════════════════════╗
║                  📄 DOCUMENTS ADMINISTRATIFS                   ║
║            Gérer les documents du club centralisés              ║
║                                                                ║
║  [+ Ajouter]   🔍 Chercher...                                 ║
║                                                                ║
║  [Tous] [📋 Licenses] [🏥 Médicaux] [🛡️ Assurances]         ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📋 LICENSES                                    (3 documents)  ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📄 Jean_License_2024.pdf                               │  ║
║  │    👤 Jean • 15/06/2024                                 │  ║
║  │    [Télécharger] [Supprimer]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📄 Marc_License_2024.pdf                               │  ║
║  │    👤 Marc • 14/06/2024                                 │  ║
║  │    [Télécharger] [Supprimer]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📄 Sophie_License_2024.pdf                             │  ║
║  │    👤 Sophie • 12/06/2024                               │  ║
║  │    [Télécharger] [Supprimer]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  🏥 MÉDICAUX                                    (2 documents)  ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📄 Marc_Medical_2024.pdf                               │  ║
║  │    👤 Marc • 14/06/2024                                 │  ║
║  │    [Télécharger] [Supprimer]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ 📄 Jean_Medical_2024.pdf                               │  ║
║  │    👤 Jean • 10/06/2024                                 │  ║
║  │    [Télécharger] [Supprimer]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Style :
- Groupes par catégorie
- Compteur documents par type
- Icons colorées par type
- Timeline vertical
- Minimaliste et clair
```

---

## 💰 ONGLET 3 : TRANSACTIONS (Beau Design)

```
╔════════════════════════════════════════════════════════════════╗
║                  💰 TRANSACTIONS DU CLUB                       ║
║                Suivi financier du club                         ║
║                                                                ║
║  [+ Ajouter une transaction]                                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────┬──────────────┬──────────────┐               ║
║  │              │              │              │               ║
║  │   💵 Solde   │   📈 Revenus │   📉 Dépenses               ║
║  │              │              │              │               ║
║  │   1500€      │   +2000€     │   -500€      │               ║
║  │   (bleu)     │   (vert)     │   (rouge)    │               ║
║  │              │              │              │               ║
║  └──────────────┴──────────────┴──────────────┘               ║
║                                                                ║
║  HISTORIQUE                                                    ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  💰 15/06/2024                                                 ║
║     Cotisation joueur                              +150€       ║
║     Par : Jean Dupont                                         ║
║                                                                ║
║  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ║
║                                                                ║
║  🛒 14/06/2024                                                 ║
║     Équipements                                   -200€        ║
║     Par : Marc Martin                                         ║
║                                                                ║
║  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ║
║                                                                ║
║  🎟️  13/06/2024                                                ║
║     Arbitrage match                                 -50€       ║
║     Par : Sophie Lemoine                                      ║
║                                                                ║
║  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ║
║                                                                ║
║  💰 12/06/2024                                                 ║
║     Adhésions                                     +500€        ║
║     Par : Jean Dupont                                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Style :
- Cards statistiques en haut
- Timeline verticale
- Diviseurs entre les entrées
- Icônes colorées par type
- Montants en gras + couleur
```

---

## 📧 ONGLET 4 : INVITATIONS (Beau Design)

```
╔════════════════════════════════════════════════════════════════╗
║                     📧 INVITATIONS                             ║
║                                                                ║
║  ┌───────────────────────────────┬─────────────────────────┐  ║
║  │   INVITER QUELQU'UN           │   INVITATIONS ENVOYÉES   │  ║
║  │                               │   (9 au total)          │  ║
║  ├───────────────────────────────┼─────────────────────────┤  ║
║  │                               │                         │  ║
║  │  📧 Email                     │  ┌───────────────────┐  │  ║
║  │  [exemple@mail.com____]       │  │ 📧 jean@.com      │  │  ║
║  │                               │  │ Coach • Équipe A  │  │  ║
║  │  👥 Rôle                      │  │ ⏳ En attente     │  │  ║
║  │  ○ Président                  │  │                   │  │  ║
║  │  ○ Intendant                  │  │ [× Annuler]      │  │  ║
║  │  ○ Coach                      │  └───────────────────┘  │  ║
║  │  ○ Joueur                     │                         │  ║
║  │                               │  ┌───────────────────┐  │  ║
║  │  ⚽ Équipe                     │  │ 📧 marc@.com      │  │  ║
║  │  [Équipe A     ∨]             │  │ Joueur • Équipe B │  │  ║
║  │                               │  │ ✅ Acceptée      │  │  ║
║  │  [Envoyer l'invitation]       │  │                   │  │  ║
║  │                               │  │ [✓]              │  │  ║
║  │                               │  └───────────────────┘  │  ║
║  │                               │                         │  ║
║  │                               │  ┌───────────────────┐  │  ║
║  │                               │  │ 📧 sophie@.com    │  │  ║
║  │                               │  │ Joueur • Équipe A │  │  ║
║  │                               │  │ ⏳ En attente     │  │  ║
║  │                               │  │                   │  │  ║
║  │                               │  │ [× Annuler]      │  │  ║
║  │                               │  └───────────────────┘  │  ║
║  │                               │                         │  ║
║  └───────────────────────────────┴─────────────────────────┘  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Style :
- 2 colonnes côte à côte
- Formulaire simple et épuré
- Badges colorés pour les statuts
- Cards invitation minimalistes
- Icônes de statut clairs
```

---

## ⚙️ ONGLET 5 : PARAMÈTRES (Beau Design)

```
╔════════════════════════════════════════════════════════════════╗
║                    ⚙️  PARAMÈTRES DU CLUB                     ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  📋 INFOS GÉNÉRALES                                           ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  ⚽ Nom du club                                                ║
║  [FC Lens_________________________]                            ║
║                                                                ║
║  🏆 Sport                                                      ║
║  [Football_________________________]                           ║
║                                                                ║
║  📍 Ville                                                      ║
║  [Lens____________________________]                            ║
║                                                                ║
║  📝 Description                                               ║
║  [Club de football basé à Lens                               ║
║   depuis 1995 avec 3 équipes...                              ║
║                                                               ║
║  ]                                                            ║
║                                                                ║
║  🖼️  Logo                                                      ║
║  [📷 Télécharger une image]                                   ║
║                                                                ║
║  [✅ Sauvegarder]  [❌ Annuler]                               ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ⚠️  ACTIONS DANGEREUSES                                       ║
║  ─────────────────────────────────────────────────────────────║
║                                                                ║
║  [🚪 Quitter le club]                                         ║
║  [🗑️  Supprimer le club]                                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Style :
- Sections clairement séparées
- Icônes avant chaque champ
- Inputs épurés
- Boutons d'action clairs
- Zone dangereuse à part
```

---

## 🎨 Palette de Couleurs

```
Primary Blue      : #0066cc
Light Blue        : #e0f0ff
Dark Blue         : #0050a0
Success Green     : #10b981
Error Red         : #ef4444
Warning Orange    : #f59e0b
Neutral Gray      : #6b7280
Light Gray        : #f3f4f6
White             : #ffffff
Dark              : #1f2937
```

---

## 🎭 Éléments de Design

```
✅ Cards avec ombre douce (shadow-sm)
✅ Bordures légères (border-gray-200)
✅ Icônes emoji pour rapidité
✅ Spacing cohérent (Tailwind)
✅ Hover effects subtils
✅ Transitions smooth
✅ Responsive (mobile-first)
✅ Gradient backgrounds optionnels
✅ Typography hiérarchisée
✅ Focus states pour accessibilité
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px):
├── Stack vertical (colonnes → rangées)
├── Header compact
├── Cards pleine largeur
└── Onglets scrollable

Tablet (640px - 1024px):
├── 2 colonnes où applicable
├── Spacing augmenté
└── Cards en grille

Desktop (> 1024px):
├── Layout complet
├── 2-3 colonnes
└── Spacing maximum
```

---

## ✅ À Faire

- [ ] Retirer "Mon Club" de la nav pour Joueur/Communauté
- [ ] Ajouter Hero Section avec infos club
- [ ] Mettre à jour tous les onglets avec ce design
- [ ] Ajouter ombre/transitions
- [ ] Tester responsive
- [ ] Tester sur mobile

---

## 🚀 Prêt pour Claude Code ?

Oui ! Je crée le prompt pour implémenter ce design. 👇
