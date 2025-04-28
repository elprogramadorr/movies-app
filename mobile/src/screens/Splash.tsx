import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icono.png')} 
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  }
});

export default Splash;
