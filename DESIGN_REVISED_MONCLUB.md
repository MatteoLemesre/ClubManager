# Design Révisé : Page "Mon Club" + Navigation

---

## 🎨 Design Nouveau

### **Avant (Problèmes)**
```
- Onglets trop simples
- Pas hiérarchie visuelle claire
- Coach pas visible dans nav
- Layout pas responsive
```

### **Après (Amélioré)**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 Home  │ 📰 Feed  │ 🏢 MON CLUB  │ ⚽ Équipes  │ 📅 Calendrier
│                      │ 💬 Messages  │ 👤 Profil
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MON CLUB                                                   │
│  FC Lens • Football • Lens                                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [Joueurs] [Documents] [Transactions] [Invitations]  │  │
│  │ [Paramètres]                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CONTENDU DE L'ONGLET                                │   │
│  │ (Dynamique selon le rôle)                           │   │
│  │                                                     │   │
│  │ ...                                                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Navigation Fixée

### **Bottom Nav (Mobile) ou Top Nav (Desktop)**

```
TOUS LES RÔLES VOIENT :
├── 🏠 Home
├── 📰 Feed
├── 🏢 Mon Club      ← NOUVEAU POUR COACH
├── ⚽ Équipes
├── 📅 Calendrier
├── 💬 Messages
└── 👤 Profil
```

**Avant :** Coach n'avait pas "Mon Club"
**Après :** Coach AUSSI a "Mon Club" ✅

---

## 🎯 Design Détaillé par Onglet

### **ONGLET 1 : JOUEURS** (Président/Intendant)

```
┌────────────────────────────────────────────────────┐
│ JOUEURS DU CLUB                [+ Inviter]         │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🔍 Chercher un joueur... [__________________]     │
│                                                    │
│ FILTRES :                                          │
│ [Tous] [Équipe A] [Équipe B] [Coachs]            │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ ┌─ Jean Dupont                                    │
│ │ • Joueur, U-13 • Équipe A                       │
│ │ 📧 jean@example.com • 📱 06 XX XX XX XX        │
│ │ [Profil] [Supprimer]                           │
│ │                                                │
│ ├─ Marc Martin                                    │
│ │ • Coach • Équipe B                             │
│ │ 📧 marc@example.com • 📱 06 XX XX XX XX        │
│ │ [Profil] [Supprimer]                           │
│ │                                                │
│ └─ Sophie Lemoine                                 │
│   • Joueur, U-15 • Équipe A, Équipe B            │
│   📧 sophie@example.com • 📱 06 XX XX XX XX      │
│   [Profil] [Supprimer]                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Améliorations :**
- ✅ Filtre par équipe
- ✅ Contact visible (email, phone)
- ✅ Meilleur spacing
- ✅ Icônes pour lisibilité

---

### **ONGLET 2 : DOCUMENTS**

#### **Président/Intendant**

```
┌────────────────────────────────────────────────────┐
│ DOCUMENTS ADMINISTRATIFS        [+ Ajouter]        │
├────────────────────────────────────────────────────┤
│                                                    │
│ FILTRES :                                          │
│ [Tous] [Licenses] [Médicaux] [Assurances]        │
│ [Autre]                                            │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📄 Jean_License_2024.pdf                          │
│    • Type : License • Joueur : Jean               │
│    • Uploadé : 15/06/2024                         │
│    [Télécharger] [Supprimer]                      │
│                                                    │
│ 📄 Marc_Medical_2024.pdf                          │
│    • Type : Medical • Joueur : Marc               │
│    • Uploadé : 14/06/2024                         │
│    [Télécharger] [Supprimer]                      │
│                                                    │
│ 📄 Insurance_Club_2024.pdf                        │
│    • Type : Assurance • Club                      │
│    • Uploadé : 10/06/2024                         │
│    [Télécharger] [Supprimer]                      │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### **Coach**

```
┌────────────────────────────────────────────────────┐
│ DOCUMENTS DE MES ÉQUIPES        [+ Ajouter]        │
├────────────────────────────────────────────────────┤
│                                                    │
│ ÉQUIPE A (Football U-13)                          │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📄 Jean_License_2024.pdf                     │  │
│ │    • Jean • 15/06/2024                       │  │
│ │    [Télécharger] [Supprimer]                 │  │
│ │                                              │  │
│ │ 📄 Sophie_Medical_2024.pdf                   │  │
│ │    • Sophie • 14/06/2024                     │  │
│ │    [Télécharger] [Supprimer]                 │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ÉQUIPE B (Football U-15)                          │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📄 Marc_License_2024.pdf                     │  │
│ │    • Marc • 12/06/2024                       │  │
│ │    [Télécharger] [Supprimer]                 │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### **Joueur**

```
┌────────────────────────────────────────────────────┐
│ MES DOCUMENTS                                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📄 Ma_License_2024.pdf                            │
│    • 15/06/2024                                   │
│    [Télécharger]                                  │
│                                                    │
│ 📄 Mon_Medical_2024.pdf                           │
│    • 14/06/2024                                   │
│    [Télécharger]                                  │
│                                                    │
│ 📄 Mon_Assurance_2024.pdf                         │
│    • 12/06/2024                                   │
│    [Télécharger]                                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### **ONGLET 3 : TRANSACTIONS**

