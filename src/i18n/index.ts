import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGS, resources } from './locales';
import type { Lang } from '../lib/types';

const KEY = 'tantoni-lang';
const stored = (() => {
  try { return localStorage.getItem(KEY); } catch { return null; }
})();
const initial = LANGS.some((l) => l.code === stored) ? (stored as Lang) : 'fr';

function applyDocumentLang(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: 'fr',
  defaultNS: 't',
  interpolation: { escapeValue: false },
  returnObjects: true,
});

applyDocumentLang(initial);
i18n.on('languageChanged', (lng) => {
  applyDocumentLang(lng);
  try { localStorage.setItem(KEY, lng); } catch { /* ignore */ }
});

export const currentLang = () => (i18n.resolvedLanguage || 'fr') as Lang;
export default i18n;
