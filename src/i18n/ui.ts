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
    'cv.title': 'CV',
    'cv.description':
      'CV de Guillaume Miranda, développeur PHP/Symfony freelance : reprise de legacy, audit, lead technique et craftsmanship.',
    'cv.hook':
      "Vous avez une application que plus personne n'ose toucher ? C'est là que j'aime arriver.",
    'cv.subtitle':
      "Développeur PHP/Symfony freelance, plus de dix ans de PHP, des intranets en PHP 4 aux API qui suivent 11 milliards d'objets. Je reprends le legacy, je l'audite et je le rends sûr à faire évoluer, tests à l'appui.",
    'cv.contact': 'Me contacter',
    'cv.download': 'Télécharger le CV (PDF)',
    'cv.detailed': 'CV détaillé (PDF, FR)',
    'cv.offers': 'Ce que je propose',
    'cv.proof': 'Référence',
    'cv.missions': 'Missions phares',
    'cv.via': 'via',
    'cv.path': 'Parcours',
    'cv.skills': 'Compétences',
    'cv.education': 'Formation',
    'cv.engagements': 'Engagements',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.cv': 'Resume',
    'nav.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    'cv.title': 'Resume',
    'cv.description':
      'Resume of Guillaume Miranda, freelance PHP/Symfony developer: legacy takeover, code audit, technical leadership and craftsmanship.',
    'cv.hook':
      "Got an application nobody dares to touch anymore? That's where I like to step in.",
    'cv.subtitle':
      'Freelance PHP/Symfony developer with over ten years of PHP, from PHP 4 intranets to APIs tracking 11 billion items. I take over legacy code, audit it and make it safe to evolve, backed by tests.',
    'cv.contact': 'Get in touch',
    'cv.download': 'Download resume (PDF)',
    'cv.detailed': 'Detailed resume (PDF, French)',
    'cv.offers': 'What I offer',
    'cv.proof': 'Track record',
    'cv.missions': 'Key assignments',
    'cv.via': 'via',
    'cv.path': 'Career',
    'cv.skills': 'Skills',
    'cv.education': 'Education',
    'cv.engagements': 'Community',
  },
} as const;
