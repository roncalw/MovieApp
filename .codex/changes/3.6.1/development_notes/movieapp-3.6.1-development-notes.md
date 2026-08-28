# MovieApp 3.6.1 Development Notes

## 1. Purpose and Release Boundary

MovieApp 3.6.1 groups the customer and release-process work completed after the
3.5.2 store release. This document explains what changed, how each behavior
works, where it is maintained, and what must be checked before producing the
store artifacts.

| Release item                                | Value                                      |
| ------------------------------------------- | ------------------------------------------ |
| Previous store version                      | `3.5.2`                                    |
| Previous production commit                  | `410496f68a985526af7eb15f6d5665d67421a0d6` |
| First included feature commit               | `f098846924cc93fdf1e31b47f45482a8dcac0243` |
| Last committed feature boundary              | `d33b8e62088e8fbfa1841b36a483b5351cf65090` |
| Current uncommitted addition                 | Home first-view performance                |
| Git comparison used                         | `410496f..d33b8e6`                         |
| Required Cloudflare feature commit          | `b81edb68486c6d102e411d067044fc06c020ebd5` |
| Planned store version                       | `3.6.1`                                    |

The Apple App Store lookup and the public Google Play page both listed version
3.5.2 on August 23, 2026. If more MovieApp changes are committed before the
3.6.1 archive or bundle is created, both this document and
`Deployment Features.md` must be reviewed again so the recorded release range
remains complete. After the Home performance work is committed, replace the
temporary uncommitted entry above with its complete commit ID.

## 2. Included Change Areas

| Area                   | Customer result                                                                             | Primary maintenance location                           |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Search by Movie Title  | Exact titles appear first across a broader result set.                                      | `src/search/title/titleSearchResults.ts`               |
| Movie Detail title     | A different United States title appears before the normal TMDb title.                       | `src/movie/movieDetailTitle.ts`                        |
| Missing posters        | The movie title is visible on the yellow placeholder artwork.                               | `src/search/results/MovieCard.tsx`                     |
| Favorites and Seen     | Large saved lists open quickly and returning from Movie Detail does not rearrange the grid. | `src/drawer/StoredMovieListScreen.tsx`                 |
| Streaming Now          | Home shows popular United States subscription movies and opens a matching Advanced Search.  | `src/home/homeAdvancedSearchSections.ts`               |
| Home loading           | The first visible Home content appears sooner without reducing or partially drawing rows.   | `src/home/HomeScreen.tsx`                              |
| Android drawer         | Tapping outside the open drawer closes it again.                                            | `package-lock.json`                                    |
| Store release tracking | Each successful store build gets a separate record of the exact source commit.              | `scripts/iosarchive.sh` and `scripts/androidbundle.sh` |

## 3. Search by Movie Title

### 3.1 Result loading

TMDb returns title-search results in pages. MovieApp now treats up to the first
five supplier pages as one customer-visible result set:

1. Request page one using the existing TMDb title-search endpoint.
2. Read TMDb's reported page count.
3. Request pages two through five concurrently when those pages exist.
4. Stop after page five even when TMDb reports additional pages.
5. Stop after page one when TMDb reports only one page.

At TMDb's normal page size, the five-page boundary examines at most 100 movies.
It broadens the result set enough to find exact matches that TMDb placed on a
later page without allowing one title search to issue an unbounded number of
requests.

The service implementation is in:

```text
src/api/tmdb/services/movieService.ts
fetchMovieTitleSearchResults
MAX_TITLE_SEARCH_PAGES = 5
```

### 3.2 Exact-match ordering

`rankTitleSearchMovies` prepares the loaded results before the grid renders:

1. Remove repeated TMDb movie IDs.
2. Compare the submitted text with each movie's normal `title` value.
3. Ignore capitalization, leading or trailing spaces, and repeated internal
   spaces during the exact-match comparison.
