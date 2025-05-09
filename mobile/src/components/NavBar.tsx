import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';

const NavBar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => navigation.navigate('MisListasScreen')}>
        <FontAwesome name="film" size={30} color="#EFF6E0" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <FontAwesome name="home" size={30} color="#EFF6E0" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('PantallaBusqueda')}>
        <FontAwesome name="user" size={30} color="#EFF6E0" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#01161E',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#124559',
  },
});

export default NavBar;
