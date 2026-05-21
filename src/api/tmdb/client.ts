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
  tmdbClient = truck

  WHAT THIS IS IN THIS PROJECT:
  - A configured Axios instance for TMDB
  - services/moviesService.ts will use this truck to make the trip

  WHY axios.create(...) IS USED:
  - So shared request settings are defined once
  - services can reuse the same truck

  IN THIS PROJECT, THOSE SETTINGS ARE:
  - baseURL = TMDB root URL
  - timeout = how long to wait before giving up

  WHY WE ARE NOT PUTTING apiKey IN HEADERS HERE:
  - Because the code pattern you gave uses query-string api_key
  - So we keep that style and let the service build that exact URL

  DEVIL'S-ADVOCATE NOTE:
  - In many TMDB examples, people use bearer token auth in headers
  - But you explicitly gave the api_key query-string style, so I am following your requested pattern
*/
export const tmdbClient = axios.create({
  baseURL: CONFIG.apiUrl,
  timeout: CONFIG.timeoutMs,
  headers: {
    ...tmdbDirectHeaders,
    'Content-Type': 'application/json',
  },
});
