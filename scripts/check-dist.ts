/**
 * Post-build checks on dist/ (run after every production build and in CI).
 *
 *   bun run scripts/check-dist.ts            # production rules
 *   bun run scripts/check-dist.ts --preview  # preview build: skip publication rules
 *
 * Checks: html lang matches the URL locale, canonical and hreflang targets
 * exist, every internal link resolves, required files exist, and (production
 * only) no review/unverified markers, no noindex, no private-looking data.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walk } from './lib/frontmatter';

const SITE = 'https://maebsy.github.io';
const LOCALES = ['en', 'ja', 'ko'];

export interface DistReport {
  pages: number;
  errors: string[];
}

function fileForPath(dist: string, pathname: string): string | null {
  const clean = decodeURIComponent(pathname.split('#')[0]!.split('?')[0]!);
  const candidates = clean.endsWith('/')
    ? [join(dist, clean, 'index.html')]
    : [join(dist, clean), join(dist, clean, 'index.html'), join(dist, `${clean}.html`)];
  return candidates.find((c) => existsSync(c)) ?? null;
}

function attr(tag: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];
}

export function checkDist(dist: string, mode: 'production' | 'preview'): DistReport {
  const errors: string[] = [];
  if (!existsSync(dist)) return { pages: 0, errors: [`${dist} does not exist; run the build first`] };

  for (const required of ['index.html', 'ja/index.html', 'ko/index.html', '404.html', 'robots.txt', 'sitemap-index.xml', 'favicon.svg']) {
    if (!existsSync(join(dist, required))) errors.push(`missing ${required}`);
  }

  const pages = walk(dist, '.html');
  for (const file of pages) {
    const rel = relative(dist, file).replaceAll('\\', '/');
    const html = readFileSync(file, 'utf8');
    const urlPath = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
    const first = urlPath.split('/')[1] ?? '';
    const expectedLang = LOCALES.includes(first) && first !== 'en' ? first : 'en';
    const is404 = rel === '404.html';

    const lang = /<html[^>]*\slang="([^"]+)"/.exec(html)?.[1];
    if (lang !== expectedLang) errors.push(`${rel}: <html lang="${lang}"> but URL implies "${expectedLang}"`);

    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing <title>`);
    if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel}: missing meta description`);
    if (!/<main[^>]*id="main"/.test(html)) errors.push(`${rel}: missing <main id="main">`);
    if (!/class="skip-link"/.test(html)) errors.push(`${rel}: missing skip link`);
    if (/<h1[\s>]/g.exec(html) === null) errors.push(`${rel}: missing <h1>`);
    if ((html.match(/<h1[\s>]/g) ?? []).length > 1) errors.push(`${rel}: more than one <h1>`);

    if (!is404) {
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      if (!canonical) errors.push(`${rel}: missing canonical`);
      else if (canonical !== SITE + urlPath) errors.push(`${rel}: canonical ${canonical} != ${SITE + urlPath}`);
    }

    // hreflang: every target must exist, and must link back (reciprocity).
    for (const tag of html.match(/<link rel="alternate" hreflang="[^"]+" href="[^"]+"[^>]*>/g) ?? []) {
      const href = attr(tag, 'href') ?? '';
      const target = fileForPath(dist, href.replace(SITE, ''));
      if (!target) {
        errors.push(`${rel}: hreflang target missing ${href}`);
        continue;
      }
      const back = readFileSync(target, 'utf8');
      if (!back.includes(`href="${SITE + urlPath}"`)) errors.push(`${rel}: hreflang target ${href} does not link back`);
    }

    // Internal links and assets resolve.
    for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const href = m[1] as string;
      if (href.startsWith('//')) continue;
      if (!fileForPath(dist, href)) errors.push(`${rel}: broken internal link ${href}`);
    }

    if (mode === 'production') {
      if (/class="preview-banner"/.test(html)) errors.push(`${rel}: preview banner in production build`);
      if (/class="flag"/.test(html)) errors.push(`${rel}: review/unverified marker in production build`);
      if (!is404 && /name="robots" content="noindex"/.test(html)) errors.push(`${rel}: noindex in production build`);
      const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
      if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(text.replace(/@[a-z-]+\/[a-z-]+/g, ''))) {
        errors.push(`${rel}: email-like string in production build`);
      }
    }
  }
  return { pages: pages.length, errors };
}

if (import.meta.main) {
  const mode = process.argv.includes('--preview') ? 'preview' : 'production';
  const { pages, errors } = checkDist(join(process.cwd(), 'dist'), mode);
  for (const e of errors) console.error(`error ${e}`);
  console.log(`check-dist (${mode}): ${pages} page(s), ${errors.length} error(s)`);
  process.exit(errors.length ? 1 : 0);
}
