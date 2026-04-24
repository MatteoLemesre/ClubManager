import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MATCHES, getUserById, getTeamById, getFullName } from '../../data/mock'
import { useAuth } from '../../context/AuthContext'
import { Card, Badge, SectionHeader, Avatar } from '../../components/ui'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Clock, MapPin, Target, Users, ClipboardList,
  Star,
} from 'lucide-react'

const TABS = {
  all: ['summary', 'composition'],
  player: ['summary', 'composition', 'ratings'],
  coach: ['summary', 'composition', 'squad', 'manage'],
  president: ['summary', 'composition', 'squad', 'manage'],
}

const TAB_LABELS = {
  summary:     'Résumé',
  composition: 'Composition',
  ratings:     'Notations',
  squad:       'Convocations',
  manage:      'Saisie',
}

export default function MatchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('summary')

  const match = MATCHES.find(m => m.id === id)
  if (!match) return (
    <div className="p-8 text-center">
      <p className="text-surface-500">Match introuvable</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-brand-600 text-sm">← Retour</button>
    </div>
  )

  const team = getTeamById(match.teamId)
  const isPrivileged = ['president', 'coach'].includes(currentUser.role)
  const tabSet = TABS[isPrivileged ? currentUser.role : currentUser.role === 'player' ? 'player' : 'all'] ?? TABS.all

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      {/* Hero */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="gray">{match.competition}</Badge>
            <Badge variant={match.location === 'home' ? 'green' : 'orange'}>
              {match.location === 'home' ? 'Domicile' : 'Extérieur'}
            </Badge>
            <Badge variant={match.status === 'played' ? 'green' : 'blue'}>
              {match.status === 'played' ? 'Joué' : 'À venir'}
            </Badge>
          </div>
          <p className="text-sm text-surface-500">
            {format(parseISO(match.date), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}
          </p>
        </div>

        <div className="flex items-center justify-center gap-10 py-4">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-brand-700 font-display font-bold text-lg">{team?.name?.[0]}</span>
            </div>
            <p className="font-display font-semibold text-surface-900">{team?.name}</p>
          </div>

          <div className="text-center">
            {match.status === 'played' && match.score ? (
              <p className="font-display font-bold text-5xl text-surface-900">
                {match.score.home} – {match.score.away}
              </p>
            ) : (
              <div>
                <p className="font-display font-bold text-2xl text-surface-400">vs</p>
                <p className="text-xs text-surface-500 mt-1">
                  {format(parseISO(match.date), "HH'h'mm")}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-surface-700 font-display font-bold text-lg">{match.opponent[0]}</span>
            </div>
            <p className="font-display font-semibold text-surface-900">{match.opponent}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-surface-400 mt-2">
          <span className="flex items-center gap-1"><MapPin size={12} /> {match.ground}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {format(parseISO(match.date), "HH'h'mm")}</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-surface-200 rounded-xl p-1 w-fit">
        {tabSet.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'text-surface-600 hover:bg-surface-50'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {match.status === 'played' && match.scorers.length > 0 && (
            <Card className="p-5">
              <SectionHeader title="Événements du match" />
              <div className="space-y-2">
                {match.scorers.map((s, i) => {
                  const u = getUserById(s.userId)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-10 text-right text-xs font-semibold text-surface-500">{s.minute}'</span>
                      <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center">
                        <Target size={12} className="text-brand-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar user={u} size="xs" />
                        <span className="text-sm font-medium text-surface-800">{getFullName(u)}</span>
                      </div>
                      <Badge variant="brand">But</Badge>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
          {match.status === 'upcoming' && (
            <Card className="p-6 text-center">
              <Clock size={32} className="text-surface-300 mx-auto mb-2" />
              <p className="text-surface-500 text-sm">Le résumé sera disponible après le match</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'composition' && (
        <Card className="p-6">
          <SectionHeader title="Composition" />
          {match.squad.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-8">Composition non encore définie</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {match.squad.map(uid => {
                const u = getUserById(uid)
                return u ? (
                  <div key={uid} className="flex items-center gap-2 bg-surface-50 rounded-xl px-3 py-2">
                    <Avatar user={u} size="sm" />
                    <span className="text-sm font-medium text-surface-800">{getFullName(u)}</span>
                  </div>
                ) : null
              })}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'ratings' && currentUser.role === 'player' && (
        <Card className="p-6">
          <SectionHeader title="Notations partenaires" />
          {match.status !== 'played' ? (
            <p className="text-sm text-surface-400 text-center py-8">Disponible 48h après le match</p>
          ) : (
            <div className="space-y-3">
              {match.squad.filter(uid => uid !== currentUser.id).map(uid => {
                const u = getUserById(uid)
                return u ? (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size="sm" />
                    <span className="text-sm font-medium text-surface-800 flex-1">{getFullName(u)}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className="text-surface-300 hover:text-yellow-400 transition-colors">
                          <Star size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              })}
              {match.squad.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-6">Aucun coéquipier dans la composition</p>
              )}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'squad' && isPrivileged && (
        <Card className="p-6">
          <SectionHeader title="Convocations" />
          <p className="text-sm text-surface-400 text-center py-8">Gestion des convocations (à venir)</p>
        </Card>
      )}

      {activeTab === 'manage' && isPrivileged && (
        <Card className="p-6">
          <SectionHeader title="Saisie du score" />
          <p className="text-sm text-surface-400 text-center py-8">Saisie du score et des événements (à venir)</p>
        </Card>
      )}
    </div>
  )
}
