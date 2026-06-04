import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
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

// ── Mock transactions ────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  // FC Lens Académie (club-1) — saison 2025-2026
  {
    id: 'trans-1', club_id: 'club-1', type: 'revenue', category: 'subscription',
    title: 'Cotisations saison 2025-2026', amount: 3500,
    from_to: 'Membres du club', description: '15 joueurs × 233€',
    date: '2025-09-01', is_recurring: true, created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'trans-2', club_id: 'club-1', type: 'expense', category: 'equipment',
    title: 'Achat ballons et cônes', amount: 450,
    from_to: 'Decathlon', description: '12 ballons + 20 cônes d\'entraînement',
    date: '2025-09-05', is_recurring: false, created_at: '2025-09-05T14:00:00Z',
  },
  {
    id: 'trans-3', club_id: 'club-1', type: 'expense', category: 'arbitrage',
    title: 'Arbitrage match Séniors A', amount: 80,
    from_to: 'Ligue Hauts-de-France', description: 'Match domicile vs FC Valenciennes',
    date: '2025-09-10', is_recurring: false, created_at: '2025-09-10T16:00:00Z',
  },
  {
    id: 'trans-4', club_id: 'club-1', type: 'revenue', category: 'subsidy',
    title: 'Subvention municipale', amount: 1200,
    from_to: 'Mairie de Lens', description: 'Subvention annuelle ville de Lens',
    date: '2025-10-15', is_recurring: true, created_at: '2025-10-15T09:00:00Z',
  },
  {
    id: 'trans-5', club_id: 'club-1', type: 'expense', category: 'insurance',
    title: 'Assurance club annuelle', amount: 380,
    from_to: 'Groupama', description: 'Assurance responsabilité civile + blessures',
    date: '2025-10-20', is_recurring: true, created_at: '2025-10-20T10:30:00Z',
  },
  {
    id: 'trans-6', club_id: 'club-1', type: 'revenue', category: 'sponsorship',
    title: 'Sponsoring maillots', amount: 800,
    from_to: 'Boulangerie Martin', description: 'Logo sur maillots domicile saison 2025-2026',
    date: '2025-11-01', is_recurring: false, created_at: '2025-11-01T11:00:00Z',
  },
  {
    id: 'trans-7', club_id: 'club-1', type: 'expense', category: 'licenses',
    title: 'Licences fédérales FFF', amount: 620,
    from_to: 'FFF / District', description: 'Licences pour 25 membres',
    date: '2025-11-10', is_recurring: true, created_at: '2025-11-10T08:00:00Z',
  },
  {
    id: 'trans-8', club_id: 'club-1', type: 'expense', category: 'travel',
    title: 'Déplacement tournoi hiver U13', amount: 240,
    from_to: 'Autocar Lemaire', description: 'Transport aller-retour Arras',
    date: '2025-12-14', is_recurring: false, created_at: '2025-12-14T07:00:00Z',
  },
  {
    id: 'trans-9', club_id: 'club-1', type: 'revenue', category: 'donation',
    title: 'Don anonyme fin d\'année', amount: 300,
    from_to: 'Donateur anonyme', description: 'Don reçu lors du repas de Noël',
    date: '2025-12-20', is_recurring: false, created_at: '2025-12-20T19:00:00Z',
  },
  {
    id: 'trans-10', club_id: 'club-1', type: 'expense', category: 'salary',
    title: 'Indemnités coach principal', amount: 500,
    from_to: 'Marc Leroy', description: 'Indemnités janvier 2026',
    date: '2026-01-31', is_recurring: true, created_at: '2026-01-31T10:00:00Z',
  },
  {
    id: 'trans-11', club_id: 'club-1', type: 'revenue', category: 'sales',
    title: 'Vente merchandising', amount: 430,
    from_to: 'Boutique club', description: 'Écharpes, casquettes, t-shirts',
    date: '2026-02-15', is_recurring: false, created_at: '2026-02-15T15:00:00Z',
  },
  {
    id: 'trans-12', club_id: 'club-1', type: 'expense', category: 'maintenance',
    title: 'Entretien terrain principal', amount: 320,
    from_to: 'Mairie de Lens', description: 'Participation entretien gazon mars 2026',
    date: '2026-03-10', is_recurring: false, created_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'trans-13', club_id: 'club-1', type: 'expense', category: 'admin',
    title: 'Frais administratifs', amount: 95,
    from_to: 'La Poste / fournitures', description: 'Papeterie, envois courriers officiels',
    date: '2026-03-25', is_recurring: false, created_at: '2026-03-25T11:00:00Z',
  },
  {
    id: 'trans-14', club_id: 'club-1', type: 'revenue', category: 'rental',
    title: 'Location terrain week-end', amount: 250,
    from_to: 'AS Liévin', description: 'Location terrain pour tournoi inter-clubs',
    date: '2026-04-06', is_recurring: false, created_at: '2026-04-06T16:00:00Z',
  },
  {
    id: 'trans-15', club_id: 'club-1', type: 'expense', category: 'equipment',
    title: 'Renouvellement maillots Séniors', amount: 680,
    from_to: 'Sport 2000', description: '16 maillots domicile + 16 extérieur',
    date: '2026-05-05', is_recurring: false, created_at: '2026-05-05T14:00:00Z',
  },
  {
    id: 'trans-16', club_id: 'club-1', type: 'expense', category: 'arbitrage',
    title: 'Arbitrage phase finale Séniors A', amount: 120,
    from_to: 'Ligue Hauts-de-France', description: 'Match demi-finale district',
    date: '2026-05-18', is_recurring: false, created_at: '2026-05-18T17:00:00Z',
  },
  {
    id: 'trans-17', club_id: 'club-1', type: 'revenue', category: 'subsidy',
    title: 'Subvention région sport jeunes', amount: 600,
    from_to: 'Conseil Régional Hauts-de-France', description: 'Soutien à la pratique sportive U13/U17',
    date: '2026-06-01', is_recurring: false, created_at: '2026-06-01T10:00:00Z',
  },
  // AS Saint-Denis United (mock-club-sd)
  {
    id: 'sd-trans-1', club_id: 'mock-club-sd', type: 'revenue', category: 'subscription',
    title: 'Cotisations membres', amount: 2100,
    from_to: 'Membres du club', description: '12 joueurs × 175€',
    date: '2025-09-03', is_recurring: true, created_at: '2025-09-03T10:00:00Z',
  },
  {
    id: 'sd-trans-2', club_id: 'mock-club-sd', type: 'expense', category: 'equipment',
    title: 'Achat équipements d\'entraînement', amount: 310,
    from_to: 'Nike Store', description: 'Ballons, chasubles, plots',
    date: '2025-09-10', is_recurring: false, created_at: '2025-09-10T14:00:00Z',
  },
  {
    id: 'sd-trans-3', club_id: 'mock-club-sd', type: 'revenue', category: 'sponsorship',
    title: 'Partenariat local', amount: 500,
    from_to: 'Kebab Oussama', description: 'Sponsor maillots saison 2025-2026',
    date: '2025-10-01', is_recurring: false, created_at: '2025-10-01T11:00:00Z',
  },
  {
    id: 'sd-trans-4', club_id: 'mock-club-sd', type: 'expense', category: 'licenses',
    title: 'Licences fédérales', amount: 420,
    from_to: 'FFF District 93', description: 'Licences 18 membres',
    date: '2025-11-05', is_recurring: true, created_at: '2025-11-05T09:00:00Z',
  },
  {
    id: 'sd-trans-5', club_id: 'mock-club-sd', type: 'expense', category: 'travel',
    title: 'Déplacement match extérieur', amount: 180,
    from_to: 'Covoiturage membres', description: 'Match vs FC Aubervilliers',
    date: '2026-03-22', is_recurring: false, created_at: '2026-03-22T08:00:00Z',
  },
  {
    id: 'sd-trans-6', club_id: 'mock-club-sd', type: 'revenue', category: 'subsidy',
    title: 'Subvention mairie Saint-Denis', amount: 800,
    from_to: 'Mairie de Saint-Denis', description: 'Aide associations sportives',
    date: '2026-04-10', is_recurring: true, created_at: '2026-04-10T10:00:00Z',
  },
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

