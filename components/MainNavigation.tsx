import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Navbar from './Navbar';

import Home from '../src/screens/Home';
import MovieDetail from '../src/screens/MovieDetail';
import Search  from '../src/screens/Search';
import Drawer from './Drawer';


export type RootStackParamList = {
    Drawer: undefined;
    Home: undefined, // undefined because you aren't passing any params to the home screen
    MovieDetail: { id: number }; 
    Search: undefined;
  };

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function MainNavigation() {


  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false
    }}
  >
        <Stack.Screen 
          name="Drawer" 
          component={Drawer}
          options={{
            headerTransparent: true,
            header: ({navigation}) => <Navbar navigation={navigation} mainBool={true}/>
          }} 
        />
        <Stack.Screen 
          name="MovieDetail" 
          component={MovieDetail} 
          options={{
            headerTransparent: true,
            header: ({navigation}) => <Navbar navigation={navigation} mainBool={false}/>
          }} 
        />
        <Stack.Screen 
          name="Search" 
          component={Search} 
          options={{
            headerTransparent: true,
            header: ({navigation}) => <Navbar navigation={navigation} mainBool={false}/>
          }} 
        />
      </Stack.Navigator>
  )
}
