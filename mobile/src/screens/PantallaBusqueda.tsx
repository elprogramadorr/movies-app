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
import { debounce } from 'lodash';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';
import HistorialBusqueda from '../components/HistorialBusqueda';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  popularity: number;
}

const API_KEY = 'dc66f3e3e06fbb42ce432acf4341427f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const SearchScreen = () => {
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
        .filter(
          (movie: Movie) =>
            movie.poster_path &&
            movie.title.toLowerCase().includes(trimmedQuery),
        )
        .sort((a: Movie, b: Movie) => b.popularity - a.popularity); //ordena por popularidad, los más populares aparecen primero

      setMovies(filteredResults);
    } catch (error) {
      console.error('Error buscando películas:', error);
    }
  };

  const searchMoviesDebounced = debounce(searchMovies, 500);

  const saveSearchToFirebase = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    try {
      await addDoc(collection(db, 'busqueda'), {
        busqueda: trimmed,
        fecha: serverTimestamp(),
      });
      console.log('Guardado en Firebase:', trimmed);
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
    }
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity style={styles.imageContainer}>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={text => {
              setQuery(text);
              searchMoviesDebounced(text);
            }}
            onSubmitEditing={() => {
              searchMovies(query);
              saveSearchToFirebase(query);
            }}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setMovies([]);
              }}
              style={styles.clearButton}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {query.length === 0 && (
          <HistorialBusqueda
            historial={[]}
            onItemPress={item => {
              setQuery(item);
              searchMovies(item);
            }}
          />
        )}

        {movies.length === 0 && query.trim().length > 0 && (
          <Text style={styles.noResultsText}>
            No se encontraron resultados para "{query}"
          </Text>
        )}

        <FlatList
          data={movies}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.grid}
        />
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
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 10,
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 24,
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
});

export default SearchScreen;
