# ClubManager — Historique style LinkedIn

Historique professionnel/sportif éditable pour tous les utilisateurs.

---

## CONCEPT

**Avant :** historique auto-généré par la base de données

**Après :** chaque utilisateur remplit son propre historique (comme LinkedIn)

Exemple :
- Karim : "Joueur Séniors A · FC Lens (2024-2025)" + "Joueur Séniors B · FC Lens (2023-2024)"
- Marie : "Coach Séniors A · FC Lens (2024-2025)" + "Coach U19 · FC Lens (2023-2024)" + "Joueur U17 · AS Liévin (2015-2017)"
- Sophie : "Supporter · (depuis 2020)" + "Joueur U19 · AS Liévin (2018-2022)"

---

## STRUCTURE DE DONNÉES

```js
const mockExperiences = [
  {
    id: 'exp-1',
    user_id: 'player-1', // Karim
    role: 'player', // player, coach, president, staff, supporter
    club_name: 'FC Lens Académie',
    club_id: 'club-1', // optionnel, peut être un ancien club pas dans la BDD
    team_name: 'Séniors A',
    position: 'Attaquant', // uniquement si role = player
    start_date: '2024-09-01',
    end_date: null, // null = actuellement
    description: 'Joueur titulaire en attaque, 8 buts en championnat',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'exp-2',
    user_id: 'player-1',
    role: 'player',
    club_name: 'FC Lens Académie',
    club_id: 'club-1',
    team_name: 'Séniors B',
    position: 'Milieu',
    start_date: '2023-09-01',
    end_date: '2024-08-31',
    description: 'Saison transitoire avant montée en Séniors A',
    created_at: '2023-09-01T10:00:00Z',
    updated_at: '2023-09-01T10:00:00Z',
  },
  {
    id: 'exp-3',
    user_id: 'supp-1', // Sophie
    role: 'supporter',
    club_name: 'AS Saint-Denis United',
    club_id: 'club-2',
    team_name: null,
    position: null,
    start_date: '2020-01-01',
    end_date: null,
    description: 'Fan du club depuis 2020, très engagée dans la communauté',
    created_at: '2020-01-01T10:00:00Z',
    updated_at: '2020-01-01T10:00:00Z',
  },
  {
    id: 'exp-4',
    user_id: 'supp-1',
    role: 'player',
    club_name: 'AS Liévin',
    club_id: null, // club ancien, peut ne plus exister ou être inaccessible
    team_name: 'U19',
    position: 'Gardienne',
    start_date: '2018-09-01',
    end_date: '2022-08-31',
    description: 'Années de jeunesse au club, bonne formation',
    created_at: '2018-09-01T10:00:00Z',
    updated_at: '2018-09-01T10:00:00Z',
  },
]
```

---

## SECTION HISTORIQUE DANS PROFIL

