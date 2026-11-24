/**
 * Contrôle d'ensemble des données du CV (src/data/experience.json), fait au
 * chargement de la config : Zod valide chaque poste isolément, mais seul un
 * regard sur tous les postes voit un texte provisoire recopié d'un poste à
 * l'autre — le défaut qu'avait la première version de la page.
 */

export interface TexteLocalise {
  fr: string;
  en: string;
}

export interface ExperienceBrute {
  id: string;
  summary: TexteLocalise;
  achievements: TexteLocalise[];
  missions: { client: string; achievements: TexteLocalise[] }[];
}

/** Messages d'erreur, un par texte vide ou par texte FR présent dans deux postes. */
export function trouverTextesInvalides(
  experiences: ExperienceBrute[],
): string[] {
  const erreurs: string[] = [];
  const premierPoste = new Map<string, string>();

  for (const experience of experiences) {
    const textes = [
      experience.summary,
      ...experience.achievements,
      ...experience.missions.flatMap((mission) => mission.achievements),
    ];
    const vusDansCePoste = new Set<string>();

    for (const texte of textes) {
      if (texte.fr.trim() === '' || texte.en.trim() === '') {
        erreurs.push(`${experience.id} : texte vide`);
        continue;
      }
      const cle = texte.fr.trim();
      if (vusDansCePoste.has(cle)) continue;
      vusDansCePoste.add(cle);
      const deja = premierPoste.get(cle);
      if (deja === undefined) {
        premierPoste.set(cle, experience.id);
      } else {
        erreurs.push(`${experience.id} : « ${cle} » déjà utilisé par ${deja}`);
      }
    }
  }

  return erreurs;
}
