---
id: ai-gitgen
translationKey: project-ai-gitgen
locale: ko
translatedFrom: en
title: ai-gitgen — git diff로 커밋·PR 초안을 만드는 CLI
summary: git status와 git diff로 커밋 메시지나 PR 설명을 만드는 Python CLI입니다. 모델에게는 JSON으로 내용만 받고 형식은 코드가 보장하며, 보내기 전에 민감정보를 가리고, 실행당 API 호출을 최대 2회로 제한합니다.
status: published
updatedAt: 2026-11-25
sourceRevision: "056e470"
tags: [python, cli, llm, testing, ci]
role: 단독 작업 — 설계, 구현, 테스트, CI, 문서
---

## 개요

`ai-gitgen`은 Git 저장소의 staged 변경(staged 변경이 없으면 작업 트리 변경)을 읽어 Conventional Commits 형식의 커밋 메시지, 또는 *Why*·*What*·*How to Test* 섹션을 갖춘 PR 제목과 본문 초안을 만듭니다. OpenAI, Anthropic, Gemini의 REST API를 지원합니다. 과제로 혼자 만든 프로젝트이며, API를 부르는 것보다 출력 품질·비용·유출을 코드로 제어하는 데 집중했습니다.

## 배경과 문제

diff를 외부 API로 보내면 실제로 세 가지 문제가 생깁니다.

1. **유출.** diff에는 API 키, DB 비밀번호, 개인정보가 자주 섞이고, 한 번 보낸 값은 되돌릴 수 없습니다.
2. **형식 이탈.** 제목을 72자 이내로 요청해도 90자로 오거나 섹션이 빠지는 경우가 있습니다.
3. **비용.** 형식이 맞을 때까지 다시 요청하면 API 호출이 계속 늘어납니다.

## 구조

```text
git status / git diff ─▶ 안전 모드(마스킹 · 제외 · 한도) ─▶ 프롬프트 ─▶ LLM REST 호출
        ─▶ 검증 · 후처리 ─┬─▶ 출력 + .git/ai-gitgen/ 저장
                          └─ 내용이 빠졌을 때만 1회 재생성
```

| 모듈 | 책임 | 의존하지 않는 것 |
| --- | --- | --- |
| `git.py` | 저장소 확인, status·diff 수집 | AI, 프롬프트 |
| `safety.py` | 마스킹, 파일 제외, 전송량 한도 | Git, AI |
| `prompts.py` | 컨벤션·맥락·diff로 프롬프트 구성 | API, 검증 |
| `llm/` | provider별 REST 요청, 오류 변환 | Git, 프롬프트 내용 |
| `drafts.py` | JSON 해석, 후처리, 규칙 검증, 렌더링 | API, Git |
| `app.py` | 단계 순서와 호출 상한 | — |

이 의존 방향이 지켜지는지는 테스트(`test_structure.py`)로 확인합니다.

## 구현과 설계 판단

저장소의 `docs/design.md`에 설계 결정 기록을 남겼습니다. 주요 결정은 다음과 같습니다.

| 결정 | 대안 | 이유 |
| --- | --- | --- |
| 모델에게는 JSON으로 내용만 받고 Markdown은 코드가 생성 | 모델이 Markdown을 직접 작성 | 형식 보장을 코드로 옮겨 유료 재생성을 줄임 |
| 길이·형식은 코드로 고치고, 내용이 빠졌을 때만 재생성 | 규칙 위반마다 재생성 | 코드로 고칠 수 있는 것은 무료로 고침 |
| 표준 라이브러리 `urllib` | 공식 SDK 3종 | REST 흐름이 코드에 드러나고 의존성이 적으며 provider 추가가 쉬움 |
| 안전 모드 기본 켜짐 | 옵션으로만 켜기 | 비밀값 유출은 되돌릴 수 없음 |
| 줄 수 한도를 파일별로 공평하게 배분 | diff 앞에서부터 자르기 | 큰 파일 하나가 한도를 다 써서 설정 파일 변경이 통째로 빠지는 문제를 발견 |
| staged 변경 우선 수집 | 항상 작업 트리 전체 | 커밋 메시지는 실제로 커밋될 내용을 설명해야 함 |

**안전 모드.** 요청을 만들기 전에 정규식 14종으로 각종 API 키(OpenAI, Anthropic, GitHub, AWS, Google, Slack), JWT, 개인 키, URL 안의 인증 정보, `password=` 값, 이메일, 주민등록번호, 휴대폰 번호, Luhn 검사를 통과하는 카드 번호를 가립니다. `.env`, `*.pem` 등 비밀 파일 약 20종은 아예 보내지 않고, 전송량은 파일 10개·200줄로 제한합니다. `--dry-run`을 쓰면 API를 호출하지 않고 보낼 내용을 그대로 확인할 수 있습니다.

**오류 처리.** 스택트레이스 대신 원인과 해결 방법을 출력하고, 종료 코드를 설정 오류(2), Git 오류(3), API 오류(4), 재생성 후에도 형식 미충족(5)으로 나눴습니다.

## 담당 범위

설계, 구현, 테스트, CI 워크플로, 실행 로그 수집, 문서까지 저장소의 모든 작업을 혼자 했습니다. 커밋도 모두 제 것입니다.

## 검증과 결과

- **테스트.** `python -m pytest -q` → **125개 통과, 서브테스트 45개 통과**(2026-11-25 재실행, Python 3.12, Windows). 가짜 provider와 로컬 HTTP 서버를 써서 네트워크·API 키·비용 없이 실행됩니다.
- **CI.** GitHub Actions에서 Ubuntu·Windows × Python 3.10~3.14 조합으로 테스트하고, 안전 모드 dry-run 데모와 Windows의 PowerShell 문법 검사·스모크 테스트도 실행합니다.
- **실행 기록.** `docs/evidence/`에 실제 CLI 출력 17종을 남겼습니다(키 없음, 변경 없음, temperature와 토큰 한도 비교, 네트워크·인증 오류, 응답 잘림 등).
- **사용량 실측.** 197줄 diff 기준 커밋 메시지 1회에 입력 약 3,750, 출력 120~220 토큰이었습니다(당시 사용한 모델 기준으로 README에 기록).

README에는 그대로 쓰면 안 되는 PR 초안 예시도 일부러 남겼습니다. 테스트 방법에 `pytest`가 적혀 있지만 대상 프로젝트는 pytest를 쓰지 않습니다. 이 도구가 만드는 것은 초안이고 검토가 필요하다는 점을 보여 주기 위해서입니다.

## 재현 방법

Python 3.10 이상, Git, [uv](https://docs.astral.sh/uv/)가 필요합니다.

```bash
git clone https://github.com/maebsy/ai-gitgen.git
cd ai-gitgen
uv sync --group dev
uv run pytest                       # API 키 불필요
uv run ai-gitgen commit --dry-run   # 보낼 프롬프트 확인
```

실제 생성에는 환경변수 `AI_API_KEY`가 필요합니다. 키는 환경변수나 Git에 올라가지 않는 `.env`에서만 읽습니다.

## 한계와 다음 단계

- 정규식 마스킹은 알려진 형식만 잡습니다. 비밀값을 저장소에 넣지 않는 것이 먼저입니다.
- 한도를 넘는 diff는 파일 이름만 보내므로, 큰 변경에서는 초안 품질이 떨어집니다.
- PyPI에 배포하지 않았고 소스로만 설치합니다.
