# Subscription Availability Poster Badge

## 1. Purpose

MovieApp now identifies movies for which the latest stored United States provider data contains no subscription option. These movies receive a small yellow shopping-bag icon in the lower-right corner of their poster card.

The icon appears on:

- Favorites.
- Movies I Have Seen.
- Search by Movie Title.
- Advanced Search.

The Home page and other poster displays are not part of this change.

This document covers both projects involved in the feature:

- MovieApp: `/Users/croncallo/repo/MovieApp`
- Cloudflare Worker: `/Users/croncallo/repo/movieapp-cloudflare`

## 2. Exact Business Rule

The feature asks only this question:

> Does the latest stored United States provider data contain at least one subscription provider for this movie?

TMDb calls a subscription provider `flatrate`. The existing Cloudflare provider process already stores only United States `flatrate` provider rows in `movie_watch_providers`. Therefore:

- At least one matching provider row means the movie is available through a subscription. No bag is displayed.
- No matching provider row means no subscription was found. The yellow bag is displayed.
- A failed request or missing answer is treated as unknown. No bag is displayed.

Ads, free-with-ads, rent, and purchase availability do not affect the answer. The badge does not claim that a rental or purchase option definitely exists. It communicates only that the stored data has no subscription option.

The Movie Detail page remains unchanged. No new provider attribution was added to Favorites, Seen, Title Search, or Advanced Search.

## 3. Database Changes

There are no database-structure changes for this feature.

Specifically, the implementation adds:

- No table.
- No temporary table.
- No column.
- No migration.
- No backfill.
- No provider import.
- No scheduled job.
- No change to the existing provider-refresh process.

The implementation reads the existing `movie_watch_providers` table.

## 4. Database Indexes

The existing provider index is sufficient:

```sql
idx_movie_watch_providers_tmdb_region
ON movie_watch_providers (tmdb_id, region)
```

The new checks search by TMDb movie ID and the `US` region, in that order. Production `EXPLAIN QUERY PLAN` verification on August 1, 2026 confirmed:

- The IMDb rating lookup uses the `movie_list_items` integer primary key.
- The subscription lookup uses `idx_movie_watch_providers_tmdb_region` as a covering index.
- The Advanced Search movie scan keeps using its existing covering popularity or IMDb index.
- The subscription check within Advanced Search uses `idx_movie_watch_providers_tmdb_region` as a covering index.

“Covering index” means the database can answer the provider question from the index itself. It does not have to locate and read a second provider-table record after finding the index entry.

## 5. New Cloudflare Movie-Card Endpoint

The new endpoint is:

```text
GET /movies/{tmdbId}/card-data
```

Example:

```text
GET /movies/969681/card-data
```

Response:

```json
{
  "tmdb_id": 969681,
  "imdb_rating": 8.3,
  "available_with_subscription": false
}
```

The endpoint makes one database request that:

1. Looks up the movie’s current IMDb rating.
2. Checks for any existing United States provider row for the same TMDb movie ID.
3. Returns both answers together.

The query always produces an answer even when the movie is absent from `movie_list_items`. In that situation the IMDb rating is `null`; subscription availability is still determined independently from the provider table.

## 6. Compatibility With Existing Store Versions

The existing endpoint remains available:

```text
GET /movies/{tmdbId}/imdb-rating
```

Current App Store and Google Play versions can continue using that route without receiving an unexpected response shape. The new MovieApp version calls `/card-data` only where a poster card needs both answers.

The deployed compatibility check returned:

```json
{
  "tmdb_id": 454639,
  "imdb_rating": 6.6
}
```

No existing app version must be upgraded immediately for the Worker deployment to remain safe.

## 7. Advanced Search

Advanced Search already receives its result rows from Cloudflare. It does not make another request for every poster.

The existing search `SELECT` now calculates:

```sql
EXISTS (
  SELECT 1
  FROM movie_watch_providers AS subscription_provider
  WHERE subscription_provider.tmdb_id = movie.tmdb_id
    AND subscription_provider.region = 'US'
) AS available_with_subscription
```

Cloudflare converts SQLite’s `1` or `0` into a JSON `true` or `false` before returning the response.

When Advanced Search is already filtering by a specific provider or by all subscription providers, every returned movie necessarily has a matching subscription provider. In that case the query returns `true` directly instead of repeating an unnecessary second provider check.

This calculated answer is returned with the search result. It is not written into `movie_list_items` and is not stored as a new database column.

## 8. Existing Advanced Search Cache

No new cache job, cache table, cache-clearing process, or provider-specific cache identifier was added.

The normal weekly order remains:

1. Existing provider information is updated.
2. The Movie List build finishes.
3. The existing search-cache job runs last.

