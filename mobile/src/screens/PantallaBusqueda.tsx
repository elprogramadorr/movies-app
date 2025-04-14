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
} from 'react-native';
import axios from 'axios';
import { debounce } from 'lodash';

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
            movie.title.toLowerCase().includes(trimmedQuery)
        )
        .sort((a: Movie, b: Movie) => b.popularity - a.popularity); //ordena por popularidad, los más populares aparecen primero

      setMovies(filteredResults);
    } catch (error) {
      console.error('Error buscando películas:', error);
    }
  };

  const searchMoviesDebounced = debounce(searchMovies, 500);

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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TextInput
        placeholder="Buscar..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          searchMoviesDebounced(text);
        }}
        style={styles.input}
      />

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

      <TouchableOpacity style={styles.searchButton} onPress={() => searchMovies(query)}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
    padding: 10,
  },
  input: {
    backgroundColor: '#1E2D3C',
    borderRadius: 25,
    padding: 10,
    color: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
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
  searchButton: {
    backgroundColor: '#EFF6E0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SearchScreen;
