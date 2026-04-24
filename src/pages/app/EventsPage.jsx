import { useAuth } from '../../context/AuthContext'
import { EVENTS, MATCHES, TRAININGS, getTeamById, getUserById, getFullName } from '../../data/mock'
import { Card, Badge, SectionHeader, StatCard, EmptyState, Avatar } from '../../components/ui'
import { format, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Car, Users, PartyPopper, Trophy, Calendar, MapPin, Clock, ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EVENT_TYPE_CONFIG = {
  carpooling: { icon: Car,         label: 'Covoiturage', variant: 'blue' },
  meeting:    { icon: Users,       label: 'Réunion',     variant: 'gray' },
  social:     { icon: PartyPopper, label: 'Social',      variant: 'purple' },
  tournament: { icon: Trophy,      label: 'Tournoi',     variant: 'orange' },
}

export default function EventsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const upcomingEvents = EVENTS
    .filter(e => isAfter(parseISO(e.date), new Date()))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))

  const upcomingMatches = MATCHES
    .filter(m => m.status === 'upcoming' && isAfter(parseISO(m.date), new Date()))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))
    .slice(0, 3)

  const nextTraining = TRAININGS
    .filter(t => isAfter(parseISO(t.date), new Date()))
    .sort((a, b) => parseISO(a.date) - parseISO(b.date))[0]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-surface-900">
          Bonjour, {currentUser.firstName} 👋
        </h1>
        <p className="text-surface-500 mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          value={upcomingMatches.length}
          label="Matchs à venir"
          color="brand"
          icon={<Trophy size={20} />}
        />
        <StatCard
          value={upcomingEvents.length}
          label="Événements"
          color="purple"
          icon={<Calendar size={20} />}
        />
        <StatCard
          value={nextTraining ? '1' : '0'}
          label="Prochain entraînement"
          sub={nextTraining ? format(parseISO(nextTraining.date), 'EEE d MMM', { locale: fr }) : 'Aucun'}
          color="green"
          icon={<Clock size={20} />}
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Événements — colonne principale */}
        <div className="col-span-3 space-y-6">
          <SectionHeader
            title="Événements à venir"
            action={
              <button className="text-xs text-brand-600 font-medium hover:underline">
                Voir tout
              </button>
            }
          />

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="Aucun événement prévu"
              description="Aucun événement n'est programmé pour le moment."
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const cfg = EVENT_TYPE_CONFIG[event.type] ?? EVENT_TYPE_CONFIG.meeting
                const Icon = cfg.icon
                const team = event.teamId ? getTeamById(event.teamId) : null

                return (
                  <Card key={event.id} className="p-4 hover:border-surface-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-surface-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          {team && <Badge variant="gray">{team.name}</Badge>}
                        </div>
                        <h3 className="font-semibold text-surface-900 text-sm leading-snug">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {format(parseISO(event.date), "EEE d MMM 'à' HH'h'mm", { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </span>
                        </div>
                        {event.attendees.length > 0 && (
                          <div className="flex items-center gap-1 mt-3">
                            <div className="flex -space-x-1">
                              {event.attendees.slice(0, 4).map(uid => {
                                const u = getUserById(uid)
                                return u ? <Avatar key={uid} user={u} size="xs" className="ring-2 ring-white" /> : null
                              })}
                            </div>
                            <span className="text-xs text-surface-400 ml-1">
                              {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar droite */}
        <div className="col-span-2 space-y-6">
          {/* Prochains matchs */}
          <div>
            <SectionHeader title="Prochains matchs" />
            {upcomingMatches.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">Aucun match prévu</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map(match => {
                  const team = getTeamById(match.teamId)
                  return (
                    <Card
                      key={match.id}
                      className="p-3"
                      onClick={() => navigate(`/app/matches/${match.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-surface-500 mb-0.5">{team?.name}</p>
                          <p className="text-sm font-semibold text-surface-900 leading-tight">
                            {match.location === 'home' ? 'vs' : '@'} {match.opponent}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {format(parseISO(match.date), "d MMM · HH'h'mm", { locale: fr })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={match.location === 'home' ? 'green' : 'orange'}>
                            {match.location === 'home' ? 'Dom.' : 'Ext.'}
                          </Badge>
                          <ChevronRight size={14} className="text-surface-300" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Prochain entraînement */}
          {nextTraining && (
            <div>
              <SectionHeader title="Prochain entraînement" />
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 mb-0.5">{getTeamById(nextTraining.teamId)?.name}</p>
                    <p className="font-semibold text-surface-900 text-sm">{nextTraining.theme}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {format(parseISO(nextTraining.date), "EEEE d MMM 'à' HH'h'mm", { locale: fr })} · {nextTraining.duration} min
                    </p>
                    <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {nextTraining.location}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
