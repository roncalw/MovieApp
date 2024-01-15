import { LogLevel, OneSignal } from 'react-native-onesignal';

import "react-native-gesture-handler"
import React, { useEffect }  from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './components/MainNavigation';

const App = () => {

  useEffect(() => {
  // Remove this method to stop OneSignal Debugging
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      // OneSignal Initialization
      OneSignal.initialize("a2f43b3a-482e-4129-a076-01e647897d55");
      
      // requestPermission will show the native iOS or Android notification permission prompt.
      // We recommend removing the following code and instead using an In-App Message to prompt for notification permission
      //OneSignal.Notifications.requestPermission(true);
      
      // Method for listening for notification clicks
      //OneSignal.Notifications.addEventListener('click', (event) => {
      //  console.log('OneSignal: notification clicked:', event);
      //});
    
  }, []);

  return (
    <NavigationContainer>
      <MainNavigation/>
    </NavigationContainer>
  );

};

export default App;