import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import ReactCurvedText from 'react-curved-text';
const {width} = Dimensions.get('window');

const Splash = () => {
  // TOP IMAGE dimensions
  const proporcionTop = 1118 / 947;
  const imageWidthTop = Math.floor(width * 0.5);
  const imageHeightTop = imageWidthTop * proporcionTop;

  // BOTTOM IMAGE dimensions
  const proporcionBottom = 873 / 564;
  const imageWidthBottom = Math.floor(width * 0.5);
  const imageHeightBottom = imageWidthBottom * proporcionBottom;

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/borderTopSplash.png')}
        style={{
          height: imageHeightTop,
          width: imageWidthTop,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      <View style={styles.content}>
        {/* Reemplazamos el Text normal con nuestro componente CurvedText */}
        <Text style={styles.title}>Bienvenido a Holo!</Text>
        <Image
          source={require('../assets/Logo.png')}
          style={{height: 100, width: 100}}
        />
      </View>

      <Image
        source={require('../assets/borderBottomSplash.png')}
        style={{
          height: imageHeightBottom,
          width: imageWidthBottom,
          position: 'absolute',
          bottom: 0,
          right: 0,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E7',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20, // Añadido para separar del logo
  },
});

export default Splash;
