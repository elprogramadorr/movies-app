// ✅ CalificarPelicula.tsx actualizado para recibir calificación inicial y reflejarla al abrir el modal

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRated: (value: number) => void;
  userId: string;
  movieId: number;
  initialRating?: number | null;
};

const CalificarPelicula = ({ visible, onClose, onRated, userId, movieId, initialRating = 0 }: Props) => {
  const [rating, setRating] = useState(initialRating || 0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (visible) setRating(initialRating || 0);
  }, [visible, initialRating]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        containerRef.current?.measure((_x, _y, width) => {
          const touchX = gestureState.moveX - gestureState.x0;
          const value = Math.min(5, Math.max(0, (touchX / width) * 5));
          const rounded = Math.round(value * 10) / 10;
          setRating(rounded);
        });
      },
    })
  ).current;

  const handleConfirm = async () => {
    await setDoc(doc(db, 'users', userId, 'ratings', movieId.toString()), {
      rating,
    });
    onRated(rating);
    onClose();
  };

  const renderStar = (index: number) => {
    const fillPercent = Math.min(1, Math.max(0, rating - index + 1));
    return (
      <View key={index} style={{ width: 32, height: 32, marginHorizontal: 2 }}>
        <FontAwesome name="star-o" size={32} color="#E0E1DD" style={StyleSheet.absoluteFillObject} />
        <View style={{ position: 'absolute', width: 32 * fillPercent, overflow: 'hidden', height: 32 }}>
          <FontAwesome name="star" size={32} color="#E0E1DD" />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#E0E1DD', fontSize: 18 }}>✖</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Califica la película</Text>
          <Text style={styles.scoreLabel}>{rating.toFixed(1)} / 5</Text>

          <View
            ref={containerRef}
            style={styles.starsContainer}
            {...panResponder.panHandlers}
          >
            {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Guardar</Text>
          </TouchableOpacity>
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
    color: '#E0E1DD',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#E7A325',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  confirmText: {
    color: '#1B263B',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CalificarPelicula;
