# 53. Épingler son environnement d'agent : modèle, plugins, consignes

**Statut :** idée, non rédigée. **Effort :** faible. **Thème :** LLM.

**Thèse.** On épingle ses dépendances de code. L'environnement d'un agent (version du modèle, plugins, skills, consignes) mérite le même traitement.

## Plan

1. Le symptôme : « ça marchait la semaine dernière ».
2. Ce qui varie sans qu'on y touche : version du modèle, mises à jour de plugins, consignes modifiées.
3. Ce qu'on peut figer : l'identifiant exact du modèle, les versions de plugins, un fichier de consignes versionné.
4. Détecter un changement : une trace du modèle et de la configuration utilisés à chaque exécution.
5. Quand mettre à jour, et comment le faire de façon contrôlée (voir 45).

## Matière

- **À vous :** votre propre configuration et un cas où quelque chose a changé sans prévenir.

## Liens

Voir D, 22 et 45.
