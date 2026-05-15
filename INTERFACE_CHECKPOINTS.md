# ClubManager — Checkpoints Interfaces (mock data)

Ce document liste tous les écrans et leurs états à vérifier.
**Objectif :** Tout doit fonctionner visuellement avec des données fictives
en dur, sans toucher à la BDD.

---

## 📋 Méthodologie

Pour chaque page :
1. Remplacer tous les appels Supabase par des données mock en dur
2. Tester tous les boutons (ils doivent réagir visuellement même sans effet)
3. Tester tous les états (vide, chargement, avec données, erreur)
4. Vérifier que les modals s'ouvrent/ferment correctement
5. Vérifier que la navigation fonctionne

---

## 🏠 Page d'accueil (/)

### États à vérifier

**État initial :**
- [ ] Deux boutons visibles : "Se connecter" / "Créer un compte"
- [ ] Design propre, centré, responsive mobile
- [ ] Logo ou nom du site visible

**Actions :**
- [ ] Clic "Se connecter" → redirection `/login`
- [ ] Clic "Créer un compte" → redirection `/register`

---

## 🔐 Page Inscription (/register)

### États à vérifier

**Formulaire complet :**
- [ ] Champs : Prénom, Nom, Date naissance, Lieu naissance, Téléphone, Adresse, Code postal, Ville, Pays, Email, Mot de passe, Confirmer MDP
- [ ] Code postal France → affichage automatique "📍 Département — Région" en dessous
- [ ] Bouton "S'inscrire" désactivé si champs obligatoires vides
- [ ] Lien "Déjà un compte ? Se connecter" en bas

**Mock data :**
```jsx
const mockRegions = {
  '75': { departement: 'Paris', region: 'Île-de-France' },
  '62': { departement: 'Pas-de-Calais', region: 'Hauts-de-France' },
  '33': { departement: 'Gironde', region: 'Nouvelle-Aquitaine' },
}
```

**Actions :**
- [ ] Saisir code postal 75001 → affiche "📍 Paris — Île-de-France"
- [ ] Saisir code postal étranger → pas d'affichage région
- [ ] Clic "S'inscrire" → message succès en mock + redirection `/app/feed`
- [ ] Validation : email invalide → erreur visuelle
- [ ] Validation : MDP < 8 caractères → erreur visuelle
- [ ] Validation : MDP ≠ Confirmer → erreur visuelle

---

## 🔑 Page Connexion (/login)

### États à vérifier

**Formulaire :**
- [ ] Champs : Email, Mot de passe
- [ ] Bouton "Se connecter"
- [ ] Lien "Créer un compte" en bas

**Mock users :**
```jsx
const mockUsers = [
  { email: 'president@test.fr', password: 'password123', role: 'president' },
  { email: 'coach@test.fr', password: 'password123', role: 'coach' },
  { email: 'joueur@test.fr', password: 'password123', role: 'player' },
  { email: 'supporter@test.fr', password: 'password123', role: 'supporter' },
]
```

**Actions :**
- [ ] Connexion avec email/mdp valide → redirection `/app/feed`
- [ ] Connexion avec email inconnu → erreur "Identifiants incorrects"
- [ ] Connexion avec mauvais MDP → erreur "Identifiants incorrects"

---

## 🧭 Navigation principale (AppLayout)

### États à vérifier

**Menu visible pour tous :**
- [ ] Feed (icône journal)
- [ ] Équipes (icône bouclier)
- [ ] Calendrier (icône calendrier)
- [ ] Événements (icône mégaphone)
- [ ] Messagerie (icône bulle)
- [ ] Profil (icône user)

**Header :**
- [ ] Logo ou nom du club (si président/coach/joueur)
- [ ] Icône notifications (cloche) avec badge rouge si non lues
- [ ] Avatar user cliquable

**Panel notifications (au clic sur cloche) :**
- [ ] Liste des notifications mock
- [ ] Badge "non lu" sur les nouvelles
- [ ] Boutons "Accepter" / "Refuser" sur les demandes d'adhésion
- [ ] Clic "Accepter" → notif disparaît + message succès
- [ ] Clic "Refuser" → notif disparaît
- [ ] Clic en dehors → panel se ferme

