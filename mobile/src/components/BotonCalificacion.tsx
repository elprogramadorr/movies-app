// ✅ BotonCalificacion.tsx — Componente reutilizable para mostrar y abrir la calificación

import React from 'react';
import { TouchableOpacity, Text, View, ToastAndroid } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = {
  rating: number | null;
  isWatched: boolean;
  onPress: () => void;
};

const BotonCalificacion = ({ rating, isWatched, onPress }: Props) => {
  const handlePress = () => {
    if (isWatched) onPress();
    else ToastAndroid.show('Primero debe marcar la película como "Visto" para calificarla', ToastAndroid.SHORT);
  };

  return (
    <View style={{ alignItems: 'flex-start', marginTop: 16 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#415A77',
          padding: 8,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={handlePress}
      >
        <Text style={{ color: '#E0E1DD', fontSize: 14 }}>
          {rating ? 'Tu calificación' : 'Califica la película'}
        </Text>

        <View style={{ flexDirection: 'row', marginLeft: 10 }}>
          {[1, 2, 3, 4, 5].map((index) => {
            const fillPercent = Math.min(1, Math.max(0, (rating || 0) - index + 1));
            return (
              <View key={index} style={{ width: 18, height: 18, marginHorizontal: 1 }}>
                <FontAwesome
                  name="star-o"
                  size={18}
                  color="#E0E1DD"
                  style={{ position: 'absolute', left: 0, top: 0 }}
                />
                <View
                  style={{
                    position: 'absolute',
                    width: 18 * fillPercent,
                    overflow: 'hidden',
                    height: 18,
                  }}
                >
                  <FontAwesome name="star" size={18} color="#E0E1DD" />
                </View>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BotonCalificacion;
