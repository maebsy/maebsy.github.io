/** JSON-LD built only from verified facts. */
import { PERSON } from '../data/profile';
import { SITE } from '../data/site';
import type { Locale } from '../i18n/locales';

export function personLd(locale: Locale): Record<string, unknown> {
  const name = PERSON.nameFact.verified ? PERSON.name[locale] : undefined;
  return {
    '@type': 'Person',
    ...(name ? { name } : {}),
    alternateName: PERSON.handle,
    url: SITE.url,
    sameAs: PERSON.links.filter((l) => l.verified).map((l) => l.url),
  };
}

export function profilePageLd(locale: Locale, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: new URL(url, SITE.url).href,
    inLanguage: locale,
    dateModified: SITE.updatedAt,
    mainEntity: personLd(locale),
  };
}

export function articleLd(args: {
  locale: Locale;
  url: string;
  title: string;
  description: string;
  published: Date;
  updated: Date;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: args.title,
    description: args.description,
    inLanguage: args.locale,
    url: new URL(args.url, SITE.url).href,
    datePublished: args.published.toISOString().slice(0, 10),
    dateModified: args.updated.toISOString().slice(0, 10),
    author: personLd(args.locale),
  };
}
