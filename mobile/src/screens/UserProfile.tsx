import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {useAuthStore} from '../store/useAuthStore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

import NavBar from '../components/NavBar';

const ProfileScreen = () => {
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró el usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <Image source={{uri: user.photoURL}} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <Icon name="sign-out" size={22} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#444',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  logoutIcon: {
    padding: 8,
  },
  errorText: {
    color: '#CCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;
