import React, { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { searchMovieTV } from "../services/MovieServices";
import { movieType } from "./Home";
import Card from "../../components/Card";

import { RootStackParamList } from "../../components/MainNavigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type searchProps = {
    navigation:  NativeStackNavigationProp<RootStackParamList>
}

function Search({ navigation }: searchProps) {

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

    return (
        <React.Fragment>
            <SafeAreaView>
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
                <View style={styles.searchItems}>
                    <FlatList
                        numColumns={3}
                        data={searchResults}
                        renderItem={_renderItem} />
                </View>
            </SafeAreaView>
        </React.Fragment>
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
        paddingTop: 60,
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchItems: {
        padding: 8,
    }
  });

export default Search;