**Mock notifs :**
```jsx
const mockNotifications = [
  {
    id: '1',
    type: 'registration_request',
    title: 'Demande de coach',
    body: 'Jean Dupont souhaite rejoindre comme coach et créer l\'équipe "Séniors B"',
    read: false,
    request_id: 'req-1',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'request_approved',
    title: 'Demande acceptée',
    body: 'Votre demande a été acceptée par le club.',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]
```

---

## 📰 Page Feed (/app/feed)

### États à vérifier

**État : Président/Coach avec club :**
- [ ] Zone "Publier au nom de [Nom du club]" visible en haut
- [ ] Avatar du club (initiale colorée) à gauche
- [ ] Textarea + bouton "Publier"
- [ ] Liste des posts dessous

**État : Joueur/Supporter :**
- [ ] Pas de zone de publication
- [ ] Uniquement la liste des posts

**État : Aucun club suivi :**
- [ ] EmptyState : "📰 Aucun post pour l'instant"
- [ ] Bouton "Explorer les clubs"

**PostCard :**
- [ ] Avatar du club (initiale colorée)
- [ ] Nom du club en gras
- [ ] "par [Prénom Nom]" en petit gris
- [ ] Timestamp relatif ("il y a 2h")
- [ ] Contenu du post
- [ ] Image si présente
- [ ] Boutons : ❤️ J'aime (avec compteur) + 💬 Commenter (avec compteur)
- [ ] Clic J'aime → cœur devient rouge + compteur +1
- [ ] Clic Commenter → zone commentaires s'ouvre

**Commentaires :**
- [ ] Liste des commentaires existants
- [ ] Avatar + nom de l'auteur
- [ ] Contenu du commentaire
- [ ] Input + bouton "Envoyer" pour ajouter un commentaire
- [ ] Nouveau commentaire s'ajoute immédiatement à la liste

**Mock posts :**
```jsx
const mockPosts = [
  {
    id: '1',
    club: { name: 'FC Lens Académie', city: 'Lens' },
    author: { first_name: 'Jean', last_name: 'Dupont' },
    content: '🏆 Victoire 3-1 ce week-end ! Bravo à toute l\'équipe 💪',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes: 12,
    comments: [
      { id: '1', author: { first_name: 'Marie', last_name: 'Martin' }, 
        content: 'Félicitations ! 👏', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    club: { name: 'AS Saint-Denis', city: 'Saint-Denis' },
    author: { first_name: 'Sophie', last_name: 'Bernard' },
    content: '📢 Repas de fin de saison samedi 20h au club house. Venez nombreux !',
    media_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: 8,
    comments: [],
  },
]
```

**Actions :**
- [ ] Taper du texte dans textarea → compteur de caractères (optionnel)
- [ ] Clic "Publier" → post s'ajoute en haut de la liste + textarea se vide
- [ ] Scroll → chargement fluide des posts
- [ ] Clic sur un post → rien (ou ouvre en plein écran, à définir)

---

## ⚽ Page Équipes (/app/team)

### Onglets

- [ ] "Mes équipes" (par défaut)
- [ ] "Explorer"

---

### Onglet "Mes équipes"

**État : Président sans équipe**
- [ ] Icône ⚽ grand format
- [ ] "Votre club n'a pas encore d'équipe"
- [ ] Bouton "+ Créer une équipe"
- [ ] Clic → modal CreateTeamModal s'ouvre

**État : Président avec équipes**
- [ ] Bouton "+ Nouvelle équipe" dans le header
- [ ] Liste des équipes sous forme de cartes
- [ ] Chaque carte : nom équipe, nombre joueurs, prochain match, prochain entraînement

**État : Coach avec équipes**
- [ ] Liste des équipes dont il est coach
- [ ] Bouton "Gérer l'équipe" sur chaque carte

