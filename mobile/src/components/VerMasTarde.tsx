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
    await docRef.set({
      userId,
      movieId,
      agregado: nuevoEstado,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

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
        width: 90,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <FontAwesome name="plus" size={16} color="white" />
      <Text style={{ color: 'white', fontSize: 12 }}>
        {agregado ? 'En Lista' : 'Ver luego'}
      </Text>
    </TouchableOpacity>
  );
};

export default VerMasTarde;
