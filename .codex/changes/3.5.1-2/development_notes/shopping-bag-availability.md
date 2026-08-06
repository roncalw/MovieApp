# MovieApp 3.5.1 Shopping-Bag Availability

## 1. Purpose

MovieApp 3.5.1 adds a small yellow shopping bag to a movie poster when the
latest stored United States provider data indicates that a separate rental or
purchase may be required.

The final rule is:

- Hide the bag when a subscription stream is available.
- Hide the bag when an ad-supported stream is available.
- Show the bag only when Cloudflare confirms that neither option is available.
- Hide the bag when availability is unknown, including when a request has not
  finished or has failed.

The icon appears in the lower-right corner of posters on:

- Favorites.
- Movies I Have Seen.
- Search by Movie Title.
- Advanced Search.

The Home page and other poster displays are not part of this feature. The Movie
Detail page remains the place where customers can see the actual streaming
providers and TMDb attribution.

The customer-facing release description is kept separately in
`Deployment Features.md`. This document records the implementation,
maintenance rules, and production evidence for both repositories.

| Repository            | Responsibility                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `movieapp-cloudflare` | Refresh and store availability, protect subscription filtering, return the availability answers, and prevent reuse of outdated search JSON.    |
| `MovieApp`            | Load the answers for the four supported pages and apply one shared shopping-bag display rule.                                                   |

## 2. Why Two Earlier Documents Were Consolidated

The feature was built in two steps:

1. The first implementation hid the bag only when a United States subscription
   provider was found.
2. Testing showed that this could place a bag on a movie that was watchable
   through an ad-supported service. The final implementation therefore also
   hides the bag when an ad-supported stream is found.

The first document described the subscription-only phase. A later unversioned
document described the ad-supported correction. Keeping both made the final
rule difficult to understand and left contradictory maintenance instructions.
This 3.5.1 document replaces both and describes only the final behavior, while
retaining the important design and rollout history.

## 3. Exact Availability Questions

Cloudflare answers two separate questions because Advanced Search subscription
filtering and the shopping bag have different meanings:

| Question                                                        | Answering rule                                                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Is the movie available through a subscription?                  | At least one real United States subscription-provider relationship exists.                     |
| Can it be streamed without a separate rental or purchase?       | A United States subscription relationship or the internal ad-supported marker exists.          |

TMDb calls subscription availability `flatrate`. MovieApp uses these API
fields:

```text
available_with_subscription
available_without_rent_or_purchase
```

The first field remains available for filtering and backward compatibility.
The poster-card rule uses the second field.

## 4. Cloudflare Data Design

The Worker stores one internal relationship for each movie that TMDb Discover
reports as available through an ad-supported stream in the United States:

```text
provider_id = -1
region = US
```

`-1` is an internal marker, not a real streaming-company ID. Real TMDb provider
IDs used by MovieApp are positive numbers. The marker is deliberately absent
from `tmdb_watch_provider_lookup`, so customers cannot see or select it in the
Advanced Search streaming-provider list.

The marker uses the existing provider tables:

1. `movie_watch_providers_staging` receives the current weekly snapshot.
2. `movie_watch_providers` receives the approved snapshot after the normal
   Movie List safety checks.

No new provider table, temporary table, or monetization column was added.

## 5. Provider Refresh Behavior

The existing weekly `tmdb-provider-refresh` job performs both discovery passes
as one provider-refresh run:

### Subscription pass

1. Read TMDb Discover pages for United States `flatrate` availability.
2. Queue the discovered movie IDs.
3. Call each movie's provider-detail endpoint once to learn the real
   subscription-company IDs.

### Ad-supported pass

1. Read TMDb Discover pages for United States `ads` availability.
2. Insert one `-1` marker for each returned movie ID.
3. Do not repeat the per-movie provider-detail calls.

The inexpensive ads pass therefore does not repeat the approximately 83,000
subscription lookups. The discovery checkpoint records whether processing is
in the `flatrate` or `ads` pass, along with the date window and page, so a
Cloudflare retry resumes the correct work.

