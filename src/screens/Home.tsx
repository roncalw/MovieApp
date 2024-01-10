import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import { 
          getPopularMovies, 
          getUpcomingMovies,
          getPopularTV,
          getFamilyMovies,
          getComedyMovies,
          getDocumentaryMovies,
          getDramaMovies,
          getMusicMovies,
          getCrimeMovies
} from '../services/MovieServices';
import { SliderBox } from "react-native-image-slider-box";
import List from '../../components/List';
import Error from '../../components/Error';
import { RootStackParamList } from '../../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';

export type movieType = {
  id: number;
  adult: boolean;
  backdrop_path: string;
  genres: movieGenres[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  budget: number;
  revenue: number;
  runtime: number;
  credits: credits;
  release_dates: release_date_results; 
  production_companies: production_company[];
  production_countries: production_country[];
}

type movieGenres = {
  id: number,
  name: string
}

type credits = {
  cast: movieCastProfile[],
  crew: movieCrewProfile[]
}

export type movieCrewProfile = {
  id: number,
  adult: number,
  gender: number,
  known_for_department: string,
  name: string,
  original_name: string,
  profile_path: string,
  job: string
}

export type movieCastProfile = {
  id: number,
  adult: number,
  gender: number,
  known_for_department: string,
  name: string,
  original_name: string,
  profile_path: string,
  character: string
}

  export type production_company = {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }

  export type production_country = {
    iso_3166_1: string;
    name: string;
  }

  export type release_date_results = {
    results: release_date_country[];
  }

  export type release_date_country = {
    iso_3166_1: string;
    release_dates: release_details[]
  }

  export type release_details = {
    certification: string;
    note: string;
    type: number; 
  }


  export type US = {
    US: rent
  }

  export type rent = {
    rent: movieWatchProviderType[],
  }

  export type movieWatchProvidersType = {
      results: US;
    }

  export type movieWatchProviderType = {
      logo_path: string;
      provider_id: number;
      provider_name: string;
    }


type movieImage = [string, movieType];

type movieImagesArray = movieImage[];

const dimensions = Dimensions.get('screen');

//console.log(dimensions);

const Home = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [movieImages, setMovieImages] = useState<movieImage[]>([] );
    const [popularMovies, setPopularMovies] = useState<movieType[]>([] );
    //const [popularTV, setPopularTV] = useState<movieType[]>([] );
    const [familyMovies, setFamilyMovies] = useState<movieType[]>([] );
    const [comedyMovies, setComedyMovies] = useState<movieType[]>([] );
    const [dramaMovies, setDramaMovies] = useState<movieType[]>([] );
    const [crimeMovies, setCrimeMovies] = useState<movieType[]>([] );
    const [musicMovies, setMusicMovies] = useState<movieType[]>([] );
    const [documentaryMovies, setDocumentaryMovies] = useState<movieType[]>([] );

    const [error, setError] = useState<AxiosError | boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    const getData = () => {
      return Promise.all([
        getUpcomingMovies(),
        getPopularMovies(),
        //getPopularTV(),
        getFamilyMovies(),
        getComedyMovies(),
        getDramaMovies(),
        getCrimeMovies(),
        getMusicMovies(),
        getDocumentaryMovies(),
      ]);
    }
  
    useEffect( () => {
      getData().then(
        ([
          movieImagesData,
          popularMoviesData,
          //popularTVData,
          familyMoviesData,
          comedyMovieData,
          dramaMovieData,
          crimeMovieData,
          musicMovieData,
          documentaryMoviesData,
        ]) => {
          let myMovieImagesArray: movieImagesArray = [];

          movieImagesData.forEach((movie: movieType ) => {
            myMovieImagesArray.push(['https://image.tmdb.org/t/p/w500'+movie.poster_path,movie])
          });

          setMovieImages(myMovieImagesArray);
          setPopularMovies(popularMoviesData);
          //setPopularTV(popularTVData);
          setFamilyMovies(familyMoviesData);
          setComedyMovies(comedyMovieData);
          setDramaMovies(dramaMovieData);
          setCrimeMovies(crimeMovieData);
          setMusicMovies(musicMovieData);
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

    const handleImagePress = (index: number) => {
      //console.log(`Image ${index + 1}: ${movieImages[index][1].original_title}`);

      const item = movieImages[index][1];

      return 1 && navigation.navigate('MovieDetail', {id: item.id});

    };

    return (
      <React.Fragment>
        {loaded && !error &&  
        (
          <ScrollView>
            {/* Upcoming Movies */}
            { movieImages && ( 
              <View style={ styles.sliderContainer}>
                <Navbar navigation={navigation} page={'home'}/>



                <SliderBox
                  images={movieImages.map((image) => image[0])}
                  dotStyle={styles.sliderStyle}
                  sliderBoxHeight={dimensions.height / 1.5}
                  autoplay={true}
                  circleLoop={true}
                  onCurrentImagePressed={handleImagePress}
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
            {/* popularTV && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Popular TV Shows"
                  content={popularTV}
                />
              </View >) 
            */}
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
            {/* Comedy Movies */}
            { comedyMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Comedy Movies"
                  content={comedyMovies}
                />
              </View >) 
            }
            {/* Drama Movies */}
            { dramaMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Drama Movies"
                  content={dramaMovies}
                />
              </View >) 
            }
            {/* Crime Movies */}
            { crimeMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Crime Movies"
                  content={crimeMovies}
                />
              </View >) 
            }
            {/* Music Movies */}
            { musicMovies && (
              <View style={ styles.carousel}>
                <List
                  navigation={navigation}
                  title = "Music Movies"
                  content={musicMovies}
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