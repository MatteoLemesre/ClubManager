# ClubManager — Pop-up joueur détaillé

Refonte complète du pop-up fiche joueur avec onglets et informations complètes.

---

## Déclenchement

Clic sur un joueur dans :
- TeamDetailPage, onglet Joueurs
- MatchDetailPage, composition
- Toute liste de joueurs

---

## Structure du pop-up

### Layout principal

Pop-up plein écran avec sidebar gauche (30%) + contenu droit (70%)

```
┌──────────────────────────────────────────────────────────┐
│  [✕]                                                      │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │           CONTENU ONGLET                      │
│  30%     │              70%                              │
│          │                                               │
│          │                                               │
│          │                                               │
│          │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

---

## Sidebar gauche (fixe)

```
┌────────────────────────────────────┐
│                                    │
│         [Avatar #9]                │
│                                    │
│      Karim Diallo                  │
│      24 ans                        │
│                                    │
│  ⚽ Attaquant                       │
│  🏆 FC Lens — Séniors A           │
│                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                    │
│  📊 SAISON 2024-2025              │
│                                    │
│  [  12  ]  [  8   ]  [  3   ]    │
│   Matchs    Buts     Passes       │
│                                    │
│  [ ⭐ 4.2/5 ]                      │
│   Moyenne                          │
│                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                    │
│  [💬 Envoyer un message]          │
│                                    │
└────────────────────────────────────┘
```

**Code sidebar :**

```jsx
<div className="w-80 bg-surface-50 border-r border-surface-200 p-6 flex flex-col">
  {/* Avatar + Infos */}
  <div className="text-center mb-6">
    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-brand-600 
                    flex items-center justify-center text-white font-bold text-3xl">
      {player.jersey_number}
    </div>
    
    <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
      {player.first_name} {player.last_name}
    </h2>
    
    <div className="text-gray-500 mb-4">{age} ans</div>
    
    <div className="inline-flex items-center gap-2 px-3 py-1 
                    bg-white rounded-full text-sm text-gray-700 border border-surface-200 mb-2">
      <span>⚽</span>
      <span>{player.position}</span>
    </div>
    
    <div className="text-sm text-gray-600">
      🏆 {player.club.name} — {player.team.name}
    </div>
  </div>

  {/* Stats saison */}
  <div className="mb-6 p-4 bg-white rounded-xl border border-surface-200">
    <div className="text-sm font-semibold text-gray-700 mb-3">
      📊 Saison 2024-2025
    </div>
    
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="text-center p-2 bg-surface-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{stats.matches}</div>
        <div className="text-[10px] text-gray-500">Matchs</div>
      </div>
      <div className="text-center p-2 bg-surface-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{stats.goals}</div>
        <div className="text-[10px] text-gray-500">Buts</div>
      </div>
      <div className="text-center p-2 bg-surface-50 rounded-lg">
        <div className="text-xl font-bold text-gray-900">{stats.assists}</div>
        <div className="text-[10px] text-gray-500">Passes</div>
      </div>
    </div>
    
    <div className="text-center p-2 bg-brand-50 rounded-lg">
      <div className="text-xl font-bold text-brand-600">
        ⭐ {stats.average_rating.toFixed(1)}/5
      </div>
      <div className="text-[10px] text-brand-700">Moyenne</div>
    </div>
  </div>

  {/* Bouton message */}
  <button
    onClick={() => {
      onClose()
      navigate('/app/messages', { 
        state: { startConversationWith: player.id } 
      })
    }}
    className="w-full btn-primary justify-center">
    💬 Envoyer un message
  </button>
</div>
```

---

## Contenu droit — Onglets

### 5 onglets

1. **Vue d'ensemble** — Infos générales + graphiques
2. **Statistiques** — Détails stats saison
3. **Historique** — Toutes les saisons précédentes
4. **Coordonnées** — Contact (RGPD : visible selon permissions)
5. **Documents** — Docs admin (visible coach/président uniquement)

```jsx
const tabs = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
  { id: 'stats', label: 'Statistiques', icon: '📈' },
  { id: 'history', label: 'Historique', icon: '📅' },
  { id: 'contact', label: 'Coordonnées', icon: '📞' },
  { id: 'documents', label: 'Documents', icon: '📄' },
]

<div className="flex border-b border-surface-200 px-6 pt-4">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
        activeTab === tab.id
          ? 'border-brand-600 text-brand-600'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}>
      {tab.icon} {tab.label}
    </button>
  ))}
