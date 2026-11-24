#!/usr/bin/env bash
# Vérifie la page CV construite, en FR et en EN : accroche, missions phares,
# lien de contact, et même structure dans les deux langues (une section
# oubliée d'un côté se voit au nombre de sections).
set -uo pipefail

cd "$(dirname "$0")/.."
JOURNAL="$(mktemp)"
OFFRES=src/data/offers.json
SAUVEGARDE="$(mktemp)"
cp "$OFFRES" "$SAUVEGARDE"
fail=0
trap 'cp "$SAUVEGARDE" "$OFFRES"; rm -f "$JOURNAL" "$SAUVEGARDE"' EXIT

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

contient "$FR" 'data-cv="pdf-detaille" href="/cv/guillaume-miranda-cv-detaille-fr.pdf"' "FR : lien vers le CV détaillé"
contient "$EN" 'data-cv="pdf-detaille" href="/cv/guillaume-miranda-cv-detaille-fr.pdf"' "EN : lien vers le CV détaillé"

for pdf in dist/cv/guillaume-miranda-cv-fr.pdf dist/cv/guillaume-miranda-cv-en.pdf dist/cv/guillaume-miranda-cv-detaille-fr.pdf; do
  if [ -f "$pdf" ]; then ok "$pdf publié"; else ko "$pdf absent"; fi
done

# PDF : pas de lien vers le serveur d'aperçu, texte extractible (ATS,
# recherche), deux pages au plus.
for pdf in dist/cv/guillaume-miranda-cv-fr.pdf dist/cv/guillaume-miranda-cv-en.pdf; do
  if grep -aqE '127\.0\.0\.1|localhost' "$pdf"; then ko "$pdf : lien vers le serveur local"; else ok "$pdf : aucun lien local"; fi
done
texte_fr=$(pdftotext dist/cv/guillaume-miranda-cv-fr.pdf - 2>/dev/null)
texte_en=$(pdftotext dist/cv/guillaume-miranda-cv-en.pdf - 2>/dev/null)
for attendu in "Missions phares" "La Poste" "mirandaguillaume.github.io"; do
  if grep -Fq "$attendu" <<<"$texte_fr"; then ok "PDF FR : « $attendu » extractible"; else ko "PDF FR : « $attendu » introuvable au texte"; fi
done
if grep -Fq "Key assignments" <<<"$texte_en"; then ok "PDF EN : titres extractibles"; else ko "PDF EN : titres illisibles au texte"; fi
for pdf in dist/cv/*.pdf; do
  pages=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}')
  if [ "${pages:-99}" -le 2 ]; then ok "$pdf : $pages page(s)"; else ko "$pdf : ${pages:-?} pages"; fi
done

# Une mission sans date n'affiche pas la période du poste qui la porte.
carte_palatine=$(grep -o 'data-mission="Banque Palatine".*' "$FR" | sed 's#</article>.*##')
if grep -q '2019' <<<"$carte_palatine"; then ko "Palatine : période du poste affichée"; else ok "Palatine : aucune période inventée"; fi

# Typographie anglaise : pas d'espace avant les deux-points.
if grep -Fq 'Track record :' "$EN"; then ko "EN : espace avant les deux-points"; else ok "EN : deux-points à l'anglaise"; fi

# Une donnée modifiée sans régénérer les PDF doit casser le build.
printf ' ' >> "$OFFRES"
if npm run build > "$JOURNAL" 2>&1; then
  ko "PDF périmé : le build a réussi"
elif grep -q "PDF du CV périmé" "$JOURNAL"; then
  ok "PDF périmé : le build échoue"
else
  ko "PDF périmé : le build échoue sans le bon message"
  sed -n '1,20p' "$JOURNAL"
fi
# … mais pas le serveur de dev ni astro check, qui passent par astro sync.
if npx astro sync > "$JOURNAL" 2>&1; then ok "PDF périmé : astro sync (dev) fonctionne"; else ko "PDF périmé : astro sync échoue, le mode dev est cassé"; fi
cp "$SAUVEGARDE" "$OFFRES"

exit $fail
