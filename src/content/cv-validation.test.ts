import { describe, it, expect } from 'vitest';
import { trouverTextesInvalides, type ExperienceBrute } from './cv-validation';

function poste(partiel: Partial<ExperienceBrute> = {}): ExperienceBrute {
  return {
    id: 'exemple',
    summary: { fr: 'Un résumé.', en: 'A summary.' },
    achievements: [],
    missions: [],
    ...partiel,
  };
}

describe('trouverTextesInvalides', () => {
  it('accepte des postes aux textes distincts', () => {
    expect(
      trouverTextesInvalides([
        poste({ id: 'a', summary: { fr: 'Premier.', en: 'First.' } }),
        poste({ id: 'b', summary: { fr: 'Second.', en: 'Second.' } }),
      ]),
    ).toEqual([]);
  });

  it('refuse un résumé vide', () => {
    const erreurs = trouverTextesInvalides([
      poste({ id: 'vide', summary: { fr: '  ', en: 'Something.' } }),
    ]);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0]).toContain('vide');
  });

  it('refuse un même texte dans deux postes', () => {
    const provisoire = 'RabbitMQ, gestion de base de données, et plus.';
    const erreurs = trouverTextesInvalides([
      poste({ id: 'a', summary: { fr: provisoire, en: 'One.' } }),
      poste({ id: 'b', summary: { fr: provisoire, en: 'Two.' } }),
    ]);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0]).toContain(provisoire);
  });

  it('refuse une réalisation de mission vide', () => {
    const erreurs = trouverTextesInvalides([
      poste({
        id: 'esn',
        missions: [
          { client: 'Client', achievements: [{ fr: '', en: 'Done.' }] },
        ],
      }),
    ]);
    expect(erreurs).toHaveLength(1);
    expect(erreurs[0]).toContain('esn');
  });
});
