import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import {Dimensions, Image, Text, View} from 'react-native';
import { getPopularMovies, getUpcomingMovies} from '../services/MovieServices';
import Carousel from 'react-native-snap-carousel';

export const SLIDER_WIDTH = Dimensions.get('window').width + 30;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);

const renderItem: React.FC<{item: movieType}> = ({item}) => {
  return (
    <View
      style={{
        borderWidth: 1,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
      <Image source={{uri: ('https://image.tmdb.org/t/p/w500'+item.poster_path)}} style={{width: 200, height: 200}} />
      <Text style={{marginVertical: 10, fontSize: 20, fontWeight: 'bold'}}>
        {item.original_title}
      </Text>
    </View>
  );
};

type movieType = {
    original_title: string;
    original_language: string;
    release_date: string;
    poster_path: string;
  }
  
const Home = () => {
    const [movie, setMovie] = useState<movieType>();
    const [upcomingMovies, setUpcomingMovies] = useState<movieType[]>([]);
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

      getUpcomingMovies().then(movies => {
        setUpcomingMovies(movies);
      }).catch(err => {
        setError(err);   
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
          <Carousel
            data={upcomingMovies}
            renderItem={renderItem}
            sliderWidth={SLIDER_WIDTH}
            itemWidth={ITEM_WIDTH}
        />
        </View>

    );

}

export default Home;