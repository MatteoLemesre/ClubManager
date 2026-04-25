import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { MATCHES, USERS, getUserById, getTeamById, getFullName } from '../../data/mock'
import { Avatar, Badge, Card, SectionHeader } from '../../components/ui'
import { ArrowLeft, Clock, MapPin, Star, Target } from 'lucide-react'

// ─── Composant onglets ───────────────────────────────────────────────────────

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-white border border-surface-200 rounded-xl p-1 w-fit mb-6">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === t.id
              ? 'bg-brand-600 text-white'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Tab Résumé ──────────────────────────────────────────────────────────────

function TabSummary({ match }) {
  if (match.status !== 'played') {
    return (
      <Card className="p-8 text-center">
        <Clock size={32} className="text-surface-300 mx-auto mb-3" />
        <p className="text-surface-500 text-sm">Le résumé sera disponible après le match</p>
      </Card>
    )
  }

  if (!match.scorers?.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-surface-400 text-sm">Aucun événement enregistré pour ce match</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <SectionHeader title="Événements du match" />
      <div className="space-y-2">
        {[...match.scorers]
          .sort((a, b) => a.minute - b.minute)
          .map((s, i) => {
            const u = getUserById(s.userId)
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-10 text-right text-xs font-semibold text-surface-400">
                  {s.minute}'
                </span>
                <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Target size={13} className="text-brand-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Avatar user={u} size="xs" />
                  <span className="text-sm font-medium text-surface-800">{getFullName(u)}</span>
                </div>
                <Badge variant="brand">But</Badge>
              </div>
            )
          })}
      </div>
    </Card>
  )
}

// ─── Tab Composition ─────────────────────────────────────────────────────────

