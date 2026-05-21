# ClubManager — Documents profil & Convocations

Deux nouvelles fonctionnalités : gestion documents administratifs et système de convocations.

---

## PARTIE 1 — DOCUMENTS PROFIL

### 1.1 Concept

Chaque utilisateur peut uploader des documents administratifs (licence, certificat médical, assurance...).

**Visibilité hiérarchique :**
- **Joueur** → voit ses propres documents
- **Coach** → voit ses documents + documents de ses joueurs
- **Président** → voit ses documents + documents de tout le club (coachs + joueurs)
- **Supporter** → voit uniquement ses documents (utile s'il rejoint un club plus tard)

**Upload possible par :**
- La personne elle-même
- Son supérieur hiérarchique (président pour coach/joueur, coach pour ses joueurs)

---

### 1.2 Interface — Section Documents dans Profil

**Route : `/app/profile`**

Ajouter une nouvelle section après "Infos personnelles" :

```
┌────────────────────────────────────────────────────┐
│  📄 DOCUMENTS ADMINISTRATIFS                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Licence 2024-2025                                │
│  📎 licence_karim_diallo.pdf · 245 Ko            │
│  📅 Ajouté le 12 mars 2024                        │
│  [Télécharger]  [Supprimer]                       │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Certificat médical                               │
│  📎 certificat_medical.pdf · 128 Ko              │
│  📅 Ajouté le 5 janvier 2024                      │
│  ⚠️ Expire le 31 décembre 2024                    │
│  [Télécharger]  [Supprimer]                       │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  [+ Ajouter un document]                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Clic "+ Ajouter un document" → Modal :**

```
┌────────────────────────────────────────────────────┐
│  Ajouter un document                           [✕] │
├────────────────────────────────────────────────────┤
│                                                    │
│  Type de document *                               │
│  [Licence ▼]                                      │
│                                                    │
│  Options :                                        │
│  • Licence                                        │
│  • Certificat médical                            │
│  • Assurance                                     │
│  • Carte d'identité                              │
│  • Photo d'identité                              │
│  • Autre                                         │
│                                                    │
│  Nom personnalisé (optionnel)                    │
│  [Licence saison 2024-2025          ]            │
│                                                    │
│  Date d'expiration (optionnel)                   │
│  [31/12/2024]                                     │
│                                                    │
│  Fichier * (PDF, JPG, PNG - max 5 Mo)           │
│  [Choisir un fichier]                            │
│  ou glisser-déposer ici                          │
│                                                    │
│  [Annuler]  [Ajouter le document]                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 1.3 Vue Coach — Documents de ses joueurs

**Route : `/app/team-documents` (nouvelle page)**

Ou dans TeamDetailPage, nouvel onglet "Documents" :

```
┌────────────────────────────────────────────────────┐
│  📄 DOCUMENTS ÉQUIPE — Séniors A                   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Filtrer : [Tous] [Licences] [Certificats]        │
│  Statut : [Tous] [✓ À jour] [⚠️ Expire bientôt]  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │  #9 Karim Diallo                           │  │
│  │  ✓ Licence (expire 31/12/2024)            │  │
│  │  ✓ Certificat médical (expire 31/12/2024) │  │
│  │  ✗ Assurance manquante                    │  │
│  │  [Voir les documents]                      │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │  #10 Nolan Garcia                          │  │
│  │  ⚠️ Licence (expire dans 15 jours)         │  │
│  │  ✓ Certificat médical (expire 31/12/2024) │  │
│  │  ✓ Assurance                               │  │
│  │  [Voir les documents]                      │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │  #1 Alex Roux                              │  │
│  │  ✗ Aucun document                          │  │
│  │  [Ajouter des documents pour ce joueur]   │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Clic "Voir les documents" → Modal détails :**

```
┌────────────────────────────────────────────────────┐
│  Documents · Karim Diallo                      [✕] │
├────────────────────────────────────────────────────┤
│                                                    │
│  Licence 2024-2025                                │
│  📎 licence_karim_diallo.pdf · 245 Ko            │
│  📅 Ajouté le 12 mars 2024 par Karim Diallo      │
│  ⏰ Expire le 31/12/2024                          │
│  [Télécharger]                                    │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Certificat médical                               │
│  📎 certificat_medical.pdf · 128 Ko              │
│  📅 Ajouté le 5 janvier 2024 par Jean Dupont    │
│     (président)                                   │
│  ⏰ Expire le 31/12/2024                          │
│  [Télécharger]                                    │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  [+ Ajouter un document pour ce joueur]          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 1.4 Vue Président — Documents de tout le club

**Route : `/app/club-documents`**

Même interface que coach mais avec tous les membres du club (présidents, coachs, joueurs).

Filtres supplémentaires :
- Par rôle : [Tous] [Coachs] [Joueurs]
- Par équipe : [Toutes] [Séniors A] [U17] ...

---

### 1.5 Stockage et logique

**Mock data structure :**

```js
const mockDocuments = [
  {
    id: 'doc1',
    user_id: 'mock-user-joueur-1',
    type: 'licence',
    custom_name: 'Licence saison 2024-2025',
    filename: 'licence_karim_diallo.pdf',
    file_url: '/uploads/docs/licence_karim_diallo.pdf',
    file_size: 245000, // bytes
    mime_type: 'application/pdf',
    expires_at: '2024-12-31',
    uploaded_by: 'mock-user-joueur-1',
    uploaded_at: '2024-03-12T10:00:00Z',
  },
  {
    id: 'doc2',
    user_id: 'mock-user-joueur-1',
    type: 'certificat_medical',
    custom_name: 'Certificat médical',
    filename: 'certificat_medical.pdf',
    file_url: '/uploads/docs/certificat_medical.pdf',
    file_size: 128000,
    mime_type: 'application/pdf',
    expires_at: '2024-12-31',
    uploaded_by: 'mock-user-president-1',
    uploaded_at: '2024-01-05T14:30:00Z',
  },
]
```

**Fonction de vérification accès :**

```js
const canViewDocument = (document, currentUser) => {
  // L'user peut toujours voir ses propres documents
  if (document.user_id === currentUser.id) return true
  
  // Président voit tous les documents de son club
  if (currentUser.role === 'president') {
    const documentOwner = mockUsers.find(u => u.id === document.user_id)
    return documentOwner?.current_club_id === currentUser.current_club_id
  }
  
  // Coach voit les documents de ses joueurs
  if (currentUser.role === 'coach') {
    const documentOwner = mockUsers.find(u => u.id === document.user_id)
    const ownerTeams = documentOwner?.teams || []
    const coachTeams = currentUser.teams || []
    return ownerTeams.some(t => coachTeams.includes(t))
  }
  
  return false
}

const canUploadForUser = (targetUserId, currentUser) => {
  if (targetUserId === currentUser.id) return true // Soi-même
  
  if (currentUser.role === 'president') {
    const targetUser = mockUsers.find(u => u.id === targetUserId)
    return targetUser?.current_club_id === currentUser.current_club_id
  }
  
  if (currentUser.role === 'coach') {
    const targetUser = mockUsers.find(u => u.id === targetUserId)
    const targetTeams = targetUser?.teams || []
    const coachTeams = currentUser.teams || []
    return targetTeams.some(t => coachTeams.includes(t))
  }
  
  return false
}
```

---

## PARTIE 2 — CONVOCATIONS & POINTAGE

### 2.1 Concept

**Coach ou président peut :**
- Convoquer des joueurs pour un match
- Convoquer des joueurs pour un entraînement

**Tout le monde peut voir :**
- Qui est convoqué
- Qui a déclaré sa disponibilité/présence
- Qui n'a pas répondu

**Visibilité :**
- Les joueurs de l'équipe voient les convocations de leur équipe
- Les supporters ne voient rien

---

### 2.2 Interface — Convoquer pour un match

**Dans MatchDetailPage.jsx, onglet Disponibilités, vue coach :**

```
┌────────────────────────────────────────────────────┐
│  ✋ CONVOCATIONS & DISPONIBILITÉS                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Gérer les convocations]                         │
│                                                    │
│  📊 STATUT (12/18 convoqués)                      │
│  ✓ Disponibles : 10                               │
│  ✗ Indisponibles : 2                              │
│  ⏳ Sans réponse : 6                              │
│                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                    │
│  CONVOQUÉS (12)                                   │
│                                                    │
│  #9  Karim Diallo       ✓ Disponible            │
│  #10 Nolan Garcia       ✓ Disponible            │
│  #1  Alex Roux          ✗ Indisponible          │
│  #4  Lucas Simon        ⏳ Sans réponse          │
│  ...                                              │
│                                                    │
│  NON CONVOQUÉS (6)                                │
│                                                    │
│  #14 Adam Traoré                                  │
│  #17 Dylan Moreau                                 │
│  ...                                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Clic "Gérer les convocations" → Modal :**

```
┌────────────────────────────────────────────────────┐
│  Gérer les convocations                        [✕] │
│  Séniors A vs FC Valenciennes                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  Effectif (18 joueurs)                            │
│                                                    │
│  [✓] #9  Karim Diallo      Attaquant             │
│  [✓] #10 Nolan Garcia      Milieu                │
│  [✓] #1  Alex Roux         Gardien               │
│  [✓] #4  Lucas Simon       Défenseur             │
│  [✓] #6  Théo Lambert      Défenseur             │
│  [ ] #14 Adam Traoré       Milieu                │
│  [ ] #17 Dylan Moreau      Attaquant             │
│  ...                                              │
│                                                    │
│  Joueurs sélectionnés : 12/18                     │
│                                                    │
│  [Tout sélectionner]  [Tout désélectionner]      │
│                                                    │
│  ☑️ Envoyer une notification aux joueurs          │
│                                                    │
│  [Annuler]  [Enregistrer les convocations]       │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Après enregistrement :**
- Les joueurs convoqués reçoivent une notification
- Ils peuvent déclarer leur disponibilité dans l'onglet Disponibilités

---

### 2.3 Interface — Vue joueur convoqué

**Dans MatchDetailPage.jsx, onglet Disponibilités, vue joueur :**

```
┌────────────────────────────────────────────────────┐
│  ✋ VOTRE CONVOCATION                              │
├────────────────────────────────────────────────────┤
│                                                    │
│  ✅ Vous êtes convoqué pour ce match              │
│                                                    │
│  Votre disponibilité :                            │
│  [✓ Disponible]  [✗ Indisponible]  [⚠️ Incertain]│
│                                                    │
│  État actuel : ✓ Disponible                      │
│                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                    │
│  👥 VOS COÉQUIPIERS CONVOQUÉS (12)                │
│                                                    │
│  #10 Nolan Garcia       ✓ Disponible            │
│  #1  Alex Roux          ✗ Indisponible          │
│  #4  Lucas Simon        ⏳ Sans réponse          │
│  #6  Théo Lambert       ✓ Disponible            │
│  #8  Mehdi Bensaid      ✓ Disponible            │
│  ...                                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Si joueur non convoqué :**

```
┌────────────────────────────────────────────────────┐
│  ℹ️  CONVOCATIONS                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  Vous n'êtes pas convoqué pour ce match.         │
│                                                    │
│  12 joueurs ont été convoqués par le coach.       │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 2.4 Interface — Convoquer pour un entraînement

**Dans TeamDetailPage.jsx, onglet Entraînements, vue coach :**

Même logique que pour les matchs.

**Prochain entraînement, vue coach :**

```
┌────────────────────────────────────────────────────┐
│  🏃 PROCHAIN ENTRAÎNEMENT                          │
│                                                    │
│  Mardi 18 Mai · 19h30 - 21h00                    │
│  📍 Terrain Bollaert                               │
│                                                    │
│  [Gérer les convocations]                         │
│                                                    │
│  📊 PRÉSENCES (14/16 convoqués)                   │
│  ✓ Présents : 12                                  │
│  ✗ Absents : 2                                    │
│  ⏳ Sans réponse : 2                              │
│                                                    │
│  CONVOQUÉS (16)                                   │
│                                                    │
│  #9  Karim Diallo       ✓ Présent                │
│  #10 Nolan Garcia       ✓ Présent                │
│  #1  Alex Roux          ✗ Absent                 │
│  #4  Lucas Simon        ⏳ Sans réponse          │
│  ...                                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 2.5 Mock data structure

**Convocations match :**

```js
const mockMatchConvocations = [
  {
    id: 'conv1',
    match_id: 'm1',
    user_id: 'mock-user-joueur-1',
    convoked_by: 'mock-user-coach-1',
    convoked_at: '2026-05-15T10:00:00Z',
    availability_status: 'available', // 'available', 'unavailable', 'uncertain', null
    availability_declared_at: '2026-05-15T14:30:00Z',
  },
  {
    id: 'conv2',
    match_id: 'm1',
    user_id: 'mock-user-joueur-2',
    convoked_by: 'mock-user-coach-1',
    convoked_at: '2026-05-15T10:00:00Z',
    availability_status: 'unavailable',
    availability_declared_at: '2026-05-16T08:00:00Z',
  },
  {
    id: 'conv3',
    match_id: 'm1',
    user_id: 'mock-user-joueur-3',
    convoked_by: 'mock-user-coach-1',
    convoked_at: '2026-05-15T10:00:00Z',
    availability_status: null, // Pas encore répondu
    availability_declared_at: null,
  },
]
```

**Convocations entraînement :**

```js
const mockTrainingConvocations = [
  {
    id: 'tconv1',
    training_id: 't1',
    user_id: 'mock-user-joueur-1',
    convoked_by: 'mock-user-coach-1',
    convoked_at: '2026-05-10T18:00:00Z',
    presence_status: 'present', // 'present', 'absent', 'uncertain', null
    presence_declared_at: '2026-05-10T20:00:00Z',
  },
]
```

**Fonctions helper :**

```js
const getConvokedPlayers = (matchId) => {
  return mockMatchConvocations
    .filter(c => c.match_id === matchId)
    .map(c => ({
      ...c,
      player: mockUsers.find(u => u.id === c.user_id),
    }))
}

const getAvailabilityStats = (matchId) => {
  const convoked = mockMatchConvocations.filter(c => c.match_id === matchId)
  return {
    total: convoked.length,
    available: convoked.filter(c => c.availability_status === 'available').length,
    unavailable: convoked.filter(c => c.availability_status === 'unavailable').length,
    uncertain: convoked.filter(c => c.availability_status === 'uncertain').length,
    no_response: convoked.filter(c => c.availability_status === null).length,
  }
}

const isPlayerConvoked = (matchId, playerId) => {
  return mockMatchConvocations.some(c => 
    c.match_id === matchId && c.user_id === playerId
  )
}
```

---

## RÉSUMÉ DES CHANGEMENTS

### Partie 1 — Documents
1. ✅ Nouvelle section "Documents" dans ProfilePage
2. ✅ Modal upload avec type, nom, expiration, fichier
3. ✅ Nouvelle page `/app/team-documents` (coach)
4. ✅ Nouvelle page `/app/club-documents` (président)
5. ✅ Logique de visibilité hiérarchique
6. ✅ Upload par soi-même ou par supérieur

### Partie 2 — Convocations
1. ✅ Modal "Gérer convocations" dans match/entraînement (coach)
2. ✅ Affichage convoqués vs non-convoqués avec statuts
3. ✅ Vue joueur : statut convocation + déclaration dispo
4. ✅ Vue joueur : liste coéquipiers convoqués avec statuts
5. ✅ Notification automatique aux convoqués
6. ✅ Mock data structure convocations

---

## POUR CLAUDE CODE

```
Implémenter DOCUMENTS_ET_CONVOCATIONS.md en 2 parties :

PARTIE 1 — Documents profil
1. Ajouter section Documents dans ProfilePage.jsx
2. Créer modal UploadDocumentModal
3. Créer page TeamDocumentsPage (/app/team-documents)
4. Créer page ClubDocumentsPage (/app/club-documents)
5. Ajouter fonctions canViewDocument et canUploadForUser
6. Mock data : mockDocuments

PARTIE 2 — Convocations
1. Modifier MatchDetailPage, onglet Disponibilités
2. Ajouter modal ManageConvocationsModal (coach)
3. Afficher liste convoqués avec statuts
4. Vue joueur : statut convocation + déclaration
5. Vue joueur : liste coéquipiers convoqués
6. Même logique pour entraînements dans TeamDetailPage
7. Mock data : mockMatchConvocations, mockTrainingConvocations

Ordre : Partie 1 → Partie 2
```
