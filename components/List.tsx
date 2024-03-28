import {View, Text, FlatList, StyleSheet, ListRenderItem} from 'react-native';
import { movieType } from '../src/screens/Home';
import Card from './Card';
import { RootStackParamList } from '../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import Colors from '../theme/Color';

export type listProps = {
    title: string;
    content: movieType[];
    navigation:  NativeStackNavigationProp<RootStackParamList>
}

export default function List( {navigation, title, content }: listProps) {

  const _renderItem: ListRenderItem<movieType> = ({item}) => {
        return (
            <Card navigation={navigation} item={item}/>
        );
    };   

    return (
        <View  style={styles.list}>
            <View>
                <Text adjustsFontSizeToFit= {true} numberOfLines= {1}  style={styles.text}>{ title }</Text>
            </View>
            <View>
            <FlatList 
                data={content}
                keyExtractor = {(item, index) => `${index}`}
                horizontal={true}
                renderItem={_renderItem}
            />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
          marginTop: 25,         
    },
    text: {
          fontSize: 20,
          fontWeight: 'bold',
          padding: 10,
          paddingBottom: 5,
          color: Colors.black
    }
  })
