import { useState } from 'react'

export function TransactionsTab({ clubId, userRole }) {
  const [transactions] = useState([
    { id: '1', date: '15/06/2024', description: 'Cotisation joueur', amount: 150, type: 'income', createdBy: 'Jean', icon: '💰' },
    { id: '2', date: '14/06/2024', description: 'Équipements', amount: -200, type: 'expense', createdBy: 'Marc', icon: '🛒' },
    { id: '3', date: '13/06/2024', description: 'Arbitrage match', amount: -50, type: 'expense', createdBy: 'Sophie', icon: '🎟️' },
    { id: '4', date: '12/06/2024', description: 'Adhésions', amount: 500, type: 'income', createdBy: 'Jean', icon: '💰' },
  ])

  const filtered = userRole === 'coach'
    ? transactions.filter(t => t.createdBy === 'Marc')
    : transactions

  const total = filtered.reduce((sum, t) => sum + t.amount, 0)
  const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-900">
          {userRole === 'coach' ? '💰 Mes Transactions' : '💰 Transactions du Club'}
        </h2>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md hover:shadow-lg">
          + Ajouter
        </button>
      </div>

      {/* STATISTIQUES (Président/Intendant uniquement) */}
      {(userRole === 'president' || userRole === 'staff') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">💵 Solde Total</p>
            <p className="text-4xl font-bold text-gray-900">{total}€</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-600 hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">📈 Revenus</p>
            <p className="text-4xl font-bold text-green-600">+{income}€</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-600 hover:shadow-md transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">📉 Dépenses</p>
            <p className="text-4xl font-bold text-red-600">-{expense}€</p>
          </div>
        </div>
      )}

      {/* HISTORIQUE */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Historique</h3>

        {filtered.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 text-lg">Aucune transaction</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {filtered.map((t, index) => (
              <div key={t.id}>
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-3xl mt-1">{t.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{t.description}</p>
                        <p className="text-sm text-gray-600">
                          📅 {t.date} • 👤 {t.createdBy}
                        </p>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold whitespace-nowrap ml-4 ${
                      t.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.amount > 0 ? '+' : ''}{t.amount}€
                    </p>
                  </div>
                </div>
                {index < filtered.length - 1 && (
                  <div className="border-b border-dashed border-gray-200" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
