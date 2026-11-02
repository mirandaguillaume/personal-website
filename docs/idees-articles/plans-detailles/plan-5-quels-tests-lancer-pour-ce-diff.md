# Plan détaillé : quels tests lancer pour ce diff ?

**Idée d'origine :** « Quels tests lancer pour ce diff ? » (sens de l'approximation).
**Statut :** plan détaillé, article non rédigé. **Longueur visée :** 1 400 à 1 800 mots, un schéma, une matrice de résultats.

## Titres possibles

- FR : « Quels tests lancer pour ce diff ? Deux analyses statiques, deux façons de se tromper »
- EN: "Which tests should run for this diff? Two static analyses, two ways to be wrong"
- Frontmatter envisagé : tags `['php', 'testing', 'rust', 'mutation-testing']`, `translationKey: 'selection-tests-sens-erreur'`.

## Thèse

Une analyse statique se trompe toujours dans un sens, et l'usage sûr dépend de ce sens. Pour **sélectionner** des tests, l'erreur dangereuse est le faux négatif (un test impacté qu'on n'a pas lancé). Pour **valider un seuil de couverture**, l'erreur dangereuse est le faux positif (une ligne comptée comme couverte sans l'avoir été). Proust embarque deux analyses statiques aux erreurs différentes, et sa doc a l'honnêteté de le dire.

## Ce qui rend l'article original

- Il part d'une décision de conception réelle, pas d'un sujet attendu.
- Il propose une **mesure de rappel de `--dirty` par injection de fautes**, donc par mutation : c'est votre domaine, et personne d'autre ne l'a publiée pour ce runner.
- Il montre qu'une doc peut contenir une nuance que le slogan perd : « borne haute optimiste » et « aveugle au dispatch dynamique » dans le même paragraphe.

## Faits vérifiés (source : `COMPATIBILITY.md` et `crates/runner/src/main.rs`)

**`--dirty` (sélection de tests)**

- Il retient les tests impactés par les changements **non commités** (`git_changed_files`). S'il n'y en a aucun, ou si ce n'est pas un dépôt Git, il affiche « nothing to run » et vide la liste des tests.
- Le mécanisme : les fichiers modifiés sont traduits en FQCN via un index classe→fichier. Un test est retenu si son fichier a changé, **ou** si sa classe est un FQCN modifié, **ou** si son « fingerprint » (l'ensemble des FQCN qu'il référence) contient un FQCN modifié.
- La fonction `is_impacted` est pure, et le code la décrit comme « le cœur de `--dirty` » :

```rust
changed_files.contains(file)
    || changed_fqcns.contains(class)
    || fingerprint.iter().any(|f| changed_fqcns.contains(f))
```

- Le commentaire le présente comme « graph-based » par opposition au `--dirty` de Pest, « file-only » (affirmation sur Pest à vérifier dans sa doc avant de la reprendre).
- Limite documentée : avec `--dirty`, la découverte passe par un chemin « full-parse » qui **ne résout pas les classes de base du vendor**. Sans cette résolution, « un test qui étend une base du vendor perd silencieusement toutes les méthodes que la base définit » (« a parity undercount »).

**Couverture statique (rapports)**

- Elle est dérivée par le crate `analyzer` à partir de l'AST de `mago` : accessibilité dans le graphe d'appels et attribution par test, sans PCOV ni Xdebug.
- La doc dit : c'est une « **optimistic upper bound** » (une ligne atteignable mais non exécutée, comme une branche non prise, est comptée) **et** elle est « blind to fully dynamic dispatch » (`$obj->$method()`, `call_user_func` avec un nom calculé). Conclusion de la doc : à utiliser pour des rapports, **pas** pour un seuil strict.
- La couverture à l'exécution est exacte : elle pilote `php-code-coverage` de PHPUnit dans chaque worker et fusionne avec `CodeCoverage::merge()`. Sa sortie est « identique à `phpunit --coverage-*` par construction », vérifiée ligne à ligne contre PHPUnit + PCOV.

## Observation à creuser (mon analyse, pas un fait de la doc)

Les deux nuances de la couverture statique se contredisent en apparence : une borne **haute** compte trop de lignes, un angle mort sur le dispatch dynamique en **manque**. Ce n'est donc strictement ni une borne haute ni une borne basse : l'erreur va dans les deux sens. C'est un point d'article, à formuler avec prudence.

