import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MovieDetailsScreen from './screens/MovieDetailsScreen';
import Splash from './screens/Splash';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  // ► Paso 1: Carga las fuentes de los iconos al iniciar la app
  useEffect(() => {
    FontAwesome.loadFont();
    AntDesign.loadFont();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []); // ◄ Array de dependencias vacío = se ejecuta solo al montar el componente

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {isLoading ? (
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{headerShown: false}}
          />
        ) : (
          <Stack.Screen
            name="MovieDetailsScreen"
            component={MovieDetailsScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
