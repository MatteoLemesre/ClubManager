import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as db from '../../services/db'
import { supabase } from '../../lib/supabase'
import { Search, ChevronLeft, ChevronRight, Zap, Clock } from 'lucide-react'

const STEPS = ['Votre club', 'Vos infos', 'Votre rôle']

const ROLE_OPTIONS = [
  { id: 'player',    label: 'Joueur',    desc: 'Je joue dans une équipe du club' },
  { id: 'coach',     label: 'Coach',     desc: "J'encadre une ou plusieurs équipes" },
  { id: 'supporter', label: 'Supporter', desc: 'Je suis le club en tant que spectateur' },
]

const VALIDATION_INFO = {
  supporter: { icon: Zap,   color: 'emerald', title: 'Accès immédiat',             desc: 'Compte créé instantanément, pas de validation requise.' },
  coach:     { icon: Clock, color: 'amber',   title: 'Validation président',        desc: 'Le président reçoit une notification pour valider votre inscription.' },
  player:    { icon: Clock, color: 'amber',   title: 'Validation coach',            desc: 'Le coach de votre équipe reçoit une notification pour vous valider.' },
}

export default function RegisterMemberPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(0)

  // Étape 1
  const [clubs,        setClubs]        = useState([])
  const [search,       setSearch]       = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [clubsLoading, setClubsLoading] = useState(true)

  // Étape 2
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [birthDate,       setBirthDate]       = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Étape 3
  const [role,           setRole]           = useState('player')
  const [teams,          setTeams]          = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState('')

  // User existant sans club actif (réinscription)
  const [returningUser,   setReturningUser]   = useState(null)
  const [emailChecking,   setEmailChecking]   = useState(false)

  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    db.getClubs()
      .then(setClubs)
      .catch(() => {})
      .finally(() => setClubsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedClub) return
    db.getTeamsByClub(selectedClub.id).then(setTeams).catch(() => setTeams([]))
  }, [selectedClub])

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  // Vérifie l'email dès que l'user quitte le champ
  const checkEmail = async () => {
    if (!email || !email.includes('@')) return
    setEmailChecking(true)
    setError(null)
    try {
      const existing = await db.getUserByEmail(email)
      if (existing) {
        if (existing.current_club_id) {
          setError('Cet email est déjà associé à un compte actif dans un autre club.')
        } else {
          // User existant sans club → réinscription
          setReturningUser(existing)
          setFirstName(existing.first_name ?? '')
          setLastName(existing.last_name  ?? '')
          setBirthDate(existing.birth_date ?? '')
          setPhone(existing.phone ?? '')
        }
      } else {
        setReturningUser(null)
      }
    } catch {}
    setEmailChecking(false)
  }

  const goNext = (e) => {
    e.preventDefault()
    setError(null)
    if (step === 1) {
      if (!returningUser) {
        if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas')
        if (password.length < 8)          return setError('Mot de passe trop court (8 caractères minimum)')
      }
      // Bloquer si email appartient à un club actif (erreur déjà affichée par checkEmail)
      if (error) return
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if ((role === 'player' || role === 'coach') && !selectedTeamId) {
      return setError('Veuillez sélectionner une équipe')
    }

    setLoading(true)
    try {
      // ── Réinscription : user existant sans club actif ─────────────
      if (returningUser) {
        const token = crypto.randomUUID()
        const request = await db.createRequest({
          club_id:          selectedClub.id,
          first_name:       returningUser.first_name,
          last_name:        returningUser.last_name,
          email:            returningUser.email,
          role_type:        role,
          team_id:          selectedTeamId || null,
          password_hash:    returningUser.password_hash,
          status:           'pending',
          token,
          is_returning:     true,
          existing_user_id: returningUser.id,
        })

        if (role === 'coach') {
          const clubUsers = await db.getUsersByClub(selectedClub.id)
          const president = clubUsers.find(u =>
            (u.user_roles ?? []).some(r => r.role_type === 'president')
          )
          if (president) {
            await db.createNotification({
              to_user_id: president.id,
              type:       'registration_request',
              title:      'Nouvelle demande de coach',
              body:       `${returningUser.first_name} ${returningUser.last_name} souhaite rejoindre comme coach.`,
              request_id: request.id,
            })
          }
        }

        if (role === 'player' && selectedTeamId) {
          const { data: coaches } = await supabase
            .from('team_coaches')
            .select('user_id')
            .eq('team_id', selectedTeamId)
          for (const { user_id } of coaches ?? []) {
            await db.createNotification({
              to_user_id: user_id,
              type:       'registration_request',
              title:      'Nouvelle demande de joueur',
              body:       `${returningUser.first_name} ${returningUser.last_name} souhaite rejoindre votre équipe.`,
              request_id: request.id,
            })
          }
        }

        navigate('/register/pending')
        return
      }

      // ── Nouveau user ───────────────────────────────────────────────
      const existing = await db.getUserByEmail(email)
      if (existing) { setError('Cet email est déjà utilisé'); setLoading(false); return }

      if (role === 'supporter') {
        const user = await db.createUser({
          email:           email.toLowerCase().trim(),
          password_hash:   db.hashPassword(password),
          first_name:      firstName,
          last_name:       lastName,
          birth_date:      birthDate || null,
          phone:           phone || null,
          account_status:  'active',
          current_club_id: selectedClub.id,
        })
        await db.createUserRole({
          user_id:    user.id,
          role_type:  'supporter',
          scope_type: 'club',
          scope_id:   selectedClub.id,
        })
        await login(email, password)
        navigate('/app/events')

      } else {
        const token = crypto.randomUUID()

        const request = await db.createRequest({
          club_id: selectedClub.id,
          first_name: firstName, last_name: lastName,
          birth_date: birthDate,
          email: email.toLowerCase().trim(),
          phone,
          role_type: role,
          team_id: selectedTeamId || null,
          password_hash: db.hashPassword(password),
          status: 'pending',
          token,
        })

        if (role === 'coach') {
          const clubUsers = await db.getUsersByClub(selectedClub.id)
          const president = clubUsers.find(u =>
            (u.user_roles ?? []).some(r => r.role_type === 'president')
          )
          if (president) {
            await db.createNotification({
              to_user_id: president.id,
              type: 'registration_request',
              title: 'Nouvelle demande de coach',
              body: `${firstName} ${lastName} souhaite rejoindre comme coach.`,
              request_id: request.id,
            })
          }
        }

        if (role === 'player' && selectedTeamId) {
          const { data: coaches } = await supabase
            .from('team_coaches')
            .select('user_id')
            .eq('team_id', selectedTeamId)

          for (const { user_id } of coaches ?? []) {
            await db.createNotification({
              to_user_id: user_id,
              type: 'registration_request',
              title: 'Nouvelle demande de joueur',
              body: `${firstName} ${lastName} souhaite rejoindre votre équipe.`,
              request_id: request.id,
            })
          }
        }

        navigate('/register/pending')
      }
    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="text-2xl font-display font-bold text-gray-900 mb-1">Rejoindre un club</div>
          <p className="text-sm text-gray-500">Créez votre compte membre</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                ${i <= step ? 'bg-brand-600 text-white' : 'bg-surface-200 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-brand-600' : 'bg-surface-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">

          {/* ── Étape 1 : Choisir son club ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Rechercher votre club
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nom du club ou ville…"
                  className="w-full pl-9 pr-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm"
                />
              </div>

              {clubsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
              ) : filteredClubs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  {search ? 'Aucun club trouvé' : 'Aucun club inscrit pour le moment'}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {filteredClubs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedClub(c); setSelectedTeamId(''); setStep(1) }}
                      className="w-full text-left p-4 rounded-xl border border-surface-200 hover:border-brand-200 hover:bg-surface-50 transition-all"
                    >
                      <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {c.sports?.name ?? ''}{c.city ? ` · ${c.city}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-sm text-gray-500 pt-2">
                Déjà inscrit ?{' '}
                <Link to="/login" className="text-brand-600 hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          )}

          {/* ── Étape 2 : Informations personnelles ── */}
          {step === 1 && (
            <form onSubmit={goNext} className="space-y-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Vos informations — {selectedClub?.name}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setReturningUser(null); setError(null) }}
                    onBlur={checkEmail}
                    placeholder="vous@exemple.fr"
                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2
                                    w-4 h-4 border-2 border-brand-200 border-t-brand-600
                                    rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {returningUser && (
                <div className="flex items-start gap-3 p-4 rounded-xl border
                                border-blue-200 bg-blue-50 text-blue-800">
                  <span className="text-lg leading-none">👋</span>
                  <div>
                    <div className="font-semibold text-sm">Compte existant trouvé</div>
                    <div className="text-xs mt-0.5 opacity-80">
                      Vos informations ont été pré-remplies. Vous n'avez pas besoin
                      de créer un nouveau mot de passe — votre mot de passe actuel
                      sera conservé.
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              {!returningUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="8 caractères min."
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Répéter"
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-surface-100 text-sm text-gray-600"
                >
                  <ChevronLeft size={15} /> Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl px-4 py-2 text-sm"
                >
                  Continuer <ChevronRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* ── Étape 3 : Rôle ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Votre fonction dans le club
              </div>

              {returningUser && (
                <div className="flex items-start gap-3 p-3 rounded-xl border
                                border-blue-200 bg-blue-50 text-blue-800 text-xs mb-2">
                  <span>👋</span>
                  <span>
                    Réinscription de{' '}
                    <strong>
                      {returningUser.first_name} {returningUser.last_name}
                    </strong>
                    {' '}dans <strong>{selectedClub?.name}</strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRole(r.id); setSelectedTeamId('') }}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${role === r.id
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-surface-200 hover:border-brand-200 hover:bg-surface-50'}`}
                  >
                    <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug">{r.desc}</div>
                  </button>
                ))}
              </div>

              {(role === 'player' || role === 'coach') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipe <span className="text-red-500">*</span>
                  </label>
                  {teams.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      Aucune équipe créée dans ce club pour le moment.
                    </p>
                  ) : (
                    <select
                      required
                      value={selectedTeamId}
                      onChange={e => setSelectedTeamId(e.target.value)}
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                    >
                      <option value="">Sélectionner une équipe…</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
              )}

              {(() => {
                const info = VALIDATION_INFO[role]
                const Icon = info.icon
                const colors = {
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                  amber:   'bg-amber-50 border-amber-200 text-amber-800',
                }
                return (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${colors[info.color]}`}>
                    <Icon size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{info.title}</div>
                      <div className="text-xs mt-0.5 opacity-80">{info.desc}</div>
                    </div>
                  </div>
                )
              })()}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-surface-100 text-sm text-gray-600"
                >
                  <ChevronLeft size={15} /> Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2 text-sm"
                >
                  {loading ? 'Envoi…' : role === 'supporter' ? 'Créer mon compte' : 'Envoyer ma demande'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
