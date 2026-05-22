# ClubManager — Corrections finales

Dernières corrections avant génération mock data complet.

---

## CORRECTION 1 — Notation match : uniquement coéquipiers

### Règle stricte
**SEULS les joueurs de l'équipe ayant participé au match peuvent noter leurs coéquipiers.**

Président et coach NE PEUVENT PAS noter.

### Dans MatchDetailPage.jsx, onglet Événements

```jsx
// Afficher la section notation UNIQUEMENT si :
// 1. L'user est joueur
// 2. L'user a joué dans ce match
// 3. Le match est terminé

const canRate = 
  currentUser.role === 'player' &&
  match.squad?.some(s => s.user_id === currentUser.id && s.played) &&
  match.score_home !== undefined

{canRate && (
  <div className="mt-8 border-t border-surface-200 pt-6">
    <h3 className="font-semibold text-gray-900 mb-4">⭐ Notez vos coéquipiers</h3>
    <p className="text-sm text-gray-500 mb-4">
      Évaluez la performance de vos coéquipiers (1 à 5 étoiles).
      Les notes sont anonymes et servent aux statistiques.
    </p>
    <button 
      onClick={() => setShowRatingModal(true)}
      className="btn-primary">
      Accéder au formulaire de notation
    </button>
  </div>
)}

{!canRate && currentUser.role === 'player' && (
  <div className="mt-8 border-t border-surface-200 pt-6">
    <div className="text-center py-8 text-gray-400 text-sm">
      Seuls les joueurs ayant participé au match peuvent noter leurs coéquipiers.
    </div>
  </div>
)}
```

---

## CORRECTION 2 — Messagerie : afficher rôle dans recherche

### Dans MessagesPage.jsx, modal recherche membre

**Avant :**
```
Sophie Bernard
```

**Après :**
```
Sophie Bernard
Supporteur · AS Saint-Denis United
```

**Autre exemple :**
```
Jean Dupont
Président · FC Lens Académie
```

```
Marie Martin
Coach Séniors A · FC Lens Académie
```

```
Karim Diallo
Joueur Séniors A · FC Lens Académie
```

### Code

```jsx
// Dans la liste de recherche membres
{filteredMembers.map(member => (
  <button
    key={member.id}
    onClick={() => handleStartConversation(member)}
    className="w-full flex items-center gap-3 p-3 rounded-xl
               hover:bg-surface-50 text-left transition-all">
    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center
                    justify-center text-brand-700 font-semibold text-sm">
      {member.first_name[0]}{member.last_name[0]}
    </div>
    <div className="flex-1">
      <div className="font-medium text-sm text-gray-900">
        {member.first_name} {member.last_name}
      </div>
      <div className="text-xs text-gray-500">
        {getRoleLabel(member)}
      </div>
    </div>
  </button>
))}

// Fonction helper
const getRoleLabel = (user) => {
  if (user.role === 'supporter') {
    const club = mockClubs.find(c => user.followed_clubs?.includes(c.id))
    return club ? `Supporteur · ${club.name}` : 'Supporteur'
  }
  
  if (user.role === 'president') {
    const club = mockClubs.find(c => c.id === user.current_club_id)
    return club ? `Président · ${club.name}` : 'Président'
  }
  
  if (user.role === 'coach') {
    const team = mockTeams.find(t => user.teams?.includes(t.id))
    const club = team ? mockClubs.find(c => c.id === team.club_id) : null
    if (team && club) {
      return `Coach ${team.name} · ${club.name}`
    }
    return 'Coach'
  }
  
  if (user.role === 'player') {
    const team = mockTeams.find(t => user.teams?.includes(t.id))
    const club = team ? mockClubs.find(c => c.id === team.club_id) : null
    if (team && club) {
      return `Joueur ${team.name} · ${club.name}`
    }
    return 'Joueur'
  }
  
  return user.role
}
```

---

## CORRECTION 3 — Bouton Message sur fiche joueur

### Dans la modal fiche joueur (TeamDetailPage, onglet Joueurs)

Ajouter un bouton "Envoyer un message" en haut à droite :

```jsx
<div className="flex items-start justify-between mb-4">
  <div>
    <h2 className="font-display text-xl font-bold">
      {player.first_name} {player.last_name}
    </h2>
    <div className="text-sm text-gray-500">
      #{player.jersey_number} · {player.position} · {age} ans
    </div>
  </div>
  
  <button
    onClick={() => {
      onClose() // Fermer la modal
      navigate('/app/messages', { 
        state: { startConversationWith: player.id } 
      })
    }}
    className="btn-secondary text-sm px-3 py-2">
    💬 Message
  </button>
</div>
```

### Dans MessagesPage.jsx, gérer l'état de navigation

