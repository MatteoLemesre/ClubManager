import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Trophy, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { switchUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Mock : login direct en tant que président
    setTimeout(() => {
      switchUser('user-1')
      navigate('/app/events')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Panneau gauche — form */}
      <div className="w-full max-w-md flex flex-col justify-center px-12 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">ClubManager</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Bienvenue 👋</h1>
          <p className="text-surface-400">Connectez-vous à votre espace club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Se connecter <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-sm text-surface-500 text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            S'inscrire
          </Link>
        </p>

        <p className="mt-3 text-sm text-surface-500 text-center">
          Créer un nouveau club ?{' '}
          <Link to="/club-setup" className="text-brand-400 hover:text-brand-300 font-medium">
            Commencer ici
          </Link>
        </p>
      </div>

      {/* Panneau droit — visuel */}
      <div className="hidden lg:flex flex-1 bg-brand-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative text-center text-white max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl mb-4">
            Gérez votre club en toute simplicité
          </h2>
          <p className="text-white/70 leading-relaxed">
            Matchs, entraînements, licences, messages — tout ce dont votre club a besoin, réuni en un seul endroit.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10">
            {[
              { label: 'Équipes', value: '4' },
              { label: 'Membres', value: '9' },
              { label: 'Matchs', value: '3' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-2xl">{s.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
