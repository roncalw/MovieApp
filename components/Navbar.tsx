import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import Colors from '../theme/Color';
import CustomHeaderLeft from './CustomHeaderLeft';

export type navBarProps = {
    navigation: NativeStackNavigationProp<ParamListBase>;
    page: string
}

export default function Navbar({navigation, page}: navBarProps) {

    let view;
if (page === 'home') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '90%', paddingLeft: 5}}>
                <CustomHeaderLeft  />
            </View>
            {/* <View style={{ width: '90%', paddingLeft: 5}}>
            <Image
                source={require('../assets/images/placeholder.png')}
                style={styles.logo} 
            />
            </View> */}
            <View style={{ width: '10%', height: 50, paddingTop: 10, marginTop: 70}}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Search');
                    }}>
                    <Icon name={'search-outline'} size={30} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
} else if (page === 'sbd') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '15%', paddingLeft: 5}}>
                <CustomHeaderLeft  />
            </View>
            {/* <View style={{ width: '90%', paddingLeft: 5}}>
            <Image
                source={require('../assets/images/placeholder.png')}
                style={styles.logo} 
            />
            </View> */}
            <View style={{ width: '70%', height: 50, paddingTop: 10, marginTop: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{marginLeft: 40, color: '#771F14', fontSize: 24, marginTop: -10}}>Search by Dates</Text>
            </View>
            <View style={{width: '15%', }}></View>
        </View>
    );
} else if (page === 'movieFavorites') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '15%', paddingLeft: 5}}>
                <CustomHeaderLeft  />
            </View>
            <View style={{ width: '70%', height: 50, paddingTop: 10, marginTop: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{marginLeft: 40, color: '#771F14', fontSize: 24, marginTop: -10}}>Search by Dates</Text>
            </View>
            <View style={{width: '15%', }}></View>
        </View>
    );
} else if (page === 'search') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '15%', marginTop: 65, height: 40}} >
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                    <Icon name={'chevron-back'} size={40} color={Colors.black} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '70%', height: 50, paddingTop: 10, marginTop: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{marginLeft: 5, color: '#771F14', fontSize: 24, marginTop: -10}}>Search by Movie Title(s)</Text>
            </View>
            <View style={{width: '15%', }}></View>
        </View>
    );
} else {
    view = (
        <View>
            <TouchableOpacity onPress={() => {navigation.goBack()}}>
                <Icon name={'chevron-back'} size={40} color={Colors.lightGray} />
            </TouchableOpacity>
        </View>
    );
}

    return (
        <SafeAreaView style={{ height: 50, marginBottom: -60, zIndex: 99}}>
            {view}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create( {
    mainNav: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center'
    },    
    logo: {
      width: 50,
      height: 50,
    },
  })