function TabLineup({ match }) {
  if (!match.squad?.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-surface-400 text-sm">La composition n'a pas encore été publiée</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <SectionHeader title={`Composition · ${match.squad.length} joueurs`} />
      <div className="flex flex-wrap gap-3 mt-1">
        {match.squad.map(uid => {
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

// ─── Tab Convocations ────────────────────────────────────────────────────────

function TabSquad({ match }) {
  const teamPlayers = USERS.filter(u => u.role === 'player' && u.teamId === match.teamId)

  return (
    <Card className="p-5">
      <SectionHeader title="Convocations" />
      <div className="divide-y divide-surface-100">
        {teamPlayers.map(u => {
          const inSquad = match.squad?.includes(u.id)
          return (
            <div key={u.id} className="flex items-center gap-3 py-3">
              <Avatar user={u} size="sm" />
              <span className="text-sm font-medium text-surface-800 flex-1">
                {getFullName(u)}
              </span>
              {inSquad ? (
                <Badge variant="green">Convoqué</Badge>
              ) : (
                <Badge variant="gray">Non convoqué</Badge>
              )}
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

// ─── Tab Saisir résultat ─────────────────────────────────────────────────────

function TabResult({ match }) {
  const [scoreHome, setScoreHome] = useState(match.score?.home ?? 0)
  const [scoreAway, setScoreAway] = useState(match.score?.away ?? 0)

  const inputCls = `w-16 text-center text-2xl font-bold bg-surface-50 border border-surface-200
                    rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300`

  const team = getTeamById(match.teamId)

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionHeader title="Score" />
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center">
            <p className="text-sm font-medium text-surface-700 mb-2">{team?.name}</p>
            <input
              type="number"
              min="0"
              value={scoreHome}
              onChange={e => setScoreHome(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <span className="text-2xl font-bold text-surface-300">–</span>
          <div className="text-center">
            <p className="text-sm font-medium text-surface-700 mb-2">{match.opponent}</p>
            <input
              type="number"
              min="0"
              value={scoreAway}
              onChange={e => setScoreAway(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader
          title="Buteurs"
          action={
            <button className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white
                               rounded-xl text-xs font-medium transition-colors">
              + Ajouter
            </button>
          }
        />
        {match.scorers?.length > 0 ? (
          <div className="space-y-2">
            {match.scorers.map((s, i) => {
              const u = getUserById(s.userId)
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0">
                  <span className="text-xs font-semibold text-surface-400 w-8">{s.minute}'</span>
                  <Avatar user={u} size="xs" />
                  <span className="text-sm text-surface-800 flex-1">{getFullName(u)}</span>
                  <Badge variant="brand">But</Badge>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-surface-400 py-2 text-center">Aucun buteur enregistré</p>
        )}
      </Card>

      <button className="w-full py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-600
                         font-medium rounded-xl text-sm transition-colors">
        Verrouiller la feuille de match
      </button>
    </div>
  )
}

// ─── Tab Notation ────────────────────────────────────────────────────────────

function TabRatings({ match, currentUser }) {
  const [ratings, setRatings] = useState({})

  if (match.status !== 'played') {
    return (
      <Card className="p-8 text-center">
        <p className="text-surface-400 text-sm">Disponible 48h après le match</p>
      </Card>
    )
  }

  const teammates = match.squad
    .filter(uid => uid !== currentUser.id)
    .map(uid => getUserById(uid))
    .filter(Boolean)

  if (!teammates.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-surface-400 text-sm">Aucun coéquipier à noter</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <SectionHeader title="Notez vos coéquipiers" />
      <div className="divide-y divide-surface-100">
        {teammates.map(u => (
          <div key={u.id} className="flex items-center gap-3 py-3">
            <Avatar user={u} size="sm" />
            <span className="text-sm font-medium text-surface-800 flex-1">{getFullName(u)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRatings(r => ({ ...r, [u.id]: n }))}
                  className="p-0.5 transition-colors"
                >
                  <Star
                    size={20}
                    className={n <= (ratings[u.id] ?? 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-surface-200 hover:text-yellow-300'}
                  />
                </button>
              ))}
            </div>
            {ratings[u.id] && (
              <span className="text-xs font-semibold text-surface-500 w-4">
                {ratings[u.id]}/5
              </span>
            )}
          </div>
        ))}
      </div>
      <button className="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                         font-medium rounded-xl text-sm transition-colors">
        Envoyer mes notes
      </button>
    </Card>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function MatchPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { currentUser } = useAuth()

  const isPrivileged = currentUser.role === 'president' || currentUser.role === 'coach'
  const isPlayer     = currentUser.role === 'player'

  const match = MATCHES.find(m => m.id === id)

  if (!match) {
    return (
      <div className="p-8 text-center">
        <p className="text-surface-500 mb-4">Match introuvable</p>
        <button
          onClick={() => navigate(-1)}
          className="text-brand-600 text-sm hover:underline"
        >
          ← Retour
        </button>
      </div>
    )
  }

  const team = getTeamById(match.teamId)

  const tabs = [
    { id: 'summary', label: 'Résumé',          show: true },
    { id: 'lineup',  label: 'Composition',      show: true },
    { id: 'squad',   label: 'Convocations',     show: isPrivileged },
    { id: 'result',  label: 'Saisir résultat',  show: isPrivileged && match.status === 'played' },
    { id: 'ratings', label: 'Notation',         show: isPlayer && match.squad?.includes(currentUser.id) },
  ].filter(t => t.show)

  const [activeTab, setActiveTab] = useState(tabs[0].id)

  // Résultat : victoire / défaite / nul
  const resultVariant = match.score
    ? match.score.home > match.score.away ? 'green'
    : match.score.home < match.score.away ? 'red'
    : 'gray'
  const resultLabel = match.score
    ? match.score.home > match.score.away ? 'Victoire'
    : match.score.home < match.score.away ? 'Défaite'
    : 'Nul'
    : null

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800
                   mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      {/* ── Hero ── */}
      <Card className="p-6 mb-6">

        {/* Badges + date */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="gray">{match.competition}</Badge>
            {team?.category && <Badge variant="blue">{team.category}</Badge>}
            <Badge variant={match.location === 'home' ? 'green' : 'orange'}>
              {match.location === 'home' ? 'Domicile' : 'Extérieur'}
            </Badge>
            {match.status === 'played' && resultLabel && (
              <Badge variant={resultVariant}>{resultLabel}</Badge>
            )}
            {match.status === 'upcoming' && (
              <Badge variant="blue">À venir</Badge>
            )}
          </div>
          <p className="text-sm text-surface-400 capitalize">
            {format(parseISO(match.date), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Score / heure */}
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
            {match.status === 'played' && match.score ? (
              <p className="font-display font-bold text-5xl text-surface-900">
                {match.score.home} – {match.score.away}
              </p>
            ) : (
              <div>
                <p className="font-display font-bold text-2xl text-surface-400">vs</p>
                <p className="text-xs text-surface-500 mt-1 flex items-center justify-center gap-1">
                  <Clock size={11} />
                  {format(parseISO(match.date), "HH'h'mm")}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center
                            justify-center mx-auto mb-2">
              <span className="font-display font-bold text-surface-600 text-lg">
                {match.opponent[0]}
              </span>
            </div>
            <p className="font-display font-semibold text-surface-900 text-sm">{match.opponent}</p>
          </div>
        </div>

        {/* Infos match (toujours visibles) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4
                        border-t border-surface-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-surface-400 flex-shrink-0" />
            {format(parseISO(match.date), "EEE d MMM · HH'h'mm", { locale: fr })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-surface-400 flex-shrink-0" />
            {match.ground}
          </div>
          <div>🏷 {team?.category ?? '—'}</div>
          <div>🟨 {match.referee ?? 'Arbitre non renseigné'}</div>
        </div>
      </Card>

      {/* ── Onglets ── */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* ── Contenu onglet ── */}
      {activeTab === 'summary' && <TabSummary match={match} />}
      {activeTab === 'lineup'  && <TabLineup  match={match} />}
      {activeTab === 'squad'   && isPrivileged && <TabSquad  match={match} />}
      {activeTab === 'result'  && isPrivileged && <TabResult match={match} />}
      {activeTab === 'ratings' && isPlayer     && <TabRatings match={match} currentUser={currentUser} />}
    </div>
  )
}
