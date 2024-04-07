import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const CustomHeaderLeft: React.FC = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    //console.log('Touched')
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const placeholderImage = require('../assets/images/placeholder.jpg');


  return (
    <TouchableOpacity style={{borderColor: 'red', borderWidth: 0, width: 60, height: 70, marginTop:70}} onPress={openDrawer}>
        <Image
            style={{height: 40, width: 40, marginLeft: 10, marginTop: 17}}
            source={placeholderImage}
            accessibilityLabel='Open Drawer'
        />
    </TouchableOpacity>
  );
};

export default CustomHeaderLeft;
