import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, differenceInYears, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth, MOCK_CLUBS } from '../../context/AuthContext'
import { useClubData } from '../../hooks/useClubData'
import { Avatar, Card, LicenseBadge, EmptyState, SectionHeader } from '../../components/ui'
import { ArrowLeft, FileText, Pencil, Upload, X, Download, Trash2, Plus, ChevronDown } from 'lucide-react'
import {
  getClubById, leaveClub, canPresidentLeave,
  createClub, updateUser, createUserRole, getSports, resolvePostalCode,
} from '../../services/db'
import { DOCUMENTS, TEAMS, MOCK_PLAYER_STATS, mockExperiences, SPORTS as SPORTS_INFO } from '../../data/mock'

// ─── Constantes ────────────────────────────────────────────────────────────────

const INPUT_CLS = `w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm
                  text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                  focus:ring-brand-300 focus:border-brand-400 transition-all`
const LABEL_CLS = `block text-sm font-medium text-gray-700 mb-1`

const ROLE_LABELS = {
  president: 'Président',
  staff:     'Intendant',
  coach:     'Coach',
  player:    'Joueur',
  community: 'Communauté',
  supporter: 'Communauté', // legacy compat
  parent:    'Parent',
}

const DOC_TYPE_LABELS = {
  licence:            'Licence',
  certificat_medical: 'Certificat médical',
  assurance:          'Assurance',
  carte_identite:     "Carte d'identité",
  photo_identite:     "Photo d'identité",
  autre:              'Autre',
}
const DOC_TYPES = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({ value, label }))

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function Field({ label, value, children }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-surface-100 last:border-0">
      <span className="text-sm text-surface-500 flex-shrink-0 w-44">{label}</span>
      <span className="text-sm font-medium text-surface-900 text-right">
        {children ?? value ?? <span className="text-surface-300 font-normal">Non renseigné</span>}
      </span>
    </div>
  )
}

// ─── DocCard ───────────────────────────────────────────────────────────────────

