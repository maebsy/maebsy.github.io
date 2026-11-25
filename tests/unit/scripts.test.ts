import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseFrontmatter } from '../../scripts/lib/frontmatter';
import { checkDist } from '../../scripts/check-dist';
import { validate } from '../../scripts/validate-content';

describe('frontmatter parser', () => {
  test('reads scalars, quoted strings and inline arrays', () => {
    const { data, body } = parseFrontmatter('---\nid: x\nsourceRevision: "056e470"\ntags: [a, b]\n---\nHello');
    expect(data).toEqual({ id: 'x', sourceRevision: '056e470', tags: ['a', 'b'] });
    expect(body).toBe('Hello');
  });
});

describe('validate-content on the real repository', () => {
  test('has no errors', () => {
    const { errors } = validate();
    expect(errors).toEqual([]);
  });
});

describe('check-dist', () => {
  let dir: string;
  const page = (lang: string, path: string, extra = '') =>
    `<!doctype html><html lang="${lang}"><head><title>t</title><meta name="description" content="d" />` +
    `<link rel="canonical" href="https://maebsy.github.io${path}" />${extra}</head>` +
    `<body><a class="skip-link" href="#main">s</a><main id="main"><h1>h</h1></main></body></html>`;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'dist-'));
    for (const d of ['ja', 'ko']) mkdirSync(join(dir, d));
    const alt =
      '<link rel="alternate" hreflang="en" href="https://maebsy.github.io/" />' +
      '<link rel="alternate" hreflang="ja" href="https://maebsy.github.io/ja/" />';
    writeFileSync(join(dir, 'index.html'), page('en', '/', alt));
    writeFileSync(join(dir, 'ja', 'index.html'), page('ja', '/ja/', alt));
    writeFileSync(join(dir, 'ko', 'index.html'), page('en', '/ko/', '<a href="/missing/">x</a>'));
    writeFileSync(join(dir, '404.html'), page('en', '/404/'));
    for (const f of ['robots.txt', 'sitemap-index.xml', 'favicon.svg']) writeFileSync(join(dir, f), '');
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  test('flags wrong lang, broken links and markers', () => {
    const { errors } = checkDist(dir, 'production');
    expect(errors.some((e) => e.includes('ko/index.html: <html lang="en">'))).toBe(true);
    expect(errors.some((e) => e.includes('broken internal link /missing/'))).toBe(true);
    expect(errors.some((e) => e.startsWith('index.html'))).toBe(false);
  });

  test('flags review markers only in production mode', () => {
    writeFileSync(join(dir, 'index.html'), page('en', '/', '<span class="flag">x</span>'));
    expect(checkDist(dir, 'production').errors.some((e) => e.includes('marker'))).toBe(true);
    expect(checkDist(dir, 'preview').errors.some((e) => e.includes('marker'))).toBe(false);
  });
});
