/**
 * UI strings only (navigation, labels, notices). Page content lives in
 * `src/content/**` and verified facts in `src/data/**`.
 *
 * Every key must exist in every locale; `tests/unit/i18n.test.ts` enforces it.
 */
import type { Locale } from './locales';

const en = {
  'site.description':
    'Portfolio of maebsy: projects, writing and résumé of a computer science and data statistics student working toward data engineering.',
  'skip': 'Skip to content',
  'nav.label': 'Main',
  'nav.home': 'Home',
  'nav.projects': 'Projects',
  'nav.blog': 'Blog',
  'nav.notes': 'Notes',
  'nav.research': 'Research',
  'nav.about': 'About',
  'nav.resume': 'Resume',
  'lang.label': 'Language',
  'lang.missing': 'Not translated yet',
  'theme.toggle': 'Toggle dark mode',
  'theme.light': 'Light',
  'theme.dark': 'Dark',

  'home.title': 'Data engineering portfolio',
  'home.role': 'Computer Science & Data Statistics student focused on data engineering.',
  'home.lede':
    'Interested in reliable data pipelines, data modeling and developer tooling. Each project below links to its source code and to the command I used to verify it.',
  'home.cta.projects': 'View projects',
  'home.cta.resume': 'Resume',
  'home.selected': 'Selected projects',
  'home.skills': 'Skills and evidence',
  'home.skills.note': 'Skills are listed only where a public repository shows them in use.',
  'home.timeline': 'Education and activities',
  'home.writing': 'Recent writing',
  'home.contact': 'Contact',
  'home.contact.text': 'The quickest way to reach me is through GitHub.',
  'home.allProjects': 'All projects',

  'projects.title': 'Projects',
  'projects.lede':
    'Case studies are written from the repositories themselves: what I built, what I did not, and how the result was checked.',
  'projects.featured': 'Case studies',
  'projects.other': 'Other work',
  'projects.other.note': 'Smaller coursework projects. Each repository contains its own README, tests and design notes.',

  'project.status': 'Status',
  'project.period': 'Period',
  'project.team': 'Team',
  'project.role': 'My role',
  'project.stack': 'Stack',
  'project.repo': 'Repository',
  'project.evidence': 'Verification',
  'project.revision': 'Revision',
  'project.checkedOn': 'checked on',
  'project.solo': 'Solo',
  'project.teamOf': 'Team of {n}',
  'project.kind.coursework': 'Coursework',
  'project.kind.hackathon': 'Hackathon',
  'project.kind.personal': 'Personal',
  'project.status.active': 'Maintained',
  'project.status.archived': 'Archived',
  'project.status.completed': 'Completed',
  'project.toc': 'On this page',
  'project.back': 'Back to projects',
  'project.readCase': 'Read case study',

  'blog.title': 'Blog',
  'blog.lede': 'Write-ups of problems I ran into: cause, fix, how I verified it, and what I learned.',
  'blog.empty': 'No posts yet.',
  'blog.otherLang': 'Available in another language',
  'post.published': 'Published',
  'post.updated': 'Updated',
  'post.untranslated': 'This article has not been translated. The original is shown below.',

  'about.title': 'About',
  'about.education': 'Education',
  'about.activities': 'Activities',
  'about.skills': 'Technical skills',
  'about.focus': 'What I am working toward',
  'about.contact': 'Contact',

  'resume.title': 'Resume',
  'resume.print': 'Print / save as PDF',
  'resume.note':
    'This web résumé lists verified facts only. It is not a Japanese-format 履歴書 or 職務経歴書.',
  'resume.summary': 'Summary',
  'resume.projects': 'Projects',
  'resume.skills': 'Skills',
  'resume.education': 'Education',
  'resume.activities': 'Activities',
  'resume.links': 'Links',

  'skill.level.used': 'Used in projects',
  'skill.level.fundamentals': 'Fundamentals',

  'notice.preview':
    'Preview build. Content marked for review is visible here and is excluded from the public build.',
  'notice.unverified': 'Unverified',
  'notice.review': 'In review',

  'footer.source': 'Site source',
  'footer.built': 'Built with Astro. No tracking.',
  'footer.updated': 'Last updated',

  '404.title': 'Page not found',
  '404.text': 'The page you are looking for does not exist or has moved.',
  '404.home': 'Go to the home page',
};

export type UIKey = keyof typeof en;

