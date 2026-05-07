import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, EmptyState } from '../../components/ui'
import { getAllPlayedMatches, getAllActiveClubs } from '../../services/db'

export default function ResultsPage() {
  const navigate = useNavigate()

  const [matches,     setMatches]     = useState([])
  const [clubs,       setClubs]       = useState([])
  const [clubFilter,  setClubFilter]  = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [m, c] = await Promise.all([
        getAllPlayedMatches(),
        getAllActiveClubs(),
      ])
      setMatches(m)
      setClubs(c)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [])

  const filtered = matches.filter(m =>
    !clubFilter || m.teams?.club_id === clubFilter
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Résultats</h1>
      </div>

      {/* Filtre club */}
      <div className="mb-6">
        <select
          value={clubFilter}
          onChange={e => setClubFilter(e.target.value)}
          className="bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400
                     transition-all"
        >
          <option value="">Tous les clubs</option>
          {clubs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Liste des matchs */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="Aucun résultat"
          description="Les résultats des matchs joués apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(match => (
            <Card
              key={match.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/app/matches/${match.id}`)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">
                    {match.teams?.name}
                    {match.teams?.clubs?.name ? ` · ${match.teams.clubs.name}` : ''}
                    {match.teams?.category ? ` · ${match.teams.category}` : ''}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">
                      {match.teams?.name}
                    </span>
                    <span className="text-2xl font-bold text-gray-900 tabular-nums flex-shrink-0">
                      {match.score_home} — {match.score_away}
                    </span>
                    <span className="font-semibold text-gray-500 truncate">
                      {match.opponent_name}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  <div>
                    {format(new Date(match.scheduled_at), 'd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="mt-0.5">{match.is_home ? 'Domicile' : 'Déplacement'}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
