import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';

//import screens here
import Home from '../src/screens/Home';
import AppSettings from '../src/screens/AppSettings';

const Drawer = () => {

  const Drawer = createDrawerNavigator()
  
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="It's Movie Time" component={Home} />
      <Drawer.Screen name='AppSettings' component={AppSettings} />
    </Drawer.Navigator>
  )
}

export default Drawer
