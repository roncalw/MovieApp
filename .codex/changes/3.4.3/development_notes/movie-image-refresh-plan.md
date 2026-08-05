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
  - Clear the current Home snapshot immediately so the page visibly returns to its normal loading state.
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
  - Clear the infinite-query result pages and page cursors before the request, then display only the new first-page response.
  - Prepare newly returned poster images before displaying the new result set.
  - Do not clear the filters or return the user to an empty search form.

- **Change Title Search refresh to rerun the active title search.**

  - Preserve the current search text.
  - Refetch the first page for that title.
  - Clear the infinite-query result pages and numeric page parameters before the request, then display only the new first-page response.
  - Restart pagination at page one after the refreshed first page arrives.
  - Keep "Clear Search" as a separate explicit action.

- **Preserve the existing gesture ownership and scrolling behavior.**

  - Put pull-to-refresh on the movie-results list because that is the content the user is actually pulling.
  - Let the native list activate refresh only when it is already at the top.
  - Swiping downward while viewing later result pages must continue moving backward through those results without refreshing.
  - Let each native refresh control own the pull threshold and release signal; hold iPhone's early callback until its results list reports the real drag-end event.
  - Preserve the Advanced Search upward swipe that hides the filters.
  - Confirm these behaviors on both platforms in addition to the automated gesture tests.

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

Completed through July 28, 2026:

- **Implemented coordinated Home loading without removing cards.**

  - All nine existing TanStack Query hooks still start together.
  - Their results are converted into one Home snapshot after every query settles.
  - All unique hero and row image URLs are prepared together with `Promise.allSettled` before that snapshot is displayed.
  - One failed category keeps its previous data and receives its own error state; successful categories are still published.
  - Home clears its current snapshot during refresh, displays the standard loading indicator, and publishes one rebuilt snapshot only after refreshed data and image preparation finish.

- **Implemented shared, observable movie-image behavior.**

  - `MovieRemoteImage` is now used by Home, search cards, filmography movie cards, and the Movie Detail poster.
  - It records load start, load success, load end, native failure details, screen context, movie ID, URL, platform, and attempt number.
  - It retries twice with a short delay, then shows the existing local poster placeholder.
  - The missing-poster artwork is not used as a loading placeholder; it appears only when TMDB provides no image URL or after the real image exhausts its retries.
  - A refresh generation retries only images that are still failed; successful URLs continue using the native cache.
  - URLs remain `w500`, matching both the legacy app and the previous production version.

- **Implemented real refresh behavior.**

  - Home refetches all nine collections and prepares the resulting image set.
  - Title Search preserves the submitted title and directly requests page one again instead of clearing the form or asking TanStack Query to reuse cached data.
  - Advanced Search preserves the submitted filters and directly requests its first cursor page again instead of resetting the filters or reusing cached data.
  - Both explicit refresh requests send no-cache headers and a unique refresh-request URL parameter, preventing the native HTTP cache from satisfying the reload from the identical prior URL.
  - Before the server request starts, both searches empty their real infinite-query `pages` and `pageParams` arrays. This removes the cards and discards every old paging cursor rather than merely hiding the rendered cards.
  - After the response arrives, only the refreshed first page and its initial page parameter are stored, so later scrolling continues from the newly restarted result set.
  - If the replacement request fails, the previous pages and paging values are restored so a temporary network failure cannot strand the search on an unexplained blank screen.
  - The transition is driven by the real request's `refreshing` state; it is not a timer-only animation.
  - Refresh waits for both JSON and image preparation before its indicator completes.

