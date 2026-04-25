import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TEAMS, CLUB } from '../../data/mock'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

// ─── Config ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Votre club' },
  { id: 2, label: 'Vos infos' },
  { id: 3, label: 'Votre rôle' },
]

const ROLE_OPTIONS = [
  { value: 'player',    label: 'Joueur',    desc: 'Accédez à votre profil, vos matchs et entraînements.' },
  { value: 'coach',     label: 'Coach',     desc: 'Gérez votre équipe, les convocations et les présences.' },
  { value: 'supporter', label: 'Supporter', desc: 'Suivez les équipes, les matchs et les événements du club.' },
  { value: 'parent',    label: 'Parent',    desc: 'Suivez l\'activité de votre enfant et échangez avec le coach.' },
]

const VALIDATION_INFO = {
  player:    { icon: '⏳', title: 'Validation par le coach',     desc: 'Le coach de ton équipe reçoit un email et valide ta demande avant que tu puisses accéder au club.' },
  coach:     { icon: '⏳', title: 'Validation par le président', desc: 'Le président reçoit un email et valide ta demande. Tu recevras une confirmation par email.' },
  supporter: { icon: '⚡', title: 'Accès immédiat',              desc: 'Ton compte est créé instantanément. Tu peux te connecter dès maintenant.' },
  parent:    { icon: '⚡', title: 'Accès immédiat',              desc: 'Ton compte est créé instantanément. Tu pourras ensuite être associé à l\'enfant concerné.' },
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                           transition-colors ${
            current > s.id  ? 'bg-brand-600 text-white' :
            current === s.id ? 'bg-gray-900 text-white' :
                               'bg-surface-100 text-gray-400'
          }`}>
            {current > s.id ? <Check size={13} /> : s.id}
          </div>
          <span className={`text-sm ${current === s.id ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div className="w-8 h-px bg-surface-200 mx-1" />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    clubCode: '', firstName: '', lastName: '',
    email: '', phone: '', role: '', teamId: '',
  })

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function next()  { setStep(s => Math.min(s + 1, 3)) }
  function prev()  { setStep(s => Math.max(s - 1, 1)) }

  function submit(e) {
    e.preventDefault()
    navigate('/login')
  }

  const validation = form.role ? VALIDATION_INFO[form.role] : null

  const inputCls = `w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm
                    text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2
                    focus:ring-brand-300 focus:border-brand-400 transition-all`

  const btnPrimary = `flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium
                      rounded-xl text-sm transition-colors flex items-center justify-center gap-2
                      disabled:opacity-40 disabled:cursor-not-allowed`

  const btnSecondary = `px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-gray-600 font-medium
                        rounded-xl text-sm transition-colors flex items-center gap-2`

  return (
    <div className="flex min-h-screen">

      {/* ── Panneau gauche — brand-950 ──────────────────────── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-brand-950 flex-col
                      justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
              <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              <polygon points="12,14 15,10 19,13 17,18 12,19" fill="white" fillOpacity=".5" />
              <polygon points="12,14 9,10 5,13 7,18 12,19" fill="white" fillOpacity=".5" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-xl">ClubManager</span>
        </div>

        <div>
          <h2 className="font-display font-bold text-3xl text-white leading-snug mb-4">
            Rejoignez votre club en quelques étapes
          </h2>
          <p className="text-brand-300 text-sm leading-relaxed mb-10">
            Créez votre compte, choisissez votre rôle et accédez à tout ce dont vous avez besoin.
          </p>

          {/* Étapes visuelles */}
          <div className="space-y-5">
            {[
              { n: '1', title: 'Trouvez votre club',    desc: 'Entrez le code fourni par votre responsable.' },
              { n: '2', title: 'Renseignez vos infos',  desc: 'Nom, prénom, email et téléphone.' },
              { n: '3', title: 'Choisissez votre rôle', desc: 'Joueur, coach, supporter ou parent.' },
            ].map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-600/40 flex items-center justify-center
                                text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{s.title}</p>
                  <p className="text-brand-400 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-500 text-xs">{CLUB.name} · {CLUB.sport} · {CLUB.city}</p>
      </div>

      {/* ── Panneau droit — formulaire blanc ────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900">ClubManager</span>
          </div>

          <Stepper current={step} />

          <form onSubmit={submit}>

            {/* ── Étape 1 : Club ── */}
            {step === 1 && (
              <div>
                <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Votre club</h1>
                <p className="text-gray-500 text-sm mb-6">
                  Entrez le code fourni par votre responsable de club.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Code du club
                    </label>
                    <input
                      type="text"
                      value={form.clubCode}
                      onChange={e => set('clubCode', e.target.value)}
                      placeholder="ex. FCSM-2024"
                      className={inputCls}
                    />
                  </div>

                  {/* Aperçu club mocké */}
                  <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center
                                      justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="white" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                          <polygon points="12,5 15,10 12,14 9,10" fill="white" fillOpacity=".9" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{CLUB.name}</p>
                        <p className="text-xs text-gray-500">{CLUB.sport} · {CLUB.city}</p>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={next} className={btnPrimary}>
                    Continuer <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Étape 2 : Infos perso ── */}
            {step === 2 && (
              <div>
                <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
                  Vos informations
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                  Visibles par les responsables du club.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => set('firstName', e.target.value)}
                        placeholder="Prénom"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={e => set('lastName', e.target.value)}
                        placeholder="Nom"
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="vous@exemple.fr"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="06 xx xx xx xx"
                      className={inputCls}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={prev} className={btnSecondary}>
                      <ArrowLeft size={15} /> Retour
                    </button>
                    <button type="button" onClick={next} className={btnPrimary}>
                      Continuer <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Étape 3 : Rôle ── */}
            {step === 3 && (
              <div>
                <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Votre rôle</h1>
                <p className="text-gray-500 text-sm mb-6">
                  Votre accès sera adapté à votre rôle dans le club.
                </p>

                <div className="space-y-2 mb-4">
                  {ROLE_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        form.role === r.value
                          ? 'bg-brand-50 border-brand-400 text-gray-900'
                          : 'bg-white border-surface-200 hover:bg-surface-50 text-gray-700'
                      }`}
                    >
                      <p className="font-semibold text-sm">{r.label}</p>
                      <p className={`text-xs mt-0.5 ${
                        form.role === r.value ? 'text-brand-600' : 'text-gray-400'
                      }`}>
                        {r.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Select équipe si joueur */}
                {form.role === 'player' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Équipe
                    </label>
                    <select
                      value={form.teamId}
                      onChange={e => set('teamId', e.target.value)}
                      required
                      className={inputCls}
                    >
                      <option value="">Choisir une équipe</option>
                      {TEAMS.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Panel info validation */}
                {validation && (
                  <div className="mb-5 p-4 bg-surface-50 border border-surface-200 rounded-xl">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      {validation.icon} {validation.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{validation.desc}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={prev} className={btnSecondary}>
                    <ArrowLeft size={15} /> Retour
                  </button>
                  <button
                    type="submit"
                    disabled={!form.role || (form.role === 'player' && !form.teamId)}
                    className={btnPrimary}
                  >
                    Envoyer ma demande <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
