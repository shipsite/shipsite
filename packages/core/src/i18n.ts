/**
 * Resolve a localized field value.
 * Accepts a plain string (returned as-is) or a locale map like `{ en: "Features", de: "Funktionen" }`.
 * Falls back to the `en` key when the requested locale is missing.
 */
export function getLocalizedField(
  field: string | Record<string, string> | undefined,
  locale: string,
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[locale] || field.en || '';
}
