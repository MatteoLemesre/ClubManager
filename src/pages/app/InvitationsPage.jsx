import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import InvitationCard from '../../components/InvitationCard'

export default function InvitationsPage() {
  const navigate = useNavigate()
  const { currentUser, invitations, acceptInvitation, rejectInvitation } = useAuth()

  const pending = (invitations ?? []).filter(
    inv => inv.invitedUserId === currentUser.id && inv.status === 'pending'
  )
  const history = (invitations ?? []).filter(
    inv => inv.invitedUserId === currentUser.id && inv.status !== 'pending'
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Invitations</h1>
        <p className="text-sm text-gray-500">
          Invitations reçues pour rejoindre des clubs.
        </p>
      </div>

      {/* Invitations en attente */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-gray-900">En attente</h2>
          {pending.length > 0 && (
            <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-surface-50 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-2">✉️</div>
            <div className="text-sm text-gray-500">Aucune invitation en attente</div>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(inv => (
              <InvitationCard
                key={inv.id}
                invitation={inv}
                onAccept={acceptInvitation}
                onReject={rejectInvitation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Historique</h2>
          <div className="space-y-2">
            {history.map(inv => (
              <div key={inv.id}
                className="bg-white rounded-xl border border-surface-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{inv.clubEmoji ?? '🏆'}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{inv.clubName}</div>
                    <div className="text-xs text-gray-500">
                      {inv.role === 'president' ? 'Président'
                        : inv.role === 'staff'  ? 'Intendant'
                        : inv.role === 'coach'  ? 'Coach'
                        : 'Joueur'}
                      {inv.category ? ` · ${inv.category}` : ''}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  inv.status === 'accepted'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {inv.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
