import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';

interface Props {
  onItemPress: (item: string) => void;
}

const HistorialBusqueda: React.FC<Props> = ({ onItemPress }) => {
  const [historial, setHistorial] = useState<string[]>([]);

  const cargarHistorial = async () => {
    try {
      const q = query(collection(db, 'busqueda'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      const resultados: string[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.busqueda && !resultados.includes(data.busqueda)) {
          resultados.push(data.busqueda);
        }
      });

      setHistorial(resultados.slice(0, 10));
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
      <Text style={styles.text}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <FlatList
        data={historial}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E2D3C',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  title: {
    color: '#E0E1DD',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  item: {
    paddingVertical: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
  },
  text: {
    color: '#E0E1DD',
    fontSize: 14,
  },
});

export default HistorialBusqueda;
