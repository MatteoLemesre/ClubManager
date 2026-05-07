import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as db from '../../services/db'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

const INPUT = `w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm
               text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
               focus:ring-brand-300 focus:border-brand-400 transition-all`

const LABEL = `block text-sm font-medium text-gray-700 mb-1.5`

export default function RegisterPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [birthDate,   setBirthDate]   = useState('')
  const [birthPlace,  setBirthPlace]  = useState('')
  const [phone,       setPhone]       = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,       setError]       = useState(null)
  const [loading,     setLoading]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPwd) return setError('Les mots de passe ne correspondent pas')
    if (password.length < 8)     return setError('Mot de passe trop court (8 caractères minimum)')

    setLoading(true)
    try {
      const existing = await db.getUserByEmail(email)
      if (existing) throw new Error('Cet email est déjà utilisé')

      const user = await db.createUser({
        email:           email.toLowerCase().trim(),
        password_hash:   db.hashPassword(password),
        first_name:      firstName.trim(),
        last_name:       lastName.trim(),
        birth_date:      birthDate || null,
        phone:           phone.trim()      || null,
        birth_place:     birthPlace.trim() || null,
        account_status:  'active',
        current_club_id: null,
      })

      db.setSession(user.id)
      await login(email, password)
      navigate('/app/profile?welcome=true')

    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
            Créer un compte
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Renseignez votre profil. Vous choisirez votre club ensuite.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>
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
                <label className={LABEL}>
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
              <label className={LABEL}>
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

            {/* Lieu de naissance + Téléphone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Lieu de naissance</label>
                <input
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="Paris (75)"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="06 xx xx xx xx"
                  className={INPUT}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={LABEL}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                autoComplete="email"
                className={INPUT}
              />
            </div>

            {/* Mot de passe + Confirmation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="8 caractères min."
                    autoComplete="new-password"
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
                <label className={LABEL}>
                  Confirmer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="Répéter"
                    autoComplete="new-password"
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

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Étapes */}
        <div className="mt-8 flex items-start gap-6 justify-center px-4">
          {[
            { n: '1', title: 'Créer le compte',  active: true  },
            { n: '2', title: 'Rejoindre un club', active: false },
            { n: '3', title: 'Accéder au club',   active: false },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-brand-800 -ml-2 mr-0" />}
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  s.active
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-800 text-brand-400'
                }`}>
                  {s.n}
                </div>
                <span className={`text-xs ${s.active ? 'text-white' : 'text-brand-500'}`}>
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
