import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import { DrawerActions, useNavigation } from '@react-navigation/native';

const CustomHeaderLeft: React.FC = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const placeholderImage = require('../assets/images/placeholder.png');


  return (
    <TouchableOpacity onPress={openDrawer}>
      <View style={{ padding: 10 }}>
        <Image
            style={{height: 30, width: 30, marginLeft: 5}}
            source={placeholderImage}
        />
      </View>
    </TouchableOpacity>
  );
};

export default CustomHeaderLeft;
