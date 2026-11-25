import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { LOCALES, langParam, localeFromParam } from '../../i18n/locales';
import { t } from '../../i18n/ui';
import { visibleEntries, entriesFor, entryPath } from '../../lib/content';

// One feed per locale, generated only when the blog has posts.
export async function getStaticPaths() {
  if ((await visibleEntries('blog')).length === 0) return [];
  return LOCALES.map((l) => ({ params: { lang: langParam(l) } }));
}

export async function GET(context: APIContext) {
  const locale = localeFromParam(context.params['lang']);
  const posts = (await entriesFor('blog', locale)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
  return rss({
    title: `maebsy · ${t(locale, 'blog.title')}`,
    description: t(locale, 'blog.lede'),
    site: context.site ?? 'https://maebsy.github.io',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.publishedAt,
      link: entryPath('blog', locale, p.data.id),
      categories: p.data.tags,
    })),
    customData: `<language>${locale}</language>`,
  });
}
