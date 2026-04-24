import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TEAMS } from '../../data/mock'
import { Trophy, ArrowLeft, ArrowRight, Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Votre club' },
  { id: 2, label: 'Vos informations' },
  { id: 3, label: 'Votre rôle' },
]

const ROLE_OPTIONS = [
  { value: 'player',    label: 'Joueur',    desc: 'Accédez à votre profil, vos matchs et entraînements.' },
  { value: 'supporter', label: 'Supporter', desc: 'Suivez les équipes, les matchs et échangez avec la communauté.' },
  { value: 'parent',    label: 'Parent',    desc: 'Suivez l\'activité de votre enfant et restez en contact avec le coach.' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    clubCode: '',
    firstName: '', lastName: '', email: '', phone: '',
    role: '', teamId: '',
  })

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function next() { setStep(s => Math.min(s + 1, 3)) }
  function prev() { setStep(s => Math.max(s - 1, 1)) }

  function submit(e) {
    e.preventDefault()
    // Mock — redirect to login
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Form */}
      <div className="w-full max-w-lg flex flex-col justify-center px-12 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Trophy size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">ClubManager</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s.id ? 'bg-brand-600 text-white' :
                step === s.id ? 'bg-white text-surface-900' :
                'bg-surface-800 text-surface-500'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span className={`text-sm ${step === s.id ? 'text-white' : 'text-surface-500'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px bg-surface-700 mx-1" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          {/* Étape 1 : Club */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-1">Rejoindre un club</h2>
                <p className="text-surface-400 text-sm">Entrez le code fourni par votre responsable de club.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Code du club</label>
                <input
                  type="text"
                  value={form.clubCode}
                  onChange={e => update('clubCode', e.target.value)}
                  placeholder="FCSM-2024"
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  required
                />
              </div>
              <div className="mt-2 p-4 bg-surface-800 rounded-xl border border-surface-700">
                <p className="text-sm font-semibold text-white">FC Saint-Martin</p>
                <p className="text-xs text-surface-400 mt-0.5">Football · Saint-Martin-d'Hères</p>
              </div>
              <button
                type="button"
                onClick={next}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Étape 2 : Infos perso */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-1">Vos informations</h2>
                <p className="text-surface-400 text-sm">Ces informations seront visibles par les responsables du club.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Prénom</label>
                  <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    required placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Nom</label>
                  <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    required placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  required placeholder="vous@exemple.fr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="06 xx xx xx xx" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prev}
                  className="px-5 py-3 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors flex items-center gap-2">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button type="button" onClick={next}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Rôle */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-1">Votre rôle</h2>
                <p className="text-surface-400 text-sm">Votre rôle sera validé par le responsable du club.</p>
              </div>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update('role', r.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      form.role === r.value
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-surface-800 border-surface-700 text-surface-300 hover:bg-surface-750'
                    }`}
                  >
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className={`text-xs mt-0.5 ${form.role === r.value ? 'text-brand-200' : 'text-surface-500'}`}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>

              {/* Sélection équipe si joueur */}
              {form.role === 'player' && (
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Équipe</label>
                  <select
                    value={form.teamId}
                    onChange={e => update('teamId', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                    required
                  >
                    <option value="">Choisir une équipe</option>
                    {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={prev}
                  className="px-5 py-3 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors flex items-center gap-2">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button
                  type="submit"
                  disabled={!form.role}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Envoyer ma demande <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-surface-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Se connecter</Link>
        </p>
      </div>

      {/* Panneau droit — Flux validation */}
      <div className="hidden lg:flex flex-1 bg-surface-800 flex-col justify-center px-12 py-16 border-l border-surface-700">
        <h3 className="font-display font-semibold text-white text-xl mb-6">Comment ça fonctionne ?</h3>
        <div className="space-y-6">
          {[
            {
              step: '1',
              title: 'Vous créez votre demande',
              desc: 'Choisissez votre rôle et renseignez vos informations. Votre demande est envoyée au responsable du club.',
            },
            {
              step: '2',
              title: 'Le responsable valide',
              desc: 'Le président ou le coach reçoit votre demande et l\'approuve (ou non) depuis son tableau de bord.',
            },
            {
              step: '3',
              title: 'Vous accédez au club',
              desc: 'Une fois validé, vous recevez un email de confirmation et pouvez vous connecter avec vos accès.',
            },
          ].map(s => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{s.title}</p>
                <p className="text-surface-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 p-4 bg-surface-700 rounded-xl">
          <p className="text-xs text-surface-400">
            <span className="font-semibold text-surface-300">Coach ou Président ?</span> Demandez à votre responsable de créer votre compte directement depuis les paramètres du club.
          </p>
        </div>
      </div>
    </div>
  )
}
