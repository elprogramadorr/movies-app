// CalificarPelicula.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRated: (value: number) => void;
  userId: string;
  movieId: number;
};

const CalificarPelicula = ({ visible, onClose, onRated, userId, movieId }: Props) => {
  const [rating, setRating] = useState(0);

  const handleRating = async (value: number) => {
    setRating(value);
    await setDoc(doc(db, 'users', userId, 'ratings', movieId.toString()), {
      rating: value,
    });
    onRated(value);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: 'white', fontSize: 18 }}>✖</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Califica la película</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <FontAwesome
                  name={rating >= star ? 'star' : 'star-o'}
                  size={32}
                  color="#FFD700"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1B263B',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  title: {
    fontSize: 18,
    color: 'white',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
  },
});

export default CalificarPelicula;