**État : Joueur avec équipes**
- [ ] Liste des équipes dont il est joueur
- [ ] Prochain match + bouton "✓ Disponible / ✗ Indisponible"
- [ ] Prochain entraînement + bouton "✓ Présent / ✗ Absent"

**État : Supporter / Sans équipe**
- [ ] Icône ⚽
- [ ] "Vous n'êtes dans aucune équipe"
- [ ] Boutons : "Intégrer une équipe" / "Suivre un club"

**Modal CreateTeamModal :**
- [ ] Champ "Nom de l'équipe" (ex: Séniors A, U13)
- [ ] Select "Genre" (Mixte / Masculin / Féminin)
- [ ] Boutons "Annuler" / "Créer"
- [ ] Clic "Créer" → modal se ferme + équipe s'ajoute à la liste

**Mock équipes :**
```jsx
const mockTeams = [
  {
    id: '1',
    name: 'Séniors A',
    players_count: 18,
    next_match: {
      opponent: 'FC Valenciennes',
      date: '2026-05-22T15:00:00Z',
      location: 'Stade Bollaert',
      is_home: true,
    },
    next_training: {
      date: '2026-05-18T19:30:00Z',
      location: 'Terrain Bollaert',
    },
  },
  {
    id: '2',
    name: 'U13 Groupe B',
    players_count: 12,
    next_match: null,
    next_training: {
      date: '2026-05-19T18:00:00Z',
      location: 'Terrain annexe',
    },
  },
]
```

---

### Onglet "Explorer"

**Filtres de recherche :**
- [ ] Select "Région" (toutes les régions de France)
- [ ] Select "Département" (filtré selon région choisie)
- [ ] Input "Nom du club ou ville"

**Résultats :**
- [ ] Cartes de clubs
- [ ] Chaque carte : nom club, ville, département — région, nombre équipes
- [ ] Bouton "♥ Suivre" / "✓ Suivi"
- [ ] Clic sur la carte → drawer latéral s'ouvre (profil club)

**Drawer ClubProfileDrawer :**
- [ ] Header : avatar club + nom + ville
- [ ] Bouton fermer (✕) en haut à droite
- [ ] Stats : nombre équipes, nombre posts
- [ ] 3 onglets : Infos / Posts / Équipes

**Onglet Infos :**
- [ ] Email, téléphone, adresse
- [ ] Bouton "Voir la page complète"

**Onglet Posts :**
- [ ] Liste des posts récents du club
- [ ] Affichage simplifié (auteur + date + contenu)

**Onglet Équipes :**
- [ ] Boutons de sélection d'équipe
- [ ] Liste des joueurs de l'équipe sélectionnée
- [ ] Pour chaque joueur : numéro, nom, poste, âge

**Mock clubs :**
```jsx
const mockClubs = [
  {
    id: '1',
    name: 'FC Lens Académie',
    city: 'Lens',
    department: 'Pas-de-Calais',
    region: 'Hauts-de-France',
    teams_count: 5,
    posts_count: 12,
    teams: [
      { id: '1', name: 'Séniors A', players: [
        { id: '1', jersey_number: 9, first_name: 'Karim', last_name: 'Diallo', 
          position: 'Attaquant', birth_date: '2001-05-12' },
        { id: '2', jersey_number: 10, first_name: 'Nolan', last_name: 'Garcia', 
          position: 'Milieu', birth_date: '2003-08-25' },
      ]},
    ],
  },
  {
    id: '2',
    name: 'AS Saint-Denis United',
    city: 'Saint-Denis',
    department: 'Seine-Saint-Denis',
    region: 'Île-de-France',
    teams_count: 3,
    posts_count: 8,
    teams: [],
  },
]
```

**Actions :**
- [ ] Sélectionner région "Hauts-de-France" → départements filtrés (Pas-de-Calais, Nord, Oise...)
- [ ] Sélectionner département "Pas-de-Calais" → clubs filtrés
- [ ] Taper "Lens" dans recherche → clubs filtrés
- [ ] Clic sur carte club → drawer s'ouvre
- [ ] Naviguer entre onglets dans le drawer
- [ ] Clic "Voir la page complète" → redirection `/app/clubs/:clubId`

