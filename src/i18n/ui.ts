export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export const defaultLang = 'fr';
export const showDefaultLang = false;

export type Lang = keyof typeof languages;

export const ui = {
  fr: {
    'nav.home': 'Accueil',
    'nav.blog': 'Articles',
    'nav.about': 'À propos',
    'nav.projects': 'Projets',
    'nav.cv': 'CV',
    'nav.contact': 'Contact',
    'footer.rights': 'Tous droits réservés.',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.cv': 'Resume',
    'nav.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
  },
} as const;