const ja: Record<UIKey, string> = {
  'site.description':
    'maebsy のポートフォリオです。データエンジニアを目指し、コンピュータサイエンスとデータ統計学を学ぶ学生の制作物・技術記事・経歴を掲載しています。',
  'skip': '本文へスキップ',
  'nav.label': 'メイン',
  'nav.home': 'ホーム',
  'nav.projects': '制作物',
  'nav.blog': 'ブログ',
  'nav.notes': 'ノート',
  'nav.research': 'リサーチ',
  'nav.about': 'プロフィール',
  'nav.resume': '経歴書',
  'lang.label': '言語',
  'lang.missing': '未翻訳',
  'theme.toggle': 'ダークモードの切り替え',
  'theme.light': 'ライト',
  'theme.dark': 'ダーク',

  'home.title': 'データエンジニアリング・ポートフォリオ',
  'home.role': 'コンピュータサイエンスとデータ統計学を専攻し、データエンジニアを目指しています。',
  'home.lede':
    '信頼性の高いデータパイプライン、データモデリング、開発者向けツールに関心があります。各プロジェクトには、ソースコードと動作確認に使用したコマンドを併記しています。',
  'home.cta.projects': '制作物を見る',
  'home.cta.resume': '経歴書',
  'home.selected': '主な制作物',
  'home.skills': 'スキルと根拠',
  'home.skills.note': '公開リポジトリで使用を確認できる技術のみを掲載しています。',
  'home.timeline': '学歴・活動',
  'home.writing': '最新記事',
  'home.contact': '連絡先',
  'home.contact.text': 'ご連絡は GitHub からお願いいたします。',
  'home.allProjects': 'すべての制作物',

  'projects.title': '制作物',
  'projects.lede':
    '各ケーススタディはリポジトリの内容に基づいて記載しています。自分が担当した範囲・担当していない範囲と、結果の確認方法を明記しています。',
  'projects.featured': 'ケーススタディ',
  'projects.other': 'その他の制作物',
  'projects.other.note': '小規模な学習課題です。各リポジトリに README、テスト、設計メモがあります。',

  'project.status': '状態',
  'project.period': '期間',
  'project.team': '体制',
  'project.role': '担当',
  'project.stack': '使用技術',
  'project.repo': 'リポジトリ',
  'project.evidence': '検証',
  'project.revision': 'リビジョン',
  'project.checkedOn': '確認日',
  'project.solo': '個人開発',
  'project.teamOf': 'チーム開発（{n}名）',
  'project.kind.coursework': '学習課題',
  'project.kind.hackathon': 'ハッカソン',
  'project.kind.personal': '個人プロジェクト',
  'project.status.active': 'メンテナンス中',
  'project.status.archived': 'アーカイブ済み',
  'project.status.completed': '完了',
  'project.toc': '目次',
  'project.back': '制作物一覧へ戻る',
  'project.readCase': 'ケーススタディを読む',

  'blog.title': 'ブログ',
  'blog.lede': '開発中に直面した問題について、原因・解決策・検証方法・学びをまとめています。',
  'blog.empty': '記事はまだありません。',
  'blog.otherLang': '他の言語で公開中の記事',
  'post.published': '公開日',
  'post.updated': '更新日',
  'post.untranslated': 'この記事は未翻訳です。以下は原文です。',

  'about.title': 'プロフィール',
  'about.education': '学歴',
  'about.activities': '活動',
  'about.skills': '技術スキル',
  'about.focus': '今後の目標',
  'about.contact': '連絡先',

  'resume.title': '経歴書',
  'resume.print': '印刷・PDF 保存',
  'resume.note':
    'この Web 経歴書には確認済みの事実のみを記載しています。日本の履歴書・職務経歴書の書式とは異なります。',
  'resume.summary': '概要',
  'resume.projects': '開発経験',
  'resume.skills': 'スキル',
  'resume.education': '学歴',
  'resume.activities': '活動',
  'resume.links': 'リンク',

  'skill.level.used': 'プロジェクトで使用',
  'skill.level.fundamentals': '基礎',

  'notice.preview':
    'プレビュー版です。確認中のコンテンツが表示されています。公開版には含まれません。',
  'notice.unverified': '要確認',
  'notice.review': '確認中',

  'footer.source': 'サイトのソースコード',
  'footer.built': 'Astro で構築。トラッキングは行っていません。',
  'footer.updated': '最終更新',

  '404.title': 'ページが見つかりません',
  '404.text': 'お探しのページは存在しないか、移動した可能性があります。',
  '404.home': 'ホームへ戻る',
};

