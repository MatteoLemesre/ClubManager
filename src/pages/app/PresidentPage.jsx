import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth, MOCK_CLUBS, canAccessDashboard } from '../../context/AuthContext'
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
  { id: 'sd-doc-1', user_id: 'sd-u2', type: 'licence',            custom_name: 'Licence 2025-2026', expires_at: '2027-08-31', uploaded_at: '2025-09-01T10:00:00Z' },
  { id: 'sd-doc-2', user_id: 'sd-u2', type: 'certificat_medical', custom_name: 'Certificat médical', expires_at: '2027-06-30', uploaded_at: '2025-09-03T10:00:00Z' },
  { id: 'sd-doc-3', user_id: 'sd-u4', type: 'licence',            custom_name: 'Licence 2025-2026', expires_at: '2026-09-15', uploaded_at: '2025-09-02T10:00:00Z' },
  { id: 'sd-doc-4', user_id: 'sd-u5', type: 'licence',            custom_name: 'Licence 2025-2026', expires_at: '2027-08-31', uploaded_at: '2025-09-01T10:00:00Z' },
  { id: 'sd-doc-5', user_id: 'sd-u6', type: 'licence',            custom_name: 'Licence 2025-2026', expires_at: '2027-08-31', uploaded_at: '2025-09-01T10:00:00Z' },
  { id: 'sd-doc-6', user_id: 'sd-u6', type: 'certificat_medical', custom_name: 'Certificat médical', expires_at: '2027-12-31', uploaded_at: '2025-09-05T10:00:00Z' },
  { id: 'sd-doc-7', user_id: 'sd-u7', type: 'licence',            custom_name: 'Licence 2025-2026', expires_at: '2027-08-31', uploaded_at: '2025-09-01T10:00:00Z' },
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
    from_to: 'Decathlon', description: "12 ballons + 20 cônes d'entraînement",
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
    title: "Don anonyme fin d'année", amount: 300,
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
    title: "Achat équipements d'entraînement", amount: 310,
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
    sport: 'Football', founded: 2005, emoji_icon: '⚽',
    description: 'Club de football amateur fondé en 2005, basé à Lens.',
  },
  'mock-club-sd': {
    id: 'mock-club-sd', name: 'AS Saint-Denis United', city: 'Saint-Denis',
    sport: 'Football', founded: 2010, emoji_icon: '🏆',
    description: 'Association sportive de Saint-Denis, fondée en 2010.',
  },
}

function getClubTeams(clubId) {
  if (clubId === 'club-1')       return TEAMS.map(t => ({ ...t, club_id: 'club-1' }))
  if (clubId === 'mock-club-sd') return SD_TEAMS.map(t => ({ ...t, club_id: 'mock-club-sd' }))
  return []
}

