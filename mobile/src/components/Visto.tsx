import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  movieId: number;
  userId?: string; // opcional mientras no haya usuarios
};

const Visto = ({ movieId, userId = 'anonimo' }: Props) => {
  const [visto, setVisto] = useState(false);

  const docRef = firestore().collection('vistos').doc(`${userId}_${movieId}`);

  useEffect(() => {
    const checkVisto = async () => {
      const doc = await docRef.get();
      if (doc.exists) {
        setVisto(doc.data()?.visto === true);
      }
    };
    checkVisto();
  }, []);

  const toggleVisto = async () => {
    const nuevoEstado = !visto;
    setVisto(nuevoEstado);
    await docRef.set({
      userId,
      movieId,
      visto: nuevoEstado,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
  };

  return (
    <TouchableOpacity
      onPress={toggleVisto}
      style={{
        alignItems: 'center',
        paddingVertical: 4,
        flexDirection: 'row',
        gap: 6,
      }}
    >
      <FontAwesome
        name={visto ? 'eye' : 'eye-slash'}
        size={16}
        color={visto ? '#E7A325' : '#778DA9'}
      />
      <Text style={{ color: 'white', fontSize: 12 }}>
        {visto ? 'Visto' : 'No visto'}
      </Text>
    </TouchableOpacity>
  );
};

export default Visto;
