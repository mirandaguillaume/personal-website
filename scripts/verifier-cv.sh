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

# Un seul téléchargement, le CV LaTeX, sur les deux pages.
PDF_CV=dist/cv/guillaume-miranda-cv-fr.pdf
for page in "$FR" "$EN"; do
  contient "$page" 'data-cv="pdf" href="/cv/guillaume-miranda-cv-fr.pdf"' "$page : bouton vers le CV PDF"
  n=$(grep -o 'download' "$page" | wc -l)
  if [ "$n" = 1 ]; then ok "$page : un seul téléchargement"; else ko "$page : $n téléchargements"; fi
done
if [ -f "$PDF_CV" ]; then ok "$PDF_CV publié"; else ko "$PDF_CV absent"; fi
pages=$(pdfinfo "$PDF_CV" 2>/dev/null | awk '/^Pages/{print $2}')
if [ "${pages:-99}" -le 2 ]; then ok "$PDF_CV : $pages page(s)"; else ko "$PDF_CV : ${pages:-?} pages"; fi
if ls dist/cv/ | grep -Eq 'cv-en\.pdf|detaille|empreinte'; then ko "anciens PDF générés encore publiés"; else ok "aucun ancien PDF généré"; fi

# Une mission sans date n'affiche pas la période du poste qui la porte.
carte_palatine=$(grep -o 'data-mission="Banque Palatine".*' "$FR" | sed 's#</article>.*##')
if grep -q '2019' <<<"$carte_palatine"; then ko "Palatine : période du poste affichée"; else ok "Palatine : aucune période inventée"; fi

# Typographie anglaise : pas d'espace avant les deux-points.
if grep -Fq 'Track record :' "$EN"; then ko "EN : espace avant les deux-points"; else ok "EN : deux-points à l'anglaise"; fi

# Plus de PDF généré : modifier les données ne doit plus bloquer le build.
if grep -q "PDF du CV périmé" src/content.config.ts; then ko "contrôle de péremption encore présent"; else ok "aucun contrôle de péremption"; fi

exit $fail
