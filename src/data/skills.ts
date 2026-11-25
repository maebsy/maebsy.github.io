/**
 * Skills, each tied to public evidence. No skill without a link.
 * Technologies not yet used in a public repository are NOT listed here;
 * they belong in the private backlog until a project uses them.
 */
import type { Localized } from './profile';

export interface Evidence {
  label: string;
  url: string;
}

export interface Skill {
  id: string;
  name: Localized;
  level: 'used' | 'fundamentals';
  detail: Localized;
  evidence: Evidence[];
}

const R = 'https://github.com/maebsy';

export const SKILLS: Skill[] = [
  {
    id: 'python',
    name: { en: 'Python', ja: 'Python', ko: 'Python' },
    level: 'used',
    detail: {
      en: 'CLIs, data structures, REST clients, test suites with pytest and unittest.',
      ja: 'CLI、データ構造、REST クライアント、pytest・unittest によるテスト。',
      ko: 'CLI, 자료구조, REST 클라이언트, pytest·unittest 테스트.',
    },
    evidence: [
      { label: 'ai-gitgen', url: `${R}/ai-gitgen` },
      { label: 'mini-redis', url: `${R}/mini-redis` },
      { label: '72hours / security_engine', url: `${R}/YMCA-hackathon-2026/tree/main/security_engine` },
    ],
  },
  {
    id: 'sql',
    name: { en: 'SQL and data modeling', ja: 'SQL・データモデリング', ko: 'SQL·데이터 모델링' },
    level: 'used',
    detail: {
      en: 'Normalized schemas, constraints, joins, aggregation, correlated subqueries, CTEs, query plans and indexes.',
      ja: '正規化したスキーマ設計、制約、結合、集計、相関サブクエリ、CTE、実行計画とインデックス。',
      ko: '정규화 스키마, 제약 조건, 조인, 집계, 상관 서브쿼리, CTE, 실행 계획과 인덱스.',
    },
    evidence: [
      { label: 'movie-review-db', url: `${R}/movie-review-db` },
      { label: '72hours / docs/db-erd.md', url: `${R}/YMCA-hackathon-2026/blob/main/docs/db-erd.md` },
    ],
  },
  {
    id: 'testing-ci',
    name: { en: 'Testing and CI', ja: 'テスト・CI', ko: '테스트·CI' },
    level: 'used',
    detail: {
      en: 'GitHub Actions matrices across OS and Python versions; checks that committed results still match a fresh run.',
      ja: 'OS と Python バージョンのマトリクスで GitHub Actions を実行し、コミット済みの結果と再実行結果が一致することを検証しています。',
      ko: 'OS·Python 버전 매트릭스 GitHub Actions, 커밋된 결과가 재실행 결과와 같은지 검사.',
    },
    evidence: [
      { label: 'ai-gitgen / tests.yml', url: `${R}/ai-gitgen/blob/main/.github/workflows/tests.yml` },
      { label: 'movie-review-db / sql.yml', url: `${R}/movie-review-db/blob/main/.github/workflows/sql.yml` },
    ],
  },
  {
    id: 'llm-apps',
    name: { en: 'LLM application integration', ja: 'LLM アプリケーション連携', ko: 'LLM 애플리케이션 연동' },
    level: 'used',
    detail: {
      en: 'Structured output validation, retry limits, local model serving with vLLM, MCP server tools.',
      ja: '構造化出力の検証、再試行回数の制御、vLLM によるローカルモデル配信、MCP サーバーのツール実装。',
      ko: '구조화 출력 검증, 재시도 상한, vLLM 로컬 모델 서빙, MCP 서버 도구.',
    },
    evidence: [
      { label: 'ai-gitgen / drafts.py', url: `${R}/ai-gitgen/blob/main/ai_gitgen/drafts.py` },
      { label: '72hours / docs/llm.md', url: `${R}/YMCA-hackathon-2026/blob/main/docs/llm.md` },
    ],
  },
  {
    id: 'linux-docker',
    name: { en: 'Linux, shell and Docker', ja: 'Linux・シェル・Docker', ko: 'Linux·셸·Docker' },
    level: 'used',
    detail: {
      en: 'Bash automation, cron, log rotation, incident analysis from /proc data, Docker Compose environments.',
      ja: 'Bash による自動化、cron、ログローテーション、/proc データを用いた障害分析、Docker Compose 環境。',
      ko: 'Bash 자동화, cron, 로그 순환, /proc 데이터 기반 장애 분석, Docker Compose 환경.',
    },
    evidence: [
      { label: 'linux-server-ops', url: `${R}/linux-server-ops` },
      { label: 'linux-incident-analysis', url: `${R}/linux-incident-analysis` },
      { label: '72hours / compose.yaml', url: `${R}/YMCA-hackathon-2026/blob/main/compose.yaml` },
    ],
  },
  {
    id: 'aws',
    name: { en: 'AWS', ja: 'AWS', ko: 'AWS' },
    level: 'fundamentals',
    detail: {
      en: 'VPC, subnets, routing, security groups, EC2 and scoped IAM policies, provisioned and torn down with AWS CLI.',
      ja: 'VPC、サブネット、ルーティング、セキュリティグループ、EC2、範囲を限定した IAM ポリシーを AWS CLI で構築・削除。',
      ko: 'VPC, 서브넷, 라우팅, 보안 그룹, EC2, 범위를 제한한 IAM 정책을 AWS CLI로 구성·정리.',
    },
    evidence: [{ label: 'aws-vpc-web-infra', url: `${R}/aws-vpc-web-infra` }],
  },
];
