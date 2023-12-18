import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navbar from '../../components/Navbar'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';

const AppSettings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{flexDirection: 'column'}}>
      <View style={{height: '15%'}}>
       <Navbar navigation={navigation} mainBool={true}/>
      </View>
      <View style={{height: '85%', borderWidth: 0, borderColor: 'red'}}>
        <Text style={{}}>AppSettings</Text>
      </View>
    </View>
  )
}

export default AppSettings
