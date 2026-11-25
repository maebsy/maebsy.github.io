---
id: sqlite-index-group-by
translationKey: post-sqlite-index-group-by
locale: en
translatedFrom: ja
title: Why adding an index made my GROUP BY slower (SQLite)
summary: An index on a foreign-key column made a point lookup 17× faster and a per-movie average with JOIN + GROUP BY slower. Query plans and a five-variant experiment provided evidence for the likely cause, and a covering index substantially improved this query.
status: published
updatedAt: 2026-11-25
publishedAt: 2026-11-25
sourceRevision: "109bcc7"
category: databases
tags: [sqlite, sql, performance, query-plan]
---

This comes from measuring index effects in [movie-review-db](https://github.com/maebsy/movie-review-db), a coursework project. I expected an index to make things faster. One query got slower.

## Problem

The relevant tables (simplified):

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

The full `review` table also has `UNIQUE (member_id, movie_id)`, which creates an automatic index. Its leading column is `member_id`, however, and the recorded baseline plan does not use it for the `movie_id` predicate; it shows `SCAN r`. Below, "no index" means no added index that leads with `movie_id`.

SQLite does not index foreign-key columns automatically, so I added an index on `review(movie_id)` and timed two queries before and after, on synthetic data with 200,078 reviews and 522 movies:

```sql
-- (1) reviews for one movie
SELECT rating, content FROM review WHERE movie_id = ?;

-- (2) average rating per movie
SELECT m.title, AVG(r.rating)
FROM movie AS m INNER JOIN review AS r ON r.movie_id = m.movie_id
GROUP BY m.movie_id;
```

The result recorded in the repository (Python 3.14.4, SQLite 3.46.1):

| Query | No added movie_id-leading index | With `idx_review_movie_id` |
| --- | --- | --- |
| (1) point lookup | 9.93 ms | 0.58 ms (17× faster) |
| (2) JOIN + GROUP BY | 113.72 ms | 231.93 ms (about 2× slower) |

## Cause

`EXPLAIN QUERY PLAN` shows that the index changed the join order:

```text
no index:   SCAN r / SEARCH m USING INTEGER PRIMARY KEY (rowid=?) / USE TEMP B-TREE FOR GROUP BY
with index: SCAN m / SEARCH r USING INDEX idx_review_movie_id (movie_id=?)
```

- **Without the index**, SQLite scans all of `review`, looks up each row's movie by primary key, and aggregates in a temporary B-tree.
- **With the index**, it loops over `movie` and probes the index for each movie. That removes the temporary B-tree, but the index does not contain `rating`, so every matching entry needs a second lookup into the `review` table by rowid.

The plan replaces a full scan of roughly 200,000 reviews with index-driven access that must fetch `review` rows by rowid to obtain `rating`. The results are consistent with those table fetches costing more than avoiding the temporary B-tree on this data; the experiment does not isolate that cost directly.

## Fix

If that explanation holds, putting `rating` into the index should remove the `review` table fetches. I measured five variants on the same data:

| Variant | Plan (summary) | Query (2) |
| --- | --- | --- |
| A. no added movie_id-leading index | `SCAN r` + temp B-tree | 118.79 ms |
| B. index on `(movie_id)` | `SEARCH r USING INDEX` | 519.43 ms |
| C. B + `review AS r NOT INDEXED` | same as A | 121.33 ms |
| D. covering index on `(movie_id, rating)` | `SEARCH r USING COVERING INDEX` | **20.06 ms** |
| E. B + `ANALYZE` | same as B | 511.36 ms |

- **D** retains B's join order and obtains every review-side value from the covering index, so it does not read the `review` table itself. It ran in about a sixth of A's time, supporting the hypothesis.
- **C** (`NOT INDEXED`) prevents `r` from using any index, including constraint-created indexes, though rowid lookups remain possible. In this experiment it produced A's plan and a near-A runtime.
- **E**: collecting statistics did not change the planner's choice.

In this experiment, `review(movie_id, rating)` performed best for query (2). Because its leading column is `movie_id`, it can also support query (1), although query (1) is not covered because it also selects `content`.

## Verification

- Environment: Windows 10, Python 3.12.10, SQLite 3.49.1 (Python's built-in `sqlite3`).
- Data: 200,078 reviews generated the same way as the repository's `scripts/bench_index.py` (fixed random seed). `ANALYZE` was run only in E.
- Method: a fresh database per variant; query (2) run 7 times, median reported. I ran the whole script twice and report the second run (on the first run only A differed, at 199 ms, which I attribute to a cold cache).
- All five variants returned exactly the same rows as A.

The differing environments may help explain why the slowdown ratio differs between the repository record (about 2×) and this run (about 4.4×). Compare plans and variants, not absolute times.

## Lessons

- An index does not make queries faster; it gives the planner another option, and that option can be worse.
- After adding an index, compare the plans of the affected queries before and after, and look for `USING INDEX` versus `USING COVERING INDEX`.
- For aggregations like this one, whether the index contains every needed column—and can avoid reading the table—is an important factor.
- "Faster" or "slower" only means something when the plan and the measurement conditions are recorded with it.
