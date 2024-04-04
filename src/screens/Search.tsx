import { AxiosError } from 'axios';
import Error from '../../components/Error';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { searchMovieTV } from "../services/MovieServices";
import { movieType } from "./Home";
import Card from "../../components/Card";
import BouncyCheckbox from 'react-native-bouncy-checkbox';

import { useNavigation } from '@react-navigation/native';


import { RootStackParamList } from "../../components/MainNavigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Navbar from "../../components/Navbar";
import Colors from '../../theme/Color';

type searchProps = {
    navigation:  NativeStackNavigationProp<RootStackParamList>
}

function Search({ navigation }: searchProps) {

    const [isChecked, setIsChecked] = useState(false);


  //=========================================================================    LOADING PAGE SETUP    =========================================================================

  const [error, setError] = useState<AxiosError | boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(true);




    const _renderItem: ListRenderItem<movieType> = ({item}) => {
        return (
            <Card navigation={navigation} item={item}/>
        );
    };  

    const [text, onChangeText] = useState('');
    const [searchResults, setSearchResults] = useState<movieType[]>([]);

    function onSubmit(query: string) {

        setLoaded(false);  

        Promise.all(
        [searchMovieTV(query, 'movie'), searchMovieTV(query, 'tv') ]
        
        )
        .then(([movies, tv]) => {
            const data:movieType[] = [...movies, ...tv];
            setSearchResults(data);
        }).catch(() => {
            setError(true);
        }).finally(() => {
            setLoaded(true);
        });
    }

    // useEffect(() => {
    //     console.log(`Search Results: ${JSON.stringify(searchResults)}`); // Log the updated selectedItems immediately after state update
    //   }, [searchResults]);

    const Separator = () => {
        return <View style={{height: 5, backgroundColor: 'transparent'}} />;
      };

    return (
        <SafeAreaView style={{flexDirection: 'column'}}>


            <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 95, marginTop: -15}}>
                <View style={{width:'100%', borderWidth: 0, borderColor: 'red', }}>
                  <Navbar navigation={navigation} page={'search'}/>
                </View>
                
            </View>


            {/* <TouchableOpacity style={{borderWidth: 0, height: 20, marginTop: -20, }} onPress={() => navigation.navigate('SearchByDate')}>
                <Text style={{color: '#771F14', fontSize: 14, marginTop: 0, alignSelf: 'center'}}>Advanced Search</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{borderWidth: 0, height: 20, marginTop: -20, }} onPress={() => navigation.navigate('Search')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 0, }}>
                  <Text style={{color: '#771F14', fontSize: 14, marginTop: 0, alignSelf: 'center'}}>(Advanced Search)</Text>
                </View>                
            </TouchableOpacity> */}


            <View style={{height: '5%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 0, marginTop: -15, marginBottom: 0}}>

            <TouchableOpacity style={{borderWidth: 0, height: 20, marginTop: -20, }} onPress={() => navigation.navigate('SearchByDate')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 0, }}>
                  <Text style={{color: '#771F14', fontSize: 14, marginTop: 0, alignSelf: 'center'}}>Advanced Search</Text>
                  <Icon style={{color: '#771F14',}} name="chevron-forward" size={15} />
                </View>                
            </TouchableOpacity>

            </View>




            <View style={{height: '10%', borderWidth: 0, borderColor: 'red', }}>
                <View style={styles.container}>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            onSubmitEditing={() => {
                                onSubmit(text);
                            }}
                            placeholder={'Search by Movie Title'}
                            placeholderTextColor={'#808080'}
                            onChangeText={onChangeText}
                            value={text} 
                            clearButtonMode="while-editing"/>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            onSubmit(text);
                        } }>
                        <Icon  style={{color: Colors.black}} name={'search-outline'} size={30} />
                    </TouchableOpacity>
                </View>
            </View>

           

            {loaded && !error &&  

            <View style={{height: '85%', borderWidth: 0, borderColor: 'yellow', marginTop: -10}}>
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={searchResults}
                        keyExtractor = {(item, index) => `${index}`}
                        renderItem={_renderItem} 
                        ItemSeparatorComponent={Separator} />
                </View>
            </View>
            }


            { !loaded && (
            <View style={{height: '85%', borderWidth: 0, borderColor: 'yellow', marginTop: -10}}>
                <ActivityIndicator size="large" />
            </View>
            
            ) } 

            {error && (<Error />)}




        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    form: {
        flexBasis: 'auto',
        flexGrow: 1,
        paddingRight: 8,
        color: Colors.black,
    },
    input: {
        borderRadius: 15,
        borderWidth: 0.5,
        height: 50,
        padding: 8,
        color: Colors.black,
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

export default Search;