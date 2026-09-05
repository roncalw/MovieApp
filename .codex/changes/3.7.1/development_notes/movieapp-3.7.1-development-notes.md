# MovieApp 3.7.1 Development Notes

## 1. Read This First

MovieApp 3.7.1 makes five parts of the application easier to use:

1. A provider shown under ads, subscriptions, or rent on Movie Details can open
   the exact movie when supported and its official service homepage otherwise.
2. Advanced Search includes an `Other` choice for direct subscription services
   beyond the ten services displayed separately.
3. Favorites and Movies I Have Seen display saved movies immediately instead
   of making the customer wait for refreshed card information.
4. YouTube trailers start and enter full-screen playback with fewer taps.
5. A manual swipe stops the Home featured-movie rotation, while a Home refresh
   restores the page to its initial automatic behavior.

The release also separates iOS development builds from the App Store build.
Installing `Movie Time Dev` on a physical iPhone no longer replaces the
production `Movie Time` application or its local Favorites and Seen data.

### Simple before-and-after view

| Area                 | MovieApp 3.6.1                                                                      | MovieApp 3.7.1                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subscription choices | Providers appeared as one list and did not preserve the playback route clearly.     | Direct and channel routes remain separate, and the selected route opens its actual playback platform.                                                         |
| Provider tap         | Provider rows did not open a movie destination.                                      | Every provider shown under ads, subscription, or rent has a compact `Watch Now` button. The Worker opens an exact title when it can and otherwise opens that provider route's official homepage. |
| Streamer search      | Add All included every subscription provider, but smaller direct services could not be selected as their own group. | The Movie Time `Other` tile selects direct subscription services outside the ten individually displayed choices and combines with named services using OR. |
| Favorites and Seen   | The screen could remain blank while ratings and availability refreshed.             | The locally saved movies appear first; card information refreshes afterward.                                                                                  |
| Movie titles         | A different United States title and standard title shared one slash-separated line. | The United States title is primary and the standard title appears beneath it as an italic `(a.k.a. ...)` line.                                                |
| YouTube trailers     | The customer could need separate play and full-screen actions.                      | Playback starts automatically and the player enters full-screen automatically.                                                                                |
| Home hero            | The featured movie continued rotating after a manual swipe.                         | A manual swipe stops rotation; pull-to-refresh recreates Home and starts rotation again.                                                                      |
| iPhone development   | A Debug install could use the production application identity.                      | Debug installs as `Movie Time Dev` with separate local storage; Release keeps the production identity.                                                        |

## 2. Release Boundary

This document covers the final MovieApp changes completed after the 3.6.1
release preparation commit.

| Release item                                      | Value                                      |
| ------------------------------------------------- | ------------------------------------------ |
| Previous production version                       | `3.6.1`                                    |
| Previous iOS build                                | `4`                                        |
| Previous Android version code                     | `85`                                       |
| Previous release commit                           | `fe8fe770b4dca204dc53d1c1b0023a1d81985ed7` |
| First included feature commit                     | `cbbc98c6d9d2cc94fc41ce1fcd321c75aa36e6e4` |
| Last committed feature before release preparation | `d97242868d3a7c1dded1fdd283ac3cf558b3da88` |
| Git comparison for committed features             | `fe8fe77..d972428`                         |
| iOS release version                               | `3.7.1 (1)`                                |
| Android release version                           | `3.7.1 (86)`                               |
| Deployed Worker version for final provider routing | `93842a1c-c9f6-445e-b0ae-f92b728a1cd1`     |

The final release commit will also contain this documentation, the final
provider-action presentation, and the three tracked version files prepared for
3.7.1:

```text
src/api/cloudflare/streamingLinkService.ts
src/api/cloudflare/streamingProviderCatalog.ts
src/api/cloudflare/streamingProviderService.ts
src/api/cloudflare/subscriptionRoutes.ts
src/api/tmdb/services/movieService.ts
src/home/homeAdvancedSearchSections.ts
src/movie/components/MovieDetailInfoSections.tsx
src/movie/streaming/groupSubscriptionProviders.ts
src/movie/streaming/launchStreamingProvider.ts
src/movie/streaming/useStreamingProviderLaunch.ts
src/search/advanced/fields/movieSearchFieldUtils.ts
src/search/shared/movieStreamers.ts
src/styles/movie/movieDetailInfoSectionStyles.ts
android/app/build.gradle
ios/MovieApp.xcodeproj/project.pbxproj
src/appVersion/generatedBuildVersion.ts
```