---

## 📅 Page Calendrier (/app/calendar)

### États à vérifier

**Vue calendrier mensuel :**
- [ ] Nom du mois + année en haut
- [ ] Boutons < > pour naviguer entre mois
- [ ] Grille du calendrier avec jours
- [ ] Événements affichés sur les bonnes dates (pastilles colorées)

**Événements affichés :**
- [ ] Matchs (pastille rouge)
- [ ] Entraînements (pastille bleue)
- [ ] Événements club (pastille verte)

**Clic sur un jour :**
- [ ] Liste des événements de ce jour en dessous
- [ ] Pour chaque événement : icône, titre, horaire, lieu

**Mock événements :**
```jsx
const mockCalendarEvents = [
  {
    id: '1',
    type: 'match',
    title: 'FC Lens vs Valenciennes',
    date: '2026-05-22',
    time: '15:00',
    location: 'Stade Bollaert',
  },
  {
    id: '2',
    type: 'training',
    title: 'Entraînement Séniors A',
    date: '2026-05-18',
    time: '19:30',
    location: 'Terrain Bollaert',
  },
  {
    id: '3',
    type: 'event',
    title: 'Repas de fin de saison',
    date: '2026-05-25',
    time: '20:00',
    location: 'Club house',
  },
]
```

---

## 🎉 Page Événements (/app/events)

### Onglets

- [ ] "Événements" (par défaut)
- [ ] "Matchs à venir"

**Bouton "+ Créer un événement" visible si président/coach**

---

### Onglet "Événements"

**Liste des événements :**
- [ ] Triés par date (prochain en premier)
- [ ] Chaque carte : icône, titre, date & heure, lieu, description
- [ ] Bouton "✓ Participer" / "✗ Annuler" (selon statut)

**État vide :**
- [ ] "🎉 Aucun événement prévu"
- [ ] Bouton "Créer un événement" (si président/coach)

**Mock événements :**
```jsx
const mockEvents = [
  {
    id: '1',
    title: 'Repas de fin de saison',
    description: 'Grand repas annuel pour tous les membres et familles',
    starts_at: '2026-05-25T20:00:00Z',
    ends_at: '2026-05-25T23:00:00Z',
    location: 'Club house',
    visibility: 'club_wide',
    participants: 24,
  },
  {
    id: '2',
    title: 'Assemblée générale',
    description: 'AG annuelle — bilan financier',
    starts_at: '2026-06-05T19:00:00Z',
    ends_at: '2026-06-05T21:00:00Z',
    location: 'Salle des fêtes',
    visibility: 'role_based',
    participants: 8,
  },
]
```

---

### Onglet "Matchs à venir"

**Liste des matchs :**
- [ ] Triés par date
- [ ] Chaque carte : équipe, adversaire, date & heure, lieu, domicile/déplacement
- [ ] Bouton "✓ Disponible" / "✗ Indisponible" (si joueur)

**État vide :**
- [ ] "⚽ Aucun match prévu"

**Mock matchs :**
```jsx
const mockUpcomingMatches = [
  {
    id: '1',
    team: 'Séniors A',
    opponent: 'FC Valenciennes',
    scheduled_at: '2026-05-22T15:00:00Z',
    location: 'Stade Bollaert',
    is_home: true,
  },
  {
    id: '2',
    team: 'U13 Groupe B',
    opponent: 'US Hénin B',
    scheduled_at: '2026-05-23T10:00:00Z',
    location: 'Terrain annexe',
    is_home: true,
  },
]
```

---

### Modal CreateEventModal

**Champs :**
- [ ] Titre *
- [ ] Description
- [ ] Lieu
- [ ] Date début * (datetime-local)
- [ ] Date fin (optionnel)
- [ ] Visibilité (Tout le club / Membres uniquement / Équipe spécifique)

**Actions :**
- [ ] Clic "Créer" → modal se ferme + événement s'ajoute à la liste
- [ ] Clic "Annuler" → modal se ferme sans changement
- [ ] Validation : titre vide → erreur
- [ ] Validation : date début vide → erreur

