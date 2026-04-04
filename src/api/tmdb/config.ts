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