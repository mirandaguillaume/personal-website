/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig réutilise la chaîne Vite d'Astro : TypeScript, ESM et alias
// fonctionnent sans configuration supplémentaire.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
