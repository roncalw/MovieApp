import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

/* =========================================================
   TYPES (Data contract)

   WHAT:
   Defines the shape of the data coming from the API.

   WHY:
   - Gives type safety across the app
   - Helps autocomplete and prevents bugs
   - Acts as documentation of API response

   HOW THE ANALOGY APPLIES:
   Before a store can receive products, it needs to know what a
   valid product looks like. This type is that definition.
   In this example, each "product" is a user object with id,
   name, and email.

   WHAT THE CODE IS DOING:
   - `type User = { ... }` creates a TypeScript type alias
   - This does not run at runtime in the app
   - It is used by TypeScript during development/build time

   KEY DETAILS:
   - `id: number` means each user must have a numeric id
   - `name: string` means each user must have a text name
   - `email: string` means each user must have a text email

   NOTE:
   Types can live anywhere, but top-of-file is most common.
   ========================================================= */

type User = {
  id: number;
  name: string;
  email: string;
};

/* =========================================================
   STEP 0 - API CONFIGURATION
   (Analogy: Supplier)

   WHAT:
   Central place that defines:
   - base URL
   - endpoints

   WHY:
   - Avoid hardcoding URLs everywhere
   - Makes switching environments easy (dev/prod)
   - Keeps API details separate from logic

   HOW THE ANALOGY APPLIES:
   In the analogy, this is the information about the outside
   business you rely on:
   - where it is located
   - which "department" or "counter" you need to contact

   In real code, this is just configuration, not a real supplier.

   WHAT THE CODE IS DOING:
   - `API_CONFIG` stores shared API settings
   - `API_ENDPOINTS` stores endpoint paths separately from logic
   - Later code combines the base URL with a specific endpoint

   KEY DETAILS:
   - `BASE_URL` is the root address for all API calls
   - `USERS: '/users'` is the specific path for this request
   - Separating these lets you change one thing in one place

   WHY THIS IS BETTER THAN HARDCODING:
   Instead of scattering strings like
   `https://jsonplaceholder.typicode.com/users`
   all over the code, you define the pieces once and reuse them.
   ========================================================= */

const API_CONFIG = {
  BASE_URL: 'https://jsonplaceholder.typicode.com',
};

const API_ENDPOINTS = {
  USERS: '/users',
};

