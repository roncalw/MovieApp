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
      //console.log(movieData);
    } catch (error) {
      console.error('Error retrieving from local storage:', error);
    }
  };

  const isFocused = useIsFocused();


  useEffect(() => {
    setMovieData(([]));
    retrieveFromStorage();
  }, []);

  useEffect(() => {
    if (isFocused) {
      setMovieData(([]));
      retrieveFromStorage();
    }
  }, [isFocused]);
  

  type SearchByDateParamList = {
    MovieFavorites: { directNavigation?: boolean };
  };
  
  type SearchByDateRouteProp = RouteProp<SearchByDateParamList, 'MovieFavorites'>;

  const Separator = () => {
    return <View style={{height: 5, backgroundColor: 'transparent'}} />;
  };


  return (
    <SafeAreaView style={{flexDirection: 'column'}}>

    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    {/* ===============================================================================================================================================================================================
    ============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
    ===================================================================================================================================================================================================  */}
    
    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    
        <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -15}}>
            <View style={{width:'100%', borderWidth: 0, borderColor: 'red', }}>
              <Navbar navigation={navigation} page={'movieFavorites'}/>
            </View>
        </View>


        <View style={{height: '95%', borderWidth: 0, borderColor: 'yellow', marginTop: 25}}>
                <FlatList
                    numColumns={3}
                    data={movieData}
                    keyExtractor = {(item, index) => `${index}`}
                    renderItem={_renderItem}
                    //keyExtractor={(item) => item.id.toString()} // Use id as a unique key
                    ItemSeparatorComponent={Separator} />
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
