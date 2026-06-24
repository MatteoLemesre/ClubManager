import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { JoueursTab } from './club-tabs/JoueursTab'
import { DocumentsTab } from './club-tabs/DocumentsTab'
import { TransactionsTab } from './club-tabs/TransactionsTab'
import { InvitationsTab } from './club-tabs/InvitationsTab'
import { ParametresTab } from './club-tabs/ParametresTab'
import { RoleGuard } from '../../components/RoleGuard'

const TAB_LABELS = {
  joueurs:      '👥 Joueurs',
  documents:    '📄 Documents',
  transactions: '💰 Transactions',
  invitations:  '📧 Invitations',
  parametres:   '⚙️ Paramètres',
}

export default function MonClubPage() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('documents')

  // Rôle de l'utilisateur courant (president | staff | coach | player)
  const userRole = currentUser?.role ?? 'player'

  // Infos du club courant (TODO: récupérer depuis DB)
  const currentClub = {
    id: currentUser?.current_club_id ?? '',
    name: 'FC Lens Académie',
    sport: 'Football',
    city: 'Lens',
  }

  function getVisibleTabs() {
    if (userRole === 'president' || userRole === 'staff') {
      return ['joueurs', 'documents', 'transactions', 'invitations', 'parametres']
    }
    if (userRole === 'coach') {
      return ['documents', 'transactions', 'invitations', 'parametres']
    }
    if (userRole === 'player') {
      return ['parametres']
    }
    return []
  }

  const visibleTabs = getVisibleTabs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Club
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {currentClub.name} • {currentClub.sport} • {currentClub.city}
          </p>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {visibleTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'joueurs' && (
          <RoleGuard allowedRoles={['president', 'staff']} userRole={userRole}>
            <JoueursTab clubId={currentClub.id} userRole={userRole} />
          </RoleGuard>
        )}

        {activeTab === 'documents' && (
          <DocumentsTab clubId={currentClub.id} userRole={userRole} />
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