4. Keep punctuation meaningful, so `Heel!` is not treated as exactly `Heel`.
5. Place exact matches before title variations.
6. Sort both groups by TMDb popularity from highest to lowest.
7. Preserve the supplier order when two movies have the same popularity.

The cached TMDb response is not changed in place. Ranking returns a new array,
which prevents one screen render from rewriting TanStack Query's cached data.
Pull-to-refresh retrieves and ranks the complete bounded result set again.

This change does not make TMDb's `/search/movie` endpoint search its United
States alternative-title list. A movie such as `Heel / Good Boy` can still be
returned by a search for `Heel` only when TMDb includes it among the normal
search results. Once it is returned within the first five pages, exact-match
ranking can move it ahead of title variations.

## 4. Movie Detail Titles

The existing core Movie Detail request now asks TMDb to append
`alternative_titles` alongside credits and release dates. This adds the title
information to the existing core request; it does not add another network call.

`getMovieDetailDisplayTitle` applies the following display rule:

1. Look only at alternative titles whose country code is `US`.
2. Prefer a US entry with an empty type because labelled entries can be working,
   festival, or other special-purpose titles.
3. Use the first US entry as a fallback when no unlabelled entry exists.
4. Display `US Title / Normal Title` when the two values differ.
5. Display the normal title once when the values match after capitalization and
   spacing are normalized.
6. Leave the normal title unchanged when TMDb provides no US title.

Example:

```text
TMDb normal title: Good Boy
TMDb US alternative title: Heel
Movie Detail display: Heel / Good Boy
```

The underlying movie title is not rewritten in storage or in TMDb query data.
This is a Movie Detail presentation rule only.

## 5. Missing-Poster Titles

Poster-and-rating cards now place the movie name directly over the existing
yellow `Movie Poster Not Available` artwork when no poster URL exists.

The title selection order is:

1. Normal movie title.
2. Original movie title when the normal title is blank.
3. `Title unavailable` when both values are blank.

The title uses the existing yellow artwork as its background. No second title
panel is drawn. Real posters never receive this overlay. The final style uses
the MovieApp brand text color, a regular font weight, a two-line limit, and the
size selected during iPhone and Android review.

## 6. Favorites and Movies I Have Seen

### 6.1 Previous cause of the delayed jump

Favorites and Seen previously reloaded card data for every saved movie whenever
the page became active again after Movie Detail closed. The new array of movie
objects caused the native grid to render again even when no Favorite or Seen ID
had changed. On a physical iPhone this appeared as a small delayed jump after
the customer returned to the list.

### 6.2 Current reconciliation rule

The initial page opening and an intentional pull-to-refresh still load complete
card data. A normal return from Movie Detail now compares saved membership only:

- If no movie ID changed, return the existing array object and do not update the
  grid.
- If a movie was removed from Favorites or Seen, remove only that card.
- If a movie was newly added, load card data only for that movie and insert it
  into the existing rating order.
- Ignore an older asynchronous response after a newer load has started or the
  screen is no longer active.

This preserves the existing grid and native scroll position when nothing
changed while still reflecting a Favorite or Seen change made inside Movie
Detail.

### 6.3 Faster card-data loading

Favorites and Seen cards need three values that are not guaranteed to be in the
movie object saved when the customer selected the movie:

- the current IMDb rating used for sorting;
- whether the movie is available through a United States subscription; and
- whether it is available through either a subscription or an ad-supported
  stream, which controls the shopping-bag badge.

The previous implementation requested those values from the Cloudflare Worker
one movie at a time. A list containing 220 movies therefore created 220
requests from the phone to the Worker before the complete IMDb-sorted list was
ready.

The Cloudflare Worker now exposes `POST /movies/card-data/batch`. MovieApp sends
at most 50 unique TMDb movie IDs per request, and the Worker answers each batch
with one indexed D1 query. MovieApp runs no more than two batches concurrently.
For a 220-movie list, the normal full refresh is therefore five Worker requests
instead of 220.

