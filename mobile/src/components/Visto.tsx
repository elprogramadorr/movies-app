import React, {useEffect, useState} from 'react';
import {TouchableOpacity, Text, ToastAndroid, View} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useAuthStore} from '../store/useAuthStore';
import {db} from '../../android/app/src/config/firebaseConfig';
import {getDoc, setDoc, doc, updateDoc, arrayUnion, arrayRemove, Timestamp} from 'firebase/firestore';

type Props = {
  movieId: number;
  userId?: string;
  onChange?: (nuevoEstado: boolean) => void; // <-- NUEVO
};

const Visto = ({movieId, userId = 'anonimo', onChange}: Props) => {
  
  const user = useAuthStore(state => state.user);
  if (!user) {
    console.error('No hay usuario autenticado');
    return null;
  }
  const [visto, setVisto] = useState(false);
  const listRef = doc(db, 'users', user.uid, 'listas', 'vistos');
  useEffect(() => {
    const fetchEstado = async () => {
      const docSnap = await getDoc(listRef);
      if (docSnap.exists()) {
        const peliculas = docSnap.data().peliculas || [];
        setVisto(peliculas.includes(movieId));
      }
    };
    fetchEstado();
  }, []);

  const toggleVisto = async () => {
    const nuevoEstado = !visto;
    setVisto(nuevoEstado);

    try {
      const docSnap = await getDoc(listRef);
      if (!docSnap.exists()) {
        // Si no existe, crea el documento con el array
        await setDoc(listRef, {
          nombreLista: 'vistos',
          descripcion: 'Películas que ya viste',
          fechaCreacion: Timestamp.now(),
          peliculas: nuevoEstado ? [movieId] : [],
        });
      } else {
        // Si existe, actualiza el array
        await updateDoc(
          listRef,
          {
            peliculas: nuevoEstado
              ? arrayUnion(movieId)
              : arrayRemove(movieId),
          }
        );
      }
      if (onChange) onChange(nuevoEstado);
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
