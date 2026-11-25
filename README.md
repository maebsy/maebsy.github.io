# maebsy.github.io

Source of [maebsy.github.io](https://maebsy.github.io/): portfolio, case studies, writing and résumé, in English, Japanese and Korean.

Static site built with Astro, no runtime server, no database, no tracking.

## Commands

Requires [Bun](https://bun.sh) 1.4.4 and Node.js 24 (Astro runs on Node). `mise.toml` pins both.

| Command | What it does |
| --- | --- |
| `bun install --frozen-lockfile` | Install exactly what `bun.lock` records |
| `bun run dev` | Dev server (preview mode: content in review is visible and marked) |
| `bun run check` | `astro check` (TypeScript strictest) + `scripts/validate-content.ts` |
| `bun run test` | Unit tests (`bun test tests/unit`) |
| `bun run build` | **Production** build: published content and verified facts only, then `scripts/check-dist.ts` |
| `bun run build:preview` | Preview build including content in review |
| `bun run test:e2e` | Playwright E2E + axe accessibility tests against `dist/` (run `build:preview` first) |

On Windows without downloaded Playwright browsers: `PW_CHANNEL=msedge bun run test:e2e`.

## Structure

```text
src/
  i18n/            locales, URL helpers, UI dictionary (UI strings only)
  data/            locale-independent verified facts: profile, projects, skills
  content/         Markdown per item and locale: projects/{en,ja,ko}/<id>.md, blog/, notes/, research/
  content.config.ts  collection schemas (validated at build time)
  pages/[...lang]/ one route tree for all locales (en unprefixed, /ja/, /ko/)
  components/ layouts/ styles/
scripts/           validate-content.ts, check-dist.ts
tests/unit         bun test       tests/e2e   Playwright
docs/              content guide, operations, private→public export
```

## How content gets published

Every Markdown file has `status: draft | review | published`.

- `draft` never builds. Drafts live in the private vault, not here.
- `review` appears only in preview builds, with a visible "In review" label.
- `published` appears in the production build.

Facts in `src/data/` carry `verified: true | false`. Unverified facts are rendered only in preview builds. `scripts/check-dist.ts` fails the production build if any review or unverified marker leaks into `dist/`.

See [docs/content-guide.md](docs/content-guide.md) and [docs/operations.md](docs/operations.md).

## License

Not yet chosen. Until a LICENSE file is added, all rights are reserved.
