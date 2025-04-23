import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MovieDetails from './screens/MovieDetails';
import Splash from './screens/Splash';
import { Header } from 'react-native/Libraries/NewAppScreen';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
import Home from './screens/Home';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {RootStackParamList} from './types'; // ajustá la ruta si está en src/navigation/types.ts

import PantallaBusqueda from './screens/PantallaBusqueda';
import SeleccionarPeliculasGeneros from './screens/preferenciasIniciales/seleccionarPeliculas';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    FontAwesome.loadFont();
    AntDesign.loadFont();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={Splash} />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{headerShown: false}}
            />
            <Stack.Screen name="GenresScreen" component={GenresScreen} />
            <Stack.Screen name="seleccionarPeliculasGeneros" component={SeleccionarPeliculasGeneros} />
            <Stack.Screen
              name="MovieDetails"
              component={MovieDetails}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PantallaBusqueda"
              component={PantallaBusqueda}
              options={{headerShown: true, title: 'Buscar Películas'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
