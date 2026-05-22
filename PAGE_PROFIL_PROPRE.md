# ClubManager — Page Profil (version propre)

Retour à une mise en page claire avec historique pour TOUS les rôles.

---

## Principes

1. Mise en page simple et aérée (sections empilées)
2. Historique pour TOUS (joueur, coach, président, supporter)
3. Un supporter peut être un ancien joueur sans club actuel
4. Stats uniquement pour joueur actif

---

## Exemple supporter ancien joueur

**Sophie Durand - Supportrice**
- Suit AS Saint-Denis + OL
- Ancienne joueuse U19 AS Liévin (2020-2022)
- Son historique affiche ces 2 saisons

**Karim Diallo - Joueur actif**
- Joue actuellement Séniors A FC Lens
- Stats saison actuelle affichées
- Historique complet (4 saisons)

---

## Mock data historique

### Historique avec tous types de rôles

```js
const mockPlayerHistory = [
  // Karim - joueur actuel
  {
    id: 'hist-1',
    user_id: 'player-1',
    season: '2024-2025',
    role_type: 'player',
    team_name: 'Séniors A',
    club_name: 'FC Lens Académie',
    matches: 12,
    goals: 8,
    assists: 3,
    average_rating: 4.2,
  },
  {
    id: 'hist-2',
    user_id: 'player-1',
    season: '2023-2024',
    role_type: 'player',
    team_name: 'Séniors B',
    club_name: 'FC Lens Académie',
    matches: 18,
    goals: 12,
    assists: 5,
    average_rating: 4.5,
  },
  
  // Sophie - supporter ancien joueur
  {
    id: 'hist-supp-1',
    user_id: 'supp-1',
    season: '2021-2022',
    role_type: 'player',
    team_name: 'U19',
    club_name: 'AS Liévin',
    matches: 8,
    goals: 2,
    assists: 1,
    average_rating: 3.8,
  },
  {
    id: 'hist-supp-2',
    user_id: 'supp-1',
    season: '2020-2021',
    role_type: 'player',
    team_name: 'U17',
    club_name: 'AS Liévin',
    matches: 6,
    goals: 1,
    assists: 0,
    average_rating: 3.5,
  },
  
  // Jean - président + ancien coach
  {
    id: 'hist-pres-1',
    user_id: 'pres-1',
    season: '2024-2025',
    role_type: 'president',
    team_name: null,
    club_name: 'FC Lens Académie',
  },
  {
    id: 'hist-pres-2',
    user_id: 'pres-1',
    season: '2023-2024',
    role_type: 'coach',
    team_name: 'Séniors A',
    club_name: 'FC Lens Académie',
  },
  {
    id: 'hist-pres-3',
    user_id: 'pres-1',
    season: '2022-2023',
    role_type: 'coach',
    team_name: 'U19',
    club_name: 'FC Lens Académie',
  },
]
```

### Affichage historique selon role_type

```jsx
{history.map(season => (
  <div key={season.id} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
    <div className="flex items-start justify-between">
      <div>
        <div className="font-semibold text-gray-900 mb-1">
          {season.season}
          {season.season === '2024-2025' && (
            <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
              En cours
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          {season.role_type === 'player' && '⚽ Joueur'}
          {season.role_type === 'coach' && '👔 Coach'}
          {season.role_type === 'president' && '👔 Président'}
          {' · '}
          {season.club_name}
          {season.team_name && ` — ${season.team_name}`}
        </div>
        
        {season.role_type === 'player' && season.matches && (
          <div className="text-sm text-gray-500 mt-2">
            {season.matches} matchs · {season.goals} buts · {season.assists} passes
          </div>
        )}
      </div>
      
      {season.role_type === 'player' && season.average_rating && (
        <div className="text-right">
          <div className="text-lg font-bold text-brand-600">
            {season.average_rating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-400">⭐</div>
        </div>
      )}
    </div>
  </div>
))}
```

---

## POUR CLAUDE CODE

```
Refaire ProfilePage.jsx version propre :

1. Retour mise en page simple (sections empilées, pas de sidebar)
2. Header : avatar + nom + âge + badge rôle actuel + ville
3. Stats saison : uniquement si joueur actif ET stats disponibles
4. Historique : TOUS les rôles avec role_type (player/coach/president)
5. Infos perso : date/lieu naissance, email, tél, adresse
6. Documents : liste + bouton ajouter

Mock data :
- mockPlayerHistory avec role_type
- Ajouter historique pour supporter (ancien joueur)
- Ajouter historique mixte président (ancien coach)

Tester avec supporter ancien joueur + président ancien coach.
```