// ── Catégories ───────────────────────────────────────────────────────────────
const REVENUE_CATEGORIES = [
  { value: 'subscription', label: 'Cotisations/Adhésions' },
  { value: 'subsidy',      label: 'Subvention' },
  { value: 'sponsorship',  label: 'Sponsoring' },
  { value: 'donation',     label: 'Donation' },
  { value: 'sales',        label: 'Ventes' },
  { value: 'rental',       label: 'Location' },
  { value: 'other',        label: 'Autre' },
]

const EXPENSE_CATEGORIES = [
  { value: 'equipment',    label: 'Fournitures/Équipements' },
  { value: 'arbitrage',    label: 'Arbitrage' },
  { value: 'travel',       label: 'Déplacements' },
  { value: 'salary',       label: 'Salaires/Indemnités' },
  { value: 'insurance',    label: 'Assurances' },
  { value: 'admin',        label: 'Frais administratifs' },
  { value: 'licenses',     label: 'Adhésions/Licences fédérales' },
  { value: 'maintenance',  label: 'Maintenance' },
  { value: 'other',        label: 'Autre' },
]

const CATEGORY_LABELS = Object.fromEntries(
  [...REVENUE_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => [c.value, c.label])
)

function fmt(amount) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

// ── Modal ajout transaction ───────────────────────────────────────────────────
function AddTransactionModal({ clubId, onClose, onCreate }) {
  const [type,        setType]        = useState('revenue')
  const [category,    setCategory]    = useState('')
  const [title,       setTitle]       = useState('')
  const [amount,      setAmount]      = useState('')
  const [fromTo,      setFromTo]      = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [error,       setError]       = useState('')

  const categories = type === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES

  const handleCreate = () => {
    if (!title.trim() || !amount || !category || !fromTo.trim()) {
      setError('Veuillez remplir tous les champs obligatoires (*).')
      return
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Le montant doit être un nombre positif.')
      return
    }
    onCreate({
      id:          `trans-${Date.now()}`,
      club_id:     clubId,
      type,
      category,
      title:       title.trim(),
      amount:      parseFloat(amount),
      currency:    'EUR',
      from_to:     fromTo.trim(),
      description: description.trim() || null,
      date,
      is_recurring: isRecurring,
      created_at:  new Date().toISOString(),
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-surface-200 rounded-xl text-sm text-gray-900 ' +
                   'focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-gray-900">Ajouter une transaction</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="flex gap-2">
              {[
                { value: 'revenue', label: '📈 Revenu' },
                { value: 'expense', label: '📉 Dépense' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setCategory('') }}
                  className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                    type === t.value
                      ? 'bg-brand-600 text-white shadow'
                      : 'bg-surface-100 text-gray-700 hover:bg-surface-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              <option value="">Choisir une catégorie...</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Cotisations saison 2025-2026"
              className={inputCls}
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className={inputCls}
            />
          </div>

          {/* De/À */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'revenue' ? 'De qui *' : 'À qui *'}
            </label>
            <input
              value={fromTo}
              onChange={e => setFromTo(e.target.value)}
              placeholder={type === 'revenue' ? 'Ex : Mairie de Lens' : 'Ex : Decathlon'}
              className={inputCls}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Détails supplémentaires..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Récurrence */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-brand-600"
            />
            <span className="text-sm text-gray-700">Transaction récurrente (cotisations, assurances…)</span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-medium
                       text-gray-700 hover:bg-surface-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium
                       hover:bg-brand-700 transition-colors shadow"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Onglet Financier ──────────────────────────────────────────────────────────
function FinancierTab({ club }) {
  const [filterType,   setFilterType]   = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [showModal,    setShowModal]    = useState(false)
  const [localTrans,   setLocalTrans]   = useState([])

  const baseTrans = [
    ...MOCK_TRANSACTIONS.filter(t => t.club_id === club.id),
    ...localTrans.filter(t => t.club_id === club.id),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  // Filtrage par période
  const filtered = baseTrans.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterPeriod !== 'all') {
      const d   = new Date(t.date)
      const now = new Date()
      if (filterPeriod === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (filterPeriod === 'quarter') {
        return Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
               d.getFullYear() === now.getFullYear()
      }
      if (filterPeriod === 'year') {
        return d.getFullYear() === now.getFullYear()
      }
    }
    return true
  })

  // Calculs sur l'ensemble des transactions (pas juste le filtre)
  const totalRevenue = baseTrans.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amount, 0)
  const totalExpense = baseTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalRevenue - totalExpense

  const periodLabel = { all: 'total', month: 'ce mois', quarter: 'ce trimestre', year: 'cette année' }[filterPeriod]

  const handleAdd = (trans) => {
    setLocalTrans(prev => [...prev, trans])
    setShowModal(false)
  }

  return (
    <div className="space-y-5">
      {/* Cartes résumé */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 border ${balance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-xs font-medium mb-1 ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            Solde {periodLabel}
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{fmt(balance)}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-xs font-medium text-blue-700 mb-1">Revenus ({periodLabel})</div>
          <div className="text-2xl font-bold text-blue-600">+{fmt(totalRevenue)}</div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="text-xs font-medium text-red-700 mb-1">Dépenses ({periodLabel})</div>
          <div className="text-2xl font-bold text-red-600">-{fmt(totalExpense)}</div>
        </div>
      </div>

      {/* Filtres + bouton ajout */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
          {[
            { value: 'all',     label: 'Tous' },
            { value: 'revenue', label: '📈 Revenus' },
            { value: 'expense', label: '📉 Dépenses' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={filterPeriod}
          onChange={e => setFilterPeriod(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-xl text-sm bg-white text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="all">Tout le temps</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="ml-auto px-4 py-1.5 bg-brand-600 text-white rounded-xl text-sm font-medium
                     hover:bg-brand-700 transition-colors shadow"
        >
          + Ajouter une transaction
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">🔍</div>
            <div>Aucune transaction sur cette période</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">De / À</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(trans => (
                  <tr key={trans.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {format(new Date(trans.date), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          trans.type === 'revenue' ? 'bg-emerald-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trans.title}</div>
                          {trans.description && (
                            <div className="text-xs text-gray-400 mt-0.5">{trans.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {trans.from_to}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 bg-surface-100 text-gray-600 rounded-full">
                        {CATEGORY_LABELS[trans.category] ?? trans.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold text-sm whitespace-nowrap ${
                      trans.type === 'revenue' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {trans.type === 'revenue' ? '+' : '-'}{fmt(trans.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} transaction(s) · Solde affiché sur l'ensemble des données
      </p>

      {showModal && (
        <AddTransactionModal
          clubId={club.id}
          onClose={() => setShowModal(false)}
          onCreate={handleAdd}
        />
      )}
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
          {activeTab === 'financier'  && <FinancierTab  club={activeClub} />}
          {activeTab === 'parametres' && <ParametresTab club={activeClub} />}
        </div>
      </div>
    </div>
  )
}