The complete weekly provider refresh owns creation and removal of the ads
markers. A marker disappears when a later successful weekly snapshot no longer
contains that movie.

The partial TMDb enrichment path can still update real subscription
relationships for an individual movie. Its delete and promotion operations
preserve the most recent successful weekly `-1` marker so an unrelated partial
update cannot erase known ad-supported availability.

## 6. Subscription Filtering Remains Separate

The internal marker must never make an ads-only movie appear in a subscription
search.

- The broad `watchMonetizationTypes=flatrate` filter excludes `provider_id = -1`.
- A selected-streamer request accepts only positive TMDb provider IDs.
- The internal marker is not present in the selectable provider lookup.
- Movie List subscription safety counts include only real relationships where
  `provider_id <> -1`.

These rules allow the shopping bag to recognize ad-supported availability
without changing the meaning of the Streaming filter.

## 7. API Behavior

### Movie-card endpoint

Favorites, Seen, and Title Search use:

```text
GET /movies/{tmdbId}/card-data
```

Example response:

```json
{
  "tmdb_id": 694,
  "imdb_rating": 8.4,
  "available_with_subscription": false,
  "available_without_rent_or_purchase": true
}
```

One database request returns the IMDb rating and both availability answers.
The query can still return availability when the movie is absent from
`movie_list_items`; in that case `imdb_rating` is `null`.

The older endpoint remains available for store versions that still use it:

```text
GET /movies/{tmdbId}/imdb-rating
```

### Advanced Search

Advanced Search already receives its movie rows from Cloudflare. Its existing
query calculates both availability answers and includes them in the returned
movie row, avoiding another request for every poster.

When a request is already filtering by a real subscription provider, the query
can return `available_with_subscription = true` without repeating an
unnecessary subscription existence check. The shopping-bag answer still
recognizes either a real subscription row or the internal ads marker.

Neither availability answer is written into `movie_list_items`.

## 8. Search Cache Behavior

The public Advanced Search URL did not change. The internal response-format
identity changed from:

```text
subscription-availability-v1
```

to:

```text
subscription-or-ads-availability-v2
```

An Advanced Search cache entry contains the complete JSON response. The version
change prevents JSON saved before the ad-supported field existed from being
reused as if it were current. The normal final search-cache job still runs
after the Movie List build and stores the latest weekly data in the current
response format.

This internal response version is separate from the weekly Movie List data
identity:

- The weekly identity separates one weekly movie-data snapshot from another.
- The response version separates one JSON field layout from another.

The response version became necessary during the first subscription-only
rollout. A fresh, unique Advanced Search request returned the new availability
field, but the ordinary Home **Popular Movies** link reused JSON cached before
that field existed. The movie cards correctly treated the missing answer as
unknown and displayed no bags. Changing the internal response version made the
ordinary public request bypass that incompatible JSON. A regression test now
stores an older response without the availability field and confirms that it
is not reused.

## 9. Index and Database Cost

Migration `0028_add_movie_watch_provider_availability_covering_index.sql`
adds:

```text
(tmdb_id, region, provider_id)
```

The index begins with the movie and region being checked and also contains the
provider ID needed to distinguish a real subscription relationship from the
`-1` ads marker. D1 can therefore answer both availability questions from the
index without reading the main provider-table record afterward.

The existing provider indexes were retained because their different column
orders support streamer-filter searches. No existing index was removed.

## 10. MovieApp Data Flow

### Favorites and Movies I Have Seen

The shared `StoredMovieListScreen` requests current movie-card data for each
saved movie. IMDb rating and availability are attached only to the in-memory
movie displayed on the screen. Saved Favorites and Seen records are not
rewritten because provider availability changes over time.

### Search by Movie Title

Title Search loads its initial movies from TMDb, then requests movie-card data
for the IDs currently loaded into the scrolling list. The existing limit of six
simultaneous Cloudflare requests remains in place. Each request returns both
the rating and availability, so the feature does not add a second request per
movie.

