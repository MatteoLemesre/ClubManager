import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as db from '../../services/db'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

const INPUT = `w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm
               text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
               focus:ring-brand-300 focus:border-brand-400 transition-all`

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [birthDate,    setBirthDate]    = useState('')
  const [phone,        setPhone]        = useState('')
  const [birthPlace,   setBirthPlace]   = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPwd,   setConfirmPwd]   = useState('')
  const [showPwd,      setShowPwd]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPwd)  return setError('Les mots de passe ne correspondent pas')
    if (password.length < 8)      return setError('Mot de passe trop court (8 caractères minimum)')

    setLoading(true)
    try {
      const existing = await db.getUserByEmail(email)
      if (existing) throw new Error('Cet email est déjà utilisé')

      await db.createUser({
        email:          email.toLowerCase().trim(),
        password_hash:  db.hashPassword(password),
        first_name:     firstName.trim(),
        last_name:      lastName.trim(),
        birth_date:     birthDate,
        phone:          phone.trim()      || null,
        birth_place:    birthPlace.trim() || null,
        account_status: 'active',
        current_club_id: null,
      })

      // Connexion automatique
      await login(email, password)
      navigate('/join-club')

    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Panneau gauche ─────────────────────────────────────── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-brand-950 flex-col
                      justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
              <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
              <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-xl">ClubManager</span>
        </div>

        <div>
          <h2 className="font-display font-bold text-3xl text-white leading-snug mb-4">
            Votre profil, d'abord.
          </h2>
          <p className="text-brand-300 text-sm leading-relaxed mb-10">
            Créez votre compte une fois, rejoignez autant de clubs que vous voulez.
            Votre profil vous appartient.
          </p>

          <div className="space-y-5">
            {[
              { n: '1', title: 'Créer votre compte',    desc: 'Profil complet, indépendant de tout club.' },
              { n: '2', title: 'Rejoindre un club',     desc: 'Choisissez votre club et votre rôle.' },
              { n: '3', title: 'Accéder au club',       desc: 'Immédiat pour supporter, validé sinon.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-600/40 flex items-center justify-center
                                text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{s.title}</p>
                  <p className="text-brand-400 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-500 text-xs">ClubManager · Gestion sportive</p>
      </div>

      {/* ── Panneau droit ──────────────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-16 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900">ClubManager</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm mb-8">
            Renseignez votre profil complet. Vous choisirez votre club ensuite.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Nom"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className={INPUT}
              />
            </div>

            {/* Téléphone + Lieu de naissance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 xx xx xx xx"
                  className={INPUT}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lieu de naissance
                </label>
                <input
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="Paris (75)"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className={INPUT}
              />
            </div>

            {/* Mot de passe + Confirmation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8 caractères min."
                    className={INPUT + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="Répéter"
                    className={INPUT + ' pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                              rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium
                         rounded-xl text-sm transition-colors flex items-center justify-center
                         gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                                rounded-full animate-spin" />
              ) : (
                <>Créer mon compte <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
