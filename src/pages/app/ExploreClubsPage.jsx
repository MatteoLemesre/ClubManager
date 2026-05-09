import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui'
import * as db from '../../services/db'
import { Search } from 'lucide-react'

export default function ExploreClubsPage() {
  const { currentUser } = useAuth()

  const [clubs,       setClubs]       = useState([])
  const [followed,    setFollowed]    = useState(new Set())
  const [sports,      setSports]      = useState([])
  const [search,      setSearch]      = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const load = async () => {
      const [allClubs, followedClubs, allSports] = await Promise.all([
        db.getAllActiveClubs(),
        db.getFollowedClubs(currentUser.id),
        db.getSports(),
      ])
      setClubs(allClubs)
      setFollowed(new Set(followedClubs.map(c => c.id)))
      setSports(allSports)
      setLoading(false)
    }
    load()
  }, [currentUser.id])

  const filtered = clubs.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase())
    const matchSport = !sportFilter || c.sport_id === sportFilter
    return matchSearch && matchSport
  })

  const handleToggleFollow = async (clubId) => {
    if (followed.has(clubId)) {
      await db.unfollowClub(currentUser.id, clubId)
      setFollowed(prev => { const s = new Set(prev); s.delete(clubId); return s })
    } else {
      await db.followClub(currentUser.id, clubId)
      setFollowed(prev => new Set(prev).add(clubId))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Explorer les clubs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Suivez des clubs pour recevoir leurs événements
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Rechercher un club ou une ville…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-50 border border-surface-200 rounded-xl
                       pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2
                       focus:ring-brand-300"
          />
        </div>
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-surface-50 border border-surface-200 rounded-xl
                     px-3 py-2 text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-300"
        >
          <option value="">Tous les sports</option>
          {sports.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-12">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold text-gray-700 mb-1">Aucun club trouvé</div>
          <p className="text-sm text-gray-400">Essayez un autre nom ou ville</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(club => {
            const isFollowed = followed.has(club.id)
            return (
              <Card key={club.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{club.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {club.sports?.name}
                      {club.city && <>{' · '}{club.city}</>}
                    </div>
                    {(club.department || club.region) && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {club.department && `${club.department} — `}{club.region}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleFollow(club.id)}
                    className={`flex-shrink-0 text-sm font-medium px-3 py-1.5
                                rounded-full border transition-all ${
                      isFollowed
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300'
                    }`}
                  >
                    {isFollowed ? '✓ Suivi' : '+ Suivre'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
