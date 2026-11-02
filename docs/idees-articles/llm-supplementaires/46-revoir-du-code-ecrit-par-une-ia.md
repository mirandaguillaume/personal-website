# 46. Revoir du code écrit par une IA : ce qui change dans la review

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Relire du code écrit par un agent demande de déplacer son attention, pas seulement de lire plus vite.

## Plan

1. Le réflexe à éviter : « ça compile, ça passe, c'est bon ».
2. Où regarder : les tests ajoutés (ils passent, mais détectent-ils quelque chose ?), les cas limites, ce que le diff ne montre pas.
3. Le mutation testing comme filet : 40,21 % de mutation score moyen pour les tests générés sur ULT (vérifié, arXiv:2508.00408).
4. Une checklist de revue à garder.
5. Ce qu'on peut automatiser, et ce qui doit rester humain.

## Matière

- **Vérifiée :** le chiffre ULT.
- **À vous :** votre propre checklist et des exemples de bugs que la review a attrapés.

## Liens

Voir E, 47 et 59.
