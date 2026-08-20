---
title: 'Mutation testing : vos tests testent-ils vraiment quelque chose ?'
description: 'Le taux de couverture ne dit rien sur la qualité de vos tests. Le mutation testing, si — et ça peut vous éviter un vrai incident en prod.'
pubDate: 2026-08-20
tags: ['testing', 'php', 'mutation-testing']
---

## Le scénario du quotidien

Vous poussez votre PR. La pipeline râle :

```
✗ Coverage decreased: 78% → 74%
Minimum required: 80%
```

Vous écrivez un test, vite. Le vert revient :

```
✓ Tests passed
✓ Coverage: 81%
✓ Pipeline passed
```

Mergé. Tout le monde est content.

Sauf que rien dans ce processus n'a vérifié si ce test détecte réellement un bug. Il a juste exécuté des lignes de code. Le coverage mesure la **quantité** de code exécuté par vos tests, pas la **qualité** de ce qu'ils vérifient.

Et depuis qu'on demande à un assistant IA de "générer un test" pour faire remonter le chiffre, le problème s'est aggravé : selon une étude de 2025 ([Huang et al., arXiv:2508.00408](https://arxiv.org/abs/2508.00408)), sur des fonctions réelles suffisamment complexes pour éviter la contamination des benchmarks, les tests générés par LLM n'atteignent en moyenne qu'un score de mutation de 40 %. Ils passent, ils comptent dans le coverage, et ils ratent la majorité des bugs qu'un test bien conçu aurait attrapés.

## L'histoire qui fait mal

Un incident réel, chez un ancien client : les montants affichés sur les factures ne correspondaient plus aux prélèvements. L'équipe finance remonte des écarts de quelques centimes par ligne — multipliés par 50 000 factures par mois, ça fait 8 000 € de delta.

La cause : un "petit refacto" avait supprimé un arrondi.

```php
// Avant
return round($price * $quantity * (1 + $taxRate), 2);

// Après
return $price * $quantity * (1 + $taxRate);
```

Le test associé existait, et il passait toujours :

```php
public function testTotalWithTax(): void
{
    // 10.00 * 5 * 1.20 = 60.0 — avec ou sans round()
    $this->assertSame(60.0, $this->calc->total(10.00, 5, 0.20));
}
```

Le problème : des valeurs rondes. Avec `10.00 * 5 * 1.20`, l'arrondi ne change strictement rien au résultat, donc le test ne peut pas voir sa disparition. Avec des valeurs réelles — `19.99 × 3 × 1.055 = 63.268…` — le centime manquant aurait sauté aux yeux. Un test solide en apparence, une assertion exacte, mais des données de test trop propres pour révéler quoi que ce soit.

## Le principe du mutation testing

L'idée : et si on sabotait volontairement le code, une micro-modification à la fois, pour voir si les tests s'en rendent compte ?

C'est exactement ce que fait un outil de mutation testing (j'utilise [Infection](https://infection.github.io) en PHP) :

1. Il prend votre code et génère des **mutants** — des variantes avec une modification minuscule (`+` devient `-`, `&&` devient `||`, une condition `>=` devient `>`...)
2. Il relance votre suite de tests contre chaque mutant
3. Si un test échoue → le mutant est **killed**. Vos tests ont fait leur travail.
4. Si tous les tests passent malgré la modification → le mutant **escaped**. Vos tests n'ont rien vu.

Le **MSI** (Mutation Score Indicator) — le pourcentage de mutants tués — est le vrai bulletin de notes de votre suite de tests. Pas le coverage.

## Tous les mutants ne se valent pas

Certains sont évidents : `true` → `false`, `+` → `-`. Utiles pour comprendre le concept, mais rarement ceux qui vous surprennent.

Les intéressants sont plus discrets : un `&&` qui devient un `||`, un `throw` qui disparaît silencieusement. Sans outil, ils passent inaperçus dans une review. C'est exactement là que le mutation testing apporte de la valeur — et c'est le genre de mutant qui, une fois détecté, pousse à corriger un test réellement insuffisant.

Deux pièges à connaître aussi :

- **Les mutants équivalents** : le code a changé, mais le comportement observable est identique — impossible à tuer, quel que soit le test.
- **Les mutants triviaux** : du bruit qui gonfle les chiffres sans apporter de valeur.

## En pratique, dans une CI

Ne lancez pas un outil de mutation testing sur tout le projet — le coût en temps d'exécution grimpe vite (chaque mutant, c'est toute la suite de tests relancée), et certains mutants cassent le flux et provoquent des timeouts.

La bonne approche : ne cibler que ce qui a changé dans la PR.

```bash
vendor/bin/infection --git-diff-filter=AM --min-msi=70
```

Rapide, ciblé, et ça donne une vraie garantie sur le code qui vient d'être modifié plutôt qu'un score global illisible.

**Coverage** répond à "quelles lignes sont exécutées". **MSI** répond à "est-ce que mes tests détectent un vrai changement de comportement". Ce sont deux métriques différentes, et seule la seconde vous protège d'un incident comme celui du dessus.

---

_J'ai donné une conférence plus complète sur ce sujet (AFUP Paris / Dayuse, juin 2026), thème X-Men à l'appui — [les slides sont en ligne](https://mirandaguillaume.github.io/mutation-testing/) si le sujet vous intéresse._
