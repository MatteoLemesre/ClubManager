import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { USERS, TEAMS, DOCUMENTS, MOCK_PLAYER_STATS } from '../../data/mock'

// ── Mock data pour AS Saint-Denis United ────────────────────────────────────
const SD_TEAMS = [
  { id: 'sd-team-1', name: 'Séniors A', category: 'Séniors', ageGroup: '18+' },
  { id: 'sd-team-2', name: 'U17 A', category: 'U17', ageGroup: '15-17' },
]

const SD_MEMBERS = [
  {
    id: 'sd-u1', firstName: 'Karim', lastName: 'Oussama', role: 'coach',
    teamIds: ['sd-team-1'],
    license: { status: 'active', number: 'SD-001', expiresAt: '2027-08-31' },
  },
  {
    id: 'sd-u2', firstName: 'Moussa', lastName: 'Diarra', role: 'player',
    teamIds: ['sd-team-1'], position: 'Milieu', jerseyNumber: 8,
    license: { status: 'active', number: 'SD-002', expiresAt: '2027-08-31' },
    stats: { goals: 3, assists: 2, matches: 8, yellowCards: 1, redCards: 0 },
    payment_status: 'paid',
  },
  {
    id: 'sd-u3', firstName: 'Ahmed', lastName: 'Benali', role: 'player',
    teamIds: ['sd-team-1'], position: 'Défenseur', jerseyNumber: 4,
    license: { status: 'active', number: 'SD-003', expiresAt: '2027-08-31' },
    stats: { goals: 0, assists: 1, matches: 5, yellowCards: 2, redCards: 0 },
    payment_status: 'unpaid',
  },
  {
    id: 'sd-u4', firstName: 'Kevin', lastName: 'Traoré', role: 'player',
    teamIds: ['sd-team-1'], position: 'Attaquant', jerseyNumber: 9,
    license: { status: 'expiring', number: 'SD-004', expiresAt: '2026-09-15' },
    stats: { goals: 7, assists: 3, matches: 10, yellowCards: 0, redCards: 1 },
    payment_status: 'unpaid',
  },
  {
    id: 'sd-u5', firstName: 'Souleymane', lastName: 'Koné', role: 'player',
    teamIds: ['sd-team-1'], position: 'Gardien', jerseyNumber: 1,
    license: { status: 'active', number: 'SD-005', expiresAt: '2027-08-31' },
    stats: { goals: 0, assists: 0, matches: 9, yellowCards: 0, redCards: 0 },
    payment_status: 'paid',
  },
  {
    id: 'sd-u6', firstName: 'Lamine', lastName: 'Cissé', role: 'player',
    teamIds: ['sd-team-2'], position: 'Milieu', jerseyNumber: 10,
    license: { status: 'active', number: 'SD-006', expiresAt: '2027-08-31' },
    stats: { goals: 5, assists: 4, matches: 7, yellowCards: 1, redCards: 0 },
    payment_status: 'paid',
  },
  {
    id: 'sd-u7', firstName: 'Ibrahima', lastName: 'Ndiaye', role: 'player',
    teamIds: ['sd-team-2'], position: 'Défenseur', jerseyNumber: 3,
    license: { status: 'active', number: 'SD-007', expiresAt: '2027-08-31' },
    stats: { goals: 0, assists: 2, matches: 6, yellowCards: 0, redCards: 0 },
    payment_status: 'unpaid',
  },
]

const SD_DOCUMENTS = [
  { id: 'sd-doc-1', user_id: 'sd-u2', type: 'licence', expires_at: '2027-08-31' },
  { id: 'sd-doc-2', user_id: 'sd-u2', type: 'certificat_medical', expires_at: '2027-06-30' },
  { id: 'sd-doc-3', user_id: 'sd-u4', type: 'licence', expires_at: '2026-09-15' },
  { id: 'sd-doc-4', user_id: 'sd-u5', type: 'licence', expires_at: '2027-08-31' },
  { id: 'sd-doc-5', user_id: 'sd-u6', type: 'licence', expires_at: '2027-08-31' },
  { id: 'sd-doc-6', user_id: 'sd-u6', type: 'certificat_medical', expires_at: '2027-12-31' },
  { id: 'sd-doc-7', user_id: 'sd-u7', type: 'licence', expires_at: '2027-08-31' },
  // sd-u3 has no docs → missing docs alert
]

