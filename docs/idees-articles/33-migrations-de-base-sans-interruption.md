# 33. Migrations de base de données sans interruption

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Un changement de schéma se déploie en plusieurs déploiements compatibles entre eux.

## Plan

1. Le problème : le code et le schéma ne changent pas atomiquement.
2. Expand, migrate, contract : ajouter, basculer, supprimer.
3. Un exemple : renommer une colonne (à vous : un cas vécu).
4. Les pièges : verrous, grosses tables. Dépend du SGBD.
5. Lien avec la livraison progressive et les feature flags.

## Matière

- **À vous :** votre expérience de gestion de base de données (mentionnée dans votre CV) et un cas réel.
- **À recouper :** le comportement des verrous selon le SGBD utilisé, que je ne connais pas.

## Liens

Voir 34.
