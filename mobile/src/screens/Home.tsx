import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { fetchSimilarMovies as fetchSimilarMovieService} from '../services/moviebymovieService';


import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavBar from '../components/NavBar.tsx'; 

import { useAuthStore } from '../store/authStore';

import { fetchRecommendations, updateRecommendations } from '../services/recommendationService';
//import { fetchPopularMovies,fetchMovieById } from '../services/moviesServices';
import { fetchMovieById, fetchSimilarMovies, fetchPopularMovies } from '../services/moviesServices';
import { fetchGenres} from '../services/genresServices';
import { fetchMoviesByGenres } from '../services/movieGenreService';
import { Movie } from '../types';
import CONFIG from '../config/config';

type Genre = { id: number; name: string };

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  
  // Estados combinados
  const [movies, setMovies] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  const [selectedMoviesLoaded, setSelectedMoviesLoaded] = useState<boolean>(false);
  const [userLikes, setUserLikes] = useState<number[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [likedMovieTitle, setLikedMovieTitle] = useState<string | null>(null);

  // Obtener parámetros de ruta
  const initialSelectedMovies = route.params?.selectedMovies || [];
  const initialSelectedGenres = route.params?.selectedGenres || [];
  const selectedGenres = route.params?.selectedGenres || [];

  // Cargar categorías de películas
  const loadCategories = async () => {
    try {
      const genresData = await fetchGenres();
      const categoriesWithMovies = await Promise.all(
        genresData.genres.map(async (genre: Genre) => {
          const movies = await fetchMoviesByGenres([genre.id]);
          return {
            id: genre.id,
            name: genre.name,
            movies: movies.results.slice(0, 10)
          };
        })
      );
      setCategories(categoriesWithMovies);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  // Obtener películas seleccionadas del usuario desde Firestore
  const fetchSelectedMovies = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'No se encontró un usuario autenticado.');
        return;
      }

      const firestore = getFirestore();
      const userDoc = doc(firestore, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const movies = userData?.selectedMovies || [];
        setSelectedMovies(movies);
        setUserLikes(movies); // Establecer likes iniciales
      } else {
        navigation.navigate('seleccionarGustos');
      }
    } catch (error) {
      console.error('Error al obtener las películas seleccionadas:', error);
      navigation.navigate('seleccionarGustos');
    } finally {
      setSelectedMoviesLoaded(true);
    }
  };

  // Cargar recomendaciones de películas
  const loadRecommendations = async () => {
    try {
      await loadCategories();
      const response = await fetchRecommendations(
        selectedMovies,
        { limit: 20 }
      );
      setRecommendedMovies(response);

      const uniqueMovies = response.filter(
        (movie: Movie, index: number, self: Movie[]) =>
          index === self.findIndex((m) => m.id === movie.id)
      );

      setMovies(uniqueMovies);
      setUserLikes(selectedMovies);

      if (selectedMovies.length > 0) {
        const firstSelectedMovieId = selectedMovies[0];
        const similarMoviesData = await fetchSimilarMovieService(firstSelectedMovieId);
        setSimilarMovies(similarMoviesData.results.slice(0, 10));

        try {
          const movieDetails = await fetchMovieById(firstSelectedMovieId);
          setLikedMovieTitle(movieDetails.title);
        } catch (error) {
          console.error('Error al obtener detalles de la película:', error);
        }
      }
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      const fallbackMovies = await fetchPopularMovies();
      setMovies(fallbackMovies);
      setSimilarMovies([]);
      setLikedMovieTitle(null);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Cargar películas similares
  const loadMovies = async () => {
    try {
      const allMovies: Movie[] = [];
      for (const movieId of selectedMovies) {
        const data = await fetchSimilarMovies(movieId);
        allMovies.push(...data.results);
      }
      setMovies(allMovies);
    } catch (error) {
      console.error('Error al cargar las películas relacionadas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navegación
  const goToPantallaBusqueda = () => {
    navigation.navigate('PantallaBusqueda');
  };

  const goToCategory = (category: any) => {
    navigation.navigate('CategoryScreen', { 
      categoryId: category.id,
      categoryName: category.name,
      movies: category.movies 
    });
  };

  // Manejar likes de películas
  const handleLikeMovie = async (movieId: number) => {
    try {
      setUserLikes(prev => [...prev, movieId]);
      const updatedRecs = await fetchRecommendations([...userLikes, movieId], { limit: 20 });
      setRecommendedMovies(updatedRecs);
    } catch (error) {
      console.error('Error updating recommendations:', error);
      setUserLikes(prev => prev.filter(id => id !== movieId));
    }
  };

  // Efectos
  useEffect(() => {
    fetchSelectedMovies();
  }, []);

  useEffect(() => {
    if (selectedMoviesLoaded) {
      if (selectedMovies.length > 0) {
        loadRecommendations();
        loadMovies();
      } else {
        setLoading(false);
        setInitialLoading(false);
        navigation.navigate('GenresScreen');
      }
    }
  }, [selectedMovies, selectedMoviesLoaded]);

  // Renderizado de carga
  if (loading || initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando películas...</Text>
        <ActivityIndicator size="large" color="#FFF" />
      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
    <ScrollView>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/icono.png')} 

          style={styles.image}
        />
        <Text style={styles.title}>¡BIENVENIDO!</Text>
        <TouchableOpacity onPress={goToPantallaBusqueda}>
          <FontAwesome name="search" size={24} color="#E0E1DD" />
        </TouchableOpacity>
      </View>
      {/* Otras categorías */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Descubre más categorías</Text>
        <FlatList
          horizontal
          data={categories.filter((cat: any) => !selectedGenres.includes(cat.id))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => goToCategory(item)} activeOpacity={0.5} >
              <View style={styles.genrePill}>
                <Text style={styles.genreText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Sección "Tus recomendaciones" */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>Tus recomendaciones</Text>
        <View style={styles.sectionLine} />
      </View>

      {/* Sección "Porque te gustó..." */}
      {likedMovieTitle && similarMovies.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Porque te gustó "{likedMovieTitle}"</Text>
          <FlatList
            horizontal
            data={similarMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
              >
                <Image
                  source={{
                    uri: item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : 'https://via.placeholder.com/150x225'
                  }}
                  style={styles.horizontalPoster}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Sección "Recomendaciones basadas en tus gustos" */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recomendaciones para ti</Text>
        <FlatList
          horizontal
          data={movies.slice(0, 10)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
            >
              <Image
                source={{ 
                  uri: item.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://via.placeholder.com/150x225'
                }}
                style={styles.horizontalPoster}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Mostrar categorías basadas en los géneros seleccionados */}
      {categories.filter((cat: any) => selectedGenres.includes(cat.id)).map((category: any) => (
        <View key={category.id} style={styles.sectionContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.sectionTitle}>{category.name}</Text>
            <TouchableOpacity onPress={() => goToCategory(category)}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={category.movies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
              >
                <Image
                  source={{ 
                    uri: item.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : 'https://via.placeholder.com/150x225'
                  }}
                  style={styles.horizontalPoster}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}

      {/* Lista de películas en grid */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Todas tus recomendaciones</Text>
        <FlatList
          data={movies.filter(
            (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
            >
              <View style={styles.movieItem}>
                <Image
                  source={{ 
                    uri: item.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : 'https://via.placeholder.com/150x225'
                  }}
                  style={styles.poster}
                />
                <Text
                  style={styles.movieTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <Text style={styles.movieRating}>⭐ {item.vote_average.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
          )}
          numColumns={2}
          contentContainerStyle={styles.movieList}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() =>
                navigation.navigate('ContenidoLista', {
                  nombreLista: 'Mis Películas Favoritas',
                  descripcion: 'Esta es una lista de mis películas favoritas.',
                  tiempoCreacion: '2025-05-06',
                  peliculas: [950387, 1197306, 324544, 1045938, 1195506],
                })
              }
            >
              <Text style={styles.footerButtonText}>Ver Lista Completa</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* NavBar al final */}
      <NavBar />
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1B2A',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
    movieList: {
    padding: 16,
  },
  movieItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 8,
    marginBottom: 8,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 150,
  },
  movieRating: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  image: {
    width: 50,
    height: 50,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionLine: {
    height: 2,
    backgroundColor: '#FFF',
    width: '100%',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 10,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  seeAll: {
    color: '#E0E1DD',
    fontSize: 14,
  },
  horizontalList: {
    paddingLeft: 16,
  },
  horizontalPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 10,
  },
  genrePill: {
    backgroundColor: 'transparent', // Fondo transparente
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1, // Añade borde
    borderColor: '#FFF', // Borde blanco
  },
  genreText: {
    color: '#FFF',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: { // Agrega este estilo
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1B2A',
  },
  loadingText: { // Agrega este estilo
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
  },
  /**Borrar despues */
  footerButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /**Borrar despues */
});

export default Home;
