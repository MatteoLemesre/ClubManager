# ClubManager — Onglet Financier : Revenus & Dépenses

Gestion complète des entrées/sorties financières du club.

---

## STRUCTURE

**Revenus (Entrées) :**
- Cotisations/Adhésions
- Subventions
- Sponsoring
- Donations
- Ventes (merchandising, buffet)
- Location (terrain, équipements)
- Autres

**Dépenses (Sorties) :**
- Fournitures/Équipements
- Arbitrage
- Déplacements
- Salaires/Indemnités (coachs)
- Assurances
- Frais administratifs
- Adhésions/Licences fédérales
- Maintenance (terrain, équipements)
- Autres

---

## STRUCTURE DE DONNÉES

```js
const mockTransactions = [
  {
    id: 'trans-1',
    club_id: 'club-1',
    type: 'revenue', // 'revenue' ou 'expense'
    category: 'subscription', // subscription, subsidy, sponsorship, donation, sales, rental, other
    title: 'Cotisations saison 2024-2025',
    amount: 3500,
    currency: 'EUR',
    from_to: 'Karim Diallo', // qui paie si revenue, à qui si expense
    description: 'Cotisations 15 joueurs × 233€',
    date: '2024-09-01',
    is_recurring: true, // pour rappels
    created_at: '2024-09-01T10:00:00Z',
    created_by: 'pres-1',
  },
  {
    id: 'trans-2',
    club_id: 'club-1',
    type: 'expense',
    category: 'equipment',
    title: 'Achat ballons et cônes',
    amount: 450,
    currency: 'EUR',
    from_to: 'Decathlon',
    description: '12 ballons de foot + 20 cônes',
    date: '2024-09-05',
    is_recurring: false,
    created_at: '2024-09-05T14:00:00Z',
    created_by: 'pres-1',
  },
  {
    id: 'trans-3',
    club_id: 'club-1',
    type: 'expense',
    category: 'arbitrage',
    title: 'Arbitrage match Séniors A',
    amount: 80,
    currency: 'EUR',
    from_to: 'M. Jean Dupont',
    description: 'Arbitrage match domicile vs FC Valenciennes',
    date: '2024-09-10',
    is_recurring: false,
    created_at: '2024-09-10T16:00:00Z',
    created_by: 'coach-1',
  },
]
```

---

## INTERFACE PRINCIPALE

