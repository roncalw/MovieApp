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
import { CONFIG } from './config';

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
    'Content-Type': 'application/json',
  },
});
