// Mock Supabase client — visual testing only, no real database

// ── Mock data tables ──────────────────────────────────────────────────────────

const _now = Date.now()

const MOCK_USERS = [
  {
    id: 'u-1',
    email: 'president@test.fr',
    password_hash: 'password123',
    first_name: 'Thomas', last_name: 'Martin',
    birth_date: '1980-03-15', birth_place: 'Grenoble (38)',
    phone: '06 11 22 33 44', address: '1 avenue du Stade',
    postal_code: '93200', city: 'Saint-Denis', country: 'France',
    department: 'Seine-Saint-Denis', region: 'Île-de-France',
    account_status: 'active', current_club_id: 'club-1',
    user_roles: [{ id: 'r-1', role_type: 'president', scope_type: 'club', scope_id: 'club-1' }],
  },
  {
    id: 'u-2',
    email: 'coach@test.fr',
    password_hash: 'password123',
    first_name: 'Stéphane', last_name: 'Dupont',
    birth_date: '1985-07-22', birth_place: 'Lyon (69)',
    phone: '06 22 33 44 55',
    account_status: 'active', current_club_id: 'club-1',
    user_roles: [{ id: 'r-2', role_type: 'coach', scope_type: 'team', scope_id: 'team-1' }],
  },
  {
    id: 'u-3',
    email: 'joueur@test.fr',
    password_hash: 'password123',
    first_name: 'Karim', last_name: 'Diallo',
    birth_date: '2001-05-12', birth_place: 'Paris (75)',
    phone: '06 12 34 56 78', address: '12 rue du Stade',
    postal_code: '62300', city: 'Lens', country: 'France',
    department: 'Pas-de-Calais', region: 'Hauts-de-France',
    account_status: 'active', current_club_id: 'club-1',
    user_roles: [{ id: 'r-3', role_type: 'player', scope_type: 'team', scope_id: 'team-1' }],
  },
  {
    id: 'u-4',
    email: 'supporter@test.fr',
    password_hash: 'password123',
    first_name: 'Marc', last_name: 'Bernard',
    account_status: 'active', current_club_id: null,
    user_roles: [],
  },
]

const MOCK_CLUBS = [
  {
    id: 'club-1',
    name: 'FC Saint-Denis',
    city: 'Saint-Denis', department: 'Seine-Saint-Denis', region: 'Île-de-France',
    sports: { id: 'sport-1', name: 'Football' }, sport_id: 'sport-1',
    email: 'contact@fcsaintdenis.fr', phone: '01 23 45 67 89',
    address: '1 avenue du Stade', postal_code: '93200',
    status: 'active',
    teams: [
      { id: 'team-1', name: 'Séniors A', status: 'active', category: 'Séniors' },
      { id: 'team-2', name: 'U13 Groupe B', status: 'active', category: 'U13' },
    ],
  },
  {
    id: 'club-2',
    name: 'FC Lens Académie',
    city: 'Lens', department: 'Pas-de-Calais', region: 'Hauts-de-France',
    sports: { id: 'sport-1', name: 'Football' }, sport_id: 'sport-1',
    status: 'active',
    teams: [
      { id: 'team-3', name: 'Séniors A', status: 'active', category: 'Séniors' },
    ],
  },
  {
    id: 'club-3',
    name: 'AS Saint-Denis United',
    city: 'Saint-Denis', department: 'Seine-Saint-Denis', region: 'Île-de-France',
    sports: { id: 'sport-1', name: 'Football' }, sport_id: 'sport-1',
    status: 'active',
    teams: [],
  },
]

const MOCK_TEAMS = [
  {
    id: 'team-1', name: 'Séniors A', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis', sport_id: 'sport-1' },
    status: 'active', category: 'Séniors', sport_id: 'sport-1',
  },
  {
    id: 'team-2', name: 'U13 Groupe B', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis', sport_id: 'sport-1' },
    status: 'active', category: 'U13', sport_id: 'sport-1',
  },
  {
    id: 'team-3', name: 'Séniors A', club_id: 'club-2',
    clubs: { id: 'club-2', name: 'FC Lens Académie', sport_id: 'sport-1' },
    status: 'active', category: 'Séniors', sport_id: 'sport-1',
  },
]

