# ClubManager — Page Président Dashboard

Page exclusive pour les présidents avec gestion multi-clubs et sous-onglets.

---

## STRUCTURE GÉNÉRALE

**Route :** `/app/president` (accessible uniquement aux présidents)

**Layout :**
```
┌──────────────────────────────────────────────────────┐
│  👔 MON CLUB (ou MES CLUBS)                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Sélectionner un club :                             │
│  [FC Lens Académie ▼] (13 alertes)                  │
│  [AS Saint-Denis United]                            │
│  [OL Amateur]                                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Tabs : [Alertes] [Documents] [Joueurs] [Stat]     │
│        [Financier] [Paramètres]                     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Contenu de l'onglet actif]                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 1. SÉLECTION CLUB

### Code principal

```jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function PresidentPage() {
  const { currentUser } = useAuth()
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [activeTab, setActiveTab] = useState('alertes')

  // Récupérer les clubs dont l'user est président
  const myClubs = mockClubs.filter(c =>
    mockUsers.find(u =>
      u.id === currentUser.id &&
      u.role === 'president' &&
      u.current_club_id === c.id
    ) || currentUser.current_club_id === c.id
  )

  // Si pas encore sélectionné, sélectionner le premier
  const activeClub = selectedClubId
    ? mockClubs.find(c => c.id === selectedClubId)
    : myClubs[0]

  if (!activeClub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <div className="text-4xl mb-2">🏟️</div>
        <div className="text-lg font-semibold text-gray-900 mb-2">
          Vous n'êtes président d'aucun club
        </div>
        <div className="text-gray-500">
          Contactez l'admin pour être nommé président d'un club
        </div>
      </div>
    )
  }

  // Compter les alertes du club
  const alertCount = getAlertCount(activeClub.id)

  const tabs = [
    { id: 'alertes', label: 'Alertes', icon: '🚨' },
    { id: 'documents', label: 'Documents', icon: '📋' },
    { id: 'joueurs', label: 'Joueurs', icon: '👥' },
    { id: 'stats', label: 'Statistiques', icon: '📊' },
    { id: 'financier', label: 'Financier', icon: '💰' },
    { id: 'parametres', label: 'Paramètres', icon: '⚙️' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      {/* Sélection club */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
          👔 Mon club {myClubs.length > 1 ? '(ou mes clubs)' : ''}
        </h1>

        {/* Boutons clubs */}
        <div className="flex gap-2 flex-wrap">
          {myClubs.map(club => {
            const clubAlertCount = getAlertCount(club.id)
            const isActive = activeClub.id === club.id

            return (
              <button
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300'
                }`}>
                {club.name}
                {clubAlertCount > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-white text-brand-600'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {clubAlertCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="flex border-b border-surface-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 bg-brand-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu onglet */}
        <div className="p-6">
          {activeTab === 'alertes' && <AlertesTab club={activeClub} />}
          {activeTab === 'documents' && <DocumentsTab club={activeClub} />}
          {activeTab === 'joueurs' && <JoueursTab club={activeClub} />}
          {activeTab === 'stats' && <StatsTab club={activeClub} />}
          {activeTab === 'financier' && <FinancierTab club={activeClub} />}
          {activeTab === 'parametres' && <ParametresTab club={activeClub} />}
        </div>
      </div>
    </div>
  )
}
```

---

## 2. ONGLET ALERTES

```jsx
function AlertesTab({ club }) {
  const alerts = getClubAlerts(club.id)

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-2">✅</div>
        <div>Aucune alerte pour le moment</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-xl border-l-4 ${
            alert.severity === 'critical'
              ? 'bg-red-50 border-red-500'
              : alert.severity === 'warning'
              ? 'bg-orange-50 border-orange-500'
              : 'bg-blue-50 border-blue-500'
          }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                {alert.severity === 'critical' && '🚨 '}
                {alert.severity === 'warning' && '⚠️ '}
                {alert.severity === 'info' && 'ℹ️ '}
                {alert.title}
              </div>
              <div className="text-sm text-gray-700">
                {alert.description}
              </div>
              {alert.action && (
                <button
                  onClick={alert.action.callback}
                  className="mt-2 text-sm font-medium text-brand-600 hover:underline">
                  {alert.action.label} →
                </button>
              )}
            </div>
            {alert.count && (
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {alert.count}
                </div>
                <div className="text-xs text-gray-500">personnes</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Fonction pour récupérer les alertes du club
function getClubAlerts(clubId) {
  const alerts = []
  
  // Alertes documents expiration
  const expiredDocs = mockDocuments.filter(doc => {
    const user = mockUsers.find(u => u.id === doc.user_id)
    if (user?.current_club_id !== clubId) return false
    if (!doc.expires_at) return false
    
    const daysLeft = Math.floor(
      (new Date(doc.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
    )
    return daysLeft >= 0 && daysLeft <= 30
  })

  if (expiredDocs.length > 0) {
    alerts.push({
      id: 'alert-docs-expire',
      title: 'Documents qui expirent bientôt',
      description: `${expiredDocs.length} document(s) expire(nt) dans les 30 prochains jours`,
      severity: 'warning',
      count: expiredDocs.length,
      action: { label: 'Voir les documents', callback: () => {} },
    })
  }

  // Alertes documents manquants
  const missingDocs = mockUsers.filter(user => {
    if (user.current_club_id !== clubId) return false
    if (user.role === 'supporter') return false
    
    const userDocs = mockDocuments.filter(d => d.user_id === user.id)
    return userDocs.length === 0
  })

  if (missingDocs.length > 0) {
    alerts.push({
      id: 'alert-missing-docs',
      title: 'Documents manquants',
      description: `${missingDocs.length} personne(s) n'a(ont) uploadé aucun document`,
      severity: 'critical',
      count: missingDocs.length,
      action: { label: 'Contacter', callback: () => {} },
    })
  }

  // Alertes cotisations
  const unpaidMembers = mockUsers.filter(user => {
    if (user.current_club_id !== clubId) return false
    return user.payment_status === 'unpaid'
  })

  if (unpaidMembers.length > 0) {
    alerts.push({
      id: 'alert-payment',
      title: 'Cotisations impayées',
      description: `${unpaidMembers.length} membre(s) n'a(ont) pas payé`,
      severity: 'warning',
      count: unpaidMembers.length,
      action: { label: 'Voir détails', callback: () => {} },
    })
  }

  // Alertes présence entraînement
  const lowAttendance = mockUsers.filter(user => {
    if (user.current_club_id !== clubId || user.role !== 'player') return false
    const stats = mockPlayerStats.find(s => s.user_id === user.id && s.season === '2024-2025')
    return stats && stats.attendance_rate < 70
  })

  if (lowAttendance.length > 0) {
    alerts.push({
      id: 'alert-attendance',
      title: 'Présence aux entraînements faible',
      description: `${lowAttendance.length} joueur(s) avec <70% présence`,
      severity: 'info',
      count: lowAttendance.length,
    })
  }

  return alerts
}
```

---

## 3. ONGLET DOCUMENTS

```jsx
function DocumentsTab({ club }) {
  const clubMembers = mockUsers.filter(u => u.current_club_id === club.id && u.role !== 'supporter')
  const docTypes = ['licence', 'certificat_medical', 'assurance']

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

  return (
    <div className="space-y-6">
      {/* Vue rapide */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(docStats).map(([type, stats]) => {
          const icon = type === 'licence' ? '📜' :
                      type === 'certificat_medical' ? '🏥' : '📋'
          const label = type === 'licence' ? 'Licences' :
                       type === 'certificat_medical' ? 'Certs médicaux' : 'Assurances'

          return (
            <div key={type} className="bg-surface-50 rounded-xl p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm text-gray-600 mb-2">{label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.hasDocs}/{stats.total}
              </div>
              <div className="w-full bg-surface-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.missing > 0 && `${stats.missing} manquant(s)`}
                {stats.missing === 0 && '✓ Complet'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Liste détaillée */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Détail par personne</h3>
        
        <div className="space-y-2">
          {clubMembers.map(member => {
            const memberDocs = mockDocuments.filter(d => d.user_id === member.id)
            
            return (
              <div key={member.id} className="p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.role === 'coach' ? 'Coach' : 'Joueur'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {docTypes.map(type => {
                      const hasDoc = memberDocs.some(d => d.type === type)
                      return (
                        <div
                          key={type}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                            hasDoc ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {hasDoc ? '✓' : '✗'}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

---

## 4. ONGLET JOUEURS

```jsx
function JoueursTab({ club }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')

  const players = mockUsers.filter(u =>
    u.current_club_id === club.id && u.role === 'player'
  )

  const teams = mockTeams.filter(t => t.club_id === club.id)

  const filtered = players.filter(p => {
    const matchSearch = p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTeam = !filterTeam || p.teams?.includes(filterTeam)
    return matchSearch && matchTeam
  })

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher un joueur..."
          className="flex-1"
        />
        <select
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
          className="px-4 py-2 border border-surface-200 rounded-xl">
          <option value="">Toutes les équipes</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Liste joueurs */}
      <div className="space-y-2">
        {filtered.map(player => (
          <div
            key={player.id}
            className="p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {player.first_name} {player.last_name}
                </div>
                <div className="text-sm text-gray-600">
                  {player.teams?.map(teamId => {
                    const team = mockTeams.find(t => t.id === teamId)
                    return team?.name
                  }).join(', ')}
                </div>
              </div>
              
              <button className="text-brand-600 hover:underline text-sm">
                Voir profil
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Aucun joueur trouvé
        </div>
      )}

      <div className="text-sm text-gray-500">
        {filtered.length} joueur(s) sur {players.length}
      </div>
    </div>
  )
}
```

---

## 5. ONGLET STATISTIQUES

```jsx
function StatsTab({ club }) {
  const clubMembers = mockUsers.filter(u => u.current_club_id === club.id)
  const players = clubMembers.filter(u => u.role === 'player')
  const coachs = clubMembers.filter(u => u.role === 'coach')
  const teams = mockTeams.filter(t => t.club_id === club.id)

  return (
    <div className="space-y-6">
      {/* Vue rapide */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Joueurs" value={players.length} icon="⚽" />
        <StatCard label="Coachs" value={coachs.length} icon="👔" />
        <StatCard label="Équipes" value={teams.length} icon="🏟️" />
        <StatCard label="Membres total" value={clubMembers.length} icon="👥" />
      </div>

      {/* Statistiques par équipe */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Par équipe</h3>
        <div className="space-y-2">
          {teams.map(team => {
            const teamPlayers = players.filter(p => p.teams?.includes(team.id))
            return (
              <div key={team.id} className="p-3 bg-surface-50 rounded-lg flex justify-between">
                <div className="font-medium text-gray-900">{team.name}</div>
                <div className="text-gray-600">{teamPlayers.length} joueurs</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface-50 rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
```

---

## 6. ONGLET FINANCIER & PARAMÈTRES

```jsx
function FinancierTab({ club }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">💰</div>
      <div>À implémenter : suivi cotisations et budget</div>
    </div>
  )
}

function ParametresTab({ club }) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-50 rounded-xl p-4">
        <div className="font-semibold text-gray-900 mb-2">Informations du club</div>
        <div className="space-y-2 text-sm">
          <div><strong>Nom :</strong> {club.name}</div>
          <div><strong>Ville :</strong> {club.city}</div>
          <div><strong>Président :</strong> [À récupérer]</div>
          <div><strong>Créé le :</strong> [À récupérer]</div>
        </div>
      </div>

      <button className="btn-secondary">Éditer les infos du club</button>
    </div>
  )
}
```

---

## RÉSUMÉ

1. ✅ Page exclusive aux présidents (`/app/president`)
2. ✅ Sélection multi-clubs (si président de plusieurs)
3. ✅ 6 sous-onglets : Alertes, Documents, Joueurs, Statistiques, Financier, Paramètres
4. ✅ Alertes intelligentes (docs expiration, cotisations, présence)
5. ✅ Vue documents détaillée par personne
6. ✅ Recherche et filtrage joueurs
7. ✅ Statistiques club et par équipe

---

## POUR CLAUDE CODE

```
Implémenter PAGE_PRESIDENT_DASHBOARD.md :

1. Créer route /app/president (accessible présidents uniquement)
2. Component PresidentPage avec sélection clubs
3. Component AlertesTab avec logique alertes
4. Component DocumentsTab avec stats docs
5. Component JoueursTab avec recherche/filtre
6. Component StatsTab avec vue rapide
7. Placeholders FinancierTab et ParametresTab

À améliorer plus tard : trésorier, paramètres avancés
```
