import { useState } from 'react'

export function InvitationsTab({ clubId, userRole }) {
  const [invitations] = useState([
    { id: '1', email: 'jean@example.com', role: 'Coach', status: 'pending' },
    { id: '2', email: 'marc@example.com', role: 'Joueur', status: 'accepted' },
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* FORM */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {userRole === 'coach' ? 'Inviter un joueur' : "Inviter quelqu'un"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
          />

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">Sélectionner un rôle</option>
            {invitableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {(formData.role === 'Coach' || formData.role === 'Joueur') && (
            <select
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="">Sélectionner une équipe</option>
              <option value="Équipe A">Équipe A</option>
              <option value="Équipe B">Équipe B</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Envoyer l'invitation
          </button>
        </form>
      </div>

      {/* LISTE */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Invitations envoyées</h3>
        <div className="space-y-3">
          {invitations.map(inv => (
            <div key={inv.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{inv.email}</p>
                  <p className="text-sm text-gray-600">{inv.role}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  inv.status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {inv.status === 'accepted' ? 'Acceptée' : 'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
