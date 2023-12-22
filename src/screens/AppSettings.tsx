import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/MainNavigation';
import BouncyCheckbox from 'react-native-bouncy-checkbox';


interface IRating {
  id: string;
  label: string;
  isChecked: boolean;
}

const AppSettings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [ratings, setRatings] = useState<IRating[]>([
    { id: 'G', label: 'G', isChecked: false },
    { id: 'PG', label: 'PG', isChecked: false },
    { id: 'PG-13', label: 'PG-13', isChecked: false },
    { id: 'R', label: 'R', isChecked: false },
  ]);

  const handleRatingChange = (id: string) => {
    const updatedRatings = ratings.map((rating) =>
      rating.id === id ? { ...rating, isChecked: !rating.isChecked } : rating
    );
    setRatings(updatedRatings);
  };

  const selectedRatings = ratings.filter((rating) => rating.isChecked);


  return (
    <View style={{flexDirection: 'column'}}>
      <View style={{height: '15%'}}>
          <Navbar navigation={navigation} mainBool={true}/>
      </View>

      <View style={{height: '85%', borderWidth: 1, borderColor: 'red'}}>
        <Text>App Settings</Text>
      </View>
    </View>
  )
}

export default AppSettings
