import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Dimensions, Text, View, Modal, Pressable, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import {movieType, movieCastProfile, movieCrewProfile, movieWatchProviderType, movieWatchProvidersType, release_date_country, release_details, production_company, production_country } from "../screens/Home"

import { RouteProp, useIsFocused } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation'
import { getMovie, getMovieTrailers, getMovieWatchProviders } from '../services/MovieServices';
import { AxiosError } from 'axios';
import Error from '../../components/Error';
import StarRating  from 'react-native-star-rating';
import dateFormat from 'dateformat';
import PlayButton from '../../components/PlayButton';
import VideoPlayer from 'react-native-video-controls';
import Video from '../../components/Video';
import Icon from 'react-native-vector-icons/Ionicons';
import Navbar from '../../components/Navbar';
import { formatCurrency } from "../utilities/formatCurrency"
import Colors from '../../theme/Color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PinchableImage from '../../components/PinchableImage';

/* =============================================================================================================================================================== */
/*                                                                                                         NAVIGATION SETUP                                        */
/* =============================================================================================================================================================== */

//"route" is used for passing parameters from one screen to another using the navigation object also above
type PropsType = {
  navigation: NativeStackNavigationProp<RootStackParamList>,
  route: RouteProp<RootStackParamList, 'MovieDetail'>
} 


/* =============================================================================================================================================================== */
/*                                                                                                         MOVIE TRAILER SETUP                                     */
/* =============================================================================================================================================================== */

type movieTrailerJson = {
  id: string;
  results: movieTrailerType[];
}

type movieTrailerType = {
  id: string;
  key: string | undefined;
  name: string;
  type: string;
  official: boolean;
}


/* =============================================================================================================================================================== */
/*                                                                                                         IMAGE SETUP                                             */
/* =============================================================================================================================================================== */

const placeholderImage = require('../../assets/images/PicNotFoundV6.png');
const TMDB_Logo = require('../../assets/images/TMDB_Logo.png');
const JustWatch_Logo = require('../../assets/images/JustWatch_Logo.png');
const posterBackgroundImage = require('../../assets/images/hamburgerMenu.png');



/* =============================================================================================================================================================== */
/*                                                                                                         DIMENSIONS SETUP                                        */
/* =============================================================================================================================================================== */

const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;

//console.log(screenHeight + ' ' + screenWidth);