The exact release commit does not appear in this document because it does not
exist until these files are committed. The iOS and Android packaging scripts
record that final 40-character commit beside their finished artifacts.

## 3. Included Change Areas

| Area                  | Final result                                                                                | Primary maintenance location                                         |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Subscription display  | Current TMDB subscription routes are grouped by direct service or parent playback platform. | `src/movie/streaming/groupSubscriptionProviders.ts`                 |
| Provider catalog      | MovieApp downloads provider labels, grouping, playback platforms, and official homepages from Cloudflare D1. | `src/api/cloudflare/streamingProviderService.ts`       |
| Provider launch       | A selected ad, subscription, or rental route opens an exact movie destination when supported, then its official homepage as the final fallback. | `src/movie/streaming/useStreamingProviderLaunch.ts` |
| Provider action       | A compact play-icon and regular-weight `Watch Now` button exposes the provider launch action. | `src/movie/components/MovieDetailInfoSections.tsx`                 |
| Streamer search groups | Each named tile covers all direct TMDB providers on that playback platform; `Other Streamers` covers the remaining direct platforms. | Cloudflare D1 `tmdb_watch_provider_lookup.playback_platform` |
| Provider attribution  | The footer identifies and links to Movie of the Night.                                      | `src/movie/components/MovieDetailInfoSections.tsx`                   |
| Safe iOS development  | Debug and Release use separate application identities.                                      | `ios/MovieApp.xcodeproj/project.pbxproj`                             |
| Alternate titles      | A distinct standard title appears on its own `(a.k.a. ...)` line.                           | `src/movie/movieDetailTitle.ts`                                      |
| Favorites and Seen    | Saved movies render before the daily card-data refresh completes.                           | `src/drawer/StoredMovieListScreen.tsx`                               |
| Trailer playback      | YouTube starts automatically and enters a platform-appropriate full-screen player.          | `src/movie/components/MovieTrailerModal.tsx`                         |
| Home hero             | Manual swiping stops rotation and a page refresh restores it.                               | `src/home/HomeHeroCarousel.tsx`                                      |
| Release version       | Both native projects and the Settings snapshot identify 3.7.1.                              | Platform project files and `src/appVersion/generatedBuildVersion.ts` |

## 4. Provider Routes and Watch Now Links

### 4.1 Responsibility is intentionally divided

The feature keeps availability and destination lookup as two different
questions:

| Question                                                                            | Owner                                                      |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Is this subscription route currently available for this movie in the United States? | TMDB watch-provider data                                   |
| How should MovieApp label and group the exact TMDB provider ID?                     | Cloudflare D1 provider catalog                             |
| Which application or website plays the selected route?                              | The route's `playbackPlatform` value                       |
| What is the exact provider movie ID or URL?                                         | The Cloudflare Worker resolver and route-specific D1 cache |
| What happens when no exact movie destination can be resolved?                       | The official route homepage stored in Cloudflare D1        |

The Worker cache never causes a provider to appear in Movie Details. MovieApp
renders only routes returned by current TMDB watch-provider data. Every visible
ad-supported, subscription, and rental row receives the same `Watch Now`
action. The selected row's exact TMDB provider ID and monetization type are sent
to the Worker only after the customer taps it.

### 4.2 Exact provider IDs preserve the subscription route

A service sold directly and the same service sold through another platform can
have different TMDB provider IDs. MovieApp retains that original ID throughout
grouping, display, lookup, validation, and logging.

For example, direct AMC+ uses TMDB provider `526`, while AMC+ through Prime
Video Channels uses provider `528`. They may display the same service name, but
they are different choices:

| Selected row                        | Displayed service | Playback platform |
| ----------------------------------- | ----------------- | ----------------- |
| Direct provider `526`               | AMC+              | AMC+              |
| Prime Video Channels provider `528` | AMC+              | Prime Video       |

MovieApp does not guess which subscription the customer owns. When TMDB returns
both exact routes, both remain visible and the customer chooses the appropriate
one.

### 4.3 Grouping rules

