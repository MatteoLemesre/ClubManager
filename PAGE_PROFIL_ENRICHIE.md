# ClubManager — Page Profil enrichie

Refonte complète de la page profil pour afficher historique et stats.

---

## Route : `/app/profile`

---

## Structure de la page

### Header profil

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [Avatar KD]                           │
│                                                    │
│           Karim Diallo                             │
│           24 ans                                   │
│                                                    │
│  ⚽ Joueur Séniors A · FC Lens Académie           │
│  📍 Lens, Pas-de-Calais                           │
│                                                    │
│  [Modifier mon profil]                            │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Section Statistiques saison actuelle

```
┌────────────────────────────────────────────────────┐
│  📊 SAISON 2024-2025                               │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  12  │  │  8   │  │  3   │  │ 4.2  │         │
│  │Matchs│  │ Buts │  │Passes│  │ ⭐   │         │
│  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │  Minutes jouées : 980 min                │    │
│  │  Taux de présence : 92%                  │    │
│  │  Cartons jaunes : 1                      │    │
│  │  Cartons rouges : 0                      │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Section Historique des saisons

```
┌────────────────────────────────────────────────────┐
│  📅 HISTORIQUE                                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  2024-2025 (en cours)                             │
│  ⚽ FC Lens Académie — Séniors A                  │
│  12 matchs · 8 buts · 3 passes · ⭐ 4.2          │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  2023-2024                                        │
│  ⚽ FC Lens Académie — Séniors B                  │
│  18 matchs · 12 buts · 5 passes · ⭐ 4.5         │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  2022-2023                                        │
│  ⚽ AS Liévin — U19                               │
│  15 matchs · 6 buts · 2 passes · ⭐ 3.8          │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  2021-2022                                        │
│  ⚽ AS Liévin — U17                               │
│  10 matchs · 3 buts · 1 passe · ⭐ 3.5           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Section Infos personnelles

```
┌────────────────────────────────────────────────────┐
│  👤 INFORMATIONS PERSONNELLES                      │
├────────────────────────────────────────────────────┤
│                                                    │
│  Date de naissance                                │
│  12 mai 2001 (24 ans)                             │
│                                                    │
│  Lieu de naissance                                │
│  Paris, France                                    │
│                                                    │
│  Poste                                            │
│  Attaquant                                        │
│                                                    │
│  Numéro de maillot                                │
│  #9                                               │
│                                                    │
│  Email                                            │
│  karim.diallo@test.fr                             │
│                                                    │
│  Téléphone                                        │
│  06 12 34 56 78                                   │
│                                                    │
│  Adresse                                          │
│  12 rue du Stade                                  │
│  62300 Lens                                       │
│  Pas-de-Calais — Hauts-de-France                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Section Documents administratifs

```
┌────────────────────────────────────────────────────┐
│  📄 DOCUMENTS ADMINISTRATIFS                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Licence 2024-2025                                │
│  📎 licence_karim_diallo.pdf · 245 Ko            │
│  📅 Ajouté le 12 mars 2024                        │
│  ⏰ Expire le 31/12/2024                          │
│  [Télécharger]  [Supprimer]                       │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  Certificat médical                               │
│  📎 certificat_medical.pdf · 128 Ko              │
│  📅 Ajouté le 5 janvier 2024                      │
│  ⚠️ Expire le 31/12/2024 (dans 7 mois)           │
│  [Télécharger]  [Supprimer]                       │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  [+ Ajouter un document]                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Code complet ProfilePage.jsx