const SD_PLAYER_STATS = [
  { user_id: 'sd-u2', season: '2025-2026', attendance_rate: 85 },
  { user_id: 'sd-u3', season: '2025-2026', attendance_rate: 60 },
  { user_id: 'sd-u4', season: '2025-2026', attendance_rate: 90 },
  { user_id: 'sd-u5', season: '2025-2026', attendance_rate: 95 },
  { user_id: 'sd-u6', season: '2025-2026', attendance_rate: 72 },
  { user_id: 'sd-u7', season: '2025-2026', attendance_rate: 65 },
]

// ── Lookup par club ──────────────────────────────────────────────────────────
const ALL_CLUBS = {
  'club-1': {
    id: 'club-1', name: 'FC Lens Académie', city: 'Lens',
    sport: 'Football', founded: 2005,
  },
  'mock-club-sd': {
    id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis',
    sport: 'Football', founded: 2010,
  },
}

function getClubTeams(clubId) {
  if (clubId === 'club-1')       return TEAMS.map(t => ({ ...t, club_id: 'club-1' }))
  if (clubId === 'mock-club-sd') return SD_TEAMS.map(t => ({ ...t, club_id: 'mock-club-sd' }))
  return []
}

function getClubMembers(clubId) {
  if (clubId === 'club-1')
    return USERS.filter(u => ['player', 'coach'].includes(u.role))
  if (clubId === 'mock-club-sd') return SD_MEMBERS
  return []
}

function getClubDocuments(clubId) {
  if (clubId === 'club-1')       return DOCUMENTS
  if (clubId === 'mock-club-sd') return SD_DOCUMENTS
  return []
}

function getClubPlayerStats(clubId) {
  if (clubId === 'club-1')       return MOCK_PLAYER_STATS
  if (clubId === 'mock-club-sd') return SD_PLAYER_STATS
  return []
}

// ── Alertes ──────────────────────────────────────────────────────────────────
function getClubAlerts(clubId) {
  const alerts = []
  const members  = getClubMembers(clubId)
  const docs     = getClubDocuments(clubId)
  const stats    = getClubPlayerStats(clubId)
  const now      = new Date()
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Documents qui expirent dans les 30 jours
  const expiringSoon = docs.filter(doc => {
    if (!doc.expires_at) return false
    const exp = new Date(doc.expires_at)
    return exp >= now && exp <= in30days
  })
  if (expiringSoon.length > 0) {
    alerts.push({
      id: 'alert-docs-expire',
      title: 'Documents qui expirent bientôt',
      description: `${expiringSoon.length} document(s) expire(nt) dans les 30 prochains jours`,
      severity: 'warning',
      count: expiringSoon.length,
      action: { label: 'Voir les documents' },
    })
  }

  // Documents manquants (membres sans aucun document)
  const missingDocs = members.filter(member =>
    member.role !== 'supporter' &&
    !docs.some(d => d.user_id === member.id)
  )
  if (missingDocs.length > 0) {
    alerts.push({
      id: 'alert-missing-docs',
      title: 'Documents manquants',
      description: `${missingDocs.length} personne(s) n'a(ont) uploadé aucun document`,
      severity: 'critical',
      count: missingDocs.length,
      action: { label: 'Voir les membres' },
    })
  }

  // Cotisations impayées
  const unpaid = members.filter(m => m.payment_status === 'unpaid')
  if (unpaid.length > 0) {
    alerts.push({
      id: 'alert-payment',
      title: 'Cotisations impayées',
      description: `${unpaid.length} membre(s) n'a(ont) pas payé leur cotisation`,
      severity: 'warning',
      count: unpaid.length,
      action: { label: 'Voir les détails' },
    })
  }

  // Présence faible (< 70%)
  const lowAttendance = members.filter(m => {
    if (m.role !== 'player') return false
    const s = stats.find(s => s.user_id === m.id)
    return s && s.attendance_rate < 70
  })
  if (lowAttendance.length > 0) {
    alerts.push({
      id: 'alert-attendance',
      title: 'Présence aux entraînements faible',
      description: `${lowAttendance.length} joueur(s) avec moins de 70% de présence`,
      severity: 'info',
      count: lowAttendance.length,
    })
  }

  return alerts
}

function getAlertCount(clubId) {
  return getClubAlerts(clubId).length
}