```jsx
// Au montage, vérifier si on doit démarrer une conversation
useEffect(() => {
  const { startConversationWith } = location.state || {}
  if (startConversationWith) {
    const member = mockUsers.find(u => u.id === startConversationWith)
    if (member) {
      handleStartConversation(member)
    }
    // Nettoyer le state
    navigate(location.pathname, { replace: true, state: {} })
  }
}, [location.state])
```

---

## CORRECTION 4 — Fiche joueur étoffée + RGPD

### Modal fiche joueur complète

```jsx
function PlayerDetailModal({ player, currentUser, onClose }) {
  const age = differenceInYears(new Date(), new Date(player.birth_date))
  const isTeammate = currentUser.teams?.some(t => player.teams?.includes(t))
  const isCoach = currentUser.role === 'coach' && 
                  currentUser.teams?.some(t => player.teams?.includes(t))
  const isPresident = currentUser.role === 'president' && 
                      currentUser.current_club_id === player.current_club_id
  
  // Infos sensibles visibles uniquement par coéquipiers/coach/président
  const canViewSensitiveInfo = isTeammate || isCoach || isPresident

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center
                            justify-center text-brand-700 font-bold text-2xl">
              {player.jersey_number}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {player.first_name} {player.last_name}
              </h2>
              <div className="text-sm text-gray-500">
                {player.position} · {age} ans · {player.team.name}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose()
                navigate('/app/messages', { 
                  state: { startConversationWith: player.id } 
                })
              }}
              className="btn-secondary text-sm px-3 py-2">
              💬 Message
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {/* Infos publiques (visibles par tous) */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Statistiques saison 2024-2025
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{player.matches}</div>
                <div className="text-xs text-gray-500">Matchs</div>
              </div>
              <div className="text-center p-3 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{player.goals}</div>
                <div className="text-xs text-gray-500">Buts</div>
              </div>
              <div className="text-center p-3 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{player.assists || 0}</div>
                <div className="text-xs text-gray-500">Passes</div>
              </div>
              <div className="text-center p-3 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-brand-600">
                  {player.average_rating?.toFixed(1) || '—'}
                </div>
                <div className="text-xs text-gray-500">Moyenne</div>
              </div>
            </div>
          </div>

          {/* Historique saisons */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Historique
            </h3>
            <div className="space-y-2">
              {player.history?.map(season => (
                <div key={season.season} 
                     className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {season.team_name} · {season.club_name}
                    </div>
                    <div className="text-xs text-gray-500">{season.season}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {season.matches} matchs · {season.goals} buts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infos RGPD sensibles (uniquement coéquipiers/coach/président) */}
          {canViewSensitiveInfo ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Coordonnées
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📧</span>
                  <a href={`mailto:${player.email}`} className="hover:text-brand-600">
                    {player.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📞</span>
                  <a href={`tel:${player.phone}`} className="hover:text-brand-600">
                    {player.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🏠</span>
                  <span>{player.address}, {player.postal_code} {player.city}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-surface-50 rounded-xl text-center">
              <div className="text-sm text-gray-500">
                🔒 Les coordonnées sont visibles uniquement par les coéquipiers,
                le coach et le président.
              </div>
            </div>
          )}

          {/* Documents (si coach ou président) */}
          {(isCoach || isPresident) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Documents administratifs
              </h3>
              <div className="space-y-2">
                {player.documents?.map(doc => (
                  <div key={doc.id} 
                       className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📎</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {doc.custom_name || doc.type}
                        </div>
                        {doc.expires_at && (
                          <div className={`text-xs ${
                            new Date(doc.expires_at) < new Date() 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}>
                            Expire le {format(new Date(doc.expires_at), 'd MMM yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-brand-600 hover:underline">
                      Télécharger
                    </button>
                  </div>
                ))}
                {(!player.documents || player.documents.length === 0) && (
                  <div className="text-sm text-gray-400 text-center py-4">
                    Aucun document
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button onClick={onClose} className="w-full btn-secondary justify-center">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## CORRECTION 5 — Mock data : événements futurs

### Dates à utiliser (après le 22 mai 2026)

```js
// Matchs à venir (entre le 23 mai et le 15 juin 2026)
const mockUpcomingMatches = [
  {
    id: 'm-future-1',
    scheduled_at: '2026-05-23T15:00:00Z', // Samedi 23 mai
    // ...
  },
  {
    id: 'm-future-2',
    scheduled_at: '2026-05-25T14:00:00Z', // Lundi 25 mai
    // ...
  },
  {
    id: 'm-future-3',
    scheduled_at: '2026-05-30T15:00:00Z', // Samedi 30 mai
    // ...
  },
  {
    id: 'm-future-4',
    scheduled_at: '2026-06-06T15:00:00Z', // Samedi 6 juin
    // ...
  },
  {
    id: 'm-future-5',
    scheduled_at: '2026-06-13T15:00:00Z', // Samedi 13 juin
    // ...
  },
]

// Entraînements à venir (2 par semaine jusqu'au 15 juin)
const mockUpcomingTrainings = [
  {
    id: 't-future-1',
    scheduled_at: '2026-05-26T19:30:00Z', // Mardi 26 mai
    // ...
  },
  {
    id: 't-future-2',
    scheduled_at: '2026-05-28T19:30:00Z', // Jeudi 28 mai
    // ...
  },
  {
    id: 't-future-3',
    scheduled_at: '2026-06-02T19:30:00Z', // Mardi 2 juin
    // ...
  },
  // ... continuer jusqu'au 15 juin
]

// Événements à venir
const mockUpcomingEvents = [
  {
    id: 'ev-future-1',
    type: 'social',
    visibility: 'public',
    title: 'Repas de fin de saison',
    starts_at: '2026-05-31T20:00:00Z', // Dimanche 31 mai
    // ...
  },
  {
    id: 'ev-future-2',
    type: 'tournament',
    visibility: 'public',
    title: 'Tournoi inter-clubs U13',
    starts_at: '2026-06-07T09:00:00Z', // Dimanche 7 juin
    // ...
  },
]
```

---

## CORRECTION 6 — Clubs suivis pour tous les rôles

### Mock users enrichis

```js
const mockUsers = {
  president: {
    id: 'pres-1',
    first_name: 'Jean',
    last_name: 'Dupont',
    role: 'president',
    current_club_id: 'club-1', // FC Lens
    teams: ['team-1', 'team-2', 'team-3', 'team-4', 'team-5'],
    
    // Suit aussi d'autres clubs
    followed_clubs: ['club-3'], // OL Amateur
    followed_teams: ['team-16'], // Bordeaux U17
  },
  
  coach: {
    id: 'coach-1',
    first_name: 'Marie',
    last_name: 'Martin',
    role: 'coach',
    current_club_id: 'club-1', // FC Lens
    teams: ['team-1'], // Séniors A
    
    // Suit aussi d'autres clubs
    followed_clubs: ['club-2'], // AS Saint-Denis
    followed_teams: ['team-11', 'team-14'], // Bordeaux Séniors A + Lyon U15
  },
  
  player: {
    id: 'player-1',
    first_name: 'Karim',
    last_name: 'Diallo',
    role: 'player',
    current_club_id: 'club-1', // FC Lens
    teams: ['team-1'], // Séniors A
    
    // Suit aussi d'autres clubs
    followed_clubs: [], // Aucun club entier
    followed_teams: ['team-6', 'team-11'], // Saint-Denis Séniors A + Bordeaux Séniors A
  },
  
  supporter: {
    id: 'supp-1',
    first_name: 'Sophie',
    last_name: 'Durand',
    role: 'supporter',
    current_club_id: null,
    teams: [],
    
    // Suit plusieurs clubs et équipes
    followed_clubs: ['club-2', 'club-3'], // Saint-Denis + OL
    followed_teams: ['team-11', 'team-12'], // Bordeaux Séniors A + B
  },
}
```

**Résultat attendu :**
- Président voit dans Feed : posts Lens + OL
- Président voit dans Calendrier : matchs Lens + OL + Bordeaux U17
- Coach voit dans Feed : posts Lens + Saint-Denis
- Coach voit dans Calendrier : matchs Lens + Saint-Denis + Bordeaux A + Lyon U15
- Joueur voit dans Feed : posts Lens + Saint-Denis + Bordeaux
- Joueur voit dans Calendrier : matchs Lens Séniors A + Saint-Denis Séniors A + Bordeaux Séniors A
- Supporter voit dans Feed : posts Saint-Denis + OL + Bordeaux
- Supporter voit dans Calendrier : matchs Saint-Denis + OL + Bordeaux A + B

---

## RÉSUMÉ DES CORRECTIONS

1. ✅ Notation match : uniquement joueurs ayant joué (pas coach/président)
2. ✅ Messagerie : afficher rôle + équipe/club dans recherche
3. ✅ Bouton "💬 Message" sur fiche joueur
4. ✅ Fiche joueur étoffée (historique, stats) + RGPD (coordonnées masquées sauf coéquipiers/coach/président)
5. ✅ Mock data : matchs/entraînements/événements APRÈS le 22 mai 2026
6. ✅ Tous les rôles suivent d'autres clubs pour tester les flux

---

## POUR CLAUDE CODE

```
Appliquer CORRECTIONS_FINALES.md :

1. MatchDetailPage.jsx — section notation uniquement pour joueurs ayant joué
2. MessagesPage.jsx — getRoleLabel() pour afficher rôle dans recherche
3. Fiche joueur modal — bouton Message + infos RGPD + historique
4. Mock data — dates futures (23 mai - 15 juin 2026)
5. Mock users — followed_clubs et followed_teams pour tous les rôles
6. Tester avec switcher dev que chaque rôle voit bien ses suivis
```
