# Ad-Supported Availability and Shopping-Bag Change

## Summary

MovieApp formerly displayed the yellow shopping bag whenever a movie had no
US subscription provider. That was misleading for movies that could be watched
free with advertisements: those movies did not require a rental or purchase,
but the poster still displayed the bag.

The corrected rule is:

- Hide the bag when a movie has a US subscription option.
- Hide the bag when a movie has a US ad-supported option.
- Show the bag only when Cloudflare confirms that the movie has neither option.
- Do not show the bag when availability is unknown because a request failed or
  has not finished yet.

The change spans two separate repositories:

| Repository            | Responsibility                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `movieapp-cloudflare` | Refresh and store the availability facts, protect subscription filtering, return the new API field, and invalidate old cached search responses. |
| `MovieApp`            | Carry the new field through Favorites, Seen, Title Search, and Advanced Search, then apply one shared shopping-bag display rule.                |

## 1. Customer-Visible Meaning

The icon is still the yellow shopping bag in the upper-right corner of a movie
poster. Its meaning is now broader and more accurate:

> A separate rental or purchase may be required because no current US
> subscription or ad-supported stream was found.

The Movie Detail page is unchanged. It continues to display actual streaming
providers and TMDb attribution after the customer opens a movie.

## 2. Cloudflare Data Design

The Worker stores one internal relationship for each movie that TMDb Discover
reports as available through an ad-supported stream in the United States:

```text
provider_id = -1
region = US
```

`-1` is an internal marker, not a real streaming-company ID. Real TMDb provider
IDs used by MovieApp are positive numbers. The marker is deliberately absent
from `tmdb_watch_provider_lookup`, so customers can never see or select it in
the Advanced Search streaming-provider popup.

The marker uses the existing tables:

1. `movie_watch_providers_staging` receives the current weekly snapshot.
2. `movie_watch_providers` receives that snapshot only after the normal Movie
   List safety checks approve promotion.

No provider table, temporary table, or monetization column was added.

## 3. Provider Refresh Behavior

The existing weekly `tmdb-provider-refresh` job still performs its normal
subscription work:

1. Read TMDb Discover pages using US `flatrate` availability.
2. Queue the discovered movie IDs.
3. Call each movie's provider-detail endpoint once to learn the real
   subscription company IDs.

The job now adds one lightweight pass after subscription discovery:

1. Read TMDb Discover pages using US `ads` availability.
2. Insert one `-1` marker directly for each returned movie ID.
3. Do not call each ad-supported movie's provider-detail endpoint.

Therefore, the expensive per-movie lookup still runs only once. The ads pass
does not repeat the approximately 83,000 subscription lookups.

The discovery checkpoint now records whether the current pass is `flatrate` or
`ads`. If Cloudflare retries a queue message, processing resumes from the same
pass, date window, and page.

## 4. Weekly Ownership and Partial Updates

The full weekly provider refresh owns creation and removal of ads markers. A
marker disappears automatically when a later successful weekly snapshot no
longer includes that movie.

The partial TMDb enrichment path still updates real subscription relationships
for individual movies. Its delete and promotion statements now preserve the
last successful weekly `-1` marker. This prevents an unrelated partial update
from erasing current ad-supported availability.

## 5. Subscription Filtering Remains Correct

The internal marker must never make an ads-only movie look like a subscription
movie. Worker queries now answer two separate questions:

| Question                                                        | Rule                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Does the movie have a subscription?                             | A US provider relationship exists and `provider_id` is not `-1`. |
| Can the movie be watched without a separate rental or purchase? | Any US provider relationship exists, including `-1`.             |

The broad `watchMonetizationTypes=flatrate` filter explicitly excludes `-1`.
Selected-streamer requests accept only positive TMDb provider IDs, so a caller
cannot select the internal marker directly.

The existing API field remains truthful and backward compatible:

```text
available_with_subscription
```

The new shopping-bag fact is:

```text
available_without_rent_or_purchase
```

## 6. API and Cache Changes

Both Worker result paths return the new field:

1. `/movies/{tmdbId}/card-data`, used for Favorites, Seen, and Title Search.
2. `/movies/search`, used for Advanced Search.

The search response version changed from
`subscription-availability-v1` to
`subscription-or-ads-availability-v2`. This internal cache-key change prevents
a search response saved before the new field existed from being reused.

## 7. Indexes and Database Cost

Migration `0028_add_movie_watch_provider_availability_covering_index.sql`
adds:

```text
(tmdb_id, region, provider_id)
```

The index begins with the movie and region being checked. It also contains the
provider ID needed to distinguish a real subscription from the `-1` marker.
As a result, D1 can answer both poster-card availability questions directly
from the index instead of reading the main provider table afterward.

The existing provider indexes were retained because their different column
orders continue supporting streamer-filter queries. No existing index was
removed.

## 8. Safety Counts and Job Reporting

Movie List safety comparisons continue counting real subscription rows with
`provider_id <> -1`. Ads markers cannot inflate those counts and conceal a
drop in real subscription coverage.

Job results now separately report:

- Real subscription relationships.
- Ads-supported movie markers.
- Total availability relationships.
- Distinct movies with either availability type.

## 9. MovieApp Data Flow

Favorites and Seen call the existing combined card-data endpoint for each saved
movie. The returned IMDb rating and both availability answers are attached only
to the in-memory poster-card object; the saved Favorites and Seen records are
not rewritten.

