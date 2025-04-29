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
  const [isConnected, setIsConnected] = useState(null); // Inicialmente null

  useEffect(() => {
    FontAwesome.loadFont();
    AntDesign.loadFont();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Verificar el estado inicial de la conexión
    const checkInitialConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };

    checkInitialConnection();

    // Suscribirse a cambios en la conexión
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // No mostrar nada hasta que sepamos el estado de la conexión
  if (isConnected === null) {
    return null; // O un loader si prefieres
  }

  return (
    <View style={{flex: 1}}>
      {!isConnected && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🚫 Sin conexión a internet</Text>
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
    backgroundColor: '#D9534F',
    padding: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Asegura que esté por encima de todo
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