The Movie List build already gives the search cache a new internal data identity. When the final cache job runs, it requests the updated Advanced Search response and stores `available_with_subscription` together with the other movie fields.

There is also a separate internal response-format version. This is required because a cached Advanced Search response contains the complete JSON returned to the app. Responses saved before this feature did not contain `available_with_subscription`, even though their movie data was otherwise still current. Without a response-format version, the Worker could legally reuse that old JSON until the weekly cache cycle replaced it.

The public request remains unchanged. For example, the app still requests:

```text
/movies/search?pageSize=20&datePreset=last5years&originalLanguages=en&sort=popularity
```

Inside the Worker only, the cache identity also contains:

```text
__responseVersion=subscription-availability-v1
```

Customers do not see or send that value. Its purpose is to prevent a response saved under an older JSON format from being mistaken for a current-format response. The value remains in the Worker permanently and should change only when a future response-format change requires old saved JSON to be bypassed again.

This response-format version does not replace the weekly Movie List identity:

- The Movie List identity distinguishes one weekly set of movie data from another.
- The response-format version distinguishes old JSON fields from current JSON fields.
- The existing final search-cache job still runs last and stores the current weekly data in the current response format.

### Defect found during final Advanced Search testing

The first implementation correctly returned the subscription field for a fresh, unique search request, but the ordinary Home page **Popular Movies** link reused a pre-feature cached response. The movies and ratings appeared, but the subscription field was missing, so the app correctly treated the answer as unknown and displayed no bags.

The permanent response-format version fixed that path. A regression test now creates an old cached response without `available_with_subscription`, sends the ordinary public request, and confirms that the old response is not reused.

## 9. Favorites and Movies I Have Seen

Favorites and Seen use the same `StoredMovieListScreen` component.

Their previous process was:

1. Read saved movies from the device.
2. Request the current IMDb rating for each displayed movie.
3. Sort by IMDb rating.
4. Display the posters.

Their new process is:

1. Read saved movies from the device.
2. Request movie-card data for each displayed movie.
3. Receive the IMDb rating and subscription answer in that same request.
4. Preserve the existing IMDb sorting.
5. Display the shared poster card.

The number of Cloudflare requests is unchanged. No subscription answer is saved into Favorites or Seen storage. It is added only to the in-memory movie used for the current screen display.

The internal function is named `loadMovieCardDataForMovies`. In plain language, this function gets the current rating and subscription answer for the movies being displayed. It replaces the previous rating-only function whose name used the confusing word “hydration.”

## 10. Search by Movie Title

Title Search continues to load its initial results directly from TMDb. It then requests Cloudflare movie-card data for only the movie IDs currently loaded into the scrolling list.

The existing limit of six simultaneous Cloudflare requests remains in place. The change does not introduce another request for subscription data; each previous rating-only request now returns both fields.

The internal hook is named `useTitleSearchCardData`. It:

1. Tracks the movie IDs already requested.
2. Requests card data in groups of six.
3. Adds the IMDb rating and subscription answer to the matching poster cards.
4. Ignores an old request if the person starts a different title search before it finishes.
5. Clears its card answers during a real Title Search refresh so the refreshed cards request current data again.

## 11. Shared Poster Icon

The icon is implemented once in `MovieCard`, the poster component shared by all four requested pages.

The presentation is:

- Ionicons `bag-handle` symbol.
- Yellow `#FFD400`, matching the existing IMDb star color.
- A small translucent black rounded background.
- Lower-right corner of the poster.
- Existing IMDb badge remains in the lower-left corner.
- Accessibility description: “Not available through a subscription.”

The rendering condition is deliberately strict:

```text
available_with_subscription === false
```

The strict comparison prevents an unavailable network, an older response without the field, or any other unknown value from displaying a misleading bag.

## 12. Failure Handling

The app uses three practical states:

- `true`: Subscription found. Do not show the bag.
- `false`: Cloudflare completed the check and found no subscription. Show the bag.
- `null` or missing: The app does not have a dependable answer. Do not show the bag.

If one card-data request fails:

- The saved movie or title-search result remains visible.
- Its IMDb badge falls back to the existing `N/A` behavior.
- Its subscription icon remains hidden.
- Other movie-card requests continue.

This avoids telling customers that a movie lacks subscription availability merely because their phone temporarily lost its connection.

## 13. Files Changed

### Cloudflare Worker

- `src/httpRouting/movieSearch.ts`
  - Added the movie-card data query and endpoint-path parser.
  - Added the subscription calculation to Advanced Search.
  - Converts database `1` and `0` values into JSON booleans.
  - Added the internal Advanced Search response-format cache version so old JSON cannot hide the new field.
