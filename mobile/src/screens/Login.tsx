// screens/Login.tsx
import React, {useEffect} from 'react';
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from '@react-native-firebase/auth';
import {useAuthStore} from '../store/useAuthStore';
import {useNavigation} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {db} from '../../android/app/src/config/firebaseConfig';

const {width, height} = Dimensions.get('window');

const Login = () => {
  const setUser = useAuthStore(state => state.setUser);
  const navigation = useNavigation();

  const proporcionTop = 1118 / 947;
  const imageWidthTop = Math.floor(width * 0.5);
  const imageHeightTop = imageWidthTop * proporcionTop;

  const proporcionBottom = 873 / 564;
  const imageWidthBottom = Math.floor(width * 0.5);
  const imageHeightBottom = imageWidthBottom * proporcionBottom;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '70938127122-mi3e7tveobuo363iia6nns07sa3iejld.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: false});
      const userInfo = await GoogleSignin.signIn();
      const {idToken, accessToken} = await GoogleSignin.getTokens();

      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const auth = getAuth();
      const firebaseUser = await signInWithCredential(auth, credential);

      const uid = firebaseUser.user.uid;
      const name = firebaseUser.user.displayName || '';
      const email = firebaseUser.user.email || '';
      const photoURL = firebaseUser.user.photoURL || '';

      // 🔍 Verificar si el documento ya existe
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // 🆕 Crear usuario en Firestore si no existe
        await setDoc(userDocRef, {
          name,
          email,
          photoURL,
          createdAt: serverTimestamp(),
        });
      }

      // ✅ Guardar en estado local
      useAuthStore.getState().setUser({
        uid,
        name,
        email,
        photoURL,
      });
    } catch (error) {
      console.log('Error en login:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#E7E7E7" barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>!Bienvenido a Holo!</Text>
        <Text style={styles.subtitle}>Tu nueva experiencia de películas</Text>

        <View style={styles.loginContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}>
            <FontAwesome name="google" size={22} color="#fff" />
            <Text style={styles.buttonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E7',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoWrapper: {
    height: 120,
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 7,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 60,
    textAlign: 'center',
  },
  loginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DB4437',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 12,
    fontSize: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Login;
