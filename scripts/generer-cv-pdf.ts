// Génère les PDF du CV (FR et EN) à partir des pages construites, puis
// enregistre l'empreinte des sources que le build vérifie. À lancer en local
// après toute modification du CV : npm run cv:pdf. Jamais exécuté sur Vercel.
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import {
  calculerEmpreinte,
  FICHIER_EMPREINTE,
  listerSourcesCv,
} from '../src/cv/empreinte.ts';

const PORT = 4329;
const PAGES = [
  { lang: 'fr', chemin: '/cv/' },
  { lang: 'en', chemin: '/en/cv/' },
];

async function attendreServeur(url: string): Promise<void> {
  for (let essai = 0; essai < 60; essai++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // le serveur démarre encore
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Serveur injoignable : ${url}`);
}

execFileSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, CV_PDF_GENERATION: '1' },
});

const apercu = spawn(
  'npx',
  ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' },
);

try {
  await attendreServeur(`http://127.0.0.1:${PORT}/cv/`);
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage();
  for (const { lang, chemin } of PAGES) {
    await page.goto(`http://127.0.0.1:${PORT}${chemin}`, {
      waitUntil: 'networkidle',
    });
    await page.emulateMedia({ media: 'print' });
    const fichier = `public/cv/guillaume-miranda-cv-${lang}.pdf`;
    await page.pdf({
      path: fichier,
      preferCSSPageSize: true,
      printBackground: true,
    });
    console.log(`PDF écrit : ${fichier}`);
  }
  await navigateur.close();
} finally {
  apercu.kill();
}

const empreinte = calculerEmpreinte(listerSourcesCv(), (chemin) =>
  readFileSync(chemin, 'utf-8'),
);
writeFileSync(FICHIER_EMPREINTE, `${empreinte}\n`);
console.log(`Empreinte enregistrée : ${FICHIER_EMPREINTE}`);