#### **Président/Intendant**

```
┌────────────────────────────────────────────────────┐
│ TRANSACTIONS DU CLUB             [+ Ajouter]        │
├────────────────────────────────────────────────────┤
│                                                    │
│ STATISTIQUES                                       │
│ ┌─────────────┬──────────────┬─────────────────┐  │
│ │ Solde       │ Revenus      │ Dépenses        │  │
│ │ 1500€       │ +2000€       │ -500€           │  │
│ │ (vert)      │ (vert)       │ (rouge)         │  │
│ └─────────────┴──────────────┴─────────────────┘  │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ 💰 15/06/2024 | Cotisation joueur | +150€        │
│    Par : Jean Dupont                              │
│                                                    │
│ 🛒 14/06/2024 | Équipements | -200€              │
│    Par : Marc Martin                              │
│                                                    │
│ 🎟️ 13/06/2024 | Arbitrage match | -50€          │
│    Par : Sophie Lemoine                           │
│                                                    │
│ 💰 12/06/2024 | Adhésions | +500€                │
│    Par : Jean Dupont                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### **Coach**

```
┌────────────────────────────────────────────────────┐
│ MES TRANSACTIONS                [+ Ajouter]        │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🛒 15/06/2024 | Équipements Équipe A | -100€    │
│                                                    │
│ 🎟️ 14/06/2024 | Arbitrage | -50€                 │
│                                                    │
│ 🏆 12/06/2024 | Participation tournoi | -30€     │
│                                                    │
│ NOTE: Vous ne voyez que vos transactions          │
│       Créées par vous uniquement                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### **ONGLET 4 : INVITATIONS**

#### **Président**