const MOCK_POSTS = [
  {
    id: 'post-1',
    club_id: 'club-1',
    author_id: 'u-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis', city: 'Saint-Denis' },
    users: { id: 'u-1', first_name: 'Thomas', last_name: 'Martin' },
    content: '🏆 Victoire 3-1 ce week-end contre FC Échirolles ! Bravo à toute l\'équipe 💪',
    media_url: null, media_type: null,
    created_at: new Date(_now - 7200000).toISOString(),
    post_likes: [{ user_id: 'u-2' }, { user_id: 'u-3' }],
    post_comments: [
      {
        id: 'comment-1', post_id: 'post-1', user_id: 'u-2',
        content: 'Excellent match ! On continue comme ça 🔥',
        created_at: new Date(_now - 5400000).toISOString(),
        users: { id: 'u-2', first_name: 'Stéphane', last_name: 'Dupont' },
      },
    ],
  },
  {
    id: 'post-2',
    club_id: 'club-1',
    author_id: 'u-2',
    clubs: { id: 'club-1', name: 'FC Saint-Denis', city: 'Saint-Denis' },
    users: { id: 'u-2', first_name: 'Stéphane', last_name: 'Dupont' },
    content: '📢 Repas de fin de saison samedi 20h au club house. Venez nombreux !',
    media_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    media_type: 'image',
    created_at: new Date(_now - 86400000).toISOString(),
    post_likes: [],
    post_comments: [],
  },
]

const MOCK_MATCHES = [
  {
    id: 'match-1',
    team_id: 'team-1',
    teams: { id: 'team-1', name: 'Séniors A', category: 'Séniors', clubs: { id: 'club-1', name: 'FC Saint-Denis' } },
    opponent_name: 'FC Échirolles',
    scheduled_at: new Date(2026, 2, 8, 15, 0).toISOString(),
    location: 'Terrain principal — FC Saint-Denis',
    is_home: true, referee: 'M. Jacquet',
    status: 'played', score_home: 3, score_away: 1,
    squad: { 'u-3': 'confirmed' },
    events: [{ type: 'goal', userId: 'u-3', assistUserId: null, minute: 23 }],
    carpool: [],
  },
  {
    id: 'match-2',
    team_id: 'team-1',
    teams: { id: 'team-1', name: 'Séniors A', category: 'Séniors', clubs: { id: 'club-1', name: 'FC Saint-Denis' } },
    opponent_name: 'AS Grenoble',
    scheduled_at: new Date(2026, 3, 5, 14, 0).toISOString(),
    location: 'Stade Municipal de Grenoble',
    is_home: false, referee: 'Mme. Fontaine',
    status: 'scheduled', score_home: null, score_away: null,
    squad: { 'u-3': 'called' }, events: [],
    carpool: [
      { id: 'cp-1', userId: 'u-3', departure: 'Parking Terrain Nord', time: '12h00', seats: 4, takenBy: [] },
    ],
  },
  {
    id: 'match-3',
    team_id: 'team-2',
    teams: { id: 'team-2', name: 'U13 Groupe B', category: 'U13', clubs: { id: 'club-1', name: 'FC Saint-Denis' } },
    opponent_name: 'GJ Vizille',
    scheduled_at: new Date(2026, 3, 12, 10, 0).toISOString(),
    location: 'Terrain annexe — FC Saint-Denis',
    is_home: true, referee: null,
    status: 'scheduled', score_home: null, score_away: null,
    squad: {}, events: [], carpool: [],
  },
]

