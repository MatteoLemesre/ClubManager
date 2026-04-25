// ─── CLUB ──────────────────────────────────────────────────────────────────
export const CLUB = {
  id: 'club-1',
  name: 'FC Saint-Martin',
  sport: 'Football',
  city: 'Saint-Martin-d\'Hères',
  address: '12 rue des Sports, 38400 Saint-Martin-d\'Hères',
  phone: '04 76 00 00 00',
  email: 'contact@fcsaintmartin.fr',
  logo: null,
  founded: 2005,
  colors: { primary: '#1f4fe8', secondary: '#ffffff' },
}

// ─── TEAMS ─────────────────────────────────────────────────────────────────
export const TEAMS = [
  { id: 'team-1', name: 'Séniors A', category: 'Séniors', ageGroup: '18+', coachId: 'user-2' },
  { id: 'team-2', name: 'U13 B',    category: 'Jeunes',   ageGroup: '11-13', coachId: 'user-3' },
  { id: 'team-3', name: 'U9 A',     category: 'Jeunes',   ageGroup: '7-9',  coachId: 'user-3' },
  { id: 'team-4', name: 'Vétérans', category: 'Loisir',   ageGroup: '35+',  coachId: 'user-2' },
]

// ─── USERS ─────────────────────────────────────────────────────────────────
export const USERS = [
  {
    id: 'user-1',
    firstName: 'Alexandre',
    lastName: 'Martin',
    email: 'alex.martin@fcsm.fr',
    phone: '06 11 22 33 44',
    role: 'president',
    teamId: null,
    avatar: null,
    license: { status: 'active', number: 'LIC-001', expiresAt: '2025-08-31' },
    joinedAt: '2020-01-15',
    birthDate: '1980-03-15',
    birthPlace: 'Grenoble (38)',
  },
  {
    id: 'user-2',
    firstName: 'Sophie',
    lastName: 'Durand',
    email: 'sophie.durand@fcsm.fr',
    phone: '06 22 33 44 55',
    role: 'coach',
    teamId: 'team-1',
    avatar: null,
    license: { status: 'active', number: 'LIC-002', expiresAt: '2025-08-31' },
    joinedAt: '2021-06-01',
    birthDate: '1985-07-22',
    birthPlace: 'Lyon (69)',
  },
  {
    id: 'user-3',
    firstName: 'Marc',
    lastName: 'Leblanc',
    email: 'marc.leblanc@fcsm.fr',
    phone: '06 33 44 55 66',
    role: 'coach',
    teamId: 'team-2',
    avatar: null,
    license: { status: 'expiring', number: 'LIC-003', expiresAt: '2025-01-31' },
    joinedAt: '2022-09-01',
    birthDate: '1979-11-08',
    birthPlace: 'Paris (75)',
  },
  {
    id: 'user-4',
    firstName: 'Lucas',
    lastName: 'Bernard',
    email: 'lucas.bernard@fcsm.fr',
    phone: '06 44 55 66 77',
    role: 'player',
    teamId: 'team-1',
    avatar: null,
    license: { status: 'active', number: 'LIC-004', expiresAt: '2025-08-31' },
    joinedAt: '2023-08-15',
    birthDate: '2000-05-14',
    birthPlace: 'Grenoble (38)',
    position: 'Attaquant',
    jerseyNumber: 9,
    stats: { goals: 8, assists: 5, matches: 14, yellowCards: 2, redCards: 0 },
    documents: { license: true, medicalCert: true, photo: true },
  },
  {
    id: 'user-5',
    firstName: 'Emma',
    lastName: 'Petit',
    email: 'emma.petit@fcsm.fr',
    phone: '06 55 66 77 88',
    role: 'player',
    teamId: 'team-1',
    avatar: null,
    license: { status: 'expired', number: 'LIC-005', expiresAt: '2024-08-31' },
    joinedAt: '2023-08-15',
    birthDate: '2001-09-03',
    birthPlace: 'Voiron (38)',
    position: 'Milieu',
    jerseyNumber: 8,
    stats: { goals: 3, assists: 12, matches: 13, yellowCards: 0, redCards: 0 },
    documents: { license: true, medicalCert: false, photo: true },
  },
  {
    id: 'user-6',
    firstName: 'Théo',
    lastName: 'Moreau',
    email: 'theo.moreau@fcsm.fr',
    phone: '06 66 77 88 99',
    role: 'player',
    teamId: 'team-2',
    avatar: null,
    license: { status: 'active', number: 'LIC-006', expiresAt: '2025-08-31' },
    joinedAt: '2024-01-10',
    birthDate: '2012-02-27',
    birthPlace: "Saint-Martin-d'Hères (38)",
    position: 'Attaquant',
    jerseyNumber: 11,
    stats: { goals: 12, assists: 3, matches: 15, yellowCards: 3, redCards: 1 },
    documents: { license: true, medicalCert: true, photo: false },
  },
  {
    id: 'user-7',
    firstName: 'Julie',
    lastName: 'Garcia',
    email: 'julie.garcia@fcsm.fr',
    phone: '06 77 88 99 00',
    role: 'supporter',
    teamId: null,
    avatar: null,
    license: null,
    joinedAt: '2024-03-01',
    birthDate: '1995-06-12',
    birthPlace: 'Grenoble (38)',
    favoriteTeams: ['team-1', 'team-4'],
  },
  {
    id: 'user-8',
    firstName: 'Nadia',
    lastName: 'Moreau',
    email: 'nadia.moreau@fcsm.fr',
    phone: '06 88 99 00 11',
    role: 'parent',
    teamId: null,
    avatar: null,
    license: null,
    joinedAt: '2024-01-15',
    birthDate: '1981-04-19',
    birthPlace: 'Marseille (13)',
    childId: 'user-6',
    favoriteTeams: ['team-2'],
  },
  {
    id: 'user-9',
    firstName: 'Pierre',
    lastName: 'Lambert',
    email: 'pierre.lambert@fcsm.fr',
    phone: '06 99 00 11 22',
    role: 'player',
    teamId: 'team-4',
    avatar: null,
    license: { status: 'active', number: 'LIC-009', expiresAt: '2025-08-31' },
    joinedAt: '2021-09-01',
    birthDate: '1982-10-31',
    birthPlace: 'Bordeaux (33)',
    position: 'Défenseur',
    jerseyNumber: 5,
    stats: { goals: 4, assists: 2, matches: 10, yellowCards: 1, redCards: 0 },
    documents: { license: true, medicalCert: false, photo: true },
  },
]

