import { describe, it, expect } from 'vitest';
import { formaterPeriode } from './periode';

describe('formaterPeriode', () => {
  it("affiche l'année seule quand seule l'année est connue", () => {
    expect(formaterPeriode('fr', { year: 2024 })).toBe('2024');
  });

  it('affiche début et fin en toutes lettres', () => {
    expect(
      formaterPeriode('fr', {
        startDate: new Date('2016-01-01'),
        endDate: new Date('2018-11-01'),
      }),
    ).toBe('janvier 2016 – novembre 2018');
  });

  it('termine par « Present » une période en cours, en anglais', () => {
    expect(formaterPeriode('en', { startDate: new Date('2025-08-01') })).toBe(
      'August 2025 – Present',
    );
  });

  it('renvoie null sans aucune date', () => {
    expect(formaterPeriode('fr', {})).toBeNull();
  });
});
