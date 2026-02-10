import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import deCH from '@/locales/de-CH.json';

export type SupportedLocale = 'en' | 'de-CH';

export interface LocaleMeta {
  code: SupportedLocale;
  flag: string;
  label: string;
}

export const availableLocales: LocaleMeta[] = [
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'EN' },
  { code: 'de-CH', flag: '\u{1F1E8}\u{1F1ED}', label: 'DE' },
];

const LOCALE_STORAGE_KEY = 'dms-locale';

export function detectLocale(): SupportedLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en' || stored === 'de-CH') return stored;

  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  if (browserLang.startsWith('de')) return 'de-CH';

  return 'en';
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, 'de-CH': deCH },
});

export function setLocale(locale: SupportedLocale, persist = true) {
  i18n.global.locale.value = locale;
  document.documentElement.lang = locale;
  if (persist) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export function syncLocaleFromProfile(user: { locale?: string } | null) {
  if (!user?.locale) return;
  const locale = user.locale as SupportedLocale;
  if (locale === 'en' || locale === 'de-CH') {
    setLocale(locale, false);
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}
