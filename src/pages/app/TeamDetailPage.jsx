import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { Avatar, Badge, Card } from '../../components/ui'
import {
  ArrowLeft, Star, Users, Calendar, BarChart2,
  MapPin, Home, Bus, ChevronRight, X, Check,
  AlertTriangle, Clock, Shield, Target, Zap,
} from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TEAMS = {
  'team-1': {
    id: 'team-1',
    name: 'Séniors A',
    category: 'Séniors',
    club: { name: 'FC Lens Académie' },
    players_count: 18,
    next_match: {
      id: 'nm-1',
      opponent: 'FC Valenciennes',
      date: '2026-05-22T15:00:00Z',
      location: 'Stade Bollaert',
      is_home: true,
      availabilities: { available: 12, unavailable: 3, no_response: 3 },
      carpools: [
        {
          id: 'cp-1',
          author: { first_name: 'Sophie', last_name: 'Durand' },
          type: 'offer',
          seats: 3,
          departure: 'Lens centre',
          time: '13h30',
          description: 'Je pars de la place Jean Jaurès. Retour prévu vers 18h.',
        },
        {
          id: 'cp-2',
          author: { first_name: 'Jean', last_name: 'Martin' },
          type: 'request',
          seats: 1,
          departure: 'Liévin',
          time: null,
          description: '',
        },
      ],
    },
    next_training: {
      id: 'nt-1',
      date: '2026-05-18T19:30:00Z',
      ends_at: '2026-05-18T21:00:00Z',
      location: 'Terrain Bollaert',
      theme: 'Pressing haut + transitions',
      presences: { present: 14, absent: 2, uncertain: 1, no_response: 1 },
    },
    past_matches: [
      {
        id: 'm1',
        date: '2026-05-15T15:00:00Z',
        opponent: 'RC Arras',
        score_home: 3,
        score_away: 1,
        location: 'Stade Bollaert',
        is_home: true,
        scorers: ['Diallo (23\')', 'Diallo (78\')', 'Garcia (56\')'],
        events: [
          { type: 'goal',        minute: 23, player: 'Diallo',  assist: 'Garcia' },
          { type: 'goal',        minute: 56, player: 'Garcia',  assist: null },
          { type: 'yellow_card', minute: 62, player: 'Simon',   assist: null },
          { type: 'goal',        minute: 78, player: 'Diallo',  assist: 'Moreau' },
        ],
        lineup: {
          starters: [
            { id: 'p1',  jersey: 1,  name: 'Alex Roux',      position: 'Gardien' },
            { id: 'p4',  jersey: 4,  name: 'Lucas Simon',    position: 'Défenseur' },
            { id: 'p6',  jersey: 6,  name: 'Théo Lambert',   position: 'Défenseur' },
            { id: 'p3',  jersey: 3,  name: 'Ryan Dubois',    position: 'Défenseur' },
            { id: 'p2',  jersey: 2,  name: 'Hugo Fontaine',  position: 'Défenseur' },
            { id: 'p8',  jersey: 8,  name: 'Mehdi Bensaid',  position: 'Milieu' },
            { id: 'p10', jersey: 10, name: 'Nolan Garcia',   position: 'Milieu' },
            { id: 'p7',  jersey: 7,  name: 'Enzo Moreau',    position: 'Milieu' },
            { id: 'p11', jersey: 11, name: 'Sami Benzara',   position: 'Attaquant' },
            { id: 'p9',  jersey: 9,  name: 'Karim Diallo',   position: 'Attaquant' },
            { id: 'p5',  jersey: 5,  name: 'Noah Lecomte',   position: 'Attaquant' },
          ],
          subs: [
            { id: 'p12', jersey: 12, name: 'Paul Leroy',     position: 'Gardien' },
            { id: 'p14', jersey: 14, name: 'Adam Traoré',    position: 'Milieu' },
            { id: 'p15', jersey: 15, name: 'Julien Perrin',  position: 'Défenseur' },
            { id: 'p16', jersey: 16, name: 'Samir Achour',   position: 'Milieu' },
            { id: 'p17', jersey: 17, name: 'Kylian Mendes',  position: 'Attaquant' },
          ],
        },
      },
      {
        id: 'm2',
        date: '2026-05-08T14:00:00Z',
        opponent: 'US Boulogne',
        score_home: 2,
        score_away: 1,
        location: 'Stade de la Libération',
        is_home: false,
        scorers: ['Garcia (34\')'],
        events: [
          { type: 'goal',        minute: 34, player: 'Garcia', assist: null },
          { type: 'yellow_card', minute: 45, player: 'Simon',  assist: null },
          { type: 'red_card',    minute: 67, player: 'Roux',   assist: null },
        ],
        lineup: { starters: [], subs: [] },
      },
      {
        id: 'm3',
        date: '2026-05-01T15:00:00Z',
        opponent: 'FC Calais',
        score_home: 2,
        score_away: 2,
        location: 'Stade Bollaert',
        is_home: true,
        scorers: ['Diallo (12\')', 'Lecomte (89\')'],
        events: [
          { type: 'goal', minute: 12, player: 'Diallo',  assist: 'Moreau' },
          { type: 'goal', minute: 89, player: 'Lecomte', assist: null },
        ],
        lineup: { starters: [], subs: [] },
      },
    ],
    past_trainings: [
      {
        id: 'tr1',
        date: '2026-05-13T19:30:00Z',
        location: 'Terrain Bollaert',
        theme: 'Jeu en triangle',
        total: 18,
        present: 16,
        absent_names: ['Diallo', 'Garcia'],
      },
      {
        id: 'tr2',
        date: '2026-05-11T19:30:00Z',
        location: 'Terrain Bollaert',
        theme: 'Pressing défensif',
        total: 18,
        present: 14,
        absent_names: ['Roux', 'Simon', 'Bensaid', 'Lambert'],
      },
      {
        id: 'tr3',
        date: '2026-05-06T19:30:00Z',
        location: 'Terrain Bollaert',
        theme: 'Coups de pied arrêtés',
        total: 18,
        present: 17,
        absent_names: ['Moreau'],
      },
    ],
    players: [
      { id: 'p1',  jersey: 1,  first_name: 'Alex',    last_name: 'Roux',      position: 'Gardien',   birth_date: '2000-03-12', matches: 12, goals: 0,  assists: 0, yellow_cards: 0, red_cards: 1, avg_rating: 4.5, email: 'alex.roux@test.fr',    phone: '06 11 22 33 44', training_rate: 90 },
      { id: 'p12', jersey: 12, first_name: 'Paul',    last_name: 'Leroy',     position: 'Gardien',   birth_date: '2003-07-25', matches: 1,  goals: 0,  assists: 0, yellow_cards: 0, red_cards: 0, avg_rating: 3.8, email: 'paul.leroy@test.fr',   phone: '06 99 88 77 66', training_rate: 95 },
      { id: 'p2',  jersey: 2,  first_name: 'Hugo',    last_name: 'Fontaine',  position: 'Défenseur', birth_date: '1999-11-08', matches: 11, goals: 0,  assists: 1, yellow_cards: 2, red_cards: 0, avg_rating: 3.9, email: 'hugo.f@test.fr',       phone: '06 22 33 44 55', training_rate: 85 },
      { id: 'p3',  jersey: 3,  first_name: 'Ryan',    last_name: 'Dubois',    position: 'Défenseur', birth_date: '2001-06-15', matches: 10, goals: 0,  assists: 0, yellow_cards: 1, red_cards: 0, avg_rating: 3.7, email: 'ryan.d@test.fr',       phone: '06 33 44 55 66', training_rate: 80 },
      { id: 'p4',  jersey: 4,  first_name: 'Lucas',   last_name: 'Simon',     position: 'Défenseur', birth_date: '2000-09-22', matches: 10, goals: 2,  assists: 0, yellow_cards: 3, red_cards: 0, avg_rating: 4.0, email: 'lucas.s@test.fr',      phone: '06 44 55 66 77', training_rate: 88 },
      { id: 'p6',  jersey: 6,  first_name: 'Théo',    last_name: 'Lambert',   position: 'Défenseur', birth_date: '2002-01-30', matches: 9,  goals: 1,  assists: 1, yellow_cards: 1, red_cards: 0, avg_rating: 3.8, email: 'theo.l@test.fr',       phone: '06 55 66 77 88', training_rate: 92 },
      { id: 'p15', jersey: 15, first_name: 'Julien',  last_name: 'Perrin',    position: 'Défenseur', birth_date: '2004-05-10', matches: 4,  goals: 0,  assists: 0, yellow_cards: 0, red_cards: 0, avg_rating: 3.5, email: 'julien.p@test.fr',     phone: '06 66 77 88 99', training_rate: 100 },
      { id: 'p7',  jersey: 7,  first_name: 'Enzo',    last_name: 'Moreau',    position: 'Milieu',    birth_date: '2001-04-05', matches: 13, goals: 3,  assists: 4, yellow_cards: 1, red_cards: 0, avg_rating: 4.1, email: 'enzo.m@test.fr',       phone: '06 77 88 99 00', training_rate: 78 },
      { id: 'p8',  jersey: 8,  first_name: 'Mehdi',   last_name: 'Bensaid',   position: 'Milieu',    birth_date: '2000-12-18', matches: 11, goals: 1,  assists: 3, yellow_cards: 2, red_cards: 0, avg_rating: 3.9, email: 'mehdi.b@test.fr',      phone: '06 88 99 00 11', training_rate: 82 },
      { id: 'p10', jersey: 10, first_name: 'Nolan',   last_name: 'Garcia',    position: 'Milieu',    birth_date: '2000-08-14', matches: 12, goals: 5,  assists: 6, yellow_cards: 0, red_cards: 0, avg_rating: 4.3, email: 'nolan.g@test.fr',      phone: '06 00 11 22 33', training_rate: 95 },
      { id: 'p14', jersey: 14, first_name: 'Adam',    last_name: 'Traoré',    position: 'Milieu',    birth_date: '2003-02-28', matches: 6,  goals: 0,  assists: 2, yellow_cards: 0, red_cards: 0, avg_rating: 3.6, email: 'adam.t@test.fr',       phone: '06 11 00 99 88', training_rate: 90 },
      { id: 'p16', jersey: 16, first_name: 'Samir',   last_name: 'Achour',    position: 'Milieu',    birth_date: '2002-10-12', matches: 3,  goals: 0,  assists: 0, yellow_cards: 0, red_cards: 0, avg_rating: 3.4, email: 'samir.a@test.fr',      phone: '06 22 11 00 99', training_rate: 97 },
      { id: 'p5',  jersey: 5,  first_name: 'Noah',    last_name: 'Lecomte',   position: 'Attaquant', birth_date: '2001-07-19', matches: 12, goals: 4,  assists: 2, yellow_cards: 0, red_cards: 0, avg_rating: 3.9, email: 'noah.l@test.fr',       phone: '06 33 22 11 00', training_rate: 85 },
      { id: 'p9',  jersey: 9,  first_name: 'Karim',   last_name: 'Diallo',    position: 'Attaquant', birth_date: '2001-05-12', matches: 12, goals: 8,  assists: 3, yellow_cards: 1, red_cards: 0, avg_rating: 4.2, email: 'karim.d@test.fr',      phone: '06 12 34 56 78', training_rate: 88 },
      { id: 'p11', jersey: 11, first_name: 'Sami',    last_name: 'Benzara',   position: 'Attaquant', birth_date: '2002-03-07', matches: 8,  goals: 2,  assists: 1, yellow_cards: 1, red_cards: 0, avg_rating: 3.7, email: 'sami.bz@test.fr',      phone: '06 23 45 67 89', training_rate: 80 },
      { id: 'p17', jersey: 17, first_name: 'Kylian',  last_name: 'Mendes',    position: 'Attaquant', birth_date: '2004-11-20', matches: 2,  goals: 0,  assists: 0, yellow_cards: 0, red_cards: 0, avg_rating: 3.2, email: 'kylian.m@test.fr',     phone: '06 34 56 78 90', training_rate: 100 },
      { id: 'p18', jersey: 18, first_name: 'Bryan',   last_name: 'Caucheteux', position: 'Attaquant', birth_date: '2003-09-01', matches: 5, goals: 1,  assists: 0, yellow_cards: 0, red_cards: 0, avg_rating: 3.5, email: 'bryan.c@test.fr',      phone: '06 45 67 89 01', training_rate: 92 },
      { id: 'p13', jersey: 13, first_name: 'Romain',  last_name: 'Destrez',   position: 'Défenseur', birth_date: '2001-08-16', matches: 7,  goals: 0,  assists: 1, yellow_cards: 1, red_cards: 0, avg_rating: 3.6, email: 'romain.d@test.fr',     phone: '06 56 78 90 12', training_rate: 75 },
    ],
    stats: {
      matches: 13, wins: 8, draws: 2, losses: 3,
      goals_for: 28, goals_against: 12,
    },
  },
  'team-2': {
    id: 'team-2',
    name: 'U13 B',
    category: 'U13',
    club: { name: 'FC Lens Académie' },
    players_count: 14,
    next_match: null,
    next_training: {
      id: 'nt-2',
      date: '2026-05-19T17:00:00Z',
      ends_at: '2026-05-19T18:30:00Z',
      location: 'Terrain annexe',
      theme: 'Technique individuelle',
      presences: { present: 10, absent: 2, uncertain: 0, no_response: 2 },
    },
    past_matches: [],
    past_trainings: [],
    players: [],
    stats: { matches: 8, wins: 4, draws: 1, losses: 3, goals_for: 15, goals_against: 11 },
  },
}

