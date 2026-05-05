import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as db from '../../services/db'
import { supabase } from '../../lib/supabase'

export default function RegisterClubPage() {
  const navigate = useNavigate()

  // Club
  const [sports,      setSports]      = useState([])
  const [clubName,    setClubName]    = useState('')
  const [sportId,     setSportId]     = useState('')   // UUID réel si dispo
  const [sportName,   setSportName]   = useState('')   // toujours dispo
  const [address,     setAddress]     = useState('')
  const [postalCode,  setPostalCode]  = useState('')
  const [city,        setCity]        = useState('')
  const [country,     setCountry]     = useState('France')
  const [clubEmail,   setClubEmail]   = useState('')
  const [clubPhone,   setClubPhone]   = useState('')

  // Président
  const [firstName,       setFirstName]       = useState('')
  const [lastName,        setLastName]        = useState('')
  const [birthDate,       setBirthDate]       = useState('')
  const [email,           setEmail]           = useState('')
  const [presidentPhone,  setPresidentPhone]  = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  const SPORTS_FALLBACK = [
    'Athlétisme', 'Badminton', 'Basketball', 'Cyclisme',
    'Football', 'Handball', 'Natation', 'Rugby', 'Tennis', 'Volleyball',
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const data = await db.getSports()
        console.log('getSports:', data)
        const list = data?.length > 0
          ? data
          : SPORTS_FALLBACK.map(name => ({ id: null, name }))
        setSports(list)
        setSportId(list[0].id ?? '')
        setSportName(list[0].name)
      } catch (err) {
        console.error('Erreur chargement sports:', err)
        const list = SPORTS_FALLBACK.map(name => ({ id: null, name }))
        setSports(list)
        setSportId('')
        setSportName(list[0].name)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas')
    if (password.length < 8)          return setError('Mot de passe trop court (8 caractères minimum)')

    setLoading(true)
    try {
      const existing = await db.getUserByEmail(email)
      if (existing) { setError('Cet email est déjà utilisé'); setLoading(false); return }

      // Résoudre le sport_id (UUID réel requis par Supabase)
      let finalSportId = sportId
      if (!finalSportId) {
        const { data: found } = await supabase
          .from('sports')
          .select('id')
          .eq('name', sportName)
          .single()
        if (found) {
          finalSportId = found.id
        } else {
          const { data: created, error: sportErr } = await supabase
            .from('sports')
            .insert({ name: sportName })
            .select()
            .single()
          if (sportErr || !created) throw new Error('Impossible de créer le sport')
          finalSportId = created.id
        }
      }

      const club = await db.createClub({
        name: clubName, sport_id: finalSportId,
        address, postal_code: postalCode, city, country,
        email: clubEmail, phone: clubPhone,
      })
      if (!club?.id) throw new Error('Erreur création club')

      const person = await db.createPerson({
        club_id: club.id, first_name: firstName, last_name: lastName,
        birth_date: birthDate || null, phone: presidentPhone || null,
      })
      if (!person?.id) throw new Error('Erreur création profil')

      const user = await db.createUser({
        person_id: person.id,
        email: email.toLowerCase().trim(),
        password_hash: db.hashPassword(password),
        account_status: 'active',
      })
      if (!user?.id) throw new Error('Erreur création compte')

      await db.createUserRole({
        user_id: user.id,
        role_type: 'president',
        scope_type: 'club',
        scope_id: club.id,
      })

      db.setSession(user.id)
      navigate('/app/events')
    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-display font-bold text-gray-900 mb-1">Inscrire mon club</div>
          <p className="text-sm text-gray-500">Créez votre espace club et votre compte président</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section club */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Le club</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'association <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  placeholder="FC Saint-Denis"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={sportId || sportName}
                  onChange={e => {
                    const selected = sports.find(s => s.id === e.target.value || s.name === e.target.value)
                    setSportId(selected?.id ?? '')
                    setSportName(selected?.name ?? '')
                  }}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                >
                  {sports.length === 0 && <option value="">Chargement…</option>}
                  {sports.map(s => (
                    <option key={s.name} value={s.id ?? s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du club <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={clubEmail}
                  onChange={e => setClubEmail(e.target.value)}
                  placeholder="contact@monclub.fr"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="12 rue du Stade"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="93200"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Saint-Denis"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du club</label>
                <input
                  type="tel"
                  value={clubPhone}
                  onChange={e => setClubPhone(e.target.value)}
                  placeholder="01 23 45 67 89"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section président */}
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Le président (compte administrateur)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jean-Pierre"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={presidentPhone}
                  onChange={e => setPresidentPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (identifiant de connexion) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jp@monclub.fr"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl px-4 py-3 text-sm"
          >
            {loading ? 'Création en cours…' : 'Créer le club'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
