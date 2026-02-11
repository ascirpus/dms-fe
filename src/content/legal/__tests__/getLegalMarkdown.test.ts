import { describe, it, expect } from 'vitest';
import { getLegalMarkdown } from '../index';

describe('getLegalMarkdown', () => {
  it('returns English privacy policy for "en" locale', () => {
    const md = getLegalMarkdown('privacy-policy', 'en');
    expect(md).toContain('# Privacy Policy');
    expect(md).toContain('cedar-stack.com');
  });

  it('returns German privacy policy for "de-CH" locale', () => {
    const md = getLegalMarkdown('privacy-policy', 'de-CH');
    expect(md).toContain('# Datenschutzerklärung');
  });

  it('returns English terms of service for "en" locale', () => {
    const md = getLegalMarkdown('terms-of-service', 'en');
    expect(md).toContain('# Terms of Service');
  });

  it('returns German terms of service for "de-CH" locale', () => {
    const md = getLegalMarkdown('terms-of-service', 'de-CH');
    expect(md).toContain('# Nutzungsbedingungen');
  });

  it('falls back to English for unknown locale', () => {
    const md = getLegalMarkdown('privacy-policy', 'fr');
    expect(md).toContain('# Privacy Policy');
  });
});
