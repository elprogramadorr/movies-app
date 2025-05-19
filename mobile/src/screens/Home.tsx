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

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavBar from '../components/NavBar.tsx'; 

import { useAuthStore } from '../store/authStore';

import { fetchRecommendations, updateRecommendations } from '../services/recommendationService';
import { fetchPopularMovies,fetchMovieById } from '../services/moviesServices';
import { fetchGenres} from '../services/genresServices';
import { fetchMoviesByGenres } from '../services/movieGenreService';
import { Movie } from '../types';
import CONFIG from '../config/config';

type Genre = { id: number; name: string };

const Home = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>(); // Para obtener los parámetros pasados desde la pantalla anterior
  const [movies, setMovies] = useState<any[]>([]); // Lista de películas relacionadas
  const [similarMovies, setSimilarMovies] = useState<any[]>([]); 
  const [categories, setCategories] = useState<any[]>([]); 

  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const selectedMovies = route.params?.selectedMovies || [];// IDs de las películas seleccionadas
  const selectedGenres = route.params?.selectedGenres || [];
  const [userLikes, setUserLikes] = useState<number[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
 
  // Obtener las preferencias iniciales de los parámetros de ruta
  const initialSelectedMovies = route.params?.selectedMovies || [];
  const initialSelectedGenres = route.params?.selectedGenres || [];
  const [likedMovieTitle, setLikedMovieTitle] = useState<string | null>(null);
 
  // const { searchHistory } = useAuthStore(); // Asume que guardas el historial aquí
const loadCategories = async () => {
  try {
    // 1. Obtener géneros/categorías desde la API
    const genresData = await fetchGenres();
    
    // 2. Para cada género, obtener películas populares
    const categoriesWithMovies = await Promise.all(
      genresData.genres.map(async (genre: any) => {
        const movies = await fetchMoviesByGenres([genre.id]); 
        //const movies = await fetchMoviesByGenres(genre.id);
        return {
          id: genre.id,
          name: genre.name,
          movies: movies.results.slice(0, 10) // Tomamos las primeras 10 películas
        };
      })
    );
    
    setCategories(categoriesWithMovies);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    // Puedes mostrar categorías por defecto si falla
    setCategories([]);
  }
};




useEffect(() => {
  const loadRecommendations = async () => {
    try {


      // Cargar categorías basadas en los géneros seleccionados
      await loadCategories();
      // 1. Obtener recomendaciones del backend
      const response = await fetchRecommendations(
        selectedMovies,
       // selectedGenres.map((g: Genre) => g.id),
        //likedMovies,
        //searchHistory
        //selectedGenres,
        {limit: 20}
      );
      setRecommendedMovies(response);
    

    console.log("Recomendaciones del backend:", response);
      // 2. Filtrar películas duplicadas
      const uniqueMovies = response.filter(
        (movie: any, index: number, self: any[]) =>
          index === self.findIndex((m) => m.id === movie.id)
      );

      setMovies(uniqueMovies);
      setUserLikes(initialSelectedMovies);
      console.log("pelicula seleccionada:", initialSelectedMovies);
      // Cargar películas similares a la primera película seleccionada (si hay alguna)
      if (initialSelectedMovies.length > 0) {
        const firstSelectedMovieId = initialSelectedMovies[0];
        const similarMoviesData = await fetchSimilarMovieService(firstSelectedMovieId);
        setSimilarMovies(similarMoviesData.results.slice(0, 10));

        // Obtener el título de la primera película seleccionada para mostrar
        try {
          const movieDetails = await fetchMovieById(firstSelectedMovieId); // Usa la función del servicio
          console.log('Título de la película que te gustó:', movieDetails.title);
          setLikedMovieTitle(movieDetails.title);
        } catch (error) {
          console.error('Error al obtener detalles de la película:', error);

        }
      }

    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      // Opcional: Mostrar películas por defecto si falla la recomendación
      const fallbackMovies = await fetchPopularMovies(); // Implementa esta función si es necesario
      setMovies(fallbackMovies);
      setSimilarMovies([]);
      setLikedMovieTitle(null);
    } finally {
      setLoading(false);
    }
  };

  if (selectedMovies.length > 0) {
    loadRecommendations();
  } else {
    navigation.navigate('GenresScreen');
  }
}, [selectedMovies, selectedGenres, navigation]);


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

  // Manejar cuando el usuario da like a una película
  const handleLikeMovie = async (movieId: number) => {
    try {
      // Actualizar el estado local primero para una respuesta rápida
      setUserLikes(prev => [...prev, movieId]);
      
      // Obtener recomendaciones actualizadas del backend
      const updatedRecs = await updateRecommendations(userLikes, movieId);
      setRecommendedMovies(updatedRecs);
      
    } catch (error) {
      console.error('Error updating recommendations:', error);
      // Revertir el like si falla
      setUserLikes(prev => prev.filter(id => id !== movieId));
    }
  };

  if (loading) {
    return (

      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1B2A' }}>
        <Text style={{ color: '#FFF', fontSize: 18 }}>Cargando películas...</Text>
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
        />
      </View>
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
});

export default Home;