function getClubMembers(clubId) {
  if (clubId === 'club-1')       return USERS.filter(u => ['player', 'coach'].includes(u.role))
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

// ── Helpers CSS ───────────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 border border-surface-200 rounded-xl text-sm text-gray-900 ' +
                 'focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'
const btnPrimary   = 'px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors shadow'
const btnSecondary = 'px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-surface-50 transition-colors'

// ── ContactModal ──────────────────────────────────────────────────────────────
function ContactModal({ users, onClose }) {
  const [message, setMessage] = useState(
    'Bonjour,\n\nNous vous rappelons que vos documents administratifs sont attendus. Merci de les transmettre dès que possible.\n\nCordialement,\nLa direction du club'
  )
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    // Simulation envoi
    setSent(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl p-4 md:p-6 flex-1 md:flex-none overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-gray-900">
            Contacter {users.length} personne(s)
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400">✕</button>
        </div>

        <div className="mb-4 max-h-28 overflow-y-auto bg-surface-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Destinataires</div>
          <div className="space-y-1">
            {users.map(u => (
              <div key={u.id} className="text-sm text-gray-700">
                {u.firstName} {u.lastName}
                {u.role === 'coach' && <span className="ml-1 text-xs text-gray-400">(coach)</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className={`${inputCls} resize-none`}
          />
        </div>

        {sent ? (
          <div className="text-center py-2 text-emerald-600 font-medium text-sm">
            ✓ Message envoyé avec succès !
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={onClose}    className={`flex-1 ${btnSecondary}`}>Annuler</button>
            <button onClick={handleSend} className={`flex-1 ${btnPrimary}`}>
              Envoyer à {users.length}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MemberDocumentsModal ──────────────────────────────────────────────────────
const DOC_TYPE_LABELS = {
  licence:            '📜 Licence',
  certificat_medical: '🏥 Certificat médical',
  assurance:          '📋 Assurance',
}

function MemberDocumentsModal({ member, docs, onClose }) {
  const memberDocs = docs.filter(d => d.user_id === member.id)
  const now = new Date()

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl p-4 md:p-6 flex-1 md:flex-none overflow-y-auto md:max-h-[90vh] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-sm text-gray-500">{member.role === 'coach' ? 'Coach' : 'Joueur'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400">✕</button>
        </div>

        {memberDocs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📂</div>
            <div>Aucun document uploadé</div>
          </div>
        ) : (
          <div className="space-y-3">
            {memberDocs.map(doc => {
              const expired    = doc.expires_at && new Date(doc.expires_at) < now
              const expiringSoon = doc.expires_at && !expired &&
                new Date(doc.expires_at) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
              return (
                <div key={doc.id} className={`p-4 rounded-xl border ${
                  expired       ? 'bg-red-50 border-red-200' :
                  expiringSoon  ? 'bg-orange-50 border-orange-200' :
                                  'bg-surface-50 border-surface-200'
                }`}>
                  <div className="font-medium text-gray-900 mb-1">
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    {doc.custom_name && doc.custom_name !== doc.type && (
                      <span className="ml-1 text-sm font-normal text-gray-500">— {doc.custom_name}</span>
                    )}
                  </div>
                  {doc.uploaded_at && (
                    <div className="text-xs text-gray-500 mb-1">
                      Ajouté le {format(new Date(doc.uploaded_at), 'd MMM yyyy', { locale: fr })}
                    </div>
                  )}
                  {doc.expires_at && (
                    <div className={`text-xs font-medium ${
                      expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {expired       ? '⚠️ Expiré le '          : '⏰ Expire le '}
                      {format(new Date(doc.expires_at), 'd MMM yyyy', { locale: fr })}
                    </div>
                  )}
                  <div className="flex gap-3 mt-3">
                    <button className="text-sm text-brand-600 hover:underline font-medium">
                      Télécharger
                    </button>
                    <button className="text-sm text-red-500 hover:underline">
                      Supprimer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onClose} className={`w-full mt-4 ${btnSecondary} justify-center`}>
          Fermer
        </button>
      </div>
    </div>
  )
}

// ── PlayerDetailModal ─────────────────────────────────────────────────────────
function PlayerDetailModal({ player, teams, stats, docs, onClose }) {
  const playerTeams    = teams.filter(t => player.teamIds?.includes(t.id))
  const playerStats    = stats.find(s => s.user_id === player.id)
  const playerDocs     = docs.filter(d => d.user_id === player.id)
  const s              = player.stats ?? {}

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl p-4 md:p-6 flex-1 md:flex-none overflow-y-auto md:max-h-[90vh] shadow-xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              {player.firstName} {player.lastName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {player.position && (
                <span className="text-sm text-gray-500">{player.position}</span>
              )}
              {player.jerseyNumber && (
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                  #{player.jerseyNumber}
                </span>
              )}
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400">✕</button>
        </div>

        {/* Équipes */}
        {playerTeams.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1.5">Équipe(s)</div>
            <div className="flex flex-wrap gap-1.5">
              {playerTeams.map(t => (
                <span key={t.id} className="text-sm bg-surface-100 text-gray-700 px-2.5 py-1 rounded-lg">
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats saison */}
        {(s.matches > 0 || s.goals >= 0) && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Stats saison</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Matchs',   value: s.matches   ?? '—' },
                { label: 'Buts',     value: s.goals     ?? '—' },
                { label: 'Passes',   value: s.assists   ?? '—' },
                { label: '🟨',       value: s.yellowCards ?? '—' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface-50 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Présence */}
        {playerStats && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1.5">Présence entraînements</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    playerStats.attendance_rate >= 80 ? 'bg-emerald-500' :
                    playerStats.attendance_rate >= 60 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${playerStats.attendance_rate}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${
                playerStats.attendance_rate >= 80 ? 'text-emerald-600' :
                playerStats.attendance_rate >= 60 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {playerStats.attendance_rate}%
              </span>
            </div>
          </div>
        )}

        {/* Documents */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Documents</div>
          <div className="flex gap-2">
            {['licence', 'certificat_medical', 'assurance'].map(type => {
              const hasDoc = playerDocs.some(d => d.type === type)
              return (
                <div key={type} className={`flex-1 p-2 rounded-lg text-center text-xs font-medium ${
                  hasDoc ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {hasDoc ? '✓' : '✗'}
                  <div className="mt-0.5 text-[10px]">
                    {type === 'licence' ? 'Licence' : type === 'certificat_medical' ? 'Médical' : 'Assurance'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={onClose} className={`w-full ${btnSecondary} justify-center`}>
          Fermer
        </button>
      </div>
    </div>
  )
}

// ── EditClubModal ─────────────────────────────────────────────────────────────
function EditClubModal({ club, onClose, onSave }) {
  const [name,        setName]        = useState(club.name)
  const [city,        setCity]        = useState(club.city)
  const [description, setDescription] = useState(club.description ?? '')
  const [error,       setError]       = useState('')

  const handleSave = () => {
    if (!name.trim() || !city.trim()) {
      setError('Le nom et la ville sont obligatoires.')
      return
    }
    onSave({ ...club, name: name.trim(), city: city.trim(), description: description.trim() || null })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl p-4 md:p-6 flex-1 md:flex-none overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-gray-900">Éditer le club</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400">✕</button>
        </div>

        <div className="space-y-4">
          {/* Logo placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo du club</label>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed
                              border-surface-200 rounded-xl hover:border-brand-300 cursor-pointer transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-sm text-gray-600">Cliquer pour choisir une image</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du club *</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input value={city} onChange={e => setCity(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Présentez votre club..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}    className={`flex-1 ${btnSecondary}`}>Annuler</button>
          <button onClick={handleSave} className={`flex-1 ${btnPrimary}`}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}


// ── Onglet Joueurs (fusionné : documents + joueurs) ───────────────────────────
function JoueursTab({ club }) {
  // ── Section Documents ──────────────────────────────────────────────────────
  const [docFilter,   setDocFilter]   = useState('')
  const [memberModal, setMemberModal] = useState(null)

  // ── Section Joueurs ────────────────────────────────────────────────────────
  const [searchTerm,       setSearchTerm]       = useState('')
  const [filterTeam,       setFilterTeam]       = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState('')
  const [playerModal,      setPlayerModal]      = useState(null)

  // ── Data commune ───────────────────────────────────────────────────────────
  const allMembers  = getClubMembers(club.id)
  const clubMembers = allMembers.filter(u => u.role !== 'community' && u.role !== 'supporter')
  const players     = allMembers.filter(u => u.role === 'player')
  const teams       = getClubTeams(club.id)
  const stats       = getClubPlayerStats(club.id)
  const allDocs     = getClubDocuments(club.id)

  // ── Logique Documents ──────────────────────────────────────────────────────
  const docTypes  = ['licence', 'certificat_medical', 'assurance']
  const docLabels = { licence: 'Licences', certificat_medical: 'Certs médicaux', assurance: 'Assurances' }
  const docIcons  = { licence: '📜', certificat_medical: '🏥', assurance: '📋' }
  const now       = new Date()
  const in30days  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const docStats = {}
  docTypes.forEach(type => {
    const total   = clubMembers.length
    const hasDocs = clubMembers.filter(member => {
      const doc = allDocs.find(d => d.user_id === member.id && d.type === type)
      return doc && (!doc.expires_at || new Date(doc.expires_at) > now)
    }).length
    docStats[type] = { total, hasDocs, missing: total - hasDocs, percentage: total ? Math.round((hasDocs / total) * 100) : 0 }
  })

  const filteredDocMembers = clubMembers.filter(member => {
    const memberDocs = allDocs.filter(d => d.user_id === member.id)
    if (docFilter === 'expiring-soon') {
      return memberDocs.some(d => d.expires_at && new Date(d.expires_at) >= now && new Date(d.expires_at) <= in30days)
    }
    if (docFilter === 'missing') {
      return memberDocs.length === 0
    }
    return true
  })

  // ── Logique Joueurs ────────────────────────────────────────────────────────
  const filteredPlayers = players.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    if (!name.includes(searchTerm.toLowerCase())) return false
    if (filterTeam && !p.teamIds?.includes(filterTeam)) return false
    if (attendanceFilter === 'low') {
      const s = stats.find(s => s.user_id === p.id)
      return s && s.attendance_rate < 70
    }
    return true
  })

  return (
    <div className="space-y-8">

      {/* ═══ SECTION DOCUMENTS ═══ */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          📋 <span>Documents administratifs</span>
        </h3>

        {/* Barres résumé */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {docTypes.map(type => {
            const s = docStats[type]
            return (
              <div key={type} className="bg-surface-50 rounded-xl p-4">
                <div className="text-2xl mb-2">{docIcons[type]}</div>
                <div className="text-sm text-gray-600 mb-2">{docLabels[type]}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{s.hasDocs}/{s.total}</div>
                <div className="w-full bg-surface-200 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${s.percentage}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {s.missing > 0 ? `${s.missing} manquant(s)` : '✓ Complet'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Filtre */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-sm text-gray-500 font-medium">Filtrer :</span>
          {[
            { value: '',              label: 'Tous' },
            { value: 'expiring-soon', label: '⏰ Expirent bientôt' },
            { value: 'missing',       label: '⚠️ Sans documents' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setDocFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                docFilter === opt.value
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {docFilter && (
            <span className="text-xs text-gray-400 ml-1">{filteredDocMembers.length} résultat(s)</span>
          )}
        </div>

        {/* Liste membres */}
        <div className="space-y-2">
          {filteredDocMembers.map(member => {
            const memberDocs = allDocs.filter(d => d.user_id === member.id)
            return (
              <button
                key={member.id}
                onClick={() => setMemberModal(member)}
                className="w-full p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                    <div className="text-xs text-gray-500">
                      {member.role === 'coach' ? 'Coach' : 'Joueur'} · {memberDocs.length} document(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1.5 bg-brand-600 text-white rounded-lg font-medium">
                      Profil
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
          {filteredDocMembers.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">Aucun membre correspondant au filtre</div>
          )}
        </div>
      </div>

      {/* Séparateur */}
      <hr className="border-surface-200" />

      {/* ═══ SECTION JOUEURS ═══ */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          👥 <span>Joueurs</span>
          <span className="text-sm font-normal text-gray-400">({players.length})</span>
        </h3>

        {/* Barre de recherche + filtres */}
        <div className="flex gap-2 flex-wrap mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un joueur..."
            className="flex-1 min-w-40 pl-4 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm
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

        {/* Filtre présence */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500 font-medium">Présence :</span>
          {[
            { value: '',    label: 'Tous' },
            { value: 'low', label: '⚠️ Présence faible (<70%)' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setAttendanceFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                attendanceFilter === opt.value
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Liste joueurs */}
        <div className="space-y-2">
          {filteredPlayers.map(player => {
            const playerTeams = teams.filter(t => player.teamIds?.includes(t.id))
            const playerStats = stats.find(s => s.user_id === player.id)
            return (
              <div key={player.id} className="p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {player.firstName} {player.lastName}
                      {player.jerseyNumber && (
                        <span className="ml-2 text-xs text-gray-400">#{player.jerseyNumber}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
                      {player.position && <span>{player.position}</span>}
                      {playerTeams.length > 0 && <span className="text-gray-300">·</span>}
                      <span>{playerTeams.map(t => t.name).join(', ')}</span>
                      {playerStats && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className={playerStats.attendance_rate < 70 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                            {playerStats.attendance_rate}% présence
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                    <button
                      onClick={() => setPlayerModal(player)}
                      className="text-sm text-brand-600 hover:underline font-medium"
                    >
                      Voir profil
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-400">Aucun joueur trouvé</div>
        )}
        <div className="text-sm text-gray-500 mt-2">
          {filteredPlayers.length} joueur(s) sur {players.length}
        </div>
      </div>

      {/* Modals */}
      {memberModal && (
        <MemberDocumentsModal
          member={memberModal}
          docs={allDocs}
          onClose={() => setMemberModal(null)}
        />
      )}
      {playerModal && (
        <PlayerDetailModal
          player={playerModal}
          teams={teams}
          stats={stats}
          docs={allDocs}
          onClose={() => setPlayerModal(null)}
        />
      )}
    </div>
  )
}

// ── StatsTab ──────────────────────────────────────────────────────────────────
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        <StatCard label="Joueurs"       value={players.length} icon="⚽" />
        <StatCard label="Coachs"        value={coaches.length} icon="👔" />
        <StatCard label="Équipes"       value={teams.length}   icon="🏟️" />
        <StatCard label="Membres total" value={members.length} icon="👥" />
      </div>

      {(totalGoals > 0 || avgAttendance !== null) && (
        <div className="grid grid-cols-2 gap-3">
          {totalGoals > 0 && <StatCard label="Buts cette saison" value={totalGoals}          icon="🥅" />}
          {avgAttendance !== null && <StatCard label="Présence moy." value={`${avgAttendance}%`} icon="📅" />}
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

// ── Catégories Financier ─────────────────────────────────────────────────────
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
  { value: 'equipment',   label: 'Fournitures/Équipements' },
  { value: 'arbitrage',   label: 'Arbitrage' },
  { value: 'travel',      label: 'Déplacements' },
  { value: 'salary',      label: 'Salaires/Indemnités' },
  { value: 'insurance',   label: 'Assurances' },
  { value: 'admin',       label: 'Frais administratifs' },
  { value: 'licenses',    label: 'Adhésions/Licences fédérales' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other',       label: 'Autre' },
]

const CATEGORY_LABELS = Object.fromEntries(
  [...REVENUE_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => [c.value, c.label])
)

function fmt(amount) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

// ── AddTransactionModal ───────────────────────────────────────────────────────
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
      id:           `trans-${Date.now()}`,
      club_id:      clubId,
      type,
      category,
      title:        title.trim(),
      amount:       parseFloat(amount),
      currency:     'EUR',
      from_to:      fromTo.trim(),
      description:  description.trim() || null,
      date,
      is_recurring: isRecurring,
      created_at:   new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl p-4 md:p-6 flex-1 md:flex-none overflow-y-auto md:max-h-[90vh] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-gray-900">Ajouter une transaction</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-gray-400">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="flex gap-2">
              {[{ value: 'revenue', label: '📈 Revenu' }, { value: 'expense', label: '📉 Dépense' }].map(t => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setCategory('') }}
                  className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                    type === t.value ? 'bg-brand-600 text-white shadow' : 'bg-surface-100 text-gray-700 hover:bg-surface-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              <option value="">Choisir une catégorie...</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Cotisations saison 2025-2026" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" min="0" step="0.01" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'revenue' ? 'De qui *' : 'À qui *'}
            </label>
            <input value={fromTo} onChange={e => setFromTo(e.target.value)}
              placeholder={type === 'revenue' ? 'Ex : Mairie de Lens' : 'Ex : Decathlon'} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Détails supplémentaires..." className={`${inputCls} resize-none`} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-surface-300 text-brand-600" />
            <span className="text-sm text-gray-700">Transaction récurrente (cotisations, assurances…)</span>
          </label>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}    className={`flex-1 ${btnSecondary}`}>Annuler</button>
          <button onClick={handleCreate} className={`flex-1 ${btnPrimary}`}>Ajouter</button>
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

  const filtered = baseTrans.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterPeriod !== 'all') {
      const d = new Date(t.date), now = new Date()
      if (filterPeriod === 'month')
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      if (filterPeriod === 'quarter')
        return Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) && d.getFullYear() === now.getFullYear()
      if (filterPeriod === 'year')
        return d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const totalRevenue = baseTrans.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amount, 0)
  const totalExpense = baseTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance      = totalRevenue - totalExpense
  const periodLabel  = { all: 'total', month: 'ce mois', quarter: 'ce trimestre', year: 'cette année' }[filterPeriod]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 border ${balance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`text-xs font-medium mb-1 ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Solde {periodLabel}</div>
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

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
          {[{ value: 'all', label: 'Tous' }, { value: 'revenue', label: '📈 Revenus' }, { value: 'expense', label: '📉 Dépenses' }].map(opt => (
            <button key={opt.value} onClick={() => setFilterType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-300">
          <option value="all">Tout le temps</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
        <button onClick={() => setShowModal(true)}
          className="ml-auto px-4 py-1.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors shadow">
          + Ajouter une transaction
        </button>
      </div>

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
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trans.type === 'revenue' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{trans.title}</div>
                          {trans.description && <div className="text-xs text-gray-400 mt-0.5">{trans.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{trans.from_to}</td>
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
        {filtered.length} transaction(s) · Solde calculé sur l'ensemble des données
      </p>

      {showModal && (
        <AddTransactionModal
          clubId={club.id}
          onClose={() => setShowModal(false)}
          onCreate={trans => { setLocalTrans(prev => [...prev, trans]); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ── Onglet Paramètres ─────────────────────────────────────────────────────────
function ParametresTab({ club, onUpdateClub }) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-surface-50 rounded-xl p-5">
        <div className="font-semibold text-gray-900 mb-3">Informations du club</div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide mb-0.5">Nom</span>
            <span className="font-medium text-gray-900">{club.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide mb-0.5">Ville</span>
            <span className="font-medium text-gray-900">{club.city}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-wide mb-0.5">Sport</span>
            <span className="font-medium text-gray-900">{club.sport}</span>
          </div>
          {club.founded && (
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-0.5">Fondé en</span>
              <span className="font-medium text-gray-900">{club.founded}</span>
            </div>
          )}
          {club.description && (
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-0.5">Description</span>
              <span className="text-gray-700">{club.description}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowEditModal(true)}
        className="px-4 py-2.5 border border-surface-200 rounded-xl text-sm font-medium
                   text-gray-700 hover:bg-surface-50 transition-colors flex items-center gap-2"
      >
        ✏️ Éditer les informations du club
      </button>

      {showEditModal && (
        <EditClubModal
          club={club}
          onClose={() => setShowEditModal(false)}
          onSave={updatedClub => {
            onUpdateClub(updatedClub)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function PresidentPage() {
  const { currentUser, is } = useAuth()
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [activeTab,      setActiveTab]      = useState('joueurs')
  const [clubOverrides,  setClubOverrides]  = useState({})

  // Guard d'accès : président OU intendant (staff)
  if (!canAccessDashboard(currentUser)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <div className="text-lg font-semibold text-gray-900 mb-2">Accès réservé</div>
        <div className="text-gray-500">Cette page est accessible aux présidents et intendants de club.</div>
      </div>
    )
  }

  // Clubs où l'user est président OU intendant
  const managedRoles = (currentUser.roles ?? []).filter(r => r.role === 'president' || r.role === 'staff')
  const myClubs = managedRoles
    .map(r => ALL_CLUBS[r.club_id])
    .filter(Boolean)
    .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i) // dédupliquer

  // Fallback si roles[] vide
  if (myClubs.length === 0 && currentUser.current_club_id && ALL_CLUBS[currentUser.current_club_id]) {
    myClubs.push(ALL_CLUBS[currentUser.current_club_id])
  }

  const baseClub  = selectedClubId ? ALL_CLUBS[selectedClubId] : myClubs[0]
  const activeClub = baseClub
    ? { ...baseClub, ...(clubOverrides[baseClub.id] ?? {}) }
    : null

  if (!activeClub) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">🏟️</div>
        <div className="text-lg font-semibold text-gray-900 mb-2">Vous n'êtes président d'aucun club</div>
        <div className="text-gray-500">Contactez l'administrateur pour être nommé président d'un club.</div>
      </div>
    )
  }

  const handleUpdateClub = (updatedClub) => {
    setClubOverrides(prev => ({ ...prev, [updatedClub.id]: updatedClub }))
  }

  const tabs = [
    { id: 'joueurs',    label: 'Joueurs',      icon: '👥' },
    { id: 'stats',      label: 'Statistiques', icon: '📊' },
    { id: 'financier',  label: 'Financier',    icon: '💰' },
    { id: 'parametres', label: 'Paramètres',   icon: '⚙️' },
  ]

  return (
    <div className="max-w-6xl mx-auto">

      {/* Sélection club — scroll horizontal sur mobile */}
      <div className="px-4 pt-4 pb-2 md:px-4 md:pt-6 md:pb-0 md:mb-6 overflow-x-auto">
        <div className="flex gap-2 md:gap-3 flex-nowrap md:flex-wrap">
          {myClubs.map(club => {
            const clubData = clubOverrides[club.id] ?? club
            const isActive = activeClub.id === club.id
            const userRoleInClub = (currentUser.roles ?? []).find(r => r.club_id === club.id)?.role
            return (
              <button
                key={club.id}
                onClick={() => { setSelectedClubId(club.id); setActiveTab('joueurs') }}
                className={`flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'bg-white border border-surface-200 text-gray-900 hover:border-brand-300 hover:shadow-sm'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold leading-tight">{clubData.name}</div>
                  {userRoleInClub && (
                    <div className={`text-xs leading-tight ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                      {userRoleInClub === 'staff' ? 'Intendant' : 'Président'}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white md:rounded-2xl md:border border-surface-200 overflow-hidden mt-2 md:mt-0">
        <div className="flex border-b border-surface-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 md:px-3 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600 bg-brand-50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="md:hidden">{tab.icon}</span>
              <span className="hidden md:inline">{tab.icon} {tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 md:p-6">
          {activeTab === 'joueurs'    && <JoueursTab    club={activeClub} key={`joueurs-${activeClub.id}`} />}
          {activeTab === 'stats'      && <StatsTab      club={activeClub} />}
          {activeTab === 'financier'  && <FinancierTab  club={activeClub} />}
          {activeTab === 'parametres' && (
            <ParametresTab club={activeClub} onUpdateClub={handleUpdateClub} />
          )}
        </div>
      </div>
    </div>
  )
}
