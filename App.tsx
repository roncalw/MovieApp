import React  from 'react';
import {View} from 'react-native';
import Home, {movieType} from './src/screens/Home';
import MovieDetail from './src/screens/MovieDetail';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined, // undefined because you aren't passing any params to the home screen
  MovieDetail: { id: number }; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="MovieDetail" component={MovieDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );

};

export default App;