- `src/httpRouting/httpRoutes.ts`
  - Routes `/movies/{tmdbId}/card-data`.
  - Preserves `/movies/{tmdbId}/imdb-rating`.
- `test/index.spec.ts`
  - Covers the new endpoint, true and false answers, Advanced Search calculation, provider-filter optimization, old endpoint compatibility, and rejection of pre-feature cached JSON.

### MovieApp

- `src/api/tmdb/services/movieService.ts`
  - Added `fetchMovieCardData`.
  - Maps the Advanced Search subscription answer into each movie card.
- `src/utils/storage/movieCardData.ts`
  - Replaces the previous rating-only saved-list helper.
- `src/drawer/StoredMovieListScreen.tsx`
  - Loads card data for Favorites and Seen.
- `src/search/title/useTitleSearchCardData.ts`
  - Replaces the previous rating-only Title Search hook.
- `src/search/title/SearchByMovieTitleScreen.tsx`
  - Uses and resets the new card-data hook.
- `src/search/results/MovieCard.tsx`
  - Displays the shared lower-right yellow bag.
- `src/types/movie/MovieTypes.ts`
  - Adds the optional in-memory subscription answer.
- `src/types/tmdb/tmdbApiTypes.ts`
  - Defines the new endpoint and Advanced Search response fields.
- `src/types/search/movieTitleSearchTypes.ts`
  - Defines Title Search’s per-movie card data.
- `__tests__/movieCardData.test.tsx`
  - Verifies endpoint use, saved-list sorting, and the strict badge rules.
- `__tests__/searchRefreshRequests.test.ts`
  - Verifies Advanced Search maps the subscription answer.

The retired files were:

- `src/utils/storage/movieListRatingHydration.ts`
- `src/search/title/useTitleSearchRatings.ts`

Their responsibilities continue under the clearer movie-card data names.

## 14. Verification Record

Completed on August 1, 2026:

- Cloudflare Worker: 7 test files passed, 70 tests passed.
- Cloudflare Worker TypeScript: passed.
- MovieApp: 25 test suites passed, 87 tests passed.
- MovieApp TypeScript: passed.
- MovieApp ESLint: passed with no errors.
- Android debug build: succeeded.
- iPhone 17 Pro Max simulator build: succeeded.
- Android emulator visual check: passed, including the exact Home → Popular Movies → Advanced Search path.
- iPhone 17 Pro Max simulator visual check: passed, including the exact Home → Popular Movies → Advanced Search path.
- Android accessibility description: confirmed.
- iPhone accessibility description: confirmed.
- Production database query-plan checks: confirmed both covering indexes.
- Live card-data response with subscription: confirmed.
- Live card-data response without subscription: confirmed.
- Live legacy IMDb endpoint: confirmed.
- Live ordinary Popular Advanced Search request: first request bypassed the old format and returned `X-MovieApp-Cache: MISS`.
- Live repeated Popular Advanced Search request: returned `X-MovieApp-Cache: HIT` with `available_with_subscription` still present.
- `git diff --check`: passed in both projects.

The Android and iPhone visual checks confirmed that the yellow bag sits in the lower-right corner without covering or moving the IMDb rating in the lower-left corner.

## 15. Deployment Record

The Cloudflare Worker was deployed before the MovieApp store build, preserving the required project order.

Deployment:

```text
Worker: movieapp-cloudflare
Version ID: 503682f5-64fb-4571-ab5d-b98ae6b91c55
URL: https://movieapp-cloudflare.carlo-roncallo.workers.dev
Date: August 1, 2026
```

Live examples used during verification:

```text
TMDb 454639
IMDb rating: 6.6
available_with_subscription: true

TMDb 969681
IMDb rating: 8.3
available_with_subscription: false
```

## 16. Maintenance Guidance

When maintaining this feature, preserve these rules:

1. Continue treating only the existing United States `flatrate` rows as subscription availability.
2. Do not convert a failed request into `false`.
3. Keep the bag condition as an exact comparison with `false`.
4. Keep the old IMDb-only endpoint until store versions that call it no longer need support.
5. Keep Advanced Search’s subscription answer calculated in its existing query rather than making one extra request per result.
6. Confirm query plans after changing provider indexes or Advanced Search SQL.
7. Verify both Android and iPhone whenever the shared poster-overlay layout changes.
8. Do not persist subscription answers in Favorites or Seen; weekly provider information can change.
9. Let the existing final search-cache job store the current answer after the weekly Movie List build.
10. Keep the internal response-format version in the Advanced Search cache identity. Change it only when older saved JSON must be bypassed after another response-format change.
11. Keep provider attribution unchanged on Movie Detail; do not add it to the four list pages as part of this feature.