const MOCK_EVENTS = [
  {
    id: 'ev-1', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis' },
    created_by: 'u-2',
    title: 'Covoiturage — Déplacement FC Aubervilliers',
    description: 'Organisation du covoiturage pour le match de samedi.',
    type: 'carpool', location: 'Parking Terrain Nord',
    starts_at: new Date(2026, 2, 15, 13, 30).toISOString(), ends_at: null,
    visibility: 'team',
  },
  {
    id: 'ev-2', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis' },
    created_by: 'u-1',
    title: 'Réunion coachs — Bilan mi-saison',
    description: 'Point sur les résultats, présences et besoins équipement.',
    type: 'meeting', location: 'Local du club',
    starts_at: new Date(2026, 2, 25, 20, 0).toISOString(), ends_at: null,
    visibility: 'role',
  },
  {
    id: 'ev-3', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis' },
    created_by: 'u-1',
    title: 'Repas de fin de saison',
    description: 'Grand repas annuel pour tous les membres, familles et supporters.',
    type: 'social', location: 'Salle des fêtes, Saint-Denis',
    starts_at: new Date(2026, 5, 28, 18, 0).toISOString(), ends_at: null,
    visibility: 'club_wide',
  },
  {
    id: 'ev-4', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis' },
    created_by: 'u-1',
    title: 'Tournoi de Pâques U9/U11',
    description: '4 équipes de 8 joueurs. Journée complète avec arbitrage.',
    type: 'tournament', location: 'Terrain Nord',
    starts_at: new Date(2026, 3, 6, 9, 0).toISOString(),
    ends_at: new Date(2026, 3, 6, 17, 0).toISOString(),
    visibility: 'club_wide',
  },
  {
    id: 'ev-5', club_id: 'club-1',
    clubs: { id: 'club-1', name: 'FC Saint-Denis' },
    created_by: 'u-1',
    title: 'BBQ de fin de saison',
    description: 'Grand barbecue pour fêter la fin de saison.',
    type: 'social', location: 'Terrain Nord — FC Saint-Denis',
    starts_at: new Date(2026, 5, 21, 13, 0).toISOString(),
    ends_at: new Date(2026, 5, 21, 19, 0).toISOString(),
    visibility: 'club_wide',
  },
]

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1', to_user_id: 'u-1',
    type: 'registration_request',
    title: 'Nouvelle demande de joueur',
    body: 'Jean Dupont souhaite rejoindre l\'équipe Séniors A.',
    read: false, request_id: 'req-1',
    created_at: new Date(_now - 3600000).toISOString(),
  },
  {
    id: 'notif-2', to_user_id: 'u-1',
    type: 'request_approved',
    title: 'Demande acceptée',
    body: 'Votre demande a été acceptée par le club.',
    read: true, request_id: null,
    created_at: new Date(_now - 86400000).toISOString(),
  },
]

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1', type: 'direct', name: 'Stéphane Dupont',
    club_id: 'club-1', created_at: new Date(_now - 7200000).toISOString(),
    messages: [
      { id: 'msg-1', sender_id: 'u-1', content: 'Salut, tout va bien ?', sent_at: new Date(_now - 7200000).toISOString() },
      { id: 'msg-2', sender_id: 'u-2', content: 'Oui, nickel ! Et toi ?', sent_at: new Date(_now - 3600000).toISOString() },
    ],
  },
  {
    id: 'conv-2', type: 'direct', name: 'Karim Diallo',
    club_id: 'club-1', created_at: new Date(_now - 86400000).toISOString(),
    messages: [
      { id: 'msg-3', sender_id: 'u-3', content: 'Bonjour, je serai présent demain.', sent_at: new Date(_now - 86400000).toISOString() },
    ],
  },
]

const MOCK_CONV_MEMBERS = [
  { conversation_id: 'conv-1', user_id: 'u-1', can_write: true, conversations: MOCK_CONVERSATIONS[0] },
  { conversation_id: 'conv-1', user_id: 'u-2', can_write: true, conversations: MOCK_CONVERSATIONS[0] },
  { conversation_id: 'conv-2', user_id: 'u-1', can_write: true, conversations: MOCK_CONVERSATIONS[1] },
  { conversation_id: 'conv-2', user_id: 'u-3', can_write: true, conversations: MOCK_CONVERSATIONS[1] },
]

const MOCK_TEAM_PLAYERS = [
  {
    team_id: 'team-1', user_id: 'u-3', is_active: true,
    jersey_number: 9, position: 'Attaquant',
    users: { id: 'u-3', first_name: 'Karim', last_name: 'Diallo', birth_date: '2001-05-12' },
  },
  {
    team_id: 'team-3', user_id: 'u-mock-1', is_active: true,
    jersey_number: 10, position: 'Milieu',
    users: { id: 'u-mock-1', first_name: 'Nolan', last_name: 'Garcia', birth_date: '2003-08-25' },
  },
]

const MOCK_TRAININGS = [
  { id: 'tr-1', team_id: 'team-1', scheduled_at: new Date(2026, 4, 18, 18, 30).toISOString(), location: 'Terrain principal', is_active: true },
  { id: 'tr-2', team_id: 'team-2', scheduled_at: new Date(2026, 4, 19, 17, 0).toISOString(), location: 'Terrain annexe', is_active: true },
]

const MOCK_JOIN_REQUESTS = [
  {
    id: 'req-1', club_id: 'club-1', user_id: 'u-mock',
    role_type: 'player', team_id: 'team-1',
    status: 'pending', season: '2025-2026',
    new_team_name: null,
  },
]