</div>
```

---

## Onglet 1 — Vue d'ensemble

```
┌────────────────────────────────────────────────┐
│  📊 VUE D'ENSEMBLE                             │
├────────────────────────────────────────────────┤
│                                                │
│  INFORMATIONS GÉNÉRALES                        │
│                                                │
│  Date de naissance                             │
│  12 mai 2001 (24 ans)                          │
│                                                │
│  Lieu de naissance                             │
│  Paris, France                                 │
│                                                │
│  Poste                                         │
│  Attaquant                                     │
│                                                │
│  Pied fort                                     │
│  Droit                                         │
│                                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                │
│  PERFORMANCES SAISON 2024-2025                 │
│                                                │
│  [Graphique évolution notes]                   │
│  [Graphique buts par mois]                     │
│                                                │
│  Présence aux entraînements : 92%             │
│  Minutes jouées : 980 min                      │
│  Cartons : 1 jaune, 0 rouge                   │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Onglet 2 — Statistiques

```
┌────────────────────────────────────────────────┐
│  📈 STATISTIQUES DÉTAILLÉES                    │
├────────────────────────────────────────────────┤
│                                                │
│  SAISON 2024-2025                             │
│                                                │
│  Attaque                                       │
│  • Matchs joués : 12                          │
│  • Minutes jouées : 980 min                    │
│  • Buts : 8                                   │
│  • Passes décisives : 3                       │
│  • Tirs : 34                                  │
│  • Tirs cadrés : 18 (53%)                     │
│                                                │
│  Discipline                                    │
│  • Cartons jaunes : 1                         │
│  • Cartons rouges : 0                         │
│  • Fautes : 8                                 │
│                                                │
│  Performance                                   │
│  • Note moyenne : 4.2/5                       │
│  • Meilleure note : 5.0/5                     │
│  • Pire note : 3.5/5                          │
│  • Homme du match : 2 fois                    │
│                                                │
│  Présence                                      │
│  • Présence entraînements : 18/20 (90%)       │
│  • Présence matchs : 12/13 (92%)              │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Onglet 3 — Historique

```
┌────────────────────────────────────────────────┐
│  📅 HISTORIQUE COMPLET                         │
├────────────────────────────────────────────────┤
│                                                │
│  2024-2025 (en cours)                         │
│  ⚽ FC Lens Académie — Séniors A              │
│  12 matchs · 8 buts · 3 passes · ⭐ 4.2      │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  2023-2024                                    │
│  ⚽ FC Lens Académie — Séniors B              │
│  18 matchs · 12 buts · 5 passes · ⭐ 4.5     │
│  🏆 Champion Régional 2                       │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  2022-2023                                    │
│  ⚽ AS Liévin — U19                           │
│  15 matchs · 6 buts · 2 passes · ⭐ 3.8      │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  2021-2022                                    │
│  ⚽ AS Liévin — U17                           │
│  10 matchs · 3 buts · 1 passe · ⭐ 3.5       │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Onglet 4 — Coordonnées (RGPD)

**Si coéquipier/coach/président :**

```
┌────────────────────────────────────────────────┐
│  📞 COORDONNÉES                                │
├────────────────────────────────────────────────┤
│                                                │
│  Email                                         │
│  karim.diallo@test.fr                          │
│  [Copier]  [Envoyer un email]                 │
│                                                │
│  Téléphone                                     │
│  06 12 34 56 78                               │
│  [Copier]  [Appeler]                          │
│                                                │
│  Adresse                                       │
│  12 rue du Stade                              │
│  62300 Lens                                    │
│  Pas-de-Calais — Hauts-de-France             │
│  [Voir sur la carte]                          │
│                                                │
└────────────────────────────────────────────────┘
```

**Si autre (pas de permission) :**

```
┌────────────────────────────────────────────────┐
│  📞 COORDONNÉES                                │
├────────────────────────────────────────────────┤
│                                                │
│  🔒 Informations protégées                     │
│                                                │
│  Les coordonnées personnelles sont            │
│  accessibles uniquement aux :                  │
│                                                │
│  • Coéquipiers                                │
│  • Coach de l'équipe                          │
│  • Président du club                          │
│                                                │
│  Cette protection respecte le RGPD.           │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Onglet 5 — Documents (coach/président uniquement)

```
┌────────────────────────────────────────────────┐
│  📄 DOCUMENTS ADMINISTRATIFS                   │
├────────────────────────────────────────────────┤
│                                                │
│  Licence 2024-2025                            │
│  📎 licence_karim_diallo.pdf · 245 Ko        │
│  📅 Ajouté le 12 mars 2024                    │
│  ⏰ Expire le 31/12/2024                      │
│  ✓ À jour                                     │
│  [Télécharger]                                │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  Certificat médical                           │
│  📎 certificat_medical.pdf · 128 Ko          │
│  📅 Ajouté le 5 janvier 2024                  │
│  ⚠️ Expire dans 7 mois                        │
│  [Télécharger]                                │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  [+ Ajouter un document pour ce joueur]      │
│                                                │
└────────────────────────────────────────────────┘
```

**Si pas coach/président :**

```
┌────────────────────────────────────────────────┐
│  📄 DOCUMENTS ADMINISTRATIFS                   │
├────────────────────────────────────────────────┤
│                                                │
│  🔒 Accès restreint                            │
│                                                │
│  Les documents administratifs sont            │
│  accessibles uniquement au coach et           │
│  au président.                                 │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Code complet PlayerDetailModal

