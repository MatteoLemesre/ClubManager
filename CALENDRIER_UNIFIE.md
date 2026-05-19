# ClubManager — Calendrier Unifié (Matchs + Événements)

Modifications à appliquer sur le code existant pour fusionner Matchs et Calendrier en une seule page.

---

## OBJECTIF

Avoir **UNE SEULE page Calendrier** qui contient à la fois les matchs et les événements, avec un layout 70/30.

---

## 1. SUPPRIMER la page Matchs standalone

### Fichiers à supprimer :
- `src/pages/app/MatchesPage.jsx` (si elle existe)

### Fichiers à modifier :
- `src/App.jsx` → Supprimer la route `/app/matches` (liste des matchs)
- Garder uniquement la route `/app/matches/:matchId` (détail d'un match)

### Navigation :
Retirer l'onglet "Matchs à venir" de la nav principale.

**Navigation finale (5 onglets) :**
1. Feed (📰)
2. Équipes (⚽)
3. Calendrier (📅) ← Contient les matchs maintenant
4. Messagerie (💬)
5. Profil (👤)

---

## 2. MODIFIER CalendarPage — Layout 70/30

### Route : `/app/calendar`

### Structure complète

```jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CalendarPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)

  // Fusionner tous les types d'événements
  const allCalendarItems = useMemo(() => {
    const items = []

    // 1. Matchs filtrés selon suivi
    const filteredMatches = mockUpcomingMatches.filter(match => {
      if (currentUser.followed_clubs?.includes(match.team.club_id)) return true
      if (currentUser.followed_teams?.includes(match.team_id)) return true
      return false
    }).map(m => ({ ...m, type: 'match', date: m.scheduled_at }))

    // 2. Entraînements (si membre d'équipes)
    const trainings = mockTrainings
      .filter(t => currentUser.teams?.includes(t.team_id))
      .map(t => ({ ...t, type: 'training', date: t.scheduled_at }))

    // 3. Événements filtrés selon visibilité
    const events = mockEvents
      .filter(e => canSeeEvent(e, currentUser))
      .map(e => ({ ...e, type: 'event', date: e.starts_at }))

    items.push(...filteredMatches, ...trainings, ...events)
    items.sort((a, b) => new Date(a.date) - new Date(b.date))

    return items
  }, [currentUser])

  // 10 prochains pour la colonne droite
  const upcomingItems = allCalendarItems
    .filter(item => new Date(item.date) >= new Date())
    .slice(0, 10)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
        <h1 className="font-display text-2xl font-bold">📅 Calendrier</h1>
        
        {isOneOf(currentUser.role, 'president', 'coach') && (
          <button 
            onClick={() => setShowCreateEvent(true)}
            className="btn-primary">
            + Créer un événement
          </button>
        )}
      </div>

      {/* Layout 70/30 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Colonne gauche 70% - Calendrier mensuel */}
        <div className="flex-[7] p-6 overflow-auto">
          <CalendarMonthView 
            items={allCalendarItems}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onClickItem={(item) => {
              if (item.type === 'match') {
                navigate(`/app/matches/${item.id}`)
              } else {
                setSelectedEvent(item)
              }
            }}
          />
        </div>

        {/* Colonne droite 30% - Prochains */}
        <div className="flex-[3] border-l border-surface-200 p-6 overflow-auto">
          <h3 className="font-semibold text-gray-900 mb-4">📌 Prochains</h3>
          
          <div className="space-y-3">
            {upcomingItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <div className="text-4xl mb-2">📅</div>
                <div>Aucun événement à venir</div>
              </div>
            ) : (
              upcomingItems.map(item => (
                <UpcomingItemCard 
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (item.type === 'match') {
                      navigate(`/app/matches/${item.id}`)
                    } else {
                      setSelectedEvent(item)
                    }
                  }}
                />
              ))
            )}
          </div>

          <button className="mt-4 w-full text-brand-600 text-sm font-medium hover:text-brand-700">
            Voir tous les événements →
          </button>
        </div>
      </div>

      {/* Modal création événement */}
      {showCreateEvent && (
        <CreateEventModal
          clubId={currentUser.current_club_id}
          authorId={currentUser.id}
          userRole={currentUser.role}
          onClose={() => setShowCreateEvent(false)}
          onCreated={(event) => {
            // Recharger ou ajouter à la liste
            setShowCreateEvent(false)
          }}
        />
      )}

      {/* Pop-up événement */}
      {selectedEvent && (
        <EventDetailPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}
```

---

## 3. COMPOSANT CalendarMonthView

Affiche le calendrier mensuel avec pastilles colorées.

```jsx
function CalendarMonthView({ items, selectedDate, onSelectDate, onClickItem }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Générer les jours du mois
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Grouper les items par jour
  const itemsByDay = useMemo(() => {
    const grouped = {}
    items.forEach(item => {
      const day = format(new Date(item.date), 'yyyy-MM-dd')
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(item)
    })
    return grouped
  }, [items])

  const getItemColor = (item) => {
    switch(item.type) {
      case 'match': return 'bg-red-500'
      case 'training': return 'bg-blue-500'
      case 'event':
        if (item.visibility === 'public') return 'bg-green-500'
        if (item.visibility === 'team') return 'bg-yellow-500'
        if (item.visibility === 'club') return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div>
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-surface-100 rounded-xl">
          ←
        </button>
        <h2 className="font-display text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-surface-100 rounded-xl">
          →
        </button>
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-2">
        {/* Headers jours */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
            {day}
          </div>
        ))}

        {/* Jours du mois */}
        {daysInMonth.map(day => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const dayItems = itemsByDay[dayKey] || []
          const isToday = isSameDay(day, new Date())
          const isSelected = isSameDay(day, selectedDate)

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDate(day)}
              className={`
                min-h-24 p-2 border border-surface-200 rounded-xl cursor-pointer
                hover:bg-surface-50 transition-all
                ${isToday ? 'border-brand-400 bg-brand-50' : ''}
                ${isSelected ? 'ring-2 ring-brand-600' : ''}
              `}>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                {format(day, 'd')}
              </div>
              
              {/* Pastilles événements */}
              <div className="flex flex-wrap gap-1">
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClickItem(item)
                    }}
                    className={`w-2 h-2 rounded-full ${getItemColor(item)}`}
                    title={item.title || item.opponent}
                  />
                ))}
                {dayItems.length > 3 && (
                  <div className="text-[10px] text-gray-400">+{dayItems.length - 3}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## 4. COMPOSANT UpcomingItemCard

Carte pour la liste de droite (mixe matchs + événements).

```jsx
function UpcomingItemCard({ item, onClick }) {
  if (item.type === 'match') {
    return (
      <div 
        onClick={onClick}
        className="p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer transition-all">
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs text-gray-400">
            {format(new Date(item.date), "EEE d MMM · HH'h'mm", { locale: fr })}
          </div>
          {item.carpools > 0 && (
            <div className="text-xs text-brand-600">🚗 {item.carpools}</div>
          )}
        </div>
        <div className="font-semibold text-sm text-gray-900 mb-1">
          ⚽ {item.team.name} vs {item.opponent}
        </div>
        <div className="text-xs text-gray-500">
          🏟️ {item.location} · {item.is_home ? 'Dom.' : 'Ext.'}
        </div>
      </div>
    )
  }

  if (item.type === 'training') {
    return (
      <div 
        onClick={onClick}
        className="p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer transition-all">
        <div className="text-xs text-gray-400 mb-2">
          {format(new Date(item.date), "EEE d MMM · HH'h'mm", { locale: fr })}
        </div>
        <div className="font-semibold text-sm text-gray-900 mb-1">
          🏃 Entraînement {item.team.name}
        </div>
        <div className="text-xs text-gray-500">
          📍 {item.location}
        </div>
      </div>
    )
  }

  if (item.type === 'event') {
    const icon = item.visibility === 'public' ? '🎉' : 
                 item.visibility === 'team' ? '⚽' : '📋'
    return (
      <div 
        onClick={onClick}
        className="p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 cursor-pointer transition-all">
        <div className="text-xs text-gray-400 mb-2">
          {format(new Date(item.date), "EEE d MMM · HH'h'mm", { locale: fr })}
        </div>
        <div className="font-semibold text-sm text-gray-900 mb-1">
          {icon} {item.title}
        </div>
        <div className="text-xs text-gray-500">
          📍 {item.location}
        </div>
      </div>
    )
  }

  return null
}
```

---

## 5. MODAL CreateEventModal

Modal de création d'événement pour président/coach.

```jsx
function CreateEventModal({ clubId, authorId, userRole, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [link, setLink] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [teamId, setTeamId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Titre requis'); return }
    if (!startsAt) { setError('Date de début requise'); return }
    if (visibility === 'team' && !teamId) { setError('Équipe requise'); return }

    setLoading(true)
    setError('')

    try {
      const newEvent = {
        id: Date.now().toString(),
        type: 'event',
        visibility,
        club_id: clubId,
        team_id: visibility === 'team' ? teamId : null,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        link: link.trim() || null,
        created_by: authorId,
      }

      onCreated(newEvent)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Créer un événement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Repas de fin de saison, AG..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Détails de l'événement..."
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Adresse ou nom du lieu..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {/* Lien externe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lien externe</label>
            <input
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Visibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibilité *</label>
            <select value={visibility} onChange={e => setVisibility(e.target.value)}>
              <option value="public">Public (tous les followers)</option>
              {userRole === 'coach' && (
                <option value="team">Équipe uniquement</option>
              )}
              {userRole === 'president' && (
                <>
                  <option value="team">Équipe uniquement</option>
                  <option value="club">Club uniquement (membres)</option>
                </>
              )}
            </select>
          </div>

          {/* Select équipe si visibility = team */}
          {visibility === 'team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quelle équipe ? *</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="">Choisir une équipe...</option>
                {mockTeams
                  .filter(t => t.club_id === clubId)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 btn-primary justify-center disabled:opacity-40">
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. POP-UP EventDetailPopup

Pop-up centré pour afficher les détails d'un événement/entraînement.

```jsx
function EventDetailPopup({ event, onClose }) {
  const icon = event.type === 'training' ? '🏃' :
               event.visibility === 'public' ? '🎉' :
               event.visibility === 'team' ? '⚽' : '📋'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            {icon} {event.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="space-y-4">
          {/* Date & heure */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>
            <span>
              {format(new Date(event.date), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}
              {event.ends_at && ` - ${format(new Date(event.ends_at), "HH'h'mm")}`}
            </span>
          </div>

          {/* Lieu */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}

          {/* Organisateur */}
          {event.created_by && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👤</span>
              <span>Organisé par {event.author?.first_name} {event.author?.last_name}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">📝 Description</div>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          )}

          {/* Lien */}
          {event.link && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">🔗 Lien</div>
              <a 
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:underline">
                {event.link}
              </a>
            </div>
          )}

          {/* Participation (si événement futur) */}
          {new Date(event.date) > new Date() && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">✋ Votre participation</div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-medium text-sm hover:bg-emerald-200">
                  ✓ Je participe
                </button>
                <button className="flex-1 py-2 rounded-xl bg-red-100 text-red-600 font-medium text-sm hover:bg-red-200">
                  ✗ Je ne participe pas
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button onClick={onClose} className="btn-secondary w-full justify-center">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. ENRICHIR la page Match détaillé

### Fichier : `src/pages/app/MatchDetailPage.jsx`

Ajouter dans le header les infos manquantes :

```jsx
// Header enrichi
<div className="bg-white rounded-2xl border border-surface-200 p-6 mb-6">
  <button 
    onClick={() => navigate('/app/calendar')}
    className="text-sm text-gray-500 hover:text-gray-700 mb-4">
    ← Retour au calendrier
  </button>

  <div className="text-center">
    {/* Catégorie + round */}
    <div className="text-sm text-gray-400 mb-2">
      🏆 {match.category || 'Championnat'} {match.round && `— J${match.round}`}
    </div>

    {/* Équipes */}
    <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
      {match.team.club.name} — {match.team.name}
    </h1>
    <div className="text-xl text-gray-500 mb-1">vs</div>
    <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
      {match.opponent}
    </h2>

    {/* Score si match joué */}
    {match.score_home !== undefined && (
      <div className="text-3xl font-bold text-brand-600 mb-4">
        {match.score_home} - {match.score_away}
      </div>
    )}

    {/* Infos match */}
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <span>📅</span>
        <span>{format(new Date(match.scheduled_at), "EEEE d MMMM yyyy · HH'h'mm", { locale: fr })}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🏟️</span>
        <span>{match.location} — {match.is_home ? 'Domicile' : 'Extérieur'}</span>
      </div>
      {match.referee && (
        <div className="flex items-center gap-1">
          <span>👨‍⚖️</span>
          <span>Arbitre : {match.referee}</span>
        </div>
      )}
    </div>
  </div>
</div>
```

---

## RÉSUMÉ DES CHANGEMENTS

1. ✅ Supprimer page "Matchs à venir" (liste)
2. ✅ Garder uniquement `/app/calendar` dans la navigation
3. ✅ Layout 70/30 : calendrier + liste prochains (mixte)
4. ✅ Pastilles colorées par type (match/training/event)
5. ✅ Bouton "+ Créer un événement" pour président/coach
6. ✅ Clic match → `/app/matches/:matchId` (fiche détail)
7. ✅ Enrichir header match détaillé (catégorie, arbitre, round)

---

## POUR CLAUDE CODE

```
Appliquer CALENDRIER_UNIFIE.md :

1. Supprimer MatchesPage.jsx (si existe) + route liste matchs
2. Modifier CalendarPage.jsx :
   - Layout 70/30 complet avec code fourni
   - CalendarMonthView avec pastilles
   - UpcomingItemCard pour liste droite
   - Bouton "+ Créer un événement" (président/coach)
3. Ajouter CreateEventModal (code fourni)
4. Ajouter EventDetailPopup (code fourni)
5. Enrichir MatchDetailPage header (catégorie, arbitre, round)
6. Navigation : 5 onglets (retirer Matchs)
7. Mock data : ajouter category, round, referee aux matchs

Ordre : 1 → 2 → 3 → 4 → 5 → 6 → 7
```