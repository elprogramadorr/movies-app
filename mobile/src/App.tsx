import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

import Splash from './screens/Splash';
import Home from './screens/Home';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
import SeleccionarPeliculasGeneros from './screens/preferenciasIniciales/seleccionarPeliculas';
import MovieDetails from './screens/MovieDetails';
import PantallaBusqueda from './screens/PantallaBusqueda';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(null);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);

  useEffect(() => {
    FontAwesome.loadFont();
    AntDesign.loadFont();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const checkInitialConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };

    checkInitialConnection();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (isConnected === false && state.isConnected === true) {
        // Se reconectó
        setShowReconnectBanner(true);
        setTimeout(() => {
          setShowReconnectBanner(false);
        }, 5000); // Mostrar 5 segundos
      }
      setIsConnected(state.isConnected);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isConnected]); // ATENCIÓN: dependemos de isConnected

  if (isConnected === null) {
    return null;
  }

  return (
    <View style={{flex: 1}}>
      {!isConnected && (
        <View style={[styles.banner, {backgroundColor: '#D9534F'}]}>
          <Text style={styles.bannerText}>🚫 Sin conexión a internet</Text>
        </View>
      )}

      {showReconnectBanner && (
        <View style={[styles.banner, {backgroundColor: '#5cb85c'}]}>
          <Text style={styles.bannerText}>✅ ¡Conexión restablecida!</Text>
        </View>
      )}

      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoading ? (
            <Stack.Screen name="Splash" component={Splash} />
          ) : (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="GenresScreen" component={GenresScreen} />
              <Stack.Screen
                name="seleccionarPeliculasGeneros"
                component={SeleccionarPeliculasGeneros}
              />
              <Stack.Screen name="MovieDetails" component={MovieDetails} />
              <Stack.Screen
                name="PantallaBusqueda"
                component={PantallaBusqueda}
                options={{headerShown: false, title: 'Buscar Películas'}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
