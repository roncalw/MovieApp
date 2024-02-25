import axios, {AxiosError} from 'axios';

const apiUrl = 'https://api.themoviedb.org/3';
const apiKey = 'api_key=422ba447c0f2827f683854b2d4fa154b';

const omdbApiUrl = 'https://www.omdbapi.com';
const omdbApiKey = 'apikey=77bdf9d5';

// Get Popular Movies
export const getPopularMovies = async () =>{
    const resp = await axios.get(`${apiUrl}/movie/popular?${apiKey}`)
    return resp.data.results;
}

// Get Upcoming Movies
export const getUpcomingMovies = async () => {
    const resp = await axios.get (`${apiUrl}/movie/upcoming?${apiKey}`)

    //const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=16,35,10751&without_genres=12,14,878,53,28,10402&year=2008`)

    return resp.data.results;
}

// Get Popular TV
export const getPopularTV = async () => {
    const resp = await axios.get (`${apiUrl}/tv/popular?${apiKey}`)
    return resp.data.results;
}

// Get Family Movies
export const getFamilyMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=10751`)
    return resp.data.results;
}

// Get Comedy
export const getComedyMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=35`)
    return resp.data.results;
}

// Get Drama
export const getDramaMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=18`)
    return resp.data.results;
}

// Get Crime
export const getCrimeMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=80`)
    return resp.data.results;
}

// Get Music
export const getMusicMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=10402`)
    return resp.data.results;
}

// Get Documentaries
export const getDocumentaryMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=99`)
    return resp.data.results;
}

// Get Movie Detail
export const getMovie = async (id: number) => {
    const resp = await axios.get (`${apiUrl}/movie/${id}?${apiKey}&append_to_response=credits,release_dates`)

    return resp.data;
}

// Search for Movie or TV by Keyword
// TV has been removed from the home page temporarily until the movie detail page can also work with the tv details.
// Therefore, will be leaving this signature the same, but then not using the type parameter until the app starts using TV again
export const searchMovieTV = async (query: string, type: string) => {
    type="movie";
    const resp = await axios.get (
        `${apiUrl}/search/${type}?${apiKey}&query=${query}`
        )
    return resp.data.results;
}

// Get Movie Trailers
export const getMovieTrailers = async (id: number) => {
    const resp = await axios.get (`${apiUrl}/movie/${id}/videos?${apiKey}`)
    return resp.data;
}

// Get Watch Providers
export const getMovieWatchProviders = async (id: number) => {
    const resp = await axios.get (`${apiUrl}/movie/${id}/watch/providers?${apiKey}`)
    return resp.data;
}

// Get External IDs, such as IMDB ID, Instagram, Twitter, Facebook
export const getMovieExternalIDs = async (id: number) => {
    const resp = await axios.get (`${apiUrl}/movie/${id}/external_ids?${apiKey}`)
    return resp.data;
}

// Get IMDB Rating
export const getMovieIMDBRating = async (imdbid: string) => {
    console.log(`${omdbApiUrl}/?i=${imdbid}&${omdbApiKey}`);
    const resp = await axios.get (`${omdbApiUrl}/?i=${imdbid}&${omdbApiKey}`)
    return resp.data;
}

// Get Movies by Rating
export const getMoviesByRating = async (movieRatings: string) => {
    //Add paramater for LTE date for release date (was pulling dates back from 2026)
    //Add paramater for paging
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&certification=${movieRatings}&certification_country=US&primary_release_date.lte=2023-12-31&sort_by=popularity.desc&page=1`)
    return resp.data.results;
}

// Get Movies by Date
export const getMoviesByDate = async (movieRatings: string, beginDate: string, endDate: string, movieGenres: string, movieStreamers: string, movieVoteCount: string, movieSortBy:string, pageNum: number) => {
    //console.log(`${apiUrl}/discover/movie?${apiKey}&certification=${movieRatings}&certification_country=US&primary_release_date.gte=${beginDate}&primary_release_date.lte=${endDate}&region=US&with_genres=${movieGenres}&with_watch_providers=${movieStreamers}&vote_count.gte=${movieVoteCount}&watch_region=US&with_watch_monetization_types=flatrate&sort_by=${movieSortBy}&page=${pageNum}`);
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&certification=${movieRatings}&certification_country=US&primary_release_date.gte=${beginDate}&primary_release_date.lte=${endDate}&region=US&with_genres=${movieGenres}&with_watch_providers=${movieStreamers}&vote_count.gte=${movieVoteCount}&watch_region=US&with_watch_monetization_types=flatrate&sort_by=${movieSortBy}&page=${pageNum}`)
    return resp.data.results;
}