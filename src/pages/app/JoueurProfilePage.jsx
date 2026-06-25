import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function JoueurProfilePage() {
  const navigate = useNavigate()
  const { joueurId } = useParams()
  const { currentUser } = useAuth()

  // TODO: Récupérer depuis DB avec joueurId
  const [joueur] = useState({
    id: joueurId,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.com',
    phone: '06 12 34 56 78',
    dateOfBirth: new Date('2010-03-10'),
    address: '123 Rue X, Lens 62300',
    city: 'Lens',
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

  // ===== FONCTIONS =====

  function calculateAge(birthDate) {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  function maskContact(contactStr) {
    if (contactStr.includes('@')) {
      const [name, domain] = contactStr.split('@')
      return `${name.substring(0, 4)}...@${domain}`
    } else {
      const cleaned = contactStr.replace(/\s/g, '')
      return `${cleaned.substring(0, 2)}...${cleaned.substring(cleaned.length - 4)}`
    }
  }

  function canViewCompleteProfile() {
    const role = currentUser?.role
    // TODO: affiner pour coach (vérifier que le joueur est dans ses équipes)
    return role === 'president' || role === 'staff' || role === 'coach'
  }

  // ===== VARIABLES =====

  const age = calculateAge(joueur.dateOfBirth)
  const birthYear = joueur.dateOfBirth.getFullYear()
  const maskedContact = maskContact(joueur.phone)
  const canViewComplete = canViewCompleteProfile()

  const typeIcons = {
    License: '📋',
    Medical: '🏥',
    Insurance: '🛡️',
    Other: '📄',
  }

  // ===== RENDER =====

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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ===== PARTIE 1 : RÉCAP (VISIBLE POUR TOUS) ===== */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            {joueur.avatar ? (
              <img
                src={joueur.avatar}
                alt={joueur.firstName}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl flex-shrink-0">
                👤
              </div>
            )}

            {/* Infos */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {joueur.firstName} {joueur.lastName}
              </h2>
              <div className="flex flex-wrap gap-6 text-gray-700">
                <span className="text-lg">📅 {age} ans ({birthYear})</span>
                <span className="text-lg">📍 {joueur.city}</span>
                <span className="text-lg">📱 {maskedContact}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PARTIE 2 : INFOS COMPLÈTES (SI PERMISSIONS) ===== */}
        {canViewComplete ? (
          <div className="space-y-8">

            {/* FICHE COMPLÈTE */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fiche Complète</h3>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">EMAIL</p>
                  <p className="text-gray-900 text-lg">📧 {joueur.email}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">TÉLÉPHONE</p>
                  <p className="text-gray-900 text-lg">📱 {joueur.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">DATE DE NAISSANCE</p>
                  <p className="text-gray-900 text-lg">🎂 {joueur.dateOfBirth.toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">ADRESSE</p>
                  <p className="text-gray-900 text-lg">📍 {joueur.address}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">MEMBRE DEPUIS</p>
                  <p className="text-gray-900 text-lg">📅 {joueur.joinedAt}</p>
                </div>
              </div>

              <hr className="mb-6" />

              {/* ACTIONS */}
              <div className="flex gap-2">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  ✏️ Modifier
                </button>
                <button className="px-6 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                  🗑️ Supprimer
                </button>
              </div>
            </div>

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
                            <span className="text-2xl">{typeIcons[doc.type] || '📄'}</span>
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
        ) : (
          /* ===== LOCKED : PAS DE PERMISSIONS ===== */
          <div className="bg-blue-50 border border-blue-200 p-12 rounded-lg text-center">
            <p className="text-blue-800 text-lg font-medium mb-2">
              ℹ️ Vous n'avez pas accès à ces informations
            </p>
            <p className="text-blue-700 text-sm">
              Seuls le président, l'intendant ou le coach (de son équipe) peuvent voir les infos complètes.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
