import { useState } from 'react'

export function InvitationsTab({ clubId, userRole }) {
  const [invitations] = useState([
    { id: '1', email: 'jean@example.com', role: 'Coach', team: 'Équipe A', status: 'pending' },
    { id: '2', email: 'marc@example.com', role: 'Joueur', team: 'Équipe B', status: 'accepted' },
    { id: '3', email: 'sophie@example.com', role: 'Joueur', team: 'Équipe A', status: 'pending' },
  ])

  const [formData, setFormData] = useState({ email: '', role: '', team: '' })

  function getInvitableRoles() {
    if (userRole === 'president') return ['Président', 'Intendant', 'Coach', 'Joueur']
    if (userRole === 'staff') return ['Coach', 'Joueur']
    if (userRole === 'coach') return ['Joueur']
    return []
  }

  const invitableRoles = getInvitableRoles()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: API call
    setFormData({ email: '', role: '', team: '' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* === COLONNE GAUCHE : FORMULAIRE === */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {userRole === 'coach' ? '📧 Inviter un Joueur' : "📧 Inviter quelqu'un"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email*</label>
            <input
              type="email"
              placeholder="exemple@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Rôle*</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">-- Sélectionner un rôle --</option>
              {invitableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {(formData.role === 'Coach' || formData.role === 'Joueur') && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Équipe*</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Équipe A">⚽ Équipe A (U-13)</option>
                <option value="Équipe B">⚽ Équipe B (U-15)</option>
              </select>
              {userRole === 'coach' && (
                <p className="text-xs text-gray-500 mt-2">Uniquement vos équipes</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-md hover:shadow-lg"
          >
            Envoyer l'invitation
          </button>
        </form>
      </div>

      {/* === COLONNE DROITE : INVITATIONS ENVOYÉES === */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          📬 Invitations Envoyées ({invitations.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {invitations.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
              <p className="text-gray-600">Aucune invitation envoyée</p>
            </div>
          ) : (
            invitations.map(inv => (
              <div
                key={inv.id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">📧 {inv.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {inv.role} • {inv.team}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    inv.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {inv.status === 'accepted' ? '✅ Acceptée' : '⏳ En attente'}
                  </span>
                </div>

                {inv.status === 'pending' && (
                  <button className="text-red-600 text-sm hover:underline font-medium">
                    [× Annuler]
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
