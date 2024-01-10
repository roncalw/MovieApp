import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const AppSettings = () => {
  const [inputText, setInputText] = useState('');
  const [savedText, setSavedText] = useState('');

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem('savedText', inputText);
      Alert.alert('Saved!', 'Text saved to local storage.');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const retrieveFromStorage = async () => {
    try {
      const retrievedText = await AsyncStorage.getItem('savedText');
      setSavedText(retrievedText || '');
    } catch (error) {
      console.error('Error retrieving from local storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('savedText');
      setSavedText('');
      Alert.alert('Cleared!', 'Content cleared from local storage.');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };


    //=========================================================================    NAVIGATION SETUP    =========================================================================


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();



  return (
    <SafeAreaView style={{flexDirection: 'column'}}>

    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    {/* ===============================================================================================================================================================================================
    ============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
    ===================================================================================================================================================================================================  */}
    
    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    
        <View style={{flex: 1, flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -15}}>
            <View style={{width:'100%', borderWidth: 0, borderColor: 'red', }}>
              <Navbar navigation={navigation} page={'appSettings'}/>
            </View>
        </View>


        <View style={{height: '95%', borderWidth: 0, borderColor: 'blue', marginBottom: 0, marginTop: 20}}>
   
          <Button title="Clear Movie Favorites" onPress={clearStorage} />

        </View>

    </SafeAreaView>
  )
}

export default AppSettings
