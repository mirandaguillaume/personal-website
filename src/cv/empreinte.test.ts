import { describe, it, expect } from 'vitest';
import { calculerEmpreinte } from './empreinte';

const fichiers: Record<string, string> = { 'a.json': '[1]', 'b.astro': '<p/>' };
const lire = (chemin: string) => fichiers[chemin];

describe('calculerEmpreinte', () => {
  it('donne la même empreinte pour les mêmes contenus', () => {
    expect(calculerEmpreinte(['a.json', 'b.astro'], lire)).toBe(
      calculerEmpreinte(['a.json', 'b.astro'], lire),
    );
  });

  it("ne dépend pas de l'ordre des chemins", () => {
    expect(calculerEmpreinte(['b.astro', 'a.json'], lire)).toBe(
      calculerEmpreinte(['a.json', 'b.astro'], lire),
    );
  });

  it("change dès qu'un octet change", () => {
    const avant = calculerEmpreinte(['a.json', 'b.astro'], lire);
    const apres = calculerEmpreinte(['a.json', 'b.astro'], (chemin) =>
      chemin === 'a.json' ? '[2]' : lire(chemin),
    );
    expect(apres).not.toBe(avant);
  });
});
