#!/usr/bin/env bash
# Vérifie que le build accepte un article tel qu'Enveloppe le dépose depuis le
# vault (propriétés slug, lang et share en plus), et qu'il refuse un article
# rangé hors de fr/ et en/ : aucune collection ne le chargerait, la PR
# passerait au vert sans rien publier.
set -uo pipefail

cd "$(dirname "$0")/.."
NOM="zz-essai-enveloppe"
ACCEPTE="src/content/blog/fr/$NOM.md"
HORS_LANGUE_DIR="src/content/blog/FR"
HORS_LANGUE="$HORS_LANGUE_DIR/$NOM.md"
JOURNAL="$(mktemp)"
fail=0
nettoyer() { rm -f "$ACCEPTE" "$HORS_LANGUE" "$JOURNAL"; rmdir "$HORS_LANGUE_DIR" 2>/dev/null || true; }
trap nettoyer EXIT

article() { # article <lang>
  cat <<MD
---
title: 'Essai Enveloppe'
description: 'Article temporaire déposé comme le ferait Enveloppe.'
pubDate: 2026-01-01
tags: ['testing']
translationKey: 'essai-enveloppe'
slug: $NOM
lang: $1
share: true
---

Un corps parfaitement valide.
MD
}

# 1. Le frontmatter d'Enveloppe est accepté, l'URL suit le slug (= nom de fichier)
article fr > "$ACCEPTE"
if ! npm run build > "$JOURNAL" 2>&1; then
  echo "FAIL - accepte : le build a échoué"
  sed -n '1,40p' "$JOURNAL"
  fail=1
elif [ ! -f "dist/blog/$NOM/index.html" ]; then
  echo "FAIL - accepte : dist/blog/$NOM/index.html absent"
  fail=1
elif grep -Eq 'share: true|lang: fr' "dist/blog/$NOM/index.html"; then
  echo "FAIL - accepte : des propriétés du vault apparaissent dans la page"
  fail=1
else
  echo "ok   - accepte : slug, lang et share ne gênent pas le build"
fi
rm -f "$ACCEPTE"

# 2. Un article hors de fr/ et en/ fait échouer le build, en nommant le fichier
mkdir -p "$HORS_LANGUE_DIR"
article FR > "$HORS_LANGUE"
if npm run build > "$JOURNAL" 2>&1; then
  echo "FAIL - refuse : le build a réussi"
  fail=1
elif ! grep -q "$NOM" "$JOURNAL" || ! grep -q "hors de fr/ et en/" "$JOURNAL"; then
  echo "FAIL - refuse : le message ne nomme pas le fichier ou la règle"
  sed -n '1,40p' "$JOURNAL"
  fail=1
else
  echo "ok   - refuse : un article hors de fr/ et en/ casse le build"
fi

exit $fail
