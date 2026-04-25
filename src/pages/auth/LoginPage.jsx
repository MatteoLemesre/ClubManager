import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USERS, CLUB } from '../../data/mock'
import { Avatar, RoleBadge } from '../../components/ui'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { switchUser } = useAuth()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Mock : login en tant que président par défaut
    setTimeout(() => {
      switchUser('user-1')
      navigate('/app/events')
    }, 600)
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Panneau gauche — bg-brand-950 ───────────────────── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-brand-950 flex-col
                      justify-between p-12">
        {/* Logo */}
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

        {/* Tagline centrale */}
        <div>
          <h2 className="font-display font-bold text-3xl text-white leading-snug mb-4">
            Gérez votre club en toute simplicité
          </h2>
          <p className="text-brand-300 text-sm leading-relaxed">
            Matchs, entraînements, licences, messagerie — tout ce dont votre club a besoin,
            réuni en un seul endroit.
          </p>

          {/* Stats club */}
          <div className="flex gap-8 mt-10">
            {[
              { value: '4',  label: 'Équipes' },
              { value: '9',  label: 'Membres' },
              { value: '3',  label: 'Matchs' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                <p className="text-xs text-brand-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nom du club */}
        <p className="text-brand-500 text-xs">{CLUB.name} · {CLUB.sport} · {CLUB.city}</p>
      </div>

      {/* ── Panneau droit — formulaire blanc ────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900">ClubManager</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm mb-8">Accédez à votre espace club</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                required
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl
                           text-sm text-gray-900 placeholder-gray-400 focus:outline-none
                           focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 bg-surface-50 border border-surface-200
                             rounded-xl text-sm text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-brand-300
                             focus:border-brand-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
                <>Se connecter <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-500 text-center">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              S'inscrire
            </Link>
          </p>

          {/* Connexion rapide dev */}
          <details className="mt-6 border border-surface-200 rounded-xl p-3">
            <summary className="text-xs text-gray-400 cursor-pointer select-none">
              Connexion rapide (dev)
            </summary>
            <div className="mt-3 flex flex-col gap-1">
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => { switchUser(u.id); navigate('/app/events') }}
                  className="text-left px-3 py-2 rounded-xl hover:bg-surface-100
                             flex items-center gap-2 text-sm transition-colors"
                >
                  <Avatar user={u} size="sm" />
                  <span className="flex-1 font-medium text-gray-800">
                    {u.firstName} {u.lastName}
                  </span>
                  <RoleBadge role={u.role} />
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
