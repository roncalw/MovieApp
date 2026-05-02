# MovieApp Carry-Forward Context

This note is the single carry-forward context file for this workspace. It merges the important MovieApp architecture history from the old Page03 context with the current Cloudflare/database/import state from the old Page04 context.

Use this as required startup context for future chats. Still inspect the current repo files before editing code or docs.

## Required Startup Reading Order

1. `WORKING-RULES.md`
2. `MovieAppContext.md`
3. current repo files relevant to the task

Do not reread the full old raw session files unless there is a specific contradiction or missing detail that this file does not cover.

## Repos

- Main repo:
  - `/Users/croncallo/repo/MovieApp`
- Cloudflare repo:
  - `/Users/croncallo/repo/MovieApp-Cloudflare`

## User Preferences

- Re-read `WORKING-RULES.md` before repo-related work.
- Before editing an existing file, create a side backup under `.codex/_rollback/`.
- Use direct, beginner-friendly explanations.
- Explain what calls what when discussing code.
- Keep context files current so future chats do not depend on rereading giant raw sessions.
- For legacy code questions, check `.legacy_code` first.
- Use absolute markdown file links in chat when referencing local files.

## Main MovieApp State

- `App.tsx` is temporarily swapped to render `MoviesToIMDBJoinTest` inside `AppProvider`.
- POC screen:
  - `/Users/croncallo/repo/MovieApp/src/screens/MoviesToIMDBJoinTest.tsx`
- Existing movie search architecture should not be changed casually unless the user explicitly asks.

## Movie Search Architecture Direction

Intended search mode:

- `MovieSearchScreen`
- `HeaderMovieSearch`
- `SubHeaderTop`
- `SubHeaderMovieSearchFields`
- `MovieResults`

Intended detail mode:

- `MovieSearchScreen` owns `selectedMovieId`
- `HeaderMovieSearch` still renders the top row
- `MovieDetail` renders at screen level
- search fields and results hide while detail is open

Important rules:

- `MovieResults` should remain list/body rendering only
- `MovieResults` should not own detail mode
- `MovieResults` should not know about provider joins or multi-source plumbing

## Header Context Lessons

- `HeaderMovieSearchContext.tsx` defines the shared context shape and hook.
- `HeaderMovieSearch.tsx` creates and publishes the runtime context value.
- Context sends values downward only.
- Upward behavior happens when a child calls a callback it received through props or context.

Important fields discussed in earlier work:

- `isSubmitDisabled`
- `onValidityChange`
- `registerSubmitHandler`
- `submitDraftFilters`
- `isDetailOpen`
- `triggerDetailBack`
- `appliedParams`
- `totalPages`
- `onSubmitFilters`
- `onDisplayedFiltersDirtyChange`
- `loadedPages`

Important submit-disable path:

- fields call `onValidityChange(isYearRangeInvalid)`
- header stores that in `isSubmitDisabled`
- `SubHeaderTop` reads `isSubmitDisabled` and disables the submit button

## Date Picker Patch State

- Support doc:
  - `/Users/croncallo/repo/MovieApp/.codex/DatePickerArchitecture.md`
- Working patch:
  - `/Users/croncallo/repo/MovieApp/patches/react-native-date-picker+5.0.13.patch`

Important patch lessons:

- Earlier fresh install failures came from:
  - malformed patch hunk header
  - stale `package.json` hunk that removed `componentProvider` but missed `modulesProvider`
- Correct patch touches:
  - `package.json`
  - `ios/RNDatePicker.h`
  - `ios/RNDatePicker.mm`
  - `ios/RNDatePickerManager.mm`
  - `src/DatePickerIOS.js`
- `RNDatePickerManager.h` was not changed and does not need copying

## Legacy OMDb / IMDb Join Flow

- Legacy code is under `.legacy_code`.
- Legacy `MovieDetail` starts with a TMDB movie id.
- It calls TMDB `/movie/{id}/external_ids`.
- It reads `imdb_id`.
- It calls OMDb with:

```text
https://www.omdbapi.com/?i=${imdbid}&apikey=77bdf9d5
```

- OMDb returns:
  - `imdbRating`
  - `imdbVotes`
  - `imdbID`

## IMDb Join POC In MovieApp

- POC file:
  - `/Users/croncallo/repo/MovieApp/src/screens/MoviesToIMDBJoinTest.tsx`
- Purpose:
  - prove an app-side JSON join before changing the real search architecture

POC flow:

