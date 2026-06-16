import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const ROLE_LABELS = {
  president: 'Président',
  staff:     'Intendant',
  coach:     'Coach',
  player:    'Joueur',
}

const ROLE_COLORS = {
  president: 'bg-purple-100 text-purple-700',
  staff:     'bg-blue-100 text-blue-700',
  coach:     'bg-orange-100 text-orange-700',
  player:    'bg-emerald-100 text-emerald-700',
}

export default function InvitationCard({ invitation, onAccept, onReject }) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try { await onAccept(invitation.id) }
    finally { setLoading(false) }
  }

  const handleReject = async () => {
    setLoading(true)
    try { await onReject(invitation.id) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-4 shadow-sm">
      {/* En-tête club */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
            {invitation.clubEmoji ?? '🏆'}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{invitation.clubName}</div>
            <div className="text-xs text-gray-500">{invitation.sportLabel ?? invitation.sport}</div>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${ROLE_COLORS[invitation.role] ?? 'bg-gray-100 text-gray-700'}`}>
          {ROLE_LABELS[invitation.role] ?? invitation.role}
        </span>
      </div>

      {/* Détails */}
      <div className="bg-surface-50 rounded-xl px-3 py-2.5 mb-3 space-y-1">
        {invitation.category && (
          <div className="text-xs text-gray-600">
            <span className="text-gray-400">Catégorie :</span> {invitation.category}
          </div>
        )}
        <div className="text-xs text-gray-600">
          <span className="text-gray-400">Invité par :</span> {invitation.invitingUserName}
        </div>
        <div className="text-xs text-gray-400">
          {format(new Date(invitation.createdAt), "d MMM yyyy", { locale: fr })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex-1 py-2 rounded-xl text-sm font-medium border border-surface-200
                     text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200
                     transition-colors disabled:opacity-50"
        >
          Refuser
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white
                     hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center
                     justify-center gap-1.5"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Accepter'
          )}
        </button>
      </div>
    </div>
  )
}
