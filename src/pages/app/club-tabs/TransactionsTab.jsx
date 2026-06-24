import { useState } from 'react'

export function TransactionsTab({ clubId, userRole }) {
  const [transactions] = useState([
    { id: '1', date: '2024-06-15', description: 'Cotisation joueur', amount: 150, type: 'income', createdBy: 'Jean' },
    { id: '2', date: '2024-06-14', description: 'Équipements', amount: -200, type: 'expense', createdBy: 'Marc' },
  ])

  // Coach voit uniquement ses transactions (TODO: filtrer par currentUser)
  const filtered = userRole === 'coach'
    ? transactions.filter(t => t.createdBy === 'current user')
    : transactions

  const total = filtered.reduce((sum, t) => sum + t.amount, 0)
  const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'coach' ? 'Mes Transactions' : 'Transactions du Club'}
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Ajouter une transaction
        </button>
      </div>

      {(userRole === 'president' || userRole === 'staff') && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Solde total</p>
            <p className="text-2xl font-bold text-gray-900">{total}€</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Revenus</p>
            <p className="text-2xl font-bold text-green-600">+{income}€</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Dépenses</p>
            <p className="text-2xl font-bold text-red-600">-{expense}€</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">Aucune transaction trouvée.</p>
        )}
        {filtered.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{t.description}</h3>
              <p className="text-sm text-gray-600">
                {t.date} • Par : {t.createdBy}
              </p>
            </div>
            <p className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {t.amount > 0 ? '+' : ''}{t.amount}€
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
