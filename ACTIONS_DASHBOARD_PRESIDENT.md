# ClubManager — Actions Dashboard Président

Tous les boutons et liens cliquables du dashboard président avec leurs destinations.

---

## ALERTES CLIQUABLES

### Alerte : Documents qui expirent bientôt

**Bouton :** "Voir les documents"

**Action :** 
```jsx
<button
  onClick={() => {
    setActiveTab('documents')
    // Filtrer automatiquement pour montrer seulement docs qui expirent
    setDocumentFilter('expiring-soon')
  }}
  className="text-sm font-medium text-brand-600 hover:underline">
  Voir les documents →
</button>
```

**Résultat :** Bascule vers onglet Documents + filtre "Documents expirant dans 30j"

---

### Alerte : Documents manquants

**Bouton :** "Contacter"

**Action :**
```jsx
<button
  onClick={() => {
    // Ouvrir une modal de sélection des personnes à contacter
    setShowContactModal(true)
    setPersonnesToContact(missingDocsUsers)
  }}
  className="text-sm font-medium text-brand-600 hover:underline">
  Contacter →
</button>
```

**Résultat :** Modal pour envoyer un message groupe aux personnes sans documents

```jsx
function ContactModal({ users, onClose }) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    // Envoyer message à tous les users
    users.forEach(user => {
      // Créer conversation ou ajouter message
      createMessage({
        conversation_id: getOrCreateConversation(user.id),
        content: message.trim(),
        author_id: currentUser.id,
      })
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold mb-4">
          Contacter {users.length} personne(s)
        </h2>

        <div className="mb-4 max-h-32 overflow-y-auto">
          <div className="text-sm text-gray-600 space-y-1">
            {users.map(u => (
              <div key={u.id}>
                {u.first_name} {u.last_name}
              </div>
            ))}
          </div>
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Bonjour, merci de nous fournir vos documents administratifs..."
          className="w-full mb-4"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={handleSend} className="flex-1 btn-primary justify-center">
            Envoyer à {users.length}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### Alerte : Cotisations impayées

**Bouton :** "Voir détails"

**Action :**
```jsx
<button
  onClick={() => {
    setActiveTab('financier')
    setFinancierFilter('unpaid')
  }}
  className="text-sm font-medium text-brand-600 hover:underline">
  Voir détails →
</button>
```

**Résultat :** Bascule vers onglet Financier + filtre "Cotisations impayées"

---

### Alerte : Présence aux entraînements faible

**Bouton :** (dans l'alerte)

**Action :**
```jsx
<button
  onClick={() => {
    setActiveTab('joueurs')
    // Filtre pour montrer joueurs <70% présence
    setPlayerFilter({ attendance: 'low' })
  }}
  className="text-sm font-medium text-brand-600 hover:underline">
  Voir joueurs →
