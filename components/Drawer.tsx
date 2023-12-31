import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'

//import screens here
import Home from '../src/screens/Home';
import AppSettings from '../src/screens/AppSettings';
import { Image, ImageBackground, Pressable, Text, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeaderLeft from './CustomHeaderLeft';
import SearchByRating from '../src/screens/SearchByRating';
import SearchByDate from '../src/screens/SearchByDate';

const Drawer = () => {

  const Drawer = createDrawerNavigator()

  const logoImage = require('../assets/images/placeholder.png');
  const backgroundImage = require('../assets/images/GreyBackGroundImage.jpg');

  return (
    <Drawer.Navigator
      drawerContent={props => {
        return(
          <View style={{flex: 1}}>
            <DrawerContentScrollView
              {...props}
              contentContainerStyle={{borderColor: 'red', borderWidth: 0}}>
                <ImageBackground 
                  source={backgroundImage}
                  style={{padding: 20, paddingTop: 60, marginTop: -50}}
                  >
                  <Image source={logoImage} style={{height: 80, width: 80}} />
                  <Text>It's Movie Time</Text>
                </ImageBackground>
                <View style={{flex: 1, backgroundColor: 'white', paddingTop: 10,}}>
                  <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
              <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name='share-social-outline' size={22} />
                  <Text style={{fontSize: 15, fontFamily: 'Roboto-Medium', marginLeft: 5}}>Tell a Friend</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name='exit-outline' size={22} />
                  <Text style={{fontSize: 15, fontFamily: 'Roboto-Medium', marginLeft: 5}}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )
      }}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#eeee',
        //drawerActiveTintColor: '#000',
        drawerInactiveBackgroundColor: 'white',
        drawerLabelStyle: {
          marginLeft: -25,
          fontFamily: 'Roboto-Medium',
          fontSize: 15
        },
        headerTintColor: '#aaa',
        headerLeft: () => (
          // Replace 'YourCustomIconComponent' with your custom icon component
          <CustomHeaderLeft  />
        )
      }}
    >
      <Drawer.Screen
        name="Home" 
        component={Home}
        options={{
          title: 'Home',
          drawerIcon: ({focused, size}) => (
            <Icon
              name='home'
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          )
        }}
      />
      <Drawer.Screen
        name='AppSettings'
        component={AppSettings}
        options={{
          title: 'AppSettings',
          drawerIcon: ({focused, size}) => (
            <Icon
              name='gear'
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          )
        }}
      />
      <Drawer.Screen
        name='SearchByRating'
        component={SearchByRating}
        options={{
          title: 'Search By Rating(s)',
          drawerIcon: ({focused, size}) => (
            <Icon
              name='gear'
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          )
        }}
      />

<Drawer.Screen
    name='SearchByDate'
    component={SearchByDate}
    initialParams={{ directNavigation: true }}
    options={{
      title: 'Search By Date',
      drawerIcon: ({ focused, size }) => (
        <Icon
          name='gear'
          size={size}
          color={focused ? '#7cc' : '#ccc'}
        />
      ),
      headerShown: false,
    }}
  />

    </Drawer.Navigator>
  )
}

export default Drawer