```jsx
import { useState } from 'react'
import { format, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const age = differenceInYears(new Date(), new Date(currentUser.birth_date))
  
  // Récupérer les stats et historique
  const currentSeasonStats = mockPlayerStats.find(s => 
    s.user_id === currentUser.id && s.season === '2024-2025'
  )
  
  const history = mockPlayerHistory
    .filter(h => h.user_id === currentUser.id)
    .sort((a, b) => b.season.localeCompare(a.season))
  
  const documents = mockDocuments.filter(d => d.user_id === currentUser.id)
  
  const currentTeam = mockTeams.find(t => currentUser.teams?.includes(t.id))
  const currentClub = mockClubs.find(c => c.id === currentUser.current_club_id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header profil */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-brand-600 
                        flex items-center justify-center text-white 
                        font-bold text-3xl">
          {currentUser.first_name[0]}{currentUser.last_name[0]}
        </div>
        
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          {currentUser.first_name} {currentUser.last_name}
        </h1>
        
        <div className="text-lg text-gray-500 mb-4">{age} ans</div>
        
        {currentUser.role !== 'supporter' && currentTeam && currentClub && (
          <div className="inline-flex items-center gap-2 px-4 py-2 
                          bg-brand-50 rounded-full text-brand-700 text-sm font-medium mb-2">
            <span>⚽</span>
            <span>
              {currentUser.role === 'president' && 'Président'}
              {currentUser.role === 'coach' && `Coach ${currentTeam.name}`}
              {currentUser.role === 'player' && `Joueur ${currentTeam.name}`}
              {' · '}
              {currentClub.name}
            </span>
          </div>
        )}
        
        {currentUser.role === 'supporter' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 
                          bg-surface-100 rounded-full text-gray-600 text-sm font-medium mb-2">
            <span>👥</span>
            <span>Supporter</span>
          </div>
        )}
        
        <div className="text-sm text-gray-500 mb-6">
          📍 {currentUser.city}, {currentUser.department}
        </div>
        
        <button 
          onClick={() => setEditMode(!editMode)}
          className="btn-secondary">
          {editMode ? 'Annuler' : 'Modifier mon profil'}
        </button>
      </div>

      {/* Stats saison actuelle (uniquement pour joueurs) */}
      {currentUser.role === 'player' && currentSeasonStats && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📊 Saison 2024-2025
          </h2>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-surface-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900">
                {currentSeasonStats.matches}
              </div>
              <div className="text-xs text-gray-500 mt-1">Matchs</div>
            </div>
            <div className="text-center p-4 bg-surface-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900">
                {currentSeasonStats.goals}
              </div>
              <div className="text-xs text-gray-500 mt-1">Buts</div>
            </div>
            <div className="text-center p-4 bg-surface-50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900">
                {currentSeasonStats.assists}
              </div>
              <div className="text-xs text-gray-500 mt-1">Passes</div>
            </div>
            <div className="text-center p-4 bg-surface-50 rounded-xl">
              <div className="text-3xl font-bold text-brand-600">
                {currentSeasonStats.average_rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">⭐ Moyenne</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-surface-50 rounded-xl">
              <span className="text-gray-500">Minutes jouées</span>
              <div className="font-semibold text-gray-900 mt-1">
                {currentSeasonStats.minutes_played} min
              </div>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl">
              <span className="text-gray-500">Taux de présence</span>
              <div className="font-semibold text-gray-900 mt-1">
                {currentSeasonStats.attendance_rate}%
              </div>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl">
              <span className="text-gray-500">Cartons jaunes</span>
              <div className="font-semibold text-gray-900 mt-1">
                {currentSeasonStats.yellow_cards}
              </div>
            </div>
            <div className="p-3 bg-surface-50 rounded-xl">
              <span className="text-gray-500">Cartons rouges</span>
              <div className="font-semibold text-gray-900 mt-1">
                {currentSeasonStats.red_cards}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique saisons (uniquement pour joueurs) */}
      {currentUser.role === 'player' && history.length > 0 && (
        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Historique</h2>
          
          <div className="space-y-4">
            {history.map(season => (
              <div key={season.id} 
                   className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {season.season}
                      {season.season === '2024-2025' && (
                        <span className="ml-2 text-xs bg-brand-100 text-brand-700 
                                       px-2 py-0.5 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ⚽ {season.club_name} — {season.team_name}
                    </div>
                  </div>
                  {season.average_rating && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-600">
                        {season.average_rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">⭐</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                  <span>{season.matches} matchs</span>
                  <span>·</span>
                  <span>{season.goals} buts</span>
                  <span>·</span>
                  <span>{season.assists} passes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infos personnelles */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          👤 Informations personnelles
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Date de naissance</div>
              <div className="font-medium text-gray-900">
                {format(new Date(currentUser.birth_date), 'd MMMM yyyy', { locale: fr })}
                {' '}({age} ans)
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Lieu de naissance</div>
              <div className="font-medium text-gray-900">
                {currentUser.birth_place}
              </div>
            </div>
          </div>
          
          {currentUser.role === 'player' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Poste</div>
                <div className="font-medium text-gray-900">
                  {currentUser.position || 'Non renseigné'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Numéro de maillot</div>
                <div className="font-medium text-gray-900">
                  #{currentUser.jersey_number || '—'}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="font-medium text-gray-900">{currentUser.email}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Téléphone</div>
            <div className="font-medium text-gray-900">{currentUser.phone}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Adresse</div>
            <div className="font-medium text-gray-900">
              {currentUser.address}<br />
              {currentUser.postal_code} {currentUser.city}<br />
              <span className="text-sm text-gray-500">
                {currentUser.department} — {currentUser.region}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents administratifs */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          📄 Documents administratifs
        </h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📎</div>
            <div className="text-sm">Aucun document ajouté</div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} 
                   className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {doc.custom_name || doc.type}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      📎 {doc.filename} · {(doc.file_size / 1024).toFixed(0)} Ko
                    </div>
                    <div className="text-xs text-gray-400">
                      📅 Ajouté le {format(new Date(doc.uploaded_at), 'd MMMM yyyy', { locale: fr })}
                    </div>
                    {doc.expires_at && (
                      <div className={`text-xs mt-1 ${
                        new Date(doc.expires_at) < new Date()
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}>
                        ⏰ Expire le {format(new Date(doc.expires_at), 'd MMMM yyyy', { locale: fr })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm text-brand-600 hover:underline">
                      Télécharger
                    </button>
                    <button className="text-sm text-red-600 hover:underline">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={() => setShowUploadModal(true)}
          className="w-full mt-4 btn-secondary justify-center">
          + Ajouter un document
        </button>
      </div>

      {/* Modal upload document */}
      {showUploadModal && (
        <UploadDocumentModal
          userId={currentUser.id}
          onClose={() => setShowUploadModal(false)}
          onUploaded={(doc) => {
            // Recharger documents
            setShowUploadModal(false)
          }}
        />
      )}
    </div>
  )
}
```

---

## Mock data nécessaire

### Stats saison actuelle

```js
const mockPlayerStats = [
  {
    id: 'stat-1',
    user_id: 'player-1', // Karim
    season: '2024-2025',
    team_id: 'team-1',
    team_name: 'Séniors A',
    club_id: 'club-1',
    club_name: 'FC Lens Académie',
    matches: 12,
    goals: 8,
    assists: 3,
    minutes_played: 980,
    attendance_rate: 92,
    yellow_cards: 1,
    red_cards: 0,
    average_rating: 4.2,
  },
]
```

### Historique saisons

```js
const mockPlayerHistory = [
  {
    id: 'hist-1',
    user_id: 'player-1',
    season: '2024-2025',
    team_id: 'team-1',
    team_name: 'Séniors A',
    club_id: 'club-1',
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
    team_id: 'team-2',
    team_name: 'Séniors B',
    club_id: 'club-1',
    club_name: 'FC Lens Académie',
    matches: 18,
    goals: 12,
    assists: 5,
    average_rating: 4.5,
  },
  {
    id: 'hist-3',
    user_id: 'player-1',
    season: '2022-2023',
    team_id: 'team-old-1',
    team_name: 'U19',
    club_id: 'club-old-1',
    club_name: 'AS Liévin',
    matches: 15,
    goals: 6,
    assists: 2,
    average_rating: 3.8,
  },
  {
    id: 'hist-4',
    user_id: 'player-1',
    season: '2021-2022',
    team_id: 'team-old-2',
    team_name: 'U17',
    club_id: 'club-old-1',
    club_name: 'AS Liévin',
    matches: 10,
    goals: 3,
    assists: 1,
    average_rating: 3.5,
  },
]
```

---

## POUR CLAUDE CODE

```
Refonte complète ProfilePage.jsx selon PAGE_PROFIL_ENRICHIE.md

Structure :
1. Header profil (avatar, nom, âge, rôle, club)
2. Stats saison actuelle (4 cartes + détails) — uniquement joueurs
3. Historique saisons (liste chronologique) — uniquement joueurs
4. Infos personnelles (date/lieu naissance, poste, numéro, contact, adresse)
5. Documents administratifs (liste + bouton ajouter)

Mock data à ajouter :
- mockPlayerStats (stats saison actuelle par joueur)
- mockPlayerHistory (historique toutes saisons par joueur)

Tester avec les 4 rôles (président/coach/joueur/supporter)
```
