import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';

const NavBar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const icons = [
    { name: 'film', screen: 'MisListasScreen' },
    { name: 'home', screen: 'Home' },
    { name: 'user', screen: 'PantallaBusqueda' },
  ];

  return (
    <View style={styles.navBar}>
      {icons.map((icon) => {
        const isActive = route.name === icon.screen;
        return (
          <TouchableOpacity
            key={icon.name}
            onPress={() => navigation.navigate(icon.screen as keyof RootStackParamList)}
            style={styles.iconContainer}
          >
            <FontAwesome
              name={icon.name}
              size={30}
              color={isActive ? '#FFCF56' : '#EFF6E0'}
            />
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
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
  iconContainer: {
    alignItems: 'center',
  },
  activeDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFCF56',
  },
});

export default NavBar;