```jsx
function PlayerDetailModal({ player, currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  
  const age = differenceInYears(new Date(), new Date(player.birth_date))
  
  const stats = mockPlayerStats.find(s => 
    s.user_id === player.id && s.season === '2024-2025'
  )
  
  const history = mockPlayerHistory
    .filter(h => h.user_id === player.id)
    .sort((a, b) => b.season.localeCompare(a.season))
  
  const documents = mockDocuments.filter(d => d.user_id === player.id)
  
  // Permissions RGPD
  const isTeammate = currentUser.teams?.some(t => player.teams?.includes(t))
  const isCoach = currentUser.role === 'coach' && 
                  currentUser.teams?.some(t => player.teams?.includes(t))
  const isPresident = currentUser.role === 'president' && 
                      currentUser.current_club_id === player.current_club_id
  
  const canViewContact = isTeammate || isCoach || isPresident
  const canViewDocuments = isCoach || isPresident

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'stats', label: 'Statistiques', icon: '📈' },
    { id: 'history', label: 'Historique', icon: '📅' },
    { id: 'contact', label: 'Coordonnées', icon: '📞' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        
        {/* Sidebar gauche */}
        <div className="w-80 bg-surface-50 border-r border-surface-200 p-6 flex flex-col">
          {/* Avatar + Infos */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-brand-600 
                            flex items-center justify-center text-white font-bold text-3xl">
              {player.jersey_number}
            </div>
            
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">
              {player.first_name} {player.last_name}
            </h2>
            
            <div className="text-gray-500 mb-4">{age} ans</div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 
                            bg-white rounded-full text-sm text-gray-700 border border-surface-200 mb-2">
              <span>⚽</span>
              <span>{player.position}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              🏆 {player.club.name} — {player.team.name}
            </div>
          </div>

          {/* Stats saison */}
          {stats && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-surface-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">
                📊 Saison 2024-2025
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-surface-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{stats.matches}</div>
                  <div className="text-[10px] text-gray-500">Matchs</div>
                </div>
                <div className="text-center p-2 bg-surface-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{stats.goals}</div>
                  <div className="text-[10px] text-gray-500">Buts</div>
                </div>
                <div className="text-center p-2 bg-surface-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{stats.assists}</div>
                  <div className="text-[10px] text-gray-500">Passes</div>
                </div>
              </div>
              
              <div className="text-center p-2 bg-brand-50 rounded-lg">
                <div className="text-xl font-bold text-brand-600">
                  ⭐ {stats.average_rating.toFixed(1)}/5
                </div>
                <div className="text-[10px] text-brand-700">Moyenne</div>
              </div>
            </div>
          )}

          {/* Bouton message */}
          <button
            onClick={() => {
              onClose()
              navigate('/app/messages', { 
                state: { startConversationWith: player.id } 
              })
            }}
            className="w-full btn-primary justify-center">
            💬 Envoyer un message
          </button>
        </div>

        {/* Contenu droit */}
        <div className="flex-1 flex flex-col">
          {/* Header avec close */}
          <div className="flex items-center justify-end p-4 border-b border-surface-200">
            <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl">
              ✕
            </button>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-surface-200 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu onglet */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && <OverviewTab player={player} stats={stats} />}
            {activeTab === 'stats' && <StatsTab stats={stats} />}
            {activeTab === 'history' && <HistoryTab history={history} />}
            {activeTab === 'contact' && <ContactTab player={player} canView={canViewContact} />}
            {activeTab === 'documents' && <DocumentsTab documents={documents} player={player} canView={canViewDocuments} />}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## POUR CLAUDE CODE

```
Refonte complète du pop-up joueur selon POPUP_JOUEUR_DETAILLE.md

Créer PlayerDetailModal avec :
- Sidebar gauche fixe (avatar, stats résumé, bouton message)
- 5 onglets à droite (Vue d'ensemble / Stats / Historique / Contact / Documents)
- Permissions RGPD pour contact et documents
- Code complet fourni dans le document

Remplacer l'ancien pop-up partout où il est utilisé.
```