- **Preserved gesture ownership.**

  - Pull-to-refresh is attached to the actual results `FlatList`, fixing Android where the short header could not reliably activate its refresh control.
  - Each search page now renders its header or filters and result cards inside one `FlatList`, using React Native's standard native refresh props. A separate maroon activity indicator mirrors the same real `refreshing` state so the reload remains visually obvious on both platforms.
  - A shared release gate lets the native indicator react to the pull without starting the request early. iPhone's early callback waits for `onScrollEndDrag`; Android's `SwipeRefreshLayout` callback already follows its native `ACTION_UP` release and runs directly. Both platforms therefore clear pages and start the HTTP request only after release.
  - The obsolete separate search-page scroll layout was removed. `MovieResults` now contains the one release gate the native lists require: iPhone waits for the list's drag-end event, while Android uses its native post-release refresh callback.
  - A results list that is below offset zero continues scrolling backward normally; native pull-to-refresh can activate only after that list reaches its top.
  - Advanced Search records a touch that starts in its filter fields while the results list owns movement. Raw touch movement covers iPhone and short pages; the list's native scroll offset covers Android after it takes ownership of a scrollable drag.
  - Unnecessary nested-scroll flags were removed from Home's outer and horizontal scrolling containers. The filter-swipe implementation is shared; the only platform condition is the native refresh-release timing described above.

- **Automated verification passed.**

  - TypeScript: `npm run tsne`.
  - ESLint: `npm run lintq`.
  - Jest: 22 suites and 71 tests passed.
  - Coverage added for simultaneous Home refetch starts, partial category failure, URL deduplication, native-cache reuse, image-preparation failure and timeout, bounded retry, fallback display, and refresh-generation retry.
  - Query-level coverage proves that refresh immediately clears the cached multi-page result set and every page parameter, performs one real first-page request, and stores only that new first page.
  - Results-list coverage proves that the page callback and refreshing state reach the native list and that a visible progress indicator is rendered.
  - Release-timing coverage proves that iPhone does not call the real refresh function while a drag is held, calls it once on drag end, and does not leave Android waiting for a ScrollView event its native refresh control does not emit.
  - Gesture-ownership coverage proves that list-owned native scrolling still collapses Advanced Search filters without replacing the refresh drag handlers.
  - A native XCUITest launched the iPhone app, submitted `Matrix` in Title Search, submitted the default Advanced Search filters, performed a long pull on each real results list, and verified that both refreshed first pages repopulated.
  - The existing Advanced Search swipe and preset-submission tests remain green.

- **Native build verification passed.**

  - Android debug APK built successfully.
  - Bundled and signed Android release APK built successfully.
  - iPhone simulator Debug app built successfully with Xcode.

- **Android release emulator verification passed on Galaxy S22 API 34.**

  - Uninstalled the previous app and installed the release APK, providing an empty application cache.
  - Home displayed its hero and complete visible poster rows on the first launch.
  - Home pull-to-refresh completed, changed the fetched hero content, and left posters visible without navigating away.
  - Title Search returned poster results for `Matrix`; an explicit held touch showed the native pull indicator without firing early, release preserved `Matrix`, the old cards cleared, and a fresh page-one result set repopulated.
  - Advanced Search returned its default filtered results; an explicit held pull displayed the native indicator, release kept the same filters, the old cards cleared, and a fresh page-one result set repopulated.
  - The results list was scrolled several screens downward, then backward toward the top without invoking refresh.
  - Advanced Search returned poster results, refresh preserved the submitted search, and the upward swipe still changed `Hide Filter` to `Show Filter`.
  - Filtered Logcat output contained no `Movie image` failure, React Native fatal exception, or Android runtime crash.

- **iPhone simulator regression verification passed on iPhone 17 Pro Max, iOS 26.5.**

  - Uninstalled and reinstalled the simulator app for a clean application state.
  - Home displayed its hero and poster rows.
  - Title Search returned poster results for `Matrix`.
  - A simulator recording confirmed that Title Search refresh preserved `Matrix`, displayed the native pull indicator, cleared the old cards after release, and repopulated from the new first-page response.
  - The same recording confirmed that Advanced Search kept its submitted filters, displayed the native pull indicator, cleared the old cards after release, and repopulated from the new first-page response.
  - No movie-image failure was found in the captured native log. Simulator-only OneSignal startup retries and Core Haptics warnings were unrelated to poster loading.
  - Final manual checks confirmed the filter-collapse and pull-to-refresh gestures behave correctly on both iPhone and Android.

Remaining release gates that require external hardware or distribution access:

- No physical Android device is connected to this Mac, so the physical-device cold-start item cannot be executed locally.
- Google Play internal testing requires uploading this build through the project's Play Console release process.
- Those two checks should still be completed before production promotion because the original defect was reported only in the Google Play build on physical Android hardware.
