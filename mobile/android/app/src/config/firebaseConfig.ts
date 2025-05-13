import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const firebaseConfig = {
  apiKey: 'AIzaSyB4KR6bBqM5s9tMmfutsUlxgoikC5s-Kxw',
  authDomain: 'holo-3f15e.firebaseapp.com', 
  projectId: 'holo-3f15e',
  storageBucket: 'holo-3f15e.firebasestorage.app',
  messagingSenderId: '70938127122',
  appId: '1:70938127122:android:52dfa790032c8001fbe1cb',
};

GoogleSignin.configure({
  webClientId: '70938127122-mi3e7tveobuo363iia6nns07sa3iejld.apps.googleusercontent.com', // desde Firebase (el cliente de tipo Web)
});

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
