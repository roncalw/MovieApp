import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'

//import screens here
import Home from '../src/screens/Home';
import AppSettings from '../src/screens/AppSettings';
import { Image, ImageBackground, Pressable, Share, Text, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeaderLeft from './CustomHeaderLeft';
import SearchByDate from '../src/screens/SearchByDate';
import MovieieFavorites from '../src/screens/MovieFavorites';
import MovieFavorites from '../src/screens/MovieFavorites';
import { RootStackParamList } from './MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Drawer = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  const Drawer = createDrawerNavigator()

  const logoImage = require('../assets/images/placeholder.jpg');
  const backgroundImage = require('../assets/images/GreyBackGroundImage.jpg');

  const shareWithFriend = async () => {
    try {
      const contentToShare = {
        title: 'Check out this Movie app!',
        message: 'With this movie guide you can find out what movies are playing and where they are streaming or where they are for rent as well!\n\nClick on the link below to download it!',
        url: 'https://apps.apple.com/us/app/movie-guider/id6465793035', // Replace with your app URL
      };
  
      const result = await Share.share(contentToShare);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared via an activity
          //console.log(`Shared via ${result.activityType}`);
        } else {
          // Shared
          //console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        //console.log('Share dismissed');
      }
    } catch (error) {
      const err = error as Error; 
      console.error('Error sharing:', err.message);
    }
  };

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
              <TouchableOpacity onPress={shareWithFriend} style={{paddingVertical: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name='share-social-outline' size={22} />
                  <Text style={{fontSize: 15, fontFamily: 'Roboto-Medium', marginLeft: 5}}>Tell a Friend</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                        navigation.navigate('PrivacyPolicy');
                    }} style={{paddingVertical: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name='exit-outline' size={22} />
                  <Text style={{fontSize: 15, fontFamily: 'Roboto-Medium', marginLeft: 5}}>Privacy Policy</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )
      }}
      screenOptions={{
        drawerPosition: 'left', //determines where the drawer will be opened from (eg. will open from the right side if you say right the drawer icon does not move of course, just the drawer contents, since the icon is based on CSS)
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
        name='MovieFavorites'
        component={MovieFavorites}
        initialParams={{ directNavigation: true }}
        options={{
          title: 'Movie Favorites',
          drawerIcon: ({focused, size}) => (
            <Icon
              name='gear'
              size={size}
              color={focused ? '#7cc' : '#ccc'}
            />
          ),
          headerShown: false,
        }}
      />
      <Drawer.Screen
          name='SearchByDate'
          component={SearchByDate}
          initialParams={{ directNavigation: true }}
          options={{
            title: 'Advanced Search',
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
        <Drawer.Screen
          name='AppSettings'
          component={AppSettings}
          options={{
            title: 'Settings',
            drawerIcon: ({focused, size}) => (
              <Icon
                name='gear'
                size={size}
                color={focused ? '#7cc' : '#ccc'}
              />
            )
          }}
        />

    </Drawer.Navigator>
  )
}

export default Drawer