```
┌──────────────────────────────────────────────────┐
│  💼 EXPÉRIENCE                                    │
│                                                  │
│  [+ Ajouter une expérience]                      │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  ⚽ Joueur · FC Lens Académie — Séniors A       │
│  Sep 2024 - Présent (7 mois)                     │
│                                                  │
│  Joueur titulaire en attaque, 8 buts en         │
│  championnat. Très impliqué au sein du club.    │
│                                                  │
│  [✏️ Modifier] [🗑️ Supprimer]                   │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  ⚽ Joueur · FC Lens Académie — Séniors B       │
│  Sep 2023 - Août 2024 (1 an)                     │
│                                                  │
│  Saison transitoire avant montée en Séniors A.  │
│                                                  │
│  [✏️ Modifier] [🗑️ Supprimer]                   │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  ⚽ Joueur · AS Liévin — U19                     │
│  Sep 2022 - Août 2023 (1 an)                     │
│                                                  │
│  Formation complète au club avant départ.       │
│                                                  │
│  [✏️ Modifier] [🗑️ Supprimer]                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## MODAL AJOUT/ÉDITION EXPÉRIENCE

```jsx
function ExperienceModal({ experience, onSave, onClose }) {
  const [role, setRole] = useState(experience?.role || 'player')
  const [clubName, setClubName] = useState(experience?.club_name || '')
  const [teamName, setTeamName] = useState(experience?.team_name || '')
  const [position, setPosition] = useState(experience?.position || '')
  const [startDate, setStartDate] = useState(experience?.start_date || '')
  const [endDate, setEndDate] = useState(experience?.end_date || '')
  const [isCurrent, setIsCurrent] = useState(!experience?.end_date)
  const [description, setDescription] = useState(experience?.description || '')

  const handleSave = () => {
    if (!clubName.trim() || !startDate) {
      alert('Club et date de début obligatoires')
      return
    }

    const newExp = {
      id: experience?.id || `exp-${Date.now()}`,
      role,
      club_name: clubName.trim(),
      team_name: teamName.trim() || null,
      position: (role === 'player' && position.trim()) || null,
      start_date: startDate,
      end_date: isCurrent ? null : endDate,
      description: description.trim() || null,
    }

    onSave(newExp)
  }

  const roles = [
    { value: 'player', label: '⚽ Joueur', icon: '⚽' },
    { value: 'coach', label: '👔 Coach', icon: '👔' },
    { value: 'president', label: '👔 Président', icon: '👔' },
    { value: 'staff', label: '🏥 Intendant/Staff', icon: '🏥' },
    { value: 'supporter', label: '👥 Supporter', icon: '👥' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            {experience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => {
                    setRole(r.value)
                    if (r.value !== 'player') setPosition('')
                  }}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    role === r.value
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-surface-200 hover:border-brand-300'
                  }`}>
                  <div className="font-medium text-gray-900">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nom du club */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club *
            </label>
            <input
              type="text"
              value={clubName}
              onChange={e => setClubName(e.target.value)}
              placeholder="Ex : FC Lens Académie, AS Liévin..."
              className="w-full"
            />
          </div>

          {/* Équipe/catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipe/Catégorie {role !== 'supporter' && '*'}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Ex : Séniors A, U19, U13..."
              className="w-full"
            />
          </div>

          {/* Poste (uniquement joueur) */}
          {role === 'player' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste sur le terrain
              </label>
              <select value={position} onChange={e => setPosition(e.target.value)} className="w-full">
                <option value="">Choisir un poste...</option>
                <option value="Gardien">Gardien</option>
                <option value="Défenseur">Défenseur</option>
                <option value="Latéral">Latéral</option>
                <option value="Milieu">Milieu</option>
                <option value="Ailier">Ailier</option>
                <option value="Attaquant">Attaquant</option>
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Début *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                disabled={isCurrent}
                className="w-full disabled:bg-surface-50"
              />
            </div>
          </div>

          {/* Actuellement */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={e => {
                setIsCurrent(e.target.checked)
                if (e.target.checked) setEndDate('')
              }}
            />
            <span className="text-sm font-medium text-gray-700">
              Je suis actuellement en poste ici
            </span>
          </label>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Parlez de votre rôle, accomplissements, raison du départ..."
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={handleSave} className="flex-1 btn-primary justify-center">
            {experience ? 'Mettre à jour' : 'Ajouter l\'expérience'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## AFFICHAGE HISTORIQUE DANS PROFIL

```jsx
function ExperienceSection({ userId, isMyProfile }) {
  const [experiences, setExperiences] = useState(
    mockExperiences.filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExp, setEditingExp] = useState(null)

  const handleSaveExperience = (exp) => {
    const exists = experiences.find(e => e.id === exp.id)
    if (exists) {
      setExperiences(experiences.map(e => e.id === exp.id ? exp : e))
    } else {
      setExperiences([exp, ...experiences])
    }
    setEditingExp(null)
    setShowAddModal(false)
  }

  const handleDeleteExperience = (expId) => {
    if (confirm('Supprimer cette expérience ?')) {
      setExperiences(experiences.filter(e => e.id !== expId))
    }
  }

  const getIcon = (role) => {
    switch(role) {
      case 'player': return '⚽'
      case 'coach': return '👔'
      case 'president': return '👔'
      case 'staff': return '🏥'
      case 'supporter': return '👥'
      default: return '📋'
    }
  }

  const getRoleLabel = (role) => {
    switch(role) {
      case 'player': return 'Joueur'
      case 'coach': return 'Coach'
      case 'president': return 'Président'
      case 'staff': return 'Intendant/Staff'
      case 'supporter': return 'Supporter'
      default: return role
    }
  }

  const formatDates = (start, end) => {
    const startDate = new Date(start)
    const startStr = startDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    
    if (!end) {
      const now = new Date()
      const months = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                     (now.getMonth() - startDate.getMonth())
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      
      let duration = ''
      if (years > 0) duration += `${years} an${years > 1 ? 's' : ''} `
      if (remainingMonths > 0) duration += `${remainingMonths} mois`
      
      return `${startStr} - Présent (${duration.trim()})`
    }
    
    const endDate = new Date(end)
    const endStr = endDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    let duration = ''
    if (years > 0) duration += `${years} an${years > 1 ? 's' : ''} `
    if (remainingMonths > 0) duration += `${remainingMonths} mois`
    
    return `${startStr} - ${endStr} (${duration.trim()})`
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">💼 Expérience</h2>
        {isMyProfile && (
          <button
            onClick={() => {
              setEditingExp(null)
              setShowAddModal(true)
            }}
            className="text-sm text-brand-600 hover:underline">
            + Ajouter une expérience
          </button>
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm">
            {isMyProfile 
              ? 'Aucune expérience pour l\'instant. Cliquez sur "Ajouter une expérience" !'
              : 'Aucune expérience.'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map(exp => (
            <div key={exp.id} className="pb-4 border-b border-surface-200 last:border-b-0">
              {/* Header expérience */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-900">
                    {getIcon(exp.role)} {getRoleLabel(exp.role)} · {exp.club_name}
                    {exp.team_name && ` — ${exp.team_name}`}
                  </div>
                  
                  {exp.position && (
                    <div className="text-sm text-gray-600 mt-1">
                      📍 {exp.position}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDates(exp.start_date, exp.end_date)}
                  </div>
                </div>

                {isMyProfile && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingExp(exp)
                        setShowAddModal(true)
                      }}
                      className="text-gray-400 hover:text-brand-600">
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-gray-400 hover:text-red-600">
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              {exp.description && (
                <p className="text-sm text-gray-700 mt-2">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal ajout/édition */}
      {showAddModal && (
        <ExperienceModal
          experience={editingExp}
          onSave={handleSaveExperience}
          onClose={() => {
            setShowAddModal(false)
            setEditingExp(null)
          }}
        />
      )}
    </div>
  )
}
```

---

## INTÉGRATION DANS PROFIL

```jsx
// Dans ProfilePage.jsx

<div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
  {/* Header */}
  {/* ... */}

  {/* Bio */}
  {/* ... */}

  {/* NOUVEAU : Section Expérience */}
  <ExperienceSection userId={displayedUser.id} isMyProfile={isMyProfile} />

  {/* Documents */}
  {/* ... */}
</div>
```

---

## RÉSUMÉ

1. ✅ Historique **éditable par l'utilisateur** (pas auto-généré)
2. ✅ 5 rôles : joueur, coach, président, intendant/staff, supporter
3. ✅ Champs : club, équipe/catégorie, poste (si joueur), dates, description
4. ✅ Dates intelligentes : "Sep 2024 - Présent (7 mois)"
5. ✅ Ajouter/modifier/supprimer des expériences
6. ✅ Style LinkedIn avec timeline

---

## POUR CLAUDE CODE

```
Implémenter HISTORIQUE_LINKEDIN_STYLE.md :

1. Modifier structure mock data avec experiences
2. Créer ExperienceModal (ajout/édition)
3. Créer ExperienceSection (affichage)
4. Ajouter dans ProfilePage
5. Gérer permissios (que l'user peut éditer ses expériences)

Résultat : profil LinkedIn-like avec historique éditable par chacun.
```
