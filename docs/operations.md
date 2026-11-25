# Operations

## Toolchain

| Tool | Version | Why |
| --- | --- | --- |
| Bun | 1.4.4 | package manager, script runner, unit tests (`bun.lock` is the only lockfile) |
| Node.js | 24 LTS | Astro's CLI runs on Node (Astro 7 requires ≥ 22.23) |
| Astro | 7.4.10 | static site generator |
| TypeScript | 6.0.3 | `astro check` does not support TypeScript 7 yet |
| Playwright | 1.65.1 | E2E; axe-core 4.14.0 for accessibility checks |

All versions are pinned exactly in `package.json`. Upgrade one at a time, run the full check list, commit the lockfile with the change.

**Windows note.** If `bun add` fails with `EBUSY … Failed to replace old lockfile`, a file watcher or antivirus is holding `bun.lock`. Generate the lockfile in a temporary directory with the same `package.json`, copy `bun.lock` back, then `bun install --frozen-lockfile`.

## GitHub Actions

| Workflow | Trigger | Permissions | Does |
| --- | --- | --- | --- |
| `ci.yml` → `verify` | PRs, pushes to `main`, manual | `contents: read` | check, unit tests, production build + dist checks, preview build + dist checks, Playwright + axe |
| `ci.yml` → `build-pages` | `main` only, after `verify` passes | `contents: read` | production build → Pages artifact |
| `ci.yml` → `deploy` | after `build-pages` | `pages: write`, `id-token: write` | deploy to GitHub Pages |

Deployment cannot run unless every check, including E2E and accessibility, passed. Only the deploy job can write to Pages.

## First-time setup (requires owner approval)

1. Create the public repository `maebsy/maebsy.github.io` (user site → served at `/`, so `base` stays `/`).
2. Push `main`.
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Settings → Environments → `github-pages` → restrict deployments to `main`.
5. Run the `ci` workflow (it deploys from `main`); check https://maebsy.github.io/, `/ja/`, `/ko/`, `/404.html`, `/sitemap-index.xml`.

## Smoke test after a deploy

```bash
for p in / /ja/ /ko/ /projects/ /ja/about/ /ko/resume/ /sitemap-index.xml /robots.txt; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' https://maebsy.github.io$p)" "$p"
done
curl -s -o /dev/null -w '%{http_code}\n' https://maebsy.github.io/nope/   # expect 404
```

## Rollback

GitHub Pages serves the last successful deployment, so a failed build never takes the site down.

- **Wrong content published:** `git revert <commit>` on a branch → PR → merge. The deploy workflow republishes. Never force-push `main`.
- **Need the previous build immediately:** Actions → `ci` → open the last good run on `main` → *Re-run all jobs*. This rebuilds that commit.
- **Private data published by mistake:** revert as above, then treat the data as leaked: rotate keys, and ask GitHub Support to purge cached views if needed. Git history keeps the old commit; removing it requires rewriting history, which needs the owner's explicit decision.
- **Disable the site entirely:** Settings → Pages → Unpublish site.

## Adding a page type

1. Add a schema in `src/content.config.ts`.
2. Add routes under `src/pages/[...lang]/<section>/`.
3. Add the nav key to `src/i18n/ui.ts` (all locales) and to `Header.astro` with a `show` rule that hides the section until it has content.
4. Extend `tests/e2e/site.spec.ts`.

## Search (later)

When there are enough posts for search to matter, add [Pagefind](https://pagefind.app/) as a post-build step (`pagefind --site dist`). It is static and needs no server.
