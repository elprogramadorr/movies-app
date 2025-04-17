import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';  
import { useNavigation } from '@react-navigation/native';


const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goToPantallaBusqueda = () => {
    navigation.navigate('PantallaBusqueda');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.sideSpace} />
      <Text style={styles.title}>¡BIENVENIDO!</Text>
      <TouchableOpacity onPress={goToPantallaBusqueda}>
        <Text style={styles.searchText}>BUSCAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#01161E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSpace: {
    width: 24,
  },
  title: {
    fontSize: 18,
    color: '#EFF6E0',
    fontWeight: 'bold',
  },
  searchText: {
    fontSize: 16,
    color: '#E0E1DD',
    fontWeight: 'bold',
  },
});
  return <Text>Estoy en la casa</Text>;
};

export default Home;