The `Direct Subscriptions` panel can contain direct service rows followed by
non-empty parent-platform groups. The configured group labels are:

- Prime Video Channels
- Disney+
- Apple TV Channels
- The Roku Channel

The grouping transformation follows these rules:

1. Start with the exact United States `flatrate` providers returned by TMDB.
2. Look up each exact provider ID in the centralized route catalog.
3. Remove a repeated occurrence of the same provider ID.
4. Keep different provider IDs even when their displayed service names match.
5. Render direct services first.
6. Render only parent-platform groups that contain at least one current route.
7. Keep a newly introduced, unconfigured TMDB provider visible, but temporarily
   disable its button until its official homepage is entered in D1.
8. Require every provider in the current TMDB catalog to have a reviewed
   official homepage. The disabled state is a defensive guard and is not the
   normal state for a provider shown to customers.

Grouping applies only to subscription availability. Ad-supported and rental
providers remain flat lists, and each of their rows now has the same launch
action.

### 4.4 Advanced Search Other choice

Advanced Search has twelve individually selectable named service logos,
including STARZ and MGM+. A wide thirteenth tile labelled `Other Streamers`
sits on its own row beneath them.

| Customer selection | Search meaning |
| ------------------ | -------------- |
| One or more named logos | A movie can match any direct TMDB provider record on a selected playback platform. |
| Other Streamers | A movie can match any direct subscription provider outside the twelve named playback platforms. |
| Named logo plus Other | A movie can match the named provider or any Other direct provider. |
| Add All | A movie can match any current subscription route, including direct services and parent-platform channels. |

`other_direct` is a search instruction rather than a made-up TMDB provider ID.
Each named tile sends one representative provider ID. The Worker reads that
record's existing `playback_platform` and matches every direct provider on the
same platform. Peacock Premium `386` and Peacock Premium Plus `387`, for
example, both use `peacock`; selecting Peacock finds either plan, and selecting
Other finds neither. AMC and AMC+ likewise remain together on the AMC platform.
Parent-platform channel routes remain separate because their subscription
category is not `direct`. No new provider table or column is required.

Production validation used the same filters shown in the reported phone
screenshot. `Obsession` (TMDB `1339713`), which TMDB currently lists on Peacock
Premium, disappeared from Other Streamers and remained in the Peacock results.
The Worker returned successful pages for both searches.

### 4.5 Tap and launch flow

No destination lookup occurs while Movie Details is loading or while the
customer scrolls. The provider action uses the Advanced Search Submit button's
cream fill, maroon border, maroon text, and pill shape in a smaller layout. The
triangular play icon is solid, while the `Watch Now` words use regular font
weight.

```text
Customer selects the play-icon + Watch Now button
        |
        v
The selected row immediately shows a spinner
        |
        v
Send movie ID + exact provider ID + offer type + US region to the Worker
        |
        v
Worker reads the selected provider route from D1
        |
        +-- Exact movie destination found --> Open the validated movie destination
        |
        +-- No exact destination found ------> Open the D1 official route homepage
```

The mobile request has a 20-second timeout. MovieApp rejects a response when
its movie ID, provider ID, country, content ID, or URL does not match the
request and provider rules. It does not open a search page, trailer, unrelated
title, or guessed URL as a substitute.

Only one provider lookup can be active for a Movie Detail screen. Repeated taps
are ignored while it is running. A pending request is cancelled when the movie
changes, the screen loses focus, or the component unmounts. Cancellation also
prevents a delayed browser launch after the customer has left the page.

### 4.6 Worker dependency and server-side security

The mobile feature requires the Worker's `GET /streaming-link` and
`GET /streaming-providers` endpoints and D1 migrations `0029`, `0030`, `0035`,
`0036`, and `0037`.

The Worker resolution order is:

1. A validated route-specific D1 destination.
2. Reusable provider candidates learned during an earlier lookup.
3. TMDB external identifiers and Wikidata.
4. Streaming Availability API by Movie of the Night as the controlled backup.
5. The official provider or parent-platform homepage stored in D1 when the
   exact-title sources produce no valid destination.

Route-specific exact destinations are keyed by movie ID, exact TMDB provider
ID, monetization type, and country. A subscription result cannot overwrite a
rental result, and direct and parent-platform routes cannot overwrite each
other merely because their visible service name is similar.

