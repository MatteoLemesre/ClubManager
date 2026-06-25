import { useState } from 'react'

export function JoueursTab({ clubId, userRole }) {
  const [joueurs] = useState([
    {
      id: '1',
      name: 'Jean Dupont',
      role: 'Joueur',
      category: 'U-13',
      team: 'Équipe A',
      email: 'jean@example.com',
      phone: '06 XX XX XX XX',
    },
    {
      id: '2',
      name: 'Marc Martin',
      role: 'Coach',
      category: null,
      team: 'Équipe B',
      email: 'marc@example.com',
      phone: '06 XX XX XX XX',
    },
    {
      id: '3',
      name: 'Sophie Lemoine',
      role: 'Joueur',
      category: 'U-15',
      team: 'Équipe A, Équipe B',
      email: 'sophie@example.com',
      phone: '06 XX XX XX XX',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('all')

  const filtered = joueurs.filter(j => {
    const matchSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTeam = filterTeam === 'all' || j.team.includes(filterTeam)
    return matchSearch && matchTeam
  })

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">👥 Joueurs du Club</h2>
          <p className="text-gray-600 mt-1 text-sm">{filtered.length} joueur(s)</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg">
          + Inviter un joueur
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <span className="absolute left-4 top-3 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Chercher un joueur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Équipe A', 'Équipe B', 'Coachs'].map(team => (
          <button
            key={team}
            onClick={() => setFilterTeam(team)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterTeam === team
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {team === 'all' ? 'Tous' : team}
          </button>
        ))}
      </div>

      {/* LISTE */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 text-lg">Aucun joueur trouvé</p>
          </div>
        ) : (
          filtered.map(joueur => (
            <div
              key={joueur.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">👤</span>
                    <h3 className="text-xl font-bold text-gray-900">{joueur.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {joueur.role}{joueur.category ? `, ${joueur.category}` : ''} • {joueur.team}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📧 {joueur.email}</span>
                    <span>📱 {joueur.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-initial px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors">
                    Profil
                  </button>
                  <button className="flex-1 md:flex-initial px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
