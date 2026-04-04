import React from 'react';
import { AppProvider } from './src/providers/AppProvider';
import { PopularMoviesScreen } from './src/screens/PopularMoviesScreen';
import { MovieSearchScreen } from './src/screens/MovieSearchScreen';

export default function App() {
  return (
    <AppProvider>
      <MovieSearchScreen />
    </AppProvider>
  );
}

/*
1.) App.tsx
Defined in: App.tsx
Calls:
AppProvider
PopularMoviesScreen

👉 This is the entry point. It says:

“Wrap my app in providers, then show the movie screen.”

2.) AppProvider
Defined in: src/providers/AppProvider.tsx
Calls:
QueryProvider
SafeAreaProvider

👉 This is the master wrapper. It combines all app-wide systems.

3.) QueryProvider
Defined in: src/providers/QueryProvider.tsx
Calls:
QueryClientProvider (from TanStack)

👉 This sets up:

“The warehouse system” (caching, fetching, refetching)

Without this, React Query does not work at all.

4.) SafeAreaProvider
Defined in: src/providers/SafeAreaProvider.tsx
Calls:
SafeAreaProvider (from react-native-safe-area-context)

👉 This ensures:

UI doesn’t overlap notches / status bars

5.) PopularMoviesScreen
Defined in: src/screens/PopularMoviesScreen.tsx
Calls:
usePopularMoviesQuery()

👉 This is your actual screen.
It says:

“Go get me movies so I can render them.”

6.) usePopularMoviesQuery
Defined in: src/hooks/queries/usePopularMoviesQuery.ts
Calls:
useQuery (from TanStack)
fetchPopularMovies

👉 This is the warehouse request desk.

It defines:

query key (identity)
query function (what to run)
7.) fetchPopularMovies
Defined in: src/api/tmdb/services/moviesService.ts
Calls:
client.get(...)
uses endpoints

👉 This is the driver.

It says:

“Go to THIS endpoint and bring back movie data.”

8.) client (axios instance)
Defined in: src/api/tmdb/client.ts
Calls:
axios.create(...)
uses config

👉 This is the truck.

It controls:

base URL
headers
API key handling
9.) config
Defined in: src/api/tmdb/config.ts
Provides:
baseURL
apiKey

👉 This is:

“The supplier contract”

10.) endpoints
Defined in: src/api/tmdb/endpoints.ts
Provides:
/movie/popular

👉 This is:

“The map / address”

11.) TMDB API
External system
Returns:
raw JSON movie data

👉 This is:

“The supplier warehouse”

12.) responseTypes
Defined in: src/api/tmdb/responseTypes.ts
Defines:
shape of raw API response

👉 This describes:

“What the supplier sends back”

13.) movieMapper
Defined in: src/api/tmdb/mappers/movieMapper.ts
Transforms:
raw API → clean app model

👉 This is:

“Unpacking and repackaging the shipment”

14.) Back to usePopularMoviesQuery
Receives:
mapped movie data
TanStack caches it

👉 This is:

“Warehouse stores the goods”

15.) Back to PopularMoviesScreen
Receives:
data, isLoading, error

👉 This is:

“Storefront receives inventory”

16.) UI Render
Displays:
movie list

👉 This is:

“Customer sees the products”

*/

