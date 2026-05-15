# ClubManager — Page Détail Équipe

Interface complète pour la fiche d'une équipe avec gestion des matchs, entraînements, compositions et notes.

---

## Route
`/app/teams/:teamId`

---

## Header de la page

```
┌────────────────────────────────────────────────────┐
│  ← Retour                                          │
│                                                    │
│  ⚽ Séniors A                          [⭐ Suivre] │
│  FC Lens Académie · 18 joueurs                    │
│                                                    │
│  [Matchs] [Entraînements] [Joueurs] [Stats]      │
└────────────────────────────────────────────────────┘
```

**Éléments :**
- Bouton retour vers `/app/team`
- Nom de l'équipe + badge catégorie
- Nom du club + nombre de joueurs
- Bouton "⭐ Suivre" (si supporter ou membre d'un autre club)
- 4 onglets principaux

---

## ONGLET 1 — Matchs

### Section "Prochain match"

**Vue Joueur :**
```
┌──────────────────────────────────────────────────┐
│  ⚽ PROCHAIN MATCH                                │
│                                                  │
│  Samedi 22 Mai · 15h00                          │
│  🏟️ Stade Bollaert (Domicile)                    │
│                                                  │
│  Séniors A  vs  FC Valenciennes                 │
│                                                  │
│  📋 Statut convocation                           │
│  [●] Convoqué  [ ] Non convoqué  [ ] Incertain  │
│                                                  │
│  ✋ Votre disponibilité                          │
│  [✓ Je serai présent]  [✗ Indisponible]         │
│                                                  │
│  État actuel : ✓ Disponible                     │
└──────────────────────────────────────────────────┘
```

**Vue Coach :**
```
┌──────────────────────────────────────────────────┐
│  ⚽ PROCHAIN MATCH                                │
│                                                  │
│  Samedi 22 Mai · 15h00                          │
│  🏟️ Stade Bollaert (Domicile)                    │
│                                                  │
│  Séniors A  vs  FC Valenciennes                 │
│                                                  │
│  📊 Disponibilités (12/18)                       │
│  ✓ Disponibles : 12                             │
│  ✗ Indisponibles : 3                            │
│  ⏳ Sans réponse : 3                             │
│                                                  │
│  [📋 Gérer la composition]                       │
└──────────────────────────────────────────────────┘
```

**Clic "Gérer la composition" → Modal :**

```
┌────────────────────────────────────────────────────┐
│  Composition · Séniors A vs FC Valenciennes    [✕] │
├────────────────────────────────────────────────────┤
│                                                    │
│  Joueurs disponibles (12)                         │
│  ┌──────────────────────────────────────────┐    │
│  │ [✓] #9  Karim Diallo      Attaquant     │    │
│  │ [✓] #10 Nolan Garcia      Milieu        │    │
│  │ [✓] #1  Alex Roux         Gardien       │    │
│  │ [✓] #4  Lucas Simon       Défenseur     │    │
│  │ [ ] #8  Mehdi Bensaid     Milieu        │    │
│  │ ...                                       │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  Joueurs sélectionnés : 11/18                     │
│                                                    │
│  ⚠️ Notes :                                        │
│  • Gardien obligatoire                            │
│  • Minimum 7 joueurs                              │
│  • Maximum 18 joueurs                             │
│                                                    │
│  [Annuler]  [Enregistrer la compo]               │
└────────────────────────────────────────────────────┘
```

### Section "Matchs passés"

**Liste chronologique inversée :**

```
┌──────────────────────────────────────────────────┐
│  🏆 RÉSULTATS                                    │
│                                                  │
│  Dim 15 Mai · Stade Bollaert                    │
│  Séniors A  3 - 1  RC Arras                     │
│  ⚽ Diallo (23', 78') · Garcia (56')            │
│  [Voir la feuille de match]                     │
│                                                  │
├──────────────────────────────────────────────────┤
│  Sam 8 Mai · Stade de la Libération             │
│  US Boulogne  2 - 1  Séniors A                  │
│  ⚽ Garcia (34')                                 │
│  🟨 Simon (45') · 🟥 Roux (67')                 │
│  [Voir la feuille de match]                     │
└──────────────────────────────────────────────────┘
```

**Clic "Voir la feuille de match" → Page dédiée `/app/matches/:matchId`**

---

## ONGLET 2 — Entraînements

### Section "Prochain entraînement"

**Vue Joueur :**
```
┌──────────────────────────────────────────────────┐
│  🏃 PROCHAIN ENTRAÎNEMENT                        │
│                                                  │
│  Mardi 18 Mai · 19h30 - 21h00                   │
│  📍 Terrain Bollaert                             │
│                                                  │
│  ✋ Votre présence                                │
│  [✓ Présent]  [✗ Absent]  [⚠️ Incertain]        │
│                                                  │
│  État actuel : ✓ Présent                        │
└──────────────────────────────────────────────────┘
```

**Vue Coach :**
```
┌──────────────────────────────────────────────────┐
│  🏃 PROCHAIN ENTRAÎNEMENT                        │
│                                                  │
│  Mardi 18 Mai · 19h30 - 21h00                   │
│  📍 Terrain Bollaert                             │
│                                                  │
│  📊 Présences attendues (14/18)                  │
│  ✓ Présents : 14                                │
│  ✗ Absents : 2                                  │
│  ⚠️ Incertains : 1                               │
│  ⏳ Sans réponse : 1                             │
│                                                  │
│  [Modifier l'entraînement]  [+ Nouvel entraîn.] │
└──────────────────────────────────────────────────┘
```

### Section "Historique entraînements"

```
┌──────────────────────────────────────────────────┐
│  📅 ENTRAÎNEMENTS PASSÉS                         │
│                                                  │
│  Jeu 13 Mai · 19h30 · Terrain Bollaert          │
│  Présents : 16/18 (89%)                         │
│  Absents : Diallo, Garcia                        │
│                                                  │
├──────────────────────────────────────────────────┤
│  Mar 11 Mai · 19h30 · Terrain Bollaert          │
│  Présents : 14/18 (78%)                         │
│  Absents : Roux, Simon, Bensaid, Lambert        │
└──────────────────────────────────────────────────┘
```

---

## ONGLET 3 — Joueurs

### Vue liste complète

```
┌────────────────────────────────────────────────────┐
│  👥 EFFECTIF (18 joueurs)                         │
│                                                    │
│  [Tous] [Gardiens] [Défenseurs] [Milieux] [Att.]  │
│                                                    │
│  🧤 GARDIENS                                       │
│  ┌──────────────────────────────────────────┐    │
│  │  #1  Alex Roux           24 ans          │    │
│  │      12 matchs · 8 clean sheets          │    │
│  │      [Voir la fiche]                     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  🛡️ DÉFENSEURS                                    │
│  ┌──────────────────────────────────────────┐    │
│  │  #4  Lucas Simon         22 ans          │    │
│  │      10 matchs · 2 buts                  │    │
│  │      [Voir la fiche]                     │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │  #2  Théo Lambert        23 ans          │    │
│  │      9 matchs · 1 but                    │    │
│  │      [Voir la fiche]                     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ... (autres postes)                              │
└────────────────────────────────────────────────────┘
```

**Clic "Voir la fiche" → Modal joueur :**

```
┌────────────────────────────────────────────────────┐
│  Fiche joueur · Karim Diallo                   [✕] │
├────────────────────────────────────────────────────┤
│                                                    │
│  #9 · Attaquant · 24 ans                          │
│  karim.diallo@test.fr · 06 12 34 56 78            │
│                                                    │
│  📊 STATISTIQUES SAISON 2024-2025                 │
│  • Matchs joués : 12                              │
│  • Buts : 8                                       │
│  • Passes décisives : 3                           │
│  • Cartons jaunes : 1                             │
│  • Moyenne : ⭐⭐⭐⭐ (4.2/5)                        │
│                                                    │
│  📅 PRÉSENCES                                      │
│  • Entraînements : 18/20 (90%)                    │
│  • Matchs : 12/13 (92%)                           │
│                                                    │
│  [Voir l'historique détaillé]                     │
└────────────────────────────────────────────────────┘
```

---

## ONGLET 4 — Stats

### Vue d'ensemble de la saison

```
┌────────────────────────────────────────────────────┐
│  📊 BILAN SAISON 2024-2025                         │
│                                                    │
│  13 matchs · 8 V · 2 N · 3 D                      │
│  Buts marqués : 28 · Encaissés : 12               │
│  Différence : +16                                  │
│                                                    │
│  🏆 MEILLEURS JOUEURS                              │
│  ┌──────────────────────────────────────────┐    │
│  │  ⚽ Meilleur buteur                       │    │
│  │  #9 Karim Diallo · 8 buts                │    │
│  ├──────────────────────────────────────────┤    │
│  │  🎯 Meilleur passeur                      │    │
│  │  #10 Nolan Garcia · 6 passes             │    │
│  ├──────────────────────────────────────────┤    │
│  │  ⭐ Meilleure moyenne                     │    │
│  │  #1 Alex Roux · 4.5/5                    │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  📈 GRAPHIQUES                                     │
│  • Évolution des résultats                        │
│  • Présences aux entraînements                    │
│  • Répartition des buts                           │
└────────────────────────────────────────────────────┘
```

---

## Page Match détaillé (/app/matches/:matchId)

**Accessible après un match joué pour noter les coéquipiers**

### Header

```
┌────────────────────────────────────────────────────┐
│  ← Retour à l'équipe                               │
│                                                    │
│  🏟️ Séniors A  3 - 1  RC Arras                    │
│  Dimanche 15 Mai 2026 · 15h00                     │
│  Stade Bollaert · Domicile                        │
└────────────────────────────────────────────────────┘
```

### Composition

```
┌────────────────────────────────────────────────────┐
│  📋 COMPOSITION                                     │
│                                                    │
│  Titulaires (11)                                   │
│  #1  Alex Roux          Gardien                   │
│  #4  Lucas Simon        Défenseur                 │
│  #6  Théo Lambert       Défenseur                 │
│  #3  Ryan Dubois        Défenseur                 │
│  #2  Hugo Fontaine      Défenseur                 │
│  #8  Mehdi Bensaid      Milieu                    │
│  #10 Nolan Garcia       Milieu       ⚽ (56')     │
│  #7  Enzo Moreau        Milieu                    │
│  #11 Sami Benzara       Attaquant                 │
│  #9  Karim Diallo       Attaquant    ⚽⚽ (23',78')│
│  #5  Noah Lecomte       Attaquant                 │
│                                                    │
│  Remplaçants (7)                                   │
│  #12 Paul Leroy         Gardien                   │
│  #14 Adam Traoré        Milieu                    │
│  ...                                               │
└────────────────────────────────────────────────────┘
```

### Événements du match

```
┌────────────────────────────────────────────────────┐
│  ⏱️ DÉROULEMENT                                     │
│                                                    │
│  23' ⚽ BUT · Karim Diallo                         │
│       Passe décisive : Nolan Garcia               │
│                                                    │
│  45' 🟨 CARTON JAUNE · Lucas Simon                 │
│                                                    │
│  56' ⚽ BUT · Nolan Garcia                         │
│                                                    │
│  67' 🟥 CARTON ROUGE · Alex Roux                   │
│                                                    │
│  78' ⚽ BUT (PENALTY) · Karim Diallo               │
└────────────────────────────────────────────────────┘
```

### Noter les coéquipiers (uniquement joueurs ayant joué)

```
┌────────────────────────────────────────────────────┐
│  ⭐ NOTEZ VOS COÉQUIPIERS                          │
│                                                    │
│  Aidez l'équipe en évaluant la performance        │
│  de vos coéquipiers (1 à 5 étoiles)               │
│                                                    │
│  #1  Alex Roux          [☆☆☆☆☆]                   │
│  #4  Lucas Simon        [★★★★☆] (Votre note)      │
│  #10 Nolan Garcia       [★★★★★] (Votre note)      │
│  #9  Karim Diallo       [☆☆☆☆☆]                   │
│  ...                                               │
│                                                    │
│  Notes restantes : 8/11                           │
│                                                    │
│  [Enregistrer mes notes]                          │
│                                                    │
│  💡 Vous ne pouvez pas vous noter vous-même       │
│  💡 Les notes sont anonymes et servent aux stats  │
└────────────────────────────────────────────────────┘
```

**Comportement :**
- Clic sur étoile → sélection 1 à 5
- Une seule note par joueur par match
- Impossible de se noter soi-même
- Notes visibles dans les stats globales (moyenne)
- Notes individuelles restent anonymes

---

## Permissions par rôle

### Président
- ✅ Voir tout
- ✅ Gérer compositions (peut déléguer au coach)
- ✅ Voir toutes les notes

### Coach
- ✅ Voir tout
- ✅ Gérer compositions de match
- ✅ Créer/modifier entraînements
- ✅ Voir toutes les notes
- ✅ Voir les disponibilités

### Joueur
- ✅ Voir son équipe
- ✅ Déclarer disponibilité match
- ✅ Déclarer présence entraînement
- ✅ Noter ses coéquipiers après match
- ❌ Voir les notes détaillées des autres
- ✅ Voir les moyennes globales

### Supporter
- ✅ Voir matchs et résultats
- ✅ Voir composition
- ❌ Voir les entraînements
- ❌ Voir les stats détaillées
- ❌ Noter
