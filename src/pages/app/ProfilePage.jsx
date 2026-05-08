import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Avatar, Card, LicenseBadge, RoleBadge, EmptyState, SectionHeader } from '../../components/ui'
import { ArrowLeft, FileText, AlertCircle, CheckCircle, ExternalLink, ChevronDown } from 'lucide-react'
import { getMemberships, getPlayerHistory, getClubById, leaveClub, canPresidentLeave, createClub, updateUser, createUserRole, getSports } from '../../services/db'

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
  const { currentUser, refreshUser, is, isOneOf } = useAuth()
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

  // Club actuel
  const [club,            setClub]            = useState(null)
  // Départ de club
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [leaveLoading,     setLeaveLoading]     = useState(false)
  const [leaveError,       setLeaveError]       = useState('')
  const [isLastPresident,  setIsLastPresident]  = useState(false)

  // Création de club
  const [showCreateClub,   setShowCreateClub]   = useState(false)
  const [sports,           setSports]           = useState([])
  const [clubName,         setClubName]         = useState('')
  const [clubSport,        setClubSport]        = useState('')
  const [clubCity,         setClubCity]         = useState('')
  const [clubDept,         setClubDept]         = useState('')
  const [clubRegion,       setClubRegion]       = useState('')
  const [clubEmail,        setClubEmail]        = useState('')
  const [clubPhone,        setClubPhone]        = useState('')
  const [createLoading,    setCreateLoading]    = useState(false)
  const [createError,      setCreateError]      = useState('')

  useEffect(() => {
    if (!targetUser?.id) return
    getMemberships(targetUser.id).then(setMemberships).catch(() => {})
    if (targetUser.role === 'player') {
      getPlayerHistory(targetUser.id).then(setPlayerHistory).catch(() => {})
    }
  }, [targetUser?.id])

  // Charger les infos du club courant
  useEffect(() => {
    if (!currentUser?.current_club_id) { setClub(null); return }
    getClubById(currentUser.current_club_id).then(setClub).catch(() => {})
  }, [currentUser?.current_club_id])

  // Vérifier si le président peut partir
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'president' || !currentUser.current_club_id) return
    canPresidentLeave(currentUser.id, currentUser.current_club_id)
      .then(can => setIsLastPresident(!can))
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    if (!showCreateClub || sports.length > 0) return
    getSports().then(list => setSports(list ?? [])).catch(() => {})
  }, [showCreateClub])

  const handleCreateClub = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)
    try {
      const club = await createClub({
        name:       clubName.trim(),
        sport_id:   clubSport || null,
        city:       clubCity.trim()   || null,
        department: clubDept.trim()   || null,
        region:     clubRegion.trim() || null,
        email:      clubEmail.trim()  || null,
        phone:      clubPhone.trim()  || null,
      })
      await updateUser(currentUser.id, { current_club_id: club.id })
      await createUserRole({
        user_id:    currentUser.id,
        role_type:  'president',
        scope_type: 'club',
        scope_id:   club.id,
      })
      await refreshUser()
      setShowCreateClub(false)
    } catch (err) {
      setCreateError(err.message ?? 'Une erreur est survenue')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleLeaveClub = async () => {
    setLeaveLoading(true)
    setLeaveError('')
    try {
      if (currentUser.role === 'president') {
        const canLeave = await canPresidentLeave(currentUser.id, currentUser.current_club_id)
        if (!canLeave) {
          setLeaveError('Vous devez nommer un autre président avant de partir.')
          return
        }
      }
      await leaveClub(currentUser.id, currentUser.current_club_id)
      await refreshUser()
      setShowLeaveConfirm(false)
      navigate('/app/profile')
    } catch (err) {
      setLeaveError(err.message ?? 'Une erreur est survenue')
    } finally {
      setLeaveLoading(false)
    }
  }

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

      {/* Bannière club — profil personnel uniquement */}
      {isOwnProfile && !currentUser.current_club_id && (
        <div className="mb-6 bg-brand-50 border border-brand-200 rounded-2xl overflow-hidden">
          {!showCreateClub ? (
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-brand-900">Vous n'êtes dans aucun club</div>
                <div className="text-sm text-brand-600 mt-0.5">
                  Rejoignez un club existant depuis l'onglet Équipes, ou créez le vôtre.
                </div>
              </div>
              <button
                onClick={() => setShowCreateClub(true)}
                className="flex-shrink-0 px-3 py-1.5 bg-brand-600 hover:bg-brand-700
                           text-white text-sm font-medium rounded-xl transition-colors"
              >
                Créer mon club
              </button>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-brand-900">Créer mon club</div>
                <button
                  onClick={() => { setShowCreateClub(false); setCreateError('') }}
                  className="text-brand-400 hover:text-brand-700 text-sm"
                >
                  Annuler
                </button>
              </div>
              <form onSubmit={handleCreateClub} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-brand-800 mb-1">
                      Nom du club <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={clubName}
                      onChange={e => setClubName(e.target.value)}
                      placeholder="FC Saint-Denis"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Sport</label>
                    <div className="relative">
                      <select
                        value={clubSport}
                        onChange={e => setClubSport(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                   text-sm appearance-none focus:outline-none focus:ring-2
                                   focus:ring-brand-300 pr-8"
                      >
                        <option value="">— Sport —</option>
                        {sports.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Ville</label>
                    <input
                      value={clubCity}
                      onChange={e => setClubCity(e.target.value)}
                      placeholder="Saint-Denis"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Département</label>
                    <input
                      value={clubDept}
                      onChange={e => setClubDept(e.target.value)}
                      placeholder="93"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Région</label>
                    <input
                      value={clubRegion}
                      onChange={e => setClubRegion(e.target.value)}
                      placeholder="Île-de-France"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Email</label>
                    <input
                      type="email"
                      value={clubEmail}
                      onChange={e => setClubEmail(e.target.value)}
                      placeholder="contact@club.fr"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={clubPhone}
                      onChange={e => setClubPhone(e.target.value)}
                      placeholder="01 xx xx xx xx"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl
                                 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                  </div>
                </div>

                {createError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200
                                  rounded-xl px-3 py-2">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                             font-medium text-sm rounded-xl transition-colors
                             disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Créer le club'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {isOwnProfile && currentUser.current_club_id && (
        <div className="mb-6 p-4 bg-surface-100 border border-surface-200 rounded-2xl
                        flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-gray-900">{club?.name ?? '…'}</div>
            <div className="text-sm text-gray-500 mt-0.5 capitalize">
              {currentUser.role}
              {club?.sports?.name ? ` · ${club.sports.name}` : ''}
              {club?.city ? ` · ${club.city}` : ''}
            </div>
          </div>
          <button
            onClick={() => { setLeaveError(''); setShowLeaveConfirm(true) }}
            className="flex-shrink-0 text-sm text-red-500 hover:text-red-700 hover:bg-red-50
                       px-3 py-1.5 rounded-xl border border-red-200 transition-all"
          >
            Quitter le club
          </button>
        </div>
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

      {/* Modal confirmation départ */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold mb-2">
              Quitter {club?.name} ?
            </h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Vous perdrez immédiatement accès aux informations internes du club.
              Votre historique sera conservé dans votre profil.
              Vous pourrez rejoindre un autre club quand vous le souhaitez.
            </p>

            {/* Avertissement coach seul */}
            {currentUser.role === 'coach' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl
                              text-sm text-orange-700 mb-4">
                ℹ️ Si vous étiez le seul coach d'une équipe, le président sera assigné
                comme responsable jusqu'à la nomination d'un nouveau coach.
              </div>
            )}

            {/* Blocage président seul */}
            {isLastPresident && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                              text-sm text-red-700 mb-4">
                ⚠️ Vous êtes le seul président de ce club.
                Nommez un autre président avant de partir.
              </div>
            )}

            {leaveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl
                              text-sm text-red-700 mb-4">
                {leaveError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 px-4 bg-surface-100 hover:bg-surface-200 text-gray-700
                           text-sm font-medium rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                disabled={isLastPresident || leaveLoading}
                onClick={handleLeaveClub}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-40
                           text-white text-sm font-medium rounded-xl transition-all
                           flex items-center justify-center gap-2"
              >
                {leaveLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Confirmer le départ'
                }
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