Each batch has a 15-second timeout and one retry. MovieApp verifies that the
response contains every requested movie ID and no unexpected IDs. If either
attempt fails or the response is incomplete, the refresh fails as one unit;
partial results are never saved as though the complete list had refreshed.

The implementation is maintained in:

```text
src/api/tmdb/services/movieService.ts
fetchMovieCardDataBatch

src/utils/storage/movieCardData.ts
loadMovieCardDataForMovies
MOVIE_CARD_DATA_BATCH_SIZE = 50
MOVIE_CARD_DATA_BATCH_CONCURRENCY = 2
```

The matching Worker endpoint is maintained in the separate
`movieapp-cloudflare` project and is included in Worker commit
`b81edb68486c6d102e411d067044fc06c020ebd5`. Its primary files are:

```text
src/httpRouting/httpRoutes.ts
src/httpRouting/movieSearch.ts
```

### 6.4 One complete saved list and the same-day rule

Favorites and Seen still use one AsyncStorage record per list. No second local
table or joined data source was introduced. Each record now stores:

```text
movies: the complete saved movie array, including card data
cardDataRefreshedLocalDate: YYYY-MM-DD, or null before the first refresh
```

Older app versions stored only the movie array. The reader accepts that legacy
shape, assigns it a null refresh date, and upgrades it safely during the next
successful visit. Existing Favorite and Seen IDs are not deleted or replaced
during migration.

The refresh decision follows these rules:

1. On the first visit for a new local calendar day, refresh the complete list
   using batches, sort it by IMDb rating, and save the complete result.
2. On another visit during that same local day, use the complete saved list and
   make no card-data request.
3. After a same-day removal, remove that card without requesting data or
   re-sorting the remaining cards because their order is already valid.
4. After a same-day addition, request only the newly added movie or movies,
   then rebuild the IMDb order.
5. A deliberate pull-to-refresh always requests the complete list, regardless
   of the saved date.

The date is built from the phone's local year, month, and day. It does not use
the UTC date returned by `toISOString()`. For example, 11:30 PM Eastern on
August 25 remains local date `2026-08-25` even though UTC is already August 26.
This prevents a late-evening page visit from being incorrectly treated as a
new day.

The local date and storage behavior are maintained in:

```text
src/utils/storage/localCalendarDate.ts
src/utils/storage/movieUserListsStorage.ts
```

### 6.5 Concurrent-change protection

A card-data refresh can overlap with the customer adding or removing a movie.
Before saving a completed refresh, MovieApp reads the current saved IDs again.
If membership changed while the requests were running, the older result is not
allowed to overwrite the newer customer action. The screen reads the latest
membership and retries once. If it still cannot obtain one complete result, it
keeps the previously saved list rather than writing partial or stale data.

### 6.6 Measured performance and device verification

The performance test used 220 saved Favorites on both platforms. Android was
measured with the same internal list-load timing before and after the change:

| Platform | Previous load | First refresh on a new day | Same-day reopen |
| -------- | ------------: | -------------------------: | --------------: |
| Android  |      4,537 ms |                     115 ms |           86 ms |
| iPhone   |      2,858 ms |                     502 ms |           14 ms |

The Android result is approximately 39 times faster for the daily refresh and
53 times faster for a same-day reopen. The iPhone previous measurement was
taken at the visible screen boundary because the old implementation had no
internal timer; the two new iPhone values are exact app data-load timings, so
they demonstrate the reduction but are not the same measurement boundary as
the old value.

Final simulator verification confirmed:

- 220 Android Favorites and 220 Android Seen movies were complete and sorted;
- 220 iPhone Favorites were complete and sorted;
- Favorites and Seen opened and rendered on both Android and iPhone; and
- every saved test record contained the IMDb and availability values plus the
  correct local refresh date.

## 7. Streaming Now

### 7.1 Home collection

`Streaming Now` appears between `Popular Movies` and `Family Movies` on Home.
The Home request goes directly to TMDb Discover, consistent with the other Home
movie collections, and requests:

