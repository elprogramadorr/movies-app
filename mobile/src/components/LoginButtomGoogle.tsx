import React from 'react';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';

const LoginButtonGoogle = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image
        source={require('../assets/google_logo.png')} // Usa el logo oficial
        style={styles.logo}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
  },
  logo: {
    width: 205,
    height: 47,
  },
});

export default LoginButtonGoogle;
