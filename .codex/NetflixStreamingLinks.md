# Netflix links from Movie Detail

This records the completed Netflix-first round. The later expansion is documented in [SubscriptionProviderLinks.md](SubscriptionProviderLinks.md).

Movie Detail's existing Netflix subscription rows now open the exact movie on Netflix. The app asks MovieApp's Cloudflare Worker for the destination only after a tap. It attempts the native Netflix URL first; if that fails, it opens the same title's HTTPS page. If no reliable destination is known, an inline message explains the failure without opening a search, unrelated title, or intermediary site.

TMDB remains the source of the displayed providers. The resolver's stored Netflix IDs never add a provider to the screen. Ads, rental rows, and other streaming services keep their previous behavior. Both the Netflix and Netflix Standard with Ads subscription rows are supported; other provider adapters are outside this initial implementation.

## Code flow

| File | What it does |
| --- | --- |
| `src/movie/components/MovieDetailInfoSections.tsx` | Keeps existing TMDB provider rendering, makes supported subscription rows tappable, shows loading/failure feedback, and credits the backup supplier. |
| `src/movie/streaming/useStreamingProviderLaunch.ts` | Starts one lookup per tap, ignores duplicates, and cancels pending work when the movie changes, the screen loses focus, or it unmounts. |
| `src/api/cloudflare/streamingLinkService.ts` | Calls the Worker with the movie, provider, and US country; enforces a 20-second timeout; verifies response identity and both Netflix URLs. |
| `src/movie/streaming/launchStreamingProvider.ts` | Tries the native title link, then HTTPS. Cancellation after a failed native attempt prevents a late browser launch. |
| `src/shared/ScrollFriendlyTapTarget.tsx` | Existing shared tap handling; provider taps reuse it so dragging the detail screen remains a scroll. This component itself was not changed. |
| `__tests__/streamingLinks.test.tsx` | Covers request identity, unsafe URLs, missing native apps, cancellation, duplicate taps, and provider-row integration. |

The Worker owns provider ID discovery, URL construction, D1 storage, and the backup API key. No key or account password is present in the mobile feature. This action intentionally does not run through a render-time query or prefetch: browsing movie details must not spend backup quota.

No native dependencies, incoming-link registrations, package-visibility permissions, or store versions were changed. The launcher directly attempts `Linking.openURL`; it does not depend on `canOpenURL` or installed-app discovery.

Backend maintenance details are in `/Users/croncallo/repo/movieapp-cloudflare/docs/streaming-links.md`.

## Validation completed

August 30–31, 2026:

- **149 app tests passed**, including **21 streaming-link tests**. Before changes, all 128 existing tests also passed.
- TypeScript and ESLint checks for the changed app code/tests passed.
- iOS Debug build succeeded, installed, and launched on **iPhone 17 Pro Max, iOS 26.5**, device `16D06326-A3E8-40B8-B9F9-1AE4509D7231`.
- Android `assembleDebug` succeeded. The APK installed and launched on **MovieApp_Streaming_Test_API_34**, Android 14, `emulator-5556`. The running app process and Metro bundle load were verified; no AndroidRuntime or ReactNativeJS startup errors were found in the app process log.
- The original Galaxy S22 emulator had an app signed with a different key. It and its data were preserved. A separate Pixel 8 test emulator was created for this validation.
- The deployed Worker resolved Marriage Story through Wikidata and The Whisper Man through the live backup API. Subsequent requests used D1. No mocked destinations were added to production or the mobile app.

### Actual simulator checks, August 31

Actual Netflix-row taps now opened Marriage Story's Netflix page, title **80223779**, on both iOS (Safari) and Android (Chrome). Both Netflix subscription variants were exercised. The Android provider layout and supplier credit were visible and legible. Dragging over the Android Netflix row scrolled the detail screen without starting a lookup.

The production endpoint was also verified from the app: iOS opened Marriage Story before the isolated test, and Android opened it after the production endpoint was restored. The final Android request appeared in the deployed Worker's logs as a D1 hit.

**Waived extra observation:** The user explicitly set aside the additional iOS scrolling/footer visual check and authorized moving on to all providers. Netflix lookup, actual row taps, exact title-page opening, and the forced real-backup scenario had already passed. This extra visual observation is not a remaining Netflix completion blocker.

### Forced missing-ID fallback, verified on both platforms

The user explicitly required a test that pretends the Netflix ID is unavailable, then uses the real Movie of the Night API. This was tested through actual app taps, separately on each simulator:

