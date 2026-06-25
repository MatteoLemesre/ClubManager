import { useState } from 'react'

export function DocumentsTab({ clubId, userRole }) {
  const [documents] = useState([
    { id: '1', name: 'Jean_License_2024.pdf', joueur: 'Jean', type: 'License', createdAt: '15/06/2024', team: 'Équipe A' },
    { id: '2', name: 'Marc_Medical_2024.pdf', joueur: 'Marc', type: 'Medical', createdAt: '14/06/2024', team: 'Équipe B' },
    { id: '3', name: 'Sophie_License_2024.pdf', joueur: 'Sophie', type: 'License', createdAt: '12/06/2024', team: 'Équipe A' },
    { id: '4', name: 'Insurance_Club_2024.pdf', joueur: 'Club', type: 'Insurance', createdAt: '10/06/2024', team: 'Club' },
  ])

  const [filterType, setFilterType] = useState('all')

  const filtered = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (userRole === 'coach') {
      return true // TODO: filtrer par ses équipes uniquement
    }
    if (userRole === 'player') {
      return doc.joueur === 'Jean' // mock
    }
    return true
  })

  // Grouper par type
  const groupedByType = filtered.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {})

  const typeIcons = {
    License: '📋',
    Medical: '🏥',
    Insurance: '🛡️',
    Other: '📄',
  }

  const typeLabels = {
    License: 'Licenses',
    Medical: 'Médicaux',
    Insurance: 'Assurances',
    Other: 'Autres',
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">
          {userRole === 'coach' ? '📄 Documents de Mes Équipes' : '📄 Documents Administratifs'}
        </h2>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg">
          + Ajouter
        </button>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'License', 'Medical', 'Insurance'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterType === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'Tous' : type}
          </button>
        ))}
      </div>

      {/* DOCUMENTS GROUPÉS PAR TYPE */}
      <div className="space-y-8">
        {Object.entries(groupedByType).map(([type, docs]) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{typeIcons[type] ?? '📄'}</span>
              <h3 className="text-lg font-bold text-gray-900">
                {typeLabels[type] ?? type}
              </h3>
              <span className="ml-auto text-sm text-gray-600">({docs.length} documents)</span>
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-blue-200">
              {docs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">📄 {doc.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {doc.joueur} • 📅 {doc.createdAt}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm whitespace-nowrap transition-colors">
                        Télécharger
                      </button>
                      {userRole !== 'player' && (
                        <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-gray-50 p-12 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600 text-lg">Aucun document trouvé</p>
        </div>
      )}
    </div>
  )
}