// ─── EVENTS ────────────────────────────────────────────────────────────────
export const EVENTS = [
  {
    id: 'event-1',
    type: 'carpooling',
    title: 'Covoiturage — Déplacement Grenoble',
    date: '2025-01-25T08:00:00',
    location: 'Stade Municipal de Grenoble',
    description: 'Covoiturage organisé pour le match à Grenoble. Départ depuis le stade à 8h.',
    teamId: 'team-1',
    createdBy: 'user-2',
    attendees: ['user-4', 'user-5', 'user-6'],
  },
  {
    id: 'event-2',
    type: 'meeting',
    title: 'Réunion de bureau mensuelle',
    date: '2025-01-28T19:00:00',
    location: 'Salle des fêtes — Saint-Martin',
    description: 'Bilan du mois, budget, projets à venir.',
    teamId: null,
    createdBy: 'user-1',
    attendees: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'event-3',
    type: 'social',
    title: 'Repas de fin d\'année',
    date: '2025-02-15T19:30:00',
    location: 'Restaurant Le Grand Pré',
    description: 'Repas annuel du club, ouvert à tous les membres et leurs familles.',
    teamId: null,
    createdBy: 'user-1',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-7', 'user-8'],
  },
  {
    id: 'event-4',
    type: 'tournament',
    title: 'Tournoi hivernal U13',
    date: '2025-02-08T09:00:00',
    location: 'Complexe sportif Nord',
    description: 'Tournoi interne U13. 6 équipes inscrites.',
    teamId: 'team-2',
    createdBy: 'user-3',
    attendees: ['user-6'],
  },
]

// ─── TRAININGS ─────────────────────────────────────────────────────────────
export const TRAININGS = [
  {
    id: 'training-1',
    teamId: 'team-1',
    date: '2025-01-21T18:30:00',
    duration: 90,
    location: 'Terrain principal',
    theme: 'Pressing haut + transitions',
    coachId: 'user-2',
    attendances: [
      { userId: 'user-4', status: 'present' },
      { userId: 'user-5', status: 'present' },
      { userId: 'user-9', status: 'absent', reason: 'Blessure' },
    ],
  },
  {
    id: 'training-2',
    teamId: 'team-2',
    date: '2025-01-22T17:00:00',
    duration: 75,
    location: 'Terrain annexe',
    theme: 'Technique individuelle — contrôle',
    coachId: 'user-3',
    attendances: [
      { userId: 'user-6', status: 'present' },
    ],
  },
  {
    id: 'training-3',
    teamId: 'team-1',
    date: '2025-01-28T18:30:00',
    duration: 90,
    location: 'Terrain principal',
    theme: 'Coups de pied arrêtés',
    coachId: 'user-2',
    attendances: [],
  },
]

