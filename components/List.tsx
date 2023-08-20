import {View, Text, FlatList, StyleSheet} from 'react-native';
import { movieType } from '../src/screens/Home';
import Card from './Card';
import { RootStackParamList } from '../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type listProps = {
    title: string;
    content: movieType[];
    navigation:  NativeStackNavigationProp<RootStackParamList>
}

export default function List( {navigation, title, content }: listProps) {

    const _renderItem: React.FC<{item: movieType}> = ({item}) => {
        return (
            <Card navigation={navigation} item={item}/>
        );
    };   

    return (
        <View  style={styles.list}>
            <View>
                <Text style={styles.text}>{ title }</Text>
            </View>
            <View>
            <FlatList 
                data={content}
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
          paddingBottom: 15,
    }
  })
