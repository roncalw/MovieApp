# Subscription route grouping — August 31, 2026

## Delivered behavior

Movie Detail keeps the exact TMDB provider IDs and groups only the subscription routes TMDB returns for that movie. Direct services appear first without an extra heading. Non-empty Prime Video Channels, Disney+, Apple TV Channels, and The Roku Channel groups follow, with indented service rows. Repeated IDs are removed, while AMC+ direct and AMC+ through Prime remain separate choices.

Taps preserve the selected provider ID and resolve against its playback platform. The existing italic maroon **Watch Movie Now** text becomes a spinner immediately. Long subscription names can wrap to two lines instead of shrinking to unreadable text on iOS. Rent/free presentation and the Advanced Search provider list are unchanged. No user subscription preferences were added.

## The important distinction

**TMDB does distinguish AMC+ direct from AMC+ through Prime.** It supplies provider 526 for direct AMC+ and 528 for AMC+ Amazon Channel. STARZ direct is 43; STARZ Amazon Channel is 1794. This is enough to show both routes and open different platforms.

The current TMDB catalog does **not** separately identify Hulu through Disney+. Movie of the Night does supply Disney's explicit Hulu add-on. The implementation supports that route as an unbound template, tested with fictional provider ID 999001. It does not add it to live lists or infer it from standalone Hulu. The production endpoint rejects the fictional ID. Enabling the route in live availability needs a real distinguishing availability identifier or a separately approved change to the TMDB-only availability rule.

## How the pieces fit together

1. `useMovieWatchProvidersQuery` supplies current TMDB US availability.
2. `subscriptionRoutes.ts` adds display service, category, playback platform, and exact backup add-on IDs to each known TMDB ID. Unknown IDs remain visible without a guessed launch action.
3. `groupSubscriptionProviders.ts` deduplicates exact IDs and builds only non-empty groups. The component renders the grouped subscription rows; it does not fetch destinations during rendering.
4. A tap sends the original movie ID, provider ID, and region to the existing Worker endpoint. The Worker derives the route from its own matching catalog.
5. The Worker checks route-specific D1 storage, retained backup candidates, then the playback platform's primary identifiers and backup API. Channel backup candidates must match the exact platform, country, add-on type, and add-on ID.
6. MovieApp checks the returned identity and allowed URL before using the existing React Native Linking launcher. Netflix keeps its existing verified native URL and web fallback. Other services use exact HTTPS movie links, which the OS can associate with installed apps.

Apple channel links preserve a validated `playableId`, because an Apple movie ID alone could otherwise lead to a store rental or the wrong channel. Prime channel URLs point at Prime's exact movie detail page. STARZ and Roku gained strict movie-URL adapters.

## Maintenance map

| File | Responsibility |
| --- | --- |
| `src/api/cloudflare/subscriptionRoutes.ts` | Central exact-route identities, category labels, playback platforms, API add-on IDs, and the unbound Hulu/Disney template. |
| `src/movie/streaming/groupSubscriptionProviders.ts` | Preserve original provider data, deduplicate IDs, and order non-empty groups. |
| `src/movie/components/MovieDetailInfoSections.tsx` | Compact headings, indented rows, accessibility labels, immediate loading feedback. |
| `src/api/cloudflare/streamingProviderCatalog.ts` | Strict platform URL and Apple offer validation. |
| `src/api/cloudflare/streamingLinkService.ts` | Endpoint request and response identity validation. |
| `src/movie/streaming/useStreamingProviderLaunch.ts` | Loading, cancellation, error messages, and development launch diagnostics. |
| Worker `src/streaming/streamingLinkResolver.ts` | Resolve and save a destination for the exact selected route. |
| Worker `migrations/0030_add_subscription_route_links.sql` | Add route-specific D1 storage without changing legacy data. |

Keep both shared catalog files byte-identical across the two repositories. When adding a provider, verify its exact TMDB ID and backup add-on ID. Do not infer channel entitlement from a similar service name or a base-platform subscription. Run both test suites after changing either catalog.

## Verification

The actual `MovieDetailInfoSections` component was mounted in a temporary native verification screen with captured current TMDB availability for **Late Night with the Devil** (938614) and **Michael** (936075). Direct and channel taps used the deployed Worker, except Android's first AMC+ Prime tap, which used the exact result from the real isolated fallback test. The Hulu/Disney case deliberately supplied an explicit fictional route and the real API-derived Disney destination. Placeholder logos in the mock are test data, not the live UI.

| Check | Evidence |
| --- | --- |
| AMC+ direct vs Prime, both simulators | The same movie opened on AMC+ versus Prime Video, where the AMC+ offer was visible. |
| STARZ direct vs Prime, both simulators | Michael opened on STARZ versus Prime Video, with the STARZ offer visible. |
| STARZ Apple channel, both simulators | Apple TV displayed Michael and STARZ branding; its exact channel offer selector was retained. |
| Hulu-through-Disney explicit mock, both simulators | The indented Hulu row opened Late Night with the Devil on Disney+. Direct Hulu remained separate. |
| Immediate spinner, both simulators | A deliberately held response left a spinner where Watch Movie Now had been. Automated tests also assert the swap before resolving the promise. |
| Direct-only Netflix | No empty channel headings; iOS opened Marriage Story on Netflix. |
| Direct service regressions | Production requests for Netflix, Disney+, Hulu, Prime, AMC+, and STARZ resolved and repeated from D1. Existing provider and Linking tests passed. |
| Full automated tests | 172 MovieApp tests and 160 Worker tests passed; both source TypeScript checks and changed app-file lint passed. |
| Real forced fallback | 12 selected routes resolved with deliberately absent primary IDs, using two real backup calls and isolated D1. Every repeat avoided the network. |
| Production persistence | 12 real routes resolved and repeated from D1; AMC+/STARZ each have separate direct, Prime, Apple, and Roku records. |

Screenshots are in `.codex/verification/subscription-routes/`. API/catalog/production evidence is in the Worker repository's directory of the same name. The reusable manual fallback script is `movieapp-cloudflare/scripts/verify-subscription-routes.mjs`; it accepts the key on stdin and limits itself to two real requests. Normal tests use sanitized fixtures and consume no quota.

Browser checks verify the correct movie and playback platform, not authenticated subscription playback. Prime can display an account/territory notice. No subscription was purchased, no provider app was installed, and no account entitlement was assumed. Roku destinations were checked through real resolver/API/D1 tests rather than authenticated Roku playback.

## Deployment and cleanup

Worker version `878e4607-c2d1-44a8-b243-ce2b92c5fe9b` is deployed, with migration 0030 applied first. `movie_streaming_route_links` keys records by movie ID, exact TMDB provider ID, and country. The old `movie_streaming_links` table remains intact; validated legacy direct links are copied lazily on use. Production availability/import tables were not changed.

The temporary native verification screen and fictional-ID binding are removed from the app entry point after testing; the normal App.tsx is restored from its byte-for-byte backup. No physical-phone release or store submission is part of this round. The code remains uncommitted for review.
