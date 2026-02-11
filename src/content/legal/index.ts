import privacyPolicyEn from './privacy-policy.en.md?raw';
import privacyPolicyDeCH from './privacy-policy.de-CH.md?raw';
import termsOfServiceEn from './terms-of-service.en.md?raw';
import termsOfServiceDeCH from './terms-of-service.de-CH.md?raw';

export type LegalPage = 'privacy-policy' | 'terms-of-service';

const content: Record<LegalPage, Record<string, string>> = {
  'privacy-policy': {
    en: privacyPolicyEn,
    'de-CH': privacyPolicyDeCH,
  },
  'terms-of-service': {
    en: termsOfServiceEn,
    'de-CH': termsOfServiceDeCH,
  },
};

export function getLegalMarkdown(page: LegalPage, locale: string): string {
  return content[page][locale] ?? content[page]['en'];
}
