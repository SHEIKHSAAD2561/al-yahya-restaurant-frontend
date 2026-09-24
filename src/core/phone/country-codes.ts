export interface CountryCode {
  code: string;
  labelEn: string;
  labelAr: string;
}

/** Gulf countries first (this business's own market and its most common
 * expat worker nationalities), then a few common non-regional ones. Not an
 * exhaustive ISO-3166 list — extend if a real user needs a code not here. */
export const COUNTRY_CODES: CountryCode[] = [
  { code: '+966', labelEn: 'Saudi Arabia', labelAr: 'السعودية' },
  { code: '+971', labelEn: 'United Arab Emirates', labelAr: 'الإمارات' },
  { code: '+965', labelEn: 'Kuwait', labelAr: 'الكويت' },
  { code: '+973', labelEn: 'Bahrain', labelAr: 'البحرين' },
  { code: '+974', labelEn: 'Qatar', labelAr: 'قطر' },
  { code: '+968', labelEn: 'Oman', labelAr: 'عُمان' },
  { code: '+20', labelEn: 'Egypt', labelAr: 'مصر' },
  { code: '+962', labelEn: 'Jordan', labelAr: 'الأردن' },
  { code: '+961', labelEn: 'Lebanon', labelAr: 'لبنان' },
  { code: '+967', labelEn: 'Yemen', labelAr: 'اليمن' },
  { code: '+964', labelEn: 'Iraq', labelAr: 'العراق' },
  { code: '+92', labelEn: 'Pakistan', labelAr: 'باكستان' },
  { code: '+91', labelEn: 'India', labelAr: 'الهند' },
  { code: '+63', labelEn: 'Philippines', labelAr: 'الفلبين' },
  { code: '+1', labelEn: 'United States', labelAr: 'الولايات المتحدة' },
  { code: '+44', labelEn: 'United Kingdom', labelAr: 'المملكة المتحدة' },
];

export const DEFAULT_COUNTRY_CODE = '+966';

/** Stored `phone` is one plain string (see User.phone) — this splits it back
 * into {countryCode, number} for display. Unrecognized/legacy values (no
 * matching prefix) fall back to treating the whole thing as the number under
 * the default country, rather than guessing wrong. */
export function splitPhoneNumber(raw: string | null | undefined): {
  countryCode: string;
  number: string;
} {
  if (!raw) return { countryCode: DEFAULT_COUNTRY_CODE, number: '' };

  const byLongestCodeFirst = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  const match = byLongestCodeFirst.find((country) => raw.startsWith(country.code));
  if (match) {
    return { countryCode: match.code, number: raw.slice(match.code.length).trimStart() };
  }
  return { countryCode: DEFAULT_COUNTRY_CODE, number: raw };
}

export function joinPhoneNumber(countryCode: string, number: string): string {
  return `${countryCode}${number}`;
}
