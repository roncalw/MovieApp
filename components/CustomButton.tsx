import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, TextStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  buttonStyle?: TextStyle; // Additional style for the button text
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, buttonStyle, ...props }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[{ backgroundColor: 'blue', padding: 5, borderRadius: 5 }, props.style]}>
      <Text style={[{ color: 'white', textAlign: 'center', fontSize: 15 }, buttonStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
