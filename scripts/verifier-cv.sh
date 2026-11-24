#!/usr/bin/env bash
# Vérifie la page CV construite, en FR et en EN : accroche, missions phares,
# lien de contact, et même structure dans les deux langues (une section
# oubliée d'un côté se voit au nombre de sections).
set -uo pipefail

cd "$(dirname "$0")/.."
JOURNAL="$(mktemp)"
fail=0
trap 'rm -f "$JOURNAL"' EXIT

ok() { echo "ok   - $1"; }
ko() { echo "FAIL - $1"; fail=1; }
contient() { # contient <page> <texte> <description>
  if grep -Fq -- "$2" "$1"; then ok "$3"; else ko "$3"; fi
}

if ! npm run build > "$JOURNAL" 2>&1; then
  ko "le build a échoué"
  sed -n '1,40p' "$JOURNAL"
  exit 1
fi

FR=dist/cv/index.html
EN=dist/en/cv/index.html

for page in "$FR" "$EN"; do
  for mission in "Banque Palatine" "La Poste" "Edenred" "Bluspark"; do
    contient "$page" "data-mission=\"$mission\"" "$page : mission phare $mission"
  done
done

contient "$FR" "plus personne n" "FR : accroche"
contient "$EN" "nobody dares to touch" "EN : accroche"
contient "$FR" 'data-cv="contact" href="/contact/"' "FR : bouton vers /contact/"
contient "$EN" 'data-cv="contact" href="/en/contact/"' "EN : bouton vers /en/contact/"

sections_fr=$(grep -o '<section' "$FR" | wc -l)
sections_en=$(grep -o '<section' "$EN" | wc -l)
if [ "$sections_fr" -gt 0 ] && [ "$sections_fr" = "$sections_en" ]; then
  ok "même nombre de sections en FR et en EN ($sections_fr)"
else
  ko "sections FR ($sections_fr) et EN ($sections_en) différentes"
fi

if grep -Eqi '(freelance|indépendant)[^<]{0,80}2023|2023[^<]{0,80}(freelance|indépendant)' "$FR" "$EN"; then
  ko "freelance daté de 2023"
else
  ok "freelance non daté de 2023"
fi

exit $fail
