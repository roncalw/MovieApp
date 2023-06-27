import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {ActivityIndicator, Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import { 
          getPopularMovies, 
          getUpcomingMovies,
          getPopularTV,
          getFamilyMovies,
          getDocumentaryMovies
} from '../services/MovieServices';
import { SliderBox } from "react-native-image-slider-box";
import List from '../../components/List';
import Error from '../../components/Error';
import { RootStackParamList } from '../../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type movieGenres = {
  id: number,
  name: string
}

export type movieType = {
    id: number;
    original_title: string;
    original_language: string;
    release_date: string;
    poster_path: string;
    vote_average: number;
    overview: string;
    genres: movieGenres[];
  }

type movieImage = string;

const dimensions = Dimensions.get('screen');

console.log(dimensions);


const Home = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [movieImages, setMovieImages] = useState<movieImage[]>([]);
    const [popularMovies, setPopularMovies] = useState<movieType[]>([] );
    const [popularTV, setPopularTV] = useState<movieType[]>([] );
    const [familyMovies, setFamilyMovies] = useState<movieType[]>([] );
    const [documentaryMovies, setDocumentaryMovies] = useState<movieType[]>([] );

    const [error, setError] = useState<AxiosError | boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    const getData = () => {
      return Promise.all([
        getUpcomingMovies(),
        getPopularMovies(),
        getPopularTV(),
        getFamilyMovies(),
        getDocumentaryMovies(),
      ]);
    }
  
    useEffect( () => {
      getData().then(
        ([
          movieImagesData,
          popularMoviesData,
          popularTVData,
          familyMoviesData,
          documentaryMoviesData,
        ]) => {
          const movieImagesArray: movieImage[] = [];

          movieImagesData.forEach((movie: movieType ) => {
              movieImagesArray.push('https://image.tmdb.org/t/p/w500'+movie.poster_path)
          });

          setMovieImages(movieImagesArray);
          setPopularMovies(popularMoviesData);
          setPopularTV(popularTVData);
          setFamilyMovies(familyMoviesData);
          setDocumentaryMovies(documentaryMoviesData);          
        }
      ).catch(() => {
        setError(true);
      }).finally(() => {
          setLoaded(true);
      });

      //We can use the promise/then method below for passing the arrow function below to the resolve delegate 
      //variable in the getPopularMovies method above (even though we did not manually add the resolve variable there)
      //because that method, getPopularMovies, is a promise, because it is async with an await, which means it is 
      //promising a return and since no resolve method was manually added, the default is to run the resolve method, 
      //implicitly. Which is the same thing as running the method that was assigned to it, passing in the return value 
      //of its method.
      //Eg. Resolve(resp.data.results), which equates to (resp.data.results) => setMovie(resp.data.results[1])
      /*
        getPopularMovies().then(movies => {
          setPopularMovies(movies);
        }).catch(err => {
          setError(err);   
        });
      */

    }, []);

    return (
      <React.Fragment>
        {loaded && !error &&  
        (
          <ScrollView>
            {/* Upcoming Movies */}
            { movieImages && ( 
              <View style={ styles.sliderContainer}>
                <SliderBox
                  images={movieImages}
                  dotStyle={styles.sliderStyle}
                  sliderBoxHeight={dimensions.height / 1.5}
                  autoplay={true}
                  circleLoop={true}
                  />
              </View>)
            }
          {/* Popular Movies */}
            { popularMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Popular Movies"
                  content={popularMovies}
                />
              </View >)
            }
            {/* Popular TV */}
            { popularTV && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Popular TV Shows"
                  content={popularTV}
                />
              </View >) 
            }
            {/* Family Movies */}
            { familyMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Family Movies"
                  content={familyMovies}
                />
              </View >) 
            }
            {/* documentary Movies */}
            { documentaryMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Documentary Movies"
                  content={documentaryMovies}
                />
              </View >) 
            }

          </ScrollView>
        )} 
        { !loaded && (<ActivityIndicator size="large" />) } 
        {error && (<Error />)}
      </React.Fragment>
    );
}

const styles = StyleSheet.create({
  sliderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',         
  },
  sliderStyle: {
        height: 0,
  },
  carousel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',         
  }
})

export default Home;