export default function MovieDetail({ navigation, route }: PropsType) {

/* =============================================================================================================================================================== */
/*                                                                                         USE THE PASSED IN ROUTE OBJ TO PASS IN MOVIE ID                         */
/* =============================================================================================================================================================== */

    const movieId = route.params.id;


/* =============================================================================================================================================================== */
/*                                                                                                         USE STATE VARIABLES SETUP                               */
/* =============================================================================================================================================================== */

    const [movieDetail, setMovieDetail] = useState<movieType>();
    const [movieTrailers, setMovieTrailers] = useState<movieTrailerJson>();
    const [movieWatchProviders, setMovieWatchProviders] = useState<movieWatchProvidersType>();
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | boolean>(false);


/* =============================================================================================================================================================== */
/*                                                    DOES NOT GET YET - CREATES THE DATA FUNCTION ON MOVIE DETAILS - MOVIE / MOVIE TRAILERS / STREAMERS           */
/* =============================================================================================================================================================== */

    const getData = () => {
      return Promise.all([
        getMovie(movieId),
        getMovieTrailers(movieId),
        getMovieWatchProviders(movieId)
      ]);
    }


/* =============================================================================================================================================================== */
/*   LOAD THE DATA ON MOVIE DETAILS, USING THE FUNCTION ABOVE AND ADDING THE DATA TO THE USESTATE VARIABLES CREATED ABOVE - MOVIE / MOVIE TRAILERS / STREAMERS           */
/* =============================================================================================================================================================== */

    useEffect( () => {
      getData().then(
        ([
          movieDetailData,
          movieTrailersData,
          movieWatchProvidersData
        ]) => {
          setMovieDetail(movieDetailData);
          setMovieTrailers(movieTrailersData);
          setMovieWatchProviders(movieWatchProvidersData);      
        }
      ).catch(() => {
        setError(true);
      }).finally(() => {
          setLoaded(true);
      });

    }, [movieId]);

    const isFocused = useIsFocused();
    

    type localMovieStoreType = {
        id: number | undefined;
        adult: boolean | undefined;
        backdrop_path: string | undefined;
        genres: number[] | undefined;
        original_language: string | undefined;
        original_title: string | undefined;
        overview: string | undefined;
        popularity: number | undefined;
        poster_path: string | undefined;
        release_date: string | undefined;
        title: string | undefined;
        video: boolean | undefined;
        vote_average: number | undefined;
        vote_count: number | undefined;
    }


    const movieImageURL = movieDetail?.poster_path;
    const movieTitle = movieDetail?.title;
    const movieGenres = movieDetail?.genres;
    const movieVoteAverage = movieDetail?.vote_average;
    const movieAppCast = movieDetail?.credits.cast;
    const movieAppCrew = movieDetail?.credits.crew;
    const movieAppProductionCompanies = movieDetail?.production_companies;
    const movieAppProductionCountries = movieDetail?.production_countries;
    const movieBudget = movieDetail?.budget;
    const movieRevenue = movieDetail?.revenue;
    const movieRuntime = movieDetail?.runtime;


/* =============================================================================================================================================================== */
/*                                                                                              MOVIE RATING                                                       */
/* =============================================================================================================================================================== */
    

/* TO GET THE MOVIE RATING FOR THE US, YOU HAVE TO GET THE COUNTRIES */
    const movieReleaseDateCountries = movieDetail?.release_dates.results;

/* YOU THEN HAVE TO PULL OUT THE US TO THEN LOOK INSIDE IT TO SEE THE LIST OF MOVIE RATINGS */

/* THIS WILL BE THE VARIABLE TO REPRESENT THE COUNTRY WE ARE LOOKING FOR, THE US */
    let movieReleaseDateCountry: release_date_country | null = null;

/* LOOL THROUGH THE COUNTRIES AND WHEN US IS FOUND, ASSIGN IT TO THE VARIABLE ABOVE */
    movieReleaseDateCountries?.map(release_dates => {      
      if (release_dates.iso_3166_1 === 'US') {
        movieReleaseDateCountry = release_dates;
      }
    })

/* WE WILL NOW GET THE MOVIE RATING INSIDE THE US OBJECT */
  
    let movieRating: string = '';

    /* TO READ THE OBJECTS INSIDE THE OBJECT USE THE STRINGIFY */
    const jsonString = JSON.stringify(movieReleaseDateCountry);

    /* THEN PARSE THE STRINGIFIED OBJECT TO GET THE OBJECT */
    const jsonObject: release_date_country = JSON.parse(jsonString);

    //console.log(jsonObject);

    /* LOOK INSIDE THE OBJECT TO THEN GET THE CERTIFICATION AND ASSIGN IT TO THE movieRating VARIABLE */
    if (jsonObject) {
      if (jsonObject.iso_3166_1) {

        jsonObject.release_dates.map((release_detail: release_details) => {
          if (release_detail.certification)
          {movieRating=release_detail.certification}
        })

      }
    }


/* =============================================================================================================================================================== */
/*                                                                                              MOVIE WATCH PROVIDERS - STREAMERS                                  */
/* =============================================================================================================================================================== */
    
/* USING THE STATE VARIABLE THAT WAS ASSIGNED DATA FROM A QUERY THAT RETURNS ALL WATCH PROVIDERS USING A MOVIE ID, 
CREATE VARIABLES FOR THE DIFFERENT TYPES STREAMERS IN THAT DATA AND THEN ASSIGN THE DATA TO THESE TYPES ... IT'S ORGANIZING THE WATCH PROVIDERS BY THEIR TYPES 
WE WILL SHOW JUST WHAT IS FOR FREE (ADS), WHAT IS PART OF A SUBSCRIPTION (FLATRATE) AND WHAT CAN BE RENTED (RENT)*/
    
    const movieAppAdsWatchProviders = movieWatchProviders?.results?.US?.ads;
    const movieAppFlatrateWatchProviders = movieWatchProviders?.results?.US?.flatrate;
    const movieAppWatchProviders = movieWatchProviders?.results?.US?.rent;

    //console.log(JSON.stringify(movieWatchProviders));
    //useEffect(() => {
      // console.log(`Movie Detail JSON: ${JSON.stringify(localMovieStore)}`); // Log the updated selectedItems immediately after state update
      //
      //);

    //}, [movieDetail]);
  


/* =============================================================================================================================================================== */
/*                                                                        MOVIE WATCH DETAIL STUFF - VOTES, DESCRIPTION, RELEASE DATE, TRAILERS                    */
/* =============================================================================================================================================================== */

    let movieStarRating = 1;
    if (movieVoteAverage){
      movieStarRating = movieDetail.vote_average / 2
    } 
    const movieOverview = movieDetail?.overview;
    const movieReleaseDate = dateFormat(movieDetail?.release_date, 'mmmm dS, yyyy', true);
    const [modalVisible, setModalVisible] = useState(false);

    const videoShown = () => {
      setModalVisible(!modalVisible)
      //setModalVisible(modalVisible => {return !modalVisible} )
    }

    const filteredTrailers  = movieTrailers?.results.filter(
      trailer => trailer.type === "Trailer" && trailer.official === true
    ) ?? [];

    // if (filteredTrailers.length > 0) {
    //   console.log("Filtered trailers :", filteredTrailers);
    // } else {
    //   console.log("No matching trailers found");
    // }


    const movieTrailerKey = filteredTrailers[0] ? filteredTrailers[0].key : '0000';


    //console.log(movieTrailers?.results);

    //console.log(movieTitle);

    // console.log(movieId);


    //console.log(movieAppWatchProviders);

    //if (movieReleaseDateCountry) { console.log(movieReleaseDateCountry); }


/* =============================================================================================================================================================== */
/*                                                                        CAST INFORMATION   - TO RENDER FROM A FLATLIST                                           */
/* =============================================================================================================================================================== */


    const _renderCastItem: ListRenderItem<movieCastProfile> = ({item}) => {
      return (
        <View style={{alignItems: 'center', padding: 0, paddingRight: 10 }}>

            <View style={{margin: 0 }}>
                <Image
                    style={styles.profile}
                    source={
                        item.profile_path
                        ? {uri: 'https://image.tmdb.org/t/p/w500'+item.profile_path}
                        : placeholderImage
                    }
                />
            </View>

            <View style={{display: 'flex', alignItems: 'center', width: 115}}>
              <Text style={{fontWeight: 'bold', textAlign: 'center'}}>{item.name}</Text>
              <Text style={{textAlign: 'center'}}>{item.character}</Text>
            </View>

        </View>
      );
    }; 


/* =============================================================================================================================================================== */
/*                                                                        CREW INFORMATION   - TO RENDER FROM A FLATLIST                                           */
/* =============================================================================================================================================================== */


    const _renderCrewItem: ListRenderItem<movieCrewProfile> = ({item}) => {
      return (
        <View style={{alignItems: 'center', padding: 0, paddingRight: 10 }}>

            <View style={{margin: 0 }}>
                <Image
                    style={styles.profile}
                    source={
                        item.profile_path
                        ? {uri: 'https://image.tmdb.org/t/p/w500'+item.profile_path}
                        : placeholderImage
                    }
                />
            </View>

            <View style={{display: 'flex', alignItems: 'center', width: 110}}>
              <Text style={{fontWeight: 'bold', textAlign: 'center'}}>{item.name}</Text>
              <Text style={{textAlign: 'center'}}>{item.job}</Text>
            </View>

        </View>
      );
    }; 


/* =============================================================================================================================================================== */
/*                                                                        STORING THE MOVIE LOCALLY                                                                */
/* =============================================================================================================================================================== */

    /* THE HEART */
    const [isFilled, setIsFilled] = useState(false);

    /* LOCAL STORAGE */
    const [localMovieStore, setLocalMovieStore] = useState<localMovieStoreType>();


    /* LOAD THE MOVIE DETAIL UP INTO A VARIABLE updatedLocalMovieStore, AND PUT THAT IN A FUNCTION TO UPDATE THE LOCAL MOVIE STORE VARIABLE CREATED IN THE PREVIOUS LIKE ABOVE  */
    const updateLocalMovieStore = useCallback(() => {
      if (movieDetail) {
        const updatedLocalMovieStore: localMovieStoreType = {
          id: movieDetail?.id,
          adult: movieDetail?.adult,
          backdrop_path: movieDetail?.backdrop_path,
          genres: movieDetail?.genres.map(genre => genre.id),
          original_language: movieDetail?.original_language,
          original_title: movieDetail?.original_title,
          overview: movieDetail?.overview,
          popularity: movieDetail?.popularity,
          poster_path: movieDetail?.poster_path,
          release_date: movieDetail?.release_date,
          title: movieDetail?.title,
          video: movieDetail?.video,
          vote_average: movieDetail?.vote_average,
          vote_count: movieDetail?.vote_count
        };
        setLocalMovieStore(updatedLocalMovieStore);
      }
    }, [movieDetail]);

    /* LOAD THE MOVIE INTO THE localMovieStore OBJECT EVERY TIME THE PAGE LOADS, AND JUST ONCE (USING THE CONST IN THE PREVIOUS LINES ABOVE) */
    useEffect(() => {
      updateLocalMovieStore();
    }, [movieDetail, updateLocalMovieStore]);

    // // Your JSON object
    // const localMovieStore: localMovieStoreType = {
    //   id: movieDetail?.id,
    //   adult: movieDetail?.adult,
    //   backdrop_path: movieDetail?.backdrop_path,
    //   genres: movieDetail?.genres.map(genre => genre.id),
    //   original_language: movieDetail?.original_language,
    //   original_title: movieDetail?.original_title,
    //   overview: movieDetail?.overview,
    //   popularity: movieDetail?.popularity,
    //   poster_path: movieDetail?.poster_path,
    //   release_date: movieDetail?.release_date,
    //   title: movieDetail?.title,
    //   video: movieDetail?.video,
    //   vote_average: movieDetail?.vote_average,
    //   vote_count: movieDetail?.vote_count
    // };


    /* CREATE THE FUNCTION THAT WILL CHECK IF THE MOVIE IS ALREADY SAVED LOCALLY OR NOT, AND IF NOT LEAVE THE HEART ICON UNFILLED, OTHERWISE FILL IT */

    const checkHeartIcon = () => {

      const checkMovieData = async (movieId: number | undefined): Promise<void> => {
        try {
          const data = await AsyncStorage.getItem('movieData');
          let movieArray: localMovieStoreType[] = data ? JSON.parse(data) : [];
      
          // Check if the movie with the same ID exists in the array
          const existingMovie = movieArray.find(movie => movie.id === movieId);
      
          if (existingMovie) {
            // Push the new movie object into the array
            setIsFilled(true);
            //console.log('Movie is a favorite!');
          } else {
            setIsFilled(false);
            //console.log(`Movie is not a favorite.${movieId}`);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      /* THE localMovieStore OBJECT IS LOADED ON PAGE LOAD (SEE USE EFFECT ABOVE) SO THE IF SHOULD BE TRUE, SO THIS SHOULD ALWAYS RUN THE SIBLING CODE HERE, checkMovieData TO KNOW IF HEART SHOULD BE FILLED */
      if (localMovieStore)
      {checkMovieData(localMovieStore.id);}

    }

    /* THIS CALLED WHEN CLICKING ON THE HEART ICON */
    const toggleHeartIcon = () => {
      //console.log(isFilled);
      //console.log('The heart was clicked on!');

      // AsyncStorage.getItem('movieData')
      // .then((data) => {
      //   let movieArray1 = data ? JSON.parse(data) : [];
      //   console.log(movieArray1);
      // });

/*SAVE THE MOVIE IF THE HEAR IS NOT FILLED IN */

      if (!isFilled) {

        const saveMovieData = async (movieData: localMovieStoreType): Promise<void> => {
          try {
            const data = await AsyncStorage.getItem('movieData');
            let movieArray: localMovieStoreType[] = data ? JSON.parse(data) : [];
        
            // Check if the movie with the same ID exists in the array
            const existingMovie = movieArray.find(movie => movie.id === movieData.id);
        
            if (!existingMovie) {
              // Push the new movie object into the array
              movieArray.push(movieData);
        
              // Save the updated array back to AsyncStorage
              await AsyncStorage.setItem('movieData', JSON.stringify(movieArray));
              //console.log('Movie data saved successfully!');
            } else {
              console.log('Movie with the same ID already exists.');
            }
          } catch (error) {
            console.error('Error:', error);
          }
        };
        
        // Call the function to save the movie object
        if (localMovieStore)

        {saveMovieData(localMovieStore);}


        } else {

          /* DELETE THE MOVIE FROM LOCAL STORAGE */
          const removeMovieById = async (movieId: number | undefined): Promise<void> => {
            try {
              const data = await AsyncStorage.getItem('movieData');
              let movieArray: localMovieStoreType[] = data ? JSON.parse(data) : [];
          
              // Filter the movieArray to exclude the movie with the given ID
              const updatedMovieArray = movieArray.filter(movie => movie.id !== movieId);
          
              // Save the updated array back to AsyncStorage
              await AsyncStorage.setItem('movieData', JSON.stringify(updatedMovieArray));
              //console.log('Movie removed successfully!');
            } catch (error) {
              console.error('Error:', error);
            }
          };
          
          // Specify the ID of the movie you want to remove
          if (localMovieStore) {

          const movieIdToRemove = localMovieStore.id; // Replace with the desired movie ID}
          
          // Call the function to remove the movie by ID
          removeMovieById(movieIdToRemove);}
          
        };

        setIsFilled(() => !isFilled);
    };



    //checkHeartIcon();
/* CHECKS THE STATE OF THE HEART ICON TO EITHER FILL IN OR NOT THE HEART ICON WHEN EVER THERE IS A CHANGE TO THE MOVIE STORE (NOT JUST ON PAGE LOAD) */
    useEffect(() => {
      checkHeartIcon();
      //console.log('Ran check heart icon');
  }, [localMovieStore]);



    return (
      <React.Fragment>
        <View>
          {loaded && !error && (
            <ScrollView style={{ marginTop: 50 }}>


{/* ======================================================================================================================================================== */}
{/*                                                                         NAV BAR                                                                          */}
{/* ======================================================================================================================================================== */}

                <Navbar navigation={navigation} page={'movieDetail'}/>
 

{/* ======================================================================================================================================================== */}
{/*                                                                         TOP IMAGE                                                                        */}
{/* ======================================================================================================================================================== */}


                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 25, backgroundColor: ''}}>

                <GestureHandlerRootView style={{ flex: 1 }}>
                <PinchableImage
                      width={screenWidth / 2.14}
                      height={screenHeight / 3.09}
                      /*style={{ marginTop: 15, marginBottom: 5, height: screenHeight / 3.09, width: screenWidth / 2.14,alignSelf: 'center', borderWidth: 10, borderRadius: 20}}*/ 
                      source = {
                            movieImageURL
                            ? {uri: 'https://image.tmdb.org/t/p/w500'+movieImageURL}
                            : placeholderImage
                          }
                    />
                    </GestureHandlerRootView>

                </View>


{/* ======================================================================================================================================================== */}
{/*                                                                         HEART ICON                                                                       */}
{/* ======================================================================================================================================================== */}

                <View style={styles.scrollViewContainer}>

                    <View style={{flexDirection: 'row', borderWidth: 0, justifyContent: 'space-between', position: 'absolute', top: -25, paddingRight: 25, paddingLeft: 20 }}>
                      <View style={{flex: 1,  alignItems: 'flex-start', borderWidth: 0, marginTop: 5 }}>
                          <Pressable
                                    onPress={toggleHeartIcon}>
                                          <View
                                            style={{
                                              width: 50,
                                              height: 50,
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Icon
                                              name={isFilled ? 'heart' : 'heart-outline'}
                                              size={50}
                                              color={isFilled ? 'red' : 'red'} // Fill color for the heart icon
                                              style={{
                                                position: 'absolute',
                                                zIndex: 1,
                                              }}
                                            />
                                            <Icon
                                              name="heart-outline"
                                              size={50}
                                              color={'red'} // Outline color for the heart icon
                                              style={{
                                                position: 'relative',
                                                zIndex: 0,
                                              }}
                                            />
                                          </View>
                            </Pressable>
                      </View>


{/* ======================================================================================================================================================== */}
{/*                                                                         VIDEO PLAYER                                                                     */}
{/* ======================================================================================================================================================== */}


                      <View style={{flex: 1,  alignItems: 'flex-end', borderWidth: 0 }}>
                        {movieTrailerKey != '0000' && (
                              <PlayButton handlePress={videoShown}/>
                          )}
                      </View>
                    </View>

{/* ======================================================================================================================================================== */}
{/*                                                           TITLE, GENRES, STARS, RATING, AND RELEASE DATE                                                 */}
{/* ======================================================================================================================================================== */}

                    {movieTitle && (
                      <Text style={styles.movieTitle}>{movieTitle}</Text>)}

                    {movieGenres && (
                      <View style={styles.genresContainer}>
                        {
                          movieGenres.map(genre => {
                            return <Text style={styles.genre} key={genre.id}>{genre.name}</Text>
                          })
                        }
                      </View>)}

                    <StarRating
                      disabled={true}
                      maxStars={5}
                      rating={movieStarRating}
                      fullStarColor={'gold'}
                    />
                    <Text style={styles.overviewContainer}>{movieOverview}</Text>

                    {movieRating && (
                      <Text style={{fontWeight: 'bold'}}>{'Rated: ' + movieRating}</Text>
                    )}

                    <Text style={styles.releaseDateContainer}>{'Release Date: ' + movieReleaseDate}</Text>    

                </View>

{/* ======================================================================================================================================================== */}
{/*                                                                         CAST                                                                          */}
{/* ======================================================================================================================================================== */}

                <Text style={styles.textLabel}>Cast</Text>

                {movieAppCast && (
                <View style={{marginLeft: 5}}>
                  <FlatList 
                      data={movieAppCast}
                      keyExtractor = {(item, index) => `${index}`}
                      horizontal={true}
                      renderItem={_renderCastItem}
                  />
                </View>
                )}

{/* ======================================================================================================================================================== */}
{/*                                                                         CREW                                                                          */}
{/* ======================================================================================================================================================== */}

                <Text style={styles.textLabel}>Crew</Text>

                {movieAppCrew && (
                <View style={{marginLeft: 5}}>
                  <FlatList 
                      data={movieAppCrew}
                      // keyExtractor={(item, index) => item.id.toString() + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString()}
                      keyExtractor = {(item, index) => `${index}`}
                      horizontal={true}
                      renderItem={_renderCrewItem}
                  />
                </View>
                )}

{/* ======================================================================================================================================================== */}
{/*                                                                         MOVIE BUDGET AND RUNTIME                                                         */}
{/* ======================================================================================================================================================== */}

                <Text style={styles.textLabel}>Details</Text>
                <View style={{marginLeft: 5, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                  
                  <Text style={{fontWeight: 'bold'}}>Budget: <Text style={{fontWeight: 'normal'}}>
                    {
                      movieBudget === 0 ? 'Data not available.' : formatCurrency(movieBudget)
                    }
                    </Text>
                  </Text>

                  <Text style={{fontWeight: 'bold'}}>Revenue: <Text style={{fontWeight: 'normal'}}>
                    {
                      movieRevenue === 0 ? 'Data not available.' : formatCurrency(movieRevenue)
                    }
                    </Text>
                  </Text>
                  
                  <Text style={{fontWeight: 'bold'}}>Total Runtime: <Text style={{fontWeight: 'normal'}}>{movieRuntime} minutes</Text></Text>

                </View>

{/* ======================================================================================================================================================== */}
{/*                                                                         STREAMING ON SECTION                                                             */}
{/* ======================================================================================================================================================== */}


                <Text style={styles.textLabel}>Streaming on ...</Text>



                                                            {/*                    FREE (ADS)                      */}


                {!movieAppAdsWatchProviders && (

                    <View style={{marginLeft: 5, marginBottom: 10, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Free (With Ads):</Text></View>
                      <Text>(Not available)</Text>
                    </View>

                    )}

                  {movieAppAdsWatchProviders && (

                    <View style={{marginLeft: 5, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Free (With Ads):</Text></View>
                      {
                        movieAppAdsWatchProviders.map(name => {
                          return (
                                    <View key={name.provider_id} style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                      <Image
                                          style={{height: 30, width: 30,borderRadius: 5,}}
                                          source={
                                              name.logo_path
                                              ? {uri: 'https://image.tmdb.org/t/p/w500'+name.logo_path}
                                              : placeholderImage
                                          }
                                      />
                                      <Text style={{marginLeft: 10}}>{name.provider_name}</Text>
                                    </View>
                                )
                        })
                      }
                    </View>)}


                                                            {/*                    FLAT RATES                      */}


                {!movieAppFlatrateWatchProviders && (

                    <View style={{marginLeft: 5, marginBottom: 10, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Subscription:</Text></View>
                      <Text>(Not available)</Text>
                    </View>

                    )}

                  {movieAppFlatrateWatchProviders && (

                    <View style={{marginLeft: 5, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Subscription:</Text></View>
                      {
                        movieAppFlatrateWatchProviders.map(name => {
                          return (
                                    <View key={name.provider_id} style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                      <Image
                                          style={{height: 30, width: 30,borderRadius: 5,}}
                                          source={
                                              name.logo_path
                                              ? {uri: 'https://image.tmdb.org/t/p/w500'+name.logo_path}
                                              : placeholderImage
                                          }
                                      />
                                      <Text style={{marginLeft: 10}}>{name.provider_name}</Text>
                                    </View>
                                )
                        })
                      }
                    </View>)}


                                                            {/*                    RENT                      */}


                {!movieAppWatchProviders && (

                    <View style={{marginLeft: 5, marginBottom: 10, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Rent:</Text></View>
                      <Text>(Not available)</Text>
                    </View>

                )}

                {movieAppWatchProviders && (

                    <View style={{marginLeft: 5, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      <View><Text>Rent:</Text></View>
                      {
                        movieAppWatchProviders.map(name => {
                          return (
                                    <View key={name.provider_id} style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                      <Image
                                          style={{height: 30, width: 30,borderRadius: 5,}}
                                          source={
                                              name.logo_path
                                              ? {uri: 'https://image.tmdb.org/t/p/w500'+name.logo_path}
                                              : placeholderImage
                                          }
                                      />
                                      <Text style={{marginLeft: 10}}>{name.provider_name}</Text>
                                    </View>
                                )
                        })
                      }
                    </View>)}


{/* ======================================================================================================================================================== */}
{/*                                                                         PRODUCTION COMPANIES                                                             */}
{/* ======================================================================================================================================================== */}


                {movieAppProductionCompanies && (
                      <Text style={styles.textLabel}>Produced by ...</Text>
                )}

                {movieAppProductionCompanies && (

                    <View style={{marginLeft: 5, borderWidth: 0, borderColor: 'red', borderRadius: 10, padding: 7, marginRight: 5, backgroundColor: '#eee'}}>
                      {
                        movieAppProductionCompanies.map((name: production_company) => {
                          return (
                                    <View  key={name.id} style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                      <Image
                                          style={{height: 30, width: 30,borderRadius: 5,}}
                                          source={
                                              name.logo_path
                                              ? {uri: 'https://image.tmdb.org/t/p/w500'+name.logo_path}
                                              : placeholderImage
                                          }
                                      />
                                      <Text style={{marginLeft: 10}}>{name.name}</Text>
                                    </View>
                                )
                        })
                      }
                    </View>)}

                {movieAppProductionCountries && (
                      <Text style={styles.textLabel}>Production Locations</Text>
                )}

                {movieAppProductionCountries && (
                    <View style={{ flexDirection: 'row', marginLeft: 5, backgroundColor: '#eee'}}>
                      {
                        movieAppProductionCountries.map((name: production_country) => {
                          return <Text key={name.iso_3166_1} style={{marginLeft: 10}}>-{name.name}-</Text>
                        })
                      }
                    </View>)}

                <View style={{alignItems: 'center', marginBottom: 50, marginTop: 40}}>
                  <Text style={{fontWeight: 'bold'}}>--Licensed By CodeFest--</Text>

                  <Text style={{marginTop: 10}}>-Powered By-</Text>

                  <View style={{ flexDirection: 'row', marginLeft: 5, backgroundColor: '#eee', alignItems: 'center', paddingTop: 10}}>

                    <Image
                        style={{height: 35, width: 48,}}
                        source={TMDB_Logo}
                    />

                    <Image
                        style={{height: 48, width: 48, marginLeft: 35}}
                        source={JustWatch_Logo}
                    />
                  
                  </View>

                </View>

            </ScrollView>)
          }

          {!loaded && (<ActivityIndicator size="large" />) }
          {error && (<Error />)}
          {loaded && (
            <Modal 
              onRequestClose={() => setModalVisible(false)}
              supportedOrientations={['portrait', 'landscape']}
              animationType='slide' 
              visible={modalVisible}
              style={{ margin: 0, padding: 0 }}>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}              
                  style={{ marginTop: 50 }}>
                  <Icon name={'chevron-back'} size={40} color={'black'} />
                </TouchableOpacity>

              <View style={styles.videoModal}>
                <Video onClose={videoShown} keyId={movieTrailerKey} />
              </View>
            </Modal>)}
          
        </View>       
      </React.Fragment>
    )
}

const styles = StyleSheet.create({  
  scrollViewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',         
  },
  genresContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  genre: {
    marginRight: 10,
    fontWeight: 'bold'
  },
  image: {
    height: screenHeight / 2.5,
  },
  movieTitle: {
    fontSize: 24 ,
    fontWeight: 'bold',
    marginTop: 23,
    marginBottom: 10,
  },
  overviewContainer: {
    padding: 15,
  },
  releaseDateContainer: {
    fontWeight: 'bold',
  },
  playButton: {
    position: 'absolute',
    top: -25,
    right: 20,
  },
  videoModal: {
    //flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderCloseText: {
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5
  },
  profile: {
    height: 200,
    width: 125,
    borderRadius: 20,
  },
  textLabel: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
}

})