Title Search follows the same card-data endpoint in small batches. Advanced
Search receives the new field directly in each Cloudflare search row.

All four screens render the same `MovieCard` component. That component displays
the shopping bag only when:

```text
available_without_rent_or_purchase === false
```

The explicit comparison is intentional. `null` or a missing value means the
app does not know the answer, so it does not make a false purchase warning.

## 10. Files Changed

### Cloudflare Worker

- `src/shared/watchProviderAvailability.ts`
- `src/externalApis/tmdbClient.ts`
- `src/imports/tmdbProviderRefresh.ts`
- `src/imports/tmdbEnrichment.ts`
- `src/imports/movieRelationshipPromotions.ts`
- `src/imports/movieListLoadCounts.ts`
- `src/httpRouting/movieSearch.ts`
- `migrations/0028_add_movie_watch_provider_availability_covering_index.sql`
- Worker API and pipeline tests

### MovieApp

- Shared movie and Worker response types
- Cloudflare search-result mapping
- Favorites and Seen card-data loading
- Title Search card-data loading
- Shared poster-card badge rule and accessibility description
- Card-data and refresh tests

## 11. Verification

Completed checks:

- Worker TypeScript passed.
- Worker deployment dry run passed.
- All 85 Worker tests passed.
- A fresh local D1 database applied all migrations successfully.
- Local D1 data tests passed for subscription-only, ads-only, both, and neither.
- `EXPLAIN QUERY PLAN` confirmed the new covering index serves both checks.
- The production migration was applied.
- The Worker was deployed with the normal recurring schedules restored.
- Final production Worker version:
  `69cd4039-9377-4b56-a44d-b099bc3541d6`.
- The live card-data endpoint returned the new field.
- MovieApp TypeScript passed.
- MovieApp lint passed with no errors.
- All 87 MovieApp tests in 25 suites passed.
- Modified MovieApp files passed Prettier formatting checks.
- Android `assembleDebug` succeeded.
- iOS simulator build succeeded.

Production refresh, promotion, cache warming, final validation, and device
examples are recorded below.

## 12. Production Completion Record

### Provider refresh

- Job: `tmdb-provider-refresh-cron-1785704419183-87ac5941-33f1-41bf-89f5-9cb57e047fd7`.
- Started: August 2, 2026 at 21:00:20 UTC.
- Completed: August 2, 2026 at 22:32:27 UTC.
- Subscription candidates: 83,702 selected and 83,702 processed.
- Ads-supported movies: 73,416.
- Staged availability relationships: 268,453.
- Errors: 0.
- The completion email was accepted by the configured mail server.

### Movie List promotion

- Job: `movie-list-build-cron-1785710286763-3738aaef-fe7f-4e25-9116-558aec95cc59`.
- Completed successfully on August 2, 2026 at 22:40:40 UTC.
- Real subscription relationships: 195,037, covering 83,702 movies.
- Ads markers: 73,416, covering exactly 73,416 movies.
- Total availability relationships: 268,453, covering 116,668 movies.
- Duplicate ads markers: 0.
- Synthetic provider rows in the selectable provider lookup: 0.
- Movie List errors: 0.
- The completion email was accepted by the configured mail server.

### Live API examples

- The Shining (`tmdb_id=694`) returns subscription `false` and
  subscription-or-ads availability `true`.
- Lolita (`tmdb_id=802`) returns subscription `false` and
  subscription-or-ads availability `true`.
- Full Metal Jacket (`tmdb_id=600`) returns subscription `true` and
  subscription-or-ads availability `true`.

### Device checks

- iOS 26.5, iPhone 17 Pro Max simulator: Title Search for The Shining showed
  no bag on the first result while confirmed unavailable surrounding results
  continued to show the bag.
- Android API 34, Galaxy S22 emulator: the same Title Search behavior passed.

### Search Cache

- Final-version job:
  `cache-warm-search-manual-1785714927732-1eb77897-bb06-402c-afae-cf5b0c97ffef`.
- Started on August 2, 2026 at 23:55:28 UTC and completed successfully
  on August 3, 2026 at 00:38:58 UTC.
- Cache definitions: 3,024 selected and 3,024 processed.
- Result pages warmed and verified: 5,893.
- Errors: 0.
- The completion email was accepted by the configured mail server.
- [Cloudflare gives each Worker version its own isolated cache](https://developers.cloudflare.com/workers/cache/configuration/).
  The rollout therefore repeated the cache job after the last version change,
  and no deployment followed this final cache run.

### Final weekly validation

- Final-version job:
  `weekly-import-validation-manual-1785717590316-35af09f2-6350-413e-ac8f-7743e4c48b25`.
- Completed successfully on August 3, 2026 at 00:39:51 UTC.
- Pipeline date: August 2, 2026.
- Applicable jobs checked: 11 of 11.
- Issues: 0.
- Stale job statuses requiring reconciliation: 0.
- Errors: 0.
- The success email was accepted by the configured mail server.
- All recurring production schedules were restored after the one-time rollout
  runs.

### Administrative credential note

- The missing local manual-job token was replaced with a new strong production
  token during the rollout.
- The token is stored in the macOS Keychain under service
  `movieapp-cloudflare-admin-import-token`; it is not stored in Git or this
  document.
- This allowed the final cache and validator to run on the last deployed Worker
  version without another deployment invalidating that version's cache.