```text
sort_by=popularity.desc
watch_region=US
with_watch_monetization_types=flatrate
with_watch_providers=<all supported MovieApp provider IDs joined with |>
```

The pipe separator means a movie may match any supported subscription provider;
it does not have to appear on every provider. `flatrate` means included with a
subscription. Ad-supported-only, rental-only, and purchase-only availability do
not qualify for this Home collection.

### 7.2 Supported subscription services

The shared provider list currently contains:

| Service     | TMDb provider ID |
| ----------- | ---------------: |
| Netflix     |                8 |
| Prime Video |                9 |
| Hulu        |               15 |
| YouTube     |              192 |
| Disney+     |              337 |
| Apple TV+   |              350 |
| Peacock     |              387 |
| AMC+        |              526 |
| Paramount+  |              531 |
| Max         |             1899 |

`src/search/shared/movieStreamers.ts` is the single app-side source for this
list. Home and Advanced Search must continue importing the same list so the
phrase "all supported streamers" cannot mean different providers on different
pages.

### 7.3 Opening Advanced Search

Selecting the `Streaming Now` heading opens Advanced Search with:

- every supported streamer selected;
- popularity sorting selected; and
- the normal Advanced Search language and date defaults applied.

When every supported streamer is selected, the Cloudflare request uses the
broad `watchMonetizationTypes=flatrate` question instead of sending ten separate
provider IDs. This returns movies available through any stored United States
subscription provider, not only the ten companies currently visible in the
selection popup.

Streaming Now participates in the existing Home loading, cache, and
pull-to-refresh behavior.

## 8. Android Drawer Behavior

MovieApp imports `@react-navigation/drawer` directly. That package supplies
`react-native-drawer-layout` as one of its own indirect dependencies. Updating
the installed indirect version from `4.2.4` to `4.2.10` restores Android's
outside-tap behavior: when the drawer is open, tapping the uncovered area closes
it.

Only `package-lock.json` changed for the dependency update because MovieApp does
not import `react-native-drawer-layout` directly. Adding it to `package.json`
would incorrectly declare that MovieApp owns the dependency itself. The old
`patches/react-native-drawer-layout+4.2.4.patch` was removed because 4.2.10
already contains the needed Android and React Native compatibility behavior.

The iPhone drawer already closed on an outside tap and continues using the same
navigation code.

## 9. Home First-View Performance

### 9.1 Previous loading bottleneck

Home contains one hero collection and nine horizontally scrolling movie rows.
The movie-data requests were already small and ran concurrently, but the page
previously prepared the artwork for every collection before allowing the
complete Home content to appear. Posters located several screens below the
customer's current view therefore competed with the hero and Popular Movies for
network transfers, image decoding, memory, and native rendering time.

The customer could not use the first visible portion of Home until work for the
entire page had finished. This was especially noticeable on Android when the
image cache was empty.

### 9.2 Two-phase loading sequence

Home now separates data fetching from the more expensive poster preparation and
screen rendering:

1. All ten movie-data requests still begin together. The change does not delay
   or serialize the small TMDb requests.
2. The first image phase prepares only the hero and Popular Movies, which are
   the two collections visible when Home opens.
3. Both collections remain in their loading state until their required artwork
   has been prepared. The app does not expose unfinished poster cards merely to
   make the screen appear faster.
4. After the hero and Popular Movies are ready, Home waits for two native
   animation frames. The first gives React an opportunity to commit the views;
   the second gives the device an opportunity to paint that completed first
   view.
5. Only after that first view has painted does Home enable poster preparation
   and rendering for Streaming Now and the remaining seven lower collections.
6. Each lower row keeps the existing all-at-once readiness rule: its complete
   poster row replaces its loading state when that row is ready.

This scheduling change does not remove movies, change their ordering, reduce
the number of Home collections, or replace missing artwork with blank cards.
The shared image coordinator continues deduplicating the same poster when it is
used by more than one collection.

The phase controller is maintained in:

