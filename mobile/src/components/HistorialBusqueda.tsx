import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';

interface Props {
  historial: string[];
  onItemPress: (item: string) => void;
}

const HistorialBusqueda: React.FC<Props> = ({ onItemPress }) => {
  const [historial, setHistorial] = useState<string[]>([]);

  const fetchHistorial = async () => {
    const q = query(
      collection(db, 'busqueda'),
      orderBy('fecha', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => doc.data().busqueda);
    setHistorial(items);
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => onItemPress(item)} style={styles.item}>
      <Text style={styles.text}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial</Text>
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
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#1E2D3C',
    borderRadius: 10,
  },
  header: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  item: {
    paddingVertical: 6,
  },
  text: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default HistorialBusqueda;
