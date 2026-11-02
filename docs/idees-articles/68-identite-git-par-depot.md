# 68. Mes commits portaient la mauvaise adresse : l'identité Git par dépôt

**Statut :** idée, non rédigée. **Effort :** faible.

**Thèse.** Une identité Git globale suffit tant qu'on n'a qu'un seul rôle. Un freelance qui mélange projets personnels et missions en a besoin de plusieurs.

## Fait vérifié (README du dépôt)

- L'identité Git de ce dépôt est **locale** et vit dans `.git/config`, qui n'est pas versionné : un nouveau clone repart sur l'identité globale de la machine.
- Après `git clone`, avant tout commit, il faut régler `user.name` et `user.email` avec `git config --local`, et vérifier avec `git config --local user.email`.
- Sans cela, les commits portent l'identité globale, « qui peut être une adresse professionnelle ».

## Plan

1. Le problème : un commit public signé d'une adresse qui ne devait pas l'être.
2. Pourquoi un clone ne retient rien : `.git/config` n'est pas versionné.
3. Le réflexe : régler l'identité locale avant le premier commit et la vérifier.
4. Aller plus loin : une configuration conditionnelle par répertoire, qui évite d'y penser (à recouper dans la documentation Git).
5. Ce qu'on fait quand le mal est fait : réécrire l'historique, avec ses limites une fois publié.

## Matière

- **À vous :** si c'est arrivé, et les conséquences.
- **À recouper :** la documentation Git (`includeIf`, réécriture d'historique) avant d'écrire les commandes.

## Remarque

Ne pas publier d'adresse e-mail dans l'article. Le README du dépôt en contient une, à vous de décider si elle doit y rester.
