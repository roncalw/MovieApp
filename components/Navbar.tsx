import React from 'react';
import {Image, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Colors from '../theme/Color';

export type navBarProps = {
    navigation: NativeStackNavigationProp<ParamListBase>;
    mainBool: boolean
}

export default function Navbar({navigation, mainBool}: navBarProps) {

    return (
        <SafeAreaView style={{ height: 50, marginBottom: -60, zIndex: 99}}>
            { mainBool ? 
                (
                    <View style={styles.mainNav}>
                        <View style={{ width: '90%', paddingLeft: 5}}>
                        <Image
                            source={require('../assets/images/placeholder.png')}
                            style={styles.logo} 
                        />
                        </View>
                        <View style={{ width: '10%'}}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Search');
                            }}>
                            <Icon name={'search-outline'} size={30} color={Colors.white} />
                        </TouchableOpacity>
                        </View>
                    </View>
                ) : 
                (
                    <View>
                        <TouchableOpacity onPress={() => {navigation.goBack()}}>
                            <Icon name={'chevron-back'} size={40} color={Colors.lightGray} />
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
