import { ui, defaultLang, showDefaultLang } from './ui';
import type { Lang } from './ui';

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key];
  };
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string) {
    return !showDefaultLang && lang === defaultLang ? path : `/${lang}${path}`;
  };
}
