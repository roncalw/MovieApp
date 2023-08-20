import axios, {AxiosError} from 'axios';

const apiUrl = 'https://api.themoviedb.org/3';
const apiKey = 'api_key=422ba447c0f2827f683854b2d4fa154b';

// Get Popular Movies
export const getPopularMovies = async () =>{
    const resp = await axios.get(`${apiUrl}/movie/popular?${apiKey}`)
    return resp.data.results;
}

// Get Upcoming Movies
export const getUpcomingMovies = async () => {
    const resp = await axios.get (`${apiUrl}/movie/upcoming?${apiKey}`)
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

// Get Documentaries
export const getDocumentaryMovies = async () => {
    const resp = await axios.get (`${apiUrl}/discover/movie?${apiKey}&with_genres=99`)
    return resp.data.results;
}

// Get Movie Detail
export const getMovie = async (id: number) => {
    const resp = await axios.get (`${apiUrl}/movie/${id}?${apiKey}`)
    return resp.data;
}

// Search for Movie or TV by Keyword
export const searchMovieTV = async (query: string, type: string) => {
    const resp = await axios.get (
        `${apiUrl}/search/${type}?${apiKey}&query=${query}`
        )
    return resp.data.results;
}