import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, ToastAndroid, View } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firestore, { firebase } from '@react-native-firebase/firestore';


type Props = {
  movieId: number;
  userId?: string;
};

const Visto = ({ movieId, userId = 'anonimo' }: Props) => {
  const [visto, setVisto] = useState(false);
  const docRef = firestore().collection('vistos').doc(`${userId}_${movieId}`);

  useEffect(() => {
    const fetchEstado = async () => {
      const doc = await docRef.get();
      if (doc.exists && doc.data()?.visto) {
        setVisto(true);
      }
    };
    fetchEstado();
  }, []);

  const toggleVisto = async () => {
    const nuevoEstado = !visto;
    setVisto(nuevoEstado);

    if (nuevoEstado) {
      // Marcar como visto → crear o actualizar el documento
      await docRef.set({
        userId,
        movieId,
        visto: true,
        //timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Marcar como no visto → eliminar el documento
      await docRef.delete();
    }

    ToastAndroid.show(
      nuevoEstado ? 'Agregado a vistos 👁️' : 'Quitado de vistos 🚫',
      ToastAndroid.SHORT
    );
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
      }}
    >
      <FontAwesome
        name={visto ? 'eye' : 'eye-slash'}
        size={14}
        color="white"
      />
      <Text style={{ color: 'white', fontSize: 12 }}>
        {visto ? 'Visto' : 'No visto'}
      </Text>
    </TouchableOpacity>
  );
};

export default Visto;