// ─── MATCHES ───────────────────────────────────────────────────────────────
export const MATCHES = [
  {
    id: 'match-1',
    teamId: 'team-1',
    date: '2025-01-18T15:00:00',
    opponent: 'FC Échirolles',
    location: 'home',
    ground: 'Terrain principal',
    competition: 'Division Régionale 2',
    status: 'played',
    score: { home: 3, away: 1 },
    scorers: [
      { userId: 'user-4', minute: 23, type: 'goal' },
      { userId: 'user-4', minute: 67, type: 'goal' },
      { userId: 'user-5', minute: 81, type: 'goal' },
    ],
    squad: ['user-4', 'user-5', 'user-9'],
  },
  {
    id: 'match-2',
    teamId: 'team-1',
    date: '2025-01-25T14:00:00',
    opponent: 'AS Grenoble',
    location: 'away',
    ground: 'Stade Municipal de Grenoble',
    competition: 'Division Régionale 2',
    status: 'upcoming',
    score: null,
    scorers: [],
    squad: [],
  },
  {
    id: 'match-3',
    teamId: 'team-2',
    date: '2025-02-01T10:00:00',
    opponent: 'GJ Vizille',
    location: 'home',
    ground: 'Terrain annexe',
    competition: 'Championnat U13',
    status: 'upcoming',
    score: null,
    scorers: [],
    squad: [],
  },
]

// ─── CONVERSATIONS ─────────────────────────────────────────────────────────
export const CONVERSATIONS = [
  {
    id: 'conv-1',
    type: 'team_chat',
    teamId: 'team-1',
    name: 'Séniors A — Équipe',
    participants: ['user-2', 'user-4', 'user-5', 'user-9'],
    pinnedMessage: null,
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-2',
        content: 'Bien joué à tous pour le match de samedi ! 3-1 c\'est mérité 💪',
        timestamp: '2025-01-18T17:30:00',
        readBy: ['user-2', 'user-4', 'user-5'],
      },
      {
        id: 'msg-2',
        senderId: 'user-4',
        content: 'Merci coach ! On était bien en place aujourd\'hui.',
        timestamp: '2025-01-18T17:45:00',
        readBy: ['user-2', 'user-4'],
      },
      {
        id: 'msg-3',
        senderId: 'user-5',
        content: 'Hâte de voir ce qu\'on peut faire à Grenoble samedi !',
        timestamp: '2025-01-18T18:00:00',
        readBy: ['user-5'],
      },
    ],
  },
  {
    id: 'conv-2',
    type: 'coach_channel',
    teamId: 'team-1',
    name: 'Canal Coach — Séniors A',
    participants: ['user-2', 'user-4', 'user-5', 'user-9'],
    pinnedMessage: {
      senderId: 'user-2',
      content: '📋 Convocation match samedi : RDV 13h sur place. Tenue complète obligatoire.',
      timestamp: '2025-01-22T10:00:00',
    },
    messages: [
      {
        id: 'msg-4',
        senderId: 'user-2',
        content: '📋 Convocation match samedi : RDV 13h sur place. Tenue complète obligatoire.',
        timestamp: '2025-01-22T10:00:00',
        readBy: ['user-2', 'user-4'],
      },
      {
        id: 'msg-5',
        senderId: 'user-2',
        content: 'L\'entraînement de mardi est avancé à 18h (terrain disponible plus tôt).',
        timestamp: '2025-01-23T09:15:00',
        readBy: ['user-2'],
      },
    ],
  },
  {
    id: 'conv-3',
    type: 'parent_chat',
    teamId: 'team-2',
    name: 'Nadia Moreau + Théo + Coach',
    participants: ['user-3', 'user-6', 'user-8'],
    pinnedMessage: null,
    messages: [
      {
        id: 'msg-6',
        senderId: 'user-3',
        content: 'Bonjour Nadia, Théo progresse vraiment bien en ce moment. Très investi aux entraînements.',
        timestamp: '2025-01-20T11:00:00',
        readBy: ['user-3', 'user-8'],
      },
      {
        id: 'msg-7',
        senderId: 'user-8',
        content: 'Merci beaucoup ! Il est très motivé cette saison. Est-ce qu\'il sera disponible pour le tournoi ?',
        timestamp: '2025-01-20T11:30:00',
        readBy: ['user-8'],
      },
    ],
  },
]

// ─── HELPERS ───────────────────────────────────────────────────────────────
export function getUserById(id) {
  return USERS.find(u => u.id === id) ?? null
}

export function getTeamById(id) {
  return TEAMS.find(t => t.id === id) ?? null
}

export function getFullName(user) {
  if (!user) return 'Inconnu'
  return `${user.firstName} ${user.lastName}`
}

export function getInitials(user) {
  if (!user) return '?'
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
}
