/*
Step: 1
   * /MovieApp/App.tsx
Imported by:
   * /MovieApp/index.js
Next step path:
   * /MovieApp/src/providers/AppProvider.tsx
Purpose:
   * Starts the React Native app, wraps the visible screen in the shared providers, and chooses MovieSearchScreen as the current root 
     screen.
*/
import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppProvider } from './src/providers/AppProvider';
import { LogLevel, OneSignal, type NotificationClickEvent } from 'react-native-onesignal';

const ONE_SIGNAL_APP_ID = 'a2f43b3a-482e-4129-a076-01e647897d55';


export default function App() {
  
  useEffect(() => {
    // Enable verbose logging while testing. Remove or reduce before release.
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // Initialize OneSignal once when the root app component mounts.
    OneSignal.initialize(ONE_SIGNAL_APP_ID);

    // Optional: use this only if you want the native prompt immediately.
    // For a better user experience, trigger permission after your own explanation screen.
    // OneSignal.Notifications.requestPermission(false);

    const clickListener = (event: NotificationClickEvent) => {
      //__DEV__ is a React Native global boolean that is set to true when in development mode, false in production.
      if (__DEV__) {
        console.log('OneSignal: notification clicked:', event);
      }
    };

    OneSignal.Notifications.addEventListener('click', clickListener);

    return () => {
      OneSignal.Notifications.removeEventListener('click', clickListener);
    };
  }, []);


  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}

/*
1.) App.tsx
Defined in: App.tsx
Imported by:
index.js
Calls:
AppProvider
MovieSearchScreen

👉 This is the entry point. It says:

“Wrap my app in providers, then show the movie screen.”

2.) AppProvider
Defined in: src/providers/AppProvider.tsx
Imported by:
App.tsx
Calls:
SafeAreaProvider
QueryProvider

👉 This is the master wrapper. It combines all app-wide systems.

3.) SafeAreaProvider
Defined in: src/providers/SafeAreaProvider.tsx
Imported by:
AppProvider
Calls:
SafeAreaProvider (from react-native-safe-area-context)
SafeAreaView
QueryProvider (as children)

👉 This ensures:

UI doesn’t overlap notches / status bars

4.) QueryProvider
Defined in: src/providers/QueryProvider.tsx
Imported by:
SafeAreaProvider
Calls:
QueryClientProvider (from TanStack)
MovieSearchScreen (as children)

👉 This sets up:

“The warehouse system” (caching, fetching, refetching)

Without this, React Query does not work at all.

5.) MovieSearchScreen
Defined in: src/search/advanced/MovieSearchScreen.tsx
Imported by:
QueryProvider
Calls:
useMovieSearchQuery()
HeaderMovieSearch
MovieResults

👉 This is your main screen.
It says:

“Show the search filters, load the movie results, and hand the shared list/detail behavior to reusable components.”

6.) HeaderMovieSearch
Defined in: src/search/advanced/HeaderMovieSearch.tsx
Imported by:
MovieSearchScreen
Calls:
SubHeaderTop
SubHeaderMovieSearchFields

👉 This is the parent header.
It says:

“Coordinate the two header siblings so the top submit button and the search fields stay in sync.”

7.) MovieResults
Defined in: src/search/results/MovieResults.tsx
Imported by:
MovieSearchScreen
SearchByMovieTitleScreen
StoredMovieListScreen
Calls:
MovieCard
MovieDetail (when a movie is selected)

👉 This is the shared list/detail controller.
It says:

“Show movie cards, open details when one is tapped, and restore the list position when the user comes back.”

8.) MovieCard
Defined in: src/search/results/MovieCard.tsx
Imported by:
MovieResults
Calls:
Pressable
Image

👉 This is the reusable movie row.
It says:

“Render one tappable movie summary card.”

9.) useMovieSearchQuery
Defined in: src/hooks/useMovieSearchQuery.ts
Imported by:
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
Imported by:
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
Imported by:
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
Imported by:
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
Imported by:
fetchMovieSearchResults
fetchMovie
Provides:
/discover/movie
/movie/:id

👉 This is:

“The map / address”

14.) responseTypes
Defined in: src/api/tmdb/responseTypes.ts
Imported by:
fetchMovieSearchResults
fetchMovie
Defines:
shape of raw API responses

👉 This describes:

“What the supplier sends back”

15.) movieMapper
Defined in: src/api/tmdb/mappers/movieMapper.ts
Imported by:
fetchMovieSearchResults
fetchPopularMovies
Transforms:
raw movie item → clean app movie model

👉 This is:
“Unpacking and repackaging the shipment”

16.) TMDB API
External system
Imported by:
tmdbClient request execution
Returns:
raw JSON movie data

👉 This is:

“The supplier warehouse”

17.) Back to useMovieSearchQuery
Imported by:
TMDB API → tmdbClient → fetchMovieSearchResults
Receives:
mapped movie data
TanStack caches it

👉 This is:

“Warehouse stores the goods”

18.) Back to MovieSearchScreen
Imported by:
useMovieSearchQuery
Receives:
data, isLoading, error

👉 This is:

“Storefront receives inventory and passes it into the shared results list”

19.) UI Render
Imported by:
MovieSearchScreen + MovieResults
Displays:
filter controls + movie cards

👉 This is:

“Customer sees the products”

20.) User taps a movie card
Defined in: src/search/results/MovieResults.tsx
Imported by:
the user tapping a Pressable movie card
Calls:
MovieDetail

👉 This is:

“Customer picks a product to inspect”

21.) MovieDetail
Defined in: src/movie/MovieDetail.tsx
Imported by:
MovieResults
Calls:
useMovieDetailsQuery()

👉 This is the detail storefront.
It says:

“Go get me the full details for this one movie.”

22.) useMovieDetailsQuery
Defined in: src/hooks/useMovieSearchQuery.ts
Imported by:
MovieDetail
Calls:
useQuery (from TanStack)
fetchMovie

👉 This is the warehouse request desk for one movie.

23.) fetchMovie
Defined in: src/api/tmdb/services/movieService.ts
Imported by:
useMovieDetailsQuery
Calls:
tmdbClient.get(...)
uses config
uses endpoints

👉 This is the driver for one selected movie.

It says:

“Go to the movie-details endpoint for THIS id and bring back the full movie record.”

24.) Back to MovieDetail
Imported by:
TMDB API → tmdbClient → fetchMovie → useMovieDetailsQuery
Receives:
data, isLoading, error

👉 This is:

“Storefront shows the single selected product”

*/