- call the real default `MovieSearchScreen` search path through `fetchMovieSearchResults(...)`
- join each TMDB movie with TMDB `external_ids`
- join each IMDb id with OMDb `imdbRating` and `imdbVotes`
- render plain text only:
  - title
  - IMDb rating
  - IMDb votes

POC defaults mirror the search screen’s simple date-based submit:

- `movieRatings: ''`
- `beginDate: getDefaultBeginDate()` (`2021-01-01`)
- `endDate: getDefaultEndDate()`
- `movieGenres: []`
- `movieStreamers: []`
- `movieVoteCount: ''`
- `movieSortBy: ''`

Other POC notes:

- earlier hand-built query used `with_watch_monetization_types=flatrate` and was replaced
- expected first results included `The Mortuary Assistant`, then `Thrash`
- page buttons `1` through `5`
- elapsed time is shown next to `Join complete.`
- keep concurrency low, e.g. around `4`

## Eventual MovieApp Join Direction

- The desired long-term direction is a blocking service-layer join pipeline.
- Mental model:
  - TMDB search page rows = base rows
  - TMDB external ids = left join by TMDB movie id
  - OMDb/IMDb-enriched data = left join by IMDb id
- If IMDb id or OMDb data is missing, keep the TMDB row and leave enriched fields empty.
- `MovieResults` should receive one unified data shape.
- Better long-term shape:
  - keep supplier-specific TMDB functions
  - add a higher-level enriched search/join orchestrator
  - add caching and concurrency control before integrating into the real screen

## Cloudflare Repo State

- Separate Cloudflare repo:
  - `/Users/croncallo/repo/MovieApp-Cloudflare`
- Separate repo was chosen to avoid nested React Native tooling confusion.
- Git remains separate per repo.
- Worker project uses TypeScript.
- Wrangler is installed locally in that repo as a dev dependency.
- Run Wrangler commands from:
  - `/Users/croncallo/repo/MovieApp-Cloudflare`

## Current Cloudflare D1 State

The project was cleaned up from the old test database to the real database name.

Current active remote database:

- `database_name: movieapp-db`
- `database_id: bfd8c900-38f6-41e2-afcf-37772b5249a2`
- binding name:
  - `DB`

Current migration history:

- local and remote both clean
- only migration:
  - `0001_create_movie_list_schema.sql`

Current verified schema tables:

- `imdb_ratings_staging`
- `tmdb_movies_staging`
- `movie_list_items`
- `movie_genres`
- `movie_watch_providers`
- plus system tables

At the last check, the old remote database `movieapp-test-db` still existed and had not yet been deleted.

## wrangler.jsonc State

File:

- `/Users/croncallo/repo/MovieApp-Cloudflare/wrangler.jsonc`

Important current state:

- comments explain that `d1_databases` are remote DB entries, not local Wrangler D1 files
- comments explain local D1 state under:
  - `.wrangler/state/v3/d1`
- comments include a two-database migration-folder example

Current Worker CPU limit config:

```jsonc
"limits": {
  "cpu_ms": 300000
},
```

That means the repo explicitly asks Cloudflare for a `5 minute` CPU ceiling on paid Workers.

## Current Cloudflare Worker Code State

Worker file:

- `/Users/croncallo/repo/MovieApp-Cloudflare/src/index.ts`

It currently includes:

- original `/movies` sample route
- beginner-heavy comments
- `jsonResponse(...)` helper
- `GET /movies`
- non-GET -> `405`
- unknown routes -> JSON `404`
- IMDb dry-run helper and route

Important additions from this thread:

- `IMDB_RATINGS_URL`
- `ImdbRatingRow`
- `dryRunReadImdbRatings(limit)`
- `/admin/import/imdb-ratings/dry-run`

The dry-run helper was later improved so it no longer stores every parsed row in memory.

## Current TMDB Primary Load State

The TMDB primary staging load has been completed remotely for:

- `1874-12-09` through `2026-04-29`

Verified remote counts:

- `tmdb_movies_staging`: `1,011,396`
- `movie_genres`: `1,220,401`

The primary load matches MovieApp/TMDB Discover behavior:

- `include_adult=false`
- `include_video=false`

## Step 9B Enrichment Plan And Code State

Step 9B should refresh all enrichment data together from:

```text
/movie/{tmdb_id}?append_to_response=external_ids,release_dates,watch/providers
```

This refreshes:

- `imdb_id`
- `us_certification`
- US flatrate watch providers / streamers

Do not use TMDB `/movie/changes` as the main driver because watch-provider changes are not reliably included there.

The new plan uses one D1 selector based on `tmdb_enriched_at`:

