import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui'
import * as db from '../../services/db'
import { Search, ChevronRight, X, ArrowRight, Clock, Zap } from 'lucide-react'

const ROLES = [
  {
    value:   'player',
    label:   '⚽ Joueur',
    desc:    'Validé par le coach de votre équipe',
    badge:   'pending',
  },
  {
    value:   'coach',
    label:   '📋 Coach',
    desc:    'Validé par le président du club',
    badge:   'pending',
  },
  {
    value:   'president',
    label:   '🏆 Président',
    desc:    'Validé par un président existant',
    badge:   'pending',
  },
  {
    value:   'supporter',
    label:   '🎉 Supporter',
    desc:    'Accès immédiat sans validation',
    badge:   'instant',
  },
]

// ─── Confirmation en attente ───────────────────────────────────────────────
function PendingConfirmation({ role, clubName, onBack }) {
  const navigate  = useNavigate()
  const messages  = {
    coach:     `Votre demande a été envoyée au président de ${clubName}.`,
    player:    `Votre demande a été envoyée au coach de l'équipe.`,
    president: `Votre demande a été envoyée aux présidents de ${clubName}.`,
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-display text-2xl font-bold mb-3">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">{messages[role]}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onBack}
            className="text-sm text-brand-600 hover:underline font-medium"
          >
            Rejoindre un autre club
          </button>
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour à la connexion
          </Link>
        </div>
      </Card>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────
export default function JoinClubPage() {
  const navigate                          = useNavigate()
  const { currentUser, refreshUser }      = useAuth()

  const [clubs,        setClubs]          = useState([])
  const [selectedClub, setSelectedClub]   = useState(null)
  const [selectedRole, setSelectedRole]   = useState('')
  const [selectedTeam, setSelectedTeam]   = useState('')
  const [teams,        setTeams]          = useState([])
  const [message,      setMessage]        = useState('')
  const [search,       setSearch]         = useState('')
  const [searchMode,   setSearchMode]     = useState('name')
  const [loading,      setLoading]        = useState(false)
  const [clubsLoading, setClubsLoading]   = useState(true)
  const [error,        setError]          = useState('')
  const [done,         setDone]           = useState(false)

  // Charger tous les clubs actifs
  useEffect(() => {
    db.getAllActiveClubs()
      .then(setClubs)
      .catch(() => {})
      .finally(() => setClubsLoading(false))
  }, [])

  // Charger les équipes actives quand un club est sélectionné
  useEffect(() => {
    if (!selectedClub) return
    setTeams([])
    setSelectedTeam('')
    db.getTeamsByClub(selectedClub.id)
      .then(t => setTeams(t.filter(team => team.status === 'active')))
      .catch(() => {})
  }, [selectedClub])

  const filteredClubs = clubs.filter(c => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    if (searchMode === 'name')   return c.name.toLowerCase().includes(q)
    if (searchMode === 'city')   return c.city?.toLowerCase().includes(q)
    if (searchMode === 'region') return (
      c.region?.toLowerCase().includes(q) ||
      c.postal_code?.startsWith(q)
    )
    return false
  })

  const handleSubmit = async () => {
    setError('')
    if (!selectedRole) return setError('Choisissez un rôle')
    if (selectedRole === 'player' && !selectedTeam)
      return setError('Choisissez une équipe')

    setLoading(true)
    try {
      const season = await db.getCurrentSeason(selectedClub.id)

      if (selectedRole === 'supporter') {
        await db.updateUser(currentUser.id, { current_club_id: selectedClub.id })
        await db.createUserRole({
          user_id:    currentUser.id,
          role_type:  'supporter',
          scope_type: 'club',
          scope_id:   selectedClub.id,
        })
        await db.followClub(currentUser.id, selectedClub.id)
        await refreshUser()
        navigate('/app/events')
        return
      }

      // Coach / joueur / président → demande de validation
      await db.createJoinRequest({
        user_id:  currentUser.id,
        club_id:  selectedClub.id,
        role_type: selectedRole,
        team_id:  selectedTeam || null,
        message:  message.trim() || null,
        season,
        status:   'pending',
      })

      await db.notifyForJoinRequest(
        selectedRole,
        selectedClub,
        selectedTeam || null,
        currentUser,
      )

      setDone(true)

    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // ── Confirmation envoyée ─────────────────────────────────────────────────
  if (done) {
    return (
      <PendingConfirmation
        role={selectedRole}
        clubName={selectedClub?.name}
        onBack={() => {
          setDone(false)
          setSelectedClub(null)
          setSelectedRole('')
          setSelectedTeam('')
          setMessage('')
          setSearch('')
        }}
      />
    )
  }

  const userName = `${currentUser?.first_name ?? currentUser?.firstName ?? ''} ${currentUser?.last_name ?? currentUser?.lastName ?? ''}`.trim()

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-brand-600 mb-4">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
              <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
              <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Rejoindre un club
          </h1>
          {userName && (
            <p className="text-sm text-gray-500">Connecté en tant que <strong>{userName}</strong></p>
          )}
        </div>

        <Card className="p-6">

          {/* ── Étape 1 : Recherche club ────────────────────────────────── */}
          {!selectedClub ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rechercher votre club
              </p>

              {/* Sélecteur de mode */}
              <div className="flex gap-2">
                {[
                  { id: 'name',   label: 'Nom' },
                  { id: 'city',   label: 'Ville' },
                  { id: 'region', label: 'Région / Dép.' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => { setSearchMode(mode.id); setSearch('') }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      searchMode === mode.id
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-600 border-surface-200 hover:border-surface-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Champ de recherche */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={
                    searchMode === 'name'   ? 'Nom du club…' :
                    searchMode === 'city'   ? 'Ville…' :
                    'Région ou code postal…'
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-50 border border-surface-200
                             rounded-xl text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-300 focus:border-brand-400 transition-all"
                />
              </div>

              {clubsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600
                                  rounded-full animate-spin" />
                </div>
              ) : filteredClubs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {search ? 'Aucun club trouvé' : 'Aucun club inscrit pour le moment'}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filteredClubs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClub(c)}
                      className="w-full text-left p-4 rounded-2xl border border-surface-200
                                 hover:border-brand-300 hover:bg-brand-50 transition-all
                                 flex items-start justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {c.sports?.name}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-3">
                        {c.city && <div>{c.city}</div>}
                        {(c.department || c.region) && (
                          <div>{c.department && `${c.department} — `}{c.region}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          ) : (

            /* ── Étape 2 : Rôle + équipe ──────────────────────────────── */
            <div className="space-y-5">

              {/* Club sélectionné */}
              <div className="flex items-center justify-between p-3 bg-brand-50
                              rounded-xl border border-brand-200">
                <div>
                  <div className="font-semibold text-sm text-brand-900">{selectedClub.name}</div>
                  <div className="text-xs text-brand-600 mt-0.5">
                    {selectedClub.sports?.name}
                    {selectedClub.city ? ` · ${selectedClub.city}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedClub(null); setSelectedRole(''); setError('') }}
                  className="flex items-center gap-1 text-xs text-brand-500
                             hover:text-brand-700 transition-colors"
                >
                  <X size={13} /> Changer
                </button>
              </div>

              {/* Choix du rôle */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Votre rôle
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      onClick={() => { setSelectedRole(r.value); setSelectedTeam(''); setError('') }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === r.value
                          ? 'bg-brand-50 border-brand-400'
                          : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {r.badge === 'instant'
                          ? <Zap size={10} className="text-emerald-500 flex-shrink-0" />
                          : <Clock size={10} className="text-amber-500 flex-shrink-0" />
                        }
                        <span className="text-xs text-gray-400 leading-snug">{r.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Équipe — joueur obligatoire, coach optionnel */}
              {(selectedRole === 'player' || selectedRole === 'coach') && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {selectedRole === 'player' ? 'Équipe souhaitée *' : 'Équipe (optionnel)'}
                  </p>
                  {teams.length === 0 ? (
                    <div className="text-sm text-gray-400 p-3 bg-surface-50 rounded-xl">
                      Aucune équipe active dans ce club.
                      {selectedRole === 'coach' && (
                        <span className="block mt-0.5 text-xs">
                          Vous pourrez en proposer une une fois votre demande validée.
                        </span>
                      )}
                    </div>
                  ) : (
                    <select
                      value={selectedTeam}
                      onChange={e => setSelectedTeam(e.target.value)}
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl
                                 px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                                 focus:ring-brand-300 focus:border-brand-400 transition-all"
                    >
                      <option value="">Choisir une équipe…</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}{t.category ? ` — ${t.category}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Message optionnel */}
              {selectedRole && selectedRole !== 'supporter' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Message <span className="font-normal normal-case">(optionnel)</span>
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Présentez-vous brièvement…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl
                               px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2
                               focus:ring-brand-300 focus:border-brand-400 transition-all"
                  />
                </div>
              )}

              {/* Bandeau info validation */}
              {selectedRole && (
                <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                  selectedRole === 'supporter'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {selectedRole === 'supporter'
                    ? <Zap size={15} className="flex-shrink-0 mt-0.5" />
                    : <Clock size={15} className="flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <span className="font-semibold">
                      {selectedRole === 'supporter' ? 'Accès immédiat' :
                       selectedRole === 'player'    ? 'Validation par le coach' :
                       selectedRole === 'coach'     ? 'Validation par le président' :
                                                      'Validation par un président'}
                    </span>
                    <span className="block text-xs mt-0.5 opacity-80">
                      {selectedRole === 'supporter'
                        ? 'Votre compte sera activé instantanément.'
                        : 'Vous recevrez une notification dès validation de votre demande.'}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                                rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !selectedRole}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium
                           rounded-xl text-sm transition-colors flex items-center justify-center
                           gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                                  rounded-full animate-spin" />
                ) : (
                  <>
                    {selectedRole === 'supporter' ? 'Rejoindre' : 'Envoyer la demande'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
