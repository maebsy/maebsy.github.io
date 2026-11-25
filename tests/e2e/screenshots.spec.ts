import { test } from '@playwright/test';

// Review screenshots (not visual assertions). Saved under test-results/screenshots/.
// Run: bun run test:e2e -- screenshots --project=desktop
const WIDTHS = [375, 768, 1440];
const URLS = ['/', '/ja/', '/ko/', '/ja/projects/72hours/', '/ja/resume/'];

test.describe.configure({ mode: 'serial' });

for (const width of WIDTHS) {
  test(`screenshots at ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one browser is enough for review screenshots');
    await page.setViewportSize({ width, height: 900 });
    for (const url of URLS) {
      await page.goto(url);
      const name = url.replaceAll('/', '_').replace(/^_|_$/g, '') || 'home';
      await page.screenshot({ path: `test-results/screenshots/${width}-${name}.png`, fullPage: true });
    }
  });
}
