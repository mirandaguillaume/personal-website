# 55. Citer ses sources : empêcher un LLM d'inventer une référence

**Statut :** idée, non rédigée. **Effort :** moyen. **Thème :** LLM.

**Thèse.** Une référence plausible n'est pas une référence vraie. La seule défense fiable est de la vérifier par du code.

## Plan

1. Le risque : un lien ou un chiffre qui a l'air juste et qui est faux.
2. Un exemple vécu : un chiffre repris d'une source secondaire (« 34 % de surcoût ») alors que la source primaire donne autre chose. Voir F.
3. La vérification mécanique : l'URL répond-elle, la citation exacte figure-t-elle dans la page, le chiffre y est-il ?
4. Faire de cette vérification une étape d'un workflow, avec un critère de sortie.
5. Ce qu'on ne peut pas automatiser : juger si la source est la bonne.

## Matière

- **Vérifiée en session :** l'écart entre source secondaire et primaire sur le surcoût du déterminisme.
- **À produire :** un petit script qui vérifie qu'une citation existe dans la page citée.

## Liens

Voir F et 20.
