/**
 * Build mode gate.
 *
 * - `production` (default for `bun run build` and the deploy workflow): only
 *   content with `status: published` and facts with `verified: true` render.
 * - `preview` (`bun run dev`, `bun run build:preview`): `review` content and
 *   unverified facts render too, visibly marked, so they can be checked locally.
 *
 * `draft` content never renders. Drafts belong in the private vault, not here.
 */
export type SiteMode = 'production' | 'preview';
export type PublishStatus = 'draft' | 'review' | 'published';

function readMode(): SiteMode {
  const raw = (import.meta.env?.['SITE_MODE'] ?? process.env['SITE_MODE']) as string | undefined;
  if (raw === 'production' || raw === 'preview') return raw;
  // `astro dev` without SITE_MODE: preview, so work in progress is visible locally.
  return import.meta.env?.DEV ? 'preview' : 'production';
}

export const SITE_MODE: SiteMode = readMode();
export const IS_PREVIEW = SITE_MODE === 'preview';

export function isVisible(status: PublishStatus, mode: SiteMode = SITE_MODE): boolean {
  if (status === 'published') return true;
  if (status === 'review') return mode === 'preview';
  return false;
}

export function factVisible(verified: boolean, mode: SiteMode = SITE_MODE): boolean {
  return verified || mode === 'preview';
}

export const SITE = {
  url: 'https://maebsy.github.io',
  handle: 'maebsy',
  sourceRepo: 'https://github.com/maebsy/maebsy.github.io',
  /** Bump when content changes meaningfully. Shown in the footer. */
  updatedAt: '2026-11-25',
} as const;
