// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// User site (maebsy/maebsy.github.io) is served from the domain root, so `base` stays '/'.
export default defineConfig({
  site: 'https://maebsy.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'ja', 'ko'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ja: 'ja', ko: 'ko' },
      },
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: false },
  },
  devToolbar: { enabled: false },
});
