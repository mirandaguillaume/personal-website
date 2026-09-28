#!/usr/bin/env bash
# Vérifie qu'un article publié invalide fait échouer le build, et que le message
# nomme le fichier fautif. Les tests unitaires portent sur une fonction pure :
# seul ce test couvre le raccordement à getPublishedPosts, et il est le seul à
# exercer le niveau Zod (contraintes de frontmatter).
set -uo pipefail

cd "$(dirname "$0")/.."
ARTICLE="src/content/blog/fr/zz-article-invalide-temporaire.md"
JOURNAL="$(mktemp)"
fail=0
nettoyer() { rm -f "$ARTICLE" "$JOURNAL"; }
trap nettoyer EXIT

# refuse <description> <motif attendu dans le journal> <<< contenu de l'article
refuse() {
  local desc="$1" motif="$2"
  cat > "$ARTICLE"
  if npm run build > "$JOURNAL" 2>&1; then
    echo "FAIL - $desc : le build a réussi"
    fail=1
    return
  fi
  if ! grep -q "zz-article-invalide-temporaire" "$JOURNAL"; then
    echo "FAIL - $desc : le message ne nomme pas le fichier fautif"
    fail=1
    return
  fi
  if ! grep -qi "$motif" "$JOURNAL"; then
    echo "FAIL - $desc : le message ne mentionne pas « $motif »"
    sed -n '1,40p' "$JOURNAL"
    fail=1
    return
  fi
  echo "ok   - $desc"
}

refuse "corps : un wikilink Obsidian est refusé" "wikilink" <<'MD'
---
title: 'Article volontairement invalide'
description: 'Doit faire échouer le build.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'article-invalide-temporaire'
---

Un [[wikilink Obsidian]] ne doit jamais atteindre la production.
MD

refuse "frontmatter : un tag hors kebab est refusé" "kebab" <<'MD'
---
title: 'Article volontairement invalide'
description: 'Doit faire échouer le build.'
pubDate: 2026-01-01
tags: ['Testing Majuscule']
translationKey: 'article-invalide-temporaire'
---

Un corps parfaitement valide.
MD

refuse "frontmatter : un titre fait d'espaces est refusé" "title" <<'MD'
---
title: '   '
description: 'Doit faire échouer le build.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'article-invalide-temporaire'
---

Un corps parfaitement valide.
MD

refuse "frontmatter : une pubDate vide est refusée" "pubDate" <<'MD'
---
title: 'Article volontairement invalide'
description: 'Doit faire échouer le build.'
pubDate:
tags: ['testing']
translationKey: 'article-invalide-temporaire'
---

Un corps parfaitement valide.
MD

exit $fail