const ko: Record<UIKey, string> = {
  'site.description':
    'maebsy의 포트폴리오입니다. 데이터 엔지니어를 목표로 하는 컴퓨터과학·데이터통계 전공 학생의 프로젝트, 글, 이력을 정리했습니다.',
  'skip': '본문으로 건너뛰기',
  'nav.label': '주 메뉴',
  'nav.home': '홈',
  'nav.projects': '프로젝트',
  'nav.blog': '블로그',
  'nav.notes': '노트',
  'nav.research': '리서치',
  'nav.about': '소개',
  'nav.resume': '이력서',
  'lang.label': '언어',
  'lang.missing': '번역 없음',
  'theme.toggle': '다크 모드 전환',
  'theme.light': '라이트',
  'theme.dark': '다크',

  'home.title': '데이터 엔지니어링 포트폴리오',
  'home.role': '컴퓨터과학과 데이터통계학을 전공하며 데이터 엔지니어를 목표로 공부하고 있습니다.',
  'home.lede':
    '신뢰할 수 있는 데이터 파이프라인, 데이터 모델링, 개발자 도구에 관심이 있습니다. 아래 프로젝트마다 소스 코드와 검증에 사용한 명령을 함께 적었습니다.',
  'home.cta.projects': '프로젝트 보기',
  'home.cta.resume': '이력서',
  'home.selected': '대표 프로젝트',
  'home.skills': '기술과 근거',
  'home.skills.note': '공개 저장소에서 실제 사용을 확인할 수 있는 기술만 적었습니다.',
  'home.timeline': '학력·활동',
  'home.writing': '최근 글',
  'home.contact': '연락처',
  'home.contact.text': '연락은 GitHub로 부탁드립니다.',
  'home.allProjects': '전체 프로젝트',

  'projects.title': '프로젝트',
  'projects.lede':
    '케이스 스터디는 저장소 내용을 근거로 작성했습니다. 직접 한 일과 하지 않은 일, 결과를 확인한 방법을 구분해 적었습니다.',
  'projects.featured': '케이스 스터디',
  'projects.other': '기타 작업',
  'projects.other.note': '규모가 작은 과제 프로젝트입니다. 저장소마다 README, 테스트, 설계 문서가 있습니다.',

  'project.status': '상태',
  'project.period': '기간',
  'project.team': '구성',
  'project.role': '담당',
  'project.stack': '기술',
  'project.repo': '저장소',
  'project.evidence': '검증',
  'project.revision': '리비전',
  'project.checkedOn': '확인일',
  'project.solo': '개인',
  'project.teamOf': '팀 프로젝트({n}명)',
  'project.kind.coursework': '과제',
  'project.kind.hackathon': '해커톤',
  'project.kind.personal': '개인 프로젝트',
  'project.status.active': '유지보수 중',
  'project.status.archived': '보관됨',
  'project.status.completed': '완료',
  'project.toc': '목차',
  'project.back': '프로젝트 목록으로',
  'project.readCase': '케이스 스터디 읽기',

  'blog.title': '블로그',
  'blog.lede': '개발하며 부딪힌 문제를 원인, 해결, 검증, 배운 점 순서로 정리합니다.',
  'blog.empty': '아직 글이 없습니다.',
  'blog.otherLang': '다른 언어로 공개된 글',
  'post.published': '게시일',
  'post.updated': '수정일',
  'post.untranslated': '이 글은 아직 번역되지 않았습니다. 아래는 원문입니다.',

  'about.title': '소개',
  'about.education': '학력',
  'about.activities': '활동',
  'about.skills': '기술',
  'about.focus': '앞으로의 목표',
  'about.contact': '연락처',

  'resume.title': '이력서',
  'resume.print': '인쇄 / PDF 저장',
  'resume.note': '이 웹 이력서에는 확인된 사실만 적었습니다.',
  'resume.summary': '요약',
  'resume.projects': '프로젝트',
  'resume.skills': '기술',
  'resume.education': '학력',
  'resume.activities': '활동',
  'resume.links': '링크',

  'skill.level.used': '프로젝트에서 사용',
  'skill.level.fundamentals': '기초',

  'notice.preview': '미리보기 빌드입니다. 검토 중인 내용이 보이며, 공개 빌드에서는 제외됩니다.',
  'notice.unverified': '확인 필요',
  'notice.review': '검토 중',

  'footer.source': '사이트 소스',
  'footer.built': 'Astro로 만들었습니다. 추적 도구를 쓰지 않습니다.',
  'footer.updated': '최종 수정',

  '404.title': '페이지를 찾을 수 없습니다',
  '404.text': '찾으시는 페이지가 없거나 주소가 바뀌었습니다.',
  '404.home': '홈으로 가기',
};

export const UI: Record<Locale, Record<UIKey, string>> = { en, ja, ko };

export function t(locale: Locale, key: UIKey, vars: Record<string, string | number> = {}): string {
  let s = UI[locale][key];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function useT(locale: Locale) {
  return (key: UIKey, vars?: Record<string, string | number>) => t(locale, key, vars);
}