/* =========================================================
   STEP 1 - AXIOS INSTANCE
   (Analogy: Truck)

   WHAT:
   Preconfigured HTTP client

   WHY:
   - Centralizes baseURL, headers, timeout
   - Prevents repeating config in every request
   - Can add interceptors later (auth, logging)

   IMPORTANT:
   This layer ONLY handles "how to talk to the API"

   HOW THE ANALOGY APPLIES:
   The truck is the transport mechanism.
   It does not decide what inventory to fetch or when to fetch it.
   It only knows how to travel to the API and carry the response back.

   WHAT THE CODE IS DOING:
   - `axios.create({...})` builds a reusable Axios instance
   - That instance is saved in `api`
   - Later, instead of calling `axios.get(...)` directly each time,
     you call `api.get(...)` using the shared configuration

   KEY DETAILS:
   - `axios.create(...)` is used instead of plain `axios.get(...)`
     so you can define shared defaults once
   - `baseURL: API_CONFIG.BASE_URL` means later requests can use
     `/users` instead of repeating the full URL
   - `timeout: 10000` means Axios will stop waiting after 10 seconds
     instead of hanging too long
   - `headers: { 'Content-Type': 'application/json' }` tells the server
     what content format is being used

   WHY AXIOS INSTANCE INSTEAD OF JUST FETCH HERE:
   - Cleaner central config
   - Easier reuse
   - Easier future interceptors
   - Cleaner error handling than raw fetch
   ========================================================= */

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================================================
   STEP 2 - API FUNCTION
   (Analogy: Delivery Driver)

   WHAT:
   A function that calls a specific endpoint

   WHY:
   - Encapsulates one API call
   - Returns clean data (not Axios response)
   - Reusable anywhere (not tied to React)

   RULE:
   Always return response.data (not full response)

   HOW THE ANALOGY APPLIES:
   If the truck is the transport, the driver is the one who is told:
   "Go to this exact location and bring back this exact thing."
   The driver uses the truck, but the driver is the one tied to the
   specific job.

   WHAT THE CODE IS DOING:
   - `const fetchUsers = async () => { ... }` declares an async function
   - It uses `api.get<User[]>(API_ENDPOINTS.USERS)` to make a GET request
   - It waits for the HTTP response
   - It returns only the response body (`response.data`)

   KEY DETAILS:
   - `async` marks the function as asynchronous
   - An `async` function automatically returns a Promise
   - `Promise<User[]>` means:
       "this function does not return the users immediately;
        it returns a promise that will eventually resolve to an array of users"

   WHY A PROMISE:
   API calls are not instant. The app must wait for the network.
   A Promise is JavaScript's standard way to represent a future result.
   You cannot return the finished data immediately because it has not
   arrived yet.

   WHY `Promise<User[]>` INSTEAD OF JUST `User[]`:
   - `User[]` would mean the function already has the array right now
   - But network calls are asynchronous
   - So the function returns a Promise that later resolves to `User[]`

   WHY `await`:
   - `await` pauses inside this async function until the request finishes
   - It is cleaner than chaining `.then(...)`
   - It makes async code read top-to-bottom like synchronous code

   WHY `get`:
   - `get` is the correct HTTP method when you are retrieving data
   - You would use `post`, `put`, `patch`, or `delete` for other actions

   WHY `response.data`:
   Axios returns a larger response object containing metadata such as:
   - status
   - headers
   - config
   - data

   Most of the time, your app screen wants the actual payload only,
   so returning `response.data` keeps the rest of the app cleaner.
   ========================================================= */

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>(API_ENDPOINTS.USERS);
  return response.data;
};

/* =========================================================
   STEP 3 - TANSTACK QUERY HOOK
   (Analogy: Warehouse + Dispatch)

   WHAT:
   Manages when/how data is fetched and cached

   WHAT IT HANDLES:
   - caching
   - deduping requests
   - loading/error state
   - background refetching

   WHY:
   - Prevents duplicate API calls
   - Shares data across components/screens
   - Improves UX (less loading flicker)

   NOTE:
   This layer does NOT know Axios details
   It only calls fetchUsers()

   HOW THE ANALOGY APPLIES:
   The warehouse stores previously received inventory.
   Dispatch decides when to send someone out for more.
   This layer does not drive the truck itself; it decides when the
   driver should go and whether there is already stock on hand.

   WHAT THE CODE IS DOING:
   - `useUsers` is a custom hook
   - Inside it, `useQuery({...})` registers a query with TanStack Query
   - TanStack Query calls `fetchUsers` when needed
   - It tracks loading, success, error, and cached data for you

   KEY DETAILS:
   - `useQuery(...)` is the core TanStack Query hook for reading server data
   - `queryKey: ['users']` gives this query a unique identity in the cache
   - `queryFn: fetchUsers` tells TanStack which function should retrieve data
   - `staleTime: 1000 * 60 * 5` means:
       "after data is fetched, treat it as fresh for 5 minutes"

   WHY `queryKey`:
   TanStack needs a stable label so it knows:
   - what data is cached
   - whether another component is asking for the same data
   - when to reuse data vs fetch again

   WHY `queryFn`:
   This separates "data management" from "network request logic."
   TanStack Query manages the lifecycle.
   Your API function does the actual retrieval.

   WHY A CUSTOM HOOK (`useUsers`) INSTEAD OF PUTTING `useQuery` DIRECTLY
   INTO THE SCREEN:
   - Keeps the screen cleaner
   - Makes the query reusable
   - Gives you one place to adjust query behavior later

   WHY `staleTime`:
   Without it, TanStack may consider data stale sooner and refetch more often.
   With a stale time, recently fetched data can be reused for a while,
   which can reduce extra network activity and loading flicker.
   ========================================================= */

const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  });
};