## Structure

### 0. Ouverture (sans titre)

Un diff d'une ligne, une CI de plusieurs minutes (**à vous :** un cas vécu, avec le chiffre).

### 1. Trois façons de choisir les tests

Par fichier de test modifié, par références entre classes, par couverture mesurée. Une ligne chacune, avec le risque de chacune.

### 2. `--dirty` lu dans le code

Montrer les six lignes de `is_impacted`, expliquer l'index classe→fichier, le fingerprint, et le cas « nothing to run ».
_Schéma 1 :_ fichier modifié → FQCN → tests dont le fingerprint le contient.

### 3. Où `--dirty` peut se tromper

- **Faux négatifs :** une dépendance qui n'apparaît pas dans le fingerprint, par exemple un service résolu par un conteneur d'injection, un nom de classe construit dans une chaîne, une configuration.
- **Faux négatifs documentés :** les bases du vendor non résolues sous `--dirty`.
- **Faux positifs :** sur-sélection, sans danger, seulement du temps.
  **À vérifier dans le code :** si le fingerprint est calculé avec une fermeture transitive (une classe référencée par une classe référencée). La fonction `is_impacted` compare directement, un seul saut. L'endroit où le fingerprint est construit n'est pas encore lu.

### 4. La couverture statique, autre analyse, autre erreur

Présenter la citation de la doc et la lecture « dans les deux sens ». Expliquer pourquoi la couverture à l'exécution reste la seule utilisable pour un seuil.

### 5. L'expérience : mesurer le rappel de `--dirty` par injection de fautes

**Idée :** un mutant est une faute injectée. Les tests qui « tuent » un mutant d'un fichier F sont, par définition, ceux qu'un changement de F devrait déclencher.
**Protocole :**

1. Choisir un projet PHP de taille moyenne avec une suite verte (une des 10 suites du benchmark convient).
2. Pour un échantillon de mutants dans un fichier source F, lancer la suite complète et noter les tests qui échouent (vérité terrain).
3. Appliquer le mutant (changement non commité) et lancer `proust --dirty`, puis noter les tests sélectionnés.
4. Calculer le **rappel** = (tests qui échouent ∩ tests sélectionnés) ÷ tests qui échouent, et la **précision** (part de tests sélectionnés qui échouent réellement).
5. Répéter sur des cas construits pour casser l'analyse : référence directe, deux sauts, injection par conteneur, nom de classe dynamique, base du vendor.
   _Livrable :_ une matrice cas × (rappel, précision), et les cas où `--dirty` rate un test.
   **À produire :** tout ceci. Je peux préparer et lancer l'expérience si l'environnement (PHP, Rust, un projet de test) est disponible.

### 6. Que faire quand l'analyse rate

Règle simple à défendre : `--dirty` pour la boucle locale, la suite complète en CI sur la branche principale. Question de conception à poser : en CI, après un commit, il n'y a plus de changement non commité. Que fait `--dirty` ? Si la réponse est « nothing to run », un build **vert sans aucun test** est un risque réel. À confirmer dans `git_changed_files`, que je n'ai pas lu.
Pistes : un code de sortie explicite, ou un mode « diff contre la branche de base ».

### 7. Conclusion

Documenter le sens de l'erreur est une décision de conception, au même titre que l'algorithme. Renvoi vers l'article sur le mutation testing.

## À vérifier avant de publier

- Où est construit le `fingerprint` et s'il est transitif.
- Ce que fait `git_changed_files` (changements non commités uniquement, ou aussi un diff contre une base).
- Le comportement de `--dirty` de Pest, avant de le comparer.
- Que la mesure de rappel porte sur la version courante de Proust.

## Piste connexe (non explorée)

Le crate `analyzer` contient aussi des modules `mutate`, `reduce` (avec un fichier `egraph.rs`), `concrete`, `opacity`, `boundary` et `complexity`, et l'historique montre plus de 130 PR de mutateurs. Rien n'a été lu au-delà des noms de fichiers. Cela pourrait donner un article à part entière sur la détection de mutants équivalents, **à ne pas affirmer avant lecture du code**.
