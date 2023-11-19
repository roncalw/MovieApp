import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Dimensions, Text, View, Modal, Pressable, TouchableOpacity } from 'react-native';
import {movieType} from "../screens/Home"

import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation'
import { getMovie, getMovieTrailers } from '../services/MovieServices';
import { AxiosError } from 'axios';
import Error from '../../components/Error';
import StarRating  from 'react-native-star-rating';
import dateFormat from 'dateformat';
import PlayButton from '../../components/PlayButton';
import VideoPlayer from 'react-native-video-controls';
import Video from '../../components/Video';
import Icon from 'react-native-vector-icons/Ionicons';

type PropsType = {
  navigation: NativeStackNavigationProp<RootStackParamList>,
  route: RouteProp<RootStackParamList, 'MovieDetail'>
} 

type movieTrailerJson = {
  id: string;
  results: movieTrailerType[];
}
type movieTrailerType = {
  id: string;
  key: string | undefined;
  name: string;
}

const placeholderImage = require('../../assets/images/placeholder.png');
const height = Dimensions.get('screen').height;

export default function MovieDetail({ navigation, route }: PropsType) {
    const movieId = route.params.id;

    const [movieDetail, setMovieDetail] = useState<movieType>();
    const [movieTrailers, setMovieTrailers] = useState<movieTrailerJson>();
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | boolean>(false);

    /*useEffect(() => {
      getMovie(movieId).then(movieDetail => {
        setMovieDetail(movieDetail);
        setLoaded(true);
        console.log(movieDetail.id);
      }).catch((err) => {
        setError(true);
        setLoaded(true);
        console.log(err);
      });
    }, [movieId]);*/


    const getData = () => {
      return Promise.all([
        getMovie(movieId),
        getMovieTrailers(movieId)
      ]);
    }


    useEffect( () => {
      getData().then(
        ([
          movieDetailData,
          movieTrailersData
        ]) => {
          setMovieDetail(movieDetailData);
          setMovieTrailers(movieTrailersData);     
        }
      ).catch(() => {
        setError(true);
      }).finally(() => {
          setLoaded(true);
      });

    }, [movieId]);


    const movieImageURL = movieDetail?.poster_path;
    const movieTitle = movieDetail?.original_title;
    const movieGenres = movieDetail?.genres;
    const movieVoteAverage = movieDetail?.vote_average
    let movieStarRating = 1;
    if (movieVoteAverage){
      movieStarRating = movieDetail.vote_average / 2
    } 
    const movieOverview = movieDetail?.overview;
    const movieReleaseDate = dateFormat(movieDetail?.release_date, 'mmmm dS, yyyy');
    const [modalVisible, setModalVisible] = useState(false);

    const videoShown = () => {
      setModalVisible(!modalVisible)
      //setModalVisible(modalVisible => {return !modalVisible} )
    }

    const movieTrailerKey = movieTrailers?.results[0] ? movieTrailers?.results[0].key : '0000';

    console.log(movieTitle);

    console.log(movieId);

    console.log(movieTrailerKey);

    return (
    <React.Fragment>
    <View>
      {loaded && !error && (
        <ScrollView>        
        <Image
          style={styles.image}
          source = {
                movieImageURL
                ? {uri: 'https://image.tmdb.org/t/p/w500'+movieImageURL}
                : placeholderImage
              }
        />
        <View style={styles.scrollViewContainer}>
          <View style={styles.playButton}>
            <PlayButton handlePress={videoShown}/>
          </View>
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
          <Text style={styles.releaseDateContainer}>{'Release Date: ' + movieReleaseDate}</Text>
        </View>
        </ScrollView>
      )} 
      {!loaded && (<ActivityIndicator size="large" />) }
      {error && (<Error />)}
      {loaded && (
        <Modal 
          onRequestClose={() => setModalVisible(false)}
          supportedOrientations={['portrait', 'landscape']}
          animationType='slide' 
          visible={modalVisible}
          style={{ margin: 0, padding: 0 }}>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
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
    marginTop: 20,
    marginBottom: 20
  },
  genre: {
    marginRight: 10,
    fontWeight: 'bold'
  },
  image: {
    height: height / 2.5,
  },
  movieTitle: {
    fontSize: 24 ,
    fontWeight: 'bold',
    marginTop: 10,
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
  }
})