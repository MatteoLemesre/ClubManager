import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Avatar, Card, LicenseBadge, RoleBadge, EmptyState, SectionHeader } from '../../components/ui'
import { ArrowLeft, FileText, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { getMemberships, getPlayerHistory } from '../../services/db'

// ─── Composants locaux ──────────────────────────────────────────────────────

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-surface-100 last:border-0">
      <span className="text-sm text-surface-500 flex-shrink-0 w-44">{label}</span>
      <span className="text-sm font-medium text-surface-900 text-right">{value ?? 'Non renseigné'}</span>
    </div>
  )
}

function DocItem({ label, uploaded, url }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-100 last:border-0">
      <div className="flex items-center gap-2">
        <FileText size={15} className="text-surface-400" />
        <span className="text-sm text-surface-800">{label}</span>
      </div>
      {uploaded ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Fourni</span>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              <ExternalLink size={12} /> Voir
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-orange-500">
          <AlertCircle size={14} />
          <span className="text-xs font-medium">Manquant</span>
        </div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { users, loading, getTeamById } = useClubData()

  const isPresident  = currentUser.role === 'president'
  const isCoach      = currentUser.role === 'coach'
  const isPrivileged = isPresident || isCoach

  // Résoudre l'utilisateur à afficher
  const targetUser = id ? users.find(u => u.id === id) : currentUser
  const isOwnProfile = !id || id === currentUser.id

  // Historique des appartenances (clubs)
  const [memberships,   setMemberships]   = useState([])
  // Historique des équipes (joueurs uniquement)
  const [playerHistory, setPlayerHistory] = useState([])

  useEffect(() => {
    if (!targetUser?.id) return
    getMemberships(targetUser.id).then(setMemberships).catch(() => {})
    if (targetUser.role === 'player') {
      getPlayerHistory(targetUser.id).then(setPlayerHistory).catch(() => {})
    }
  }, [targetUser?.id])

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Contrôle d'accès
  if (!isOwnProfile) {
    if (!isPrivileged) {
      return (
        <div className="p-8 max-w-lg mx-auto">
          <EmptyState
            title="Accès refusé"
            description="Vous ne pouvez consulter que votre propre profil."
          />
        </div>
      )
    }
    if (isCoach && !targetUser?.teamIds?.some(t => currentUser.teamIds?.includes(t))) {
      return (
        <div className="p-8 max-w-lg mx-auto">
          <EmptyState
            title="Accès refusé"
            description="Vous ne pouvez consulter que les profils de vos joueurs."
          />
        </div>
      )
    }
  }

  if (!targetUser) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <EmptyState title="Profil introuvable" description="Ce membre n'existe pas." />
      </div>
    )
  }

  const team = targetUser.teamIds?.[0] ? getTeamById(targetUser.teamIds[0]) : null

  const age = targetUser.birthDate
    ? differenceInYears(new Date(), new Date(targetUser.birthDate))
    : null

  const birthDateFormatted = targetUser.birthDate
    ? format(new Date(targetUser.birthDate), 'd MMMM yyyy', { locale: fr })
    : null

  return (
    <div className="p-8 max-w-2xl mx-auto">

      {/* Retour */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800
                     mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      )}

      {/* Hero */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-5">
          <Avatar user={targetUser} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-2xl text-surface-900">
              {targetUser.firstName} {targetUser.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <RoleBadge role={targetUser.role} />
              {targetUser.position && (
                <span className="text-sm text-surface-500">{targetUser.position}</span>
              )}
              {targetUser.jerseyNumber && (
                <span className="px-2 py-0.5 bg-surface-100 rounded-lg text-xs font-bold text-surface-700">
                  N°{targetUser.jerseyNumber}
                </span>
              )}
              {team && (
                <span className="text-sm text-surface-400">{team.name}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Informations personnelles */}
      <Card className="p-5 mb-5">
        <SectionHeader title="Informations personnelles" className="mb-0" />
        <div className="mt-3">
          {birthDateFormatted && (
            <Field label="Date de naissance" value={birthDateFormatted} />
          )}
          {age !== null && (
            <Field label="Âge" value={`${age} ans`} />
          )}
          <Field label="Lieu de naissance" value={targetUser.birthPlace} />
          <Field label="Email"             value={targetUser.email} />
          <Field label="Téléphone"         value={targetUser.phone} />
          <Field
            label="Membre depuis"
            value={targetUser.joinedAt
              ? format(new Date(targetUser.joinedAt), 'd MMMM yyyy', { locale: fr })
              : null}
          />
        </div>
      </Card>

      {/* Licence — président et coach uniquement */}
      {isPrivileged && targetUser.license && (
        <Card className="p-5 mb-5">
          <SectionHeader title="Licence" className="mb-0" />
          <div className="mt-3">
            <div className="mb-3">
              <LicenseBadge status={targetUser.license.status} />
            </div>
            <Field label="Numéro"     value={targetUser.license.number} />
            <Field label="Saison"     value="2024–2025" />
            <Field
              label="Expiration"
              value={format(new Date(targetUser.license.expiresAt), 'd MMMM yyyy', { locale: fr })}
            />
          </div>
          {targetUser.documents?.license?.uploaded && targetUser.documents?.license?.url && (
            <a
              href={targetUser.documents.license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 px-3 py-2 bg-brand-50 text-brand-700
                         rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors w-fit"
            >
              <FileText size={14} /> Voir le document
            </a>
          )}
        </Card>
      )}

      {/* Documents — président et coach uniquement */}
      {isPrivileged && targetUser.documents && (
        <Card className="p-5 mb-5">
          <SectionHeader title="Documents" className="mb-0" />
          <div className="mt-3">
            <DocItem label="Licence PDF"        uploaded={targetUser.documents.license?.uploaded}     url={targetUser.documents.license?.url} />
            <DocItem label="Certificat médical" uploaded={targetUser.documents.medicalCert?.uploaded} url={targetUser.documents.medicalCert?.url} />
            <DocItem label="Photo d'identité"   uploaded={targetUser.documents.photo?.uploaded}       url={targetUser.documents.photo?.url} />
          </div>
        </Card>
      )}

      {/* Stats — si joueur */}
      {targetUser.role === 'player' && targetUser.stats && (
        <Card className="p-5 mb-5">
          <SectionHeader title="Statistiques saison" className="mb-0" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: 'Buts',    value: targetUser.stats.goals },
              { label: 'Passes',  value: targetUser.stats.assists },
              { label: 'Matchs',  value: targetUser.stats.matches },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-surface-50 rounded-xl">
                <p className="font-display font-bold text-2xl text-surface-900">{s.value}</p>
                <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {(targetUser.stats.yellowCards > 0 || targetUser.stats.redCards > 0) && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-surface-100">
              {targetUser.stats.yellowCards > 0 && (
                <span className="text-xs text-surface-500">
                  🟨 {targetUser.stats.yellowCards} carton{targetUser.stats.yellowCards > 1 ? 's' : ''} jaune
                </span>
              )}
              {targetUser.stats.redCards > 0 && (
                <span className="text-xs text-surface-500">
                  🟥 {targetUser.stats.redCards} carton{targetUser.stats.redCards > 1 ? 's' : ''} rouge
                </span>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Historique des équipes — joueurs uniquement */}
      {targetUser.role === 'player' && playerHistory.length > 0 && (
        <Card className="p-5 mb-5">
          <SectionHeader title="Historique des équipes" className="mb-0" />
          <div className="mt-3 space-y-0 divide-y divide-surface-100">
            {playerHistory.map((entry, i) => {
              const teamName  = entry.teams?.name     ?? 'Équipe inconnue'
              const teamCat   = entry.teams?.category ?? null
              const clubName  = entry.clubs?.name     ?? null
              return (
                <div key={i} className="flex items-start justify-between py-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-surface-900">{teamName}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {teamCat && (
                        <span className="text-xs bg-surface-100 text-surface-600
                                         px-2 py-0.5 rounded-lg font-medium">
                          {teamCat}
                        </span>
                      )}
                      {clubName && (
                        <span className="text-xs text-surface-400">{clubName}</span>
                      )}
                      {entry.season && (
                        <span className="text-xs text-surface-400">Saison {entry.season}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-surface-400 flex-shrink-0 ml-4">
                    <div>{entry.joined_at ? format(new Date(entry.joined_at), 'MMM yyyy', { locale: fr }) : '—'}</div>
                    {entry.left_at ? (
                      <div>→ {format(new Date(entry.left_at), 'MMM yyyy', { locale: fr })}</div>
                    ) : (
                      <span className="text-emerald-600 font-medium">Actuel</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Historique des appartenances */}
      {memberships.length > 0 && (
        <Card className="p-5">
          <SectionHeader title="Historique" className="mb-0" />
          <div className="mt-3 space-y-3">
            {memberships.map(m => (
              <div key={m.id} className="flex items-start justify-between
                                         py-3 border-b border-surface-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-surface-900">{m.club_name}</div>
                  {m.team_name && (
                    <div className="text-sm text-surface-500 mt-0.5">{m.team_name}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <RoleBadge role={m.role_type} />
                    {m.season && (
                      <span className="text-xs text-surface-400">Saison {m.season}</span>
                    )}
                    {m.leave_reason === 'club_deleted' && (
                      <span className="text-xs text-orange-600 bg-orange-50
                                       px-2 py-0.5 rounded-lg font-medium">
                        Club dissous
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-surface-400 flex-shrink-0 ml-4">
                  <div>{format(new Date(m.joined_at), 'MMM yyyy', { locale: fr })}</div>
                  {m.left_at ? (
                    <div>→ {format(new Date(m.left_at), 'MMM yyyy', { locale: fr })}</div>
                  ) : (
                    <span className="text-emerald-600 font-medium">Actuel</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
