import { useState } from 'react'

export function ParametresTab({ clubId, userRole }) {
  const [club] = useState({
    name: 'FC Lens',
    sport: 'Football',
    city: 'Lens',
    description: 'Club de football basé à Lens',
  })

  const canEdit = userRole === 'president'
  const [formData, setFormData] = useState(club)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: API call
  }

  if (userRole === 'player') {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Mon Profil dans le Club</h3>
        <div className="space-y-3">
          <p><span className="font-bold">Rôle:</span> Joueur</p>
          <p><span className="font-bold">Équipes:</span> Équipe A, Équipe B</p>
          <p><span className="font-bold">Catégories:</span> U-13, U-15</p>
          <p><span className="font-bold">Depuis:</span> 15/06/2024</p>
        </div>
        <button className="mt-6 px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
          Quitter le club
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Paramètres du Club</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Nom du club</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg ${
              !canEdit ? 'bg-gray-100 text-gray-600' : ''
            } focus:outline-none focus:border-blue-600`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Sport</label>
          <input
            type="text"
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg ${
              !canEdit ? 'bg-gray-100 text-gray-600' : ''
            } focus:outline-none focus:border-blue-600`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Ville</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg ${
              !canEdit ? 'bg-gray-100 text-gray-600' : ''
            } focus:outline-none focus:border-blue-600`}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={!canEdit}
            className={`w-full px-4 py-2 border rounded-lg ${
              !canEdit ? 'bg-gray-100 text-gray-600' : ''
            } focus:outline-none focus:border-blue-600`}
            rows={4}
          />
        </div>

        {canEdit && (
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        )}
      </form>

      <div className="mt-8 pt-8 border-t">
        <h4 className="font-bold text-gray-900 mb-4">Actions</h4>
        <button className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
          Quitter le club
        </button>
        {canEdit && (
          <button className="ml-4 px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50">
            Supprimer le club
          </button>
        )}
      </div>
    </div>
  )
}