// ─── Composants réutilisables ─────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-surface-200 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
            active === t.id
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function StarRating({ value, onChange, readonly = false, max = 5 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => {
        const filled = i < (hovered || value)
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(i + 1)}
            onMouseEnter={() => !readonly && setHovered(i + 1)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`text-lg leading-none transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              size={18}
              className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          </button>
        )
      })}
    </div>
  )
}

function ResultBadge({ home, away, is_home }) {
  const myScore  = is_home ? home : away
  const oppScore = is_home ? away : home
  if (myScore > oppScore)  return <Badge variant="green">V</Badge>
  if (myScore === oppScore) return <Badge variant="gray">N</Badge>
  return <Badge variant="red">D</Badge>
}

// ─── Onglet Matchs ────────────────────────────────────────────────────────────

function TabMatches({ team, role, canManage }) {
  const [availability, setAvailability]   = useState(null) // 'available' | 'unavailable'
  const [showLineupModal, setShowLineupModal] = useState(false)
  const [selectedMatch, setSelectedMatch]    = useState(null)
  const [showCarpoolDetail, setShowCarpoolDetail] = useState(false)
  const [selectedCarpool,   setSelectedCarpool]   = useState(null)
  const nm = team.next_match

  const selectedPlayers = team.players.filter(p => p.position !== 'Gardien').slice(0, 10)
    .concat(team.players.filter(p => p.position === 'Gardien').slice(0, 1))
  const [lineup, setLineup] = useState(new Set(selectedPlayers.map(p => p.id)))

  function togglePlayer(id) {
    setLineup(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (selectedMatch) {
    return <MatchDetail match={selectedMatch} team={team} role={role} canManage={canManage} onBack={() => setSelectedMatch(null)} />
  }

  return (
    <div className="space-y-6">

      {/* Prochain match */}
      {nm ? (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Prochain match
          </div>
          <div className="mb-3">
            <div className="text-lg font-bold text-gray-900 mb-1">
              {team.name} vs {nm.opponent}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {format(new Date(nm.date), "EEE d MMM · HH'h'mm", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {nm.location}
              </span>
              <span className="flex items-center gap-1">
                {nm.is_home ? <Home size={14} /> : <Bus size={14} />}
                {nm.is_home ? 'Domicile' : 'Déplacement'}
              </span>
            </div>
          </div>

          {/* Vue joueur */}
          {role === 'player' && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Votre disponibilité :</div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAvailability('available')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    availability === 'available'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Check size={14} className="inline mr-1" />
                  Disponible
                </button>
                <button
                  onClick={() => setAvailability('unavailable')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    availability === 'unavailable'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <X size={14} className="inline mr-1" />
                  Indisponible
                </button>
              </div>
              {availability && (
                <div className={`mt-2 text-xs text-center font-medium ${availability === 'available' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {availability === 'available' ? '✓ Vous êtes marqué disponible' : '✗ Vous êtes marqué indisponible'}
                </div>
              )}
            </div>
          )}

          {/* Vue coach / président */}
          {canManage && (
            <div className="mt-4 space-y-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Disponibilités ({nm.availabilities.available}/{team.players_count})
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check size={14} className="bg-emerald-100 rounded-full p-0.5" />
                  <span className="font-semibold">{nm.availabilities.available}</span>
                  <span className="text-gray-400">dispo</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-500">
                  <X size={14} className="bg-red-100 rounded-full p-0.5" />
                  <span className="font-semibold">{nm.availabilities.unavailable}</span>
                  <span className="text-gray-400">indispo</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  <span className="font-semibold">{nm.availabilities.no_response}</span>
                  <span>sans réponse</span>
                </div>
              </div>
              <button
                onClick={() => setShowLineupModal(true)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                           rounded-xl text-sm font-medium transition-colors"
              >
                Gérer la composition
              </button>
            </div>
          )}

          {/* Covoiturages */}
          {(nm.carpools ?? []).length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  🚗 Covoiturages ({nm.carpools.length})
                </div>
              </div>
              <div className="space-y-2">
                {nm.carpools.map(cp => (
                  <div key={cp.id} className="flex items-center justify-between p-3
                                               bg-surface-50 rounded-xl border border-surface-100">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {cp.author.first_name} {cp.author.last_name}
                        {' '}
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          cp.type === 'offer'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {cp.type === 'offer' ? `propose ${cp.seats} place${cp.seats > 1 ? 's' : ''}` : `cherche ${cp.seats} place`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Depuis {cp.departure}{cp.time ? ` · ${cp.time}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCarpool(cp); setShowCarpoolDetail(true) }}
                      className="text-xs text-brand-600 hover:underline flex-shrink-0 ml-2"
                    >
                      Voir →
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="mt-2 w-full py-2 border-2 border-dashed border-surface-200 rounded-xl
                           text-xs text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                + Proposer un covoiturage
              </button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-5 text-center text-gray-400 text-sm">
          Aucun match prévu prochainement
        </Card>
      )}

      {/* Résultats passés */}
      {team.past_matches.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Résultats
          </div>
          <div className="space-y-3">
            {team.past_matches.map(m => (
              <Card key={m.id} className="p-4" onClick={() => setSelectedMatch(m)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">
                    {format(new Date(m.date), "EEE d MMM yyyy", { locale: fr })}
                    {' · '}{m.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <ResultBadge home={m.score_home} away={m.score_away} is_home={m.is_home} />
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-gray-900 flex-1">
                    {m.is_home ? team.name : m.opponent}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {m.score_home} — {m.score_away}
                  </div>
                  <div className="font-bold text-gray-900 flex-1 text-right">
                    {m.is_home ? m.opponent : team.name}
                  </div>
                </div>
                {m.scorers.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    ⚽ {m.scorers.join(' · ')}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal composition */}
      {showLineupModal && (
        <LineupModal
          players={team.players}
          lineup={lineup}
          onToggle={togglePlayer}
          opponent={nm?.opponent ?? ''}
          teamName={team.name}
          onClose={() => setShowLineupModal(false)}
        />
      )}

      {/* Modal détail covoiturage */}
      {showCarpoolDetail && selectedCarpool && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCarpoolDetail(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">
                Covoiturage — {selectedCarpool.author.first_name} {selectedCarpool.author.last_name}
              </h3>
              <button onClick={() => setShowCarpoolDetail(false)}
                className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCarpool.type === 'offer'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedCarpool.type === 'offer' ? '🚗 Propose des places' : '🙋 Cherche une place'}
                </span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Depuis :</span> {selectedCarpool.departure}
                {selectedCarpool.time && ` · ${selectedCarpool.time}`}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Places :</span> {selectedCarpool.seats}
              </div>
              {selectedCarpool.description && (
                <div className="text-gray-600 bg-surface-50 rounded-xl p-3">
                  {selectedCarpool.description}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCarpoolDetail(false)}
              className="mt-5 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                         rounded-xl text-sm font-medium transition-colors"
            >
              Contacter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Match détail (fiche match) ───────────────────────────────────────────────

function MatchDetail({ match, team, role, canManage, onBack }) {
  const [ratings, setRatings] = useState({})

  // Joueurs qui ont joué (titulaires uniquement pour simplifier)
  const starters = match.lineup?.starters ?? []

  function handleRate(playerId, val) {
    setRatings(prev => ({ ...prev, [playerId]: val }))
  }

  const canRate = role === 'player'

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour aux matchs
      </button>

      {/* Hero */}
      <Card className="p-5">
        <div className="text-xs text-gray-400 mb-2">
          {format(new Date(match.date), "EEEE d MMMM yyyy", { locale: fr })}
          {' · '}{match.location}
          {' · '}{match.is_home ? 'Domicile' : 'Déplacement'}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-gray-900 flex-1">
            {match.is_home ? team.name : match.opponent}
          </div>
          <div className="text-4xl font-bold text-gray-900 tabular-nums px-4">
            {match.score_home} — {match.score_away}
          </div>
          <div className="font-bold text-gray-900 flex-1 text-right">
            {match.is_home ? match.opponent : team.name}
          </div>
        </div>
      </Card>

      {/* Déroulement */}
      {match.events.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Déroulement
          </div>
          <div className="space-y-3">
            {match.events.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-surface-100 last:border-0">
                <span className="text-xs font-mono text-gray-400 w-8 mt-0.5">{ev.minute}'</span>
                <span className="text-lg leading-none">
                  {ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : '🟥'}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {ev.type === 'goal' ? 'But' : ev.type === 'yellow_card' ? 'Carton jaune' : 'Carton rouge'}
                    {' · '}{ev.player}
                  </div>
                  {ev.assist && (
                    <div className="text-xs text-gray-400">Passe décisive : {ev.assist}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Composition */}
      {starters.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Composition
          </div>
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Titulaires ({starters.length})</div>
            <div className="space-y-2">
              {starters.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">#{p.jersey}</span>
                  <span className="text-sm font-medium text-gray-900 flex-1">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.position}</span>
                  {match.events.filter(e => e.type === 'goal' && e.player === p.name.split(' ')[1]).map((_, i) => (
                    <span key={i}>⚽</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {match.lineup?.subs?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Remplaçants ({match.lineup.subs.length})</div>
              <div className="space-y-2">
                {match.lineup.subs.map(p => (
                  <div key={p.id} className="flex items-center gap-3 text-gray-400">
                    <span className="text-xs font-mono w-6">#{p.jersey}</span>
                    <span className="text-sm flex-1">{p.name}</span>
                    <span className="text-xs">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Notation */}
      {starters.length > 0 && (canRate || canManage) && (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Notez vos coéquipiers
          </div>
          {canRate && (
            <p className="text-xs text-gray-400 mb-4">
              Évaluez la performance de vos coéquipiers (1 à 5 étoiles).
              Notes anonymes, utilisées pour les statistiques.
            </p>
          )}
          <div className="space-y-3">
            {starters.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <span className="text-xs font-mono text-gray-400 w-6">#{p.jersey}</span>
                <span className="text-sm font-medium text-gray-900 flex-1">{p.name}</span>
                <StarRating
                  value={ratings[p.id] ?? 0}
                  onChange={canRate ? (v) => handleRate(p.id, v) : undefined}
                  readonly={!canRate}
                />
              </div>
            ))}
          </div>
          {canRate && (
            <button className="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                               rounded-xl text-sm font-medium transition-colors">
              Enregistrer mes notes
            </button>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Modal composition ────────────────────────────────────────────────────────

function LineupModal({ players, lineup, onToggle, opponent, teamName, onClose }) {
  const available  = players.filter(p => p.goals !== undefined) // tous pour la démo
  const count      = lineup.size

  const hasGoalie = players.some(p => lineup.has(p.id) && p.position === 'Gardien')
  const isValid   = count >= 7 && count <= 18 && hasGoalie

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <div>
            <h2 className="font-display font-bold text-gray-900">Composition</h2>
            <p className="text-sm text-gray-500">{teamName} vs {opponent}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Joueurs disponibles ({available.length})
          </div>
          <div className="space-y-2">
            {available
              .sort((a, b) => a.jersey - b.jersey)
              .map(p => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    lineup.has(p.id)
                      ? 'bg-brand-50 border-brand-200'
                      : 'bg-surface-50 border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={lineup.has(p.id)}
                    onChange={() => onToggle(p.id)}
                    className="rounded accent-brand-600"
                  />
                  <span className="text-xs font-mono text-gray-400 w-6">#{p.jersey}</span>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {p.first_name} {p.last_name}
                  </span>
                  <span className="text-xs text-gray-400">{p.position}</span>
                </label>
              ))}
          </div>
        </div>

        <div className="p-5 border-t border-surface-100 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Joueurs sélectionnés</span>
            <span className={`font-bold ${count < 7 || count > 18 ? 'text-red-500' : 'text-emerald-600'}`}>
              {count}/18
            </span>
          </div>
          {!hasGoalie && count > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-2">
              <AlertTriangle size={13} />
              Gardien obligatoire
            </div>
          )}
          {count < 7 && count > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-2">
              <AlertTriangle size={13} />
              Minimum 7 joueurs requis
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-surface-200 text-surface-600
                         hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              disabled={!isValid}
              onClick={onClose}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl
                         text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enregistrer la compo
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Onglet Entraînements ─────────────────────────────────────────────────────

function TabTrainings({ team, role, canManage }) {
  const [presence, setPresence] = useState(null) // 'present' | 'absent' | 'uncertain'
  const nt = team.next_training

  const presenceOptions = [
    { id: 'present',   label: 'Présent',   icon: <Check size={14} />,         color: 'emerald' },
    { id: 'absent',    label: 'Absent',    icon: <X size={14} />,             color: 'red' },
    { id: 'uncertain', label: 'Incertain', icon: <AlertTriangle size={14} />, color: 'amber' },
  ]

  return (
    <div className="space-y-6">

      {/* Prochain entraînement */}
      {nt ? (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Prochain entraînement
          </div>
          <div className="mb-3">
            {nt.theme && (
              <div className="inline-flex items-center gap-1 text-xs font-medium text-brand-700
                              bg-brand-50 rounded-full px-2.5 py-0.5 mb-2">
                {nt.theme}
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {format(new Date(nt.date), "EEE d MMM · HH'h'mm", { locale: fr })}
                {nt.ends_at && ` - ${format(new Date(nt.ends_at), "HH'h'mm", { locale: fr })}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {nt.location}
              </span>
            </div>
          </div>

          {/* Vue joueur */}
          {role === 'player' && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Votre présence :</div>
              <div className="flex gap-2">
                {presenceOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPresence(opt.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1 ${
                      presence === opt.id
                        ? opt.color === 'emerald' ? 'bg-emerald-500 text-white border-emerald-500'
                          : opt.color === 'red'   ? 'bg-red-500 text-white border-red-500'
                          : 'bg-amber-500 text-white border-amber-500'
                        : opt.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : opt.color === 'red'   ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
              {presence && (
                <div className={`mt-2 text-xs text-center font-medium ${
                  presence === 'present' ? 'text-emerald-600' : presence === 'absent' ? 'text-red-500' : 'text-amber-600'
                }`}>
                  {presence === 'present' ? '✓ Marqué présent' : presence === 'absent' ? '✗ Marqué absent' : '⚠ Marqué incertain'}
                </div>
              )}
            </div>
          )}

          {/* Vue coach */}
          {canManage && (
            <div className="mt-4 space-y-3">
              <div className="text-sm font-semibold text-gray-700">
                Présences attendues ({nt.presences.present}/{team.players_count})
              </div>
              <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check size={14} />
                  <span className="font-semibold">{nt.presences.present}</span>
                  <span className="text-gray-400">présents</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-500">
                  <X size={14} />
                  <span className="font-semibold">{nt.presences.absent}</span>
                  <span className="text-gray-400">absents</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle size={14} />
                  <span className="font-semibold">{nt.presences.uncertain}</span>
                  <span className="text-gray-400">incertains</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} />
                  <span className="font-semibold">{nt.presences.no_response}</span>
                  <span>sans réponse</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-surface-200 text-surface-600
                                   hover:bg-surface-50 rounded-xl text-xs font-medium transition-colors">
                  Modifier l'entraînement
                </button>
                <button className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white
                                   rounded-xl text-xs font-medium transition-colors">
                  + Nouvel entraîn.
                </button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-5 text-center text-gray-400 text-sm">
          Aucun entraînement prévu prochainement
        </Card>
      )}

      {/* Historique */}
      {team.past_trainings.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Entraînements passés
          </div>
          <div className="space-y-3">
            {team.past_trainings.map(tr => {
              const pct = Math.round((tr.present / tr.total) * 100)
              return (
                <Card key={tr.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(tr.date), "EEE d MMM · HH'h'mm", { locale: fr })}
                      </div>
                      <div className="text-xs text-gray-400">{tr.location}</div>
                      {tr.theme && <div className="text-xs text-brand-600 mt-0.5">{tr.theme}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{tr.present}/{tr.total}</div>
                      <div className="text-xs text-gray-400">{pct}%</div>
                    </div>
                  </div>
                  {/* Barre de présence */}
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {tr.absent_names.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Absents : {tr.absent_names.join(', ')}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Onglet Joueurs ───────────────────────────────────────────────────────────

const POSITION_FILTERS = [
  { id: 'all',       label: 'Tous' },
  { id: 'Gardien',   label: 'Gardiens' },
  { id: 'Défenseur', label: 'Défenseurs' },
  { id: 'Milieu',    label: 'Milieux' },
  { id: 'Attaquant', label: 'Attaquants' },
]

const POSITION_ICONS = {
  'Gardien':   '🧤',
  'Défenseur': '🛡️',
  'Milieu':    '⚡',
  'Attaquant': '🎯',
}

function TabPlayers({ players }) {
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)

  const filtered  = filter === 'all' ? players : players.filter(p => p.position === filter)
  const byPos     = POSITION_FILTERS.slice(1).reduce((acc, f) => {
    acc[f.id] = filtered.filter(p => p.position === f.id)
    return acc
  }, {})

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-5">
        {POSITION_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.id
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Effectif */}
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Effectif ({filtered.length} joueur{filtered.length > 1 ? 's' : ''})
      </div>

      {Object.entries(byPos).map(([pos, ps]) => {
        if (ps.length === 0) return null
        return (
          <div key={pos} className="mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {POSITION_ICONS[pos]} {pos}s
            </div>
            <div className="space-y-2">
              {ps.sort((a, b) => a.jersey - b.jersey).map(p => {
                const age = differenceInYears(new Date(), new Date(p.birth_date))
                return (
                  <Card key={p.id} className="p-4" onClick={() => setSelected(p)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center
                                      justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                        {p.jersey}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">
                          {p.first_name} {p.last_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {age} ans · {p.matches} matchs · {p.goals} but{p.goals !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <StarRating value={Math.round(p.avg_rating)} readonly max={5} />
                        <span className="text-xs text-gray-400 ml-1">{p.avg_rating}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Modal fiche joueur */}
      {selected && (
        <PlayerModal player={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

// ─── Modal fiche joueur ───────────────────────────────────────────────────────

function PlayerModal({ player, onClose }) {
  const age = differenceInYears(new Date(), new Date(player.birth_date))
  const trainingTotal = Math.round(player.training_rate / 100 * 20)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h2 className="font-display font-bold text-gray-900">Fiche joueur</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Identité */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center
                            justify-center text-brand-700 font-bold text-xl">
              {player.jersey}
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">
                {player.first_name} {player.last_name}
              </div>
              <div className="text-sm text-gray-500">
                {player.position} · {age} ans
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {player.email} · {player.phone}
              </div>
            </div>
          </div>

          {/* Stats saison */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Statistiques saison
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Matchs',   value: player.matches,      color: 'text-brand-600' },
                { label: 'Buts',     value: player.goals,         color: 'text-emerald-600' },
                { label: 'Passes',   value: player.assists,       color: 'text-sky-600' },
              ].map(s => (
                <div key={s.label} className="bg-surface-50 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              {player.yellow_cards > 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <span>🟨</span> {player.yellow_cards} carton{player.yellow_cards > 1 ? 's' : ''} jaune{player.yellow_cards > 1 ? 's' : ''}
                </div>
              )}
              {player.red_cards > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <span>🟥</span> {player.red_cards} carton{player.red_cards > 1 ? 's' : ''} rouge{player.red_cards > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Moyenne :</span>
              <StarRating value={Math.round(player.avg_rating)} readonly max={5} />
              <span className="text-xs text-gray-400">{player.avg_rating}/5</span>
            </div>
          </div>

          {/* Présences */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Présences
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Entraînements</span>
                  <span className="font-semibold text-gray-900">{trainingTotal}/20 ({player.training_rate}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-400 rounded-full"
                    style={{ width: `${player.training_rate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Matchs</span>
                  <span className="font-semibold text-gray-900">{player.matches}/13 ({Math.round(player.matches/13*100)}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.round(player.matches/13*100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Onglet Stats ─────────────────────────────────────────────────────────────

function TabStats({ team }) {
  const { stats, players } = team
  const diff   = stats.goals_for - stats.goals_against
  const pct    = Math.round((stats.wins / stats.matches) * 100)

  const topScorer  = [...players].sort((a, b) => b.goals - a.goals)[0]
  const topAssist  = [...players].sort((a, b) => b.assists - a.assists)[0]
  const topRating  = [...players].sort((a, b) => b.avg_rating - a.avg_rating)[0]

  const resultsData = [
    { label: 'Victoires', value: stats.wins,   color: 'bg-emerald-400', pct: stats.wins / stats.matches },
    { label: 'Nuls',      value: stats.draws,  color: 'bg-gray-300',    pct: stats.draws / stats.matches },
    { label: 'Défaites',  value: stats.losses, color: 'bg-red-400',     pct: stats.losses / stats.matches },
  ]

  return (
    <div className="space-y-5">

      {/* Bilan général */}
      <Card className="p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Bilan saison 2025-2026
        </div>
        <div className="grid grid-cols-4 gap-3 text-center mb-4">
          {[
            { label: 'Matchs', value: stats.matches,        color: 'text-gray-900' },
            { label: 'V',      value: stats.wins,           color: 'text-emerald-600' },
            { label: 'N',      value: stats.draws,          color: 'text-gray-500' },
            { label: 'D',      value: stats.losses,         color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-surface-50 rounded-xl p-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Barre répartition */}
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          {resultsData.map(r => (
            <div
              key={r.label}
              className={`${r.color} transition-all`}
              style={{ width: `${r.pct * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span className="text-emerald-600 font-medium">{Math.round(stats.wins/stats.matches*100)}% victoires</span>
          <span>{pct}% win rate</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mt-4">
          <div className="bg-surface-50 rounded-xl p-3">
            <div className="text-xl font-bold text-gray-900">{stats.goals_for}</div>
            <div className="text-xs text-gray-400">Buts marqués</div>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <div className="text-xl font-bold text-gray-900">{stats.goals_against}</div>
            <div className="text-xs text-gray-400">Encaissés</div>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <div className={`text-xl font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {diff >= 0 ? '+' : ''}{diff}
            </div>
            <div className="text-xs text-gray-400">Différence</div>
          </div>
        </div>
      </Card>

      {/* Meilleurs joueurs */}
      {players.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Meilleurs joueurs
          </div>
          <div className="space-y-3">
            {[
              {
                icon: <Target size={16} className="text-emerald-600" />,
                label: 'Meilleur buteur',
                player: topScorer,
                stat: `${topScorer?.goals ?? 0} but${topScorer?.goals !== 1 ? 's' : ''}`,
              },
              {
                icon: <Zap size={16} className="text-sky-600" />,
                label: 'Meilleur passeur',
                player: topAssist,
                stat: `${topAssist?.assists ?? 0} passe${topAssist?.assists !== 1 ? 's' : ''}`,
              },
              {
                icon: <Star size={16} className="text-yellow-500 fill-yellow-500" />,
                label: 'Meilleure moyenne',
                player: topRating,
                stat: `${topRating?.avg_rating ?? 0}/5`,
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
                  {row.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">{row.label}</div>
                  {row.player && (
                    <div className="font-semibold text-sm text-gray-900">
                      #{row.player.jersey} {row.player.first_name} {row.player.last_name}
                    </div>
                  )}
                </div>
                <div className="font-bold text-gray-900 text-sm">{row.stat}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Classement buteurs */}
      {players.length > 0 && (
        <Card className="p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Classement buteurs
          </div>
          <div className="space-y-2">
            {[...players]
              .filter(p => p.goals > 0)
              .sort((a, b) => b.goals - a.goals)
              .slice(0, 5)
              .map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-4">{i + 1}.</span>
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center
                                  justify-center text-brand-700 font-bold text-xs">
                    {p.jersey}
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {p.first_name} {p.last_name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">{p.goals}</span>
                    <span className="text-xs text-gray-400">buts</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TeamDetailPage() {
  const { teamId } = useParams()
  const navigate   = useNavigate()
  const { currentUser, is, isOneOf, canManageTeam } = useAuth()

  const [activeTab, setActiveTab] = useState('matches')
  const [following, setFollowing] = useState(false)

  const team = MOCK_TEAMS[teamId]

  if (!team) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Équipe introuvable</h2>
        <p className="text-gray-500 text-sm mb-4">Cette équipe n'existe pas ou n'est pas accessible.</p>
        <button
          onClick={() => navigate('/app/team')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium"
        >
          Retour aux équipes
        </button>
      </div>
    )
  }

  const role      = currentUser?.role ?? 'supporter'
  const canManage = canManageTeam(teamId)

  // Les supporters ne voient pas l'onglet Entraînements
  const tabs = [
    { id: 'matches',   label: 'Matchs' },
    ...(role !== 'supporter' ? [{ id: 'trainings', label: 'Entraînements' }] : []),
    { id: 'players',   label: 'Joueurs' },
    { id: 'stats',     label: 'Stats' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-surface-200 px-5 pt-5 pb-0 sticky top-0 z-10">
        <button
          onClick={() => navigate('/app/team')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800
                     transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">⚽</span>
              <h1 className="font-display font-bold text-2xl text-gray-900">{team.name}</h1>
              <Badge variant="brand">{team.category}</Badge>
            </div>
            <div className="text-sm text-gray-500">
              {team.club.name} · {team.players_count} joueurs
            </div>
          </div>

          {isOneOf('supporter', 'parent') && (
            <button
              onClick={() => setFollowing(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         border transition-colors ${
                           following
                             ? 'bg-brand-50 text-brand-700 border-brand-200'
                             : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                         }`}
            >
              <Star size={14} className={following ? 'fill-brand-600 text-brand-600' : ''} />
              {following ? 'Suivi' : 'Suivre'}
            </button>
          )}
        </div>

        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────────── */}
      <div className="p-5">
        {activeTab === 'matches'   && <TabMatches   team={team} role={role} canManage={canManage} />}
        {activeTab === 'trainings' && <TabTrainings team={team} role={role} canManage={canManage} />}
        {activeTab === 'players'   && <TabPlayers   players={team.players} />}
        {activeTab === 'stats'     && <TabStats      team={team} />}
      </div>
    </div>
  )
}
