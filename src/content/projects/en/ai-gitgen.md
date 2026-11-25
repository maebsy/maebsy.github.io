---
id: ai-gitgen
translationKey: project-ai-gitgen
locale: en
title: ai-gitgen — commit and PR drafts from git diff
summary: A Python CLI that turns git status and git diff into a commit message or a pull-request description. The model supplies content as JSON; code enforces format, masks secrets before anything leaves the machine, and caps each run at two API calls.
status: published
updatedAt: 2026-11-25
sourceRevision: "056e470"
tags: [python, cli, llm, testing, ci]
role: Sole author — design, implementation, tests, CI and documentation
---

## Overview

`ai-gitgen` reads the staged changes of a Git repository (falling back to the working tree when nothing is staged) and drafts a Conventional Commits message, or a pull-request title and body with *Why*, *What* and *How to Test* sections. It works with OpenAI, Anthropic and Gemini through their REST APIs. I built it alone as a coursework project, and the focus was not calling an API but controlling output quality, cost and data leakage in code.

## Context and problem

Sending a diff to an external API raises three practical issues:

1. **Leakage.** Diffs routinely contain API keys, database passwords or personal data, and a value sent once cannot be recalled.
2. **Format drift.** A model asked for a 72-character subject line will sometimes return 90 characters, or skip a section.
3. **Cost.** Retrying until the format is right multiplies API calls.

## Architecture

```text
git status / git diff ─▶ safety (mask · exclude · limit) ─▶ prompt ─▶ LLM REST call
        ─▶ validate & post-process ─┬─▶ print + save to .git/ai-gitgen/
                                    └─ content missing? one regeneration
```

| Module | Responsibility | Does not depend on |
| --- | --- | --- |
| `git.py` | Repository checks, status and diff collection | AI, prompts |
| `safety.py` | Masking, file exclusion, size limits | Git, AI |
| `prompts.py` | Prompt from convention, context and diff | API, validation |
| `llm/` | Provider-specific REST requests, error mapping | Git, prompt content |
| `drafts.py` | JSON parsing, post-processing, rule checks, rendering | API, Git |
| `app.py` | Orchestration and the two-call limit | — |

A test (`test_structure.py`) checks that these dependency directions hold.

## Implementation and trade-offs

The repository keeps a decision log in `docs/design.md`. The main decisions:

| Decision | Alternative | Reason |
| --- | --- | --- |
| Ask the model for JSON content only; code renders Markdown | Let the model write Markdown | Moves format guarantees into code and avoids paid regenerations |
| Fix length and format deterministically; regenerate only when content is missing | Regenerate on any rule violation | Anything that can be fixed in code is fixed for free |
| Standard-library `urllib` | Three official SDKs | Keeps the REST flow visible, fewer dependencies, easier to add providers |
| Safe mode on by default | Opt-in | A leaked secret cannot be undone |
| Split the line budget fairly across files | Truncate the diff from the top | One large file was consuming the whole budget and dropping config changes entirely |
| Staged changes first | Always the whole working tree | A commit message should describe what will actually be committed |

**Safe mode.** Before a request is built, 14 regular-expression rules mask keys (OpenAI, Anthropic, GitHub, AWS, Google, Slack), JWTs, private keys, URL credentials, `password=` values, email addresses, Korean resident registration numbers, phone numbers and Luhn-valid card numbers. About 20 secret file patterns such as `.env` and `*.pem` are excluded entirely, and transmission is limited to 10 files and 200 lines. `--dry-run` prints exactly what would be sent, without calling the API.

**Errors.** Failures are printed as a cause and a suggested fix instead of a stack trace, with distinct exit codes: configuration (2), Git (3), API (4), output still invalid after regeneration (5).

## My contribution

Everything in the repository: design, implementation, the test suite, the CI workflow, evidence logs and documentation. All commits are mine.

## Validation and results

- **Tests.** `python -m pytest -q` → **125 passed, 45 subtests passed** (re-run on 2026-11-25, Python 3.12, Windows). The suite uses a fake provider and a local HTTP server, so it needs no network, key or money.
- **CI.** GitHub Actions runs the suite on Ubuntu and Windows across Python 3.10–3.14, plus a dry-run safe-mode demo and a PowerShell syntax and smoke check on Windows.
- **Recorded runs.** `docs/evidence/` keeps 17 real CLI outputs: missing key, no changes, temperature and token-limit comparisons, network and authentication errors, a truncated response.
- **Measured usage.** On a 197-line diff, one commit run used about 3,750 input and 120–220 output tokens (recorded in the README for the model used at the time).

The README also shows a generated PR draft that should *not* be used as-is: its test instructions name `pytest`, which the target project does not use. Keeping that example was deliberate; the tool produces drafts that still need review.

## Reproduction

Requires Python 3.10+, Git and [uv](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/maebsy/ai-gitgen.git
cd ai-gitgen
uv sync --group dev
uv run pytest                       # no API key needed
uv run ai-gitgen commit --dry-run   # shows the prompt that would be sent
```

Real generation needs `AI_API_KEY` in the environment. Keys are read only from the environment or a git-ignored `.env`.

## Limitations and next steps

- Regex masking only catches known formats; it does not replace keeping secrets out of the repository.
- Diffs above the size limit are summarized by file name only, so very large changes produce weaker drafts.
- It is not packaged on PyPI; installation is from source.
