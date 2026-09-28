#!/usr/bin/env bash
# Vérifie qu'un article publié invalide fait échouer le build, et que le
# message nomme le fichier fautif. Les tests unitaires portent sur une fonction
# pure : seul ce test couvre le raccordement à getPublishedPosts.
set -uo pipefail

cd "$(dirname "$0")/.."
ARTICLE="src/content/blog/fr/zz-article-invalide-temporaire.md"
JOURNAL="$(mktemp)"
nettoyer() { rm -f "$ARTICLE" "$JOURNAL"; }
trap nettoyer EXIT

cat > "$ARTICLE" <<'MD'
---
title: 'Article volontairement invalide'
description: 'Doit faire échouer le build.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'article-invalide-temporaire'
---

Un [[wikilink Obsidian]] ne doit jamais atteindre la production.
MD

if npm run build > "$JOURNAL" 2>&1; then
  echo "FAIL - le build a réussi alors qu'un article publié est invalide"
  exit 1
fi

if ! grep -q "zz-article-invalide-temporaire" "$JOURNAL"; then
  echo "FAIL - le build a échoué mais son message ne nomme pas le fichier fautif"
  sed -n '1,40p' "$JOURNAL"
  exit 1
fi

echo "ok   - le build refuse un article invalide et nomme le fichier"
