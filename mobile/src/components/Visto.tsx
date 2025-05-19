import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, ToastAndroid, View} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firestore, {firebase} from '@react-native-firebase/firestore';
import {useAuthStore} from '../store/useAuthStore';
import {db} from '../../android/app/src/config/firebaseConfig';
import {getDoc, setDoc, doc, deleteDoc, Timestamp} from 'firebase/firestore';

type Props = {
  movieId: number;
  userId?: string;
};

const Visto = ({movieId, userId = 'anonimo'}: Props) => {
  const user = useAuthStore(state => state.user);
  const [visto, setVisto] = useState(false);
  const docRef = doc(
    db,
    'users',
    user.uid,
    'listas',
    'vistos',
    'peliculas',
    movieId.toString(),
  );
  useEffect(() => {
    const fetchEstado = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVisto(true);
      }
    };
    fetchEstado();
  }, []);

  const toggleVisto = async () => {
    const nuevoEstado = !visto;
    setVisto(nuevoEstado);

    try {
      const listRef = doc(db, 'users', user.uid, 'listas', 'vistos');

      const listSnap = await getDoc(listRef);
      if (!listSnap.exists()) {
        await setDoc(listRef, {}); // lista vacía, sin metadatos
      }

      const movieRef = doc(
        db,
        'users',
        user.uid,
        'listas',
        'vistos',
        'peliculas',
        movieId.toString(),
      );

      console.log('nuevo estado  ', nuevoEstado);

      if (nuevoEstado) {
        await setDoc(movieRef, {
          movieId,
        });
      } else {
        await deleteDoc(movieRef);
      }

      ToastAndroid.show(
        nuevoEstado ? 'Agregado a vistos 👁️' : 'Quitado de vistos 🚫',
        ToastAndroid.SHORT,
      );
    } catch (error) {
      console.error('Error al actualizar vistos:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleVisto}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#6C757D',
        height: 30,
        width: 90,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
      <FontAwesome name={visto ? 'eye' : 'eye-slash'} size={14} color="white" />
      <Text style={{color: 'white', fontSize: 12}}>
        {visto ? 'Visto' : 'No visto'}
      </Text>
    </TouchableOpacity>
  );
};

export default Visto;