```
┌──────────────────────────────────────────────────────┐
│  💰 FINANCIER                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📊 RÉSUMÉ                                           │
│                                                      │
│  Solde : +€2,750                                     │
│                                                      │
│  Revenus (janv-juin 2025) : +€5,230                 │
│  Dépenses (janv-juin 2025) : -€2,480                │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  [Filtrer par : Tous] [Revenus] [Dépenses]         │
│  [Période : Tous les temps ▼]                       │
│                                                      │
│  [+ Ajouter une transaction]                        │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  📋 TRANSACTIONS                                     │
│                                                      │
│  01/06 │ Cotisations joueurs      │ +€3,500        │
│  31/05 │ Sponsoring adidas        │ +€1,200        │
│  28/05 │ Déplacements U17         │ -€450          │
│  25/05 │ Assurance club           │ -€320          │
│  20/05 │ Arbitrage match          │ -€80           │
│  15/05 │ Achat équipements        │ -€230          │
│  10/05 │ Donation anonyme         │ +€530          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## CODE ONGLET FINANCIER COMPLET

```jsx
function FinancierTab({ club }) {
  const [filterType, setFilterType] = useState('all') // 'all', 'revenue', 'expense'
  const [filterPeriod, setPeriodFilter] = useState('all') // 'all', 'month', 'quarter', 'year'
  const [showAddModal, setShowAddModal] = useState(false)

  // Récupérer les transactions du club
  const transactions = mockTransactions
    .filter(t => t.club_id === club.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Filtrer
  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    
    if (filterPeriod !== 'all') {
      const transDate = new Date(t.date)
      const now = new Date()
      
      if (filterPeriod === 'month') {
        return transDate.getMonth() === now.getMonth() &&
               transDate.getFullYear() === now.getFullYear()
      }
      if (filterPeriod === 'quarter') {
        const transQuarter = Math.floor(transDate.getMonth() / 3)
        const nowQuarter = Math.floor(now.getMonth() / 3)
        return transQuarter === nowQuarter &&
               transDate.getFullYear() === now.getFullYear()
      }
      if (filterPeriod === 'year') {
        return transDate.getFullYear() === now.getFullYear()
      }
    }
    
    return true
  })

  // Calcul résumé
  const totalRevenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalRevenue - totalExpense

  const periodLabel = filterPeriod === 'month' ? 'ce mois' :
                     filterPeriod === 'quarter' ? 'ce trimestre' :
                     filterPeriod === 'year' ? 'cette année' :
                     'tout le temps'

  return (
    <div className="space-y-6">
      
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="text-sm text-emerald-700 mb-1">Solde</div>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{balance}€
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">Revenus ({periodLabel})</div>
          <div className="text-3xl font-bold text-blue-600">+{totalRevenue}€</div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="text-sm text-red-700 mb-1">Dépenses ({periodLabel})</div>
          <div className="text-3xl font-bold text-red-600">-{totalExpense}€</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 bg-surface-100 p-1 rounded-lg">
          {['all', 'revenue', 'expense'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                filterType === type
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              {type === 'all' && 'Tous'}
              {type === 'revenue' && '📈 Revenus'}
              {type === 'expense' && '📉 Dépenses'}
            </button>
          ))}
        </div>

        <select
          value={filterPeriod}
          onChange={e => setPeriodFilter(e.target.value)}
          className="px-3 py-1 border border-surface-200 rounded-lg text-sm">
          <option value="all">Tout le temps</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto btn-secondary text-sm">
          + Ajouter une transaction
        </button>
      </div>

      {/* Tableau transactions */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">De/À</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Montant</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trans, idx) => (
              <tr key={trans.id} className={idx !== filtered.length - 1 ? 'border-b border-surface-100' : ''}>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(trans.date), 'dd MMM', { locale: fr })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{trans.title}</div>
                  {trans.description && (
                    <div className="text-xs text-gray-500">{trans.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{trans.from_to}</td>
                <td className={`px-4 py-3 text-right font-semibold ${
                  trans.type === 'revenue' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {trans.type === 'revenue' ? '+' : '-'}{trans.amount}€
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucune transaction
          </div>
        )}
      </div>

      {/* Modal ajout */}
      {showAddModal && (
        <AddTransactionModal
          clubId={club.id}
          onClose={() => setShowAddModal(false)}
          onCreate={(trans) => {
            // Ajouter la transaction
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}
```

---

## MODAL AJOUT TRANSACTION

```jsx
function AddTransactionModal({ clubId, onClose, onCreate }) {
  const [type, setType] = useState('revenue')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [fromTo, setFromTo] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)

  const revenueCategories = [
    { value: 'subscription', label: 'Cotisations/Adhésions' },
    { value: 'subsidy', label: 'Subvention' },
    { value: 'sponsorship', label: 'Sponsoring' },
    { value: 'donation', label: 'Donation' },
    { value: 'sales', label: 'Ventes' },
    { value: 'rental', label: 'Location' },
    { value: 'other', label: 'Autre' },
  ]

  const expenseCategories = [
    { value: 'equipment', label: 'Fournitures/Équipements' },
    { value: 'arbitrage', label: 'Arbitrage' },
    { value: 'travel', label: 'Déplacements' },
    { value: 'salary', label: 'Salaires/Indemnités' },
    { value: 'insurance', label: 'Assurances' },
    { value: 'admin', label: 'Frais administratifs' },
    { value: 'licenses', label: 'Adhésions/Licences fédérales' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Autre' },
  ]

  const categories = type === 'revenue' ? revenueCategories : expenseCategories

  const handleCreate = () => {
    if (!title.trim() || !amount || !category || !fromTo.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const newTrans = {
      id: `trans-${Date.now()}`,
      club_id: clubId,
      type,
      category,
      title: title.trim(),
      amount: parseFloat(amount),
      currency: 'EUR',
      from_to: fromTo.trim(),
      description: description.trim() || null,
      date,
      is_recurring: isRecurring,
      created_at: new Date().toISOString(),
    }

    onCreate(newTrans)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl font-bold mb-5">Ajouter une transaction</h2>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="flex gap-2">
              {['revenue', 'expense'].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t)
                    setCategory('')
                  }}
                  className={`flex-1 p-2 rounded-lg font-medium transition-all ${
                    type === t
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-gray-700 hover:bg-surface-200'
                  }`}>
                  {t === 'revenue' ? '📈 Revenu' : '📉 Dépense'}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full">
              <option value="">Choisir une catégorie...</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Cotisations saison 2024-2025"
              className="w-full"
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full"
            />
          </div>

          {/* De/À */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'revenue' ? 'De qui' : 'À qui'} *
            </label>
            <input
              value={fromTo}
              onChange={e => setFromTo(e.target.value)}
              placeholder={type === 'revenue' ? 'Karim Diallo' : 'Decathlon'}
              className="w-full"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Détails supplémentaires..."
              className="w-full"
            />
          </div>

          {/* Récurrence */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              Transaction récurrente (cotisations, assurances...)
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={handleCreate} className="flex-1 btn-primary justify-center">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## RÉSUMÉ

**Revenus :** Cotisations, Subventions, Sponsoring, Donations, Ventes, Locations, Autre

**Dépenses :** Équipements, Arbitrage, Déplacements, Salaires, Assurances, Admin, Licences, Maintenance, Autre

**Affichage :**
- 3 cartes résumé (solde, revenus, dépenses)
- Filtres (type + période)
- Tableau transactions avec date, description, montant
- Modal d'ajout complet

**Features :**
- Montants en €
- Dates intelligentes
- De/À identifie qui paie ou reçoit
- Transactions récurrentes (cotisations)
- Filtrages par type et période

---

## POUR CLAUDE CODE

```
Implémenter FINANCIER_BUDGET_CLUB.md :

1. Créer mock data mockTransactions
2. Implémenter FinancierTab complet (filtres + calculs)
3. Ajouter AddTransactionModal
4. Catégories revenus/dépenses avec vrais termes comptables
5. Tableau transactions responsive
6. Filtrage par type et période

Optionnel : graphiques revenus/dépenses, rapports PDF
```
