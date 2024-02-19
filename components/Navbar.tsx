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
            <View style={{ width: '85%', paddingLeft: 5}}>
                <CustomHeaderLeft  />
            </View>
            {/* <View style={{ width: '90%', paddingLeft: 5}}>
            <Image
                source={require('../assets/images/placeholder.png')}
                style={styles.logo} 
            />
            </View> */}
            <View style={{ width: '15%', height: 50, paddingTop: 0, marginTop: 83, borderWidth: 0, borderColor: 'red'}}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Search');
                    }}
                    style={{alignItems: 'center', borderWidth: 0, height: 50, paddingTop: 5, }}>
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
                <Text style={{marginLeft: 40, color: '#771F14', fontSize: 24, marginTop: -10}}>Advanced Search</Text>
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
                <Text style={{marginLeft: 0, color: '#771F14', fontSize: 24, marginTop: -10}}>Your Favorites</Text>
            </View>
            <View style={{ width: '15%', height: 50, paddingTop: 10, marginTop: 70}}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Search');
                    }}>
                    <Icon name={'search-outline'} size={30} color={Colors.black} />
                </TouchableOpacity>
            </View>
        </View>
    );
} else if (page === 'appSettings') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '15%', paddingLeft: 5}}>
                <CustomHeaderLeft  />
            </View>
            <View style={{ width: '70%', height: 50, paddingTop: 10, marginTop: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{marginLeft: 0, color: '#771F14', fontSize: 24, marginTop: -10}}>Settings</Text>
            </View>
            <View style={{ width: '15%', height: 50, paddingTop: 10, marginTop: 70}}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Search');
                    }}>
                    <Icon name={'search-outline'} size={30} color={Colors.black} />
                </TouchableOpacity>
            </View>
        </View>
    );
} else if (page === 'privacyPolicy') {
    view = (
        <View style={styles.mainNav}>
            <View style={{ width: '15%', marginTop: 65, height: 40}} >
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                    <Icon name={'chevron-back'} size={40} color={Colors.black} />
                </TouchableOpacity>
            </View>
            <View style={{ width: '70%', height: 50, paddingTop: 10, marginTop: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 0}}>
                <Text style={{marginLeft: 0, color: '#771F14', fontSize: 24, marginTop: -10}}>Privacy Policy</Text>
            </View>
            <View style={{ width: '15%', height: 50, paddingTop: 10, marginTop: 70}}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Search');
                    }}>
                    <Icon name={'search-outline'} size={30} color={Colors.black} />
                </TouchableOpacity>
            </View>
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
                <Text style={{marginLeft: 5, color: '#771F14', fontSize: 24, marginTop: -10}}>Search by Movie Title</Text>
            </View>
            <View style={{width: '15%', }}></View>
        </View>
    );
} else {
    view = (
        <View style={{borderWidth: 0, marginTop: 9}}>
            <TouchableOpacity onPress={() => {navigation.goBack()}}>
                <Icon name={'chevron-back'} size={42} color={Colors.black} />
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
