import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { canInvite, getInvitableRoles, isValidEmail, ROLE_LABELS_INV } from '../utils/permissions'

const CATEGORIES = ['Séniors', 'U21', 'U19', 'U17', 'U15', 'U13', 'U11', 'U9', 'Vétérans', 'Féminine']

const inputCls = 'w-full px-3 py-2 border border-surface-200 rounded-xl text-sm text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'

export default function InviteMemberForm({ clubId, clubName, clubSport, clubEmoji, onInviteSent }) {
  const { currentUser, sendInvitation } = useAuth()
  const [email,    setEmail]    = useState('')
  const [role,     setRole]     = useState('')
  const [category, setCategory] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // Rôle de l'inviteur dans ce club
  const inviterRoleInClub = (currentUser.roles ?? []).find(r => r.club_id === clubId)?.role
    ?? currentUser.role
  const invitableRoles = getInvitableRoles(inviterRoleInClub)

  const needsCategory = role === 'coach' || role === 'player'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) {
      setError('Adresse email invalide.')
      return
    }
    if (!role) {
      setError('Veuillez choisir un rôle.')
      return
    }
    if (!canInvite(inviterRoleInClub, role)) {
      setError("Vous n'avez pas la permission d'inviter ce rôle.")
      return
    }

    setLoading(true)
    try {
      await sendInvitation({
        clubId,
        clubName,
        sport: clubSport ?? 'football',
        sportLabel: clubSport ?? 'Football',
        clubEmoji: clubEmoji ?? '🏆',
        invitedUserEmail: email.trim().toLowerCase(),
        role,
        category: needsCategory ? category : null,
        invitingUserId: currentUser.id,
        invitingUserName: `${currentUser.first_name ?? currentUser.firstName} ${currentUser.last_name ?? currentUser.lastName}`,
      })
      setSuccess(true)
      setEmail('')
      setRole('')
      setCategory('')
      onInviteSent?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message ?? "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  if (invitableRoles.length === 0) {
    return (
      <div className="p-4 bg-surface-50 rounded-xl text-sm text-gray-500 text-center">
        Vous n'avez pas la permission d'inviter des membres dans ce club.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email du membre à inviter *
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="exemple@email.fr"
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rôle *
        </label>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setCategory('') }}
          className={inputCls}
          required
        >
          <option value="">Choisir un rôle...</option>
          {invitableRoles.map(r => (
            <option key={r} value={r}>{ROLE_LABELS_INV[r] ?? r}</option>
          ))}
        </select>
      </div>

      {needsCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">Aucune catégorie</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          Invitation envoyée avec succès !
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium
                   rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : "Envoyer l'invitation"
        }
      </button>
    </form>
  )
}
