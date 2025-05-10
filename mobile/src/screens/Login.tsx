import React, {useEffect} from 'react';
import {Alert, SafeAreaView, Text} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import LoginButtonGoogle from '../components/LoginButtomGoogle';
import {useAuthStore} from '../store/useAuthStore';

const Login = () => {
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    // Configuración mínima esencial
    GoogleSignin.configure({
      webClientId:
        '70938127122-mi3e7tveobuo363iia6nns07sa3iejld.apps.googleusercontent.com',
      offlineAccess: false,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      // Paso 1: Verificar Play Services (modo silencioso)
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: false});

      // Paso 2: Iniciar sesión con Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Usuario Google:', userInfo);

      // Paso 3: Obtener tokens
      const {idToken, accessToken} = await GoogleSignin.getTokens();
      console.log('Tokens:', {idToken, accessToken});

      // Paso 4: Crear credencial Firebase
      const credential = GoogleAuthProvider.credential(idToken, accessToken);

      // Paso 5: Autenticar con Firebase
      const auth = getAuth();
      const firebaseUser = await signInWithCredential(auth, credential);

      // Éxito - actualizar estado
      setUser({
        uid: firebaseUser.user.uid,
        name: firebaseUser.user.displayName || 'Usuario',
        email: firebaseUser.user.email || '',
        photoURL: firebaseUser.user.photoURL || '',
      });

      Alert.alert('¡Bienvenido!', 'Login exitoso');
    } catch (e) {
      console.log('Error crudo:', e);
      Alert.alert(
        'Acción completada',
        'El proceso terminó (ignorando errores)',
      );
    }
  };

  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <LoginButtonGoogle onPress={handleGoogleLogin} />
      <Text style={{marginTop: 20}}>Presiona para continuar</Text>
    </SafeAreaView>
  );
};

export default Login;
