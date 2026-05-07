import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function NoClubPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">🏟️</div>
        <h1 className="font-display text-2xl font-bold mb-3">
          Votre club n'est plus actif
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Le club auquel vous étiez rattaché a été supprimé.
          Votre compte est intact — vous pouvez rejoindre un autre club.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/register/member')}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl
                       px-4 py-2 text-sm font-medium justify-center"
          >
            Rejoindre un autre club
          </button>
          <button
            onClick={() => navigate('/app/profile')}
            className="hover:bg-surface-100 text-gray-600 rounded-xl
                       px-3 py-2 text-sm justify-center"
          >
            Voir mon profil et historique
          </button>
        </div>
      </Card>
    </div>
  )
}
