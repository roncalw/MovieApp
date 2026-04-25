# Page03 Carry-Forward Context

This note condenses the Page03 Codex thread so future turns do not need to reread the entire local session just to answer follow-up questions. Use this as a working memory aid, not as a substitute for checking source files before editing.

## Source

- Page03 local session id: `019d9790-b10d-77d0-919f-a5fe1094cd3c`
- Page03 title/context: prior MovieApp thread before `Page04`
- The useful user/assistant conversation layer was read through the Page04 handoff.

## User Preferences

- Read `WORKING-RULES.md` before repo-related work.
- Before editing an existing file, create a side backup under `.codex/_rollback/`.
- Use beginner-friendly explanations and comments.
- Be direct and avoid broad searching unless needed.
- Do not jump ahead of the learning sequence unless asked.
- For legacy code questions, look in `.legacy_code` first; do not search elsewhere unless needed.
- Use absolute markdown file links in chat when referencing code.
- Avoid talking to the user as if internal tooling names are product concepts. Say "backup snapshot", "edit", and "restore backup" when discussing workflow.

## Main MovieApp State

- Main repo: `/Users/croncallo/repo/MovieApp`
- Cloudflare repo: `/Users/croncallo/repo/MovieApp-Cloudflare`
- `App.tsx` is temporarily swapped to render `MoviesToIMDBJoinTest` inside `AppProvider`.
- The POC screen is `src/screens/MoviesToIMDBJoinTest.tsx`.
- Existing movie search architecture should not be touched yet unless explicitly requested.

## Movie Search Architecture

- Intended search mode:
  - `MovieSearchScreen`
  - `HeaderMovieSearch`
  - `SubHeaderTop`
  - `SubHeaderMovieSearchFields`
  - `MovieResults`
- Intended detail mode:
  - `MovieSearchScreen` owns `selectedMovieId`.
  - `HeaderMovieSearch` still renders the top row.
  - `MovieDetail` is rendered at screen level.
  - Search fields/results hide while detail is open.
- `MovieResults` should remain list/body rendering only.
- `MovieResults` should not own detail mode or know about provider joins.

## Header Context Lessons

- `HeaderMovieSearchContext.tsx` defines the shared context shape and hook.
- `HeaderMovieSearch.tsx` creates and publishes the runtime `contextValue`.
- Context sends values downward only.
- Upward behavior happens when a child calls a callback it received through props or context.
- Important context fields discussed:
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
- Invalid date submit-disable path:
  - fields call `onValidityChange(isYearRangeInvalid)`
  - header stores that in `isSubmitDisabled`
  - `SubHeaderTop` reads `isSubmitDisabled` and disables the submit button.

## Date Picker Patch Lessons

- Date picker support docs live in `.codex/DatePickerArchitecture.md`.
- The working patch is `patches/react-native-date-picker+5.0.13.patch`.
- Fresh install originally failed for two reasons:
  - malformed patch hunk header
  - stale `package.json` hunk that removed `componentProvider` but missed `modulesProvider`
- Correct patch must cover five files:
  - `package.json`
  - `ios/RNDatePicker.h`
  - `ios/RNDatePicker.mm`
  - `ios/RNDatePickerManager.mm`
  - `src/DatePickerIOS.js`
- `RNDatePickerManager.h` was not changed and does not need copying.
- Correct `package.json` hunk removes both `componentProvider` and `modulesProvider`, replacing the iOS provider block with `{}`.

## Legacy OMDb Flow

- Legacy code is under `.legacy_code`.
- Legacy `MovieDetail` starts with a TMDB movie id.
- It calls TMDB `/movie/{id}/external_ids`.
- It reads `imdb_id`, the public IMDb `tt...` id.
- It calls OMDb with `https://www.omdbapi.com/?i=${imdbid}&apikey=77bdf9d5`.
- OMDb returns `imdbRating`, `imdbVotes`, and `imdbID`.
- The IMDb website scraping path exists separately and was not the source for this OMDb rating flow.

## IMDb Join POC

- POC file: `src/screens/MoviesToIMDBJoinTest.tsx`
- POC purpose: prove an application-side JSON join before changing the real search architecture.
- POC flow:
  - call real default `MovieSearchScreen` search path through `fetchMovieSearchResults(...)`
  - join each TMDB movie with TMDB `external_ids`
  - join each IMDb id with OMDb `imdbRating` and `imdbVotes`
  - render plain text only: title, IMDb rating, IMDb votes
