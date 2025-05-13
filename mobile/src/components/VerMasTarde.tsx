import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, ToastAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  movieId: number;
  userId?: string;
};

const VerMasTarde = ({ movieId, userId = 'anonimo' }: Props) => {
  const [agregado, setAgregado] = useState(false);
  const docRef = firestore().collection('verMasTarde').doc(`${userId}_${movieId}`);

  useEffect(() => {
    const fetchEstado = async () => {
      const doc = await docRef.get();
      if (doc.exists && doc.data()?.agregado) {
        setAgregado(true);
      }
    };
    fetchEstado();
  }, []);

  const toggleAgregar = async () => {
    const nuevoEstado = !agregado;
    setAgregado(nuevoEstado);

    if (nuevoEstado) {
      await docRef.set({
        userId,
        movieId,
        agregado: true,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await docRef.delete();
    }

    ToastAndroid.show(
      nuevoEstado ? 'Agregado a Ver más tarde ➕' : 'Quitado de Ver más tarde ❌',
      ToastAndroid.SHORT
    );
  };


  return (
    <TouchableOpacity
      onPress={toggleAgregar}
      activeOpacity={0.8}
      style={{
        backgroundColor: '#5A6268',
        height: 30,
        width: 30,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      <FontAwesome name={agregado ? 'check' : 'clock-o'}
        size={16}
        color="white"
        style={{ marginRight: 0 }} />
      <Text style={{ color: 'white', fontSize: 12 }}>
        {agregado ? '' : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default VerMasTarde;
