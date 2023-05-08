import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {Dimensions, Image, Text, View} from 'react-native';
import { getPopularMovies, getUpcomingMovies} from '../services/MovieServices';
import { SliderBox } from "react-native-image-slider-box";

type movieType = {
    original_title: string;
    original_language: string;
    release_date: string;
    poster_path: string;
  }

type movieImage = string;
  
const Home = () => {
    const [movie, setMovie] = useState<movieType>();
    const [movieImages, setMovieImages] = useState<movieImage[]>([]);
    const [error, setError] = useState<AxiosError | boolean>(false);
  
    useEffect( () => {
      //We can use the promise/then method below for passing the arrow function below to the resolve delegate 
      //variable in the getPopularMovies method above (even though we did not manually add the resolve variable there)
      //because that method, getPopularMovies, is a promise, because it is async with an await, which means it is 
      //promising a return and since no resolve method was manually added, the default is to run the resolve method, 
      //implicitly. Which is the same thing as running the method that was assigned to it, passing in the return value 
      //of its method.
      //Eg. Resolve(resp.data.results), which equates to (resp.data.results) => setMovie(resp.data.results[1])
      getPopularMovies().then(movies => {
        setMovie(movies[1]);
      }).catch(err => {
        setError(err);   
      });

      getUpcomingMovies().then(movieImages => {
        const movieImagesArray: movieImage[] = [];

        movieImages.forEach((movie: movieType ) => {
            movieImagesArray.push('https://image.tmdb.org/t/p/w500'+movie.poster_path)
        });

        setMovieImages(movieImagesArray);
        
      }).catch(err => {
        setError(err);
        console.log(err);      
      });

    }, []);
    console.log('Testing this here thing right now');
    return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <SliderBox images={movieImages} />
        </View>

    );

}

export default Home;