The backup API key remains in Cloudflare. It is not compiled into the iOS or
Android application, returned in the endpoint response, placed in redirect
URLs, or written to structured logs. The Worker also owns backup-request budget
enforcement, leases, cooldowns, and cached outcomes.

The Worker maintenance guide is:

```text
/Users/croncallo/repo/movieapp-cloudflare/docs/streaming-links.md
```

Provider metadata is maintained once in the Cloudflare D1
`tmdb_watch_provider_lookup` table. MovieApp downloads and locally caches that
catalog; it does not carry a second mutable list of provider IDs or homepages.
When TMDB introduces a provider, review its route and official homepage in D1,
then verify that the public catalog reports it as launchable.

### 4.7 Attribution

The Movie Details footer now shows the Movie of the Night logo and name beside
the existing TMDB and JustWatch credits. Selecting it opens a small accessible
credit dialog with a link to the supplier website. This replaces the former
long attribution sentence at the bottom of the page while retaining the
required supplier identification.

## 5. Safe iOS Development Installation

### 5.1 The data-loss risk

iOS identifies an installed application by bundle identifier, not by the name
under its icon. When a development build uses the production bundle identifier,
installing it can replace the App Store copy. Because Favorites and Seen are
stored locally, removing or replacing that application can also remove the
production application's local data.

### 5.2 Final Debug and Release identities

| Build configuration | Display name     | Application bundle identifier | Notification extension identifier                                 |
| ------------------- | ---------------- | ----------------------------- | ----------------------------------------------------------------- |
| Debug               | `Movie Time Dev` | `com.codefest.movieapp.dev`   | `com.codefest.movieapp.dev.OneSignalNotificationServiceExtension` |
| Release             | `Movie Time`     | `com.codefest.movieapp`       | `com.codefest.movieapp.OneSignalNotificationServiceExtension`     |

The two applications now install beside each other and receive separate iOS
containers. Favorites, Seen movies, application settings, and other local
records created in `Movie Time Dev` cannot replace the corresponding App Store
records in `Movie Time`.

The physical-iPhone task explicitly requests Debug mode:

```text
npm run iphone16promax
```

Release archives continue using the production name and identifiers. No
production push-notification or App Store identity was renamed.

## 6. Movie Detail Alternate Titles

`getMovieDetailTitles` keeps the stored TMDB movie title unchanged and prepares
display-only title values for Movie Details.

The selection rules are:

1. Read non-empty alternative titles whose country code is `US`.
2. Prefer an unlabelled US title because labelled entries may be working,
   festival, or other special-purpose names.
3. Use the first US title only when no unlabelled entry exists.
4. Use the selected US title as the primary heading.
5. When the normal TMDB title differs after capitalization and spacing are
   normalized, display it beneath the heading as `(a.k.a. Normal Title)`.
6. Do not render the alternate line when the titles are equivalent or TMDB has
   no usable US alternative.

The alternate line uses regular-weight italics and the same typography scale as
the description. Long titles can wrap on their own line instead of competing
with the primary title on one slash-separated line.

## 7. Favorites and Movies I Have Seen

### 7.1 What delayed the screen

The saved list already existed in AsyncStorage, but the screen waited for every
movie's current IMDb rating and streaming-availability values before publishing
the list. A large collection could therefore show a loading screen for many
seconds even though the device already knew which movies belonged there.

### 7.2 New initial-load sequence

Favorites and Seen now use this sequence:

1. Read the complete saved record from AsyncStorage.
2. Convert and sort the locally saved movie objects.
3. Publish that list immediately and remove the initial loading indicator.
4. Check whether the saved card data is incomplete or belongs to a previous
   local calendar day.
5. When refresh is needed, request current IMDb and availability values in the
   background using the existing batch endpoint.
6. Merge refreshed fields into the visible movies by TMDB movie ID without
   moving the cards currently on screen.
7. Save the newly IMDb-sorted order for the next visit.

If the background request is slow or fails, the already saved movies remain
visible. A network problem cannot turn a complete local collection into an
empty screen.

### 7.3 Ordering behavior

