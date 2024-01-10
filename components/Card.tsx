import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { movieType } from '../src/screens/Home';
import { RootStackParamList } from '../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type cardProps = {
    item: movieType;
    navigation: NativeStackNavigationProp<RootStackParamList>;
}

const placeholderImage = require('../assets/images/placeholder.png');

const Card = React.memo(({ navigation, item }: cardProps) => {

    return (
        <TouchableOpacity 
            onPress={() => navigation.navigate('MovieDetail', {id: item.id})}
            style={styles.container}>
            <Image
                style={styles.image}
                source={
                    item.poster_path
                    ? {uri: 'https://image.tmdb.org/t/p/w500'+item.poster_path}
                    : placeholderImage
                }
            />
            {
                !item.poster_path && (
                <Text style={styles.movieName}>{item.original_title}</Text>
            )}
        </TouchableOpacity>
    ) 
});

export default Card;


const styles = StyleSheet.create({
    container: {
        padding: 5,
        position: 'relative',
        alignItems: 'center',
        height: 200,
    },
    image: {
        height: 200,
        width: 120,
        borderRadius: 20,
    },
    movieName: {
        position: 'absolute',
        width: 100,
        top: 10,
        textAlign: 'center',
    }
})