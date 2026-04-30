import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Avatar, Badge, Card, SectionHeader } from '../../components/ui'
import {
  ArrowLeft, Clock, MapPin, Target, Home, Bus,
  Plus, Car, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'

// ─── Onglets ─────────────────────────────────────────────────────────────────

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-surface-200 overflow-x-auto">
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

// ─── Tab Résumé ───────────────────────────────────────────────────────────────

function TabSummary({ match, currentUser, is, canManageTeam, users, getUserById }) {
  const teamPlayers = users.filter(u => u.role === 'player' && u.teamIds?.includes(match.teamId))
  const isMyTeam    = is('player') && currentUser.teamIds?.includes(match.teamId)
  const isManager   = canManageTeam(match.teamId)

  const squad     = match.squad ?? {}
  const confirmed = Object.values(squad).filter(s => s === 'confirmed').length
  const absent    = Object.values(squad).filter(s => s === 'absent').length
  const called    = Object.values(squad).filter(s => s === 'called').length

  // ── Avant le match ────────────────────────────────────────────────────────
  if (match.status === 'scheduled') {
    return (
      <div className="space-y-4">
        {/* Joueur → disponibilité */}
        {isMyTeam && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-surface-700 mb-3">Ma disponibilité</p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-700
                                 border border-emerald-200 text-sm font-medium hover:bg-emerald-100 transition-colors">
                ✓ Disponible
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600
                                 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors">
                ✗ Indisponible
              </button>
            </div>
          </Card>
        )}

        {/* Manager → récap convocations */}
        {isManager && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-surface-700 mb-4">Réponses convocations</p>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{confirmed}</div>
                <div className="text-xs text-surface-400 mt-0.5">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{absent}</div>
                <div className="text-xs text-surface-400 mt-0.5">Indisponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-surface-400">{called}</div>
                <div className="text-xs text-surface-400 mt-0.5">En attente</div>
              </div>
            </div>
          </Card>
        )}

        {!isMyTeam && !isManager && (
          <Card className="p-8 text-center">
            <Clock size={32} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 text-sm">Le résumé sera disponible après le match</p>
          </Card>
        )}
      </div>
    )
  }

  // ── Après le match ────────────────────────────────────────────────────────
  const events = match.events ?? []

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-surface-400 text-sm">Aucun événement enregistré pour ce match</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <SectionHeader title="Événements du match" />
      <div className="space-y-1">
        {[...events]
          .sort((a, b) => a.minute - b.minute)
          .map((ev, i) => {
            const player = getUserById(ev.userId)
            const assist = getUserById(ev.assistUserId)
            return (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                <span className="text-xs font-mono text-surface-400 w-8 flex-shrink-0 text-right">
                  {ev.minute}'
                </span>
                <span className="text-base flex-shrink-0">
                  {ev.type === 'goal'        && '⚽'}
                  {ev.type === 'yellow_card' && '🟨'}
                  {ev.type === 'red_card'    && '🟥'}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <Avatar user={player} size="xs" />
                  <span className="text-sm font-medium text-surface-800">{player?.lastName}</span>
                  {assist && (
                    <span className="text-xs text-surface-400">(p. {assist.lastName})</span>
                  )}
                </div>
                {ev.type === 'goal' && <Badge variant="brand">But</Badge>}
              </div>
            )
          })}
      </div>
    </Card>
  )
}

// ─── Tab Composition ──────────────────────────────────────────────────────────

