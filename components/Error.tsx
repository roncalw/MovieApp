import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type errorProps = {
    errorText1?: string;
    errorText2?: string;
}

export default function Error(
    {
        errorText1 = "Make sure you are online and restart the App",
        errorText2 = "Oops! Something went wrong", 
    }: errorProps) {


    return (
        <View style={styles.container}>
            <Text style={styles.text}>{errorText1}</Text>
            <Text style={styles.text}>{errorText2}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontWeight: 'bold'
    }
})