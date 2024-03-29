import React from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import CustomButton from './CustomButton';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<Props> = ({ visible, title, message, onClose }) => {
  return (
    <Modal
    transparent={true}
    visible={visible}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <CustomButton title="OK" onPress={onClose} style={styles.btnStyle} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    btnStyle: {
        height: 30,
        width: 60,
        marginLeft: 150,
        backgroundColor: '#007BFF',
        color: 'white',
        borderRadius: 5,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        alignSelf: 'center',
        marginTop: 75,
        backgroundColor: 'white',
        width: 285,
        height: 185,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 14,
        marginBottom: 20,
    },
  });

export default CustomAlert;
