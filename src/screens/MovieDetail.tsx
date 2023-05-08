import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet } from 'react-native';
import {movieType} from "../screens/Home"

import { RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'
import { getMovie } from '../services/MovieServices';
import { AxiosError } from 'axios';
import Error from '../../components/Error';


type PropsType = {
  navigation: NativeStackNavigationProp<RootStackParamList>,
  route: RouteProp<RootStackParamList, 'MovieDetail'>
}

const placeholderImage = require('../../assets/images/placeholder.png');

export default function MovieDetail({ navigation, route }: PropsType) {
    const movieId = route.params.id;

    const [movieDetail, setMovieDetail] = useState<movieType>();
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | boolean>(false);

    useEffect(() => {
      getMovie(movieId).then(movieDetail => {
        setMovieDetail(movieDetail);
        setLoaded(true);
        console.log(movieDetail.id);
      }).catch((err) => {
        setError(true);
        setLoaded(true);
        console.log(err);
      });
    }, [movieId]);

    const movieDetailImage = movieDetail?.poster_path;

    return (
    <React.Fragment>
      {loaded && !error && (
        <ScrollView>
        <Image
          style={styles.image}
          source = {
                movieDetailImage
                ? {uri: 'https://image.tmdb.org/t/p/w500'+movieDetail.poster_path}
                : placeholderImage
              }
        />
        </ScrollView>
      )} 
      {!loaded && (<ActivityIndicator size="large" />) }
      {error && (<Error />)}       
    </React.Fragment>
    )
}

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: 120
  }
})