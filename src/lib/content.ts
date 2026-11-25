import { getCollection, type CollectionEntry } from 'astro:content';
import { LOCALES, localizePath, type Locale } from '../i18n/locales';
import { isVisible } from '../data/site';

export type Collection = 'projects' | 'blog' | 'notes' | 'research';
type Entry<C extends Collection> = CollectionEntry<C>;

// Memoized per build; skipped in dev so content edits show up immediately.
const cache = new Map<Collection, Promise<unknown[]>>();

/** Visible entries for one collection, honoring the build mode. */
export async function visibleEntries<C extends Collection>(collection: C): Promise<Entry<C>[]> {
  if (import.meta.env.DEV) cache.clear();
  let hit = cache.get(collection);
  if (!hit) {
    hit = getCollection(collection).then((all) => (all as Entry<C>[]).filter((e) => isVisible(e.data.status)));
    cache.set(collection, hit);
  }
  return (await hit) as Entry<C>[];
}

export async function entriesFor<C extends Collection>(collection: C, locale: Locale): Promise<Entry<C>[]> {
  return (await visibleEntries(collection)).filter((e) => e.data.locale === locale);
}

/** Section base path per collection (locale-neutral). */
export const SECTION_PATH: Record<Collection, string> = {
  projects: 'projects',
  blog: 'blog',
  notes: 'notes',
  research: 'research',
};

export function entryPath(collection: Collection, locale: Locale, id: string): string {
  return localizePath(locale, `${SECTION_PATH[collection]}/${id}`);
}

/**
 * For a translationKey, map every locale to the URL of its visible
 * translation, or null when that translation does not exist (yet).
 */
export async function alternatesFor(
  collection: Collection,
  translationKey: string,
): Promise<Record<Locale, string | null>> {
  const siblings = (await visibleEntries(collection)).filter((e) => e.data.translationKey === translationKey);
  const out = {} as Record<Locale, string | null>;
  for (const l of LOCALES) {
    const hit = siblings.find((e) => e.data.locale === l);
    out[l] = hit ? entryPath(collection, l, hit.data.id) : null;
  }
  return out;
}

/** Alternates for pages that exist in every locale (home, about, ...). */
export function staticAlternates(path: string): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])) as Record<Locale, string>;
}

/** Whether a section has anything to show in any locale (controls nav visibility). */
export async function sectionHasContent(collection: Collection): Promise<boolean> {
  return (await visibleEntries(collection)).length > 0;
}