// ── Sub-composants ────────────────────────────────────────────────────────────

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
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                {alert.severity === 'critical' && '🚨 '}
                {alert.severity === 'warning'  && '⚠️ '}
                {alert.severity === 'info'     && 'ℹ️ '}
                {alert.title}
              </div>
              <div className="text-sm text-gray-700">{alert.description}</div>
              {alert.action && (
                <button className="mt-2 text-sm font-medium text-brand-600 hover:underline">
                  {alert.action.label} →
                </button>
              )}
            </div>
            {alert.count && (
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-gray-900">{alert.count}</div>
                <div className="text-xs text-gray-500">personnes</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function DocumentsTab({ club }) {
  const clubMembers = getClubMembers(club.id).filter(u => u.role !== 'supporter')
  const allDocs     = getClubDocuments(club.id)
  const docTypes    = ['licence', 'certificat_medical', 'assurance']
  const docLabels   = { licence: 'Licences', certificat_medical: 'Certs médicaux', assurance: 'Assurances' }
  const docIcons    = { licence: '📜', certificat_medical: '🏥', assurance: '📋' }

  const docStats = {}
  docTypes.forEach(type => {
    const total   = clubMembers.length
    const hasDocs = clubMembers.filter(member => {
      const doc = allDocs.find(d => d.user_id === member.id && d.type === type)
      return doc && (!doc.expires_at || new Date(doc.expires_at) > new Date())
    }).length
    docStats[type] = { total, hasDocs, missing: total - hasDocs, percentage: total ? Math.round((hasDocs / total) * 100) : 0 }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {docTypes.map(type => {
          const s = docStats[type]
          return (
            <div key={type} className="bg-surface-50 rounded-xl p-4">
              <div className="text-2xl mb-2">{docIcons[type]}</div>
              <div className="text-sm text-gray-600 mb-2">{docLabels[type]}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{s.hasDocs}/{s.total}</div>
              <div className="w-full bg-surface-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all"
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {s.missing > 0 ? `${s.missing} manquant(s)` : '✓ Complet'}
              </div>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Détail par personne</h3>
        <div className="space-y-2">
          {clubMembers.map(member => {
            const memberDocs = allDocs.filter(d => d.user_id === member.id)
            return (
              <div key={member.id} className="p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
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
                          title={docLabels[type]}
                          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                            hasDoc ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
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

function JoueursTab({ club }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')

  const players = getClubMembers(club.id).filter(u => u.role === 'player')
  const teams   = getClubTeams(club.id)

  const filtered = players.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    const matchSearch = name.includes(searchTerm.toLowerCase())
    const matchTeam   = !filterTeam || p.teamIds?.includes(filterTeam)
    return matchSearch && matchTeam
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher un joueur..."
          className="flex-1 pl-4 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm
                     text-gray-900 placeholder-surface-400 focus:outline-none focus:ring-2
                     focus:ring-brand-300 focus:border-brand-400"
        />
        <select
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
          className="px-4 py-2 border border-surface-200 rounded-xl text-sm bg-white text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="">Toutes les équipes</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(player => {
          const playerTeams = teams.filter(t => player.teamIds?.includes(t.id))
          return (
            <div
              key={player.id}
              className="p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {player.firstName} {player.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {player.position && <span className="mr-2">{player.position}</span>}
                    {playerTeams.map(t => t.name).join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {player.license && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      player.license.status === 'active'   ? 'bg-emerald-100 text-emerald-700' :
                      player.license.status === 'expiring' ? 'bg-orange-100 text-orange-700' :
                                                              'bg-red-100 text-red-700'
                    }`}>
                      {player.license.status === 'active'   ? 'Licencié' :
                       player.license.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">Aucun joueur trouvé</div>
      )}

      <div className="text-sm text-gray-500">
        {filtered.length} joueur(s) sur {players.length}
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

function StatsTab({ club }) {
  const members = getClubMembers(club.id)
  const players = members.filter(u => u.role === 'player')
  const coaches = members.filter(u => u.role === 'coach')
  const teams   = getClubTeams(club.id)
  const stats   = getClubPlayerStats(club.id)

  const totalGoals = players.reduce((sum, p) => sum + (p.stats?.goals ?? 0), 0)
  const avgAttendance = (() => {
    const withStats = players.filter(p => stats.find(s => s.user_id === p.id))
    if (!withStats.length) return null
    const total = withStats.reduce((sum, p) => {
      const s = stats.find(s => s.user_id === p.id)
      return sum + (s?.attendance_rate ?? 0)
    }, 0)
    return Math.round(total / withStats.length)
  })()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Joueurs"       value={players.length} icon="⚽" />
        <StatCard label="Coachs"        value={coaches.length} icon="👔" />
        <StatCard label="Équipes"       value={teams.length}   icon="🏟️" />
        <StatCard label="Membres total" value={members.length} icon="👥" />
      </div>

      {(totalGoals > 0 || avgAttendance !== null) && (
        <div className="grid grid-cols-2 gap-3">
          {totalGoals > 0 && (
            <StatCard label="Buts cette saison" value={totalGoals} icon="🥅" />
          )}
          {avgAttendance !== null && (
            <StatCard label="Présence moy." value={`${avgAttendance}%`} icon="📅" />
          )}
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Par équipe</h3>
        <div className="space-y-2">
          {teams.map(team => {
            const teamPlayers = players.filter(p => p.teamIds?.includes(team.id))
            return (
              <div key={team.id} className="p-3 bg-surface-50 rounded-lg flex justify-between items-center">
                <div className="font-medium text-gray-900">{team.name}</div>
                <div className="text-sm text-gray-500">{teamPlayers.length} joueur(s)</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FinancierTab() {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">💰</div>
      <div className="font-medium text-gray-500 mb-1">À implémenter</div>
      <div className="text-sm">Suivi des cotisations et du budget du club</div>
    </div>
  )
}

function ParametresTab({ club }) {
  return (
    <div className="space-y-4">
      <div className="bg-surface-50 rounded-xl p-5">
        <div className="font-semibold text-gray-900 mb-3">Informations du club</div>
        <div className="space-y-2 text-sm">
          <div><span className="text-gray-500 w-24 inline-block">Nom :</span> <span className="font-medium">{club.name}</span></div>
          <div><span className="text-gray-500 w-24 inline-block">Ville :</span> {club.city}</div>
          <div><span className="text-gray-500 w-24 inline-block">Sport :</span> {club.sport}</div>
          {club.founded && (
            <div><span className="text-gray-500 w-24 inline-block">Fondé en :</span> {club.founded}</div>
          )}
        </div>
      </div>
      <button className="px-4 py-2 border border-surface-200 rounded-xl text-sm font-medium
                         text-gray-700 hover:bg-surface-50 transition-colors">
        Éditer les informations
      </button>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function PresidentPage() {
  const { currentUser, is } = useAuth()
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [activeTab, setActiveTab] = useState('alertes')

  // Accès réservé aux présidents
  if (!is('president')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <div className="text-lg font-semibold text-gray-900 mb-2">Accès réservé</div>
        <div className="text-gray-500">Cette page est accessible uniquement aux présidents de club.</div>
      </div>
    )
  }

  // Récupérer les clubs du président depuis ses rôles
  const presidentClubIds = (currentUser.user_roles ?? [])
    .filter(r => r.role_type === 'president' && r.scope_type === 'club')
    .map(r => r.scope_id)

  const myClubs = presidentClubIds
    .map(id => ALL_CLUBS[id])
    .filter(Boolean)

  // Fallback : utiliser current_club_id si pas de rôles
  if (myClubs.length === 0 && currentUser.current_club_id && ALL_CLUBS[currentUser.current_club_id]) {
    myClubs.push(ALL_CLUBS[currentUser.current_club_id])
  }

  const activeClub = selectedClubId
    ? ALL_CLUBS[selectedClubId]
    : myClubs[0]

  if (!activeClub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🏟️</div>
        <div className="text-lg font-semibold text-gray-900 mb-2">Vous n'êtes président d'aucun club</div>
        <div className="text-gray-500">Contactez l'administrateur pour être nommé président d'un club.</div>
      </div>
    )
  }

  const tabs = [
    { id: 'alertes',    label: 'Alertes',      icon: '🚨' },
    { id: 'documents',  label: 'Documents',    icon: '📋' },
    { id: 'joueurs',    label: 'Joueurs',      icon: '👥' },
    { id: 'stats',      label: 'Statistiques', icon: '📊' },
    { id: 'financier',  label: 'Financier',    icon: '💰' },
    { id: 'parametres', label: 'Paramètres',   icon: '⚙️' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Header + sélection club */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
          👔 Mon club {myClubs.length > 1 ? '(ou mes clubs)' : ''}
        </h1>

        <div className="flex gap-2 flex-wrap">
          {myClubs.map(club => {
            const count    = getAlertCount(club.id)
            const isActive = activeClub.id === club.id
            return (
              <button
                key={club.id}
                onClick={() => { setSelectedClubId(club.id); setActiveTab('alertes') }}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300'
                }`}
              >
                {club.name}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-brand-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="flex border-b border-surface-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 bg-brand-50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'alertes'    && <AlertesTab    club={activeClub} />}
          {activeTab === 'documents'  && <DocumentsTab  club={activeClub} />}
          {activeTab === 'joueurs'    && <JoueursTab    club={activeClub} />}
          {activeTab === 'stats'      && <StatsTab      club={activeClub} />}
          {activeTab === 'financier'  && <FinancierTab />}
          {activeTab === 'parametres' && <ParametresTab club={activeClub} />}
        </div>
      </div>
    </div>
  )
}
