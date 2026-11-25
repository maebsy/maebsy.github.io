/**
 * Locale-independent project facts. Narrative text per locale lives in
 * `src/content/projects/{en,ja,ko}/<id>.md` and is linked by `id`.
 *
 * Every number here must come from the repository at `revision` or from a
 * command re-run on `checkedOn`. Unmeasured numbers are not recorded.
 */
import type { Localized } from './profile';

export type ProjectKind = 'coursework' | 'hackathon' | 'personal';
export type RepoStatus = 'active' | 'archived' | 'completed';

export interface Verification {
  /** Exact command, as run. */
  command: string;
  /** Observed result, short and literal. */
  result: Localized;
  checkedOn: string; // YYYY-MM-DD
  environment: string;
}

export interface ProjectFacts {
  id: string;
  repo: string;
  kind: ProjectKind;
  status: RepoStatus;
  period: { start: string; end: string }; // YYYY-MM-DD, from commit history
  teamSize: number; // 1 = solo
  revision: string; // short SHA the case study was written against
  stack: string[];
  featured: boolean;
  order: number;
  verification: Verification[];
  /** One-line description for lists and the GitHub README. */
  oneLiner: Localized;
}

export const PROJECTS: ProjectFacts[] = [
  {
    id: '72hours',
    repo: 'https://github.com/maebsy/YMCA-hackathon-2026',
    kind: 'hackathon',
    status: 'archived',
    period: { start: '2026-10-29', end: '2026-11-01' },
    teamSize: 5,
    revision: '47f8c64',
    stack: ['Python', 'FastAPI', 'PostgreSQL / SQLite', 'vLLM', 'MCP', 'Docker', 'GitHub Actions'],
    featured: true,
    order: 1,
    verification: [
      {
        command:
          'gh pr list -R maebsy/YMCA-hackathon-2026 --state merged --limit 500 --json number --jq length (with and without --author maebsy)',
        result: {
          en: '33 of 89 merged pull requests authored by me',
          ja: 'マージ済み PR 89件のうち 33件を作成',
          ko: '머지된 PR 89건 중 33건 작성',
        },
        checkedOn: '2026-11-25',
        environment: 'GitHub API',
      },
    ],
    oneLiner: {
      en: 'Security review service for AI-assisted developers: scanner result normalization, a local-LLM explanation pipeline and an MCP server. Hackathon team of five.',
      ja: 'AI コーディングツール利用者向けのセキュリティ点検サービス。スキャナ結果の正規化、ローカル LLM による解説パイプライン、MCP サーバーを担当（5名チームのハッカソン作品）。',
      ko: 'AI 코딩 도구 사용자를 위한 보안 점검 서비스. 스캐너 결과 정규화, 로컬 LLM 해석 파이프라인, MCP 서버를 담당(5인 해커톤 팀).',
    },
  },
  {
    id: 'ai-gitgen',
    repo: 'https://github.com/maebsy/ai-gitgen',
    kind: 'coursework',
    status: 'archived',
    period: { start: '2026-10-12', end: '2026-10-20' },
    teamSize: 1,
    revision: '056e470',
    stack: ['Python', 'pytest', 'uv', 'GitHub Actions', 'REST (urllib)'],
    featured: true,
    order: 2,
    verification: [
      {
        command: 'python -m pytest -q',
        result: {
          en: '125 passed, 45 subtests passed',
          ja: '125件成功、サブテスト 45件成功',
          ko: '125개 통과, 서브테스트 45개 통과',
        },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
    ],
    oneLiner: {
      en: 'CLI that drafts commit messages and PR descriptions from git diff, with secret masking on by default and at most two API calls per run.',
      ja: 'git diff からコミットメッセージと PR 説明文の下書きを生成する CLI。機密情報のマスキングを既定で有効にし、API 呼び出しは 1回の実行につき最大 2回に制限。',
      ko: 'git diff로 커밋 메시지와 PR 설명 초안을 만드는 CLI. 민감정보 마스킹을 기본으로 켜고, 실행당 API 호출을 최대 2회로 제한.',
    },
  },
  {
    id: 'movie-review-db',
    repo: 'https://github.com/maebsy/movie-review-db',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-11-10' },
    teamSize: 1,
    revision: '109bcc7',
    stack: ['SQL', 'SQLite', 'Python', 'GitHub Actions'],
    featured: true,
    order: 3,
    verification: [
      {
        command: 'python -m unittest discover -s tests -t .',
        result: { en: '15 tests OK', ja: '15件成功', ko: '15개 통과' },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
      {
        command: 'python scripts/run_all.py --check',
        result: {
          en: '33 result files match fresh SQL output',
          ja: '結果ファイル 33件が SQL の再実行結果と一致',
          ko: '결과 파일 33개가 SQL 재실행 결과와 일치',
        },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
    ],
    oneLiner: {
      en: 'Relational model for a movie-rating service in SQLite: constraints, 17 queries, results regenerated and checked in CI, and an index benchmark that includes a slowdown.',
      ja: '映画レビューサービスのリレーショナルモデル（SQLite）。制約設計、クエリ 17本、CI による結果の再生成・照合、インデックスで遅くなったケースも含むベンチマーク。',
      ko: '영화 평점 서비스의 관계형 모델(SQLite). 제약 조건 설계, 쿼리 17개, CI에서 결과 재생성·대조, 인덱스로 느려진 경우까지 기록한 벤치마크.',
    },
  },
  {
    id: 'mini-redis',
    repo: 'https://github.com/maebsy/mini-redis',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-11-09' },
    teamSize: 1,
    revision: 'ffe2713',
    stack: ['Python'],
    featured: false,
    order: 10,
    verification: [
      {
        command: 'python -m unittest',
        result: { en: '106 tests OK', ja: '106件成功', ko: '106개 통과' },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
    ],
    oneLiner: {
      en: 'In-memory key-value store with a hand-written hash map, doubly linked list and min-heap for LRU eviction and TTL expiry.',
      ja: 'ハッシュマップ・双方向連結リスト・最小ヒープを自作し、LRU 削除と TTL 失効を実装したインメモリ KVS。',
      ko: '해시맵·이중 연결 리스트·최소 힙을 직접 구현해 LRU 제거와 TTL 만료를 지원하는 인메모리 KV 저장소.',
    },
  },
  {
    id: 'budget-cli',
    repo: 'https://github.com/maebsy/budget-cli',
    kind: 'coursework',
    status: 'archived',
    period: { start: '2026-10-12', end: '2026-11-09' },
    teamSize: 1,
    revision: '3702643',
    stack: ['Python'],
    featured: false,
    order: 11,
    verification: [
      {
        command: 'python -m unittest',
        result: { en: '109 tests OK', ja: '109件成功', ko: '109개 통과' },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
    ],
    oneLiner: {
      en: 'Standard-library budget tracker: streaming file reads with generators, atomic writes via os.replace, CSV import and export.',
      ja: '標準ライブラリのみの家計簿 CLI。ジェネレータによるストリーミング読み込み、os.replace によるアトミックな書き込み、CSV の入出力。',
      ko: '표준 라이브러리만 쓴 가계부 CLI. 제너레이터 스트리밍 읽기, os.replace 원자적 쓰기, CSV 가져오기·내보내기.',
    },
  },
  {
    id: 'mini-git',
    repo: 'https://github.com/maebsy/mini-git',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-10-20' },
    teamSize: 1,
    revision: '1164c26',
    stack: ['Python'],
    featured: false,
    order: 12,
    verification: [
      {
        command: 'python -m unittest',
        result: { en: '60 tests OK', ja: '60件成功', ko: '60개 통과' },
        checkedOn: '2026-11-25',
        environment: 'Python 3.12, Windows 10',
      },
    ],
    oneLiner: {
      en: 'Commit history modeled as a DAG, with BFS path finding, ancestor queries, an inverted index and four hand-written sorts.',
      ja: 'コミット履歴を DAG として表現し、BFS による経路探索、祖先探索、転置インデックス、ソート 4種を自作。',
      ko: '커밋 이력을 DAG로 표현하고 BFS 경로 탐색, 조상 탐색, 역색인, 정렬 4종을 직접 구현.',
    },
  },
  {
    id: 'linux-server-ops',
    repo: 'https://github.com/maebsy/linux-server-ops',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-11-10' },
    teamSize: 1,
    revision: '55c4bbe',
    stack: ['Bash', 'Linux'],
    featured: false,
    order: 13,
    verification: [],
    oneLiner: {
      en: 'Idempotent server hardening scripts (SSH, firewall, ACL) and a /proc-based monitoring script scheduled with cron.',
      ja: '冪等なサーバー設定スクリプト（SSH・ファイアウォール・ACL）と、/proc を読む監視スクリプトの cron 運用。',
      ko: '멱등한 서버 보안 설정 스크립트(SSH·방화벽·ACL)와 /proc 기반 모니터링 스크립트의 cron 자동화.',
    },
  },
  {
    id: 'linux-incident-analysis',
    repo: 'https://github.com/maebsy/linux-incident-analysis',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-11-10' },
    teamSize: 1,
    revision: '43cf89d',
    stack: ['Bash', 'Linux'],
    featured: false,
    order: 14,
    verification: [],
    oneLiner: {
      en: 'Root-cause reports for reproduced OOM, CPU-spike and deadlock incidents, built from raw monitoring logs.',
      ja: '再現した OOM・CPU 高負荷・デッドロック障害について、監視ログをもとに原因分析レポートを作成。',
      ko: '재현한 OOM·CPU 과점유·데드락 장애를 관제 로그로 분석한 원인 분석 리포트.',
    },
  },
  {
    id: 'aws-vpc-web-infra',
    repo: 'https://github.com/maebsy/aws-vpc-web-infra',
    kind: 'coursework',
    status: 'active',
    period: { start: '2026-10-12', end: '2026-10-22' },
    teamSize: 1,
    revision: '18d251b',
    stack: ['AWS (VPC, EC2, IAM)', 'AWS CLI', 'Bash'],
    featured: false,
    order: 15,
    verification: [],
    oneLiner: {
      en: 'Custom VPC, security groups and a least-privilege IAM policy provisioned with AWS CLI scripts, plus verification and cleanup scripts.',
      ja: 'AWS CLI スクリプトで VPC・セキュリティグループ・最小権限の IAM ポリシーを構築し、検証・削除スクリプトも用意。',
      ko: 'AWS CLI 스크립트로 VPC·보안 그룹·최소 권한 IAM 정책을 구성하고 검증·정리 스크립트까지 작성.',
    },
  },
];

export function getProject(id: string): ProjectFacts {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown project id: ${id}`);
  return p;
}

export const FEATURED = PROJECTS.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const OTHER = PROJECTS.filter((p) => !p.featured).sort((a, b) => a.order - b.order);
