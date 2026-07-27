# Movie Image Loading and Refresh Plan

This plan repairs the unreliable poster loading seen in the Google Play build while keeping the implementation shared between Android and iPhone. Android receives additional release-build testing because that is where the defect currently appears.

- **Keep the complete Home experience.**

  - Do not reduce the number of poster cards initially rendered.
  - Preserve every Home section and its existing horizontal scrolling.
  - Keep the same Home design on Android and iPhone.

- **Instrument image loading before changing its behavior.**

  - Add temporary `onLoadStart`, `onLoad`, `onLoadEnd`, and `onError` diagnostics.
  - Record the movie ID, screen, image URL, platform, retry attempt, and native error message.
  - Determine whether missing posters result from downloading, decoding, caching, cancellation, or rendering failures.
  - Keep production diagnostics controlled so normal users are not flooded with logs.

- **Check the refresh-related changes introduced after the previous production version.**

  - Compare the current Home implementation with production marker `f35c5a7`.
  - Test whether the added nested-scroll settings contribute to the Android problem.
  - Keep the poster count, `w500` URLs, and Home layout unchanged during this comparison.
  - Remove a scroll setting only if release-build testing proves that it is unnecessary or harmful.
  - This is the only part that might require an Android-specific adjustment.

- **Create one coordinated Home data-loading operation for both platforms.**

  - Start all nine Home movie-data requests together.
  - Continue using TanStack Query so the existing query cache remains available.
  - Coordinate completion with `Promise.allSettled`.
  - Allow successful categories to remain usable if one category fails.
  - Begin image preparation after the coordinated data operation settles.

- **Preload all unique Home images before displaying the completed page.**

  - Collect poster URLs from the hero and all Home categories.
  - Remove duplicates so a poster appearing in multiple categories is downloaded only once.
  - Preload each unique URL using React Native's `Image.prefetch()` API.
  - Coordinate those preloads with `Promise.allSettled`.
  - Display the prepared Home page after image loading settles or reaches its timeout.
  - Use the same implementation on Android and iPhone.

- **Add a loading timeout and partial-success behavior.**

  - Never leave Home stuck because one TMDB image request hangs.
  - After a reasonable timeout, display Home with every successfully prepared poster.
  - Show the local missing-image placeholder for failed or unfinished posters.
  - Retain the failed URL list so those images can be retried later.

- **Display the prepared Home page in one coordinated update.**

  - Fetch all Home categories together.
  - Prepare their poster images.
  - Display all completed categories in one update rather than adding each row separately.
  - If one category fails, display the successful categories and show an error only for the failed category.
  - Do not remove, delay, or reduce the number of cards in successful categories.

- **Create one reusable movie-image component.**

  - Use the component for Home posters, search-result cards, stored movie lists, and other applicable movie images.
  - Give it explicit loading, success, failure, placeholder, and retry states.
  - Handle both missing TMDB paths and actual network failures.
  - Prevent blank or unexplained gray cards.
  - Accept the appropriate image URL, display dimensions, and refresh signal as properties.
  - Keep its behavior consistent across Android and iPhone.

- **Add controlled image retry behavior.**

  - Retry a failed image only a limited number of times.
  - Add a short delay before each retry.
  - Avoid endless request loops when the device is offline or TMDB is unavailable.
  - Show the placeholder after the retry limit.
  - Allow a later page refresh to give failed images another controlled retry cycle.

- **Make Home pull-to-refresh reload data and images together.**

  - Refetch all nine Home movie collections as one coordinated operation.
  - Build the refreshed list of unique poster URLs.
  - Reuse posters that already loaded successfully.
  - Preload newly introduced posters.
  - Retry posters that failed during a previous load.
  - Keep the current Home page visible while refresh runs.
  - Publish the refreshed data after the coordinated operation settles or times out.
  - Stop the refresh indicator only after the data and image stages finish.

