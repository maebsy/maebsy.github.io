import type { Localized } from './profile';

/** Short self-description for About. Plans are stated as plans, not results. */
export const ABOUT_INTRO: Localized = {
  en: 'I study computer science and data statistics and am preparing for a data engineering role, primarily at companies in Japan. Most of my recent work is in Python and SQL: command-line tools, small storage engines, a relational model with reproducible query results, and the backend of a hackathon service. I care about being able to show how a result was checked, so my repositories keep tests, logs and design notes next to the code.',
  ja: 'コンピュータサイエンスとデータ統計学を学びながら、日本企業を中心にデータエンジニア職を目指しています。最近の制作物は主に Python と SQL で、CLI ツール、小規模なストレージエンジン、クエリ結果を再現できるリレーショナルモデル、ハッカソンで開発したサービスのバックエンドなどです。結果をどのように確認したかを示せることを重視しており、各リポジトリにはコードと併せてテスト・実行ログ・設計メモを残しています。',
  ko: '컴퓨터과학과 데이터통계를 공부하며, 일본 기업을 중심으로 데이터 엔지니어 직무를 준비하고 있습니다. 최근 작업은 주로 Python과 SQL로 만든 CLI 도구, 작은 저장 엔진, 쿼리 결과를 재현할 수 있는 관계형 모델, 해커톤 서비스의 백엔드입니다. 결과를 어떻게 확인했는지 보여 줄 수 있어야 한다고 생각해서, 저장소마다 코드 옆에 테스트·실행 로그·설계 문서를 함께 둡니다.',
};

export const ABOUT_FOCUS: Localized = {
  en: 'My public work does not yet include a full data pipeline. The next project I plan to build covers ingestion, modeling, data-quality checks and scheduled, re-runnable jobs on a public dataset. It will be added here once it exists and can be verified.',
  ja: '現時点の公開リポジトリには、データパイプライン全体を扱ったプロジェクトはまだありません。次に、公開データセットを対象として、データの取り込み、モデリング、データ品質チェック、定期実行と再実行を含むプロジェクトを制作する予定です。完成し、検証できた段階でこちらに掲載します。',
  ko: '아직 공개 저장소에는 데이터 파이프라인 전체를 다룬 프로젝트가 없습니다. 다음 프로젝트로 공개 데이터셋을 대상으로 수집, 모델링, 데이터 품질 검사, 주기적 실행과 재실행을 포함한 작업을 만들 계획입니다. 완성하고 검증한 뒤 여기에 추가하겠습니다.',
};

export const RESUME_SUMMARY: Localized = {
  en: 'Computer science and data statistics student working toward data engineering. Builds tested Python and SQL projects with CI, reproducible results and written design notes. In a five-person hackathon team, integrated the security scanners, built the local-LLM explanation pipeline and the MCP server, and set up deployment.',
  ja: 'コンピュータサイエンス・データ統計学を専攻し、データエンジニアを目指しています。Python と SQL を用いて、テスト・CI・再現可能な結果・設計ドキュメントを備えたプロジェクトを制作しています。5名チームのハッカソンでは、セキュリティスキャナの統合、ローカル LLM による解説パイプラインと MCP サーバーの開発、デプロイ環境の構築を担当しました。',
  ko: '컴퓨터과학·데이터통계를 전공하며 데이터 엔지니어를 목표로 하고 있습니다. Python과 SQL로 테스트·CI·재현 가능한 결과·설계 문서를 갖춘 프로젝트를 만듭니다. 5인 해커톤 팀에서 보안 스캐너 통합, 로컬 LLM 해석 파이프라인과 MCP 서버 개발, 배포 환경 구성을 맡았습니다.',
};