---

## 💬 Page Messagerie (/app/messages)

### Layout 2 colonnes

**Colonne gauche : liste conversations**
- [ ] Bouton "+ Nouvelle discussion" en haut
- [ ] Liste des conversations
- [ ] Pour chaque conv : avatar, nom, dernier message, timestamp
- [ ] Badge rouge si messages non lus
- [ ] Clic sur conv → s'ouvre dans colonne droite

**État vide colonne gauche :**
- [ ] Icône 💬
- [ ] "Aucune conversation"
- [ ] "Recherchez un membre pour démarrer"

**Colonne droite : conversation active**
- [ ] Header : nom de la personne + avatar
- [ ] Zone messages (bulles de chat)
- [ ] Input message en bas
- [ ] Bouton "Envoyer"

**État vide colonne droite :**
- [ ] Icône 💬
- [ ] "Vos messages"
- [ ] "Sélectionnez une conversation ou recherchez un membre"
- [ ] Bouton "Rechercher un membre"

**Modal recherche membre :**
- [ ] Input recherche
- [ ] Liste membres filtrés du club
- [ ] Clic sur membre → crée/ouvre conv + ferme modal

**Messages :**
- [ ] Bulles alignées à droite (messages envoyés)
- [ ] Bulles alignées à gauche (messages reçus)
- [ ] Timestamp sous chaque message
- [ ] Scroll automatique vers le bas

**Mock conversations :**
```jsx
const mockConversations = [
  {
    id: '1',
    name: 'Jean Dupont',
    avatar: 'JD',
    last_message: 'Ok pour samedi !',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: 1,
  },
  {
    id: '2',
    name: 'Marie Martin',
    avatar: 'MM',
    last_message: 'Merci pour l\'info',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    unread: 0,
  },
]

const mockMessages = {
  '1': [
    { id: '1', sender: 'me', content: 'Salut Jean, tu es dispo samedi ?', 
      sent_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '2', sender: 'them', content: 'Oui pas de souci !', 
      sent_at: new Date(Date.now() - 5400000).toISOString() },
    { id: '3', sender: 'me', content: 'Parfait, RDV 14h au stade', 
      sent_at: new Date(Date.now() - 3700000).toISOString() },
    { id: '4', sender: 'them', content: 'Ok pour samedi !', 
      sent_at: new Date(Date.now() - 3600000).toISOString() },
  ],
}
```

**Actions :**
- [ ] Taper message + Enter → message s'ajoute immédiatement en bas
- [ ] Clic "Envoyer" → même effet
- [ ] Clic "+ Nouvelle discussion" → modal s'ouvre
- [ ] Rechercher "Jean" → résultat filtré
- [ ] Clic sur membre → conv s'ouvre

---

## 👤 Page Profil (/app/profile)

### Sections

**Header profil :**
- [ ] Avatar (initiales colorées)
- [ ] Nom complet
- [ ] Email
- [ ] Rôle + nom du club (si dans un club)

**Bannière club (si dans un club) :**
- [ ] Nom du club
- [ ] Rôle · Sport · Ville
- [ ] Bouton "Quitter le club"

**Bannière sans club :**
- [ ] "Vous n'êtes dans aucun club"
- [ ] "Rejoignez un club existant ou créez le vôtre"
- [ ] Boutons : "Rejoindre un club" / "Créer un club"

**Infos personnelles :**
- [ ] Date de naissance + âge
- [ ] Lieu de naissance
- [ ] Téléphone
- [ ] Adresse complète
- [ ] Si France : Département — Région en gris
- [ ] Bouton "Modifier mon profil"

**Mode édition :**
- [ ] Tous les champs deviennent des inputs
- [ ] Code postal → résolution auto département/région
- [ ] Boutons "Annuler" / "Enregistrer"
- [ ] Clic "Enregistrer" → retour mode lecture + message succès

