import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './screens/Splash';
import { Header } from 'react-native/Libraries/NewAppScreen';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
import Home from './screens/Home';
import MovieDetailsScreen from './screens/MovieDetailsScreen';
import PantallaBusqueda from './screens/PantallaBusqueda';
import { RootStackParamList } from './types'; // si estás usando tipado con TypeScript

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Splash" component={Splash} />
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="GenresScreen" component={GenresScreen} />
            <Stack.Screen
              name="PantallaBusqueda"
              component={PantallaBusqueda}
              options={{ headerShown: true, title: 'Buscar Películas' }}
            />
            <Stack.Screen name="MovieDetailsScreen" component={MovieDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
