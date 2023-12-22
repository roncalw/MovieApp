import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { movieType } from './Home';
import { searchMovieTV } from '../services/MovieServices';
import Card from '../../components/Card';
import Icon from "react-native-vector-icons/Ionicons";


interface IRating {
    id: string;
    label: string;
    isChecked: boolean;
  }

const SearchByRating = () => {
    const [isChecked, setIsChecked] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const _renderItem: React.FC<{ item: movieType; }> = ({ item }) => {
        return (
            <Card navigation={navigation} item={item} />
        );
    };

    const [text, onChangeText] = useState('');
    const [searchResults, setSearchResults] = useState<movieType[]>([]);

    function onSubmit(query: string) {
        Promise.all(
        [searchMovieTV(query, 'movie'), searchMovieTV(query, 'tv') ]
        
        )
        .then(([movies, tv]) => {
            const data:movieType[] = [...movies, ...tv];
            setSearchResults(data);
        });
    }

    const [ratings, setRatings] = useState<IRating[]>([
      { id: 'G', label: 'G', isChecked: false },
      { id: 'PG', label: 'PG', isChecked: false },
      { id: 'PG-13', label: 'PG-13', isChecked: false },
      { id: 'R', label: 'R', isChecked: false },
    ]);
  
    const handleRatingChange = (id: string) => {
      const updatedRatings = ratings.map((rating) =>
        rating.id === id ? { ...rating, isChecked: !rating.isChecked } : rating
      );
      setRatings(updatedRatings);
    };
  
    const selectedRatings = ratings.filter((rating) => rating.isChecked);

    return (
        <SafeAreaView style={{flexDirection: 'column'}}>
            <View style={{height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 70, marginTop: -15}}>
                <Navbar navigation={navigation} mainBool={true}/>  
            </View>

            <View style={{height: '8%', borderWidth: 0, borderColor: 'green', padding: 0, marginTop: -15}}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 8 }}>Search by rating(s): {selectedRatings
                            .map((rating) => rating.label)
                            .join(', ')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 16 }}>
                        {ratings.map((rating) => (
                        <BouncyCheckbox
                            key={rating.id}
                            isChecked={rating.isChecked}
                            onPress={() => handleRatingChange(rating.id)}
                            text={rating.label}
                            textStyle={{ fontSize: 16, marginRight: 20, textDecorationLine: 'none'  }}
                            iconStyle={{ borderRadius: 5, marginRight: -10 }}
                            fillColor="#007AFF"
                            unfillColor="#FFFFFF"            
                        />
                        ))}
                    </View>
                </View>
            </View>

            <View style={{height: '8%', borderWidth: 0, borderColor: 'red'}}>
                <View style={styles.container}>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder={'Search Movie or TV'}
                            onChangeText={onChangeText}
                            value={text} />
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            onSubmit(text);
                        } }>
                        <Icon name={'search-outline'} size={30} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{height: '79%', borderWidth: 0, borderColor: 'purple'}}>
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={searchResults}
                        renderItem={_renderItem} />
                </View>
            </View>


        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    form: {
        flexBasis: 'auto',
        flexGrow: 1,
        paddingRight: 8,
    },
    input: {
        borderRadius: 15,
        borderWidth: 0.5,
        height: 50,
        padding: 8
    },
    container: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchItems: {
        padding: 8,
    },
  });

export default SearchByRating;