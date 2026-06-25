import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function JoueurProfilePage() {
  const navigate = useNavigate()
  const { joueurId } = useParams()

  // TODO: Récupérer depuis DB avec joueurId
  const [joueur] = useState({
    id: joueurId,
    name: 'Jean Dupont',
    role: 'Joueur',
    category: 'U-13',
    team: 'Équipe A',
    email: 'jean@example.com',
    phone: '06 XX XX XX XX',
    dateOfBirth: '10/03/2010',
    address: '123 Rue X, Lens',
    joinedAt: '15/06/2024',
    avatar: null,
  })

  const [documents] = useState([
    { id: '1', name: 'Jean_License_2024.pdf', type: 'License', createdAt: '15/06/2024' },
    { id: '2', name: 'Jean_Medical_2024.pdf', type: 'Medical', createdAt: '14/06/2024' },
  ])

  const [history] = useState([
    { id: '1', date: '15/06/2024', event: 'Jointure au club', details: 'Équipe : Équipe A (U-13)' },
    { id: '2', date: '01/07/2024', event: 'Changement catégorie', details: 'U-13 → U-15' },
  ])

  const typeIcons = {
    License: '📋',
    Medical: '🏥',
    Insurance: '🛡️',
    Other: '📄',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/app/mon-club')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* === COLONNE GAUCHE : FICHE JOUEUR === */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              {/* AVATAR */}
              {joueur.avatar ? (
                <img
                  src={joueur.avatar}
                  alt={joueur.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center text-4xl">
                  👤
                </div>
              )}

              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                {joueur.name}
              </h2>

              <div className="text-center mb-6">
                <p className="text-lg text-gray-700">⚽ {joueur.role}, {joueur.category}</p>
                <p className="text-sm text-gray-600 mt-1">📍 {joueur.team}</p>
                <p className="text-sm text-gray-600 mt-1">📅 Membre depuis {joueur.joinedAt}</p>
              </div>

              <hr className="mb-6" />

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">EMAIL</p>
                  <p className="text-gray-900">📧 {joueur.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">TÉLÉPHONE</p>
                  <p className="text-gray-900">📱 {joueur.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">DATE DE NAISSANCE</p>
                  <p className="text-gray-900">🎂 {joueur.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">ADRESSE</p>
                  <p className="text-gray-900">📍 {joueur.address}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  ✏️ Modifier le profil
                </button>
                <button className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* === COLONNE DROITE : DOCUMENTS + HISTORIQUE === */}
          <div className="lg:col-span-2 space-y-8">

            {/* DOCUMENTS */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">📋 Documents</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  + Ajouter
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <p className="text-gray-600">Aucun document</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {typeIcons[doc.type] || '📄'}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-600">{doc.type}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">📅 {doc.createdAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 transition-colors">
                            Télécharger
                          </button>
                          <button className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-50 transition-colors">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HISTORIQUE */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📝 Historique</h3>

              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          ✅
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.event}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                        <p className="text-xs text-gray-500 mt-2">📅 {item.date}</p>
                      </div>
                    </div>
                    {index < history.length - 1 && (
                      <div className="ml-4 h-4 border-l-2 border-gray-200 my-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