- **Ensure unchanged poster URLs can genuinely retry.**

  - TMDB commonly returns the same movie IDs and poster URLs after refresh.
  - A previously failed Android image may not retry when its URL remains unchanged.
  - Give the reusable image component a controlled refresh-generation signal.
  - Force another native loading attempt only for failed images.
  - Leave successful images in the native cache.
  - Do not append random timestamps to every URL because that would create unnecessary duplicate cache entries.

- **Change Advanced Search refresh to rerun the active search.**

  - Preserve the submitted genres, ratings, dates, providers, sort order, and "exclude seen" selection.
  - Rerun that exact submitted query.
  - Keep the existing results visible while the refreshed results load.
  - Prepare newly returned poster images before displaying the new result set.
  - Do not clear the filters or return the user to an empty search form.

- **Change Title Search refresh to rerun the active title search.**

  - Preserve the current search text.
  - Refetch the first page for that title.
  - Keep the existing results visible while refreshing.
  - Reset pagination consistently after the refreshed first page arrives.
  - Keep "Clear Search" as a separate explicit action.

- **Preserve the existing gesture ownership and scrolling behavior.**

  - Do not add pull-to-refresh to the movie-results list.
  - Swiping downward while viewing later result pages must continue moving backward through those results.
  - Do not intercept normal result-list scrolling.
  - Keep refresh limited to its existing designated top or header area.
  - Preserve the Advanced Search upward swipe that hides the filters.
  - Test only to confirm that the image and refresh changes did not alter these gestures.

- **Keep `w500` during the primary repair.**

  - The legacy application successfully used `w500`.
  - The previous production version also used `w500`.
  - Changing image sizes during diagnosis would introduce another variable.
  - First make loading, failure handling, and refresh reliable with the existing image URLs.

- **Consider smaller card images only as a later optimization.**

  - After the defect is fixed, compare `w342` and `w500` on multiple screen densities.
  - Keep an appropriately large image for the Home hero.
  - Change card sizes only if smaller images remain visibly sharp.
  - Treat this as an optional performance improvement, not the primary repair.

- **Add automated coverage for coordinated loading.**

  - Verify that all Home data requests begin as one coordinated operation.
  - Verify that duplicate poster URLs are prefetched once.
  - Verify that one failed category does not block successful categories.
  - Verify that one failed poster does not block Home.
  - Verify loading-timeout behavior.
  - Verify retry limits and placeholder behavior.
  - Verify that Home refresh retries failed images even when their URLs are unchanged.
  - Verify that Advanced and Title Search refresh preserve and rerun their active searches.
  - Verify that normal result-list scrolling remains unchanged.

- **Test cold and warm application launches on both platforms.**

  - Test with an empty image cache to reproduce a clean installation.
  - Test again with a warm cache to confirm successful posters are reused.
  - Test normal Wi-Fi, slower networking, temporary network loss, and restored connectivity.
  - Confirm that Home eventually appears even if individual posters fail.
  - Confirm that failed posters display placeholders instead of gray cards.

- **Perform additional release-build verification on Android.**

  - Use a signed release build or Google Play internal-testing build rather than relying only on Metro or debug mode.
  - Clear application storage before each cold-start test.
  - Test on a physical Android phone.
  - Capture native image errors during initial Home loading and pull-to-refresh.
  - Give Android extra verification because that is where the current production defect appears, not because the shared implementation is Android-only.

- **Run complete iPhone regression testing.**

  - Confirm that coordinated loading does not delay Home unnecessarily.
  - Confirm that the hero, poster rows, and horizontal scrolling still work.
  - Confirm that Home refresh reloads data and failed images.
  - Confirm that search refresh preserves the current search.
  - Confirm that placeholders and retries work consistently.
  - Confirm that existing search gestures remain unchanged.

- **Release through Google Play internal testing before production.**

  - Install the build as a clean store installation.
  - Repeat cold-start and pull-to-refresh testing.
  - Test more than one Android device or Android version when possible.
  - Confirm that navigating away and returning is no longer required to recover missing posters.
  - Promote the build only after cold-cache loading and refresh work reliably.

