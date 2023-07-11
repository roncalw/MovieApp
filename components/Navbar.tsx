import React from 'react';
import {Image, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

export type navBarProps = {
    navigation: NativeStackNavigationProp<ParamListBase>;
    mainBool: boolean
}

export default function Navbar({navigation, mainBool}: navBarProps) {

    return (
        <SafeAreaView>
            { mainBool ? 
                (
                    <View style={styles.mainNav}>
                        <Image
                            source={require('../assets/images/placeholder.png')}
                            style={styles.logo} 
                        />
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Search');
                            }}>
                            <Icon name={'search-outline'} size={30} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                ) : 
                (
                    <View>
                        <TouchableOpacity onPress={() => {navigation.goBack()}}>
                            <Icon name={'chevron-back'} size={40} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create( {
    mainNav: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },    
    logo: {
      width: 50,
      height: 50,
    },
  })