```sql
WHERE tmdb_enriched_at IS NULL
   OR tmdb_enriched_at < datetime('now', '-' || ? || ' days')
```

Null means the movie has never gone through the full enrichment pass. Do not select by `imdb_id IS NULL` or `us_certification IS NULL`, because those nulls can be valid TMDB results.

Implemented Cloudflare Worker pieces:

- migration: `/Users/croncallo/repo/MovieApp-Cloudflare/migrations/0002_add_tmdb_enriched_at.sql`
- migration: `/Users/croncallo/repo/MovieApp-Cloudflare/migrations/0003_add_import_job_locks.sql`
- manual route: `/admin/import/tmdb/enrich-manual`
- shared runner: `runTmdbEnrichment(...)`
- scheduled handler calls the same runner
- `tmdbConcurrency` controls how many TMDB detail requests can be in flight; default is `25`
- the existing `fetchTmdbJson(...)` request governor still limits TMDB request starts to about `35` per second
- manual and cron enrichment both use a D1 lock named `tmdb-enrich` so overlapping runs skip instead of running concurrently
- follow up: update `.codex/MovieAppOnCloudflare.md` with the lock details in Step 9B when time permits
- structured logs:
  - `import-job-lock-acquired`
  - `import-job-lock-skipped`
  - `import-job-lock-released`
  - `tmdb-enrich-start`
  - `tmdb-enrich-progress`
  - `tmdb-enrich-row-error`
  - `tmdb-enrich-end`

The guide explains testing from:

- `limit=1000`
- `limit=5000`
- `limit=10000`
- `limit=20000`

Progress logs should be visible in:

- Cloudflare Dashboard -> Workers & Pages -> movieapp-cloudflare -> Observability -> Events
- `npx wrangler tail`

Current dry-run sampling behavior:

- keep first `33` rows
- keep rolling last `33` rows
- still process rows up to the requested `limit`

Current sample-size constant:

- `IMDB_SAMPLE_SIZE = 33`

That `33` matches the planned D1 queue batch size because:

- `33 rows * 3 values = 99 bound parameters`

## IMDb Dry-Run Results

The live IMDb ratings file count observed in this thread:

- `1,665,568 total lines`
- `1,665,567 data rows`
- `1 header row`

Observed behavior before the paid upgrade and CPU limit config:

- smaller limits worked
- high limits eventually failed with `1102`
- those failures were identified as CPU/resource limit failures

Observed behavior after the paid upgrade and explicit `cpu_ms = 300000`:

- deployed Cloudflare dry-run passed with `limit=2000000`
- actual returned `rowsRead` was `1665567`, meaning the whole file was processed

Observed deployed timing for the successful full-file run:

- `cpuTimeMs: 1224`
- `wallTimeMs: 1424`

Observed local timing for the same full-file run:

- about `1.077s total` using:

```bash
time curl -s "http://localhost:8787/admin/import/imdb-ratings/dry-run?limit=2000000" > /tmp/imdb-dry-run-local.json
```

Interpretation already established:

- local can be a bit faster than Cloudflare for a single compute-heavy fetch/decompress/parse path
- the paid upgrade solved the completion limit problem, not necessarily the latency comparison

## Current Import Architecture Decisions

### IMDb side

- Step 4 proves Cloudflare can fetch, decompress, and parse the IMDb file.
- Step 5 explains the queue-based design.
- Manual enqueue endpoint naming was changed from `enqueue-test` to:

```text
/admin/import/imdb-ratings/enqueue-manual
```

- The guide and queue SVG were updated to use `manual` wording for that enqueue path.

### TMDB side

- The older TMDB daily ID export plan was dropped.
- Current plan:
  - primary TMDB load uses paginated `discover/movie`
  - later enrichment fills only the missing fields

Step 9 split:

- `Step 9A` = primary TMDB load
- `Step 9B` = TMDB enrichment

Primary TMDB load fills:

- `tmdb_movies_staging`
- `movie_genres`

Primary TMDB load implementation notes:

- The manual endpoint is `/admin/import/tmdb/load-manual`.
- The manual endpoint now requires a finite `beginDate` and `endDate`.
- TMDB Discover cannot be read past page 500.
- The Worker preflights each date window by reading page 1 and checking `total_pages`.
- If a requested window is over 500 pages, the Worker splits that date window in half and retries the smaller windows.
- Each safe window is loaded with page-level D1 batching via `env.DB.batch(...)`.
- Response/log summary includes:
  - `totalPagesSeen`
  - `tmdbDiscoverMaxPage`
  - `windowsLoaded`
  - `windowsSplit`
  - `pendingWindows`
  - `stoppedWindow`
  - `stopReason`