function DocCard({ doc, canDelete, onDelete }) {
  const expiresAt  = doc.expires_at ? new Date(doc.expires_at) : null
  const daysLeft   = expiresAt ? differenceInDays(expiresAt, new Date()) : null
  const isExpired  = daysLeft !== null && daysLeft < 0
  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30

  return (
    <div className="p-4 bg-surface-50 border border-surface-200 rounded-2xl space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{doc.custom_name}</p>
            <p className="text-xs text-surface-400 truncate">
              {doc.filename}{doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(doc.id)}
            className="flex-shrink-0 p-1.5 text-surface-400 hover:text-red-500
                       hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-surface-400 flex-wrap">
        <span>Ajouté le {format(new Date(doc.uploaded_at), 'd MMM yyyy', { locale: fr })}</span>
        {expiresAt && (
          <span className={`font-medium ${
            isExpired ? 'text-red-600' : isExpiring ? 'text-orange-500' : 'text-surface-500'
          }`}>
            {isExpired
              ? `⚠️ Expiré le ${format(expiresAt, 'd MMM yyyy', { locale: fr })}`
              : isExpiring
                ? `⚠️ Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
                : `Expire le ${format(expiresAt, 'd MMM yyyy', { locale: fr })}`
            }
          </span>
        )}
      </div>

      <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700
                         px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors font-medium">
        <Download size={11} /> Télécharger
      </button>
    </div>
  )
}

// ─── UploadDocumentModal ───────────────────────────────────────────────────────

function UploadDocumentModal({ targetUserId, onClose, onAdd }) {
  const [docType,    setDocType]    = useState('licence')
  const [customName, setCustomName] = useState('')
  const [expiresAt,  setExpiresAt]  = useState('')
  const [fileName,   setFileName]   = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!fileName) return
    onAdd({
      id:          `doc-new-${Date.now()}`,
      user_id:     targetUserId,
      type:        docType,
      custom_name: customName.trim() || DOC_TYPE_LABELS[docType],
      filename:    fileName,
      file_size:   null,
      mime_type:   'application/pdf',
      expires_at:  expiresAt || null,
      uploaded_by: targetUserId,
      uploaded_at: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <Card className="w-full md:max-w-md md:rounded-2xl rounded-none flex-1 md:flex-none overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">Ajouter un document</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Type <span className="text-red-500">*</span></label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className={INPUT_CLS}>
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Nom personnalisé</label>
            <input value={customName} onChange={e => setCustomName(e.target.value)}
              placeholder={DOC_TYPE_LABELS[docType]} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Date d'expiration</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Fichier <span className="text-red-500">*</span></label>
            <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed
                              border-surface-200 rounded-2xl cursor-pointer hover:border-brand-300
                              hover:bg-brand-50 transition-colors">
              <Upload size={20} className="text-surface-400" />
              <span className="text-sm text-surface-500 text-center">
                {fileName
                  ? <span className="font-medium text-brand-700">{fileName}</span>
                  : <>Choisir un fichier<br /><span className="text-xs">PDF, JPG, PNG — max 5 Mo</span></>
                }
              </span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name) }}
                className="sr-only" />
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-700
                         text-sm font-medium rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={!fileName}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50
                         text-white text-sm font-medium rounded-xl transition-colors">
              Ajouter
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

// ─── ExperienceModal ──────────────────────────────────────────────────────────

function ExperienceModal({ experience, onSave, onClose }) {
  const [role,        setRole]        = useState(experience?.role || 'player')
  const [clubName,    setClubName]    = useState(experience?.club_name || '')
  const [teamName,    setTeamName]    = useState(experience?.team_name || '')
  const [position,    setPosition]    = useState(experience?.position || '')
  const [startDate,   setStartDate]   = useState(experience?.start_date || '')
  const [endDate,     setEndDate]     = useState(experience?.end_date || '')
  const [isCurrent,   setIsCurrent]   = useState(!experience?.end_date)
  const [description, setDescription] = useState(experience?.description || '')

  const roles = [
    { value: 'player',    label: '⚽ Joueur' },
    { value: 'coach',     label: '👔 Coach' },
    { value: 'president', label: '👔 Président' },
    { value: 'staff',     label: '🏥 Intendant/Staff' },
    { value: 'community', label: '👥 Communauté' },
  ]

  function handleSave() {
    if (!clubName.trim() || !startDate) {
      alert('Club et date de début obligatoires')
      return
    }
    onSave({
      id:          experience?.id || `exp-${Date.now()}`,
      role,
      club_name:   clubName.trim(),
      team_name:   teamName.trim() || null,
      position:    (role === 'player' && position.trim()) ? position.trim() : null,
      start_date:  startDate,
      end_date:    isCurrent ? null : endDate,
      description: description.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl shadow-xl flex-1 md:flex-none overflow-y-auto p-4 md:p-6 md:max-h-[90vh]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            {experience ? "Modifier l'expérience" : 'Ajouter une expérience'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={LABEL_CLS}>Rôle *</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); if (r.value !== 'player') setPosition('') }}
                  className={`p-3 rounded-xl border-2 transition-all text-left text-sm font-medium ${
                    role === r.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-surface-200 hover:border-brand-300 text-gray-900'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Club *</label>
            <input type="text" value={clubName} onChange={e => setClubName(e.target.value)}
              placeholder="Ex : FC Lens Académie, AS Liévin…" className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Équipe/Catégorie{role !== 'community' && ' *'}</label>
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="Ex : Séniors A, U19, U13…" className={INPUT_CLS} />
          </div>

          {role === 'player' && (
            <div>
              <label className={LABEL_CLS}>Poste sur le terrain</label>
              <select value={position} onChange={e => setPosition(e.target.value)} className={INPUT_CLS}>
                <option value="">Choisir un poste…</option>
                <option>Gardien</option>
                <option>Défenseur</option>
                <option>Latéral</option>
                <option>Milieu</option>
                <option>Ailier</option>
                <option>Attaquant</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Début *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Fin</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                disabled={isCurrent} className={`${INPUT_CLS} disabled:bg-surface-50`} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isCurrent}
              onChange={e => { setIsCurrent(e.target.checked); if (e.target.checked) setEndDate('') }} />
            <span className="text-sm font-medium text-gray-700">Je suis actuellement en poste ici</span>
          </label>

          <div>
            <label className={LABEL_CLS}>Description (optionnel)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Parlez de votre rôle, accomplissements, raison du départ…"
              className={`${INPUT_CLS} resize-none`} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            Annuler
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
            {experience ? 'Mettre à jour' : "Ajouter l'expérience"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ExperienceSection ────────────────────────────────────────────────────────

function ExperienceSection({ userId, isMyProfile }) {
  const [experiences, setExperiences] = useState(() =>
    mockExperiences
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  )
  const [showModal,   setShowModal]   = useState(false)
  const [editingExp,  setEditingExp]  = useState(null)

  const handleSave = (exp) => {
    setExperiences(prev => {
      const exists = prev.find(e => e.id === exp.id)
      return exists
        ? prev.map(e => e.id === exp.id ? exp : e)
        : [exp, ...prev]
    })
    setShowModal(false)
    setEditingExp(null)
  }

  const handleDelete = (expId) => {
    if (window.confirm('Supprimer cette expérience ?')) {
      setExperiences(prev => prev.filter(e => e.id !== expId))
    }
  }

  const roleIcon = (role) => ({ player: '⚽', coach: '👔', president: '👔', staff: '🏥', community: '👥', supporter: '👥' }[role] ?? '📋')
  const roleLabel = (role) => ({ player: 'Joueur', coach: 'Coach', president: 'Président', staff: 'Intendant/Staff', community: 'Communauté', supporter: 'Communauté' }[role] ?? role)

  const formatDates = (start, end) => {
    const s = new Date(start)
    const sStr = s.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    const e = end ? new Date(end) : new Date()
    const totalMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    const duration = [years > 0 && `${years} an${years > 1 ? 's' : ''}`, months > 0 && `${months} mois`].filter(Boolean).join(' ')

    if (!end) {
      const eStr = 'Présent'
      return `${sStr} - ${eStr}${duration ? ` (${duration})` : ''}`
    }
    const eStr = e.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    return `${sStr} - ${eStr}${duration ? ` (${duration})` : ''}`
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">💼 Expérience</h2>
        {isMyProfile && (
          <button
            onClick={() => { setEditingExp(null); setShowModal(true) }}
            className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            <Plus size={12} /> Ajouter
          </button>
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm">
            {isMyProfile
              ? 'Aucune expérience. Cliquez sur "Ajouter" pour commencer !'
              : 'Aucune expérience renseignée.'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map(exp => (
            <div key={exp.id} className="pb-4 border-b border-surface-100 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {roleIcon(exp.role)} {roleLabel(exp.role)} · {exp.club_name}
                    {exp.team_name && ` — ${exp.team_name}`}
                  </div>
                  {exp.position && (
                    <div className="text-xs text-gray-500 mt-0.5">📍 {exp.position}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDates(exp.start_date, exp.end_date)}
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{exp.description}</p>
                  )}
                </div>
                {isMyProfile && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditingExp(exp); setShowModal(true) }}
                      className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Modifier">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ExperienceModal
          experience={editingExp}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingExp(null) }}
        />
      )}
    </Card>
  )
}

// ─── EditBioModal ─────────────────────────────────────────────────────────────

function EditBioModal({ currentBio, onSave, onClose }) {
  const [bio, setBio] = useState(currentBio || '')

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-gray-900">Modifier votre bio</h2>
        <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
          <X size={18} />
        </button>
      </div>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        maxLength={300}
        rows={5}
        placeholder="Présentez-vous en quelques lignes..."
        className={`${INPUT_CLS} resize-none mb-2`}
      />
      <div className="text-xs text-gray-400 text-right mb-4">{bio.length}/300</div>
      <div className="flex gap-3">
        <button onClick={onClose}
                className="flex-1 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-700
                           text-sm font-medium rounded-xl transition-colors">
          Annuler
        </button>
        <button onClick={() => onSave(bio)}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white
                           text-sm font-medium rounded-xl transition-colors">
          Enregistrer
        </button>
      </div>
    </>
  )
}

// ─── RolesSection ─────────────────────────────────────────────────────────────

const ROLE_ICON_MAP = { president: '👔', staff: '🏥', coach: '👨‍🏫', player: '⚽', community: '👥', supporter: '👥' }
const ROLE_LABEL_MAP = { president: 'Président', staff: 'Intendant', coach: 'Coach', player: 'Joueur', community: 'Communauté', supporter: 'Communauté' }

function RolesSection({ user }) {
  const roles = user?.roles ?? []
  if (!roles.length) return null

  // Group roles by sport
  const rolesBySport = {}
  const noSportRoles = []
  roles.forEach(r => {
    if (r.sport) {
      if (!rolesBySport[r.sport]) rolesBySport[r.sport] = []
      rolesBySport[r.sport].push(r)
    } else {
      noSportRoles.push(r)
    }
  })

  const hasSportGroups = Object.keys(rolesBySport).length > 0

  return (
    <Card className="p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">👔 Rôles ({roles.length})</h2>

      {hasSportGroups ? (
        <div className="space-y-4">
          {Object.entries(rolesBySport).map(([sport, sportRoles]) => {
            const sportInfo = SPORTS_INFO[sport]
            return (
              <div key={sport}>
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-surface-200">
                  <span className="text-lg">{sportInfo?.icon ?? '🏆'}</span>
                  <h3 className="text-sm font-semibold text-gray-700">{sportInfo?.name ?? sport}</h3>
                </div>
                <div className="space-y-2 ml-1">
                  {sportRoles.map((r, idx) => {
                    const club = MOCK_CLUBS[r.club_id]
                    return (
                      <div key={r.id ?? idx} className="p-3 bg-surface-50 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {ROLE_ICON_MAP[r.role] ?? '📋'} {ROLE_LABEL_MAP[r.role] ?? r.role}
                          </div>
                          {(club || r.club_name) && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {club?.emoji_icon ?? ''} {club?.name ?? r.club_name}
                              {r.position && <span> · {r.position}</span>}
                              {r.jersey_number && <span> · #{r.jersey_number}</span>}
                              {r.teams?.length > 0 && <span> · {r.teams.length} équipe{r.teams.length > 1 ? 's' : ''}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {noSportRoles.map((r, idx) => {
            const club = MOCK_CLUBS[r.club_id]
            return (
              <div key={idx} className="p-3 bg-surface-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {ROLE_ICON_MAP[r.role] ?? '📋'} {ROLE_LABEL_MAP[r.role] ?? r.role}
                  </div>
                  {club && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {club.emoji_icon} {club.name}
                      {r.teams?.length > 0 && <span> · {r.teams.length} équipe{r.teams.length > 1 ? 's' : ''}</span>}
                    </div>
                  )}
                  {!club && r.club_id == null && (
                    <div className="text-xs text-gray-400 mt-0.5">Sans club</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((r, idx) => {
            const club = MOCK_CLUBS[r.club_id]
            return (
              <div key={idx} className="p-3 bg-surface-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {ROLE_ICON_MAP[r.role] ?? '📋'} {ROLE_LABEL_MAP[r.role] ?? r.role}
                  </div>
                  {club && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {club.emoji_icon} {club.name}
                      {r.teams?.length > 0 && <span> · {r.teams.length} équipe{r.teams.length > 1 ? 's' : ''}</span>}
                    </div>
                  )}
                  {!club && r.club_id == null && (
                    <div className="text-xs text-gray-400 mt-0.5">Sans club</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {roles.length > 1 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-700">
          Rôle principal : <strong>{ROLE_LABEL_MAP[user.current_role] ?? user.current_role}</strong>
          {user.current_sport && SPORTS_INFO[user.current_sport] && (
            <> · {SPORTS_INFO[user.current_sport].icon} {SPORTS_INFO[user.current_sport].name}</>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { currentUser, refreshUser, is, isOneOf } = useAuth()
  const { users, loading } = useClubData()

  const isPrivileged = isOneOf('president', 'coach')
  const targetUser   = id ? users.find(u => u.id === id) : currentUser
  const isOwnProfile = !id || id === currentUser.id

  // ── Données club ─────────────────────────────────────────────────────────────
  const [club,            setClub]           = useState(null)
  const [isLastPresident, setIsLastPresident] = useState(false)

  // ── Quitter le club ──────────────────────────────────────────────────────────
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [leaveLoading,     setLeaveLoading]     = useState(false)
  const [leaveError,       setLeaveError]       = useState('')

  // ── Édition profil ───────────────────────────────────────────────────────────
  const [editing,        setEditing]        = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [editError,      setEditError]      = useState('')
  const [editFirstName,  setEditFirstName]  = useState('')
  const [editLastName,   setEditLastName]   = useState('')
  const [editBirthDate,  setEditBirthDate]  = useState('')
  const [editBirthPlace, setEditBirthPlace] = useState('')
  const [editPhone,      setEditPhone]      = useState('')
  const [editAddress,    setEditAddress]    = useState('')
  const [editPostalCode, setEditPostalCode] = useState('')
  const [editCity,       setEditCity]       = useState('')
  const [editCountry,    setEditCountry]    = useState('France')
  const [editPostalInfo, setEditPostalInfo] = useState('')
  const [editDep,        setEditDep]        = useState(null)
  const [editRegion,     setEditRegion]     = useState(null)

  // ── Photo & Bio ──────────────────────────────────────────────────────────────
  const photoKey = `profile_photo_${id || currentUser?.id}`
  const bioKey   = `profile_bio_${id || currentUser?.id}`
  const [profilePhoto,    setProfilePhoto]    = useState(() => localStorage.getItem(photoKey) ?? null)
  const [bio,             setBio]             = useState(() => localStorage.getItem(bioKey) ?? (id ? '' : ''))
  const [showPhotoModal,  setShowPhotoModal]  = useState(false)
  const [showBioEdit,     setShowBioEdit]     = useState(false)

  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setProfilePhoto(ev.target.result)
      localStorage.setItem(photoKey, ev.target.result)
      setShowPhotoModal(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveBio = (newBio) => {
    setBio(newBio)
    localStorage.setItem(bioKey, newBio)
    setShowBioEdit(false)
  }

  // ── Documents ────────────────────────────────────────────────────────────────
  const [documents,       setDocuments]       = useState(() => DOCUMENTS.filter(d => d.user_id === (id || currentUser?.id)))
  const [showUploadModal, setShowUploadModal] = useState(false)

  // ── Création club ─────────────────────────────────────────────────────────────
  const [showCreateClub,  setShowCreateClub]  = useState(false)
  const [sports,          setSports]          = useState([])
  const [clubName,        setClubName]        = useState('')
  const [clubSport,       setClubSport]       = useState('')
  const [clubCity,        setClubCity]        = useState('')
  const [clubCountry,     setClubCountry]     = useState('France')
  const [clubPostalCode,  setClubPostalCode]  = useState('')
  const [postalResolved,  setPostalResolved]  = useState(null)
  const [postalResolving, setPostalResolving] = useState(false)
  const [clubEmail,       setClubEmail]       = useState('')
  const [clubPhone,       setClubPhone]       = useState('')
  const [createLoading,   setCreateLoading]   = useState(false)
  const [createError,     setCreateError]     = useState('')

  // ── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (targetUser?.id) setDocuments(DOCUMENTS.filter(d => d.user_id === targetUser.id))
  }, [targetUser?.id])

  useEffect(() => {
    if (!currentUser?.current_club_id) { setClub(null); return }
    getClubById(currentUser.current_club_id).then(setClub).catch(() => {})
  }, [currentUser?.current_club_id])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'president' || !currentUser.current_club_id) return
    canPresidentLeave(currentUser.id, currentUser.current_club_id)
      .then(can => setIsLastPresident(!can))
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    if (!showCreateClub || sports.length > 0) return
    getSports().then(list => setSports(list ?? [])).catch(() => {})
  }, [showCreateClub])

  useEffect(() => {
    setPostalResolved(null)
    const code = clubPostalCode.trim()
    if (clubCountry !== 'France' || code.length < 2) return
    setPostalResolving(true)
    resolvePostalCode(code).then(r => setPostalResolved(r)).catch(() => {}).finally(() => setPostalResolving(false))
  }, [clubPostalCode, clubCountry])

  // ── Données dérivées ─────────────────────────────────────────────────────────
  const uid = targetUser?.id ?? currentUser?.id

  const currentSeasonStats = MOCK_PLAYER_STATS.find(s => s.user_id === uid)

  const mockTeam     = TEAMS.find(t => (targetUser?.teamIds ?? targetUser?.teams ?? []).includes(t.id))
  const mockClubName = club?.name ?? (targetUser?.current_club_id ? MOCK_CLUBS[targetUser.current_club_id]?.name : null) ?? null

  const firstName = targetUser?.firstName ?? targetUser?.first_name ?? ''
  const lastName  = targetUser?.lastName  ?? targetUser?.last_name  ?? ''
  const initials  = `${firstName[0] ?? ''}${lastName[0] ?? ''}`
  const birthDate = targetUser?.birthDate ?? targetUser?.birth_date ?? null
  const age       = birthDate ? differenceInYears(new Date(), new Date(birthDate)) : null
  const birthDateFmt = birthDate ? format(new Date(birthDate), 'd MMMM yyyy', { locale: fr }) : null
  const birthPlace   = targetUser?.birthPlace ?? targetUser?.birth_place ?? null
  const position     = targetUser?.position ?? null
  const jerseyNum    = targetUser?.jerseyNumber ?? targetUser?.jersey_number ?? null

  const roleLabel = (() => {
    if (!targetUser) return ''
    if (targetUser.role === 'president') return `Président${mockClubName ? ` · ${mockClubName}` : ''}`
    if (targetUser.role === 'coach')     return mockTeam ? `Coach · ${mockTeam.name}` : 'Coach'
    if (targetUser.role === 'player')    return mockTeam ? `Joueur · ${mockTeam.name}` : 'Joueur'
    return ROLE_LABELS[targetUser.role] ?? targetUser.role
  })()

  // ── Handlers édition ─────────────────────────────────────────────────────────
  const startEditing = () => {
    const u = currentUser
    setEditFirstName(u.firstName ?? u.first_name ?? '')
    setEditLastName(u.lastName   ?? u.last_name  ?? '')
    setEditBirthDate(u.birthDate?.slice(0, 10) ?? u.birth_date?.slice(0, 10) ?? '')
    setEditBirthPlace(u.birthPlace ?? u.birth_place ?? '')
    setEditPhone(u.phone ?? '')
    setEditAddress(u.address ?? '')
    setEditPostalCode(u.postalCode ?? u.postal_code ?? '')
    setEditCity(u.city ?? '')
    setEditCountry(u.country ?? 'France')
    setEditPostalInfo('')
    setEditDep(u.department ?? null)
    setEditRegion(u.region ?? null)
    setEditError('')
    setEditing(true)
  }

  const handleEditPostalChange = async (value) => {
    setEditPostalCode(value)
    if (editCountry.toLowerCase() === 'france' && value.length >= 2) {
      try {
        const r = await resolvePostalCode(value)
        if (r) {
          setEditDep(r.departement)
          setEditRegion(r.region)
          setEditPostalInfo(`📍 ${r.departement} — ${r.region}`)
        } else {
          setEditPostalInfo(''); setEditDep(null); setEditRegion(null)
        }
      } catch {
        setEditPostalInfo('')
      }
    } else {
      setEditPostalInfo(''); setEditDep(null); setEditRegion(null)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true); setEditError('')
    try {
      let dep = editDep, region = editRegion
      if (editCountry.toLowerCase() === 'france' && editPostalCode?.length >= 2 && !dep) {
        try {
          const r = await resolvePostalCode(editPostalCode)
          if (r) { dep = r.departement; region = r.region }
        } catch {}
      }
      await updateUser(currentUser.id, {
        first_name: editFirstName.trim(), last_name: editLastName.trim(),
        birth_date: editBirthDate || null, birth_place: editBirthPlace || null,
        phone: editPhone || null, address: editAddress || null,
        postal_code: editPostalCode || null, city: editCity || null,
        country: editCountry || 'France', department: dep || null, region: region || null,
      })
      await refreshUser()
      setEditing(false)
    } catch (err) {
      setEditError(err.message ?? 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateClub = async (e) => {
    e.preventDefault(); setCreateError(''); setCreateLoading(true)
    try {
      const created = await createClub({
        name: clubName.trim(), sport_id: clubSport || null,
        city: clubCity.trim() || null, country: clubCountry.trim() || null,
        postal_code: clubPostalCode.trim() || null,
        department: postalResolved?.departement ?? null, region: postalResolved?.region ?? null,
        email: clubEmail.trim() || null, phone: clubPhone.trim() || null,
      })
      await updateUser(currentUser.id, { current_club_id: created.id })
      await createUserRole({ user_id: currentUser.id, role_type: 'president', scope_type: 'club', scope_id: created.id })
      await refreshUser()
      setShowCreateClub(false)
    } catch (err) {
      setCreateError(err.message ?? 'Une erreur est survenue')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleLeaveClub = async () => {
    setLeaveLoading(true); setLeaveError('')
    try {
      if (currentUser.role === 'president') {
        const canLeave = await canPresidentLeave(currentUser.id, currentUser.current_club_id)
        if (!canLeave) { setLeaveError('Nommez un autre président avant de partir.'); return }
      }
      await leaveClub(currentUser.id, currentUser.current_club_id)
      await refreshUser()
      setShowLeaveConfirm(false)
      navigate('/app/profile')
    } catch (err) {
      setLeaveError(err.message ?? 'Une erreur est survenue')
    } finally {
      setLeaveLoading(false)
    }
  }

  // ── Permissions contact (RGPD) ───────────────────────────────────────────────
  const canViewContact = isOwnProfile || isPrivileged ||
    (currentUser.teamIds ?? []).some(t => (targetUser?.teamIds ?? []).includes(t))

  // ── Gardes ────────────────────────────────────────────────────────────────────
  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }
  if (!targetUser) {
    return <div className="p-8 max-w-lg mx-auto"><EmptyState title="Profil introuvable" description="Ce membre n'existe pas." /></div>
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────────
  return (
    <div className="px-3 md:px-6 py-4 md:py-6 max-w-2xl mx-auto space-y-4 md:space-y-5">

      {/* Retour */}
      {!isOwnProfile && (
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>
      )}

      {/* ── Bannière : pas de club ─────────────────────────────────────────── */}
      {isOwnProfile && !currentUser.current_club_id && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl overflow-hidden">
          {!showCreateClub ? (
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-brand-900">Vous n'êtes dans aucun club</div>
                <div className="text-sm text-brand-600 mt-0.5">
                  Rejoignez un club depuis l'onglet Équipes, ou créez le vôtre.
                </div>
              </div>
              <button onClick={() => setShowCreateClub(true)}
                className="flex-shrink-0 px-3 py-1.5 bg-brand-600 hover:bg-brand-700
                           text-white text-sm font-medium rounded-xl transition-colors">
                Créer mon club
              </button>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-brand-900">Créer mon club</div>
                <button onClick={() => { setShowCreateClub(false); setCreateError('') }}
                  className="text-brand-400 hover:text-brand-700 text-sm">Annuler</button>
              </div>
              <form onSubmit={handleCreateClub} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-brand-800 mb-1">Nom du club *</label>
                    <input required value={clubName} onChange={e => setClubName(e.target.value)}
                      placeholder="FC Saint-Denis"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Sport</label>
                    <div className="relative">
                      <select value={clubSport} onChange={e => setClubSport(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                   appearance-none focus:outline-none focus:ring-2 focus:ring-brand-300 pr-8">
                        <option value="">— Sport —</option>
                        {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2
                                                        text-brand-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Ville</label>
                    <input value={clubCity} onChange={e => setClubCity(e.target.value)} placeholder="Paris"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Pays</label>
                    <input value={clubCountry} onChange={e => setClubCountry(e.target.value)} placeholder="France"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-brand-800 mb-1">Code postal</label>
                    <input value={clubPostalCode} onChange={e => setClubPostalCode(e.target.value)}
                      placeholder="75001" maxLength={10}
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                    {postalResolving && <p className="text-xs text-brand-400 mt-1">Résolution…</p>}
                    {!postalResolving && postalResolved && (
                      <p className="text-xs text-gray-400 mt-1">📍 {postalResolved.departement} — {postalResolved.region}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Email</label>
                    <input type="email" value={clubEmail} onChange={e => setClubEmail(e.target.value)}
                      placeholder="contact@club.fr"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-800 mb-1">Téléphone</label>
                    <input type="tel" value={clubPhone} onChange={e => setClubPhone(e.target.value)}
                      placeholder="01 xx xx xx xx"
                      className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-300" />
                  </div>
                </div>
                {createError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {createError}
                  </div>
                )}
                <button type="submit" disabled={createLoading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium
                             text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center
                             justify-center gap-2">
                  {createLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Créer le club'
                  }
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <Card className="p-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Photo de profil"
                 className="w-24 h-24 rounded-full object-cover border-4 border-brand-100" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-600 flex items-center
                            justify-center text-white font-bold text-2xl">
              {initials || '?'}
            </div>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-brand-600 text-white rounded-full
                         flex items-center justify-center hover:bg-brand-700 shadow-lg transition-colors"
              title="Modifier la photo">
              ✏️
            </button>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
          {firstName} {lastName}
        </h1>
        {age !== null && <div className="text-gray-500 text-sm mb-3">{age} ans</div>}

        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {(targetUser.role === 'supporter' || targetUser.role === 'community') ? (
            <span className="px-3 py-1.5 bg-surface-100 rounded-full text-gray-600 text-sm font-medium">
              👥 Communauté
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-brand-50 rounded-full text-brand-700 text-sm font-medium">
              ⚽ {roleLabel}
            </span>
          )}
          {position && (
            <span className="px-3 py-1.5 bg-surface-100 rounded-full text-gray-600 text-sm">
              {position}{jerseyNum ? ` · #${jerseyNum}` : ''}
            </span>
          )}
        </div>

        {(targetUser.city || targetUser.department) && (
          <div className="text-sm text-gray-400 mb-4">
            📍 {[targetUser.city, targetUser.department].filter(Boolean).join(', ')}
          </div>
        )}

        {isOwnProfile && !editing && (
          <button onClick={startEditing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-surface-200
                       text-sm text-gray-600 hover:bg-surface-100 rounded-xl transition-colors">
            <Pencil size={14} /> Modifier mon profil
          </button>
        )}

        {!isOwnProfile && (
          <button
            onClick={() => navigate('/app/messages', { state: { startConversationWith: targetUser.id } })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700
                       text-white text-sm font-medium rounded-xl transition-colors">
            💬 Envoyer un message
          </button>
        )}

        {isOwnProfile && currentUser.current_club_id && !editing && (
          <div className="mt-4 pt-4 border-t border-surface-100">
            <button onClick={() => { setLeaveError(''); setShowLeaveConfirm(true) }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors">
              Quitter le club
            </button>
          </div>
        )}
      </Card>

      {/* ── Formulaire d'édition ──────────────────────────────────────────────── */}
      {isOwnProfile && editing && (
        <Card className="p-5">
          <SectionHeader title="Modifier mon profil" className="mb-0" />
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Prénom *</label>
                <input value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                  placeholder="Prénom" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Nom *</label>
                <input value={editLastName} onChange={e => setEditLastName(e.target.value)}
                  placeholder="Nom" className={INPUT_CLS} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Date de naissance</label>
                <input type="date" value={editBirthDate}
                  onChange={e => setEditBirthDate(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Lieu de naissance</label>
                <input value={editBirthPlace} onChange={e => setEditBirthPlace(e.target.value)}
                  placeholder="Paris (75)" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Téléphone</label>
              <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                placeholder="06 xx xx xx xx" className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Adresse</label>
              <input value={editAddress} onChange={e => setEditAddress(e.target.value)}
                placeholder="12 rue du Stade" className={INPUT_CLS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Code postal</label>
                <input value={editPostalCode} maxLength={10}
                  onChange={e => handleEditPostalChange(e.target.value)}
                  placeholder="75001" className={INPUT_CLS} />
                {editPostalInfo && editCountry.toLowerCase() === 'france' && (
                  <div className="text-xs text-brand-600 mt-1">{editPostalInfo}</div>
                )}
              </div>
              <div>
                <label className={LABEL_CLS}>Ville</label>
                <input value={editCity} onChange={e => setEditCity(e.target.value)}
                  placeholder="Paris" className={INPUT_CLS} />
              </div>
            </div>
            <div>
              <label className={LABEL_CLS}>Pays</label>
              <input value={editCountry}
                onChange={e => { setEditCountry(e.target.value); setEditPostalInfo('') }}
                placeholder="France" className={INPUT_CLS} />
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {editError}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(false)}
                className="flex-1 py-2 bg-surface-100 hover:bg-surface-200 text-gray-700
                           text-sm font-medium rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                           text-white text-sm font-medium rounded-xl transition-colors
                           flex items-center justify-center gap-2">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Enregistrer'
                }
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Bio ──────────────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">📝 À propos</h2>
          {isOwnProfile && (
            <button onClick={() => setShowBioEdit(true)}
                    className="text-xs text-brand-600 hover:underline">
              Modifier
            </button>
          )}
        </div>
        {bio ? (
          <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {isOwnProfile
              ? 'Présentez-vous ! Cliquez sur "Modifier" pour ajouter une description.'
              : 'Aucune description pour l\'instant.'}
          </p>
        )}
      </Card>

      {/* ── Stats saison (joueurs uniquement) ─────────────────────────────────── */}
      {targetUser.role === 'player' && currentSeasonStats && (
        <Card className="p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            📊 Saison {currentSeasonStats.season}
            <span className="ml-2 normal-case tracking-normal text-xs bg-brand-100 text-brand-700
                             px-2 py-0.5 rounded-full font-medium">En cours</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4">
            {[
              { label: 'Matchs',  value: currentSeasonStats.matches,                              color: 'text-gray-900' },
              { label: 'Buts',    value: currentSeasonStats.goals,                                color: 'text-emerald-600' },
              { label: 'Passes',  value: currentSeasonStats.assists,                              color: 'text-sky-600' },
              { label: '⭐ Note', value: currentSeasonStats.average_rating?.toFixed(1) ?? '—',   color: 'text-brand-600' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-surface-50 rounded-xl">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Minutes jouées',   value: `${currentSeasonStats.minutes_played} min` },
              { label: 'Taux de présence', value: `${currentSeasonStats.attendance_rate}%` },
              { label: 'Cartons jaunes',   value: currentSeasonStats.yellow_cards },
              { label: 'Cartons rouges',   value: currentSeasonStats.red_cards },
            ].map(d => (
              <div key={d.label} className="p-3 bg-surface-50 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">{d.label}</div>
                <div className="font-semibold text-gray-900 text-sm">{d.value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Rôles ────────────────────────────────────────────────────────────── */}
      {isOwnProfile && <RolesSection user={currentUser} />}

      {/* ── Expérience LinkedIn-style ─────────────────────────────────────────── */}
      <ExperienceSection userId={uid} isMyProfile={isOwnProfile} />

      {/* ── Informations personnelles ─────────────────────────────────────────── */}
      <Card className="p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          👤 Informations personnelles
        </h2>
        <div className="mt-2">
          {birthDateFmt && (
            <Field label="Date de naissance"
              value={`${birthDateFmt}${age !== null ? ` (${age} ans)` : ''}`} />
          )}
          {birthPlace && <Field label="Lieu de naissance" value={birthPlace} />}
          {targetUser.role === 'player' && position && <Field label="Poste" value={position} />}
          {targetUser.role === 'player' && jerseyNum && <Field label="N° de maillot" value={`#${jerseyNum}`} />}
          {canViewContact ? (
            <>
              <Field label="Email" value={targetUser.email} />
              <Field label="Téléphone" value={targetUser.phone} />
              {(targetUser.address || targetUser.postal_code || targetUser.postalCode || targetUser.city) && (
                <Field label="Adresse">
                  <span>
                    {[
                      targetUser.address,
                      [(targetUser.postal_code ?? targetUser.postalCode), targetUser.city].filter(Boolean).join(' '),
                    ].filter(Boolean).join(', ')}
                    {(targetUser.department || targetUser.region) && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {[targetUser.department, targetUser.region].filter(Boolean).join(' — ')}
                      </span>
                    )}
                  </span>
                </Field>
              )}
            </>
          ) : (
            <div className="py-3 flex items-center gap-2 text-sm text-surface-400">
              <span>🔒</span>
              <span>Coordonnées accessibles aux coéquipiers, coach et président.</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Licence (coach/président) ─────────────────────────────────────────── */}
      {isPrivileged && targetUser.license && (
        <Card className="p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🪪 Licence
          </h2>
          <div>
            <LicenseBadge status={targetUser.license.status} />
            <div className="mt-3">
              <Field label="Numéro" value={targetUser.license.number} />
              <Field label="Saison"  value="2025–2026" />
              {targetUser.license.expiresAt && (
                <Field label="Expiration"
                  value={format(new Date(targetUser.license.expiresAt), 'd MMMM yyyy', { locale: fr })} />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Documents ────────────────────────────────────────────────────────── */}
      {(isOwnProfile || isPrivileged) && (
        <Card className="p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            📄 Documents administratifs
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📎</div>
              <div className="text-sm">Aucun document ajouté</div>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  canDelete={isOwnProfile || isPrivileged}
                  onDelete={docId => setDocuments(prev => prev.filter(d => d.id !== docId))}
                />
              ))}
            </div>
          )}

          <button onClick={() => setShowUploadModal(true)}
            className="mt-4 w-full py-2.5 border-2 border-dashed border-surface-200 rounded-2xl
                       text-sm text-surface-400 hover:border-brand-300 hover:text-brand-600
                       transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> Ajouter un document
          </button>
        </Card>
      )}

      {/* ── Modal photo profil ───────────────────────────────────────────────── */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
          <Card className="w-full md:max-w-md md:rounded-2xl rounded-none flex-1 md:flex-none overflow-y-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900">Changer votre photo</h2>
              <button onClick={() => setShowPhotoModal(false)}
                      className="p-2 hover:bg-surface-100 rounded-xl text-gray-400">
                <X size={18} />
              </button>
            </div>
            <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed
                              border-surface-200 rounded-2xl cursor-pointer hover:border-brand-300
                              hover:bg-brand-50 transition-colors">
              <span className="text-5xl">📸</span>
              <div className="text-center">
                <div className="font-medium text-gray-900">Choisir une photo</div>
                <div className="text-sm text-gray-500 mt-1">PNG, JPG (max 5 Mo)</div>
              </div>
              <input type="file" accept="image/*" onChange={handleUploadPhoto} className="sr-only" />
            </label>
            {profilePhoto && (
              <button
                onClick={() => { setProfilePhoto(null); localStorage.removeItem(photoKey); setShowPhotoModal(false) }}
                className="w-full mt-3 py-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                Supprimer la photo
              </button>
            )}
            <button onClick={() => setShowPhotoModal(false)}
                    className="w-full mt-2 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-700
                               text-sm font-medium rounded-xl transition-colors">
              Annuler
            </button>
          </Card>
        </div>
      )}

      {/* ── Modal bio ────────────────────────────────────────────────────────── */}
      {showBioEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
          <Card className="w-full md:max-w-md md:rounded-2xl rounded-none flex-1 md:flex-none overflow-y-auto p-4 md:p-6">
            <EditBioModal
              currentBio={bio}
              onSave={handleSaveBio}
              onClose={() => setShowBioEdit(false)}
            />
          </Card>
        </div>
      )}

      {/* ── Modal upload document ─────────────────────────────────────────────── */}
      {showUploadModal && (
        <UploadDocumentModal
          targetUserId={targetUser.id}
          onClose={() => setShowUploadModal(false)}
          onAdd={doc => setDocuments(prev => [...prev, doc])}
        />
      )}

      {/* ── Modal quitter le club ─────────────────────────────────────────────── */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
          <Card className="w-full md:max-w-md md:rounded-2xl rounded-none flex-1 md:flex-none overflow-y-auto p-4 md:p-6">
            <h2 className="font-display text-xl font-bold mb-2">
              Quitter {club?.name ?? 'ce club'} ?
            </h2>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Vous perdrez l'accès aux informations internes. Votre historique sera conservé.
            </p>
            {currentUser.role === 'coach' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 mb-4">
                ℹ️ Si vous étiez le seul coach d'une équipe, le président sera assigné comme responsable.
              </div>
            )}
            {isLastPresident && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                ⚠️ Vous êtes le seul président. Nommez un autre président avant de partir.
              </div>
            )}
            {leaveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                {leaveError}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 px-4 bg-surface-100 hover:bg-surface-200 text-gray-700
                           text-sm font-medium rounded-xl transition-colors">
                Annuler
              </button>
              <button disabled={isLastPresident || leaveLoading} onClick={handleLeaveClub}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-40
                           text-white text-sm font-medium rounded-xl transition-all
                           flex items-center justify-center gap-2">
                {leaveLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Confirmer le départ'
                }
              </button>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}