- POC uses default params matching the search screen default date-only submit:
  - `movieRatings: ''`
  - `beginDate: getDefaultBeginDate()` (`2021-01-01`)
  - `endDate: getDefaultEndDate()`
  - `movieGenres: []`
  - `movieStreamers: []`
  - `movieVoteCount: ''`
  - `movieSortBy: ''`
- Earlier hand-built query included `with_watch_monetization_types=flatrate`, which narrowed results and was replaced.
- Expected first results included `The Mortuary Assistant`, followed by `Thrash`.
- POC has page buttons `1` through `5`.
- POC shows elapsed time next to `Join complete.`
- Keep concurrency controlled; Page03 used a small cap such as `4`.

## IMDb Join Architecture Direction

- The user wants a blocking service-layer join pipeline for the eventual real implementation.
- Mental model:
  - TMDB search page = base rows
  - TMDB external ids = left join by TMDB movie id
  - OMDb data = left join by IMDb id
- If OMDb or IMDb id is missing, keep the TMDB row and leave rating/votes empty.
- `MovieResults` must receive one unified data shape and should not know multiple sources were involved.
- Good eventual shape:
  - keep supplier-specific TMDB functions
  - add a higher-level enriched search/join orchestrator
  - add caching and concurrency control before real integration.

## Cloudflare State

- Separate Cloudflare repo: `/Users/croncallo/repo/MovieApp-Cloudflare`
- It is open alongside MovieApp in a VS Code multi-root workspace.
- Separate repo was chosen to avoid another nested `package.json` confusing React Native tooling.
- Git remains separate per repo.
- Worker project was scaffolded with TypeScript.
- Wrangler is installed locally in that repo as a dev dependency.
- Run Wrangler commands from `/Users/croncallo/repo/MovieApp-Cloudflare`.
- `npx` was explained as executing a package CLI; `npm run` runs scripts from `package.json`.

## Cloudflare D1 State

- D1 database:
  - `database_name: movieapp-test-db`
  - `database_id: b888696a-acaf-4925-8c52-243146559175`
  - binding name: `DB`
- D1 table:
  - `movies(id, MovieName, IMDBRating, IMDBVoteCounts)`
- Seed rows:
  - `Terminator 2`, `9.9`, `56000`
  - `Bambi`, `8.9`, `89000`
  - `Superman 3`, `6.5`, `75000`
- Dashboard table list also showed `sqlite_sequence` and `_cf_KV`; these are internal/system tables.
- Intended endpoint:
  - `GET /movies`
  - query D1 and return JSON rows from `movies`.

## Cloudflare Worker Code Context

- Worker code file: `/Users/croncallo/repo/MovieApp-Cloudflare/src/index.ts`
- The user wants plentiful beginner-level comments.
- Important explanation:
  - `Env` describes Cloudflare resources attached to the Worker.
  - `DB` binding becomes available as `env.DB`.
  - Cloudflare calls `fetch(request, env)` for each HTTP request.
  - `new URL(request.url)` lets the code inspect `url.pathname`.
  - `/movies` should run a SQL query against D1.
  - unknown paths return 404.
- In Page04, additional code was added:
  - `MovieRow` type
  - `jsonResponse` helper
  - `GET /movies` returns `{ movies: results }`
  - non-GET to `/movies` returns 405
  - unknown routes return JSON 404.

## Cloudflare Test Context

- Test file: `/Users/croncallo/repo/MovieApp-Cloudflare/test/index.spec.ts`
- The user originally planned to test manually in the browser by running the app and opening the endpoint.
- Automated tests were added in Page04 and should be explained gently.
- Vitest explanation to preserve:
  - Vitest is the automated test runner installed by the Cloudflare TypeScript starter.
  - `npm test` runs the test files.
  - The test can call the Worker's `fetch(...)` directly without opening a browser.
  - A fake `env.DB` can stand in for the real Cloudflare D1 binding.
  - Browser/manual test remains useful: `npm run dev`, then open `http://localhost:8787/movies`.

## Page04 Handoff

- Page04 was created because Page03 had reached about `133.17 MiB`, about `60.13%` of `FULL - READ ONLY`.
- The user clarified `Page04` was the chat name, not a request to set page 4 in the POC.
- A prior mistaken Page04-related change should stay undone; do not treat `Page04` as a movie page number.
