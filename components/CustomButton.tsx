import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, TextStyle, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  buttonStyle?: TextStyle; // Additional style for the button text
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, buttonStyle, ...props }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[{ borderWidth: 0, borderColor: 'green', marginLeft: 155, height: 60, width: 60, justifyContent: 'center'},]}>
      <View style={{ borderWidth: 0, borderColor: 'red', backgroundColor: 'blue', height: 30, width: 60, padding: 5, borderRadius: 5, }}>
        <Text style={[{ color: 'white', textAlign: 'center', fontSize: 15 }, buttonStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
