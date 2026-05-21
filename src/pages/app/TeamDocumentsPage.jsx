import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { Card, Avatar, SectionHeader } from '../../components/ui'
import { ArrowLeft, FileText, X, CheckCircle2, AlertCircle, XCircle, Upload, Download, Plus } from 'lucide-react'
import { USERS, DOCUMENTS, TEAMS } from '../../data/mock'

const DOC_TYPE_LABELS = {
  licence:           'Licence',
  certificat_medical:'Certificat médical',
  assurance:         'Assurance',
  carte_identite:    "Carte d'identité",
  photo_identite:    "Photo d'identité",
  autre:             'Autre',
}
const DOC_TYPES = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const INPUT_CLS = `w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm
                  text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                  focus:ring-brand-300 focus:border-brand-400 transition-all`
const LABEL_CLS = `block text-sm font-medium text-gray-700 mb-1`

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function docStatus(doc) {
  if (!doc) return 'missing'
  const expires = doc.expires_at ? new Date(doc.expires_at) : null
  if (!expires) return 'ok'
  const days = differenceInDays(expires, new Date())
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring'
  return 'ok'
}

function StatusIcon({ status }) {
  if (status === 'ok')      return <CheckCircle2 size={14} className="text-emerald-500" />
  if (status === 'expiring') return <AlertCircle  size={14} className="text-orange-500" />
  if (status === 'expired') return <XCircle      size={14} className="text-red-500" />
  return <XCircle size={14} className="text-surface-300" />
}

function StatusLabel({ doc, type }) {
  if (!doc) return <span className="text-xs text-surface-400">{DOC_TYPE_LABELS[type]} manquant</span>
  const expires = doc.expires_at ? new Date(doc.expires_at) : null
  const days    = expires ? differenceInDays(expires, new Date()) : null

  if (days !== null && days < 0)
    return <span className="text-xs text-red-600">Expiré le {format(expires, 'd/MM/yyyy')}</span>
  if (days !== null && days <= 30)
    return <span className="text-xs text-orange-500">Expire dans {days} jour{days > 1 ? 's' : ''}</span>
  if (expires)
    return <span className="text-xs text-surface-500">Expire le {format(expires, 'd/MM/yyyy')}</span>
  return <span className="text-xs text-emerald-600">Fourni</span>
}

