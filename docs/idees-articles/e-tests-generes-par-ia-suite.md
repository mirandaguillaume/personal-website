# E. Tests générés par IA : la suite du mutation testing

**Statut :** idée, non rédigée. **Effort :** élevé.

**Thèse.** « Ça passe » ne dit rien, et on peut le mesurer sur son propre code.

## Plan

1. Rappel : 40,21 % de mutation score moyen sur ULT.
2. La nuance : 49,69 % sur TestEval et 50,80 % sur PLT, soit un écart moins spectaculaire qu'il n'y paraît.
3. Le protocole : générer des tests par IA sur un vrai module, passer Infection, comparer au coverage.
4. Les mutants survivants : ce que l'IA ne teste pas.
5. Lien possible avec PHPUnit Rust (le mutation testing relance beaucoup les tests), à recouper.

## Chiffres recoupés (source primaire)

Huang et al., [arXiv:2508.00408](https://arxiv.org/abs/2508.00408), 1er août 2025, résumé : sur ULT (3 909 tâches de fonctions Python réelles), les tests générés par LLM atteignent en moyenne 41,32 % (précision), 45,10 % (statement coverage), 30,22 % (branch coverage) et 40,21 % (mutation score). Pour comparaison, TestEval : 91,79 %, 92,18 %, 82,04 %, 49,69 %. PLT : 47,07 %, 55,13 %, 40,07 %, 50,80 %.

## Matière

- **À vous :** l'expérience elle-même. Sans mesure propre, l'article n'apporte rien de neuf.

## Liens

Suite de l'article « Mutation testing : vos tests testent-ils vraiment quelque chose ? ». Voir I (mutation testing sur la validation du blog) et C.
