import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Card, SectionHeader } from '../../components/ui'
import { getCurrentSeason, startNewSeason } from '../../services/db'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const { currentUser, is } = useAuth()

  const [currentSeasonName, setCurrentSeasonName] = useState('')
  const [newSeasonName,     setNewSeasonName]     = useState('')
  const [loading,           setLoading]           = useState(false)
  const [seasonLoading,     setSeasonLoading]     = useState(true)
  const [error,             setError]             = useState('')
  const [success,           setSuccess]           = useState('')
  const [confirm,           setConfirm]           = useState(false)

  const clubId = currentUser?.current_club_id

  useEffect(() => {
    if (!clubId) return
    setSeasonLoading(true)
    getCurrentSeason(clubId)
      .then(name => {
        setCurrentSeasonName(name)
        // Pré-remplir la prochaine saison
        const match = name.match(/^(\d{4})-(\d{4})$/)
        if (match) {
          const y = parseInt(match[2])
          setNewSeasonName(`${y}-${y + 1}`)
        }
      })
      .catch(() => {})
      .finally(() => setSeasonLoading(false))
  }, [clubId])

  async function handleStartNewSeason() {
    if (!newSeasonName.trim()) return setError('Entrez le nom de la nouvelle saison')
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await startNewSeason(clubId, newSeasonName.trim(), currentUser.id)
      setCurrentSeasonName(newSeasonName.trim())
      const match = newSeasonName.trim().match(/^(\d{4})-(\d{4})$/)
      if (match) {
        const y = parseInt(match[2])
        setNewSeasonName(`${y}-${y + 1}`)
      }
      setConfirm(false)
      setSuccess('Nouvelle saison démarrée avec succès.')
    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!is('president')) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p className="text-surface-500">Accès réservé au président du club.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-surface-900">Administration</h1>
        <p className="text-surface-500 mt-1">Paramètres et actions avancées du club</p>
      </div>

      {/* ── Gestion de la saison ──────────────────────────────────────────── */}
      <Card className="p-6">
        <SectionHeader title="Saison" />

        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-200">
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">
                Saison en cours
              </p>
              <p className="font-semibold text-surface-900">
                {seasonLoading ? '…' : currentSeasonName}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
              Nom de la nouvelle saison
            </label>
            <input
              value={newSeasonName}
              onChange={e => { setNewSeasonName(e.target.value); setError(''); setSuccess('') }}
              placeholder="Ex: 2025-2026"
              className="w-full bg-surface-50 border border-surface-200 rounded-xl
                         px-3 py-2.5 text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-300 focus:border-brand-400 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {!confirm ? (
            <button
              onClick={() => { setConfirm(true); setError(''); setSuccess('') }}
              disabled={seasonLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700
                         text-white rounded-xl text-sm font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={15} /> Démarrer une nouvelle saison
            </button>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2 text-amber-800 text-sm">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  Cette action archive la saison actuelle et démarre <strong>{newSeasonName}</strong>.
                  Les stats, présences et convocations seront réinitialisées. Cette action est irréversible.
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm(false)}
                  className="flex-1 py-2 border border-surface-200 text-surface-600
                             hover:bg-surface-50 rounded-xl text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStartNewSeason}
                  disabled={loading}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white
                             rounded-xl text-sm font-medium transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent
                                    rounded-full animate-spin mx-auto" />
                  ) : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