Background refresh deliberately protects the active screen from cards jumping
to new positions while the customer is using it. Refreshed ratings and
availability can update on the visible cards, but the current array order stays
fixed. The newly sorted order is persisted and becomes visible the next time
the page opens.

An intentional pull-to-refresh is different: it means the customer asked for a
complete current reload, so the visible list is refreshed and sorted
immediately.

The existing run identifier and active-screen checks continue preventing an
older asynchronous response from overwriting a newer load or updating a screen
that is no longer active.

## 8. YouTube Trailer Playback

### 8.1 Customer flow

Selecting the Movie Detail trailer button now performs the complete start
sequence:

1. Open the existing full-screen trailer modal.
2. Ask the YouTube player to begin playback.
3. Wait until the embedded player reports that playback actually started.
4. Enter the platform-appropriate full-screen presentation.
5. Close the modal when the trailer ends or when the customer selects Back.

The application does not force the phone into landscape. Portrait playback is
valid, and rotating the device to landscape recalculates the centered 16:9
player so it fills the available screen without cropping or stretching.

### 8.2 Platform behavior

YouTube's iframe API can start playback but does not expose one portable
full-screen command for both mobile platforms. MovieApp uses the supported path
for each operating system:

| Platform | Full-screen behavior                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| iOS      | Inline media playback is disabled, allowing WebKit to use its native full-screen player when playback starts. The status bar is hidden while the modal is open and restored on close.                              |
| Android  | Injected player code waits for the playing state, then requests browser full-screen on the YouTube iframe. A small native module hides the Activity and React Native modal system bars and restores them on close. |

The injected script checks for the player every 100 milliseconds and stops
after 100 attempts. This bounds the wait when YouTube never becomes ready. A
rejected browser full-screen promise is contained instead of becoming an
unhandled application error.

The Android native integration is registered through:

```text
android/app/src/main/java/com/movieapp/TrailerFullscreenModule.kt
android/app/src/main/java/com/movieapp/TrailerFullscreenPackage.kt
android/app/src/main/java/com/movieapp/MainApplication.kt
```

No new third-party package was added for this behavior.

## 9. Home Featured-Movie Carousel

### 9.1 Manual control

The hero still advances every three seconds when Home first opens. A true
horizontal finger drag emits `onScrollBeginDrag`; that event marks the hero as
manually controlled and cancels its automatic timer. Timer-driven movement does
not emit that event, so normal automatic rotation does not stop itself.

Afterward, the customer can continue swiping left or right manually. The
horizontal poster rows below the hero are separate components and are not
changed by this rule.

### 9.2 Pull-to-refresh restores a fresh Home page

Stopping the hero is page-local state. A Home pull-to-refresh must behave like a
new Home visit rather than carrying that choice into the rebuilt page.

Home therefore maintains one `homeRefreshGeneration` value. After all Home
collections finish their refresh, the generation increases and supplies a new
React key to the complete refreshable Home content. React recreates that
content, which resets the hero index, manual-stop state, timer, scroll position,
and other page-local view state together. The same generation continues driving
the existing image retry and preparation behavior.

This is one page-level reset contract. Individual Home components do not each
contain their own pull-to-refresh exception.

## 10. Version and Packaging State

The version-setting scripts prepared these final values:

| Platform                                   | Version | Build identifier      |
| ------------------------------------------ | ------- | --------------------- |
| iOS application and notification extension | `3.7.1` | Build `1`             |
| Android application                        | `3.7.1` | Version code `86`     |
| Settings installed-version snapshot        | `3.7.1` | iOS `1`, Android `86` |

The intended release order remains:

1. Review and commit the feature commits, 3.7.1 version files, and this release
   documentation.
2. Confirm `git status` is clean.
3. Create and validate the iOS archive.
4. Create and validate the Android bundle from the same commit.
5. Confirm both artifact records contain the same complete Git commit.
6. Upload the validated artifacts to their store release tracks.

The packaging scripts refuse to start from a dirty repository. They do not
change the generated version snapshot during packaging.

## 11. Verification Record

### 11.1 Automated checks completed

The final MovieApp source passed:

- 38 Jest suites;
- 161 Jest tests;
- TypeScript compilation with `tsc --noEmit`;
- ESLint checks;
- Android Debug compilation;
- iOS Debug simulator compilation; and
- `git diff --check`.

