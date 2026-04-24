import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { USERS, TEAMS, getTeamById, getFullName } from '../../data/mock'
import { Card, Badge, SectionHeader, Avatar, LicenseBadge, RoleBadge, EmptyState } from '../../components/ui'
import { Search, LayoutGrid, List, Filter } from 'lucide-react'

const ALL = 'all'

export default function MembersPage() {
  const { currentUser } = useAuth()
  const isPrivileged = ['president', 'coach'].includes(currentUser.role)

  const [search, setSearch] = useState('')
  const [filterTeam, setFilterTeam] = useState(ALL)
  const [filterRole, setFilterRole] = useState(ALL)
  const [filterLicense, setFilterLicense] = useState(ALL)
  const [view, setView] = useState('list')

  const members = useMemo(() => {
    let list = USERS

    // Coach ne voit que son équipe
    if (currentUser.role === 'coach') {
      list = list.filter(u => u.teamId === currentUser.teamId || u.id === currentUser.id)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        getFullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    }
    if (filterTeam !== ALL) {
      list = list.filter(u => u.teamId === filterTeam)
    }
    if (filterRole !== ALL) {
      list = list.filter(u => u.role === filterRole)
    }
    if (filterLicense !== ALL) {
      list = list.filter(u => u.license?.status === filterLicense)
    }
    return list
  }, [search, filterTeam, filterRole, filterLicense, currentUser])

  const licenseAlerts = useMemo(() =>
    USERS.filter(u => u.license?.status === 'expiring' || u.license?.status === 'expired'),
    []
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-surface-900">Membres</h1>
        <p className="text-surface-500 mt-1">{USERS.length} membres au total</p>
      </div>

      {/* Alertes licences */}
      {isPrivileged && licenseAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            ⚠️ {licenseAlerts.length} licence{licenseAlerts.length > 1 ? 's' : ''} à renouveler
          </p>
          <div className="flex flex-wrap gap-2">
            {licenseAlerts.map(u => (
              <div key={u.id} className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1 border border-orange-200">
                <Avatar user={u} size="xs" />
                <span className="text-xs font-medium text-surface-800">{getFullName(u)}</span>
                <LicenseBadge status={u.license.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres & recherche */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Recherche */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
          />
        </div>

        {/* Équipe */}
        <select
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
          className="px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value={ALL}>Toutes les équipes</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Rôle */}
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value={ALL}>Tous les rôles</option>
          <option value="president">Président</option>
          <option value="coach">Coach</option>
          <option value="player">Joueur</option>
          <option value="supporter">Supporter</option>
          <option value="parent">Parent</option>
        </select>

        {/* Licence (privileged only) */}
        {isPrivileged && (
          <select
            value={filterLicense}
            onChange={e => setFilterLicense(e.target.value)}
            className="px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            <option value={ALL}>Toutes les licences</option>
            <option value="active">Active</option>
            <option value="expiring">Expire bientôt</option>
            <option value="expired">Expirée</option>
          </select>
        )}

        {/* Vue */}
        <div className="flex items-center bg-white border border-surface-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`p-2 transition-colors ${view === 'list' ? 'bg-brand-600 text-white' : 'text-surface-500 hover:bg-surface-50'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setView('grid')}
            className={`p-2 transition-colors ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-surface-500 hover:bg-surface-50'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Résultats */}
      <p className="text-xs text-surface-500 mb-3">{members.length} résultat{members.length > 1 ? 's' : ''}</p>

      {members.length === 0 ? (
        <EmptyState
          icon={<Search size={36} />}
          title="Aucun membre trouvé"
          description="Modifiez vos filtres ou votre recherche."
        />
      ) : view === 'list' ? (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left text-xs font-semibold text-surface-500 px-5 py-3">Membre</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Équipe</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Rôle</th>
                {isPrivileged && (
                  <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Licence</th>
                )}
                {isPrivileged && (
                  <th className="text-left text-xs font-semibold text-surface-500 px-4 py-3">Stats</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {members.map(member => {
                const team = member.teamId ? getTeamById(member.teamId) : null
                return (
                  <tr key={member.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={member} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{getFullName(member)}</p>
                          <p className="text-xs text-surface-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {team ? (
                        <span className="text-sm text-surface-700">{team.name}</span>
                      ) : (
                        <span className="text-sm text-surface-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    {isPrivileged && (
                      <td className="px-4 py-3">
                        {member.license ? (
                          <div>
                            <LicenseBadge status={member.license.status} />
                            <p className="text-xs text-surface-400 mt-0.5">{member.license.number}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-surface-300">—</span>
                        )}
                      </td>
                    )}
                    {isPrivileged && (
                      <td className="px-4 py-3">
                        {member.stats ? (
                          <div className="flex gap-3 text-xs text-surface-600">
                            <span><span className="font-semibold">{member.stats.goals}</span> buts</span>
                            <span><span className="font-semibold">{member.stats.assists}</span> passes</span>
                            <span><span className="font-semibold">{member.stats.matches}</span> matchs</span>
                          </div>
                        ) : (
                          <span className="text-sm text-surface-300">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {members.map(member => {
            const team = member.teamId ? getTeamById(member.teamId) : null
            return (
              <Card key={member.id} className="p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar user={member} size="lg" className="mb-3" />
                  <p className="font-semibold text-surface-900 text-sm">{getFullName(member)}</p>
                  <p className="text-xs text-surface-400 mt-0.5 mb-2">{member.email}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <RoleBadge role={member.role} />
                    {team && <Badge variant="gray">{team.name}</Badge>}
                  </div>
                  {isPrivileged && member.license && (
                    <div className="mt-2">
                      <LicenseBadge status={member.license.status} />
                    </div>
                  )}
                  {member.stats && (
                    <div className="flex gap-3 text-xs text-surface-500 mt-3 pt-3 border-t border-surface-100 w-full justify-center">
                      <span><span className="font-semibold text-surface-800">{member.stats.goals}</span> buts</span>
                      <span><span className="font-semibold text-surface-800">{member.stats.matches}</span> matchs</span>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