function TabLineup({ match, getUserById, getFullName }) {
  const squad = match.squad ?? {}
  const confirmedIds = Object.entries(squad)
    .filter(([, status]) => status === 'confirmed')
    .map(([uid]) => uid)

  if (confirmedIds.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-surface-400 text-sm">La composition n'a pas encore été publiée</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <SectionHeader title={`Composition · ${confirmedIds.length} joueurs`} />
      <div className="flex flex-wrap gap-3 mt-1">
        {confirmedIds.map(uid => {
          const u = getUserById(uid)
          return u ? (
            <Link
              key={uid}
              to={`/app/profile/${uid}`}
              className="flex items-center gap-2 bg-surface-50 hover:bg-brand-50
                         rounded-xl px-3 py-2 transition-colors"
            >
              <Avatar user={u} size="sm" />
              <span className="text-sm font-medium text-surface-800">{getFullName(u)}</span>
            </Link>
          ) : null
        })}
      </div>
    </Card>
  )
}

// ─── Tab Covoiturage ──────────────────────────────────────────────────────────

function TabCarpool({ match, currentUser, getUserById }) {
  const carpools = match.carpool ?? []

  return (
    <div className="space-y-3">
      {carpools.length === 0 && (
        <Card className="p-6 text-center">
          <Car size={32} className="text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm font-medium mb-1">Aucun covoiturage proposé</p>
          <p className="text-surface-400 text-xs">Soyez le premier à proposer un trajet</p>
        </Card>
      )}

      {carpools.map(cp => {
        const driver    = getUserById(cp.userId)
        const taken     = cp.takenBy?.length ?? 0
        const available = cp.seats - taken
        const isDriver  = cp.userId === currentUser.id

        return (
          <Card key={cp.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar user={driver} size="sm" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-surface-900">
                  {driver?.firstName} {driver?.lastName}
                  {isDriver && <span className="text-xs text-brand-600 font-normal ml-1">(vous)</span>}
                </div>
                <div className="text-xs text-surface-500">
                  Départ : {cp.departure} · {cp.time}
                </div>
              </div>
              <div className={`text-sm font-semibold ${available > 0 ? 'text-emerald-600' : 'text-surface-400'}`}>
                {available > 0
                  ? `${available} place${available > 1 ? 's' : ''} dispo`
                  : 'Complet'
                }
              </div>
            </div>

            {/* Passagers */}
            {(cp.takenBy ?? []).length > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex -space-x-1">
                  {cp.takenBy.map(uid => {
                    const u = getUserById(uid)
                    return u ? <Avatar key={uid} user={u} size="xs" className="ring-2 ring-white" /> : null
                  })}
                </div>
                <span className="text-xs text-surface-400">
                  {cp.takenBy.length} passager{cp.takenBy.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {available > 0 && !isDriver && (
              <button className="w-full text-sm py-2 rounded-xl bg-brand-50 text-brand-700
                                 hover:bg-brand-100 transition-colors font-medium">
                Prendre une place
              </button>
            )}
          </Card>
        )
      })}

      <button className="w-full py-3 border-2 border-dashed border-surface-200 rounded-2xl
                         text-sm text-surface-400 hover:border-brand-300 hover:text-brand-600
                         transition-colors flex items-center justify-center gap-2">
        <Plus size={15} /> Proposer un covoiturage
      </button>
    </div>
  )
}

// ─── Tab Convocations ─────────────────────────────────────────────────────────

function TabSquad({ match, users, getFullName }) {
  const teamPlayers = users.filter(u => u.role === 'player' && u.teamIds?.includes(match.teamId))
  const squad       = match.squad ?? {}

  const STATUS_CONFIG = {
    confirmed: { label: 'Disponible',   icon: CheckCircle2, color: 'text-emerald-600' },
    absent:    { label: 'Indisponible', icon: XCircle,      color: 'text-red-500'     },
    called:    { label: 'En attente',   icon: AlertCircle,  color: 'text-surface-400' },
  }

  return (
    <Card className="p-5">
      <SectionHeader title={`Convocations · ${teamPlayers.length} joueurs`} />
      <div className="divide-y divide-surface-100">
        {teamPlayers.map(u => {
          const status = squad[u.id] ?? 'called'
          const cfg    = STATUS_CONFIG[status]
          const Icon   = cfg.icon
          return (
            <div key={u.id} className="flex items-center gap-3 py-3">
              <Avatar user={u} size="sm" />
              <div className="flex-1">
                <div className="text-sm font-medium text-surface-800">{getFullName(u)}</div>
                <div className="text-xs text-surface-400">{u.position ?? '—'} · N°{u.jerseyNumber}</div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                <Icon size={13} />
                {cfg.label}
              </div>
            </div>
          )
        })}
        {teamPlayers.length === 0 && (
          <p className="text-sm text-surface-400 py-4 text-center">Aucun joueur dans cette équipe</p>
        )}
      </div>
    </Card>
  )
}

// ─── Tab Saisir résultat ──────────────────────────────────────────────────────

function TabResult({ match, users, getTeamById, getUserById }) {
  const [scoreHome, setScoreHome] = useState(match.scoreHome ?? 0)
  const [scoreAway, setScoreAway] = useState(match.scoreAway ?? 0)
  const [events,    setEvents]    = useState(match.events ?? [])
  const [newType,   setNewType]   = useState('goal')
  const [newPlayer, setNewPlayer] = useState('')
  const [newMinute, setNewMinute] = useState('')

  const team        = getTeamById(match.teamId)
  const teamPlayers = users.filter(u => u.role === 'player' && u.teamIds?.includes(match.teamId))

  const inputCls = `w-20 text-center text-2xl font-bold bg-surface-50 border border-surface-200
                    rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300`

  function addEvent() {
    if (!newPlayer || !newMinute) return
    setEvents(prev => [
      ...prev,
      { type: newType, userId: newPlayer, assistUserId: null, minute: Number(newMinute) },
    ])
    setNewPlayer('')
    setNewMinute('')
  }

  const EVENT_TYPES = [
    { value: 'goal',        label: '⚽ But'          },
    { value: 'yellow_card', label: '🟨 Carton jaune' },
    { value: 'red_card',    label: '🟥 Carton rouge' },
  ]

  return (
    <div className="space-y-4">
      {/* Score */}
      <Card className="p-5">
        <SectionHeader title="Score" />
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center">
            <p className="text-sm font-medium text-surface-600 mb-2">{team?.name}</p>
            <input
              type="number" min="0"
              value={scoreHome}
              onChange={e => setScoreHome(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <span className="text-3xl font-bold text-surface-300">–</span>
          <div className="text-center">
            <p className="text-sm font-medium text-surface-600 mb-2">{match.opponentName}</p>
            <input
              type="number" min="0"
              value={scoreAway}
              onChange={e => setScoreAway(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </Card>

      {/* Ajouter un événement */}
      <Card className="p-5">
        <SectionHeader title="Ajouter un événement" />
        <div className="flex gap-2 flex-wrap">
          <select
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {EVENT_TYPES.map(et => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </select>
          <select
            value={newPlayer}
            onChange={e => setNewPlayer(e.target.value)}
            className="flex-1 min-w-[140px] bg-surface-50 border border-surface-200 rounded-xl px-3 py-2
                       text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value="">Joueur…</option>
            {teamPlayers.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          <input
            type="number" min="1" max="120"
            placeholder="Minute"
            value={newMinute}
            onChange={e => setNewMinute(e.target.value)}
            className="w-24 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2
                       text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button
            onClick={addEvent}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl
                       text-sm font-medium transition-colors"
          >
            <Plus size={15} />
          </button>
        </div>
      </Card>

      {/* Liste événements */}
      {events.length > 0 && (
        <Card className="p-5">
          <SectionHeader title="Événements" />
          <div className="space-y-1">
            {[...events]
              .sort((a, b) => a.minute - b.minute)
              .map((ev, i) => {
                const u = getUserById(ev.userId)
                return (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                    <span className="text-xs font-mono text-surface-400 w-8 text-right">{ev.minute}'</span>
                    <span>
                      {ev.type === 'goal'        && '⚽'}
                      {ev.type === 'yellow_card' && '🟨'}
                      {ev.type === 'red_card'    && '🟥'}
                    </span>
                    <span className="text-sm text-surface-800 flex-1">{u?.lastName ?? ev.userId}</span>
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      <button className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium
                         rounded-xl text-sm transition-colors">
        Enregistrer le résultat
      </button>
    </div>
  )
}

// ─── Tab Notation ─────────────────────────────────────────────────────────────

function TabRatings({ match, currentUser, is, users }) {
  const [ratings, setRatings] = useState({})

  const isTeamPlayer = is('player') && currentUser.teamIds?.includes(match.teamId)
  const hasPlayed    = match.status === 'played' && match.squad?.[currentUser.id] === 'confirmed'

  if (match.status !== 'played') {
    return (
      <Card className="p-8 text-center">
        <p className="text-surface-400 text-sm">La notation sera disponible après le match</p>
      </Card>
    )
  }

  const rateablePlayers = users.filter(u =>
    u.role === 'player' &&
    u.teamIds?.includes(match.teamId) &&
    u.id !== currentUser.id &&
    match.squad?.[u.id] === 'confirmed'
  )

  if (rateablePlayers.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-surface-400 text-sm">Aucun coéquipier à noter</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!hasPlayed && (
        <div className="text-sm text-surface-500 p-3 bg-surface-50 rounded-xl border border-surface-200">
          Vous n'avez pas joué ce match — vous pouvez consulter les notes mais pas noter.
        </div>
      )}

      <Card className="p-5">
        <SectionHeader title={hasPlayed ? 'Notez vos coéquipiers' : 'Notes de l\'équipe'} />
        <div className="divide-y divide-surface-100">
          {rateablePlayers.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-3">
              <Avatar user={p} size="md" />
              <span className="text-sm font-medium text-surface-800 flex-1">
                {p.firstName} {p.lastName}
              </span>
              {hasPlayed ? (
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRatings(r => ({ ...r, [p.id]: i + 1 }))}
                      className="text-base leading-none transition-colors hover:scale-110"
                    >
                      {i < (ratings[p.id] ?? 0) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-surface-400">
                  {ratings[p.id] ? `${ratings[p.id]}/10` : 'Pas encore noté'}
                </span>
              )}
            </div>
          ))}
        </div>
        {hasPlayed && (
          <button className="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                             font-medium rounded-xl text-sm transition-colors">
            Envoyer mes notes
          </button>
        )}
      </Card>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function MatchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, is, isOneOf, canManageTeam } = useAuth()
  const { matches, users, loading, getUserById, getTeamById, getFullName } = useClubData()
  const [activeTab, setActiveTab] = useState('summary')

  const match = matches.find(m => m.id === id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="p-8 text-center">
        <p className="text-surface-500 mb-4">Match introuvable</p>
        <button onClick={() => navigate(-1)} className="text-brand-600 text-sm hover:underline">
          ← Retour
        </button>
      </div>
    )
  }

  const team = getTeamById(match.teamId)


  // ── Onglets selon rôle ──────────────────────────────────────────────────
  const tabs = [
    {
      id: 'summary',
      label: 'Résumé',
      show: true,
    },
    {
      id: 'lineup',
      label: 'Composition',
      show: true,
    },
    {
      id: 'carpool',
      label: 'Covoiturage',
      show: true,
    },
    {
      id: 'squad',
      label: 'Convocations',
      show: isOneOf('president', 'coach') && canManageTeam(match.teamId),
    },
    {
      id: 'result',
      label: 'Saisir résultat',
      show: isOneOf('president', 'coach') && canManageTeam(match.teamId),
    },
    {
      id: 'ratings',
      label: 'Notation',
      show: is('player') && currentUser.teamIds?.includes(match.teamId),
    },
  ].filter(t => t.show)

  // Recaler l'onglet actif si celui en mémoire n'est pas visible
  const safeTab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id ?? 'summary'

  // ── Badge résultat ──────────────────────────────────────────────────────
  let resultVariant = 'gray'
  let resultLabel   = null
  if (match.status === 'played') {
    if      (match.scoreHome > match.scoreAway) { resultVariant = 'green'; resultLabel = 'Victoire' }
    else if (match.scoreHome < match.scoreAway) { resultVariant = 'red';   resultLabel = 'Défaite'  }
    else                                        { resultVariant = 'gray';  resultLabel = 'Nul'      }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">

      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800
                   mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Card className="p-6 mb-6">
        {/* Badges */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="gray">{match.competition}</Badge>
            {team?.category && <Badge variant="blue">{team.category}</Badge>}
            <Badge variant={match.isHome ? 'green' : 'orange'}>
              {match.isHome ? 'Domicile' : 'Déplacement'}
            </Badge>
            {match.status === 'played' && resultLabel && (
              <Badge variant={resultVariant}>{resultLabel}</Badge>
            )}
            {match.status === 'scheduled' && <Badge variant="blue">À venir</Badge>}
          </div>
          <p className="text-sm text-surface-400 capitalize">
            {format(match.scheduledAt, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-10 py-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center
                            justify-center mx-auto mb-2">
              <span className="font-display font-bold text-brand-700 text-lg">
                {team?.name?.[0]}
              </span>
            </div>
            <p className="font-display font-semibold text-surface-900 text-sm">{team?.name}</p>
          </div>

          <div className="text-center min-w-[80px]">
            {match.status === 'played' ? (
              <p className="font-display font-bold text-5xl text-surface-900">
                {match.scoreHome} – {match.scoreAway}
              </p>
            ) : (
              <div>
                <p className="font-display font-bold text-2xl text-surface-400">vs</p>
                <p className="text-xs text-surface-500 mt-1 flex items-center justify-center gap-1">
                  <Clock size={11} />
                  {format(match.scheduledAt, "HH'h'mm")}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center
                            justify-center mx-auto mb-2">
              <span className="font-display font-bold text-surface-600 text-lg">
                {match.opponentName[0]}
              </span>
            </div>
            <p className="font-display font-semibold text-surface-900 text-sm">
              {match.opponentName}
            </p>
          </div>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-surface-100 text-xs text-surface-500">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="flex-shrink-0" />
            {format(match.scheduledAt, "EEE d MMM · HH'h'mm", { locale: fr })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            {match.location}
          </div>
          <div className="flex items-center gap-1.5">
            {match.isHome
              ? <><Home size={12} /> Domicile</>
              : <><Bus size={12} /> Déplacement</>
            }
          </div>
          <div>🟨 {match.referee ?? 'Arbitre non renseigné'}</div>
        </div>
      </Card>

      {/* ── Onglets ───────────────────────────────────────────────────────── */}
      <Tabs tabs={tabs} active={safeTab} onChange={setActiveTab} />

      {/* ── Contenu ───────────────────────────────────────────────────────── */}
      {safeTab === 'summary' && (
        <TabSummary
          match={match}
          currentUser={currentUser}
          is={is}
          canManageTeam={canManageTeam}
          users={users}
          getUserById={getUserById}
        />
      )}
      {safeTab === 'lineup'  && <TabLineup  match={match} getUserById={getUserById} getFullName={getFullName} />}
      {safeTab === 'carpool' && <TabCarpool match={match} currentUser={currentUser} getUserById={getUserById} />}
      {safeTab === 'squad'   && <TabSquad   match={match} users={users} getFullName={getFullName} />}
      {safeTab === 'result'  && <TabResult  match={match} users={users} getTeamById={getTeamById} getUserById={getUserById} />}
      {safeTab === 'ratings' && (
        <TabRatings match={match} currentUser={currentUser} is={is} users={users} />
      )}
    </div>
  )
}
