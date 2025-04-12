import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View, SafeAreaView} from 'react-native';
import Home from './screens/Home';
import Splash from './screens/Splash';
import {Header} from 'react-native/Libraries/NewAppScreen';
import MovieDetailsScreen from './screens/MovieDetailsScreen';
import PantallaBusqueda from './screens/PantallaBusqueda';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {isLoading ? (
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PantallaBusqueda"
              component={PantallaBusqueda}
              options={{ title: 'Buscar Películas' }}
            />
            <Stack.Screen
              name="MovieDetailsScreen"
              component={MovieDetailsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
