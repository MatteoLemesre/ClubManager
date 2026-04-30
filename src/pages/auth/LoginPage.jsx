import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app/events')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Panneau gauche ───────────────────── */}
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
            Gérez votre club en toute simplicité
          </h2>
          <p className="text-brand-300 text-sm leading-relaxed">
            Matchs, entraînements, licences, messagerie — tout ce dont votre club a besoin,
            réuni en un seul endroit.
          </p>
        </div>

        <p className="text-brand-500 text-xs">ClubManager · Gestion sportive</p>
      </div>

      {/* ── Panneau droit ────────────────── */}
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl
                           text-sm text-gray-900 placeholder-gray-400 focus:outline-none
                           focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
            <p>
              Pas encore membre ?{' '}
              <Link to="/register/member" className="text-brand-600 hover:underline font-medium">
                Rejoindre un club
              </Link>
            </p>
            <p>
              Vous êtes un club ?{' '}
              <Link to="/register/club" className="text-brand-600 hover:underline font-medium">
                Inscrire votre club
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
