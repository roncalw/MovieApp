/*
Step: 1
   * /MovieApp/App.tsx
Called by:
   * /MovieApp/index.js
Next step path:
   * /MovieApp/src/providers/AppProvider.tsx
Purpose:
   * Starts the React Native app, wraps the visible screen in the shared providers, and chooses MovieSearchScreen as the current root 
     screen.
*/
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
Called by:
index.js
Calls:
AppProvider
MovieSearchScreen

👉 This is the entry point. It says:

“Wrap my app in providers, then show the movie screen.”

2.) AppProvider
Defined in: src/providers/AppProvider.tsx
Called by:
App.tsx
Calls:
SafeAreaProvider
QueryProvider

👉 This is the master wrapper. It combines all app-wide systems.

3.) SafeAreaProvider
Defined in: src/providers/SafeAreaProvider.tsx
Called by:
AppProvider
Calls:
SafeAreaProvider (from react-native-safe-area-context)
SafeAreaView
QueryProvider (as children)

👉 This ensures:

UI doesn’t overlap notches / status bars

4.) QueryProvider
Defined in: src/providers/QueryProvider.tsx
Called by:
SafeAreaProvider
Calls:
QueryClientProvider (from TanStack)
MovieSearchScreen (as children)

👉 This sets up:

“The warehouse system” (caching, fetching, refetching)

Without this, React Query does not work at all.

5.) MovieSearchScreen
Defined in: src/screens/MovieSearchScreen.tsx
Called by:
QueryProvider
Calls:
useMovieSearchQuery()
MovieSearchHeader
MovieResultsList

👉 This is your main screen.
It says:

“Show the search filters, load the movie results, and hand the shared list/detail behavior to reusable components.”

6.) MovieSearchHeader
Defined in: src/components/MovieSearchHeader.tsx
Called by:
MovieSearchScreen
Calls:
section labels
select chips

👉 This is the filter header.
It says:

“Render the search controls and query summary above the results list.”

7.) MovieResultsList
Defined in: src/components/MovieResultsList.tsx
Called by:
MovieSearchScreen
PopularMoviesScreen
Calls:
MovieCard
MovieDetail (when a movie is selected)

👉 This is the shared list/detail controller.
It says:

“Show movie cards, open details when one is tapped, and restore the list position when the user comes back.”

8.) MovieCard
Defined in: src/components/MovieCard.tsx
Called by:
MovieResultsList
Calls:
Pressable
Image

👉 This is the reusable movie row.
It says:

“Render one tappable movie summary card.”

9.) useMovieSearchQuery
Defined in: src/hooks/queries/useMovieSearchQuery.ts
Called by:
MovieSearchScreen
Calls:
useQuery (from TanStack)
fetchMovieSearchResults

👉 This is the warehouse request desk.

It defines:

query key (identity)
query function (what to run)

10.) fetchMovieSearchResults
Defined in: src/api/tmdb/services/movieService.ts
Called by:
useMovieSearchQuery
Calls:
tmdbClient.get(...)
uses config
uses endpoints

👉 This is the driver.

It says:

“Go to the search endpoint with these filters and bring back movie data.”

11.) tmdbClient (axios instance)
Defined in: src/api/tmdb/client.ts
Called by:
fetchMovieSearchResults
fetchMovie
Calls:
axios.create(...)
uses config

👉 This is the truck.

It controls:

base URL
headers
API key handling

12.) config
Defined in: src/api/tmdb/config.ts
Called by:
tmdbClient
fetchMovieSearchResults
fetchMovie
Provides:
baseURL
apiKey

👉 This is:

“The supplier contract”

13.) endpoints
Defined in: src/api/tmdb/endpoints.ts
Called by:
fetchMovieSearchResults
fetchMovie
Provides:
/discover/movie
/movie/:id

👉 This is:

“The map / address”

14.) responseTypes
Defined in: src/api/tmdb/responseTypes.ts
Called by:
fetchMovieSearchResults
fetchMovie
Defines:
shape of raw API responses

👉 This describes:

“What the supplier sends back”

15.) movieMapper
Defined in: src/api/tmdb/mappers/movieMapper.ts
Called by:
fetchMovieSearchResults
fetchPopularMovies
Transforms:
raw movie item → clean app movie model

👉 This is:
“Unpacking and repackaging the shipment”

16.) TMDB API
External system
Called by:
tmdbClient request execution
Returns:
raw JSON movie data

👉 This is:

“The supplier warehouse”

17.) Back to useMovieSearchQuery
Called by:
TMDB API → tmdbClient → fetchMovieSearchResults
Receives:
mapped movie data
TanStack caches it

👉 This is:

“Warehouse stores the goods”

18.) Back to MovieSearchScreen
Called by:
useMovieSearchQuery
Receives:
data, isLoading, error

👉 This is:

“Storefront receives inventory and passes it into the shared results list”

19.) UI Render
Called by:
MovieSearchScreen + MovieResultsList
Displays:
filter controls + movie cards

👉 This is:

“Customer sees the products”

20.) User taps a movie card
Defined in: src/components/MovieResultsList.tsx
Called by:
the user tapping a Pressable movie card
Calls:
MovieDetail

👉 This is:

“Customer picks a product to inspect”

21.) MovieDetail
Defined in: src/screens/MovieDetail.tsx
Called by:
MovieResultsList
Calls:
useMovieDetailsQuery()

👉 This is the detail storefront.
It says:

“Go get me the full details for this one movie.”

22.) useMovieDetailsQuery
Defined in: src/hooks/queries/useMovieSearchQuery.ts
Called by:
MovieDetail
Calls:
useQuery (from TanStack)
fetchMovie

👉 This is the warehouse request desk for one movie.

23.) fetchMovie
Defined in: src/api/tmdb/services/movieService.ts
Called by:
useMovieDetailsQuery
Calls:
tmdbClient.get(...)
uses config
uses endpoints

👉 This is the driver for one selected movie.

It says:

“Go to the movie-details endpoint for THIS id and bring back the full movie record.”

24.) Back to MovieDetail
Called by:
TMDB API → tmdbClient → fetchMovie → useMovieDetailsQuery
Receives:
data, isLoading, error

👉 This is:

“Storefront shows the single selected product”

*/
