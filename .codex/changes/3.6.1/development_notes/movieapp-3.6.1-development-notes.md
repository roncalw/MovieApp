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
| Last feature/process commit documented here | `cdf655adbc40fd651a77e62239c05ac932d476c2` |
| Git comparison used                         | `410496f..cdf655a`                         |
| Planned store version                       | `3.6.1`                                    |

The Apple App Store lookup and the public Google Play page both listed version
3.5.2 on August 23, 2026. If more MovieApp changes are committed before the
3.6.1 archive or bundle is created, both this document and
`Deployment Features.md` must be reviewed again so the recorded release range
remains complete.

## 2. Included Change Areas

| Area                   | Customer result                                                                            | Primary maintenance location                           |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Search by Movie Title  | Exact titles appear first across a broader result set.                                     | `src/search/title/titleSearchResults.ts`               |
| Movie Detail title     | A different United States title appears before the normal TMDb title.                      | `src/movie/movieDetailTitle.ts`                        |
| Missing posters        | The movie title is visible on the yellow placeholder artwork.                              | `src/search/results/MovieCard.tsx`                     |
| Favorites and Seen     | Returning from Movie Detail does not reload and rearrange an unchanged grid.               | `src/drawer/StoredMovieListScreen.tsx`                 |
| Streaming Now          | Home shows popular United States subscription movies and opens a matching Advanced Search. | `src/home/homeAdvancedSearchSections.ts`               |
| Android drawer         | Tapping outside the open drawer closes it again.                                           | `package-lock.json`                                    |
| Store release tracking | Each successful store build gets a separate record of the exact source commit.             | `scripts/iosarchive.sh` and `scripts/androidbundle.sh` |

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

## 9. Store Version and Source-Commit Tracking

### 9.1 Android version-setting script

The new command mirrors the existing iOS version-setting workflow:

```text
scripts/set-android-version.sh 3.6.1 <next-version-code>
```

It updates only `versionName` and `versionCode` in
`android/app/build.gradle`. Before keeping the edit, it verifies that the file
contained exactly one of each setting and that both requested values were
written successfully. A failed edit restores the unchanged temporary copy.

### 9.2 Clean source requirement

Both packaging scripts now stop before Xcode or Gradle starts when Git reports
tracked or untracked changes. This prevents a store artifact from containing
local source that has no commit number. The developer must commit or remove the
displayed files and then run the command again.

The scripts capture the complete 40-character commit once immediately before
the build begins. They do not perform a second commit comparison after the
build.

### 9.3 iPhone archive record

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

### 9.4 Android bundle record

Gradle always writes the normal bundle as `app-release.aab`. After a successful
build, `scripts/androidbundle.sh` preserves a release-named copy using this
pattern:

```text
MovieApp-<version>-<version-code>-<short-commit>.aab
```

A separate neighboring text file records:

```text
Platform: Android
Version: 3.6.1
Version Code: <version-code>
Commit: <complete-40-character-commit>
Bundle: <release-named-bundle>.aab
```

The normal `app-release.aab` remains available for the existing validation and
Google Play upload workflow.

## 10. Automated Coverage

The included changes have focused coverage in:

| Test file                                         | Behavior protected                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `__tests__/titleSearchResults.test.ts`            | Five-page limit, early stopping, duplicate removal, and exact-match ordering.  |
| `__tests__/movieDetailTitle.test.ts`              | US title selection, duplicate suppression, and fallback behavior.              |
| `__tests__/movieCardData.test.tsx`                | Missing-poster title and shopping-bag coexistence.                             |
| `__tests__/storedMovieListReconciliation.test.ts` | No-change identity, removal, addition, and rating order.                       |
| `__tests__/storedMovieListScreen.test.tsx`        | Initial loading and return-from-detail synchronization for Favorites and Seen. |
| `__tests__/homeStreamingSection.test.ts`          | Home placement, TMDb subscription request, and Advanced Search preset.         |
| `__tests__/homeRefresh.test.tsx`                  | Streaming Now participation in Home refresh behavior.                          |

The release scripts were also checked with zsh syntax validation. The Android
version script was exercised against disposable copies for both a successful
replacement and a failed verification that restored the original file. The
archive and bundle commands were not run while the release-tracking change was
developed.

## 11. 3.6.1 Release Checklist

1. Review commits added after `cdf655a` and update both 3.6.1 documents if any
   customer-visible or release-process behavior changed.
2. Set every iOS target to version 3.6.1 with the existing iOS version script.
3. Set Android to version 3.6.1 and the next unused Google Play version code
   with `scripts/set-android-version.sh`.
4. Run the normal automated and native iPhone/Android release checks.
5. Commit every intended release file and confirm `git status` is clean.
6. Create the iPhone archive and Android bundle using the existing packaging
   commands.
7. Run the existing archive and bundle validation scripts.
8. Keep each generated commit-record text file beside its matching store
   artifact.
9. Confirm that the complete commit in each text file is the release commit
   intended for MovieApp 3.6.1 before uploading.
