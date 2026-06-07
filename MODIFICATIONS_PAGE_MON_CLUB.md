# ClubManager — Modifications Page Mon Club

Refonte de la page dashboard président/intendant.

---

## MODIFICATIONS

### 1. FUSIONNER DOCUMENTS + JOUEURS = ONGLET "JOUEURS"

**Ancien layout :**
```
Onglets :
- Alertes 🚨 (À ENLEVER)
- Documents 📋
- Joueurs 👥
- Statistiques 📊
- Financier 💰
- Paramètres ⚙️
```

**Nouveau layout :**
```
Onglets :
- Joueurs 👥 (fusionné Documents + Joueurs)
- Statistiques 📊
- Financier 💰
- Paramètres ⚙️
```

---

## NOUVEL ONGLET "JOUEURS" (Fusionné)

### Structure

```
┌─────────────────────────────────────────┐
│         ONGLET JOUEURS                  │
├─────────────────────────────────────────┤
│                                         │
│  📋 Documents - Vue rapide              │
│  ┌─────────────────────────────────┐   │
│  │ Licences: 18/20 ████████ 90%    │   │
│  │ Cert. Méd: 19/20 █████████ 95% │   │
│  │ Assurances: 20/20 ██████████ 100%  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  👥 Joueurs                             │
│  [Rechercher...]  [Équipe: Tous ▼]     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #9 Karim Diallo (Attaquant)     │   │
│  │     Séniors A                   │   │
│  │                      [Profil →] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ #3 Sophie Martin (Défenseur)    │   │
│  │     Séniors A                   │   │
│  │                      [Profil →] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## CODE DE L'ONGLET JOUEURS (Fusionné)

### Composant JoueursTab

```jsx
function JoueursTab({ club }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [showMemberDocuments, setShowMemberDocuments] = useState(null)

  const clubMembers = mockUsers.filter(u =>
    u.roles?.some(r => r.club_id === club.id && r.role !== 'community')
  )

  const docTypes = ['licence', 'certificat_medical', 'assurance']
  const teams = mockTeams.filter(t => t.club_id === club.id)

  // Stats documents
  const getDocStats = () => {
    const stats = {}
    docTypes.forEach(type => {
      const total = clubMembers.length
      const hasDocs = clubMembers.filter(member => {
        const doc = mockDocuments.find(d =>
          d.user_id === member.id && d.type === type
        )
        return doc && (!doc.expires_at || new Date(doc.expires_at) > new Date())
      }).length

      stats[type] = {
        total,
        hasDocs,
        missing: total - hasDocs,
        percentage: Math.round((hasDocs / total) * 100),
      }
    })
    return stats
  }

  const docStats = getDocStats()

  // Filtrer joueurs
  const players = clubMembers.filter(u => u.roles?.some(r => r.role === 'player'))
  const filtered = players.filter(p => {
    const matchSearch = p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTeam = !filterTeam || p.roles?.some(r =>
      r.club_id === club.id && r.teams?.includes(filterTeam)
    )
    return matchSearch && matchTeam
  })

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* PARTIE 1 : DOCUMENTS - Vue rapide */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '1rem', color: '#1a1a1a' }}>
          Documents - Vue rapide
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {Object.entries(docStats).map(([type, stats]) => {
            const icon = type === 'licence' ? '📜' :
                        type === 'certificat_medical' ? '🏥' : '📋'
            const label = type === 'licence' ? 'Licences' :
                         type === 'certificat_medical' ? 'Certs médicaux' : 'Assurances'

            return (
              <div key={type} style={{
                background: '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  {stats.hasDocs}/{stats.total}
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}>
                  <div
                    style={{
                      height: '100%',
                      background: stats.percentage === 100 ? '#22c55e' : stats.percentage >= 80 ? '#eab308' : '#ef4444',
                      width: `${stats.percentage}%`,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {stats.percentage}% complet
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SÉPARATEUR */}
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0' }} />

      {/* PARTIE 2 : JOUEURS */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '1rem', color: '#1a1a1a' }}>
          Joueurs
        </h3>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un joueur..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
            }}
          />
          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
            }}
          >
            <option value="">Toutes les équipes</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Liste joueurs */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {filtered.map(player => (
            <div
              key={player.id}
              style={{
                padding: '12px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                  #{player.roles?.find(r => r.club_id === club.id)?.teams?.[0] ? 
                    mockTeams.find(t => t.id === player.roles.find(r => r.club_id === club.id).teams[0])?.name : ''}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
                  {player.first_name} {player.last_name}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {player.roles?.find(r => r.club_id === club.id)?.teams?.map(teamId => {
                    const team = mockTeams.find(t => t.id === teamId)
                    return team?.name
                  }).join(', ')}
                </div>
              </div>

              <button
                onClick={() => setShowMemberDocuments(player)}
                style={{
                  padding: '6px 12px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                Voir documents
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#999',
          }}>
            Aucun joueur trouvé
          </div>
        )}

        <div style={{ fontSize: '12px', color: '#999', marginTop: '1rem' }}>
          {filtered.length} joueur(s) sur {players.length}
        </div>
      </div>

      {/* MODAL documents joueur */}
      {showMemberDocuments && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '90%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Documents · {showMemberDocuments.first_name} {showMemberDocuments.last_name}
              </h3>
              <button onClick={() => setShowMemberDocuments(null)} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#999',
              }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {mockDocuments.filter(d => d.user_id === showMemberDocuments.id).map(doc => (
                <div key={doc.id} style={{
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {doc.custom_name || doc.type}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    Ajouté le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                    {doc.expires_at && (
                      <div style={{ marginTop: '4px', color: new Date(doc.expires_at) < new Date() ? '#d32f2f' : '#f57c00' }}>
                        Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      fontSize: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#0066cc',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}>
                      Télécharger
                    </button>
                    <button style={{
                      fontSize: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 2. ENLEVER L'ONGLET "ALERTES"

**Ancien :**
```jsx
const tabs = [
  { id: 'alertes', label: 'Alertes', icon: '🚨' },  // ❌ À SUPPRIMER
  { id: 'documents', label: 'Documents', icon: '📋' },  // ❌ À SUPPRIMER (fusionné)
  { id: 'joueurs', label: 'Joueurs', icon: '👥' },  // ✅ Fusionné documents + joueurs
  { id: 'stats', label: 'Statistiques', icon: '📊' },
  { id: 'financier', label: 'Financier', icon: '💰' },
  { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
]
```

**Nouveau :**
```jsx
const tabs = [
  { id: 'joueurs', label: 'Joueurs', icon: '👥' },  // Fusionné
  { id: 'stats', label: 'Statistiques', icon: '📊' },
  { id: 'financier', label: 'Financier', icon: '💰' },
  { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
]
```

**Dans PresidentPage.jsx :**

```jsx
{activeTab === 'joueurs' && <JoueursTab club={activeClub} />}
{activeTab === 'stats' && <StatsTab club={activeClub} />}
{activeTab === 'financier' && <FinancierTab club={activeClub} />}
{activeTab === 'parametres' && <ParametresTab club={activeClub} />}

// ❌ SUPPRIMER ces lignes :
// {activeTab === 'alertes' && <AlertesTab club={activeClub} />}
// {activeTab === 'documents' && <DocumentsTab club={activeClub} />}
```

---

## 3. INTENDANT PEUT ÉCRIRE DANS LE FEED AU NOM DU CLUB

### FeedPage - Autoriser les intendants

**Ancien :**
```jsx
const canPostInFeed = currentUser.current_role === 'coach' || 
                      currentUser.current_role === 'president'
```

**Nouveau :**
```jsx
const canPostInFeed = currentUser.current_role === 'coach' || 
                      currentUser.current_role === 'president' || 
                      currentUser.current_role === 'staff' // Intendant
```

### Bouton créer post

```jsx
{(currentUser.current_role === 'coach' || 
  currentUser.current_role === 'president' || 
  currentUser.current_role === 'staff') && (
  <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0' }} />
      <input
        type="text"
        placeholder={`Partagez quelque chose ${currentUser.current_role === 'staff' ? 'au nom du club...' : '...'}`}
        onClick={() => setShowCreatePostModal(true)}
        style={{
          flex: 1,
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
        readOnly
      />
      <button style={{
        padding: '8px 12px',
        background: '#0066cc',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
      }}>
        Publier
      </button>
    </div>
  </div>
)}
```

---

## RÉSUMÉ DES CHANGEMENTS

| Élément | Avant | Après |
|---------|-------|-------|
| Onglet "Alertes" | ✅ Présent | ❌ Supprimé |
| Onglet "Documents" | ✅ Séparé | ❌ Fusionné dans "Joueurs" |
| Onglet "Joueurs" | ✅ Joueurs seuls | ✅ Joueurs + stats documents |
| Nombre d'onglets | 6 | 4 |
| Intendant peut publier | ❌ Non | ✅ Oui |

---

## POUR CLAUDE CODE

```
Implémenter MODIFICATIONS_PAGE_MON_CLUB.md :

1. PresidentPage : supprimer l'onglet "Alertes"
2. PresidentPage : supprimer l'onglet "Documents"
3. Créer JoueursTab fusionné (documents + joueurs)
4. FeedPage : ajouter canPostInFeed pour staff
5. Tester avec rôle intendant (staff)

Layout final PresidentPage :
- 4 onglets : Joueurs, Statistiques, Financier, Paramètres
- Onglet Joueurs affiche docs en haut + joueurs en bas
```