If the customer starts another title search before an older request finishes,
the older response is ignored. A real Title Search refresh clears the current
card answers so the refreshed cards request current data.

### Advanced Search

Advanced Search receives availability in each Cloudflare search result. It does
not issue a separate movie-card request for each poster.

## 11. Shared Poster Rule

All four supported pages use the shared `MovieCard` component.

The presentation is:

- Ionicons `bag-handle` symbol.
- Yellow `#FFD400`, matching the IMDb star.
- Small translucent black rounded background.
- Lower-right corner of the poster.
- IMDb rating remains in the lower-left corner.
- Accessibility description explains that a rental or purchase may be needed.

The rendering condition is intentionally strict:

```text
available_without_rent_or_purchase === false
```

The three practical states are:

| Value               | Meaning                                                     | Bag |
| ------------------- | ----------------------------------------------------------- | --- |
| `true`              | A subscription or ad-supported stream was found.            | No  |
| `false`             | Cloudflare confirmed that neither option was found.         | Yes |
| `null` or missing   | The app does not have a dependable answer.                   | No  |

If one request fails, the movie remains visible, other requests continue, and
the bag remains hidden. A temporary connection problem must never be converted
into a false rental-or-purchase warning.

## 12. Files and Responsibilities

### Cloudflare Worker

- `src/shared/watchProviderAvailability.ts`
- `src/externalApis/tmdbClient.ts`
- `src/imports/tmdbProviderRefresh.ts`
- `src/imports/tmdbEnrichment.ts`
- `src/imports/movieRelationshipPromotions.ts`
- `src/imports/movieListLoadCounts.ts`
- `src/httpRouting/movieSearch.ts`
- `src/httpRouting/httpRoutes.ts`
- `migrations/0028_add_movie_watch_provider_availability_covering_index.sql`
- Worker API, cache, provider, and pipeline tests

### MovieApp

- `src/api/tmdb/services/movieService.ts`
- `src/utils/storage/movieCardData.ts`
- `src/drawer/StoredMovieListScreen.tsx`
- `src/search/title/useTitleSearchCardData.ts`
- `src/search/title/SearchByMovieTitleScreen.tsx`
- `src/search/results/MovieCard.tsx`
- Shared MovieApp and Cloudflare response types
- Card-data, poster-rule, and refresh tests

The older rating-only helpers were retired after their responsibilities moved
into the broader movie-card data flow:

- `src/utils/storage/movieListRatingHydration.ts`
- `src/search/title/useTitleSearchRatings.ts`

## 13. Verification Record

The completed feature verification included:

- Worker TypeScript and deployment dry run.
- All 85 Worker tests.
- Fresh local D1 migration and data checks for subscription-only, ads-only,
  both, and neither.
- Query-plan checks confirming the covering index serves both availability
  questions.
- Production migration and Worker deployment.
- Live verification of both card-data fields and legacy IMDb endpoint
  compatibility.
- MovieApp TypeScript, lint, formatting checks, and all 87 tests in 25 suites.
- Android `assembleDebug` build.
- iOS simulator build.
- Android Galaxy S22 emulator and iPhone 17 Pro Max simulator checks.
- Title Search verification that an ads-supported movie displayed no bag while
  confirmed unavailable surrounding results continued to display it.
- Accessibility verification on Android and iPhone.

## 14. Initial Production Completion Record

These figures record the completed feature rollout on August 2–3, 2026. They
are an audit snapshot, not permanent expected counts; weekly provider data can
change.

### Provider refresh

- Job: `tmdb-provider-refresh-cron-1785704419183-87ac5941-33f1-41bf-89f5-9cb57e047fd7`.
- Started: August 2, 2026 at 21:00:20 UTC.
- Completed: August 2, 2026 at 22:32:27 UTC.
- Subscription candidates: 83,702 selected and processed.
- Ad-supported movies: 73,416.
- Staged availability relationships: 268,453.
- Errors: 0.
- Completion email: accepted by the configured mail server.

### Movie List promotion

