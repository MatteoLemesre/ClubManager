import { useState } from 'react'

export function DocumentsTab({ clubId, userRole }) {
  const [documents] = useState([
    { id: '1', name: 'Jean_License_2024.pdf', joueur: 'Jean', type: 'License', createdAt: '15/06/2024' },
    { id: '2', name: 'Marc_Medical_2024.pdf', joueur: 'Marc', type: 'Medical', createdAt: '14/06/2024' },
    { id: '3', name: 'Insurance_Club_2024.pdf', joueur: 'Club', type: 'Insurance', createdAt: '10/06/2024' },
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
      return doc.joueur === 'Jean' // mock
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'coach' ? '📄 Documents de mes Équipes' : '📄 Documents Administratifs'}
        </h2>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
          + Ajouter
        </button>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'License', 'Medical', 'Insurance', 'Autre'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'Tous' : type}
          </button>
        ))}
      </div>

      {/* VUE COACH : groupée par équipe */}
      {userRole === 'coach' ? (
        <div className="space-y-6">
          {['Équipe A', 'Équipe B'].map(team => (
            <div key={team}>
              <h3 className="text-lg font-bold text-gray-900 mb-3">⚽ {team}</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {filtered.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white p-4 rounded-lg flex justify-between items-center border border-gray-200"
                  >
                    <div>
                      <p className="font-bold text-gray-900">📄 {doc.name}</p>
                      <p className="text-sm text-gray-600">{doc.joueur} • {doc.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm">
                        Télécharger
                      </button>
                      <button className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 text-sm">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VUE PRÉSIDENT / INTENDANT / JOUEUR */
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Aucun document trouvé.</p>
            </div>
          )}
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-900">📄 {doc.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {doc.joueur} • {doc.type} • {doc.createdAt}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium">
                  Télécharger
                </button>
                {userRole !== 'player' && (
                  <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
