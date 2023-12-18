import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const CustomHeaderLeft: React.FC = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    //console.log('Touched')
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const placeholderImage = require('../assets/images/placeholder.png');


  return (
    <TouchableOpacity style={{borderColor: 'red', borderWidth: 0, width: 60, height: 70, marginTop:70}} onPress={openDrawer}>
        <Image
            style={{height: 50, width: 50, marginLeft: 5, marginTop: 10}}
            source={placeholderImage}
        />
    </TouchableOpacity>
  );
};

export default CustomHeaderLeft;