```text
src/home/HomeScreen.tsx
src/home/useHomeImagePreparations.ts
src/home/HomeHeroCarousel.tsx
src/home/HomeMoviePosterRow.tsx
```

### 9.3 Full pull-to-refresh behavior

An intentional Home pull-to-refresh remains a complete page rebuild. MovieApp
removes the existing Home content, refreshes all ten movie collections, resets
poster preparation, and then follows the same hero-and-Popular-first sequence
used on a first visit. Old and newly refreshed sections are never mixed on the
same page.

### 9.4 Measured first-view results

These measurements stop when the page framework, hero, and complete Popular
Movies row are ready and painted. They do **not** measure how long it takes to
finish every category farther down Home.

| Platform and condition | Before | After | Result |
| ---------------------- | -----: | ----: | ------ |
| Android Release, cold image cache | 4.468 seconds | 2.807 seconds | 37% faster |
| Android Release, warm image cache | 1.460 seconds | 0.974 seconds | 33% faster and below one second in the measured run |
| iPhone Debug, cold image cache | 0.761 seconds | 1.083-1.132 seconds | The live-network samples varied; the first view remained around one second |
| iPhone Debug, warm image cache | 0.447 seconds | 0.288 seconds | 36% faster |

Android Release and iPhone Debug are reported separately because build modes and
platforms must not be compared directly. The cold measurements include live
network and supplier variability, so they are observations from the controlled
test runs rather than a guarantee for every device or connection.

Native review confirmed the complete first view on Android and iPhone. Android
was also scrolled through the lower categories to confirm that phase two still
rendered complete poster rows without blank-card regressions.

## 10. Store Version and Source-Commit Tracking

### 10.1 Version-setting scripts and Settings-page snapshot

The release versions are prepared with the two platform-specific commands:

```text
scripts/set-ios-version.sh 3.6.1 <next-build-number>
scripts/set-android-version.sh 3.6.1 <next-version-code>
```

The iOS command updates the four app/extension version and build-number pairs in
the Xcode project. The Android command updates `versionName` and `versionCode`
in `android/app/build.gradle`. Each command verifies its native edits and then
runs `scripts/generate-app-build-version.js` to refresh:

```text
src/appVersion/generatedBuildVersion.ts
```

That tracked TypeScript file supplies the installed version displayed by the
MovieApp Settings page. It contains both platforms, so the final version command
run during release preparation writes a snapshot containing the current iOS and
Android values together.

The native file and generated snapshot are one operation. Each script backs up
both files before editing. If native verification or snapshot generation fails,
the script restores both original files rather than leaving one version updated
and the other stale.

The iOS Archive and Android Bundle packaging tasks do not run the generator and
do not modify the tracked snapshot. They package the version information that
was produced by the version-setting scripts and included in the release commit.
This prevents an iPhone archive from creating a tracked change that blocks the
Android bundle's clean-repository check or forces the two artifacts to record
different commits.

The intended release order is:

1. Set the iOS release version.
2. Set the Android release version.
3. Review and commit both native files plus the generated snapshot once.
4. Create the iPhone archive.
5. Create the Android bundle immediately afterward without another commit.

Both artifact records should then contain the same complete Git commit.

### 10.2 Clean source requirement

Both packaging scripts now stop before Xcode or Gradle starts when Git reports
tracked or untracked changes. This prevents a store artifact from containing
local source that has no commit number. The developer must commit or remove the
displayed files and then run the command again.

The scripts capture the complete 40-character commit once immediately before
the build begins. They do not perform a second commit comparison after the
build.

### 10.3 iPhone archive record

After a successful archive, `scripts/iosarchive.sh` reads the version and build
from the finished app's `Info.plist` and creates a separate text file beside the
`.xcarchive`:

```text
Platform: iPhone
Version: 3.6.1
Build: <build-number>
Commit: <complete-40-character-commit>
Archive: <archive-filename>.xcarchive
```

The record is not inserted into or allowed to modify the Xcode archive.

### 10.4 Android bundle record

