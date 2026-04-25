import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USERS, TEAMS, getTeamById, getFullName } from '../../data/mock'
import { Avatar, Badge, Card, RoleBadge, EmptyState, SectionHeader } from '../../components/ui'
import { Search, UserPlus } from 'lucide-react'

const ALL = ''

export default function MembersPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const isPresident = currentUser.role === 'president'
  const isCoach     = currentUser.role === 'coach'

  const [search,     setSearch]     = useState('')
  const [teamFilter, setTeamFilter] = useState(ALL)
  const [licFilter,  setLicFilter]  = useState(ALL)

  const members = useMemo(() => {
    return USERS.filter(u => {
      // Coach : uniquement ses joueurs (même équipe)
      if (isCoach) {
        if (u.role !== 'player' || u.teamId !== currentUser.teamId) return false
      }

      const matchSearch = getFullName(u).toLowerCase().includes(search.toLowerCase())
      const matchTeam   = !teamFilter || u.teamId === teamFilter
      const matchLic    = !licFilter  || u.license?.status === licFilter

      return matchSearch && matchTeam && matchLic
    })
  }, [search, teamFilter, licFilter, currentUser, isCoach])

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <SectionHeader
          title={isCoach ? 'Mes joueurs' : 'Membres'}
          action={
            isPresident && (
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                                 text-white rounded-xl text-sm font-medium transition-colors">
                <UserPlus size={15} />
                Ajouter un membre
              </button>
            )
          }
        />
        <p className="text-surface-500 text-sm">{members.length} membre{members.length > 1 ? 's' : ''}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm
                       text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2
                       focus:ring-brand-300 focus:border-brand-400"
          />
        </div>

        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm
                     text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value={ALL}>Toutes les équipes</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <select
          value={licFilter}
          onChange={e => setLicFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm
                     text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value={ALL}>Toutes les licences</option>
          <option value="active">Active</option>
          <option value="expiring">Expire bientôt</option>
          <option value="expired">Expirée</option>
        </select>
      </div>

      {/* Tableau */}
      {members.length === 0 ? (
        <EmptyState
          icon={<Search size={36} />}
          title="Aucun membre trouvé"
          description="Modifiez vos filtres ou votre recherche."
        />
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-5 py-3">
                  Membre
                </th>
                <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-4 py-3">
                  Équipe
                </th>
                <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-4 py-3">
                  Rôle
                </th>
                <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider px-4 py-3">
                  Licence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {members.map(member => {
                const team = member.teamId ? getTeamById(member.teamId) : null
                return (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/app/profile/${member.id}`)}
                    className="hover:bg-surface-50 transition-colors cursor-pointer"
                  >
                    {/* Membre */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={member} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{getFullName(member)}</p>
                          <p className="text-xs text-surface-400">
                            {member.position ?? member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Équipe */}
                    <td className="px-4 py-3">
                      {team
                        ? <Badge variant="gray">{team.name}</Badge>
                        : <span className="text-sm text-surface-300">—</span>
                      }
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>

                    {/* Licence */}
                    <td className="px-4 py-3">
                      {member.license ? (
                        <span className="text-sm text-surface-600 font-mono">{member.license.number}</span>
                      ) : (
                        <span className="text-sm text-surface-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