- Job: `movie-list-build-cron-1785710286763-3738aaef-fe7f-4e25-9116-558aec95cc59`.
- Completed: August 2, 2026 at 22:40:40 UTC.
- Real subscription relationships: 195,037, covering 83,702 movies.
- Ads markers: 73,416, covering 73,416 movies.
- Total availability relationships: 268,453, covering 116,668 movies.
- Duplicate ads markers: 0.
- Synthetic provider rows in the selectable provider lookup: 0.
- Errors: 0.
- Completion email: accepted by the configured mail server.

### Live API examples

- The Shining (`tmdb_id=694`): subscription `false`, subscription-or-ads
  availability `true`.
- Lolita (`tmdb_id=802`): subscription `false`, subscription-or-ads
  availability `true`.
- Full Metal Jacket (`tmdb_id=600`): subscription `true`, subscription-or-ads
  availability `true`.

### Final search-cache run

- Job: `cache-warm-search-manual-1785714927732-1eb77897-bb06-402c-afae-cf5b0c97ffef`.
- Started: August 2, 2026 at 23:55:28 UTC.
- Completed: August 3, 2026 at 00:38:58 UTC.
- Definitions processed: 3,024 of 3,024.
- Result pages warmed and verified: 5,893.
- Errors: 0.
- Completion email: accepted by the configured mail server.
- No deployment followed this final cache run.

Cloudflare isolates the Cache API by Worker version. The final cache run was
therefore performed after the last Worker version change. See
[Cloudflare's Cache API documentation](https://developers.cloudflare.com/workers/cache/configuration/).

### Final weekly validation

- Job: `weekly-import-validation-manual-1785717590316-35af09f2-6350-413e-ac8f-7743e4c48b25`.
- Completed: August 3, 2026 at 00:39:51 UTC.
- Pipeline date: August 2, 2026.
- Applicable jobs checked: 11 of 11.
- Issues: 0.
- Stale statuses requiring reconciliation: 0.
- Errors: 0.
- Success email: accepted by the configured mail server.
- All recurring production schedules were restored.

### Deployment history

- Worker URL:
  `https://movieapp-cloudflare.carlo-roncallo.workers.dev`.
- Subscription-only phase Worker version:
  `503682f5-64fb-4571-ab5d-b98ae6b91c55`.
- Final subscription-or-ads Worker version:
  `69cd4039-9377-4b56-a44d-b099bc3541d6`.

The first version is retained here only as rollout history. The second version
implements the final 3.5.1 business rule.

### Administrative credential record

- A new production manual-job token replaced the missing local token during
  the rollout.
- The token is stored in the macOS Keychain under service
  `movieapp-cloudflare-admin-import-token`.
- The token itself is not stored in Git or this document.
- This allowed final cache and validation jobs to run on the final Worker
  version without requiring another deployment.

## 15. Maintenance Rules

Preserve these rules when changing the feature:

1. Treat only positive United States `flatrate` provider relationships as
   subscription availability.
2. Keep the `-1` marker internal and absent from the selectable provider lookup.
3. Exclude `-1` from subscription filters and subscription safety counts.
4. Let the full weekly provider snapshot create and remove ads markers.
5. Preserve the weekly ads marker during an individual movie's partial
   enrichment update.
6. Do not convert a failed or missing availability request into `false`.
7. Keep the bag condition as an exact comparison with `false`.
8. Keep the legacy IMDb-only endpoint until deployed store versions no longer
   need it.
9. Keep Advanced Search availability inside its existing query instead of
   adding one request per result.
10. Do not persist availability answers in Favorites or Seen.
11. Keep the Advanced Search response-format version in its cache identity and
    change it when older stored JSON must be bypassed after a field change.
12. Keep the existing provider indexes; the availability index serves a
    different query order.
13. Confirm D1 query plans after changing provider indexes or Advanced Search
    SQL.
14. Verify Android and iPhone whenever the shared poster overlay changes.
15. Keep provider attribution on Movie Detail instead of adding it to the four
    poster-list pages.