const MOCK_FR_POSTAL = [
  { departement: 'Paris', code_dep: '75', region: 'Île-de-France' },
  { departement: 'Seine-Saint-Denis', code_dep: '93', region: 'Île-de-France' },
  { departement: 'Val-de-Marne', code_dep: '94', region: 'Île-de-France' },
  { departement: 'Hauts-de-Seine', code_dep: '92', region: 'Île-de-France' },
  { departement: 'Val-d\'Oise', code_dep: '95', region: 'Île-de-France' },
  { departement: 'Seine-et-Marne', code_dep: '77', region: 'Île-de-France' },
  { departement: 'Yvelines', code_dep: '78', region: 'Île-de-France' },
  { departement: 'Essonne', code_dep: '91', region: 'Île-de-France' },
  { departement: 'Pas-de-Calais', code_dep: '62', region: 'Hauts-de-France' },
  { departement: 'Nord', code_dep: '59', region: 'Hauts-de-France' },
  { departement: 'Oise', code_dep: '60', region: 'Hauts-de-France' },
  { departement: 'Somme', code_dep: '80', region: 'Hauts-de-France' },
  { departement: 'Gironde', code_dep: '33', region: 'Nouvelle-Aquitaine' },
  { departement: 'Isère', code_dep: '38', region: 'Auvergne-Rhône-Alpes' },
  { departement: 'Rhône', code_dep: '69', region: 'Auvergne-Rhône-Alpes' },
  { departement: 'Bouches-du-Rhône', code_dep: '13', region: 'Provence-Alpes-Côte d\'Azur' },
]

const MOCK_SPORTS = [
  { id: 'sport-1', name: 'Football' },
  { id: 'sport-2', name: 'Basketball' },
  { id: 'sport-3', name: 'Tennis' },
  { id: 'sport-4', name: 'Rugby' },
  { id: 'sport-5', name: 'Handball' },
]

const MOCK_TABLES = {
  users: MOCK_USERS,
  clubs: MOCK_CLUBS,
  teams: MOCK_TEAMS,
  club_posts: MOCK_POSTS,
  matches: MOCK_MATCHES,
  events: MOCK_EVENTS,
  notifications: MOCK_NOTIFICATIONS,
  conversations: MOCK_CONVERSATIONS,
  conversation_members: MOCK_CONV_MEMBERS,
  team_players: MOCK_TEAM_PLAYERS,
  trainings: MOCK_TRAININGS,
  fr_postal_codes: MOCK_FR_POSTAL,
  club_join_requests: MOCK_JOIN_REQUESTS,
  sports: MOCK_SPORTS,
  post_likes: [],
  post_comments: [],
  user_roles: [],
  club_follows: [],
  team_follows: [],
  team_requests: [],
  team_coaches: [],
  messages: [],
}

// ── Query Builder ─────────────────────────────────────────────────────────────

function createQueryBuilder(table) {
  let _filters = []
  let _order = null
  let _limit = null
  let _operation = 'select'
  let _payload = null

  const b = {
    select(_cols) { return b },
    eq(col, val)  { _filters.push({ op: 'eq',  col, val }); return b },
    neq(col, val) { _filters.push({ op: 'neq', col, val }); return b },
    gt(col, val)  { _filters.push({ op: 'gt',  col, val }); return b },
    gte(col, val) { _filters.push({ op: 'gte', col, val }); return b },
    order(_col, _opts) { return b },
    limit(n)  { _limit = n; return b },
    insert(data) { _operation = 'insert'; _payload = data; return b },
    update(data) { _operation = 'update'; _payload = data; return b },
    upsert(data) { _operation = 'upsert'; _payload = data; return b },
    delete()     { _operation = 'delete'; return b },
    single()     { return _resolve(true) },
    then(fn, rej) { return _resolve(false).then(fn, rej) },
  }

  function _resolve(isSingle) {
    if (_operation === 'insert') {
      const items = Array.isArray(_payload) ? _payload : [_payload]
      const created = items.map(item => ({
        ...item,
        id: item.id ?? `mock-${Math.random().toString(36).slice(2)}`,
        created_at: new Date().toISOString(),
      }))
      return Promise.resolve({
        data: isSingle ? (created[0] ?? null) : created,
        error: null,
      })
    }

    if (_operation === 'update' || _operation === 'upsert') {
      return Promise.resolve({ data: _payload ?? null, error: null })
    }

    if (_operation === 'delete') {
      return Promise.resolve({ data: null, error: null })
    }

    // SELECT
    const rows = MOCK_TABLES[table] ?? []
    let result = rows.filter(row =>
      _filters.every(({ op, col, val }) => {
        if (op === 'eq')  return row[col] === val
        if (op === 'neq') return row[col] !== val
        if (op === 'gt')  return row[col] > val
        if (op === 'gte') return row[col] >= val
        return true
      })
    )

    if (_limit != null) result = result.slice(0, _limit)

    return Promise.resolve({
      data: isSingle ? (result[0] ?? null) : result,
      error: null,
    })
  }

  return b
}

export const supabase = {
  from: (table) => createQueryBuilder(table),
}
