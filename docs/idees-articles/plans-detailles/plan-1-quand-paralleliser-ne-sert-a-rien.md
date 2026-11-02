# Plan détaillé : quand paralléliser ne sert à rien

**Idée d'origine :** « Mon runner en Rust est plus lent sur 2 suites sur 10 ».
**Statut :** plan détaillé, article non rédigé. **Longueur visée :** 1 200 à 1 600 mots, trois graphiques.

## Titres possibles

- FR : « Quand paralléliser ne sert à rien : le bilan honnête de mon runner PHPUnit en Rust »
- EN : "When parallelizing doesn't pay: an honest look at my Rust PHPUnit runner"
- Frontmatter envisagé : tags `['php', 'phpunit', 'rust', 'performance']`, `translationKey: 'parallelisation-bilan-honnete'`.

## Thèse

Un gain de parallélisation est une propriété de la **suite de tests** (durée moyenne d'un test, nombre de classes, état partagé), pas une propriété du runner. On peut donc le prédire avant de lancer quoi que ce soit, et Proust donne l'exemple en publiant ses propres cas perdants.

## Ce qui rend l'article original

- Il ne vend pas un outil : il expose deux défaites chiffrées (0,58× et 0,42×) et en tire une règle de décision.
- Il s'appuie sur des mesures reproductibles, avec un script de benchmark versionné dans le dépôt (`bench/`, table générée par `bench-daily.yml`).
- Il corrige un écart entre une description marketing (« plus de 2× plus rapide ») et le tableau réel.

## Faits vérifiés (source : `BENCHMARKS.md` et `COMPATIBILITY.md`, dépôt `phpunit-rust`, v0.9.0)

Conditions : image Docker PHP 8.4, 4 workers, médiane de 3 exécutions, « vanilla » = PHPUnit en un seul processus, compte de tests identique sur les 10 suites.

| Suite          | Tests  | vanilla   | Proust    | Accélération |
| -------------- | ------ | --------- | --------- | ------------ |
| brick-math     | 20 392 | 3 022 ms  | 1 042 ms  | 2,9×         |
| monolog        | 1 154  | 4 639 ms  | 1 734 ms  | 2,7×         |
| rector         | 5 239  | 25 444 ms | 10 847 ms | 2,3×         |
| carbon         | 6 145  | 34 646 ms | 20 021 ms | 1,7×         |
| commonmark     | 4 168  | 1 367 ms  | 902 ms    | 1,5×         |
| faker          | 2 462  | 1 465 ms  | 1 199 ms  | 1,2×         |
| php-parser     | 1 880  | 682 ms    | 558 ms    | 1,2×         |
| doctrine-orm   | 3 480  | 6 657 ms  | 5 823 ms  | 1,1×         |
| guzzle-psr7    | 1 250  | 307 ms    | 532 ms    | 0,58×        |
| phpunit-itself | 4 153  | 1 804 ms  | 4 261 ms  | 0,42×        |

Explications de votre propre doc :

- **Carbon** passe de 1 à 8 workers avec un gain de 5,4× (68 % d'efficacité parallèle), soit 3,7× par rapport à vanilla à 8 workers.
- **faker et php-parser** plafonnent entre 2 et 4 workers, puis se dégradent : le coût de fork et de distribution par classe domine quand les tests sont courts.
- **doctrine-orm** est à égalité parce que ses tests fonctionnels échouent immédiatement dans `setUp` (pas de base configurée) : moins d'1 ms par test, rien à répartir.
- **guzzle-psr7** : le pool démarre en ~50 ms contre ~10 ms pour vanilla. « Pour ces suites, lancez vanilla ».
- Règles de conception : 1 worker par 16 cas (32 pour les suites fonctionnelles) ; les méthodes avec au moins 15 lignes de data provider sont découpées en jusqu'à 4 plans ; les méthodes simples restent dans un plan de classe pour ne pas multiplier le coût de `setUpBeforeClass`.

## Structure

### 0. Ouverture (sans titre)

Le chiffre qui pique : sur la propre suite de PHPUnit, mon runner met 4 261 ms contre 1 804 ms. **À vous :** ce que vous avez ressenti en le voyant, et pourquoi vous l'avez publié quand même.

### 1. Le tableau, en entier

Présenter les 10 suites telles quelles, y compris les deux défaites. Préciser les conditions de mesure et le fait que les comptes de tests sont identiques.
_Graphique 1 :_ barres d'accélération par suite, ligne à 1×.

### 2. Le modèle de coût, en trois lignes

Coût fixe de démarrage, coût par classe, coût de duplication des fixtures. Montrer que le premier explique guzzle-psr7, le deuxième faker et php-parser, le troisième justifie la règle de découpage des data providers.

### 3. Quatre familles de suites

Celles qui passent à l'échelle (carbon, brick-math, rector, monolog), celles qui plafonnent (faker, php-parser), celles qui sont trop courtes (guzzle-psr7), celles qui n'ont rien à répartir (doctrine-orm sans base).
_Graphique 2 :_ courbe d'accélération de 1 à 8 workers pour carbon et pour faker. **À extraire :** les valeurs 1w / 2w / 4w / 8w. La doc évoque « 1→8 workers » pour carbon sans que j'aie relevé le tableau correspondant : à chercher dans `BENCHMARKS.md`, sinon à mesurer.

### 4. Une question que la doc ne résout pas : où passent les 225 ms de guzzle-psr7 ?

Arithmétique à partir de vos chiffres : 532 − 307 = **225 ms** d'écart, alors que l'écart de démarrage documenté n'est que d'environ 40 ms (~50 contre ~10). Il reste donc environ 185 ms non expliqués par le démarrage seul. Pistes à mesurer, pas à affirmer : découverte des tests, passe PHP d'énumération des providers avant le fork, fichier temporaire de la class map, rapport final.
**À produire :** un découpage par phase, mesuré. C'est le cœur original de l'article.

### 5. Le cas phpunit-itself (0,42×)

Contexte documenté : comparé au testsuite `unit` de vanilla, ses ~1 000 fichiers `.phpt` sont hors périmètre, et des tests d'isolation de processus avaient provoqué des blocages. Hypothèse à tester : les classes qui touchent des API globales (gestionnaires d'erreurs, `ini_set`, etc.) sont détectées syntaxiquement et forcées dans un fork neuf par lot, ce qui multiplie les forks.
**Expérience :** relancer avec `PROUST_NO_ISOLATION=1` (documenté comme outil de diagnostic uniquement) et comparer. Compter les forks.

### 6. Une règle de décision

Construire un petit prédicteur à partir de trois variables simples (durée moyenne par test, nombre de classes, durée totale vanilla) et le valider sur les 10 suites, en laissant chaque suite de côté à tour de rôle. Livrer la règle sous forme d'un arbre de décision de quelques lignes.
**À produire :** les valeurs de durée moyenne par test, calculables à partir du tableau (durée vanilla ÷ nombre de tests).

### 7. Ce que ça change dans l'outil

Faut-il que Proust bascule automatiquement en mode séquentiel quand la suite prédite est inférieure à un seuil ? **À vous :** votre décision de conception, et pourquoi.

## Ce qu'il faut vérifier avant de publier

- Refaire la mesure sur la version courante : le tableau est généré automatiquement et peut avoir changé depuis juin 2026.
- Ne présenter que des mesures faites dans les mêmes conditions (même machine, même image Docker).
- Aligner la description du projet sur le site : « plus de 2× plus rapide » n'est vrai que pour 3 suites sur 10, et « compatible drop-in » est nuancé par votre propre `COMPATIBILITY.md` (shim `TestExecutor`, fichiers `.phpt` invisibles).
- Le projet s'appelle **Proust** dans le dépôt et « PHPUnit Rust » sur le site : choisir un nom.

## Matière à produire (par ordre de coût)

1. Retrouver ou mesurer les valeurs 1w / 2w / 4w / 8w (gratuit si elles sont dans `BENCHMARKS.md`).
2. Calculer la durée moyenne par test pour les 10 suites (gratuit).
3. Profiler guzzle-psr7 par phase (moyen).
4. Relancer phpunit-itself avec et sans `PROUST_NO_ISOLATION=1` (moyen).
