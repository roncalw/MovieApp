import { AxiosError } from 'axios';
import Error from '../../components/Error';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ListRenderItem, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { searchMovieTV } from "../services/MovieServices";
import { movieType } from "./Home";
import Card from "../../components/Card";
import BouncyCheckbox from 'react-native-bouncy-checkbox';


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

            <View style={{height: '10%', borderWidth: 0, borderColor: 'red', }}>
                <View style={styles.container}>
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder={'Search Movie Title'}
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