/* =========================================================
   STEP 4 - UI COMPONENT
   (Analogy: Store Front)

   WHAT:
   Displays data to the user

   RESPONSIBILITY:
   - Render UI
   - Show loading state
   - Show error state
   - Display data

   DOES NOT:
   - Fetch data directly
   - Handle caching logic

   HOW THE ANALOGY APPLIES:
   The store front is what the customer sees.
   It does not run the warehouse and it does not drive the truck.
   It simply shows:
   - "we are loading inventory"
   - "there was a problem"
   - "here are the items"

   WHAT THE CODE IS DOING:
   - Calls `useUsers()` to get query state and data
   - Reads:
       `data`
       `isLoading`
       `isError`
       `error`
   - Renders different UI depending on the current state

   KEY DETAILS:
   - `if (isLoading)` handles the waiting state
   - `if (isError)` handles the failed state
   - If neither is true, the query succeeded and `data` is available
   - `FlatList` is used to efficiently render a scrolling list

   WHY `FlatList`:
   `FlatList` is preferred over manually mapping long lists in React Native
   because it is optimized for performance and large lists.

   WHY `keyExtractor`:
   React needs a stable unique key for each row so it can track updates
   efficiently. Here, `item.id.toString()` turns the numeric id into
   the string key React expects.

   WHY THE `error instanceof Error` CHECK:
   The error value might not always be a standard Error object.
   This check safely narrows the type before reading `error.message`.
   ========================================================= */

function UsersScreen() {
  const { data, isLoading, isError, error } = useUsers();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Loading users...</Text>
      </View>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading users</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <Text style={styles.title}>Public API User List</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      )}
    />
  );
}

/* =========================================================
   QUERY CLIENT (TanStack setup)
   Analogy: Warehouse Manager

   WHAT:
   Global manager for all queries

   WHY:
   - Required for TanStack Query to work
   - Stores cache and query state

   HOW THE ANALOGY APPLIES:
   If the warehouse system exists, it needs a central manager that
   keeps track of inventory records, freshness, and requests.
   That manager is the QueryClient.

   WHAT THE CODE IS DOING:
   - `new QueryClient()` creates the TanStack Query client instance
   - This object holds query cache and query behavior settings

   KEY DETAILS:
   - You usually create this once for the app
   - Screens/hooks then use this shared client through the provider

   WHY NOT CREATE IT INSIDE THE APP COMPONENT BODY EACH RENDER:
   If you recreated it repeatedly, you could lose cache stability.
   Creating it once outside keeps the query cache consistent.
   ========================================================= */

const queryClient = new QueryClient();

/* =========================================================
   APP ROOT

   WHAT:
   Top-level app component that wires TanStack Query into the app

   HOW THE ANALOGY APPLIES:
   This is like opening the whole building and making sure the store,
   warehouse system, and staff are connected to the same operating system.

   WHAT THE CODE IS DOING:
   - `QueryClientProvider` makes the query client available to all
     components below it
   - `SafeAreaView` keeps content inside safe screen bounds on mobile
   - `UsersScreen` is the visible screen for this example

   KEY DETAILS:
   - `client={queryClient}` passes the shared query manager down
   - Without `QueryClientProvider`, `useQuery()` will not work
   - `SafeAreaView` helps avoid notches, status bars, and unsafe edges

   WHY A PROVIDER:
   React providers are the standard way to share context across a tree.
   TanStack Query uses this to let any nested screen/hook access the
   same query client and cache.
   ========================================================= */

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>        
        <UsersScreen />
      </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

/* =========================================================
   STYLES

   WHAT:
   Defines reusable React Native styles for this screen

   WHY:
   - Keeps visual settings in one place
   - Makes JSX cleaner
   - Encourages reuse and consistency

   WHAT THE CODE IS DOING:
   - `StyleSheet.create({...})` creates a React Native style object
   - Each key becomes a named style referenced in JSX

   WHY `StyleSheet.create`:
   It is the standard React Native pattern for organizing styles and
   helps keep style definitions structured and readable.
   ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'red',
  },
});
