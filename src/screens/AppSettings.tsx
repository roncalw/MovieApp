import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, Text, SafeAreaView, Switch, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../../components/Navbar';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogLevel} from 'react-native-onesignal';
import  { OneSignal }  from 'react-native-onesignal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Config from 'react-native-config';
import packageJson from '../,,/../../package.json';
import CustomAlert from '../../components/CustomAlert';


const AppSettings = () => {
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    // Access the version from package.json
    const version = packageJson.version;
    setAppVersion(version);
  }, []); // Run once when component mounts

  const [isAlertVisible, setAlertVisible] = useState(false);

  const showAlert = () => {
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };


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


  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('movieData');
      Alert.alert('Your Movie Favorites are Cleared!', 'To start saving your favorite movies again, simply click on the heart from the Movie Detail screen!',
      [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
          style: 'default', // Style for the button (default, cancel, destructive)
        },
      ],
      {
        cancelable: true, // Allow dismissal by tapping outside of the alert
      }
    );
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };


    //=========================================================================    NAVIGATION SETUP    =========================================================================


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();



    //const appStoreUrl = 'https://apps.apple.com/us/app/its-movie-time/id6465793035'; // Replace with your app's URL
    const appStoreUrl = 'https://play.google.com/store/apps'; // Replace with your app's URL


    const openAppStore = async () => {
      try {
        const supported = await Linking.canOpenURL(appStoreUrl);
        if (supported) {
          await Linking.openURL(appStoreUrl);
        } else {
          console.error('Cannot open URL:', appStoreUrl);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    };


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

        <TouchableOpacity onPress={openAppStore}><Text style={{fontSize: 18, color: '#007BFF', alignSelf: 'center' }}>Check for Update</Text></TouchableOpacity>
   
        <Text style={{alignSelf: 'center', marginBottom: 25}}>Version: {appVersion}</Text>
   
        <TouchableOpacity onPress={showAlert}><Text style={{fontSize: 18, color: '#007BFF', alignSelf: 'center' }}>Clear Movie Favorites</Text></TouchableOpacity>
        <CustomAlert
          visible={isAlertVisible}
          title="Your Movie Favorites are Cleared!"
          message="To start saving your favorite movies again, simply click on the heart from the Movie Detail screen!"
          onClose={hideAlert}
        />


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
          <Text style={{alignSelf: 'center', marginTop: -25}}>({isSubscribed ? 'Subscribed' : 'Not Subscribed'})</Text> 

        </View>

    </SafeAreaView>
  )
}

export default AppSettings