```
┌──────────────────────────────────────────────────────┐
│                    INVITATIONS                       │
├────────────────────────────────────────────────────┐─┤
│ FORMULAIRE                      │ ENVOYÉES         │ │
│ ┌────────────────────────────┐  │ ┌──────────────┐ │ │
│ │ Email*                     │  │ │ 📧 j@ex.com  │ │ │
│ │ [___________________]       │  │ │    Coach     │ │ │
│ │                            │  │ │    ⏳ Pending │ │ │
│ │ Rôle*                      │  │ │              │ │ │
│ │ (O) Président              │  │ │ 📧 m@ex.com  │ │ │
│ │ (O) Intendant              │  │ │    Joueur    │ │ │
│ │ (O) Coach                  │  │ │    ✅ Accepté│ │ │
│ │ (O) Joueur                 │  │ │              │ │ │
│ │                            │  │ │ 📧 s@ex.com  │ │ │
│ │ Équipe (si Coach/Joueur)   │  │ │    Joueur    │ │ │
│ │ [Équipe A v]               │  │ │    ⏳ Pending │ │ │
│ │                            │  │ │              │ │ │
│ │ [Envoyer l'invitation]     │  │ │ [X Annuler]  │ │ │
│ │                            │  │ │              │ │ │
│ └────────────────────────────┘  │ └──────────────┘ │ │
│                                  └────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### **Intendant**

```
┌──────────────────────────────────────────────────────┐
│                    INVITATIONS                       │
├────────────────────────────────────────────────────┐─┤
│ FORMULAIRE                      │ ENVOYÉES         │ │
│ ┌────────────────────────────┐  │ ┌──────────────┐ │ │
│ │ Email*                     │  │ │ 📧 j@ex.com  │ │ │
│ │ [___________________]       │  │ │    Coach     │ │ │
│ │                            │  │ │    ⏳ Pending │ │ │
│ │ Rôle*                      │  │ │              │ │ │
│ │ ❌ Président (désactivé)    │  │ │              │ │ │
│ │ ❌ Intendant (désactivé)    │  │ │ 📧 s@ex.com  │ │ │
│ │ (O) Coach                  │  │ │    Joueur    │ │ │
│ │ (O) Joueur                 │  │ │    ✅ Accepté│ │ │
│ │                            │  │ │              │ │ │
│ │ Équipe (si Coach/Joueur)   │  │ │              │ │ │
│ │ [Équipe A v]               │  │ │ [X Annuler]  │ │ │
│ │                            │  │ │              │ │ │
│ │ [Envoyer l'invitation]     │  │ │              │ │ │
│ │                            │  │ │              │ │ │
│ └────────────────────────────┘  │ └──────────────┘ │ │
│                                  └────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### **Coach**

```
┌──────────────────────────────────────────────────────┐
│            INVITER UN JOUEUR                        │
├────────────────────────────────────────────────────┐─┤
│ FORMULAIRE                      │ ENVOYÉES         │ │
│ ┌────────────────────────────┐  │ ┌──────────────┐ │ │
│ │ Email*                     │  │ │ 📧 j@ex.com  │ │ │
│ │ [___________________]       │  │ │    Joueur    │ │ │
│ │                            │  │ │    Équipe A  │ │ │
│ │ Rôle                       │  │ │    ⏳ Pending │ │ │
│ │ • Joueur (fixé)            │  │ │              │ │ │
│ │                            │  │ │ 📧 s@ex.com  │ │ │
│ │ Équipe*                    │  │ │    Joueur    │ │ │
│ │ [Équipe A v]               │  │ │    Équipe B  │ │ │
│ │ (Vos équipes uniquement)   │  │ │    ✅ Accepté│ │ │
│ │                            │  │ │              │ │ │
│ │ [Envoyer l'invitation]     │  │ │ [X Annuler]  │ │ │
│ │                            │  │ │              │ │ │
│ └────────────────────────────┘  │ └──────────────┘ │ │
│                                  └────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

### **ONGLET 5 : PARAMÈTRES**

#### **Président**

```
┌────────────────────────────────────────────────────┐
│ PARAMÈTRES DU CLUB                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Nom du club                                        │
│ [FC Lens________________]                          │
│                                                    │
│ Sport                                              │
│ [Football_____________]                           │
│                                                    │
│ Ville                                              │
│ [Lens__________________]                           │
│                                                    │
│ Logo                                               │
│ [📷 Télécharger]                                   │
│                                                    │
│ Description                                        │
│ [Club de football basé à Lens                     │
│  depuis 1995, avec 3 équipes...    ]              │
│                                                    │
│ [✅ Sauvegarder] [❌ Annuler]                      │
│                                                    │
├────────────────────────────────────────────────────┤
│ ACTIONS DANGEREUSES                                │
│                                                    │
│ [Supprimer le club]                                │
│ [Quitter le club]                                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### **Intendant/Coach**

```
┌────────────────────────────────────────────────────┐
│ INFOS DU CLUB (Lecture seule)                      │
├────────────────────────────────────────────────────┤
│                                                    │
│ Nom : FC Lens                                      │
│ Sport : Football                                   │
│ Ville : Lens                                       │
│ Description : Club de football basé à Lens...     │
│                                                    │
│ ℹ️  Vous ne pouvez pas modifier ces infos         │
│                                                    │
├────────────────────────────────────────────────────┤
│ ACTION                                             │
│                                                    │
│ [Quitter le club]                                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### **Joueur**

```
┌────────────────────────────────────────────────────┐
│ MON PROFIL DANS LE CLUB                            │
├────────────────────────────────────────────────────┤
│                                                    │
│ 👤 Mon Profil                                      │
│                                                    │
│ Rôle : Joueur                                      │
│ Équipes : Équipe A, Équipe B                      │
│ Catégories : U-13, U-15                            │
│ Inscrit depuis : 15/06/2024                        │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│ [Quitter le club]                                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🎨 Couleurs & Style

```
Primary : #0066cc (bleu)
Success : #10b981 (vert)
Danger : #ef4444 (rouge)
Warning : #f59e0b (orange)
Neutral : #6b7280 (gris)

Cards : Blanc, ombre légère
Boutons : Tailwind classes standard
Spacing : Tailwind (px-4, py-2, etc.)
```

---

## 📱 Responsive

```
Mobile (< 768px):
├── Stack vertical (2 colonnes → 1)
├── Formulaire invitations : Pleine largeur
├── Bottom nav = tabs

Desktop (≥ 768px):
├── 2 colonnes (formulaire | liste)
├── Top nav = tabs
└── Cards en grille
```

---

## ✅ À Faire

- [ ] Mettre à jour MonClubPage.tsx avec ce design
- [ ] Mettre à jour chaque Tab avec le nouveau layout
- [ ] Ajouter "Mon Club" à la navigation (tous les rôles)
- [ ] Ajouter icônes (📄, 💰, 📧, etc.)
- [ ] Responsive mobile
- [ ] Tester chaque onglet par rôle

---

## 🚀 Prêt pour Claude Code ?

Oui ! Je crée le prompt pour mettre à jour le design. 👇
