import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'

const SPORTS = [
  { value: 'football', label: '⚽ Football', available: true },
  { value: 'basketball', label: '🏀 Basketball', available: false },
  { value: 'rugby', label: '🏉 Rugby', available: false },
  { value: 'handball', label: '🤾 Handball', available: false },
  { value: 'tennis', label: '🎾 Tennis', available: false },
  { value: 'natation', label: '🏊 Natation', available: false },
]

const STEPS = [
  { id: 1, label: 'Votre compte' },
  { id: 2, label: 'Le club' },
  { id: 3, label: 'Première équipe' },
]

export default function ClubSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    // Étape 1
    firstName: '', lastName: '', email: '', phone: '', password: '',
    // Étape 2
    clubName: '', clubAddress: '', clubPhone: '', clubEmail: '', sport: 'football', ground: '',
    // Étape 3
    teamName: '', teamCategory: '', teamAgeGroup: '',
  })

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function next() { setStep(s => Math.min(s + 1, 3)) }
  function prev() { setStep(s => Math.max(s - 1, 1)) }

  function submit(e) {
    e.preventDefault()
    navigate('/app/events')
  }

  const inputCls = "w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
  const labelCls = "block text-sm font-medium text-surface-300 mb-1.5"

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">ClubManager</span>
        </div>

        {/* Card */}
        <div className="bg-surface-800 rounded-2xl border border-surface-700 p-8">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step > s.id ? 'bg-brand-600 text-white' :
                    step === s.id ? 'bg-white text-surface-900' :
                    'bg-surface-700 text-surface-500'
                  }`}>
                    {step > s.id ? <Check size={14} /> : s.id}
                  </div>
                  <span className={`text-sm hidden sm:block ${step === s.id ? 'text-white font-medium' : 'text-surface-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > s.id ? 'bg-brand-600' : 'bg-surface-700'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={submit}>
            {/* Étape 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Créez votre compte</h2>
                  <p className="text-surface-400 text-sm">Vous serez le président du club.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Prénom</label>
                    <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                      className={inputCls} required placeholder="Prénom" />
                  </div>
                  <div>
                    <label className={labelCls}>Nom</label>
                    <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                      className={inputCls} required placeholder="Nom" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    className={inputCls} required placeholder="vous@exemple.fr" />
                </div>
                <div>
                  <label className={labelCls}>Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    className={inputCls} placeholder="06 xx xx xx xx" />
                </div>
                <div>
                  <label className={labelCls}>Mot de passe</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                    className={inputCls} required placeholder="••••••••" minLength={8} />
                </div>
                <button type="button" onClick={next}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Votre club</h2>
                  <p className="text-surface-400 text-sm">Ces informations seront affichées à vos membres.</p>
                </div>
                <div>
                  <label className={labelCls}>Nom du club</label>
                  <input type="text" value={form.clubName} onChange={e => update('clubName', e.target.value)}
                    className={inputCls} required placeholder="FC Saint-Martin" />
                </div>
                <div>
                  <label className={labelCls}>Adresse</label>
                  <input type="text" value={form.clubAddress} onChange={e => update('clubAddress', e.target.value)}
                    className={inputCls} placeholder="12 rue des Sports, 38400 ..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Téléphone</label>
                    <input type="tel" value={form.clubPhone} onChange={e => update('clubPhone', e.target.value)}
                      className={inputCls} placeholder="04 76 xx xx xx" />
                  </div>
                  <div>
                    <label className={labelCls}>Email contact</label>
                    <input type="email" value={form.clubEmail} onChange={e => update('clubEmail', e.target.value)}
                      className={inputCls} placeholder="contact@club.fr" />
                  </div>
                </div>

                {/* Sport */}
                <div>
                  <label className={labelCls}>Sport</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SPORTS.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        disabled={!s.available}
                        onClick={() => s.available && update('sport', s.value)}
                        className={`relative p-3 rounded-xl border text-sm transition-colors ${
                          !s.available
                            ? 'bg-surface-900 border-surface-700 text-surface-600 cursor-not-allowed'
                            : form.sport === s.value
                            ? 'bg-brand-600 border-brand-500 text-white'
                            : 'bg-surface-700 border-surface-600 text-surface-300 hover:bg-surface-600'
                        }`}
                      >
                        {s.label}
                        {!s.available && (
                          <span className="absolute -top-1.5 -right-1.5 text-xs bg-surface-700 text-surface-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Lock size={9} /> Bientôt
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Terrain / Complexe principal</label>
                  <input type="text" value={form.ground} onChange={e => update('ground', e.target.value)}
                    className={inputCls} placeholder="Terrain municipal de..." />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={prev}
                    className="px-5 py-3 bg-surface-700 text-surface-300 rounded-xl hover:bg-surface-600 transition-colors flex items-center gap-2">
                    <ArrowLeft size={16} />
                  </button>
                  <button type="button" onClick={next}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    Continuer <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Première équipe</h2>
                  <p className="text-surface-400 text-sm">Vous pourrez en ajouter d'autres ensuite.</p>
                </div>
                <div>
                  <label className={labelCls}>Nom de l'équipe</label>
                  <input type="text" value={form.teamName} onChange={e => update('teamName', e.target.value)}
                    className={inputCls} required placeholder="Séniors A" />
                </div>
                <div>
                  <label className={labelCls}>Catégorie</label>
                  <select value={form.teamCategory} onChange={e => update('teamCategory', e.target.value)}
                    className={inputCls}>
                    <option value="">Choisir...</option>
                    <option value="Séniors">Séniors</option>
                    <option value="Jeunes">Jeunes</option>
                    <option value="Loisir">Loisir</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tranche d'âge</label>
                  <input type="text" value={form.teamAgeGroup} onChange={e => update('teamAgeGroup', e.target.value)}
                    className={inputCls} placeholder="18+, U13, U9..." />
                </div>

                <div className="p-4 bg-brand-600/10 border border-brand-600/30 rounded-xl">
                  <p className="text-sm text-brand-300">
                    🎉 Votre club sera créé avec son code unique à partager à vos membres pour qu'ils puissent rejoindre.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={prev}
                    className="px-5 py-3 bg-surface-700 text-surface-300 rounded-xl hover:bg-surface-600 transition-colors">
                    <ArrowLeft size={16} />
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    Créer le club <Check size={16} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
