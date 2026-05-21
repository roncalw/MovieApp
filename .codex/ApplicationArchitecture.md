# MovieApp Application Architecture Notes

## Table of Contents

- [Why this note exists](#why-this-note-exists)
- [Architecture diagram](#architecture-diagram)
- [Current structure](#current-structure)
- [Android Direct API Identity Fix](#android-direct-api-identity-fix)
- [File role summary](#file-role-summary)
- [Final takeaway](#final-takeaway)

## Why this note exists

This note captures the discussion around:

- why the app now has `header/`, `body/`, and `ui/` folders
- why the two header siblings need a parent
- why the shared header context exists
- how this pattern could extend later if we add a footer
- why Android needed a direct external API identity fix for Home-page TMDB calls

This is meant to be a plain-English explanation of the architecture, not just a file inventory.

## Architecture diagram

[![Header and body hierarchy](./assets/header-body-hierarchy.svg)](./assets/header-body-hierarchy.svg)

Direct file link: [header-body-hierarchy.svg](./assets/header-body-hierarchy.svg)

### How to read the hierarchy

- Top level:
  - `MovieSearchScreen`

- Under `MovieSearchScreen`:
  - `HeaderMovieSearch`
  - `MovieResults`

- Under `HeaderMovieSearch`:
  - `SubHeaderTop`
  - `SubHeaderMovieSearchFields`
  - `HeaderMovieSearchContext`

- Under `SubHeaderMovieSearchFields`:
  - `YearWheelField`

- Under `MovieResults`:
  - `MovieCard`
  - `MovieDetail` full-screen overlay

### Even simpler tree view

```text
MovieSearchScreen
├── HeaderMovieSearch
│   ├── SubHeaderTop
│   ├── SubHeaderMovieSearchFields
│   │   └── YearWheelField
│   └── HeaderMovieSearchContext
└── MovieResults
    ├── MovieCard
    └── MovieDetail (full-screen overlay)
```

### How to read the shared clipboard / radio flow inside the diagram

- `SubHeaderTop` and `SubHeaderMovieSearchFields` both use the shared clipboard / radio
- `HeaderMovieSearchContext` is that shared clipboard / radio
- `HeaderMovieSearch` reads that shared channel as the department head
- `SubHeaderMovieSearchFields` still sends the final valid params back up to `MovieSearchScreen`

## Current structure

### Screen

- [MovieSearchScreen.tsx](../src/screens/MovieSearchScreen.tsx)

This is the page-level screen.

Its job is now mostly:

- own the submitted movie-search params
- run the query hook
- render the parent header section
- render the results body section

It is intentionally closer to a page composer than a giant state bucket.

### Header folder

- [HeaderMovieSearch.tsx](../src/components/header/HeaderMovieSearch.tsx)
- [SubHeaderTop.tsx](../src/components/header/SubHeaderTop.tsx)
- [SubHeaderMovieSearchFields.tsx](../src/components/header/SubHeaderMovieSearchFields.tsx)
- [HeaderMovieSearchContext.tsx](../src/components/header/HeaderMovieSearchContext.tsx)

These files are specifically about the page header and its coordination.

### Body folder

- [MovieResults.tsx](../src/components/body/MovieResults.tsx)

This is the reusable results-list/detail body section.

### UI folder

- [MovieCard.tsx](../src/components/ui/MovieCard.tsx)
- [YearWheelField.tsx](../src/components/ui/YearWheelField.tsx)

These are reusable visual building blocks.

The `ui` folder is for things that are more like shared visual widgets than page-structure containers.

## Android Direct API Identity Fix

### Context

The Home page intentionally gets its carousel rows directly from TMDB, matching the legacy app.

That separation matters:

- the Home page uses TMDB directly for featured, popular, and genre carousel rows
- the Advanced Search page uses the Cloudflare search endpoint
- those two paths should stay separate unless we deliberately decide to redesign the app

### What happened

Android started showing `Network Error` for several Home-page rows. iOS loaded the same Home page correctly, and Advanced Search still worked on Android.

That combination narrowed the problem quickly:

- Advanced Search was not proof that direct TMDB worked, because Advanced Search calls our Cloudflare Worker.
- iOS was not proof that Android should work, because iOS and Android use different native network stacks.
- The affected path was Android direct-to-TMDB Home-page traffic.

### Why this could break after previously working

The app did not need to change for this to appear. The Home page depends on a live external API, and TMDB sits behind normal internet infrastructure such as CDNs, security filters, and compression behavior. Those layers can change independently of this app.

The most useful way to describe the failure is this:

- React Native Android sends requests through OkHttp.
- React Native iOS sends requests through Apple's native networking stack.
- A browser, iOS, Android OkHttp, and a backend server can all look different to an external API, even when they request the same URL.
- If an external API or its edge/security layer treats one client identity differently, Android can fail while iOS and browser tests still pass.

We did not prove a public TMDB rule that says "OkHttp is blocked." The evidence was app-specific: Android direct TMDB calls failed, while iOS and Cloudflare-backed calls worked. The safest fix is therefore scoped to the proven Android direct external API path.

### High-level fix

The current fix is intentionally simpler than the first diagnostic version:

- Android direct TMDB requests now use a normal mobile-browser-style `User-Agent`.
- The fix is allowlisted to TMDB API hosts only.
- The code does **not** set `Accept-Encoding`.
- The code does **not** manually unzip gzip responses.

In plain English: Android now introduces itself to TMDB more like a normal mobile browser, then lets the standard Android networking libraries handle compression the normal way.

### The important gzip lesson

This is the part that is easy to get backwards.

OkHttp normally handles gzip automatically when the app does **not** provide `Accept-Encoding` itself. React Native's installed Android networking source has the same idea in its comments and code: automatic gzip handling depends on leaving that header alone.

This can feel backwards because many HTTP examples do set `Accept-Encoding`. That is normal when a program wants to choose a response encoding, for example asking for `gzip`, Brotli, or `identity` to avoid compression.

The key distinction is responsibility:

- If the app leaves `Accept-Encoding` absent, OkHttp owns the normal gzip path and returns decoded JSON to React Native.
- If the app sets `Accept-Encoding: identity`, there should be nothing to decompress **if the server honors it**.
- If the app sets any `Accept-Encoding` value, OkHttp stops using its automatic gzip path. From that point forward, the app is responsible for making sure the response encoding and app decoding still match.

That responsibility is the fragile part. The final fix avoids it.

Why not force `Accept-Encoding: identity`?

- It makes every TMDB response larger because it asks for uncompressed JSON.
- It still depends on TMDB's server or CDN honoring that request every time.
- It bypasses OkHttp's normal behavior, where OkHttp asks for an encoding it already knows how to decode.

So we do not need to know every encoding TMDB might support. We let OkHttp choose the Android-safe encoding path and only fix the request identity problem.

So the final rule is:

- Do **not** set `Accept-Encoding: gzip` from JavaScript.
- Do **not** set `Accept-Encoding: identity` as the permanent fix.
- Do **not** manually unzip responses unless we have a separate, proven reason.
- Let OkHttp and React Native Android own the normal gzip path.

The earlier manual gzip-normalization experiment was useful because it taught us where the failure surface was, but it is not the final maintenance pattern. The final code removes that extra moving part.

### Why the file is not named for TMDB

The Android file is named for the failure pattern, not for one vendor:

- [ExternalApiIdentityOkHttpConfigurator.kt](../android/app/src/main/java/com/movieapp/network/ExternalApiIdentityOkHttpConfigurator.kt)

That name means:

- this is about direct external API request identity on Android
- it is not a general rewrite of every Android network request
- it is not a TMDB business-rule module
- today it only applies to TMDB because TMDB is the only host where this app proved the issue

The allowlist currently contains:

- `api.themoviedb.org`
- `api.tmdb.org`

If another direct external API later shows the same Android-only identity problem, add that host only after proving it with logs. Do not make this interceptor global by default.

### Files involved

The fix is split across these files:

- [client.ts](../src/api/tmdb/client.ts)
- [movieService.ts](../src/api/tmdb/services/movieService.ts)
- [ExternalApiIdentityOkHttpConfigurator.kt](../android/app/src/main/java/com/movieapp/network/ExternalApiIdentityOkHttpConfigurator.kt)
- [MainApplication.kt](../android/app/src/main/java/com/movieapp/MainApplication.kt)

The JavaScript side centralizes direct TMDB headers in `tmdbDirectHeaders`, then uses those headers for Home-page TMDB calls.

The native Android side installs an OkHttp interceptor before React Native starts. That interceptor only changes allowlisted TMDB hosts. Every other request continues through React Native's normal Android networking path.

### Why this lives in Android native code

`MainApplication.kt` and `ExternalApiIdentityOkHttpConfigurator.kt` are Android native files.

- `kt` means Kotlin.
- Kotlin is the Android language used by this React Native project for Android startup code.
- Kotlin and Java both run on the Android/JVM side of the app and can call the same Android and React Native APIs.
- `MainApplication.kt` was already part of the Android app scaffold.
- `ExternalApiIdentityOkHttpConfigurator.kt` is app-owned native code created for this Android networking policy.

"App-owned" means the file lives in this MovieApp repository under `android/app/src`. It is not patched into `node_modules`, and it is not hidden inside a generated dependency.

Installing or upgrading Java does not replace this file. A Java, Gradle, Kotlin, or React Native upgrade can still affect whether the Android project builds, so during upgrades verify that `MainApplication.kt` still calls `ExternalApiIdentityOkHttpConfigurator.install(applicationContext)` before `loadReactNative(this)`.

### Why this is the right Android hook

The placement came from this installed React Native version, not from guessing.

The source trail is:

- React Native's Android networking layer uses OkHttp.
- [OkHttpClientProvider.kt](../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/network/OkHttpClientProvider.kt) exposes `setOkHttpClientFactory(...)` and `createClientBuilder(context)`.
- That provider is the app-level hook React Native gives us for customizing the OkHttp client used by JavaScript `fetch`.
- [NetworkingModule.kt](../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/network/NetworkingModule.kt) documents the gzip behavior: OkHttp transparently handles gzip when `Accept-Encoding` is not supplied by the caller.
- OkHttp interceptors are designed for this exact class of hook: inspect or adjust a request before it goes out, then let the normal client continue.

Relevant reference docs:

- [OkHttp calls documentation](https://square.github.io/okhttp/features/calls/)
- [OkHttp interceptors documentation](https://square.github.io/okhttp/features/interceptors/)
- [Android Kotlin style guide](https://developer.android.com/kotlin/style-guide)
- [Kotlin on Android FAQ](https://developer.android.com/kotlin/faq)

### Why this is not a node_modules patch

This project uses `patch-package`, and that is useful when a third-party package itself needs a package-level fix.

This issue is different. It is an app traffic policy:

- direct TMDB Home-page traffic needs Android request identity help
- Advanced Search must still use Cloudflare
- non-allowlisted app traffic should not be rewritten

Patching React Native's generic networking module in `node_modules` would be broader and more fragile:

- it would affect every React Native network request, not just the hosts we proved
- a React Native upgrade could rewrite the patched file
- future maintainers would have to understand a hidden third-party patch before understanding the app's own traffic rule

Keeping the code in `android/app/src/main/java/com/movieapp/network/ExternalApiIdentityOkHttpConfigurator.kt` makes the rule explicit and easy to find.

### Why this cannot be only an Axios helper

The `User-Agent` header is also centralized in TypeScript, and that is useful:

- [client.ts](../src/api/tmdb/client.ts) defines `tmdbDirectHeaders`
- [movieService.ts](../src/api/tmdb/services/movieService.ts) uses those headers for direct Home-page TMDB fetches

But Axios and fetch in React Native do not open the Android socket themselves. They hand the request to React Native's native Android networking layer, and that layer uses OkHttp.

So the TypeScript helper is the first line of consistency, while the Android OkHttp hook is the platform-level guarantee that direct TMDB requests use the same identity even if another direct TMDB call is added later.

### What logcat showed

The failing Android log was useful because it separated "TMDB did not answer" from "Android could not deliver the answer cleanly to JavaScript."

Before the fix, logcat showed this pattern:

```text
TMDB response 200: https://api.themoviedb.org/3/movie/upcoming?...
[Home TMDB request failed] { label: 'upcoming', error: [TypeError: Network request failed] }
```

The same pattern appeared for multiple Home-page rows, including:

- `upcoming`
- `genre-10751` family
- `genre-35` comedy
- `genre-18` drama
- `genre-80` crime
- `genre-27` horror
- `genre-99` documentary

That proved Android was reaching TMDB, but React Native JavaScript was still receiving a generic network failure.

During diagnostic work, one manual gzip-normalization attempt exposed this lower-level error:

```text
java.io.IOException: gzip finished without exhausting source
  at okio.GzipSource.read(...)
  at okhttp3.ResponseBody.string(...)
```

That error came from the diagnostic gzip-normalization path, not from the final fix. The final lesson from that error is: do not force or manually own gzip unless we have to. Let OkHttp and React Native handle compression normally by leaving `Accept-Encoding` unset.

### What the Android and React Native community does for this class of issue

There is not one universal Android patch for every API-specific `Network request failed` problem. The responsible pattern is to prove which layer failed, then fix that layer.

For React Native Android, that usually means:

- Use logcat or another native network diagnostic to confirm whether the server responded.
- If the server never responded, investigate URL, DNS, TLS, auth, firewall, or server availability.
- If the server returned HTTP `200` but JavaScript still received `TypeError: Network request failed`, inspect the native Android networking handoff.
- If headers are enough, keep the policy in JavaScript.
- If the app needs a platform-level guarantee for all direct calls to a host, use React Native's OkHttp hook and scope it tightly.

For this app, the final proven maintenance pattern is:

- direct TMDB Home-page calls keep a browser-like Android `User-Agent`
- `Accept-Encoding` is not set by the app
- gzip is left to OkHttp and React Native Android
- the rule is allowlisted to TMDB hosts

### What this would look like in Expo

Expo developers are not automatically stuck, but the answer depends on which Expo runtime they use.

- Expo Go only:
  - You can try JavaScript-only headers or a backend proxy.
  - You cannot install this OkHttp factory because Expo Go is a prebuilt app.

- Expo development build:
  - Create a development build that includes project-specific native code.
  - Add this same kind of Android hook through a config plugin or custom native module.
  - Build with EAS or local prebuild so the generated Android project contains the fix.

- Server/proxy fallback:
  - Put a small backend or Cloudflare Worker between the app and the external API.
  - The proxy calls TMDB and returns a response shape the app controls.
  - This avoids native code but adds another service and changes the app's network path.

Reference links for maintainers:

- [Expo config plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo prebuild](https://docs.expo.dev/workflow/prebuild/)

### Why this stays out of Advanced Search

Advanced Search already goes through the Cloudflare movie-search API.

The Home page does not.

So this fix is intentionally narrow:

- Home-page direct TMDB requests get the Android browser-like request identity.
- Advanced Search continues using Cloudflare.
- Other non-allowlisted Android requests are not rewritten by this interceptor.

### Verification

The fix should be verified with:

- `npm run tsne`
- `cd android && ./gradlew assembleDebug`
- Android emulator or device launch of the Home page
- Android log review confirming successful TMDB responses for featured, popular, family, comedy, drama, crime, horror, music, and documentary rows

The key passing behavior is not just HTTP `200`; the app must also receive usable JSON and render the Home-page rows without `Network Error`.

## The family/company analogy

The easiest mental model we landed on was this:

- `MovieSearchScreen` = the larger company office
- `HeaderMovieSearch` = the department head
- `SubHeaderTop` = employee A
- `SubHeaderMovieSearchFields` = employee B
- `HeaderMovieSearchContext` = the shared clipboard / hallway radio
- `MovieResults` = another department in the office, but not part of the header chain

## Why the two header children still exist

`HeaderMovieSearch` did **not** replace the children.

It became the coordinator.

The children still do the visible work:

- [SubHeaderTop.tsx](../src/components/header/SubHeaderTop.tsx)
  renders the top bar and the `Submit` button

- [SubHeaderMovieSearchFields.tsx](../src/components/header/SubHeaderMovieSearchFields.tsx)
  renders the filter controls, year wheels, validation, and summary

So the parent is the manager, not the worker doing both jobs itself.

## Why siblings cannot directly talk to each other

In React, the normal direction is:

- parent -> child through props
- child -> parent through callbacks/events

Siblings do not automatically get a direct communication line just because they are both already mounted on screen.

That means:

- `SubHeaderMovieSearchFields` knows when the year range is invalid
- `SubHeaderTop` owns the visible `Submit` button
- but one sibling does not directly mutate the other sibling

Instead, shared state has to move through a shared path.

## Why the parent header exists

We wanted:

- the search fields to be the real trigger/source of truth for validity
- the top header to reflect that by disabling the button
- `MovieSearchScreen` to stay mostly dumb

So we introduced:

- [HeaderMovieSearch.tsx](../src/components/header/HeaderMovieSearch.tsx)

Its job is to be the shared parent that coordinates the two header children without pushing all of that sibling wiring back into the screen.

That lets the screen stay more like:

- "render header"
- "render body"
- "run query from submitted params"

instead of becoming the communication hub for every header detail.

## Why the shared clipboard/radio exists

This was the extra question:

If the parent already exists, why also create:

- [HeaderMovieSearchContext.tsx](../src/components/header/HeaderMovieSearchContext.tsx)

### Short answer

It is a shared room-level communication channel for the header section.

It is **not** another visible component.
It is **not** another boss.
It is just the agreed way for the parent and both children to read/write the same shared header information.

### Analogy version

Without the clipboard/radio:

- the department head would need to personally walk over to employee A
- then walk over to employee B
- then walk back again every time a shared fact changed

With the clipboard/radio:

- the department head keeps one official shared note board
- both employees can read from it
- employee B can report "the year range is invalid"
- employee A can see "disable submit"
- the department head still owns the system, but does not hand-copy every message separately every time

### React version

The shared header state includes things like:

- applied params
- loaded pages / total pages
- whether submit should be disabled
- how to submit draft filters
- how the field section can register its submit handler

Context makes that shared coordination cleaner than threading a lot of props manually through just the header subtree.

## Important clarification

The context file is a mechanism, not a visual layer.

So the real visual/structural hierarchy is still:

1. [MovieSearchScreen.tsx](../src/screens/MovieSearchScreen.tsx)
2. [HeaderMovieSearch.tsx](../src/components/header/HeaderMovieSearch.tsx)
3. [SubHeaderTop.tsx](../src/components/header/SubHeaderTop.tsx)
4. [SubHeaderMovieSearchFields.tsx](../src/components/header/SubHeaderMovieSearchFields.tsx)

The context is just the shared hallway clipboard those pieces use.

## Could we remove the context later?

Yes.

For only two children, a parent can absolutely pass everything directly as props/callbacks instead.

That would be simpler in one way:

- less abstraction
- fewer files

But context is cleaner in another way:

- less prop drilling inside the header subtree
- one shared communication channel for the whole header section

So this is a design choice, not a hard React requirement.

## Why the body does not need the same kind of department head

- [MovieResults.tsx](../src/components/body/MovieResults.tsx)

This component is a sibling to the header area, but right now it does not need to coordinate closely with the header in the same way.

It mostly needs:

- the current movie list
- optional pagination callbacks
- optional header content passed in

So it does not need its own shared coordinator at the moment.

## How a future footer could fit

If we later add a footer, there are a few good options.

### Case 1: simple footer

If the footer is mostly static or self-contained, then:

- `MovieSearchScreen` can just render it below the header/body

Example mental structure:

- `HeaderMovieSearch`
- `MovieResults`
- `FooterSomething`

### Case 2: footer needs shared page coordination

If the footer needs to react to header/body state, then we have two choices:

1. let `MovieSearchScreen` bridge the shared data
2. introduce a page-level parent/context above header + body + footer

That second option would look like:

- `PageMovieSearch`
  - header
  - body
  - footer

and then the page-level parent would become the bigger coordinator.

### Case 3: footer belongs only to the header area

If the footer is really more like a bottom strip of header controls, then it may belong under the `header/` folder instead of becoming a page-level footer.

So the folder choice depends on what the footer *means*, not just where it visually appears.

## The current pattern in one sentence

The app now separates:

- page composition
- header coordination
- body rendering
- reusable UI widgets

so that each layer has a clearer job and we do not keep stuffing every concern into one screen file.

## File role summary

### Page composer

- [MovieSearchScreen.tsx](../src/screens/MovieSearchScreen.tsx)

### Header coordinator

- [HeaderMovieSearch.tsx](../src/components/header/HeaderMovieSearch.tsx)

### Header children

- [SubHeaderTop.tsx](../src/components/header/SubHeaderTop.tsx)
- [SubHeaderMovieSearchFields.tsx](../src/components/header/SubHeaderMovieSearchFields.tsx)

### Header shared channel

- [HeaderMovieSearchContext.tsx](../src/components/header/HeaderMovieSearchContext.tsx)

### Body

- [MovieResults.tsx](../src/components/body/MovieResults.tsx)

### Shared UI parts

- [MovieCard.tsx](../src/components/ui/MovieCard.tsx)
- [YearWheelField.tsx](../src/components/ui/YearWheelField.tsx)

## Final takeaway

The new parent header exists because two visible header siblings need to stay coordinated.

The context exists because it gives that header family one shared communication board.

The screen stays simpler because it no longer has to personally mediate every single interaction between those two header children.
