import MovieDetailsScreen from './screens/MovieDetailsScreen';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MovieDetails from './screens/MovieDetails';
import Splash from './screens/Splash';
import {Header} from 'react-native/Libraries/NewAppScreen';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
import Home from './screens/Home';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import NetInfo from '@react-native-community/netinfo';
import {RootStackParamList} from './types'; // ajustá la ruta si está en src/navigation/types.ts
import {View, Text} from 'react-native';

import PantallaBusqueda from './screens/PantallaBusqueda';
import SeleccionarPeliculasGeneros from './screens/preferenciasIniciales/seleccionarPeliculas';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true); // <-- nuevo estado

  useEffect(() => {
    FontAwesome.loadFont();
    AntDesign.loadFont();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe(); // también limpiamos NetInfo
    };
  }, []);

  if (!isConnected) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1E2D3C',
        }}>
        <Text style={{color: 'white', fontSize: 14}}>
          No hay conexión a internet
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={Splash} />
        ) : (
          <>

            <Stack.Screen name="Home" component={Home} />

            <Stack.Screen
              name="MovieDetailsScreen"
              component={MovieDetailsScreen}
            />
            <Stack.Screen name="MovieDetailsScreen" component={MovieDetailsScreen} />
            <Stack.Screen name="GenresScreen" component={GenresScreen} />
            <Stack.Screen
              name="seleccionarPeliculasGeneros"
              component={SeleccionarPeliculasGeneros}
            />
            <Stack.Screen
              name="MovieDetails"
              component={MovieDetails}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PantallaBusqueda"
              component={PantallaBusqueda}
              options={{headerShown: false, title: 'Buscar Películas'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
