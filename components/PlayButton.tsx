import React from 'react';
import {Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import Colors from '../theme/Color';

type callBackFunction = {
    handlePress: () => void;
}

export default function PlayButton({handlePress}: callBackFunction) {
  return (
    <Pressable onPress={() => handlePress()} style={styles.button}>
    <Icon name={'caret-forward-outline'} size={30} color={Colors.white} />
    </Pressable>
)}

const styles = StyleSheet.create({
    button: {
        alignContent: 'center',
        borderRadius: 50,
        width: 50,
        padding: 10,
        backgroundColor: Colors.primary,
    }
})
