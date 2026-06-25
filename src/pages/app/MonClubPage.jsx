import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { JoueursTab } from './club-tabs/JoueursTab'
import { TransactionsTab } from './club-tabs/TransactionsTab'
import { InvitationsTab } from './club-tabs/InvitationsTab'
import { ParametresTab } from './club-tabs/ParametresTab'
import { RoleGuard } from '../../components/RoleGuard'

export default function MonClubPage() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('transactions')

  const userRole = currentUser?.role ?? 'player'

  const currentClub = {
    id: currentUser?.current_club_id ?? '',
    name: 'FC Lens Académie',
    sport: 'Football',
    city: 'Lens',
    members: 65,
    description: 'Club de football basé à Lens depuis 1995',
  }

  function getVisibleTabs() {
    if (userRole === 'president' || userRole === 'staff') {
      return ['joueurs', 'transactions', 'invitations', 'parametres']
    }
    if (userRole === 'coach') {
      return ['transactions', 'invitations', 'parametres']
    }
    if (userRole === 'player') {
      return ['parametres']
    }
    return []
  }

  const visibleTabs = getVisibleTabs()

  const TAB_CONFIG = [
    { key: 'joueurs',      label: '👥 Joueurs'      },
    { key: 'transactions', label: '💰 Transactions' },
    { key: 'invitations',  label: '📧 Invitations'  },
    { key: 'parametres',   label: '⚙️ Paramètres'  },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HERO SECTION ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between gap-8">

            {/* LEFT : INFOS */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">⚽</span>
                <h1 className="text-4xl font-bold">{currentClub.name}</h1>
              </div>

              <p className="text-blue-100 text-lg mb-6">{currentClub.description}</p>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span>{currentClub.sport}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span>{currentClub.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  <span>{currentClub.members} membres</span>
                </div>
              </div>
            </div>

            {/* RIGHT : LOGO */}
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center text-6xl">
                ⚽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ONGLETS ===== */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {TAB_CONFIG.filter(t => visibleTabs.includes(t.key)).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'joueurs' && (
          <RoleGuard allowedRoles={['president', 'staff']} userRole={userRole}>
            <JoueursTab clubId={currentClub.id} userRole={userRole} />
          </RoleGuard>
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab clubId={currentClub.id} userRole={userRole} />
        )}

        {activeTab === 'invitations' && (
          <InvitationsTab clubId={currentClub.id} userRole={userRole} />
        )}

        {activeTab === 'parametres' && (
          <ParametresTab clubId={currentClub.id} userRole={userRole} />
        )}
      </div>
    </div>
  )
}
