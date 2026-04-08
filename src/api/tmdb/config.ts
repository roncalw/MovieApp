/*
Step: 9
   * /MovieApp/src/api/tmdb/config.ts
Called by:
   * /MovieApp/src/api/tmdb/client.ts
   * /MovieApp/src/api/tmdb/services/movieService.ts
Next step path:
   * /MovieApp/src/api/tmdb/endpoints.ts
Purpose:
   * Stores the shared TMDB configuration values like the base API URL, API key query string, and request timeout 
     settings.
*/
/*
  CONFIG = supplier rules

  IN THIS PROJECT:
  - This stores the TMDB base URL
  - This stores the API key query string segment
  - This stores timeout settings for the truck

  WHY THIS EXISTS:
  - So these values are not hardcoded all over the codebase
  - client.ts can read from here
  - services can stay focused on "what to fetch"

  IMPORTANT:
  - You said you will put the key in
  - So replace the placeholder value below with your real key string
*/
export const CONFIG = {
  apiUrl: 'https://api.themoviedb.org/3',
  apiKey: 'api_key=422ba447c0f2827f683854b2d4fa154b',
  timeoutMs: 10000,
};
