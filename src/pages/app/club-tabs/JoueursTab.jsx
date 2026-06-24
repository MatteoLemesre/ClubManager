import { useState } from 'react'

export function JoueursTab({ clubId, userRole }) {
  const [joueurs] = useState([
    { id: '1', name: 'Jean Dupont', role: 'Joueur', category: 'U-13', team: 'Équipe A' },
    { id: '2', name: 'Marc Martin', role: 'Coach', category: null, team: 'Équipe B' },
    { id: '3', name: 'Sophie Lemoine', role: 'Joueur', category: 'U-15', team: 'Équipe A' },
  ])

  const [searchTerm, setSearchTerm] = useState('')

  const filtered = joueurs.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Joueurs du Club</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Inviter un joueur
        </button>
      </div>

      <input
        type="text"
        placeholder="Chercher un joueur..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
      />

      <div className="space-y-4">
        {filtered.map(joueur => (
          <div key={joueur.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{joueur.name}</h3>
              <p className="text-sm text-gray-600">
                {joueur.role} {joueur.category ? `- ${joueur.category}` : ''} • {joueur.team}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                Profil
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
