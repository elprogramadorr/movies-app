import React, { useState } from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { debounce } from 'lodash';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';
import HistorialBusqueda from '../components/HistorialBusqueda';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import Icon from 'react-native-vector-icons/FontAwesome';


interface Movie {
  id: number;
  title: string;
  poster_path: string;
  popularity: number;
}

interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
}

const API_KEY = 'dc66f3e3e06fbb42ce432acf4341427f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const SearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Person[]>([]);
  const [directors, setDirectors] = useState<Person[]>([]);

  const searchAll = async (text: string) => {
    const trimmed = text.trim().toLowerCase();
    if (!trimmed) {
      setMovies([]);
      setActors([]);
      setDirectors([]);
      return;
    }

    try {
      const [movieRes, personRes] = await Promise.all([
        axios.get(`${BASE_URL}/search/movie`, {
          params: {
            api_key: API_KEY,
            query: trimmed,
            language: 'es-ES',
          },
        }),
        axios.get(`${BASE_URL}/search/person`, {
          params: {
            api_key: API_KEY,
            query: trimmed,
            language: 'es-ES',
          },
        }),
      ]);

      const filteredMovies = movieRes.data.results
        .filter((m: Movie) => m.poster_path && m.title.toLowerCase().includes(trimmed))
        .sort((a: Movie, b: Movie) => b.popularity - a.popularity);

      const filteredPeople = personRes.data.results.filter(
        (p: Person) => p.profile_path && p.name.toLowerCase().includes(trimmed)
      );

      setActors(filteredPeople.filter(p => p.known_for_department === 'Acting'));
      setDirectors(filteredPeople.filter(p => p.known_for_department === 'Directing'));
      setMovies(filteredMovies);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  };

  const debouncedSearch = debounce(searchAll, 500);

  const saveSearchToFirebase = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    try {
      await addDoc(collection(db, 'busqueda'), {
        busqueda: trimmed,
        fecha: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error guardando en Firebase:', err);
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderPersonItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.personContainer}
      onPress={() => navigation.navigate('PersonDetailsScreen', { personId: item.id })}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.profile_path}` }}
        style={styles.personImage}
      />
      <Text style={styles.personName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.poster}
      />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <Icon name="search" size={16} color="#aaa" style={styles.searchIcon} />
          <TextInput
            placeholder="Buscar películas, actores, directores..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={text => {
              setQuery(text);
              debouncedSearch(text);
            }}
            onSubmitEditing={() => {
              searchAll(query);
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
                setActors([]);
                setDirectors([]);
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {query.length === 0 && (
          <HistorialBusqueda
            onItemPress={item => {
              setQuery(item);
              searchAll(item);
              saveSearchToFirebase(item);
            }}
          />
        )}

        <ScrollView>
          {actors.length > 0 && (
            <>
              <SectionTitle title="Actores" />
              <FlatList
                data={actors}
                horizontal
                keyExtractor={item => `act:${item.id}`}
                renderItem={renderPersonItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </>
          )}

          {directors.length > 0 && (
            <>
              <SectionTitle title="Directores" />
              <FlatList
                data={directors}
                horizontal
                keyExtractor={item => `dir:${item.id}`}
                renderItem={renderPersonItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </>
          )}

          {movies.length > 0 ? (
            <>
              <SectionTitle title="Películas" />
              <FlatList
                data={movies}
                keyExtractor={item => item.id.toString()}
                renderItem={renderMovieItem}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.grid}
              />
            </>
          ) : (
            query.trim().length > 0 && (
              <Text style={styles.noResultsText}>
                No se encontraron resultados para "{query}"
              </Text>
            )
          )}
        </ScrollView>
      </View>
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
    fontSize: 14,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  horizontalList: {
    paddingBottom: 10,
  },
  personContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  personImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  personName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
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
  grid: {
    justifyContent: 'center',
  },
  noResultsText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  },
});

export default SearchScreen;
