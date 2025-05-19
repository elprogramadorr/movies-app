import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';


// Define el tipo del estado
type AuthState = {
  user: {name: string; email: string} | null;
  isAuthenticated: boolean;
  searchHistory: string[]; 
  login: (userData: {name: string; email: string}) => void;
  logout: () => void;
};

// Crea el store con tipado
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      searchHistory: [],
      login: userData => set({user: userData, isAuthenticated: true}),
      logout: () => set({user: null, isAuthenticated: false}),
    }),
    {
      name: 'auth-storage', // Clave para AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Persistencia
    },
  ),
);

//           movie.title.toLowerCase().includes(trimmedQuery) ||
const Stack = createNativeStackNavigator();

const Banner = ({message, color}: {message: string; color: string}) => {
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        {backgroundColor: color, transform: [{translateY: slideAnim}]},
      ]}>
      <Text style={styles.bannerText}>{message}</Text>
    </Animated.View>
  );
};

const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  const [showDisconnectBanner, setShowDisconnectBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = !!state.isConnected;

      if (!connected) {
        setShowDisconnectBanner(true);
        setIsConnected(false);
      } else {
        if (!isConnected) {
          setShowReconnectBanner(true);
        }
        setIsConnected(true);
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  return (
    <View style={{flex: 1}}>
      {showDisconnectBanner && (
        <Banner
          message="🚫 Sin conexión a internet"
          color="#d9534f"
        />
      )}
      {showReconnectBanner && (
        <Banner
          message="✅ Conexión restaurada"
          color="#5cb85c"
        />
      )}

      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {/* Tus pantallas aquí */}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 10,
    zIndex: 1000,
    alignItems: 'center',
  },
  bannerText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;

