# Content guide

How to write, translate, review and publish content on this site.

## 1. Principles

1. **Evidence first.** Every claim links to a repository, file, pull request or command output. If it cannot be checked, it does not go on the site.
2. **Say what you did not do.** Team projects name the parts teammates built.
3. **Plans are plans.** Future work is written in the future tense and never listed as a skill or result.
4. **No unmeasured numbers.** A number needs the command, the date and the environment it came from.
5. **Learning is labeled.** Coursework is labeled "Coursework / 学習課題 / 과제"; fundamentals are labeled as such.

## 2. Where things live

| What | Where | Example |
| --- | --- | --- |
| UI labels (nav, buttons) | `src/i18n/ui.ts` | `'nav.projects'` |
| Facts shared by all locales | `src/data/*.ts` | repo URL, revision, test result, dates |
| Narrative per locale | `src/content/<collection>/<locale>/<id>.md` | case study text |

A fact is written **once** in `src/data/` and reused by every locale. Do not copy numbers into Markdown when the page already renders them from data (the verification box, the project header).

## 3. Frontmatter

```yaml
id: ai-gitgen                      # = file name; same in every locale
translationKey: project-ai-gitgen  # same in every locale; links translations
locale: ja                         # = folder name
translatedFrom: en                 # required for translations of projects
title: …
summary: …                         # ≤ 320 characters
status: review                     # draft | review | published
updatedAt: 2026-11-25
sourceRevision: "056e470"          # quote it: YAML reads 056e470 as a number
tags: [python, cli]
role: …                            # projects only
```

Blog posts add `publishedAt`, `category` and optionally `zennUrl`. Notes add `progress` (`seedling | growing | stable`). Research adds `sources` and `hypothesis`.

## 4. Templates

**Project case study** — headings in this order:

| EN | JA | KO |
| --- | --- | --- |
| Overview | 概要 | 개요 |
| Context and problem | 背景と課題 | 배경과 문제 |
| Architecture | 構成 | 구조 |
| Implementation and trade-offs | 設計・実装の判断 | 구현과 설계 판단 |
| My contribution | 担当範囲 | 담당 범위 |
| Validation and results | 検証と成果 | 검증과 결과 |
| Reproduction | 再現手順 | 재현 방법 |
| Limitations and next steps | 制約と改善点 | 한계와 다음 단계 |

**Blog post:** problem → cause → fix → verification → lessons.
**Note:** date, tags, revision date, progress; may be revised freely.
**Research:** sources → hypothesis → setup → results → limitations → how to reproduce.

## 5. Translation policy

- Home, featured projects, About, Resume and navigation must exist in all three languages before the site is published.
- Blog, Notes and Research do **not** need all three languages. If a translation is missing, the language switch shows the locale as unavailable and the blog index lists the original under "Available in another language". Never add a Japanese `lang` or hreflang to an English page.
- Japanese: です・ます調, natural job titles, full-width punctuation (、。「」（）), half-width digits and Latin, no self-promotional exaggeration (避ける：「圧倒的」「完璧に」). Avoid literal translation from Korean; rewrite sentences.
- Korean: plain and direct; fine for dev logs and learning notes as the original language.
- English: short, technical, active voice.
- Do not claim native review. Record who reviewed a translation in the commit message, not on the page.

Workflow: write the source → set `status: review` → translate with `translatedFrom` → review in a preview build → set `status: published` in all locales of the same `translationKey` together.

## 6. Verifying facts

1. Re-run the command, note the result, date and environment in `src/data/projects.ts` (`verification`).
2. Update `revision` to the commit you read, and `sourceRevision` in every locale.
3. `bun run check` fails if they disagree.
4. For profile facts (`src/data/profile.ts`): set `verified: true` and fill `source` only after the owner confirms.

## 7. Publishing checklist

- [ ] `bun run check` → 0 errors
- [ ] `bun run test` → all pass
- [ ] `bun run build:preview` and read every changed page in all locales at 375 px and desktop
- [ ] `bun run test:e2e` → all pass
- [ ] Switch `status` to `published`, `bun run build` → `check-dist (production): … 0 error(s)`
- [ ] No email, phone, private repository name, vault path or unapproved photo in the diff
- [ ] Commit, open a pull request, let CI pass, merge (deploys automatically)
