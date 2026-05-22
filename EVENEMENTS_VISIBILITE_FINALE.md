# ClubManager — Visibilité événements (version finale)

Clarification complète des règles de visibilité des événements dans le calendrier.

---

## RÈGLES DE VISIBILITÉ PAR RÔLE

### Président (voit TOUT le club)

**Ce qu'il voit dans le calendrier :**
- ✅ Tous les matchs de toutes les équipes du club
- ✅ Tous les entraînements de toutes les équipes du club
- ✅ Tous les événements du club (publics, internes, réunions)
- ✅ Événements publics des clubs suivis (si suit d'autres clubs)
- ✅ Matchs des équipes suivies (si suit des équipes d'autres clubs)

**Pourquoi :** Le président gère tout le club, il doit avoir une vue complète.

---

### Coach (son équipe + matchs autres équipes + invitations)

**Ce qu'il voit dans le calendrier :**
- ✅ Matchs de son équipe
- ✅ Entraînements de son équipe
- ✅ Matchs des autres équipes du club (sans les entraînements)
- ✅ Événements auxquels il est invité nominativement
- ✅ Événements publics du club
- ✅ Événements publics des clubs suivis (si suit d'autres clubs)
- ✅ Matchs des équipes suivies (si suit des équipes d'autres clubs)

**Pourquoi :** Le coach gère son équipe mais doit voir les matchs des autres équipes du club. Il ne voit pas leurs entraînements (pas son affaire).

---

### Joueur (son équipe + matchs autres équipes + invitations)

**Ce qu'il voit dans le calendrier :**
- ✅ Matchs de son équipe
- ✅ Entraînements de son équipe
- ✅ Matchs des autres équipes du club (sans les entraînements)
- ✅ Événements auxquels il est invité nominativement
- ✅ Événements publics du club
- ✅ Événements publics des clubs suivis (si suit d'autres clubs)
- ✅ Matchs des équipes suivies (si suit des équipes d'autres clubs)

**Pourquoi :** Même logique que le coach — il voit son équipe + matchs des autres + ce qui le concerne directement.

---

### Supporter (matchs + événements publics)

**Ce qu'il voit dans le calendrier :**
- ✅ Tous les matchs des clubs suivis
- ✅ Matchs des équipes suivies spécifiquement
- ✅ Événements publics des clubs suivis
- ❌ Aucun entraînement
- ❌ Aucun événement interne/réunion

**Pourquoi :** Le supporter suit le club de l'extérieur — il voit les matchs et événements publics uniquement.

---

## TYPES DE VISIBILITÉ ÉVÉNEMENT

### 1. Public (tout le monde)

**Qui voit :**
- Tous les followers du club (président, coach, joueur, supporter)

**Exemples :**
- Repas de fin de saison
- Tournoi inter-clubs
- Portes ouvertes
- Fête du club

**Cas d'usage :**
Événements ouverts à tous : membres, familles, supporters.

---

### 2. Coachs uniquement

**Qui voit :**
- Président du club
- Tous les coachs du club

**Exemples :**
- Réunion coachs mensuelle
- Formation technique
- Briefing coordination équipes

**Cas d'usage :**
Réunions entre staff technique.

---

### 3. Équipe (coach + joueurs d'une équipe)

**Qui voit :**
- Président du club
- Coach de l'équipe
- Joueurs de l'équipe

**Exemples :**
- Sortie cohésion équipe
- Briefing avant match important
- Team building Séniors A

**Cas d'usage :**
Événements spécifiques à une équipe.

---

### 4. Invitation nominative

**Qui voit :**
- Président du club (toujours)
- Les personnes invitées explicitement par leur nom

**Exemples :**
- Réunion comité directeur (président + 3 coachs spécifiques)
- Entretien individuel
- Réunion parents U13 (coach U13 + parents sélectionnés)

**Cas d'usage :**
Réunions ciblées avec participants précis.

---

## FORMULAIRE CRÉATION ÉVÉNEMENT

### Modal CreateEventModal

```jsx
function CreateEventModal({ clubId, authorId, userRole, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [link, setLink] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [teamId, setTeamId] = useState('')
  const [invitedUsers, setInvitedUsers] = useState([])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-bold mb-5">Créer un événement</h2>

        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Repas de fin de saison, Réunion coachs..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Détails de l'événement..."
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Adresse ou nom du lieu..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Début *
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fin
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {/* Lien externe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien externe (optionnel)
            </label>
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* VISIBILITÉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibilité *
            </label>
            <select 
              value={visibility} 
              onChange={e => {
                setVisibility(e.target.value)
                if (e.target.value !== 'team') setTeamId('')
                if (e.target.value !== 'invite') setInvitedUsers([])
              }}>
              <option value="public">🌍 Public (tous les followers du club)</option>
              
              {userRole === 'president' && (
                <>
                  <option value="coachs">👔 Coachs uniquement</option>
                  <option value="team">⚽ Équipe (coach + joueurs)</option>
                  <option value="invite">✉️ Invitation nominative</option>
                </>
              )}
              
              {userRole === 'coach' && (
                <>
                  <option value="team">⚽ Mon équipe (moi + mes joueurs)</option>
                  <option value="invite">✉️ Invitation nominative</option>
                </>
              )}
            </select>
          </div>

          {/* Si équipe sélectionnée */}
          {visibility === 'team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quelle équipe ? *
              </label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="">Choisir une équipe...</option>
                {userRole === 'president' 
                  ? mockTeams.filter(t => t.club_id === clubId).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))
                  : mockTeams.filter(t => currentUser.teams?.includes(t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))
                }
              </select>
            </div>
          )}

          {/* Si invitation nominative */}
          {visibility === 'invite' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inviter des personnes *
              </label>
              
              {/* Liste membres du club */}
              <div className="border border-surface-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                {mockUsers
                  .filter(u => u.current_club_id === clubId && u.id !== authorId)
                  .map(user => (
                    <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-surface-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invitedUsers.includes(user.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setInvitedUsers([...invitedUsers, user.id])
                          } else {
                            setInvitedUsers(invitedUsers.filter(id => id !== user.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getRoleLabel(user)}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                {invitedUsers.length} personne(s) invitée(s)
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={handleCreate} className="flex-1 btn-primary justify-center">
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## STRUCTURE MOCK DATA

### Événement avec visibilité

```js
const mockEvents = [
  {
    id: 'ev1',
    type: 'social',
    visibility: 'public',
    club_id: 'club-1',
    title: 'Repas de fin de saison',
    starts_at: '2026-05-31T20:00:00Z',
    // ... pas de team_id, pas d'invited_users
  },
  {
    id: 'ev2',
    type: 'meeting',
    visibility: 'coachs',
    club_id: 'club-1',
    title: 'Réunion coachs mensuelle',
    starts_at: '2026-05-28T19:00:00Z',
    // ... pas de team_id, pas d'invited_users
  },
  {
    id: 'ev3',
    type: 'team',
    visibility: 'team',
    club_id: 'club-1',
    team_id: 'team-1', // Séniors A
    title: 'Sortie cohésion Séniors A',
    starts_at: '2026-06-01T14:00:00Z',
    // ... pas d'invited_users
  },
  {
    id: 'ev4',
    type: 'meeting',
    visibility: 'invite',
    club_id: 'club-1',
    title: 'Réunion comité directeur',
    starts_at: '2026-05-27T18:00:00Z',
    invited_users: ['pres-1', 'coach-1', 'coach-2', 'coach-5'],
  },
]
```

---

## FONCTION DE FILTRAGE

```js
const canSeeEvent = (event, currentUser) => {
  // Président voit TOUT son club
  if (currentUser.role === 'president' && 
      currentUser.current_club_id === event.club_id) {
    return true
  }
  
  // Public → tous les followers du club
  if (event.visibility === 'public') {
    return currentUser.followed_clubs?.includes(event.club_id) ||
           currentUser.current_club_id === event.club_id
  }
  
  // Coachs uniquement → président + tous coachs du club
  if (event.visibility === 'coachs') {
    return currentUser.role === 'coach' && 
           currentUser.current_club_id === event.club_id
  }
  
  // Équipe → président + coach équipe + joueurs équipe
  if (event.visibility === 'team') {
    return currentUser.teams?.includes(event.team_id)
  }
  
  // Invitation nominative → président + invités
  if (event.visibility === 'invite') {
    return event.invited_users?.includes(currentUser.id)
  }
  
  return false
}

const getCalendarItems = (currentUser) => {
  const items = []
  
  // 1. Matchs selon suivi
  const matches = mockMatches.filter(m => {
    // Président voit tous les matchs de son club
    if (currentUser.role === 'president' && 
        m.team.club_id === currentUser.current_club_id) {
      return true
    }
    
    // Coach/Joueur voit son équipe + autres matchs du club (pas entraînements)
    if (currentUser.role === 'coach' || currentUser.role === 'player') {
      // Son équipe
      if (currentUser.teams?.includes(m.team_id)) return true
      // Autres matchs du club
      if (m.team.club_id === currentUser.current_club_id) return true
    }
    
    // Clubs suivis
    if (currentUser.followed_clubs?.includes(m.team.club_id)) return true
    // Équipes suivies
    if (currentUser.followed_teams?.includes(m.team_id)) return true
    
    return false
  })
  
  // 2. Entraînements (uniquement président + coach/joueur de l'équipe)
  const trainings = mockTrainings.filter(t => {
    if (currentUser.role === 'president' && 
        t.team.club_id === currentUser.current_club_id) {
      return true
    }
    return currentUser.teams?.includes(t.team_id)
  })
  
  // 3. Événements filtrés
  const events = mockEvents.filter(e => canSeeEvent(e, currentUser))
  
  items.push(
    ...matches.map(m => ({ ...m, type: 'match', date: m.scheduled_at })),
    ...trainings.map(t => ({ ...t, type: 'training', date: t.scheduled_at })),
    ...events.map(e => ({ ...e, type: 'event', date: e.starts_at }))
  )
  
  items.sort((a, b) => new Date(a.date) - new Date(b.date))
  
  return items
}
```

---

## RÉSUMÉ

### Visibilités disponibles par rôle

**Président :**
- Public
- Coachs uniquement
- Équipe (choisir l'équipe)
- Invitation nominative

**Coach :**
- Public
- Mon équipe
- Invitation nominative

**Joueur/Supporter :**
- Aucune création (sauf covoiturage qui est lié aux matchs)

### Ce que chacun voit

| Type événement | Président | Coach | Joueur | Supporter |
|----------------|-----------|-------|--------|-----------|
| Matchs son équipe | ✅ Toutes | ✅ | ✅ | ❌ |
| Matchs autres équipes club | ✅ | ✅ | ✅ | ❌ |
| Matchs clubs suivis | ✅ | ✅ | ✅ | ✅ |
| Entraînements son équipe | ✅ Toutes | ✅ | ✅ | ❌ |
| Entraînements autres équipes | ✅ | ❌ | ❌ | ❌ |
| Événements publics | ✅ | ✅ | ✅ | ✅ |
| Événements coachs | ✅ | ✅ | ❌ | ❌ |
| Événements équipe | ✅ | ✅ si son équipe | ✅ si son équipe | ❌ |
| Événements invités | ✅ | ✅ si invité | ✅ si invité | ❌ |

---

## POUR CLAUDE CODE

```
Implémenter EVENEMENTS_VISIBILITE_FINALE.md :

1. Modifier CreateEventModal :
   - 4 types visibilité : public / coachs / team / invite
   - Si team → select équipe
   - Si invite → checkboxes membres du club
   
2. Modifier getCalendarItems() :
   - Matchs : président = tout son club, coach/joueur = son équipe + autres matchs club, supporter = suivis
   - Entraînements : président = tout, coach/joueur = son équipe uniquement
   - Événements : filtrer selon canSeeEvent()
   
3. Mock data :
   - Ajouter events avec visibility: public/coachs/team/invite
   - Ajouter invited_users sur events avec visibility=invite
   
Tester avec les 4 rôles que chacun voit bien ce qu'il doit voir.
```
