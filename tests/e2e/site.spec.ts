import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const LOCALES = [
  { code: 'en', prefix: '' },
  { code: 'ja', prefix: '/ja' },
  { code: 'ko', prefix: '/ko' },
] as const;
const PAGES = ['/', '/projects/', '/about/', '/resume/'];

for (const { code, prefix } of LOCALES) {
  for (const page of PAGES) {
    const url = `${prefix}${page}`;
    test(`${url} renders in ${code} without horizontal overflow`, async ({ page: p }) => {
      const res = await p.goto(url);
      expect(res?.status()).toBe(200);
      await expect(p.locator('html')).toHaveAttribute('lang', code);
      await expect(p.locator('h1')).toHaveCount(1);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test('language switch keeps the same case study', async ({ page }) => {
  await page.goto('/projects/ai-gitgen/');
  await page.getByRole('link', { name: '日本語' }).click();
  await expect(page).toHaveURL(/\/ja\/projects\/ai-gitgen\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page.getByRole('link', { name: '한국어' }).click();
  await expect(page).toHaveURL(/\/ko\/projects\/ai-gitgen\/$/);
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/ai-gitgen\/$/);
});

test('no automatic redirect by browser language', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'ja-JP' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await ctx.close();
});

test('main navigation is visible and usable', async ({ page }) => {
  await page.goto('/ja/');
  const nav = page.getByRole('navigation', { name: 'メイン' });
  for (const name of ['制作物', 'プロフィール', '経歴書']) await expect(nav.getByRole('link', { name })).toBeVisible();
  await nav.getByRole('link', { name: '経歴書' }).click();
  await expect(page).toHaveURL(/\/ja\/resume\/$/);
  await expect(nav.getByRole('link', { name: '経歴書' })).toHaveAttribute('aria-current', 'page');
});

test('theme toggle switches and persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const toggle = page.locator('#theme-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(21, 23, 26)');
});

test('skip link is the first focusable element and moves focus to main', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Tab order semantics checked in Chromium');
  await page.goto('/ko/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('case study shows verification, role and repository revision', async ({ page }) => {
  await page.goto('/ja/projects/movie-review-db/');
  await expect(page.locator('.verify').getByText('python scripts/run_all.py --check')).toBeVisible();
  await expect(page.getByRole('link', { name: '109bcc7' })).toHaveAttribute('href', /tree\/109bcc7$/);
  await expect(page.getByRole('heading', { level: 2, name: '担当範囲' })).toBeVisible();
});

test('404 page is trilingual and not indexed', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('ページが見つかりません')).toBeVisible();
  await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('resume prints without site chrome', async ({ page }) => {
  await page.goto('/resume/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();
  await expect(page.locator('#print-btn')).toBeHidden();
  await expect(page.locator('.resume h1')).toBeVisible();
});

for (const url of ['/', '/ja/', '/ko/projects/72hours/', '/ja/resume/', '/about/']) {
  test(`axe: no serious accessibility violations on ${url}`, async ({ page }) => {
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(url);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${scheme}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    }
  });
}

test('blog: translated post links both ways; missing Korean is marked, not faked', async ({ page }) => {
  await page.goto('/ja/blog/sqlite-index-group-by/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveCount(0);
  await expect(page.locator('.lang-switch .missing')).toHaveText(/한국어/);
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/sqlite-index-group-by\/$/);
});

test('blog: Korean index lists the post under other languages', async ({ page }) => {
  await page.goto('/ko/blog/');
  const section = page.locator('section[aria-labelledby="other-lang"]');
  await expect(section).toBeVisible();
  await expect(section.getByRole('link', { name: /GROUP BY/ })).toHaveCount(1);
});

test('blog: nav, recent writing and RSS appear once a post exists', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Blog' })).toBeVisible();
  await expect(page.locator('#writing')).toBeVisible();
  const rss = await request.get('/ja/rss.xml');
  expect(rss.status()).toBe(200);
  expect(await rss.text()).toContain('sqlite-index-group-by');
});
