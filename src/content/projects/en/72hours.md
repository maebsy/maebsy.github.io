---
id: 72hours
translationKey: project-72hours
locale: en
title: 72hours — security review for AI-assisted developers
summary: A hackathon service that scans a public GitHub repository, explains the findings in plain language, hands reviewed fix instructions to the user's coding agent over MCP, and re-scans to confirm. I worked on the scanning engine, the LLM pipeline, the MCP server and deployment.
status: published
updatedAt: 2026-11-25
sourceRevision: "47f8c64"
tags: [python, fastapi, llm, mcp, security, hackathon]
role: Scanner integration, local-LLM explanation pipeline and risk scoring, MCP server, server setup and automated deployment, team workflow rules
---

## Overview

72hours was built in four days at the Codyssey AI Hackathon 2026 by a team of five. It targets developers who ship small services with AI coding tools but are not used to security review. Given a public GitHub URL, it runs several scanners, normalizes their output, has a locally hosted LLM explain each finding, passes reviewed fix instructions to the user's own coding agent through MCP, and re-scans after the user pushes a fix.

This page describes the parts I built. Teammates' work is credited where it touches mine.

## Context and problem

Code generated with AI tools often ships with database admin keys in source, unauthenticated write endpoints, or tables without row-level security. The developers affected can run a scanner, but then face three problems: dozens of warnings with no order, no clear way to fix them, and no reliable way to tell whether a fix actually worked.

Constraints during the event:

- One L4 GPU for model inference, so LLM work per finding is measured in minutes, not seconds.
- Risk levels and shell commands had to be reproducible; a language model was not allowed to decide them.
- The service must never modify user code itself. Fixes happen in the user's environment, with their approval.

## Architecture

```text
browser ── Next.js ── FastAPI ──┬── security engine ── Opengrep / OSV-Scanner / Gitleaks / config checks
                                ├── LLM pipeline (vLLM, Qwen3.8-27B): context → Blue → Red
                                └── verification sandbox (Docker, demo targets only)
user's coding agent ── remote MCP server ── FastAPI
```

The diagram follows the repository README. The scanning engine produces one JSON document per scan. The LLM pipeline consumes it, and the MCP server exposes results and approved fix instructions to agents such as Claude Code or Codex.

## Implementation and trade-offs

**One result format for several scanners.** Each scanner reports in its own shape. The engine runs them concurrently, maps every result to a common schema, and assigns a fingerprint that does not depend on line numbers, so a finding that moves after an edit is still recognized as the same issue. Comparing two scans yields four states: new, persisting, resolved, unverifiable. "Unverifiable" exists so that a scanner failure is never reported as a fix.

**Code decides, the model explains.** Risk is decided by code that applies the CISA SSVC decision table to context signals and threat data (CISA KEV, FIRST EPSS). Shell commands come only from tested templates per OS. The model writes the explanation and the fix instruction. That keeps the same input producing the same priority, and keeps the model from inventing commands.

**Blue writes, Red reviews.** A "Blue" pass drafts the explanation and fix instruction; a "Red" pass reviews it for bypasses, broken functionality and omissions. Rewrites are capped, and anything that does not pass is marked for manual review. A Red "pass" is a model judgement, not proof; whether an attack is actually blocked is decided only by the separate execution check, which exists for demo targets.

**Fixes go through MCP, not through our server.** The MCP server only forwards fix instructions that passed Red review and match the current scan's fingerprint. It rejects duplicate submissions while a verification run is in progress. The user's agent edits code locally; the user decides whether to push.

**Deployment that does not drop requests.** I set up automatic deployment from `main` with a job queue, draining of in-flight work, and rollback of an interrupted release on the next run.

## My contribution

From the merged pull requests and the team table in the README:

- Security engine integration and real-scanner verification on Windows ([#37](https://github.com/maebsy/YMCA-hackathon-2026/pull/37)).
- Local-LLM explanation module with context analysis, SSVC risk and per-OS guidance ([#20](https://github.com/maebsy/YMCA-hackathon-2026/pull/20), [#35](https://github.com/maebsy/YMCA-hackathon-2026/pull/35)), and raising GPU concurrency from 2 to 6 ([#146](https://github.com/maebsy/YMCA-hackathon-2026/pull/146)).
- MCP server, from a standalone version to the full scan → fix → re-scan → verify flow ([#23](https://github.com/maebsy/YMCA-hackathon-2026/pull/23), [#76](https://github.com/maebsy/YMCA-hackathon-2026/pull/76), [#141](https://github.com/maebsy/YMCA-hackathon-2026/pull/141)).
- Server configuration, Docker Compose environments and automated deployment ([#44](https://github.com/maebsy/YMCA-hackathon-2026/pull/44), [#120](https://github.com/maebsy/YMCA-hackathon-2026/pull/120), [#152](https://github.com/maebsy/YMCA-hackathon-2026/pull/152)).
- Team workflow: commit, branch and secret checks enforced by hooks and CI ([#2](https://github.com/maebsy/YMCA-hackathon-2026/pull/2), [#4](https://github.com/maebsy/YMCA-hackathon-2026/pull/4)).

Not mine: the web front end, the plain-language report and incident-report drafts, the execution sandbox for Red–Blue output, and the backend skeleton with scan-result storage were built by teammates. (I wrote the database schema contract in [#36](https://github.com/maebsy/YMCA-hackathon-2026/pull/36).)

## Validation and results

These results come from the repository and apply only to the stated targets:

- **Detection on one demo repository.** Against an answer key for [`cafe-order-demo`](https://github.com/maebsy/cafe-order-demo), a deliberately vulnerable site with fake keys made for the demo: 15 detected, 1 missed, 0 false positives. The miss was an SQL injection hidden behind a `// nosemgrep` comment. This is not a general detection rate.
- **Before/after execution on a demo target.** SQL injection and reflected XSS both succeeded before the fix and were blocked after it, with functional tests passing on both sides and four isolation checks on the sandbox (local Docker run, 2026-10-31).
- **Review caught real bugs.** In #141, a reviewer reproduced duplicate job submissions when the verification tool was called mid-run, and a `TypeError` that appeared when merged with another PR. Both were fixed with regression tests before merging.
- **CI.** Each PR ran backend, front-end, engine (with real scanners), MCP and deployment tests in GitHub Actions when the related files changed.

## Reproduction

The repository README documents a local setup without Docker: Python 3.12, Node.js 24, the three scanners, and optionally vLLM with a 24 GB-class GPU. Without the GPU, the engine results and rule-based explanations still work.

```bash
git clone https://github.com/maebsy/YMCA-hackathon-2026.git
cd YMCA-hackathon-2026
cp .env.example .env
python -m security_engine doctor   # checks which scanners are installed
```

The public demo URL used during the event is no longer running (checked 2026-11-25).

## Limitations and next steps

- Only the default branch of public repositories is scanned, and secrets are checked in current files only, not in git history.
- LLM analysis takes minutes per finding on one L4 GPU, so only the top five findings are analyzed.
- Execution checks exist only for demo targets, not for user repositories.
- Re-scans see pushed commits only.

The part most relevant to data engineering is the result model: normalizing heterogeneous tool output into one schema, stable fingerprints, and an explicit "unverifiable" state instead of silently treating missing data as success.
