import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, Text, SafeAreaView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';
import { movieType } from './Home';
import Card from '../../components/Card';

const MovieFavorites = () => {

  //=========================================================================    NAVIGATION SETUP    =========================================================================


  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [directNavigation, setDirectNavigation] = useState(false);


  const _renderItem: React.FC<{ item: movieType; }> = ({ item }) => {
    return (
        <Card navigation={navigation} item={item} />
    );
};


  const [movieData, setMovieData] = useState<movieType[]>([]);

  const retrieveFromStorage = async () => {
   
    try {
      const retrievedText = await AsyncStorage.getItem('movieData');
      if (retrievedText) {
        setMovieData(JSON.parse(retrievedText))
      }
      console.log(movieData);
    } catch (error) {
      console.error('Error retrieving from local storage:', error);
    }
  };

  const isFocused = useIsFocused();


  useEffect(() => {
    retrieveFromStorage();
  }, []);

  useEffect(() => {
    if (isFocused) {
      retrieveFromStorage();
    }
  }, [isFocused]);
  

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('movieData');
      Alert.alert('Cleared!', 'Content cleared from local storage.');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  type SearchByDateParamList = {
    MovieFavorites: { directNavigation?: boolean };
  };
  
  type SearchByDateRouteProp = RouteProp<SearchByDateParamList, 'MovieFavorites'>;


  return (
    <SafeAreaView style={{flexDirection: 'column'}}>

    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    {/* ===============================================================================================================================================================================================
    ============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
    ===================================================================================================================================================================================================  */}
    
    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    
                <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -15}}>
                    <View style={{width:'90%', borderWidth: 0, borderColor: 'red', }}>
                      <Navbar navigation={navigation} page={'movieFavorites'}/>
                    </View>
                    <View style={{width:'10%', height: 100,}}>
                      <TouchableOpacity

                        style={{marginTop: 45, marginLeft: -20}}>
                        <Icon name={'search-outline'} size={30} />
                      </TouchableOpacity>
                    </View>
                </View>

    <View>
      <Button title="Retrieve from Local Storage" onPress={retrieveFromStorage} />

      <Button title="Clear Local Storage" onPress={clearStorage} />



      <View style={{height: '85%', borderWidth: 0, borderColor: 'yellow', marginTop: -10}}>
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={movieData}
                        renderItem={_renderItem} />
                </View>
            </View>
            </View>

    </SafeAreaView>
  )
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

export default MovieFavorites