- Important stop reasons:
  - `limit_reached`
  - `end_of_windows`
  - `single_day_page_cap_reached`

TMDB enrichment fills/updates:

- `imdb_id`
- `us_certification`
- `movie_watch_providers`

TMDB manual endpoint naming was changed from `load-test` to:

```text
/admin/import/tmdb/load-manual
```

## Final Table Rules

Final runtime tables:

- `movie_list_items`
- `movie_genres`
- `movie_watch_providers`

Current join rule:

- `movie_list_items` is built with an `INNER JOIN` from `tmdb_movies_staging` to `imdb_ratings_staging`
- matching IMDb row required
- `imdb_rating` and `imdb_vote_count` themselves may still be `NULL`

Current staging-table rule:

- no foreign key from `tmdb_movies_staging.imdb_id` to `imdb_ratings_staging.imdb_id`
- use an indexed join key, not an FK

Why:

- staging loads stay independent
- staging tables are allowed to be temporarily unmatched
- the final build step is where the match is enforced

## Guide State

Guide file:

- `/Users/croncallo/repo/MovieApp-Cloudflare/.codex/MovieAppOnCloudflare.md`

Important current state:

- visible `Phase` wording was changed to `Step`
- step categories were regrouped and cleaned up
- Step 5 starts with Cloudflare terms and the queue flow diagram
- Step 9 was rewritten to read more clearly
- Step 9 is split into `9A` and `9B`
- manual endpoint wording replaced older `test` naming where appropriate

The guide’s Step 2 DDL was rechecked and was treated as ready to paste/run.

## SVG State

Main flow SVG:

- `/Users/croncallo/repo/MovieApp-Cloudflare/.codex/assets/movieapp-migration-strategy-flow.svg`

Queue flow SVG:

- `/Users/croncallo/repo/MovieApp-Cloudflare/.codex/assets/cloudflare-imdb-queue-flow.svg`

Current important SVG facts:

- migration strategy SVG reflects:
  - IMDb file flow
  - TMDB `discover/movie` primary load
  - TMDB enrichment
  - staging tables
  - final tables
  - real-time Worker query
  - implementation steps sidebar
- queue flow SVG reflects:
  - `enqueue-manual`
  - `manual kickoff`
  - clearer wording about what in `fetch(...)` or `scheduled(...)` triggers `enqueueImdbRatingRows(...)`

## Current Tail Of The Work

Latest Cloudflare Step 9B state:

- TMDB primary staging is fully loaded remote:
  - `tmdb_movies_staging`: `1,011,396`
  - min/max release date: `1874-12-09` through `2026-04-29`
- TMDB enrichment is now running from Cloudflare cron.
- Cron schedule:
  - `*/15 * * * *`
- Cron code:
  - selects up to `20,000` rows where `tmdb_enriched_at IS NULL OR tmdb_enriched_at < now - 7 days`
  - enriches them with TMDB details, external IDs, certifications, and US flatrate providers
  - uses `tmdbConcurrency=25`
  - logs every `5,000` rows
- A D1 lock table prevents overlapping manual/cron enrichment jobs:
  - `import_job_locks`
- Remote enrichment count after the last verified run:
  - `32,000` enriched rows
- One important issue was discovered and fixed:
  - a 20K run initially half-failed at `10,000` updates because Workers Paid defaults to `10,000` subrequests per invocation
  - `wrangler.jsonc` now sets `limits.subrequests` to `50000`

Tomorrow / next-chat todo:

- Update `/Users/croncallo/repo/MovieApp-Cloudflare/.codex/MovieAppOnCloudflare.md` Step 9B with:
  - job lock explanation
  - cron trigger setup
  - `limits.subrequests` explanation and why the 10K default mattered
  - dashboard monitoring steps
  - note that Cloudflare Observability logs may appear batched instead of live
- Add a D1 progress table so the user can query progress while a cron/manual enrichment run is active:
  - likely `import_job_runs` or `import_job_progress`
  - update every `5,000` processed rows
  - show selected, processed, updated, errors, duration, and current status
  - this is needed because dashboard log events may arrive in a batch after the invocation finishes

Older tail note:

- create this merged context file
- replace the old Page03/Page04 carry-forward notes with one current note

## Suggested New-Chat Startup Prompt

Use this in a new chat:

```text
Read WORKING-RULES.md first. Then read MovieAppContext.md as required background before answering. Treat it as mandatory project context, then inspect the current repo files as needed.
```
