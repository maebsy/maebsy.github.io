/**
 * Content and fact validation (run by `bun run check` and CI).
 *
 * Errors (exit 1):
 *  - content file locale/id does not match its path
 *  - project content without matching facts in src/data/projects.ts
 *  - sourceRevision differs from the revision recorded in the facts
 *  - translationKey inconsistent across locales of the same id
 *  - featured project missing a locale
 *  - translation without `translatedFrom`
 *  - private markers (vault paths, emails, wikilinks) in public content
 * Warnings (exit 0): content still in review, unverified facts.
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { readDocs, walk } from './lib/frontmatter';
import { PROJECTS } from '../src/data/projects';
import { PERSON, TIMELINE } from '../src/data/profile';
import { LOCALES, DEFAULT_LOCALE } from '../src/i18n/locales';

const errors: string[] = [];
const warnings: string[] = [];

const PRIVATE_PATTERNS: [RegExp, string][] = [
  [/\[\[[^\]]+\]\]/, 'Obsidian wikilink (convert to a normal link or remove)'],
  [/!\[\[[^\]]+\]\]/, 'Obsidian embed'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'email address'],
  [/[A-Z]:\\Users\\|\/home\/[a-z]|\/Users\/[A-Za-z]/, 'local filesystem path'],
  [/\b(?:sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/, 'secret-looking token'],
  [/%%[\s\S]*?%%/, 'Obsidian comment block'],
];

export function validate(root = process.cwd()): { errors: string[]; warnings: string[] } {
  for (const collection of ['projects', 'blog', 'notes', 'research']) {
    const docs = readDocs(`${root}/src/content/${collection}`, root);
    const byId = new Map<string, typeof docs>();
    for (const d of docs) {
      const [, , , locale, file] = d.path.split('/');
      const id = file?.replace(/\.md$/, '');
      if (d.data['locale'] !== locale) errors.push(`${d.path}: locale "${d.data['locale']}" does not match folder "${locale}"`);
      if (d.data['id'] !== id) errors.push(`${d.path}: id "${d.data['id']}" does not match file name "${id}"`);
      if (locale !== DEFAULT_LOCALE && !d.data['translatedFrom'] && collection === 'projects') {
        errors.push(`${d.path}: translation is missing translatedFrom`);
      }
      if (d.data['status'] === 'review') warnings.push(`${d.path}: status is "review" (excluded from production build)`);
      if (d.data['status'] === 'draft') errors.push(`${d.path}: drafts belong in the private vault, not in the public repo`);
      const text = `${JSON.stringify(d.data)}\n${d.body}`;
      for (const [re, label] of PRIVATE_PATTERNS) {
        if (re.test(text)) errors.push(`${d.path}: contains ${label}`);
      }
      const list = byId.get(String(d.data['id'])) ?? [];
      list.push(d);
      byId.set(String(d.data['id']), list);
    }

    for (const [id, list] of byId) {
      const keys = new Set(list.map((d) => d.data['translationKey']));
      if (keys.size > 1) errors.push(`${collection}/${id}: translationKey differs across locales (${[...keys].join(', ')})`);
    }

    if (collection === 'projects') {
      for (const [id, list] of byId) {
        const facts = PROJECTS.find((p) => p.id === id);
        if (!facts) {
          errors.push(`projects/${id}: no facts entry in src/data/projects.ts`);
          continue;
        }
        for (const d of list) {
          if (d.data['sourceRevision'] !== facts.revision) {
            errors.push(`${d.path}: sourceRevision ${d.data['sourceRevision']} != facts revision ${facts.revision}`);
          }
        }
      }
      for (const p of PROJECTS.filter((x) => x.featured)) {
        const locales = new Set((byId.get(p.id) ?? []).map((d) => d.data['locale']));
        for (const l of LOCALES) if (!locales.has(l)) errors.push(`featured project ${p.id}: missing ${l} case study`);
      }
    }
  }

  for (const p of PROJECTS) {
    for (const v of p.verification) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.checkedOn)) errors.push(`${p.id}: invalid checkedOn ${v.checkedOn}`);
      for (const l of LOCALES) if (!v.result[l]) errors.push(`${p.id}: verification result missing ${l}`);
    }
    for (const l of LOCALES) if (!p.oneLiner[l]) errors.push(`${p.id}: oneLiner missing ${l}`);
  }

  if (!PERSON.nameFact.verified) warnings.push(`profile: name not confirmed (${PERSON.nameFact.todo ?? ''})`);
  for (const i of TIMELINE) {
    if (i.verified && !i.source) errors.push(`timeline ${i.id}: verified without a source`);
    // Source is public even when the build hides a fact, so unverified entries must not be committed.
    if (!i.verified) errors.push(`timeline ${i.id}: unverified entry in public source; keep it in the private ledger until confirmed`);
  }

  // Privacy scan of public data and i18n sources (content is scanned above).
  for (const file of [...walk(`${root}/src/data`, '.ts'), ...walk(`${root}/src/i18n`, '.ts')]) {
    const text = readFileSync(file, 'utf8');
    for (const [re, label] of PRIVATE_PATTERNS) {
      if (label.startsWith('Obsidian')) continue;
      if (re.test(text)) errors.push(`${relative(root, file).replaceAll('\\', '/')}: contains ${label}`);
    }
  }
  return { errors, warnings };
}

if (import.meta.main) {
  const { errors: e, warnings: w } = validate();
  for (const x of w) console.warn(`warn  ${x}`);
  for (const x of e) console.error(`error ${x}`);
  console.log(`validate-content: ${e.length} error(s), ${w.length} warning(s)`);
  process.exit(e.length ? 1 : 0);
}