**Historique (si a déjà fait partie d'autres clubs) :**
- [ ] Liste des clubs précédents
- [ ] Pour chaque : nom club, rôle, période
- [ ] Clic → redirection `/app/history/:teamId/:season`

**Modal "Quitter le club" :**
- [ ] Icône 🚪
- [ ] "Quitter [Nom du club] ?"
- [ ] Description des conséquences
- [ ] Si président seul : message d'erreur + bouton désactivé
- [ ] Si coach : message d'info "Le président prendra le relais"
- [ ] Boutons "Annuler" / "Confirmer le départ"
- [ ] Clic "Confirmer" → modal se ferme + bannière passe à "sans club"

**Mock user :**
```jsx
const mockUser = {
  id: '1',
  email: 'karim.diallo@test.fr',
  first_name: 'Karim',
  last_name: 'Diallo',
  birth_date: '2001-05-12',
  birth_place: 'Paris',
  phone: '06 12 34 56 78',
  address: '12 rue du Stade',
  postal_code: '62300',
  city: 'Lens',
  country: 'France',
  department: 'Pas-de-Calais',
  region: 'Hauts-de-France',
  current_club: {
    id: '1',
    name: 'FC Lens Académie',
    role: 'player',
    sport: 'Football',
  },
  history: [
    {
      club_name: 'AS Liévin',
      role: 'player',
      season: '2023-2024',
      team_id: 't1',
    },
  ],
}
```

---

## 📊 Résumé par rôle

### Président
- [ ] Bouton "+ Nouvelle équipe" visible (TeamPage)
- [ ] Bouton "+ Créer un événement" visible (EventsPage)
- [ ] Zone publication feed visible
- [ ] Panel notifications avec demandes d'adhésion à valider
- [ ] Ne peut pas quitter si seul président

### Coach
- [ ] Bouton "+ Créer un événement" visible
- [ ] Zone publication feed visible
- [ ] Gestion de ses équipes (compositions, convocations)
- [ ] Info "Le président prendra le relais" si quitte

### Joueur
- [ ] Boutons "Disponible/Indisponible" sur matchs
- [ ] Boutons "Présent/Absent" sur entraînements
- [ ] Pas de zone publication feed
- [ ] Peut quitter librement

### Supporter
- [ ] Uniquement lecture feed + explorer clubs
- [ ] Peut suivre des clubs/équipes (favoris)
- [ ] Pas de zone publication
- [ ] Peut quitter librement

---

## ✅ Checklist globale

### Navigation
- [ ] Tous les liens du menu fonctionnent
- [ ] Breadcrumb ou fil d'ariane si navigation profonde
- [ ] Bouton retour sur pages détails
- [ ] Responsive mobile (menu burger)

### Modals
- [ ] Toutes les modals s'ouvrent au clic
- [ ] Overlay sombre derrière
- [ ] Clic overlay → ferme la modal
- [ ] Bouton ✕ → ferme la modal
- [ ] Escape → ferme la modal

### Formulaires
- [ ] Validation en temps réel
- [ ] Messages d'erreur clairs
- [ ] Champs obligatoires marqués *
- [ ] Bouton submit désactivé si invalide
- [ ] Loading state sur boutons submit

### États de chargement
- [ ] Spinner ou skeleton pendant chargement
- [ ] Pas de flash de contenu vide

### États vides
- [ ] Icône + titre + description + action
- [ ] Jamais de page totalement blanche
- [ ] Message adapté au contexte

### Feedback utilisateur
- [ ] Toast/snackbar pour succès d'action
- [ ] Message d'erreur si échec
- [ ] Confirmation avant action destructive

### Responsive
- [ ] Toutes les pages testées mobile (<400px)
- [ ] Textes lisibles
- [ ] Boutons cliquables (min 44x44px)
- [ ] Pas de scroll horizontal

---

## 🎯 Prochaine étape

Une fois TOUS ces checkpoints validés avec mock data :
1. Documenter le schéma BDD complet depuis zéro
2. Créer les tables une par une
3. Remplacer le mock data par les vrais appels Supabase
4. Tester chaque page une par une avec vraies données
