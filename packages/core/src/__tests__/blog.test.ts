import { describe, it, expect, vi } from 'vitest';

vi.mock('content-collections', () => ({
  allSitePages: [],
}));

import { getLocalizedField } from '../blog';

describe('getLocalizedField', () => {
  it('returns empty string for undefined', () => {
    expect(getLocalizedField(undefined, 'en')).toBe('');
  });

  it('returns the string directly when field is a string', () => {
    expect(getLocalizedField('Author', 'en')).toBe('Author');
    expect(getLocalizedField('Author', 'de')).toBe('Author');
  });

  it('returns empty string for empty string', () => {
    expect(getLocalizedField('', 'en')).toBe('');
  });

  it('returns the matching locale from a record', () => {
    const field = { en: 'Developer', de: 'Entwickler', fr: 'Développeur' };
    expect(getLocalizedField(field, 'de')).toBe('Entwickler');
    expect(getLocalizedField(field, 'fr')).toBe('Développeur');
    expect(getLocalizedField(field, 'en')).toBe('Developer');
  });

  it('falls back to en when requested locale is missing', () => {
    const field = { en: 'Developer' };
    expect(getLocalizedField(field, 'de')).toBe('Developer');
    expect(getLocalizedField(field, 'fr')).toBe('Developer');
  });

  it('returns empty string when neither locale nor en exists', () => {
    const field = { de: 'Entwickler' };
    expect(getLocalizedField(field, 'fr')).toBe('');
  });
});
