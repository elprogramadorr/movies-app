import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Home = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Estoy en la casa</Text>
      <Button
        title="Ir a Seleccionar Gustos"
        onPress={() => navigation.navigate('GenresScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 16,
  },
});

export default Home;