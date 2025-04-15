import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import Home from './screens/Home';
import Splash from './screens/Splash';
import { Header } from 'react-native/Libraries/NewAppScreen';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
const Stack = createNativeStackNavigator();

const App = () => {
  
  const [isLoading, setIsLoading] = React.useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
          <Stack.Screen name="Splash" component={Splash} options={{headerShown : false}}/>
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="GenresScreen" component={GenresScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>    
  );
};

export default App;