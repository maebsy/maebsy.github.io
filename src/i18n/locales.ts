/**
 * Locale registry and URL helpers.
 *
 * URL policy: English is served without a prefix (`/projects/x/`), Japanese
 * and Korean are prefixed (`/ja/projects/x/`, `/ko/projects/x/`). Nothing on
 * the site redirects based on the browser language.
 */
export const LOCALES = ['en', 'ja', 'ko'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; ogLocale: string }> = {
  en: { label: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
  ja: { label: '日本語', htmlLang: 'ja', ogLocale: 'ja_JP' },
  ko: { label: '한국어', htmlLang: 'ko', ogLocale: 'ko_KR' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Value for the `[...lang]` rest param: `undefined` renders the unprefixed English route. */
export function langParam(locale: Locale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function localeFromParam(param: string | undefined): Locale {
  if (param === undefined || param === '') return DEFAULT_LOCALE;
  if (isLocale(param)) return param;
  throw new Error(`Unknown locale param: ${param}`);
}

export function langPaths(): { params: { lang: string | undefined } }[] {
  return LOCALES.map((locale) => ({ params: { lang: langParam(locale) } }));
}

/**
 * Build a site-relative URL for a locale. `path` is locale-neutral, e.g.
 * `projects/ai-gitgen` or `/about/`. Always returns a trailing slash.
 */
export function localizePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return clean ? `${prefix}/${clean}/` : `${prefix}/`;
}

/** Remove the locale prefix from a pathname, returning the locale and neutral path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const first = parts[0];
  if (first !== undefined && isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, path: parts.slice(1).join('/') };
  }
  return { locale: DEFAULT_LOCALE, path: parts.join('/') };
}

const DATE_FORMATS: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: { year: 'numeric', month: 'short', day: 'numeric' },
  ja: { year: 'numeric', month: '2-digit', day: '2-digit' },
  ko: { year: 'numeric', month: '2-digit', day: '2-digit' },
};

/** ISO-like machine date for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Human date. JA/KO use the numeric YYYY.MM.DD style common on Japanese/Korean tech sites. */
export function formatDate(date: Date, locale: Locale): string {
  if (locale === 'en') {
    return new Intl.DateTimeFormat('en-US', { ...DATE_FORMATS.en, timeZone: 'UTC' }).format(date);
  }
  return isoDate(date).replaceAll('-', '.');
}

/** Year-month for timelines, e.g. "2026.10" in every locale (compact and unambiguous). */
export function formatMonth(ym: string): string {
  return ym.replace('-', '.');
}
