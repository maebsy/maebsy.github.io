import { defineConfig, devices } from '@playwright/test';

// E2E runs against `astro preview` of an existing dist/. Build first:
//   bun run build:preview   (includes content in review; used in CI and locally)
// Locally on Windows without downloaded browsers: PW_CHANNEL=msedge bun run test:e2e
const channel = process.env['PW_CHANNEL'];
const port = 4330;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    ...(channel ? { channel } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...(channel ? { channel } : {}) } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 }, ...(channel ? { channel } : {}) } },
  ],
  webServer: {
    command: `node node_modules/astro/bin/astro.mjs preview --port ${port} --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
