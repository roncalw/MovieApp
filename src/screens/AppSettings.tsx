import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppSettings = () => {
  const [inputText, setInputText] = useState('');
  const [savedText, setSavedText] = useState('');

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem('savedText', inputText);
      Alert.alert('Saved!', 'Text saved to local storage.');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const retrieveFromStorage = async () => {
    try {
      const retrievedText = await AsyncStorage.getItem('savedText');
      setSavedText(retrievedText || '');
    } catch (error) {
      console.error('Error retrieving from local storage:', error);
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.removeItem('savedText');
      setSavedText('');
      Alert.alert('Cleared!', 'Content cleared from local storage.');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };


  return (
    <SafeAreaView style={{flexDirection: 'column'}}>

    <View>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10 }}
        placeholder="Type here..."
        onChangeText={(text) => setInputText(text)}
        value={inputText}
      />
      <Button title="Save to Local Storage" onPress={saveToStorage} />

      <Button title="Retrieve from Local Storage" onPress={retrieveFromStorage} />

      <Button title="Clear Local Storage" onPress={clearStorage} />

      <View style={{ marginTop: 20 }}>
        <Text>Saved Text:</Text>
        <Text>{savedText}</Text>
      </View>
    </View>

    </SafeAreaView>
  )
}

export default AppSettings
