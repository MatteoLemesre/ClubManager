import { useState } from 'react'

export function TransactionsTab({ clubId, userRole }) {
  const [transactions] = useState([
    { id: '1', date: '15/06/2024', description: 'Cotisation joueur', amount: 150, type: 'income', createdBy: 'Jean', icon: '💰' },
    { id: '2', date: '14/06/2024', description: 'Équipements', amount: -200, type: 'expense', createdBy: 'Marc', icon: '🛒' },
    { id: '3', date: '13/06/2024', description: 'Arbitrage match', amount: -50, type: 'expense', createdBy: 'Sophie', icon: '🎟️' },
  ])

  // Coach voit uniquement ses transactions (TODO: filtrer par currentUser.name)
  const filtered = userRole === 'coach'
    ? transactions.filter(t => t.createdBy === 'Marc')
    : transactions

  const total = filtered.reduce((sum, t) => sum + t.amount, 0)
  const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'coach' ? '💰 Mes Transactions' : '💰 Transactions du Club'}
        </h2>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
          + Ajouter
        </button>
      </div>

      {/* STATISTIQUES (Président/Intendant uniquement) */}
      {(userRole === 'president' || userRole === 'staff') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-medium">Solde total</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}€</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-medium">Revenus</p>
            <p className="text-3xl font-bold text-green-600 mt-2">+{income}€</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
            <p className="text-gray-600 text-sm font-medium">Dépenses</p>
            <p className="text-3xl font-bold text-red-600 mt-2">-{expense}€</p>
          </div>
        </div>
      )}

      {/* LISTE */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600">Aucune transaction</p>
          </div>
        ) : (
          filtered.map(t => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-bold text-gray-900">{t.description}</p>
                  <p className="text-sm text-gray-600">{t.date} • Par : {t.createdBy}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold whitespace-nowrap ml-4 ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {t.amount > 0 ? '+' : ''}{t.amount}€
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
