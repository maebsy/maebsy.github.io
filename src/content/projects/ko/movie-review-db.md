---
id: movie-review-db
translationKey: project-movie-review-db
locale: ko
translatedFrom: en
title: movie-review-db — 쿼리 결과를 재현할 수 있는 관계형 모델
summary: 영화 평점 서비스를 위한 SQLite 스키마입니다. 잘못된 데이터를 제약 조건으로 막고, 쿼리 17개의 결과를 스크립트로 다시 만들어 CI에서 대조하며, 인덱스 때문에 오히려 느려진 경우까지 벤치마크에 기록했습니다.
status: published
updatedAt: 2026-11-25
sourceRevision: "109bcc7"
tags: [sql, sqlite, data-modeling, python, ci]
role: 단독 작업 — 스키마 설계, 샘플 데이터, 쿼리, 결과 생성, 벤치마크, CI
---

## 개요

회원·영화·장르·리뷰로 이뤄진 작은 영화 평점 서비스를 모델링하고, 정해진 질문에 SQL로 답하는 과제 프로젝트입니다. 필수 쿼리 외에 결과를 재현할 수 있게 만들었습니다. 스크립트가 DB를 다시 만들고 모든 결과 파일을 새로 쓰며, 커밋된 결과가 SQL 출력과 달라지면 CI가 실패합니다.

## 배경과 문제

과제 요구사항은 스키마, 샘플 데이터, 그리고 기본 조회·조인·집계·서브쿼리·수정·인덱스에 걸친 쿼리 15개였습니다. 이런 과제에서 흔한 문제는 손으로 붙여 넣은 결과 파일이 어느새 SQL과 어긋나는 것입니다. 각 결과가 바로 옆 쿼리에서 나왔다는 것을 저장소 자체가 증명하게 하고 싶었습니다.

## 구조

```text
sql/01_schema.sql ─▶ sql/02_seed.sql ─▶ sql/03_queries.sql (Q01~Q17)
        │                                   │
        └──── scripts/run_all.py ───────────┴─▶ results/*.txt
                     └── --check: 임시 DB에서 실행해 커밋된 결과와 대조 (CI)
```

테이블은 `genre`, `member`, `movie`, `review` 네 개입니다. `review`는 회원과 영화를 잇는 테이블로, 1:N 관계 두 개로 N:M 관계를 표현합니다. 샘플 데이터는 장르 10, 회원 15, 영화 22, 리뷰 78행이며 부모 테이블부터 한 트랜잭션으로 넣습니다.

## 구현과 설계 판단

**데이터의 정확성은 제약 조건으로.** PK, FK 3개, `NOT NULL`, `UNIQUE`, `CHECK`로 규칙을 표현했습니다. 별점은 1~5, 회원 상태는 세 가지 중 하나이며, `UNIQUE(member_id, movie_id)`로 한 회원은 한 영화에 리뷰를 하나만 쓸 수 있습니다.

**삭제 정책은 관계마다 선택.** 영화가 쓰고 있는 장르는 지울 수 없고(`RESTRICT`), 회원이나 영화를 지우면 그 리뷰도 지워집니다(`CASCADE`). Q16에서 CASCADE를 확인합니다.

**DATE 타입이 없는 DB에서 실제 날짜만 허용.** SQLite는 날짜를 텍스트로 저장해서 `2024-02-30` 같은 오타도 받아들입니다. 날짜 컬럼마다 `CHECK (date(x, '+0 days') IS x)`를 걸어 올바른 ISO-8601 날짜만 통과하게 했습니다.

**SQLite는 외래키 검사가 기본으로 꺼져 있음.** 모든 SQL 파일 첫 줄에서 `PRAGMA foreign_keys = ON;`을 실행하고, 무결성 시나리오(B07~B14)로 각 제약이 잘못된 입력을 거부하는 것을 보여 줍니다.

**쿼리 범위.** INNER·LEFT 조인(리뷰를 쓰지 않은 회원 포함), 최소 리뷰 수를 `HAVING`으로 건 TOP 5, `strftime`을 쓴 월별 추이, 그리고 "장르마다 평균 별점 1위 영화"를 구하는 CTE와 상관 서브쿼리를 다룹니다. 필수 15개 외의 2개는 추가 쿼리로 구분하고, 필수 쿼리가 요구된 분류와 정확히 맞는지 테스트로 확인합니다.

## 담당 범위

스키마, 샘플 데이터, 쿼리, 결과 생성 스크립트, 테스트, 벤치마크 스크립트, CI, 문서까지 저장소의 모든 작업을 혼자 했습니다.

## 검증과 결과

- **테스트.** `python -m unittest discover -s tests -t .` → **15개 통과**(2026-11-25 재실행, Python 3.12, Windows).
- **결과 재현성.** `python scripts/run_all.py --check` → **결과 파일 33개가 재실행 결과와 일치**. 실행 계획이 들어간 파일 3개는 SQLite 버전마다 표기가 달라 비교에서 제외합니다.
- **CI.** GitHub Actions에서 Ubuntu·Windows와 Python 3.10·3.13·3.14 조합으로 테스트와 결과 대조를 실행합니다.
- **인덱스 벤치마크**(`scripts/bench_index.py`, 작성자 환경: Python 3.14.4, SQLite 3.46.1). 리뷰 200,078행 기준입니다.

| 쿼리 | 인덱스 없음 | `idx_review_movie_id` 있음 |
| --- | --- | --- |
| 영화 1편의 리뷰 조회(`WHERE movie_id = ?`) | 9.93 ms | 0.58 ms (17배 빠름) |
| 영화별 평균(`JOIN` + `GROUP BY`) | 113.72 ms | 231.93 ms (약 2배 느림) |

이 프로젝트에서 가장 배운 것이 많은 결과는 두 번째 줄입니다. 인덱스가 생기자 플래너는 `movie`를 훑으면서 영화마다 인덱스로 `review`를 찾는 계획으로 바꿨고, 이것이 `review`를 한 번 순차 탐색하고 임시 B-tree로 그룹화하는 것보다 느렸습니다. 인덱스는 선택도가 높은 조회에는 효과가 있지만, 그 컬럼을 쓰는 모든 쿼리를 빠르게 해 주지는 않습니다. 시간은 컴퓨터마다 다르므로 실행 계획도 함께 기록했습니다.

## 재현 방법

Python 3.10 이상만 있으면 됩니다(`sqlite3` 모듈은 표준 라이브러리에 포함).

```bash
git clone https://github.com/maebsy/movie-review-db.git
cd movie-review-db
python scripts/run_all.py          # movie_review.db 생성, results/ 다시 쓰기
python scripts/run_all.py --check  # 쓰지 않고 대조만
```

## 한계와 다음 단계

- 데이터는 작고 가상의 것이라 데이터 규모가 아니라 모델링과 SQL을 보여 줍니다.
- 단일 파일 SQLite DB이고 수집 단계가 없습니다. 다음 단계로 외부 데이터셋 적재, 적재 시점의 데이터 품질 검사, 같은 쿼리를 컬럼형 엔진에서 비교하는 작업을 생각하고 있습니다.
