# ClubManager — Création matchs/entraînements + corrections

Ajout boutons création matchs/entraînements pour président et coach + corrections affichage.

---

## RÉSUMÉ DES CHANGEMENTS

1. ✅ Boutons "Créer un match" et "Créer un entraînement" (coach/président)
2. ✅ Modal création match (adversaire, date, lieu, domicile/extérieur, catégorie, journée, arbitre)
3. ✅ Modal création entraînement (date début, date fin, lieu, notes)
4. ✅ Affichage "Entraînement Séniors A" au lieu de juste "Entraînement"
5. ✅ Équipes : name = catégorie (un seul champ au lieu de deux)
6. ✅ Mock data enrichi avec matchs/entraînements variés

---

## POUR CLAUDE CODE

```
Implémenter CREATION_MATCHS_ENTRAINEMENTS.md :

1. Ajouter boutons création dans TeamDetailPage (onglets Matchs/Entraînements)
2. Créer CreateMatchModal complet
3. Créer CreateTrainingModal complet
4. Modifier affichage : "Entraînement {team.name}" partout
5. Simplifier équipes : name uniquement (supprimer category)
6. Enrichir mock data avec exemples variés
```

Voir document complet pour code détaillé des modals.
