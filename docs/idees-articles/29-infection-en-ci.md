# 29. Infection en CI : un MSI minimal sur le diff seulement

**Statut :** idée, non rédigée. **Effort :** moyen.

**Thèse.** Un MSI global est illisible, un MSI sur le diff est actionnable.

## Plan

1. Le point de départ : l'article sur le mutation testing se termine sur `vendor/bin/infection --git-diff-filter=AM --min-msi=70` (vérifié).
2. Choisir un seuil : commencer bas, puis le relever.
3. Le temps de CI et la parallélisation (lien avec C).
4. Que faire d'un mutant survivant en revue de code.
5. Les pièges : mutants équivalents (voir 30), code non couvert.

## Matière

- **À vous :** votre expérience en CI et vos seuils réels.
- **À recouper :** les options d'Infection (`--git-diff-filter`, `--min-msi`, `--min-covered-msi`) dans sa documentation officielle.

## Liens

Suite directe de l'article sur le mutation testing. Voir 30, C, I.
