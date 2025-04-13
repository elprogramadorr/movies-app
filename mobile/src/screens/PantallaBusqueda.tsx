import React, { useState } from 'react';
import { View, TextInput, FlatList, Image, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

const API_KEY = 'dc66f3e3e06fbb42ce432acf4341427f'; // Reemplaza con tu API Key de TMDB
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);

  const searchMovies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: API_KEY,
          query,
        },
      });
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error buscando películas:', error);
    }
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity style={styles.imageContainer}>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TextInput
        placeholder="Buscar..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />
      <TouchableOpacity style={styles.searchButton} onPress={searchMovies}>
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
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
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
