import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  popularity: number;
}

const API_KEY = 'dc66f3e3e06fbb42ce432acf4341427f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const AddMoviesList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedMovies, setSelectedMovies } = route.params as {
    selectedMovies: { id: number; poster_path: string }[];
    setSelectedMovies: (updatedMovies: { id: number; poster_path: string }[]) => void;
  };
  const [localSelectedMovies, setLocalSelectedMovies] = useState(selectedMovies);
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);

  const searchMovies = async (text: string) => {
    const trimmedQuery = text.trim().toLowerCase();
    if (!trimmedQuery) {
      setMovies([]);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: API_KEY,
          query: trimmedQuery,
          language: 'es-ES',
        },
      });

      const filteredResults = response.data.results
        .filter((movie: Movie) => movie.poster_path)
        .sort((a: Movie, b: Movie) => b.popularity - a.popularity);

      setMovies(filteredResults);
    } catch (error) {
      console.error('Error buscando películas:', error);
    }
  };

  const toggleMovieInList = (movie: Movie) => {
    if (localSelectedMovies.some((m) => m.id === movie.id)) {
      setLocalSelectedMovies((prev) => prev.filter((m) => m.id !== movie.id));
    } else {
      setLocalSelectedMovies((prev) => [...prev, { id: movie.id, poster_path: movie.poster_path }]);
    }
  };

  const handleSave = () => {
    setSelectedMovies(localSelectedMovies); // Actualiza las películas seleccionadas en `NuevaListaScreen`
    navigation.goBack(); // Regresa a la pantalla anterior
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => toggleMovieInList(item)}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
      <Text style={styles.title}>{item.title}</Text>
      <Icon
        name={localSelectedMovies.some((m) => m.id === item.id) ? 'check-circle' : 'circle-o'}
        size={20}
        color={localSelectedMovies.some((m) => m.id === item.id) ? '#E63946' : '#aaa'}
        style={styles.checkIcon}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.inputWrapper}>
          <Icon name="search" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              searchMovies(text);
            }}
            style={styles.input}
            returnKeyType="search"
          />
        </View>

        {movies.length === 0 && query.trim().length > 0 && (
          <Text style={styles.noResultsText}>
            No se encontraron resultados para "{query}"
          </Text>
        )}

        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.grid}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar selección</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
    padding: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2D3C',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 10,
    fontSize: 16,
  },
  grid: {
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1 / 3,
    margin: 5,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  saveButton: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMoviesList;