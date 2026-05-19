# ClubManager — Règles de visibilité et accès

Document de référence pour l'implémentation des permissions.

---

## 1. Suivi clubs/équipes (tous les rôles)

### Règle générale
**Tout le monde peut suivre des clubs/équipes, quel que soit son rôle.**

### Suivis automatiques
- **Joueur** → suit automatiquement son club + son équipe
- **Coach** → suit automatiquement son club + ses équipes
- **Président** → suit automatiquement son club + toutes ses équipes
- **Supporter** → doit choisir 1 club principal (obligatoire)

### Suivis optionnels
Tous les rôles peuvent suivre d'autres clubs/équipes en plus.

---

## 2. Structure navigation

### Onglet "Mes équipes"
**Visible uniquement pour : Joueur, Coach, Président**

- **Joueur** → équipes où il joue
- **Coach** → équipes qu'il entraîne
- **Président** → TOUTES les équipes du club (car considéré coach de toutes)
- **Supporter** → ❌ onglet absent

### Onglet "Équipes suivies"
**Visible pour : TOUS les rôles**

- Liste des clubs/équipes suivis (automatiques + optionnels)
- Clic sur nom club → pop-up présentation club (même si on ne suit pas toutes ses équipes)

---

## 3. Page Événements

### Onglet "Matchs"
**Contenu :** Tous les matchs des clubs/équipes suivis (automatiques + optionnels)

### Onglet "Événements"
**Visibilité selon type d'événement :**

| Type événement | Supporter | Joueur | Coach | Président |
|----------------|-----------|--------|-------|-----------|
| Public (covoiturage, social) | ✅ | ✅ | ✅ | ✅ |
| Interne club/équipe (sortie) | ❌ | ✅ membre | ✅ membre | ✅ membre |
| Réunion | ❌ | ❌ | ✅ | ✅ |

**Règle clé :** 
- Événements **publics** → visible par tous les followers du club
- Événements **internes** → visible uniquement par les membres (joueur/coach/président) du club/équipe
- **Réunions** → visible uniquement par coach/président

---

## 4. Création d'événements

### Permissions de création

| Rôle | Peut créer |
|------|------------|
| Supporter | ✅ Covoiturage uniquement (toujours public) |
| Joueur | ✅ Covoiturage uniquement (toujours public) |
| Coach | ✅ Tous types d'événements |
| Président | ✅ Tous types d'événements |

### Champ "Visibilité" (coach/président)

**3 options dans le select :**

1. **Public** 
   - Visible par tous les followers du club
   - Pour : covoiturage, social, annonces ouvertes

2. **Équipe**
   - Visible uniquement par les membres de l'équipe sélectionnée
   - Menu déroulant "Quelle équipe ?" :
     - **Président** → toutes les équipes du club
     - **Coach** → uniquement ses équipes
   - Pour : sortie équipe, briefing, team building

3. **Club**
   - Visible uniquement par tous les membres du club (joueurs + coachs + présidents)
   - Disponible uniquement pour le président
   - Pour : AG, réunion club, sortie club

### Formulaire création événement

```
Type * 
[Public / Équipe / Club]  (selon rôle, voir ci-dessus)

Si Équipe sélectionné :
  Quelle équipe ? *
  [Select avec équipes disponibles selon rôle]

Pour quel match ? (si type = covoiturage)
  [Select matchs à venir]

Titre *
Description
Lieu
Date début *
Date fin
Lien externe (optionnel)
```

---

## 5. Page Feed

**Règle :** Si tu suis **au moins une équipe** d'un club, tu as accès à **l'intégralité du feed du club**.

Pas de feed filtré par équipe — c'est tout ou rien au niveau club.

---

## 6. Exemples concrets

### Exemple 1 — Supporter suit "Lions FC"

**Onglet Matchs :** 
- Tous les matchs de toutes les équipes des Lions FC

**Onglet Événements :**
- Événements publics du Lions FC uniquement
- ❌ Pas les sorties équipe, pas les réunions

**Onglet Mes équipes :**
- ❌ Absent

**Onglet Équipes suivies :**
- Lions FC (avec toutes ses équipes visibles)

**Feed :**
- Feed complet du Lions FC

---

### Exemple 2 — Joueur dans "Lions A" + suit "Tigers B"

**Onglet Matchs :**
- Matchs Lions A
- Matchs Tigers B

**Onglet Événements :**
- **Lions FC** : publics + internes (sorties équipe/club)
- **Tigers** : publics uniquement (car pas membre)

**Onglet Mes équipes :**
- Lions A uniquement

**Onglet Équipes suivies :**
- Lions FC (suivi auto)
- Tigers B (suivi optionnel)

**Feed :**
- Feed Lions FC
- Feed Tigers

---

### Exemple 3 — Président "Eagles" + suit "Hawks"

**Onglet Matchs :**
- Tous matchs Eagles
- Tous matchs Hawks

**Onglet Événements :**
- **Eagles** : publics + internes + réunions (tout)
- **Hawks** : publics uniquement (car pas membre)

**Onglet Mes équipes :**
- Toutes les équipes Eagles (considéré coach de toutes)

**Onglet Équipes suivies :**
- Eagles (suivi auto)
- Hawks (suivi optionnel)

**Feed :**
- Feed Eagles
- Feed Hawks

---

## 7. Implémentation technique

### Filtrage événements (frontend)

```js
const canSeeEvent = (event, user) => {
  // Public → tout le monde qui suit le club
  if (event.visibility === 'public') {
    return user.followed_clubs.includes(event.club_id)
  }
  
  // Équipe → membres de cette équipe uniquement
  if (event.visibility === 'team') {
    return user.teams.includes(event.team_id)
  }
  
  // Club → membres du club uniquement
  if (event.visibility === 'club') {
    return user.member_of_clubs.includes(event.club_id)
  }
  
  // Réunion → coach ou président uniquement
  if (event.type === 'meeting') {
    return ['coach', 'president'].includes(user.role) &&
           user.member_of_clubs.includes(event.club_id)
  }
  
  return false
}
```

### Affichage conditionnel onglets

```jsx
// Onglet "Mes équipes" — absent pour supporters
{!is('supporter') && (
  <Tab id="my-teams" label="Mes équipes" />
)}

// Onglet "Équipes suivies" — présent pour tous
<Tab id="followed" label="Équipes suivies" />
```

### Champ visibilité événement

```jsx
// Supporter/Joueur : pas de choix (toujours public)
const visibilityOptions = isOneOf('supporter', 'player')
  ? [{ value: 'public', label: 'Public', locked: true }]
  : isOneOf('coach')
  ? [
      { value: 'public', label: 'Public' },
      { value: 'team', label: 'Équipe', needs_team: true },
    ]
  : isOneOf('president')
  ? [
      { value: 'public', label: 'Public' },
      { value: 'team', label: 'Équipe', needs_team: true },
      { value: 'club', label: 'Club' },
    ]
  : []
```

---

## 8. Mock data

### Supporter Sophie suit AS Saint-Denis

```js
const mockUsers = {
  supporter: {
    id: 'mock-user-2',
    role: 'supporter',
    first_name: 'Sophie',
    last_name: 'Durand',
    current_club_id: null,  // pas membre
    followed_clubs: ['mock-club-2'],  // suit AS Saint-Denis
    followed_teams: ['mock-team-sd-1'],
    member_of_clubs: [],  // pas membre
    teams: [],  // pas dans d'équipe
  },
}
```

### Événements avec visibilité

```js
const mockEvents = [
  {
    id: 'ev1',
    type: 'social',
    visibility: 'public',
    club_id: 'mock-club-2',
    title: 'Repas de fin de saison',
    // ... visible par Sophie (suit le club)
  },
  {
    id: 'ev2',
    type: 'team',
    visibility: 'team',
    club_id: 'mock-club-2',
    team_id: 'mock-team-sd-1',
    title: 'Sortie bowling équipe A',
    // ... PAS visible par Sophie (pas membre équipe)
  },
  {
    id: 'ev3',
    type: 'meeting',
    visibility: 'club',
    club_id: 'mock-club-2',
    title: 'Réunion coachs',
    // ... PAS visible par Sophie (pas coach/président)
  },
]
```

---

## Prochaine étape

Donner ce document + les corrections précédentes à Claude Code pour :
1. Implémenter le filtrage événements
2. Masquer/afficher les onglets selon rôle
3. Gérer la création événements avec champ visibilité
4. Tester avec les 2 mock users (président + supporter)