The route-aware Worker feature reported 174 Worker tests passing at feature
completion, including route identity, D1 separation, URL validation, fallback
budget protection, and provider catalog coverage.

### 11.2 Native behavior checked

| Area                   | Native result                                                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subscription routes    | Exact direct and parent-platform destinations were opened from actual Movie Detail provider rows on iOS and Android.                                                          |
| Provider coverage      | The live D1 catalog contains every provider in TMDB's current US movie-provider list, plus older provider IDs still used by live relationships. All real catalog rows have an official homepage and are launchable. |
| Provider actions       | Disney+, fuboTV, FXNow, YouTube TV, Apple TV Channels, and rental providers displayed the same bordered `Watch Now` action; the no-exact-match path returned the selected provider route's D1 homepage. |
| Loading feedback       | Selecting `Watch Now` immediately removed the button and showed a spinner while a held request remained pending.                                                              |
| Backup resolver        | Isolated missing-ID scenarios used the real backup API, then repeated from D1 without another backup request.                                                                 |
| Safe iOS Debug install | `Movie Time Dev` installed beside the production application with a separate identity and storage container.                                                                  |
| Favorites and Seen     | Large locally populated lists appeared before the background card-data refresh completed.                                                                                     |
| Trailer                | Automatic playback and full-screen presentation were exercised on both iOS and Android; Android landscape filled the screen.                                                  |
| Home hero              | An Android touch swipe stopped the hero; screenshots seven seconds apart were identical. After pull-to-refresh, the hero resumed changing on its three-second schedule.       |
| Advanced Search Other  | iOS and Android displayed the Movie Time `Other` tile and returned results for Other alone. Android also returned results for Netflix plus Other and Add All. The isolated Android test package remained separate from the production app. |

These checks prove application routing and exact destination selection. They do
not prove that an arbitrary customer account is entitled to play every movie.
Provider authentication, subscriptions, territory rules, and catalog changes
remain controlled by the provider.

### 11.3 Release checks still required after the release commit

The following are packaging steps, so they cannot be completed while the
version and documentation changes remain uncommitted:

- Run the iOS archive and archive-validation tasks.
- Run the Android bundle and bundle-validation tasks.
- Confirm the archived iOS build is `3.7.1 (1)`.
- Confirm the archived Android bundle is `3.7.1 (86)`.
- Confirm both artifact records identify the same final release commit.

## 12. Maintenance Checklist

### When changing subscription providers

- Confirm the exact TMDB provider ID and playback route.
- Keep direct and parent-platform provider IDs separate.
- Maintain provider labels, grouping, playback platforms, and official
  homepages in the single Cloudflare D1 catalog. Do not add a duplicate
  mutable provider list to MovieApp or Worker source code.
- Add or change only provider-specific URL rules that can be validated.
- Keep TMDB as the source deciding whether a route appears.
- Never place the backup API key in the mobile repository.
- Test the selected route through the actual Movie Detail row.

### When changing Favorites or Seen loading

- Publish the complete local list before optional network refresh work.
- Never save a partial background response as a complete list.
- Preserve visible card order during automatic background refresh.
- Allow deliberate pull-to-refresh to publish the new sorted order.
- Keep stale-run and inactive-screen protection intact.

### When changing trailer behavior

- Test both portrait and landscape.
- Test opening, automatic playback, automatic full-screen entry, Back, and
  trailer completion.
- Confirm iOS restores its status bar.
- Confirm Android restores both Activity and modal system bars.
- Keep the bounded readiness loop so a failed player cannot poll forever.

### When changing Home refresh behavior

- Treat pull-to-refresh as a complete new Home page generation.
- Confirm a manual hero swipe stops only the hero timer.
- Confirm poster-row swiping remains unchanged.
- Confirm pull-to-refresh resets the scroll content and restarts hero rotation.
- Preserve the existing hero-and-Popular-first image preparation sequence.

## 13. Supporting Documents

The following records contain provider-level samples and earlier focused test
details. This 3.7.1 document is the release-level source of truth for the final
net behavior.

```text
.codex/NetflixStreamingLinks.md
.codex/SubscriptionProviderLinks.md
.codex/SubscriptionRoutes.md
/Users/croncallo/repo/movieapp-cloudflare/docs/streaming-links.md
```
