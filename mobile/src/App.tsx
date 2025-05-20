import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Splash from './screens/Splash';
import Home from './screens/Home';
import GenresScreen from './screens/preferenciasIniciales/seleccionarGustos';
import SeleccionarPeliculasGeneros from './screens/preferenciasIniciales/seleccionarPeliculas';
import CategoryScreen from './screens/CategoryScreen';
import MovieDetails from './screens/MovieDetails';
import PantallaBusqueda from './screens/PantallaBusqueda';
import UserProfile from './screens/UserProfile';
import Login from './screens/Login';
import {useAuthStore} from './store/useAuthStore';
import ContenidoLista from './screens/listasPeliculas/ContenidoLista';
import MisListasScreen from './screens/MisListasScreen';
import NuevaListaScreen from './screens/NuevaListaScreen';
import AddMoviesList from './screens/listasPeliculas/AddMoviesList';

//const Stack = createNativeStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);

  // Get user and setUser from the auth store
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    // Load fonts
    FontAwesome.loadFont();
    AntDesign.loadFont();

    // Set initial loading timer
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Check network connection
    const checkInitialConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };
    checkInitialConnection();

    // Network connection listener
    const unsubscribe = NetInfo.addEventListener(state => {
      if (isConnected === false && state.isConnected === true) {
        // Reconnected
        setShowReconnectBanner(true);
        setTimeout(() => {
          setShowReconnectBanner(false);
        }, 5000); // Show for 5 seconds (changed from 50ms to 5000ms)
      }
      setIsConnected(state.isConnected);
    });

    // Firebase auth state listener
    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // Transform Firebase user to match your User type
        const appUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    // Clean up
    return () => {
      clearTimeout(timer);
      unsubscribe();
      unsubscribeAuth(); // Don't forget to clean up the auth listener
    };
 // }, [isConnected]);
  }, [isConnected, setUser]); // Removed user from dependencies to avoid unnecessary re-renders

  // Show nothing while checking connection status
  if (isConnected === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {/* Network status banners */}
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

      {showReconnectBanner && (
        <View style={[styles.banner, {backgroundColor: '#5cb85c'}]}>
          <Text style={styles.bannerText}>✅ ¡Conexión restablecida!</Text>
        </View>
      )}
      
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: '#0D1B2A', // Color de fondo del header
            },
            headerTintColor: '#FFF', // Color del texto del header
          }}
        >
          {isLoading ? (
            <Stack.Screen name="Splash" component={Splash} />
          ) : user ? (
            // Authenticated user flow
            <>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{headerShown: false}}
              />
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
              <Stack.Screen
                name="CategoryScreen"
                component={CategoryScreen} 
                options={({ route }: { route: { params: RootStackParamList['CategoryScreen'] } }) => ({
                  title: route.params?.categoryName || 'Categoría',
                  headerShown: true // Mostrar header solo para esta pantalla
                })}
              />
              <Stack.Screen name="MisListasScreen" component={MisListasScreen} />
              <Stack.Screen name="NuevaLista" component={NuevaListaScreen} />
              <Stack.Screen name="ContenidoLista" component={ContenidoLista} />
              <Stack.Screen
                name="AddMoviesList"
                component={AddMoviesList}
                options={{title: 'Añadir Películas'}}
              />
              <Stack.Screen name="UserProfile" component={UserProfile} />
            </>
          ) : (
            // Non-authenticated user flow
            <Stack.Screen name="Login" component={Login} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>    </GestureHandlerRootView>
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
