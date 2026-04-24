import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { TEAMS, MATCHES, TRAININGS, USERS, getUserById, getTeamById, getFullName } from '../../data/mock'
import { Card, Badge, SectionHeader, Avatar, LicenseBadge, RoleBadge, EmptyState } from '../../components/ui'
import { format, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Trophy, Clock, MapPin, ChevronRight, Users, CheckCircle2, XCircle, AlertCircle,
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

  const isPrivileged = ['president', 'coach'].includes(currentUser.role)

  // Équipes accessibles
  const accessibleTeams = isPrivileged
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Équipe</h1>
          <p className="text-surface-500 mt-1">Matchs, entraînements et présences</p>
        </div>
        {/* Sélecteur d'équipe */}
        {isPrivileged && (
          <div className="flex gap-2">
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
                  <Badge variant="gray">{lastResult.competition}</Badge>
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
                          <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {format(parseISO(match.date), "EEE d MMM · HH'h'mm", { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {match.ground}
                            </span>
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

          {/* Entraînements récents */}
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
                {teamTrainings.map(training => (
                  <Card key={training.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Clock size={15} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 text-sm">{training.theme}</p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {format(parseISO(training.date), "EEEE d MMM · HH'h'mm", { locale: fr })} · {training.duration} min
                          </p>
                          <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {training.location}
                          </p>
                        </div>
                      </div>
                      {isPast(parseISO(training.date)) && (
                        <div className="text-right">
                          <p className="text-xs text-surface-500 mb-1">Présences</p>
                          <div className="flex items-center gap-1">
                            {training.attendances.map(a => (
                              <AttendanceDot key={a.userId} status={a.status} />
                            ))}
                            {training.attendances.length === 0 && (
                              <span className="text-xs text-surface-400">—</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
                    {player.license && (
                      <LicenseBadge status={player.license.status} />
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
