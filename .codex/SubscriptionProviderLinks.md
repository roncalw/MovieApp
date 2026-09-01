# Subscription provider links

Movie Detail can now resolve links for every provider offered in Advanced Search. Nine providers have working live API coverage. YouTube has a safe full-work-link path but remains a data-coverage limitation: the backup API does not list YouTube, and the current sampled movies have no full-work link in Wikidata. The app explains that miss instead of opening a trailer or a guessed movie.

This extends the completed Netflix-first round. Netflix's native launch and same-title browser fallback remain intact. The user accepted web movie pages and waived the additional iOS footer/scrolling observation; neither physical app installation nor that extra visual check is outstanding.

## Verified movie destinations

| Provider | Advanced Search TMDB ID | Movie | iOS Safari | Android Chrome |
| --- | --- | --- | --- | --- |
| Netflix | 8 | Marriage Story | Exact movie page | Exact movie page |
| Hulu | 15 | The Avengers | Exact movie page | Exact movie page |
| Prime Video | 9 | Project Hail Mary | Exact movie page | Exact movie page; provider territory notice |
| Max | 1899 | The Dark Knight | Exact title destination; cookie notice | Exact movie page |
| Disney+ | 337 | Toy Story | Exact movie page | Exact movie page |
| Apple TV+ | 350 | F1 | Exact movie page | Exact movie page |
| Peacock | 387 | Insidious | Exact movie page | Exact movie page |
| AMC+ | 526 | Late Night with the Devil | Exact movie page | Exact movie page |
| Paramount+ | 531 | Top Gun: Maverick | Exact movie page | Exact movie page |
| YouTube | 192 | Mainstream | Clear missing-link message | Clear missing-link message |

The tests do not establish that a signed-in subscription can play every movie. Provider accounts, territories, device support, and catalog changes remain under the provider's control. No purchases, plan changes, or provider-app installations were made.

## What changed

- Existing subscription rows now use one reusable launch hook for all ten configured providers. Provider names in loading and error messages match the selected row. Rental and free-with-ads categories remain unchanged, as do providers outside Advanced Search.
- The app validates the selected movie, provider, country, content ID, and exact destination before handing the link to the operating system. Only Netflix has a verified custom native scheme; the others use HTTPS.
- The Worker checks saved D1 mappings and previously retained API candidates, then TMDB/Wikidata, then the backup API. One backup response saves all recognized direct subscriptions and countries. Amazon/Apple/Roku channels do not count as direct subscriptions to the channel's provider.
- API keys remain in the Worker. Viewing or scrolling rows does not request a streaming link. Repeated taps are coalesced, and losing screen focus cancels pending work.

## Two corrections found on the simulators

Prime's API link used an app-bridge URL that showed an installation page on iOS. It now uses the documented browser URL for the same Global Title Identifier. Peacock's API link went directly into a web player that Android rejected; it now uses Peacock's public movie page with the same asset ID and slug. Both corrected links were retested on both simulators.

## Verification method and evidence

A temporary menu made the ten sample movies easy to reach. Its buttons called the production `useStreamingProviderLaunch` hook and used the existing `ScrollFriendlyTapTarget`; no destinations or resolver responses were mocked. A second screen mounted the actual `MovieDetailInfoSections` component using live TMDB provider rows. This avoids treating a standalone browser visit as proof that app launching works.

The forced-backup test is separate and explicit. The production resolver ran with temporary D1 storage; TMDB/Wikidata identified each movie but deliberately supplied no provider ID. **The backup API was real.** All nine supported providers resolved, their repeat requests used only D1, and Toy Story's Hulu link reused data collected for Disney+. The final run used nine live requests and saved 414 mappings. The earlier Netflix round also performed this forced scenario through actual taps separately on iOS and Android.

Screenshots are in `.codex/verification/all-provider-streaming-links/`. Backend samples, final forced-backup results, and production responses are in the Worker's directory of the same name. Maintenance instructions and primary-source URL references are in `/Users/croncallo/repo/movieapp-cloudflare/docs/streaming-links.md`.

## Maintenance map

| File | What to change here |
| --- | --- |
| `src/search/shared/movieStreamers.ts` | Existing authoritative list of selectable subscription providers; unchanged by this feature. |
| `src/api/cloudflare/streamingProviderCatalog.ts` | Provider identities and strict movie URL formats. Keep identical to the Worker's `src/streaming/providerCatalog.ts`. |
| `src/api/cloudflare/streamingLinkService.ts` | Worker request, timeout, response identity, and URL validation. |
| `src/movie/streaming/useStreamingProviderLaunch.ts` | Tap lifecycle, duplicate prevention, cancellation, and provider-specific messages. |
| `src/movie/streaming/launchStreamingProvider.ts` | Native attempt when configured, then same-movie HTTPS fallback. |
| `src/movie/components/MovieDetailInfoSections.tsx` | Existing provider rows, launch affordance, and supplier attribution. |
| `__tests__/streamingProviders.test.tsx` | Advanced Search coverage and provider launch validation. |
| `__tests__/streamingLinks.test.tsx` | Request safety, Netflix regression, lifecycle, and category preservation. |

## Final status

- **160 app tests and 145 Worker tests pass.** Both source typechecks, changed-app-file ESLint, catalog parity, and `git diff --check` pass. The separate whole-Worker-test-directory typecheck has the two previously reproduced unrelated person-family fixture errors documented in the Netflix report.
- Final Worker deployment: `ba84dd9c-6278-4e26-8f86-1037a81e6024`. Final production probes returned saved D1 links for all nine supported providers and a controlled YouTube miss.
- Actual live Movie Detail component taps opened Late Night with the Devil on Hulu (iOS) and AMC+ (Android), with channel and rental rows preserved.
- The temporary simulator launcher is removed from application source, and `App.tsx` is restored byte-for-byte from its side backup. Both simulators were returned to the normal Home screen. Restarting iOS cleared a transient module error after the test-menu hot reload; no dependency changes were needed.
- No new native dependencies, OS settings changes, app-store releases, or commits were made. The existing test-device data was preserved. The new key did not appear in any of the 15 scanned source, documentation, and text-evidence files.