## Implementation and Verification Record

Completed on July 26, 2026:

- **Implemented coordinated Home loading without removing cards.**

  - All nine existing TanStack Query hooks still start together.
  - Their results are converted into one Home snapshot after every query settles.
  - All unique hero and row image URLs are prepared together with `Promise.allSettled` before that snapshot is displayed.
  - One failed category keeps its previous data and receives its own error state; successful categories are still published.
  - Home keeps its current snapshot visible during refresh and replaces it only after refreshed data and image preparation finish.

- **Implemented shared, observable movie-image behavior.**

  - `MovieRemoteImage` is now used by Home, search cards, filmography movie cards, and the Movie Detail poster.
  - It records load start, load success, load end, native failure details, screen context, movie ID, URL, platform, and attempt number.
  - It retries twice with a short delay, then shows the existing local poster placeholder.
  - The missing-poster artwork is not used as a loading placeholder; it appears only when TMDB provides no image URL or after the real image exhausts its retries.
  - A refresh generation retries only images that are still failed; successful URLs continue using the native cache.
  - URLs remain `w500`, matching both the legacy app and the previous production version.

- **Implemented real refresh behavior.**

  - Home refetches all nine collections and prepares the resulting image set.
  - Title Search refetches the currently submitted title instead of clearing the form.
  - Advanced Search refetches the currently submitted filters instead of resetting them.
  - Refresh waits for both JSON and image preparation before its indicator completes.

- **Preserved gesture ownership.**

  - No refresh control was added to either results list.
  - Pull-to-refresh remains in the existing top/header refresh area.
  - Advanced Search still recognizes its upward swipe to hide filters.
  - Unnecessary nested-scroll flags were removed from Home's outer and horizontal scrolling containers; no Android-only branch was added.

- **Automated verification passed.**

  - TypeScript: `npm run tsne`.
  - ESLint: `npm run lintq`.
  - Jest: 18 suites and 57 tests passed.
  - Coverage added for simultaneous Home refetch starts, partial category failure, URL deduplication, native-cache reuse, image-preparation failure and timeout, bounded retry, fallback display, and refresh-generation retry.
  - The existing Advanced Search swipe and preset-submission tests remain green.

- **Native build verification passed.**

  - Android debug APK built successfully.
  - Bundled and signed Android release APK built successfully.
  - iPhone simulator Debug app built successfully with Xcode.

- **Android release emulator verification passed on Galaxy S22 API 34.**

  - Uninstalled the previous app and installed the release APK, providing an empty application cache.
  - Home displayed its hero and complete visible poster rows on the first launch.
  - Home pull-to-refresh completed, changed the fetched hero content, and left posters visible without navigating away.
  - Title Search returned poster results for `Matrix`; header refresh preserved `Matrix` and the results.
  - The results list was scrolled several screens downward, then backward toward the top without invoking refresh.
  - Advanced Search returned poster results, refresh preserved the submitted search, and the upward swipe still changed `Hide Filter` to `Show Filter`.
  - Filtered Logcat output contained no `Movie image` failure, React Native fatal exception, or Android runtime crash.

- **iPhone simulator regression verification passed on iPhone 17 Pro Max, iOS 26.5.**

  - Uninstalled and reinstalled the simulator app for a clean application state.
  - Home displayed its hero and poster rows.
  - Title Search returned poster results for `Matrix`.
  - Header refresh preserved `Matrix` and its results.
  - No movie-image failure was found in the captured native log. Simulator-only OneSignal startup retries and Core Haptics warnings were unrelated to poster loading.

Remaining release gates that require external hardware or distribution access:

- No physical Android device is connected to this Mac, so the physical-device cold-start item cannot be executed locally.
- Google Play internal testing requires uploading this build through the project's Play Console release process.
- Those two checks should still be completed before production promotion because the original defect was reported only in the Google Play build on physical Android hardware.