function PlayerDocModal({ player, docs, allDocs, onClose, onAdd }) {
  const [showUpload, setShowUpload] = useState(false)
  const [docType,    setDocType]    = useState('licence')
  const [customName, setCustomName] = useState('')
  const [expiresAt,  setExpiresAt]  = useState('')
  const [fileName,   setFileName]   = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!fileName) return
    onAdd({
      id:          `doc-new-${Date.now()}`,
      user_id:     player.id,
      type:        docType,
      custom_name: customName.trim() || DOC_TYPE_LABELS[docType],
      filename:    fileName,
      file_size:   null,
      mime_type:   'application/pdf',
      expires_at:  expiresAt || null,
      uploaded_by: player.id,
      uploaded_at: new Date().toISOString(),
    })
    setShowUpload(false)
    setFileName('')
    setCustomName('')
    setExpiresAt('')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <Avatar user={player} size="md" />
            <div>
              <h3 className="font-bold text-gray-900">
                {player.firstName} {player.lastName}
              </h3>
              <p className="text-xs text-surface-400">{player.position} · N°{player.jerseyNumber}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-xl text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {docs.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-4">Aucun document</p>
          ) : docs.map(doc => {
            const uploader = USERS.find(u => u.id === doc.uploaded_by)
            const uploaderName = uploader && uploader.id !== player.id
              ? `${uploader.firstName} ${uploader.lastName}`
              : null
            const expires  = doc.expires_at ? new Date(doc.expires_at) : null
            const days     = expires ? differenceInDays(expires, new Date()) : null
            const isExpired  = days !== null && days < 0
            const isExpiring = days !== null && days >= 0 && days <= 30

            return (
              <div key={doc.id} className="p-4 bg-surface-50 border border-surface-100 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-brand-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">{doc.custom_name}</span>
                </div>
                <p className="text-xs text-surface-400">
                  {doc.filename} {doc.file_size ? `· ${formatFileSize(doc.file_size)}` : ''}
                </p>
                <p className="text-xs text-surface-400">
                  Ajouté le {format(new Date(doc.uploaded_at), 'd MMM yyyy', { locale: fr })}
                  {uploaderName ? ` par ${uploaderName}` : ''}
                </p>
                {expires && (
                  <p className={`text-xs font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-orange-500' : 'text-surface-500'}`}>
                    {isExpired ? `⚠️ Expiré le ${format(expires, 'd/MM/yyyy')}`
                      : isExpiring ? `⚠️ Expire dans ${days} jour${days > 1 ? 's' : ''}`
                      : `Expire le ${format(expires, 'd/MM/yyyy')}`
                    }
                  </p>
                )}
                <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700
                                   px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors font-medium mt-1">
                  <Download size={11} /> Télécharger
                </button>
              </div>
            )
          })}
        </div>

        <div className="p-5 border-t border-surface-100">
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-2.5 border-2 border-dashed border-surface-200 rounded-2xl
                         text-sm text-surface-400 hover:border-brand-300 hover:text-brand-600
                         transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Ajouter un document pour ce joueur
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Type <span className="text-red-500">*</span></label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className={INPUT_CLS}>
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Nom (optionnel)</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)}
                  placeholder={DOC_TYPE_LABELS[docType]} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Expiration (optionnel)</label>
                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="flex flex-col items-center justify-center gap-2 p-4
                                  border-2 border-dashed border-surface-200 rounded-2xl
                                  cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
                  <Upload size={16} className="text-surface-400" />
                  <span className="text-sm text-surface-500">
                    {fileName ? <span className="font-medium text-brand-700">{fileName}</span> : 'Choisir un fichier'}
                  </span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFileName(e.target.files?.[0]?.name ?? '')} className="sr-only" />
                </label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowUpload(false)}
                  className="flex-1 py-2 bg-surface-100 hover:bg-surface-200 text-gray-700
                             text-sm font-medium rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={!fileName}
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                             text-white text-sm font-medium rounded-xl transition-colors">
                  Ajouter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TeamDocumentsPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // État local des documents (pour permettre l'ajout en mock)
  const [docs, setDocs] = useState(DOCUMENTS)

  const [filterType,   setFilterType]   = useState('all')   // 'all' | 'licence' | 'certificat_medical' | 'assurance'
  const [filterStatus, setFilterStatus] = useState('all')   // 'all' | 'ok' | 'expiring' | 'missing'
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Équipes gérées par le coach courant
  const myTeamIds = currentUser.teamIds ?? []
  const myTeams   = TEAMS.filter(t => myTeamIds.includes(t.id))

  // Joueurs de ces équipes
  const myPlayers = USERS.filter(u =>
    u.role === 'player' && u.teamIds?.some(t => myTeamIds.includes(t))
  )

  const KEY_TYPES = ['licence', 'certificat_medical', 'assurance']

  function getPlayerDocs(playerId) {
    return docs.filter(d => d.user_id === playerId)
  }

  function getDocByType(playerId, type) {
    return docs.find(d => d.user_id === playerId && d.type === type) ?? null
  }

  // Filtrage
  const filteredPlayers = myPlayers.filter(player => {
    const playerDocs = getPlayerDocs(player.id)

    if (filterType !== 'all') {
      const doc    = getDocByType(player.id, filterType)
      const status = docStatus(doc)
      if (filterStatus === 'ok'       && status !== 'ok')      return false
      if (filterStatus === 'expiring' && status !== 'expiring') return false
      if (filterStatus === 'missing'  && doc !== null)          return false
    } else {
      if (filterStatus === 'ok') {
        const allOk = KEY_TYPES.every(t => docStatus(getDocByType(player.id, t)) === 'ok')
        if (!allOk) return false
      }
      if (filterStatus === 'expiring') {
        const anyExpiring = KEY_TYPES.some(t => docStatus(getDocByType(player.id, t)) === 'expiring')
        if (!anyExpiring) return false
      }
      if (filterStatus === 'missing') {
        const anyMissing = KEY_TYPES.some(t => getDocByType(player.id, t) === null)
        if (!anyMissing) return false
      }
    }

    return true
  })

  function addDoc(doc) {
    setDocs(prev => [...prev, doc])
  }

  const selectedDocs = selectedPlayer ? getPlayerDocs(selectedPlayer.id) : []

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800
                   mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-surface-900 mb-1">
          Documents équipe
        </h1>
        <p className="text-sm text-surface-500">
          {myTeams.map(t => t.name).join(', ')}
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-4 mb-5">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all',               label: 'Tous' },
                { id: 'licence',           label: 'Licences' },
                { id: 'certificat_medical',label: 'Certificats' },
                { id: 'assurance',         label: 'Assurances' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterType === f.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Statut</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all',      label: 'Tous' },
                { id: 'ok',       label: '✓ À jour' },
                { id: 'expiring', label: '⚠️ Expire bientôt' },
                { id: 'missing',  label: '✗ Manquant' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterStatus === f.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des joueurs */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-surface-400 text-sm">Aucun joueur ne correspond aux filtres</p>
          </Card>
        )}

        {filteredPlayers.map(player => {
          const playerDocs = getPlayerDocs(player.id)
          const hasNone    = playerDocs.length === 0

          return (
            <Card key={player.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={player} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    #{player.jerseyNumber} {player.firstName} {player.lastName}
                  </p>
                  <p className="text-xs text-surface-400">{player.position}</p>
                </div>
              </div>

              {hasNone ? (
                <p className="text-sm text-surface-400 mb-3">✗ Aucun document</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {KEY_TYPES.map(type => {
                    const doc    = getDocByType(player.id, type)
                    const status = docStatus(doc)
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <StatusIcon status={doc ? status : 'missing'} />
                        <StatusLabel doc={doc} type={type} />
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                onClick={() => setSelectedPlayer(player)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700
                           px-3 py-1.5 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
              >
                {hasNone ? 'Ajouter des documents' : 'Voir les documents'}
              </button>
            </Card>
          )
        })}
      </div>

      {selectedPlayer && (
        <PlayerDocModal
          player={selectedPlayer}
          docs={getPlayerDocs(selectedPlayer.id)}
          allDocs={docs}
          onClose={() => setSelectedPlayer(null)}
          onAdd={addDoc}
        />
      )}
    </div>
  )
}
