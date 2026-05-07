import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { Card, EmptyState, SectionHeader } from '../../components/ui'
import { getTeamById, getMatchesByTeamAndSeason } from '../../services/db'

export default function TeamHistoryPage() {
  const { teamId, season } = useParams()
  const navigate = useNavigate()

  const [team,    setTeam]    = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [t, m] = await Promise.all([
        getTeamById(teamId),
        getMatchesByTeamAndSeason(teamId, season),
      ])
      setTeam(t)
      setMatches(m)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
  }, [teamId, season])

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700
                   mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {team?.name ?? '…'}
        </h1>
        <div className="text-gray-500 text-sm mt-1">
          Saison {season}
          {team?.clubs?.name ? ` · ${team.clubs.name}` : ''}
          {team?.category ? ` · ${team.category}` : ''}
        </div>
      </div>

      <SectionHeader title="Matchs de la saison" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <EmptyState icon="📋" title="Aucun match cette saison" description="" />
      ) : (
        <div className="space-y-3">
          {matches.map(m => (
            <Card
              key={m.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/app/matches/${m.id}`)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      vs {m.opponent_name}
                    </span>
                    {m.status === 'played' && (
                      <span className="text-xl font-bold text-gray-900 tabular-nums">
                        {m.score_home} — {m.score_away}
                      </span>
                    )}
                    {m.status !== 'played' && (
                      <span className="text-sm text-gray-400">À venir</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {format(new Date(m.scheduled_at), "d MMM yyyy · HH'h'mm", { locale: fr })}
                    {m.location ? ` · ${m.location}` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {m.is_home ? 'Domicile' : 'Déplacement'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
