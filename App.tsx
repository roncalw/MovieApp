import React  from 'react';
import Home from './src/screens/Home';
import MovieDetail from './src/screens/MovieDetail';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Navbar from './components/Navbar';

export type RootStackParamList = {
  Home: undefined, // undefined because you aren't passing any params to the home screen
  MovieDetail: { id: number }; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={Home}
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
      </Stack.Navigator>
    </NavigationContainer>
  );

};

export default App;