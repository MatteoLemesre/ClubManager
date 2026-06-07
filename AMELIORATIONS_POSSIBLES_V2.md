# ClubManager — Améliorations Possibles (Avec Claude Code)

Guide des améliorations à implémenter avec génération de code automatique via Claude Code.

---

## COMMENT UTILISER CE GUIDE

### Pour chaque amélioration :

1. **Lire la description** dans ce document
2. **Cliquer le bouton** du launcher interactif
3. **Claude génère** un artifact React complet
4. **Copier-coller** le code dans ton projet

---

## PRIORITÉ 1 : CRITIQUES (À faire d'abord)

### 1.1 Notation des joueurs (1-5 étoiles)

**Description :** Après chaque match, les coachs/présidents notent les joueurs pour le feedback et la performance.

**Features :**
- Sélection du match (dropdown)
- Liste des joueurs avec position/numéro
- Notation 1-5 étoiles (interactive)
- Notes optionnelles par joueur
- Moyenne globale du joueur (tous matchs)
- Historique des notations
- Modification d'une notation existante
- Affichage coloré (note élevée = vert, basse = rouge)

**Données à persister :**
```js
{
  id: 'rating-1',
  matchId: 'match-1',
  playerId: 'player-1',
  score: 4,
  notes: 'Très bon match, 2 buts',
  ratedBy: 'user-coach-1',
  createdAt: '2024-06-01T18:00:00',
}
```

**Estimation effort :** 2-3 jours

**Impact :** CRITIQUE — Feedback joueurs + performance

---

### 1.2 Gestion cotisations + Stripe

**Description :** Dashboard financier pour tracker et percevoir les cotisations (via Stripe).

**Features :**
- Liste joueurs avec montant cotisation (junior/senior)
- Statut paiement (payé/impayé/en attente)
- Intégration Stripe (payment intent)
- Historique des paiements
- Rappels email automatiques
- Export CSV pour comptabilité
- Graphique revenus/dépenses

**Composants nécessaires :**
- `CotisationDashboard` — Vue globale
- `CotisationModal` — Demander paiement à un joueur
- `StripeCheckout` — Intégration paiement
- `PaymentHistory` — Historique transactions

**Estimation effort :** 3-4 jours

**Impact :** CRITIQUE — Gestion financière du club

---

### 1.3 Convocations améliorées

**Description :** Système avancé de convocation avec statuts de disponibilité et rappels.

**Features :**
- Créer convocation pour match/entraînement
- Checkboxes joueurs (convoqué/non-convoqué)
- Statuts disponibilité : dispo / indispo / incertain / non-répondu
- Notes du coach par joueur
- Rappels automatiques 24h avant
- Statistiques présence (%)
- Vue joueur : répondre à la convocation
- Vue coach : voir qui a confirmé

**Données :**
```js
{
  id: 'convocation-1',
  matchId: 'match-1',
  playerId: 'player-1',
  status: 'available', // available / unavailable / uncertain / no-response
  notes: 'À utiliser en défense',
  confirmedAt: '2024-05-31T15:00:00',
}
```

**Estimation effort :** 2-3 jours

**Impact :** IMPORTANT — Moins de joueurs absents

---

### 1.4 Alertes documents

**Description :** Système automatique d'alertes pour documents expirant ou manquants.

**Features :**
- Détection documents expirant dans 30 jours
- Alerte documents manquants (licence, assurance, médical, CNI)
- Dashboard avec liste des alertes
- Notification email à la personne
- Historique uploads documents
- % complétude par type
- Blocage joueur si docs critiques manquants

**Alertes types :**
- 🔴 URGENT : Document expiré
- 🟠 ALERTE : Expire dans <7 jours
- 🟡 ATTENTION : Expire dans 30 jours
- 🔵 INFO : Document manquant

**Estimation effort :** 1-2 jours

**Impact :** IMPORTANT — Conformité légale (RGPD, assurances)

---

## PRIORITÉ 2 : IMPORTANTES (Amélioration UX)

### 2.1 Statistiques joueurs simples

**Description :** Affichage des stats clés des joueurs (sans surcharge).

**Features :**
- Buts marqués (total saison)
- Passes décisives (total saison)
- Présence entraînement (%)
- Présence matchs (%)
- Classements dynamiques
- Affichage par équipe/club
- Export CSV

**Composants :**
- `StatCard` — Carte avec les 4 stats principales
- `PlayerStatsTable` — Tableau triage par colonne
- `StatComparison` — Comparer 2-3 joueurs

**Estimation effort :** 2-3 jours

**Impact :** IMPORTANT — Engagement joueurs

---

### 2.2 Système de covoiturage

**Description :** Organiser le covoiturage par match.

**Features :**
- Par match : sélection conducteur
- Passagers (ajout/retrait)
- Lieu départ/arrivée
- Horaires
- Coût par personne
- Notifications confirmations
- Historique trajets

**Estimation effort :** 2-3 jours

**Impact :** IMPORTANT — Facilite l'organisation

---

### 2.3 Disponibilité joueurs

**Description :** Joueurs marquent leurs périodes indisponibles.

