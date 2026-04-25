import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { TEAMS, MATCHES, TRAININGS, USERS, getUserById, getTeamById, getFullName } from '../../data/mock'
import { Card, Badge, SectionHeader, Avatar, EmptyState } from '../../components/ui'
import { format, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Trophy, Clock, MapPin, ChevronRight, CheckCircle2, XCircle, AlertCircle,
  Target, Swords,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AttendanceDot({ status }) {
  if (status === 'present') return <CheckCircle2 size={14} className="text-emerald-500" />
  if (status === 'absent') return <XCircle size={14} className="text-red-400" />
  return <AlertCircle size={14} className="text-surface-300" />
}

export default function TeamPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [selectedTeam, setSelectedTeam] = useState(
    currentUser.teamId
      ? currentUser.teamId
      : TEAMS[0].id
  )
  const [showFullRanking, setShowFullRanking] = useState(false)
  const [manageAttendanceId, setManageAttendanceId] = useState(null)

  const isPrivileged = ['president', 'coach'].includes(currentUser.role)
  const isSupporter  = currentUser.role === 'supporter'

  // Équipes accessibles — supporter et privilégiés voient tout le club
  const accessibleTeams = (isPrivileged || isSupporter)
    ? TEAMS
    : TEAMS.filter(t => t.id === currentUser.teamId)

  const team = getTeamById(selectedTeam)

  const teamMatches = MATCHES
    .filter(m => m.teamId === selectedTeam)
    .sort((a, b) => parseISO(b.date) - parseISO(a.date))

  const lastResult = teamMatches.find(m => m.status === 'played')
  const upcomingMatches = teamMatches.filter(m => m.status === 'upcoming')

  const teamTrainings = TRAININGS
    .filter(t => t.teamId === selectedTeam)
    .sort((a, b) => parseISO(b.date) - parseISO(a.date))

  const teamPlayers = USERS.filter(u => u.teamId === selectedTeam && u.role === 'player')

  const topScorers = [...teamPlayers]
    .filter(u => (u.stats?.goals ?? 0) > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 3)

  const topAssists = [...teamPlayers]
    .filter(u => (u.stats?.assists ?? 0) > 0)
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 3)

  const topMatches = [...teamPlayers]
    .sort((a, b) => (b.stats?.matches ?? 0) - (a.stats?.matches ?? 0))
    .slice(0, 3)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Équipe</h1>
          <p className="text-surface-500 mt-1">Matchs, entraînements et présences</p>
        </div>
        {/* Sélecteur d'équipe — président, coach, supporter */}
        {(isPrivileged || isSupporter) && (
          <div className="flex gap-2 flex-wrap">
            {TEAMS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeam(t.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  selectedTeam === t.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Colonne principale */}
        <div className="col-span-3 space-y-8">
          {/* Dernier résultat */}
          {lastResult && (
            <div>
              <SectionHeader title="Dernier résultat" />
              <Card
                className="p-5"
                onClick={() => navigate(`/app/matches/${lastResult.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="gray">{lastResult.competition}</Badge>
                    {team?.category && <Badge variant="blue">{team.category}</Badge>}
                  </div>
                  <p className="text-xs text-surface-400">
                    {format(parseISO(lastResult.date), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-8 py-3">
                  <div className="text-center">
                    <p className="font-display font-bold text-surface-900">{team?.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">Domicile</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-4xl text-surface-900">
                      {lastResult.score.home} – {lastResult.score.away}
                    </p>
                    <Badge
                      variant={lastResult.score.home > lastResult.score.away ? 'green' : lastResult.score.home < lastResult.score.away ? 'red' : 'gray'}
                      className="mt-1"
                    >
                      {lastResult.score.home > lastResult.score.away ? 'Victoire' : lastResult.score.home < lastResult.score.away ? 'Défaite' : 'Nul'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-surface-900">{lastResult.opponent}</p>
                    <p className="text-xs text-surface-500 mt-0.5">Extérieur</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {lastResult.ground}</span>
                  <span>🟨 {lastResult.referee ?? 'Arbitre non renseigné'}</span>
                </div>
                {lastResult.scorers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-100">
                    <p className="text-xs text-surface-500 mb-1">Buteurs</p>
                    <div className="flex flex-wrap gap-2">
                      {lastResult.scorers.map((s, i) => {
                        const u = getUserById(s.userId)
                        return (
                          <span key={i} className="text-xs text-surface-700 flex items-center gap-1">
                            <Target size={11} className="text-brand-600" />
                            {getFullName(u)} {s.minute}'
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Matchs à venir */}
          <div>
            <SectionHeader title="Matchs à venir" />
            {upcomingMatches.length === 0 ? (
              <EmptyState
                icon={<Trophy size={36} />}
                title="Aucun match programmé"
                description="Les prochains matchs apparaîtront ici."
              />
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map(match => (
                  <Card
                    key={match.id}
                    className="p-4"
                    onClick={() => navigate(`/app/matches/${match.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                          <Swords size={16} className="text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs text-surface-500">{match.competition}</p>
                          <p className="font-semibold text-surface-900 text-sm mt-0.5">
                            {match.location === 'home' ? `vs ${match.opponent}` : `@ ${match.opponent}`}
                          </p>
                          <div className="mt-1 space-y-0.5 text-xs text-surface-400">
                            <div className="flex items-center gap-1">
                              <Clock size={11} />
                              {format(parseISO(match.date), "EEE d MMM · HH'h'mm", { locale: fr })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={11} /> {match.ground}
                            </div>
                            {team?.category && (
                              <div>🏷 {team.category}</div>
                            )}
                            <div>🟨 {match.referee ?? 'Arbitre non renseigné'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={match.location === 'home' ? 'green' : 'orange'}>
                          {match.location === 'home' ? 'Domicile' : 'Extérieur'}
                        </Badge>
                        <ChevronRight size={14} className="text-surface-300" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Entraînements récents — pas pour le supporter */}
          {!isSupporter && (
            <div>
              <SectionHeader title="Entraînements" />
              {teamTrainings.length === 0 ? (
                <EmptyState
                  icon={<Clock size={36} />}
                  title="Aucun entraînement"
                  description="Les entraînements de cette équipe apparaîtront ici."
                />
              ) : (
                <div className="space-y-3">
                  {teamTrainings.map(training => {
                    const presentCount    = training.attendances.filter(a => a.status === 'present').length
                    const absentCount     = training.attendances.filter(a => a.status === 'absent').length
                    const noResponseCount = teamPlayers.filter(p => !training.attendances.find(a => a.userId === p.id)).length
                    const isManaging      = manageAttendanceId === training.id

                    return (
                      <Card key={training.id} className="p-4">
                        {isPrivileged ? (
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                  <Clock size={15} className="text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-surface-400">
                                    {format(parseISO(training.date), "EEEE d MMM · HH'h'mm", { locale: fr })} · {training.duration} min
                                  </p>
                                  <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} /> {training.location}
                                  </p>
                                  <p className="text-xs text-surface-500 mt-1">
                                    {presentCount} présents · {absentCount} absents · {noResponseCount} sans réponse
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setManageAttendanceId(isManaging ? null : training.id)}
                                className="text-xs text-brand-600 hover:underline flex-shrink-0"
                              >
                                {isManaging ? 'Fermer' : 'Gérer les présences'}
                              </button>
                            </div>
                            {isManaging && (
                              <div className="mt-3 pt-3 border-t border-surface-100 space-y-1.5">
                                {teamPlayers.map(player => {
                                  const att = training.attendances.find(a => a.userId === player.id)
                                  return (
                                    <div key={player.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Avatar user={player} size="sm" />
                                        <span className="text-sm text-surface-800">{getFullName(player)}</span>
                                      </div>
                                      {att?.status === 'present' ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                                          <CheckCircle2 size={13} /> Présent
                                        </span>
                                      ) : att?.status === 'absent' ? (
                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                          <XCircle size={13} /> Absent{att.reason ? ` (${att.reason})` : ''}
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-xs text-surface-400">
                                          <AlertCircle size={13} /> Sans réponse
                                        </span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Clock size={15} className="text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-xs text-surface-400">
                                  {format(parseISO(training.date), "EEEE d MMM · HH'h'mm", { locale: fr })} · {training.duration} min
                                </p>
                                <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={11} /> {training.location}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button className="flex-1 py-1.5 text-xs font-medium bg-emerald-50
                                                 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                                Présent
                              </button>
                              <button className="flex-1 py-1.5 text-xs font-medium bg-red-50
                                                 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                Absent
                              </button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {/* Top stats */}
          {teamPlayers.length > 0 && (
            <div>
              <Card className="p-5">
                <SectionHeader
                  title={`Top stats — ${team?.name}`}
                  action={
                    <button
                      onClick={() => setShowFullRanking(v => !v)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {showFullRanking ? 'Réduire' : 'Classement complet'}
                    </button>
                  }
                />

                {/* Top 3 compacts */}
                {!showFullRanking && (
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[
                      { label: '⚽ Buteurs',  players: topScorers, stat: u => u.stats.goals },
                      { label: '🅰️ Passeurs', players: topAssists, stat: u => u.stats.assists },
                      { label: '📋 Matchs',   players: topMatches, stat: u => u.stats?.matches ?? 0 },
                    ].map(col => (
                      <div key={col.label}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{col.label}</p>
                        {col.players.length === 0 ? (
                          <p className="text-xs text-surface-300">—</p>
                        ) : col.players.map((u, i) => (
                          <div key={u.id} className="flex items-center gap-2 py-1">
                            <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                            <Avatar user={u} size="sm" />
                            <span className="text-sm font-medium text-surface-800 flex-1 truncate">
                              {u.lastName}
                            </span>
                            <span className="text-sm font-bold text-gray-900">{col.stat(u)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Classement complet */}
                {showFullRanking && (
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-surface-200">
                        <th className="text-left py-2 font-semibold">Joueur</th>
                        <th className="text-center py-2 font-semibold">⚽</th>
                        <th className="text-center py-2 font-semibold">🅰️</th>
                        <th className="text-center py-2 font-semibold">📋</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...teamPlayers]
                        .sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
                        .map(u => (
                          <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <Avatar user={u} size="sm" />
                                <span className="font-medium text-surface-900">
                                  {u.firstName} {u.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="text-center font-bold text-surface-900">
                              {u.stats?.goals ?? 0}
                            </td>
                            <td className="text-center text-surface-700">
                              {u.stats?.assists ?? 0}
                            </td>
                            <td className="text-center text-surface-700">
                              {u.stats?.matches ?? 0}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Joueurs */}
        <div className="col-span-2">
          <SectionHeader
            title={`Effectif (${teamPlayers.length})`}
          />
          <div className="space-y-2">
            {teamPlayers.map(player => (
              <Card key={player.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar user={player} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">{getFullName(player)}</p>
                    {player.position && (
                      <p className="text-xs text-surface-400">{player.position}</p>
                    )}
                  </div>
                  {player.stats && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-surface-700">{player.stats.goals} buts</p>
                      <p className="text-xs text-surface-400">{player.stats.matches} matchs</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {teamPlayers.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-6">Aucun joueur dans cette équipe</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
