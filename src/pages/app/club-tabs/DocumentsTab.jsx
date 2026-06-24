import { useState } from 'react'

export function DocumentsTab({ clubId, userRole }) {
  const [documents] = useState([
    { id: '1', name: 'Jean_License_2024.pdf', joueur: 'Jean', type: 'Licenses', createdAt: '2024-06-15' },
    { id: '2', name: 'Marc_Medical_2024.pdf', joueur: 'Marc', type: 'Médicaux', createdAt: '2024-06-14' },
  ])

  const [filterType, setFilterType] = useState('all')

  const filtered = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (userRole === 'coach') {
      // TODO: filtrer par ses équipes uniquement
      return true
    }
    if (userRole === 'player') {
      // TODO: filtrer par ses documents uniquement
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Documents Administratifs</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Ajouter un document
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['Tous', 'Licenses', 'Médicaux', 'Assurances'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type === 'Tous' ? 'all' : type)}
            className={`px-4 py-2 rounded-lg ${
              filterType === (type === 'Tous' ? 'all' : type)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucun document trouvé.</p>
        )}
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{doc.name}</h3>
              <p className="text-sm text-gray-600">
                {doc.joueur} • {doc.type} • {doc.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                Télécharger
              </button>
              <button className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
