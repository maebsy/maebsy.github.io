---
id: sqlite-index-group-by
translationKey: post-sqlite-index-group-by
locale: ja
title: インデックスを追加したら GROUP BY が遅くなった理由（SQLite）
summary: SQLite でレビューテーブルの外部キー列にインデックスを追加したところ、1件検索は 17倍速くなった一方、映画ごとの平均を求める JOIN + GROUP BY は遅くなりました。実行計画と 5パターンの実験で考えられる原因を検証し、カバリングインデックスで大幅に改善した記録です。
status: published
updatedAt: 2026-11-25
publishedAt: 2026-11-25
sourceRevision: "109bcc7"
category: databases
tags: [sqlite, sql, performance, query-plan]
---

学習課題として作成した [movie-review-db](https://github.com/maebsy/movie-review-db) で、インデックスの効果を測定したときの記録です。「インデックスを貼れば速くなる」と考えていましたが、測定してみると遅くなるクエリがありました。

## 問題

テーブル構成は次のとおりです（抜粋・簡略化）。

```sql
CREATE TABLE movie  (movie_id INTEGER PRIMARY KEY, title TEXT NOT NULL, ...);
CREATE TABLE review (
  review_id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES member (member_id),
  movie_id  INTEGER NOT NULL REFERENCES movie (movie_id),
  rating    INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  ...,
  UNIQUE (member_id, movie_id)
);
```

実際の `review` テーブルには `UNIQUE (member_id, movie_id)` もあり、SQLite はそのための自動インデックスを作成します。ただし先頭列は `member_id` であり、記録したベースラインでは `movie_id` 単独の条件には使われず `SCAN r` になりました。以下の「インデックスなし」は、`movie_id` を先頭列とするインデックスを追加していない状態を指します。

SQLite は外部キー列に自動でインデックスを作らないため、`review(movie_id)` にインデックスを追加し、次の 2つのクエリで前後の実行時間を比較しました。データは架空のもので、`review` は 200,078行、`movie` は 522行です。

```sql
-- (1) 映画 1本のレビュー取得
SELECT rating, content FROM review WHERE movie_id = ?;

-- (2) 映画ごとの平均評価
SELECT m.title, AVG(r.rating)
FROM movie AS m INNER JOIN review AS r ON r.movie_id = m.movie_id
GROUP BY m.movie_id;
```

リポジトリに記録した結果（Python 3.14.4・SQLite 3.46.1 の環境）は次のとおりでした。

| クエリ | 追加の movie_id 先頭インデックスなし | `idx_review_movie_id` あり |
| --- | --- | --- |
| (1) 1件検索 | 9.93 ms | 0.58 ms（17倍高速） |
| (2) JOIN + GROUP BY | 113.72 ms | 231.93 ms（約 2倍遅い） |

(1) は期待どおりですが、(2) は遅くなっています。

## 原因

実行計画（`EXPLAIN QUERY PLAN`）を比べると、インデックスの有無で結合の順序が変わっていました。

```text
インデックスなし: SCAN r / SEARCH m USING INTEGER PRIMARY KEY (rowid=?) / USE TEMP B-TREE FOR GROUP BY
インデックスあり: SCAN m / SEARCH r USING INDEX idx_review_movie_id (movie_id=?)
```

- **インデックスなし**：`review` を全件走査し、各行の `movie_id` で `movie` を主キー検索し、一時 B-tree で集計します。
- **インデックスあり**：`movie` を外側のループにして、映画ごとにインデックスで `review` を探します。一時 B-tree は不要になりますが、インデックスには `rating` が含まれていないため、見つかった行ごとに rowid で `review` 本体を引き直す必要があります。

実行計画からは、約 20万行の全件走査に代わり、`rating` を得るためにインデックス経由で各 `review` 行を rowid から取得する計画になったと読めます。これらのテーブル参照のコストが、一時 B-tree を避けた利点を上回ったという説明は、今回の測定結果と整合します。

## 解決策

この説明が正しければ、`rating` もインデックスに含めて `review` 本体への参照をなくせば速くなるはずです。そこで、条件を変えた 5パターンを同じデータで測定しました。

| パターン | 実行計画（要約） | (2) の実行時間 |
| --- | --- | --- |
| A. 追加の movie_id 先頭インデックスなし | `SCAN r` + 一時 B-tree | 118.79 ms |
| B. `(movie_id)` | `SEARCH r USING INDEX` | 519.43 ms |
| C. B + `review AS r NOT INDEXED` | A と同じ | 121.33 ms |
| D. `(movie_id, rating)` のカバリングインデックス | `SEARCH r USING COVERING INDEX` | **20.06 ms** |
| E. B + `ANALYZE` | B と同じ | 511.36 ms |

- **D** は B と同じ結合順序で、`review` 側の必要列を `COVERING INDEX` だけで取得できるため、`review` テーブル本体を参照しません。A の約 6分の1 で完了し、仮説を支持する結果でした。
- **C** の `NOT INDEXED` は、`r` へのアクセスで rowid を除くすべてのインデックスを使わせない指定です。この実験では A と同じ計画になり、実行時間も A に近い値でした。
- **E** のように統計情報（`ANALYZE`）を作っても、プランナの選択は変わりませんでした。

この実験の (2) では、`review(movie_id, rating)` が最も良い結果でした。先頭列が `movie_id` のため、(1) の検索条件にも利用できますが、`content` は含まれないため、(1) ではカバリングインデックスにはなりません。

## 検証

- 測定環境：Windows 10、Python 3.12.10、SQLite 3.49.1（Python 標準の `sqlite3` モジュール）。
- データ：リポジトリの `scripts/bench_index.py` と同じ方法（乱数シード固定）で生成した 200,078行。`ANALYZE` は E 以外では実行していません。
- 方法：各パターンで新しいデータベースを作り、(2) を 7回実行した中央値を採用しました。スクリプト全体を 2回実行し、表は 2回目の値です（1回目は A のみ 199 ms で、キャッシュの影響と考えています。ほかのパターンはほぼ同じ値でした）。
- 5パターンすべてで、クエリ結果が A と同一であることを確認しています。

測定環境の違いは、リポジトリの記録（約 2倍）と今回の測定（約 4.4倍）で遅くなる比率が異なる一因と考えられます。時間の絶対値ではなく、実行計画の違いとパターン間の比較を見てください。

## 学び

- インデックスは「速くするもの」ではなく、プランナに選択肢を増やすものです。選択肢が増えると、遅い計画が選ばれることもあります。
- インデックスを追加したら、関係するクエリの実行計画を前後で確認します。特に `USING INDEX` と `USING COVERING INDEX` の違いを確認します。
- 本件のような集計では、必要な列がインデックスに含まれ、テーブル本体を読まずに済むかどうかが重要な要因になります。
- 「速くなった／遅くなった」は、実行計画と測定条件をそろえて記録して初めて説明できます。
