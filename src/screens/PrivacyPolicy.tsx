import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { RootStackParamList } from '../../components/MainNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Navbar from '../../components/Navbar';

type privacyPolicyProps = {
  navigation:  NativeStackNavigationProp<RootStackParamList>
}

export default function PrivacyPolicy({ navigation }: privacyPolicyProps) {
  const url = 'https://www.privacypolicies.com/live/bc91d018-505a-4539-965d-37e7416a16b3'; // Replace with your Privacy Policy URL

  return (
    <SafeAreaView style={{flexDirection: 'column'}}>

    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    {/* ===============================================================================================================================================================================================
    ============================================================================  ROW 1 --- 5% Height !!! NAVBAR !!! ================================================================
    ===================================================================================================================================================================================================  */}
    
    {/* ======================================================================================  !!! NAVBAR !!!  ================================================================    */}
    
    
        <View style={{flexDirection: 'row', height: '5%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -15}}>
            <View style={{width:'100%', borderWidth: 0, borderColor: 'red', }}>
              <Navbar navigation={navigation} page={'privacyPolicy'}/>
            </View>
        </View>


        <View style={{flexDirection: 'row', height: '95%', borderWidth: 0, borderColor: 'blue', marginBottom: 75, marginTop: -20}}>
          <WebView source={{ uri: url }} />
        </View>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});