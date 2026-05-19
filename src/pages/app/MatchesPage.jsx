import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card, Badge, EmptyState } from '../../components/ui'
import { getUpcomingMatchesForUser, getAllClubs } from '../../data/mock'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarDays, MapPin, Home, Bus, Car } from 'lucide-react'

export default function MatchesPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [clubFilter, setClubFilter] = useState('all')

  const upcomingMatches = useMemo(
    () => getUpcomingMatchesForUser(currentUser),
    [currentUser]
  )

  // Clubs présents dans les matchs
  const clubsInMatches = useMemo(() => {
    const seen = new Set()
    const clubs = []
    upcomingMatches.forEach(m => {
      if (!seen.has(m.clubId)) {
        seen.add(m.clubId)
        clubs.push({ id: m.clubId, name: m.clubName })
      }
    })
    return clubs
  }, [upcomingMatches])

  const filtered = useMemo(() =>
    clubFilter === 'all'
      ? upcomingMatches
      : upcomingMatches.filter(m => m.clubId === clubFilter)
  , [upcomingMatches, clubFilter])

  // Grouper par date
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(m => {
      const key = format(m.scheduledAt, 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-surface-900">Matchs à venir</h1>
        <p className="text-surface-500 mt-1 text-sm">
          Matchs des clubs et équipes que vous suivez
        </p>
      </div>

      {/* Filtres club */}
      {clubsInMatches.length > 1 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setClubFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              clubFilter === 'all'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
            }`}
          >
            Tous
          </button>
          {clubsInMatches.map(c => (
            <button
              key={c.id}
              onClick={() => setClubFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                clubFilter === c.id
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Liste matchs */}
      {grouped.length === 0 ? (
        <EmptyState
          icon="🏟️"
          title="Aucun match à venir"
          description="Suivez des clubs ou des équipes pour voir leurs prochains matchs ici."
          action={
            <button
              onClick={() => navigate('/app/team')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white
                         rounded-xl text-sm font-medium transition-colors"
            >
              Explorer les clubs
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateKey, matches]) => (
            <div key={dateKey}>
              {/* Séparateur date */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider capitalize">
                  {format(new Date(dateKey), 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex-1 h-px bg-surface-200" />
              </div>

              <div className="space-y-3">
                {matches.map(m => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onClick={() => navigate(`/app/matches/${m.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MatchCard ──────────────────────────────────────────────────────────────

function MatchCard({ match: m, onClick }) {
  return (
    <Card
      className="p-4 cursor-pointer hover:border-surface-300 transition-all"
      onClick={onClick}
    >
      {/* Club + équipe */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-400">{m.clubName}</div>
          <div className="font-semibold text-gray-900 text-sm">{m.teamName}</div>
        </div>
        <Badge variant="gray">{m.teamCategory}</Badge>
      </div>

      {/* VS */}
      <div className="text-lg font-bold text-gray-900 mb-3">
        vs {m.opponentName}
      </div>

      {/* Infos */}
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={11} />
          {format(m.scheduledAt, "HH'h'mm", { locale: fr })}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={11} />
          {m.location}
        </div>
        <div className="flex items-center gap-1.5">
          {m.isHome
            ? <><Home size={11} /> Domicile</>
            : <><Bus size={11} /> Déplacement</>
          }
        </div>
        {m.carpoolCount > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <Car size={11} />
            {m.carpoolCount} covoiturage{m.carpoolCount > 1 ? 's' : ''} disponible{m.carpoolCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-brand-600 font-medium">
        Voir les détails →
      </div>
    </Card>
  )
}
