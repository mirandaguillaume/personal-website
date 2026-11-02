# C. Un runner PHPUnit en Rust

**Statut :** idée, non rédigée. **Effort :** élevé.

**Thèse.** À définir. La seule description connue : « Runner PHPUnit parallélisé écrit en Rust : pool de forks, work-stealing, couverture statique, plus de 2× plus rapide, compatible drop-in » (`src/data/projects.json`).

## Plan

1. Le point de douleur de départ : une suite lente, où et pourquoi.
2. Pourquoi Rust plutôt que d'optimiser en PHP.
3. Pool de forks et work-stealing : un schéma, un exemple.
4. La couverture statique : ce qu'elle remplace et ses limites.
5. Les benchmarks et la compatibilité « drop-in » : où ça casse.

## Matière

- **À vous :** tous les chiffres, le contexte, les décisions de conception.
- **À recouper :** le fonctionnement interne de PHPUnit que le projet contourne.

## Liens

Voir E (le mutation testing relance beaucoup les tests, à recouper) et P (la parallélisation révèle l'état partagé caché).
