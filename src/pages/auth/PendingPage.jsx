import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <Card className="p-10 max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-display text-2xl font-bold mb-3">Demande envoyée !</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Votre demande est en cours de traitement.
          Vous serez notifié dès qu'elle sera validée par un responsable.
        </p>
        <Link to="/login" className="text-brand-600 text-sm font-medium hover:underline">
          ← Retour à la connexion
        </Link>
      </Card>
    </div>
  )
}
