import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function JoueurProfilePage() {
  const navigate = useNavigate()
  const { joueurId } = useParams()
  const { currentUser } = useAuth()

  // ===== DATA =====

  const [joueur] = useState({
    id: joueurId,
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'Joueur',
    team: 'Équipe A',
    category: 'U-13',
    city: 'Lens',
    age: 13,
    email: 'jean@example.com',
    phone: '06 12 34 56 78',
    dateOfBirth: new Date('2010-03-10'),
    address: '123 Rue X, Lens 62300',
    avatar: null,
    joinedAt: '15/06/2024',
  })

  const [experiences] = useState([
    {
      id: '1',
      team: 'Équipe A',
      club: 'FC Lens',
      role: 'Joueur',
      category: 'U-13',
      startDate: '2024-06-15',
      endDate: null,
      matches: 24,
      goals: 5,
      description: 'Ailier droit, saison 2024-2025',
    },
    {
      id: '2',
      team: 'Équipe B',
      club: 'FC Lens',
      role: 'Joueur',
      category: 'U-15',
      startDate: '2024-07-01',
      endDate: null,
      matches: 12,
      goals: 3,
      description: 'Attaquant polyvalent',
    },
  ])

  const [documents] = useState([
    { id: '1', name: 'Jean_License_2024.pdf', type: 'License', date: '2024-06-15', validity: '2024-2025' },
    { id: '2', name: 'Jean_Medical_2024.pdf', type: 'Medical', date: '2024-06-14', validity: '2024-2025' },
    { id: '3', name: 'Insurance_Club_2024.pdf', type: 'Insurance', date: '2024-01-01', validity: '2024-2025' },
  ])

  // ===== FONCTIONS =====

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffMonths = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24 * 30))

    if (diffMonths < 12) return `${diffMonths} mois`
    const years = Math.floor(diffMonths / 12)
    const months = diffMonths % 12
    return months > 0 ? `${years} an(s) ${months} mois` : `${years} an(s)`
  }

  function getDocumentIcon(type) {
    const icons = {
      License: '📋',
      Medical: '🏥',
      Insurance: '🛡️',
      Certificate: '🎓',
      Other: '📄',
    }
    return icons[type] || '📄'
  }

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BOUTON RETOUR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate('/app/mon-club')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* ===== HEADER PROFIL ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <div className="flex gap-6 items-end">
            {/* Avatar */}
            {joueur.avatar ? (
              <img
                src={joueur.avatar}
                alt={joueur.firstName}
                className="w-32 h-32 rounded-full border-4 border-white object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-300 flex items-center justify-center text-5xl flex-shrink-0">
                👤
              </div>
            )}

            {/* Infos */}
            <div className="pb-4 flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {joueur.firstName} {joueur.lastName}
              </h1>
              <p className="text-xl text-blue-100 mb-2">
                ⚽ {joueur.role} • {joueur.category} • {joueur.team}
              </p>
              <p className="text-lg text-blue-100">
                📍 {joueur.city} • {joueur.age} ans
              </p>
            </div>

            {/* Bouton Modifier (TODO: adapter permissions) */}
            {currentUser?.id === joueur.id && (
              <button className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white/10 font-bold transition-colors">
                ✏️ Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 pb-12 space-y-6">

        {/* ===== SECTION 1 : INFORMATIONS PERSONNELLES ===== */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Informations Personnelles
          </h2>

          <div className="space-y-6">
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
              <p className="text-gray-900 text-lg">
                🎂 {joueur.dateOfBirth.toLocaleDateString('fr-FR')} ({joueur.age} ans)
              </p>
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
        </div>

        {/* ===== SECTION 2 : RÔLES & EXPÉRIENCE ===== */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎖️ Rôles & Expérience
          </h2>

          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={exp.id}>
                <div className="flex gap-4">
                  <div className="text-3xl pt-2 flex-shrink-0">⚽</div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {exp.role} - {exp.team}
                        </h3>
                        <p className="text-gray-600">{exp.club}</p>
                      </div>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0 ml-4">
                        {calculateDuration(exp.startDate, exp.endDate)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      📅 {formatDate(exp.startDate)}
                      {exp.endDate ? ` - ${formatDate(exp.endDate)}` : ' - Présent'}
                    </p>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Catégorie :</span> {exp.category}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Matches :</span> {exp.matches}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Buts :</span> {exp.goals}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-700">
                          <span className="font-bold">Description :</span> {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {index < experiences.length - 1 && (
                  <div className="border-t border-gray-200 mt-6"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 3 : DOCUMENTS ===== */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📄 Documents</h2>
            {/* TODO: adapter permissions pour afficher le bouton Ajouter */}
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors text-sm">
              + Ajouter
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Aucun document</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl pt-1">{getDocumentIcon(doc.type)}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-600">Type : {doc.type}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                          <span>📅 Délivré le : {formatDate(doc.date)}</span>
                          <span>✅ Validité : {doc.validity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors">
                        Télécharger
                      </button>
                      <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