</button>
```

**Résultat :** Bascule vers onglet Joueurs + filtre "Présence faible"

---

## ONGLET DOCUMENTS

### Bouton : "Voir les documents"

```jsx
// Déjà implémenté dans le tableau Documents
// Clic sur une ligne → ouvre modal avec détails
{clubMembers.map(member => (
  <button
    key={member.id}
    onClick={() => setShowMemberDocuments(member)}
    className="p-3 bg-surface-50 rounded-lg hover:bg-surface-100">
    {/* détails */}
  </button>
))}
```

### Modal détails documents du membre

```jsx
function MemberDocumentsModal({ member, onClose }) {
  const memberDocs = mockDocuments.filter(d => d.user_id === member.id)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            Documents · {member.first_name} {member.last_name}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          {memberDocs.map(doc => (
            <div key={doc.id} className="p-3 bg-surface-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">
                {doc.custom_name || doc.type}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                📅 {format(new Date(doc.uploaded_at), 'd MMM yyyy')}
                {doc.expires_at && (
                  <span className={doc.expires_at < new Date() ? 'text-red-600' : 'text-orange-600'}>
                    {' · '}⏰ Expire {format(new Date(doc.expires_at), 'd MMM yyyy')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-brand-600 hover:underline">
                  Télécharger
                </button>
                <button className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {memberDocs.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            Aucun document
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 btn-secondary justify-center">
          Fermer
        </button>
      </div>
    </div>
  )
}
```

---

## ONGLET JOUEURS

### Bouton : "Voir profil"

```jsx
// Dans la liste joueurs
{filtered.map(player => (
  <button
    key={player.id}
    onClick={() => {
      // Ouvrir pop-up profil joueur
      setShowPlayerModal(player)
    }}
    className="p-4 bg-surface-50 rounded-xl hover:bg-surface-100">
    {/* détails joueur */}
    <button className="text-brand-600 hover:underline text-sm">
      Voir profil
    </button>
  </button>
))}
```

**Résultat :** Affiche PlayerDetailModal (pop-up avec tous les détails du joueur)

---

## ONGLET PARAMÈTRES

### Bouton : "Éditer les infos du club"

```jsx
function ParametresTab({ club }) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="bg-surface-50 rounded-xl p-4">
        <div className="font-semibold text-gray-900 mb-3">Informations du club</div>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Nom du club :</span>
            <div className="font-medium text-gray-900">{club.name}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Ville :</span>
            <div className="font-medium text-gray-900">{club.city}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Président :</span>
            <div className="font-medium text-gray-900">
              {getClubPresident(club.id) || 'Non assigné'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Créé le :</span>
            <div className="font-medium text-gray-900">
              {club.created_at ? format(new Date(club.created_at), 'd MMM yyyy') : 'N/A'}
            </div>
          </div>

          <div>
            <span className="text-gray-600">Description :</span>
            <div className="font-medium text-gray-900">
              {club.description || 'Aucune description'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowEditModal(true)}
        className="btn-secondary">
        ✏️ Éditer les infos du club
      </button>

      {showEditModal && (
        <EditClubModal
          club={club}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedClub) => {
            // Mettre à jour le club
            updateClub(updatedClub)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}
```

### Modal édition infos club

```jsx
function EditClubModal({ club, onClose, onSave }) {
  const [name, setName] = useState(club.name)
  const [city, setCity] = useState(club.city)
  const [description, setDescription] = useState(club.description || '')
  const [logo, setLogo] = useState(null)

  const handleSave = () => {
    if (!name.trim() || !city.trim()) {
      alert('Nom et ville obligatoires')
      return
    }

    onSave({
      ...club,
      name: name.trim(),
      city: city.trim(),
      description: description.trim() || null,
      logo: logo || club.logo,
      updated_at: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold mb-5">Éditer le club</h2>

        <div className="space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo du club
            </label>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed 
                           border-surface-200 rounded-xl hover:border-brand-300 cursor-pointer">
              <span className="text-2xl">🖼️</span>
              <div className="text-sm text-gray-600">Ajouter un logo</div>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (ev) => setLogo(ev.target?.result)
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du club *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description du club
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Présentez votre club..."
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">
            Annuler
          </button>
          <button onClick={handleSave} className="flex-1 btn-primary justify-center">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## RÉSUMÉ TOUS LES LIENS

| Page | Bouton | Action |
|------|--------|--------|
| **Alertes** | Voir documents | Bascule Documents + filtre expirant |
| **Alertes** | Contacter | Modal message groupe personnes sans docs |
| **Alertes** | Voir détails | Bascule Financier + filtre impayés |
| **Alertes** | Voir joueurs | Bascule Joueurs + filtre présence faible |
| **Documents** | (sur ligne membre) | Modal avec détails documents du membre |
| **Joueurs** | Voir profil | Pop-up PlayerDetailModal |
| **Paramètres** | Éditer infos | Modal EditClubModal |

---

## POUR CLAUDE CODE

```
Implémenter ACTIONS_DASHBOARD_PRESIDENT.md :

1. Alertes cliquables → basculent vers bon onglet + filtre
2. Modal ContactModal pour envoyer messages groupe
3. Modal MemberDocumentsModal pour voir docs d'une personne
4. Clic joueur → PlayerDetailModal (réutiliser existant)
5. Modal EditClubModal pour éditer infos club

Tous les boutons du dashboard doivent maintenant faire quelque chose !
```
