import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function HomePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) navigate('/app/events')
  }, [currentUser])

  return (
    <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white" stroke="white" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
            <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
            <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
            <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">ClubManager</h1>
        <p className="text-brand-300 text-lg">Gérez votre club sportif simplement</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-white text-brand-950 font-semibold rounded-xl hover:bg-brand-50"
        >
          Se connecter
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 border border-brand-500"
        >
          Créer un compte
        </button>
      </div>
    </div>
  )
}