1. Start the production resolver in a local Workers runtime with an empty, disposable D1 database.
2. Replace TMDB's external-ID response with the correct Wikidata movie identifier, and replace Wikidata's response with a movie that has **no Netflix ID**. No Netflix destination is supplied by either mock.
3. Tap Netflix in MovieApp. The resolver must call the **real Streaming Availability API**, validate the returned movie, save its country mappings, and return the Netflix destination.
4. Observe the correct Marriage Story page in the simulator's browser.
5. Return to MovieApp and tap Netflix Standard with Ads. Confirm a D1 cache hit and no additional upstream request.
6. Empty only the disposable database and repeat on the other platform.

| Platform | First tap | Repeat tap | Real backup calls |
| --- | --- | --- | --- |
| iOS | `source: streaming-availability`, `cacheHit: false` | `cacheHit: true` | 1 |
| Android | `source: streaming-availability`, `cacheHit: false` | `cacheHit: true` | 1 |

Each cold lookup saved **65 country mappings**. The complete test used **two real backup API requests**. The Netflix ID and API response were not mocked.

Evidence is saved in `.codex/verification/netflix-streaming-links/`: `forced-fallback-evidence.json`, `forced-fallback-resolver.log`, `ios-forced-fallback.png`, `android-forced-fallback.png`, and provider-row screenshots. The JSON assertions verified that each platform had exactly one cold resolution and one cached resolution with the expected title ID.

The only temporary app change was the streaming endpoint URL. It has been restored byte-for-byte from its side backup to the production Cloudflare URL. The local test server is stopped, its temporary API-key file was deleted, and the Android test-port forwarding was removed. No production D1 rows were removed or replaced by this test.

### Correction to the earlier Mac-lock report

The control tool initially reported that the Mac was locked; this was a tool error report, not a confirmed diagnosis. A later read-only check of System Settings showed display sleep after **5 minutes on battery** or **10 minutes on power**, with **Require password after screen saver/display off: Never**. Display sleep does not by itself establish a password lock. Those Mac settings were not changed, and simulator access subsequently worked.

The user already verified opening the real Netflix app and explicitly accepted the exact Netflix web page as the simulator success criterion. Installing Netflix or repeating physical-device verification is therefore not required for this pass.

## Repeat the simulator checks

Make sure the simulator is visible and interactive. Metro was started from this repository on port 8081. If it has stopped, run `npm start` from `/Users/croncallo/repo/MovieApp`.

On each simulator:

1. Open Movie Time and use **Search by Movie Title** to find **Marriage Story**.
2. Open its Movie Detail screen. Scroll down to **Subscription** under **Streaming on ...**.
3. Drag over the Netflix row once; it should scroll without launching a link.
4. Tap Netflix. The row should indicate loading briefly, then open the exact Netflix title page, ID **80223779**, when the native Netflix app is absent.
5. Return to Movie Time and repeat. The Worker should log a D1 hit, with no extra backup API request.
6. Repeat for **The Whisper Man**, TMDB **860508**, Netflix ID **81278442**. Its mapping was learned through the live backup API and is now cached.
7. Verify that other provider rows and ads/rental categories remain unchanged, that the supplier credit wraps legibly, and that navigating back during a lookup does not launch a late destination.

The test emulator was reopened inside Android Studio's Running Devices panel and now uses `emulator-5554`; it is still **MovieApp_Streaming_Test_API_34**, not the original Galaxy device. Check the AVD name before targeting a serial number, because Android can reuse serial numbers after a restart. A targeted reinstall avoids touching other connected devices:

```sh
adb -s emulator-5554 emu avd name
adb -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 shell am start -n com.codefest.movieapp/.MainActivity
```

The React Native CLI's Gradle installation step attempted all connected emulators even when a device was selected. Use the targeted commands above to preserve the Galaxy emulator's existing app.

## Source and rollback

Both repositories use branch `codex/netflix-streaming-links`. Changes are left uncommitted for review. The Worker was deployed; no app-store release was made.

Original versions of the existing files changed by this feature are preserved separately under `.codex/_rollback/netflix-streaming-links/before-feature/` in each repository. They were reconstructed from the verified clean starting commit after the local backup convention was discovered; `before-latest-edit/` also contains intermediate copies. Do not mistake the intermediate copies for the pre-feature baseline, or restore over later unrelated edits.

For ongoing edits, back up the specific file before changing it, as required by `.codex/codexrules/WORKING-RULES.md`.
