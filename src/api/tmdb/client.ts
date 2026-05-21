/*
Step: 8
   * /MovieApp/src/api/tmdb/client.ts
Imported by:
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/api/tmdb/config.ts
Purpose:
   * Creates the shared Axios client used for TMDB requests so services can reuse one base URL, timeout, and header 
     setup.
*/
import axios from 'axios';
import { Platform } from 'react-native';
import { CONFIG } from './config';

const ANDROID_BROWSER_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36';

/*
  Android direct-to-TMDB requests need an explicit browser-like identity.

  WHY THIS EXISTS:
  - React Native Android sends HTTP requests through OkHttp.
  - TMDB can treat that Android network path differently than iOS Safari/NSURLSession
    or a desktop browser, even when the JavaScript URL is identical.
  - Supplying a normal mobile browser User-Agent keeps the Home-page TMDB calls direct
    to TMDB while avoiding the generic Android/OkHttp request identity.
  - Do not set Accept-Encoding here. It is normal to see that header in HTTP
    examples when an app wants to choose gzip, Brotli, or plain identity responses.
    React Native Android already routes these requests through OkHttp. When this
    header is absent, OkHttp owns the gzip path and returns decoded JSON to React
    Native. If we set the header ourselves, we own that content-encoding contract;
    for example, "identity" is safe only when the server actually honors it. We
    do not force "identity" because it makes responses larger and bypasses the
    normal OkHttp path that already knows what it can decode.

  IMPORTANT:
  - This applies only to direct TMDB API calls.
  - Direct TMDB calls must go through tmdbClient or tmdbDirectRequestConfig.
  - The Advanced Search page still uses the Cloudflare Worker path from movieService.ts.
*/
export const tmdbDirectHeaders = {
  Accept: 'application/json',
  ...(Platform.OS === 'android'
    ? {
        'User-Agent': ANDROID_BROWSER_USER_AGENT,
      }
    : {}),
};

export const tmdbDirectRequestConfig = {
  headers: tmdbDirectHeaders,
};

/*
  Shared Axios client for direct TMDB API calls.

  Keep direct TMDB request policy here instead of scattering headers across
  screens or services. That gives the Home page one obvious path for TMDB calls,
  while Advanced Search can continue using the Cloudflare Worker path separately.
*/
export const tmdbClient = axios.create({
  baseURL: CONFIG.apiUrl,
  timeout: CONFIG.timeoutMs,
  headers: tmdbDirectHeaders,
});