**Features :**
- Calendrier personnel
- Marquer : En vacances / Blessé / Indisponible / Dispo
- Couleurs différentes par statut
- Visible pour coach uniquement
- Filtrer lors convocations
- Intégration calendrier

**Estimation effort :** 1-2 jours

**Impact :** IMPORTANT — Optimise convocations

---

### 2.4 Chat équipe temps réel

**Description :** Communication fluide au sein des équipes.

**Features :**
- Groupes par équipe
- Messages avec timestamps
- Mentions (@Coach @joueur)
- Partage photos rapide
- Notifications messages
- Typing indicators
- Historique (scroll)

**WebSocket ready** pour temps réel.

**Estimation effort :** 2-3 jours

**Impact :** IMPORTANT — Communication fluide

---

### 2.5 Galerie de matchs

**Description :** Archive photos/vidéos des matchs.

**Features :**
- Upload photos/vidéos par match
- Album organisé par match
- Tags joueurs dans photos
- Lightbox viewer
- Téléchargement
- Pagination/lazy load

**Estimation effort :** 2-3 jours

**Impact :** IMPORTANT — Mémorables

---

## PRIORITÉ 3 : ENHANCEMENT (Nice-to-have)

### 3.1 Système d'amis

- Ajouter joueurs en amis
- Voir leur calendrier
- Messages directs rapides

**Effort :** 1-2j

---

### 3.2 Mentions et hashtags

- @mentions dans posts/chat
- Hashtags (#Séniors, #Victoire)
- Recherche hashtags
- Trending local

**Effort :** 2-3j

---

### 3.3 Médailles et récompenses

- Meilleur buteur
- Meilleure défense
- MVP match
- Trophées virtuels
- Badges spéciaux

**Effort :** 1-2j

---

### 3.4 Gestion blessures

- Log des blessures (date, durée)
- Restrictions activité
- Calendrier de retour
- Historique médical

**Effort :** 1-2j

---

### 3.5 Classements équipes

- Victoires/défaites
- Différence de buts
- % victoires
- Tête-à-tête historique

**Effort :** 1-2j

---

## TOP 5 POUR MVP v2 (Validation)

**Order d'implémentation :**

1. **Notation joueurs** (P1) - 2-3 jours
   - Crucial pour le feedback
   - Engageant pour joueurs
   - Base pour futures features

2. **Cotisations + Stripe** (P1) - 3-4 jours
   - Viabilité du club
   - Revenue generation
   - Intégration directe

3. **Chat équipe temps réel** (P2) - 2-3 jours
   - Communication fluide
   - Cohésion équipe
   - Engagement

4. **Statistiques joueurs simples** (P2) - 2-3 jours
   - Engagement joueurs
   - Données performance
   - Compétitivité

5. **Disponibilité joueurs** (P2) - 1-2 jours
   - Optimise convocations
   - Réduction absences
   - Planification facilitée

**Total estimation :** 11-17 jours (~2-3 semaines)

---

## COMMENT IMPLÉMENTER

### Étape 1 : Lancer le Claude Code

Utilise le launcher interactif fourni. Clique sur une amélioration :
- Un artifact React se génère
- Code complet et fonctionnel
- Prêt à copier-coller

### Étape 2 : Intégrer dans ton app

```jsx
// Importer le composant
import PlayerRatingSystem from './components/PlayerRatingSystem'

// Ajouter une route
<Route path="/rate-players" element={<PlayerRatingSystem />} />

// Ou en modal dans une page existante
{showRatingModal && <PlayerRatingSystem onClose={() => setShowRatingModal(false)} />}
```

### Étape 3 : Connecter à la BDD

Remplacer le `useState` par des appels API :

```jsx
const [ratings, setRatings] = useState([])

useEffect(() => {
  fetchRatings() // Appel API
}, [])

const fetchRatings = async () => {
  const res = await fetch('/api/ratings')
  setRatings(await res.json())
}
```

### Étape 4 : Afficher sur les profils

```jsx
// ProfilePage du joueur
<div>
  <h3>Moyenne des notations</h3>
  <p>{getPlayerAverageRating(player.id)}/5</p>
  <small>({getPlayerRatingCount(player.id)} notations)</small>
</div>
```

---

## QUICK WINS (Faciles)

- Export PDF (feuille match, historique)
- Recherche globale (joueur/club/équipe)
- Pagination infinie
- Mode hors-ligne
- Email récapitulatif hebdo

---

## ROADMAP VISUELLE

```
Semaine 1 :
  ✓ Notation joueurs (2-3j)
  ✓ Cotisations Stripe (3-4j)

Semaine 2 :
  ✓ Chat équipe (2-3j)
  ✓ Disponibilité (1-2j)

Semaine 3 :
  ✓ Stats simples (2-3j)
  ✓ Polish + tests
```

---

## POUR CLAUDE CODE

```
Lance une amélioration via le launcher interactif :

1. Clique sur une amélioration (P1, P2, ou P3)
2. Un prompt se génère automatiquement
3. Claude crée un artifact React complet
4. Code prêt à utiliser immédiatement

Tous les components incluent :
- Données de test (mock)
- localStorage pour persistance
- Styles complets (Tailwind ready)
- Comments explicatifs
- Ready-to-integrate
```

