import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, Text, SafeAreaView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogLevel} from 'react-native-onesignal';
import  { OneSignal }  from 'react-native-onesignal';


const AppSettings = () => {
  const [inputText, setInputText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Add event listener for subscription change

    OneSignal.User.pushSubscription.addEventListener('change', (subscription) => {
      console.log('OneSignal: notification clicked:', subscription);
    });

    console.log(OneSignal.User.pushSubscription.getOptedIn());

    setIsSubscribed(OneSignal.User.pushSubscription.getOptedIn());

  
  }, []);


  const onSubscriptionChanged = ({ isSubscribed }: { isSubscribed: boolean }) => {
    setIsSubscribed(isSubscribed);
  };

  const toggleSubscription = () => {
    if (isSubscribed) {
      // Unsubscribe from OneSignal
      OneSignal.User.pushSubscription.optOut();
      setIsSubscribed(false);
    } else {
      // Subscribe to OneSignal
      OneSignal.User.pushSubscription.optIn();
      setIsSubscribed(true);
    }
  };

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


        <View style={{height: '95%', borderWidth: 0, borderColor: 'blue', marginBottom: 0, marginTop: 40}}>
   
          <Button title="Clear Movie Favorites" onPress={clearStorage} />



          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
            <Text style={{textAlign: 'right', alignSelf: 'center', color: '#087BFF', fontSize: 18, borderWidth: 0, marginRight: 5}}>Push Notifications:</Text> 
            <Switch
              style={{borderWidth: 0, transform: [{ scale: 0.75 }]}}
              value={isSubscribed}
              onValueChange={toggleSubscription}
              thumbColor={isSubscribed ? 'white' : 'white'} // Thumb color when switch is ON or OFF
              trackColor={{ false: 'grey', true: '#007BFF' }} // Colors for the switch track primary: 007BFF  default switch: 4CD964
                />
          </View>
          <Text style={{alignSelf: 'center', marginTop: -25, marginLeft: -45}}>({isSubscribed ? 'Subscribed' : 'Not Subscribed'})</Text> 

        </View>

    </SafeAreaView>
  )
}

export default AppSettings
