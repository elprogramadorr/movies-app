import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { obtainLists } from '../services/listas/obtainLists';
import { addMovieToList } from '../services/listas/addMovieToList';
import { deleteMovieFromList } from '../services/listas/deleteMovieFromList';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface ListasSlideProps {
  onClose: () => void;
  movieId: string; // ID de la película
}

const ListasSlide: React.FC<ListasSlideProps> = ({ onClose, movieId }) => {
  const [listas, setListas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLists, setSelectedLists] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await obtainLists();
        console.log('Listas cargadas en ListasSlide:', data);

        // Inicializa el estado de las listas seleccionadas
        const initialSelectedLists = data.reduce((acc: any, list: any) => {
          acc[list.id] = list.peliculas?.includes(movieId) || false;
          return acc;
        }, {});
        setSelectedLists(initialSelectedLists);

        setListas(data);
      } catch (error) {
        console.error('Error al cargar las listas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [movieId]);

  const handleToggleList = async (listId: string) => {
    const isSelected = selectedLists[listId];

    try {
      if (isSelected) {
        // Si ya está seleccionado, elimina la película de la lista
        await deleteMovieFromList(listId, movieId);
        ToastAndroid.show('Película eliminada de la lista. ❌', ToastAndroid.SHORT);

        // Actualiza el número de películas en la lista
        setListas((prevListas) =>
          prevListas.map((list) =>
            list.id === listId
              ? { ...list, peliculas: list.peliculas.filter((id: string) => id !== movieId) }
              : list
          )
        );
      } else {
        // Si no está seleccionado, añade la película a la lista
        await addMovieToList(listId, movieId);
        ToastAndroid.show('Película añadida a la lista. ✅', ToastAndroid.SHORT);

        // Actualiza el número de películas en la lista
        setListas((prevListas) =>
          prevListas.map((list) =>
            list.id === listId
              ? { ...list, peliculas: [...(list.peliculas || []), movieId] }
              : list
          )
        );
      }

      // Actualiza el estado de selección
      setSelectedLists((prev) => ({
        ...prev,
        [listId]: !isSelected,
      }));
    } catch (error) {
      console.error('Error al actualizar la lista:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E7A325" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guardar en una lista</Text>
      <BottomSheetFlatList
        data={listas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listTextContainer}>
              <View style={styles.iconAndTextContainer}>
                <FontAwesome name="film" size={24} color="#FFF" style={styles.icon} />
                <View>
                  <Text style={styles.listTitle}>{item.nombreLista}</Text>
                  <Text style={styles.listDescription}>
                    {item.peliculas ? item.peliculas.length : 0} películas
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleToggleList(item.id)}>
              <FontAwesome
                name={selectedLists[item.id] ? 'check-square' : 'square-o'}
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#32455b',
    padding: 0,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1B2A',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#32455b',
    padding: 4,
    marginBottom: 8,
  },
  listTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  listTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listDescription: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 3,
  },
  separator: {
    height: 1,
    backgroundColor: '#A0A0A0', // Color de la línea separadora
    marginVertical: 1,
  },
  iconAndTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 20, // Espacio entre el ícono y el texto
  },
});

export default ListasSlide;