Gradle always writes the normal bundle as `app-release.aab`. After a successful
build, `scripts/androidbundle.sh` creates a permanent Android archive outside
Gradle's `build` directory. The archive uses the same date grouping as the Xcode
archive history and gives every bundle command its own timestamped folder:

```text
~/Library/Developer/Android/Archives/
  <YYYY-MM-DD>/
    MovieApp-<YYYYMMDD-HHMMSS>/
      MovieApp-<version>-<version-code>.aab
      MovieApp-<version>-<version-code>-commit.txt
```

The preserved bundle filename deliberately does not contain the Git commit. The
neighboring text file already records the complete commit, matching the iPhone
rule of keeping source identification beside the artifact instead of putting it
in the artifact name.

The text file contains:

```text
Platform: Android
Version: 3.6.1
Version Code: <version-code>
Commit: <complete-40-character-commit>
Bundle: MovieApp-3.6.1-<version-code>.aab
```

The normal `app-release.aab` remains available for the existing validation and
Google Play upload workflow. The permanent archived copy survives
`./gradlew clean` and deletion of `android/app/build` because it is stored
outside the Gradle workspace.

## 11. Automated Coverage

The included changes have focused coverage in:

| Test file                                         | Behavior protected                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `__tests__/titleSearchResults.test.ts`            | Five-page limit, early stopping, duplicate removal, and exact-match ordering.   |
| `__tests__/movieDetailTitle.test.ts`              | US title selection, duplicate suppression, and fallback behavior.               |
| `__tests__/movieCardData.test.tsx`                | Missing-poster UI plus batching, concurrency, retries, and response validation. |
| `__tests__/storedMovieListReconciliation.test.ts` | No-change identity, removal, addition, and rating order.                        |
| `__tests__/storedMovieListScreen.test.tsx`        | Same-day reuse, additions, removals, new-day refresh, and manual refresh.       |
| `__tests__/movieUserListsStorage.test.ts`         | Legacy migration, enriched persistence, and concurrent membership protection.   |
| `__tests__/localCalendarDate.test.ts`             | Local-day comparison, including the Eastern-time/UTC date boundary.             |
| `__tests__/homeStreamingSection.test.ts`          | Home placement, TMDb subscription request, and Advanced Search preset.          |
| `__tests__/homeRefresh.test.tsx`                  | First-view phase order, two-frame paint boundary, and complete Home refresh.     |
| `__tests__/homeMoviePosterRow.test.tsx`           | Complete-row poster readiness and unavailable-artwork handling.                 |

The release scripts were also checked with zsh syntax validation. Both version
scripts were exercised against disposable copies to confirm successful native
updates, Settings-page snapshot generation, and complete rollback of both files
when generation fails. The archive and bundle commands were not run while the
release-tracking changes were developed.

Final MovieApp validation through the Home performance work passed all 128 tests
across 33 suites, TypeScript checking, lint, the Android Release build, and the
iOS Debug simulator build. The matching Favorites and Seen Cloudflare change
passed all 101 Worker tests across nine suites plus Worker TypeScript checking.

## 12. 3.6.1 Release Checklist

1. Review commits added after `d33b8e6` and update both 3.6.1 documents if any
   customer-visible or release-process behavior changed.
2. Set every iOS target to version 3.6.1 with the existing iOS version script.
3. Set Android to version 3.6.1 and the next unused Google Play version code
   with `scripts/set-android-version.sh`.
4. Confirm `src/appVersion/generatedBuildVersion.ts` contains the intended iOS
   and Android values.
5. Run the normal automated and native iPhone/Android release checks.
6. Commit every intended release file once and confirm `git status` is clean.
7. Create the iPhone archive and then create the Android bundle without making
   another commit between them.
8. Run the existing archive and bundle validation scripts.
9. Keep each generated commit-record text file beside its matching store
   artifact.
10. Confirm that the complete commit in both text files is the same release
    commit intended for MovieApp 3.6.1 before uploading.
