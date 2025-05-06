import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Button,
  FlatList,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { fetchSimilarMovies } from '../services/moviebymovieService';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useAuthStore } from '../store/authStore';

import { fetchRecommendations } from '../services/recommendationService';
import { fetchPopularMovies } from '../services/moviesServices';

type Genre = { id: number; name: string };

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>(); // Para obtener los parámetros pasados desde la pantalla anterior
  const [movies, setMovies] = useState<any[]>([]); // Lista de películas relacionadas
  const [loading, setLoading] = useState<boolean>(true);
  
  const selectedMovies = route.params?.selectedMovies || [];// IDs de las películas seleccionadas
  const selectedGenres = route.params?.selectedGenres || [];
  const [likedMovies, setLikedMovies] = useState<number[]>([]);
  const { searchHistory } = useAuthStore(); // Asume que guardas el historial aquí
 
useEffect(() => {
  const loadRecommendations = async () => {
    try {
      // 1. Obtener recomendaciones del backend
      const response = await fetchRecommendations(
        selectedMovies,
       // selectedGenres.map((g: Genre) => g.id),
        //likedMovies,
        //searchHistory
        {limit: 20}
      );

    console.log("Recomendaciones del backend:", response);
      // 2. Filtrar películas duplicadas
      /*const uniqueMovies = response.recommendations.filter(
        (movie: any, index: number, self: any[]) => 
          index === self.findIndex((m) => m.id === movie.id)
      );*/
      const uniqueMovies = response.filter(
        (movie: any, index: number, self: any[]) =>
          index === self.findIndex((m) => m.id === movie.id)
      );

      setMovies(uniqueMovies);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
      // Opcional: Mostrar películas por defecto si falla la recomendación
      const fallbackMovies = await fetchPopularMovies(); // Implementa esta función si es necesario
      setMovies(fallbackMovies);
    } finally {
      setLoading(false);
    }
  };

  if (selectedMovies.length > 0) {
    loadRecommendations();
  } else {
    navigation.navigate('GenresScreen');
  }
}, [selectedMovies, selectedGenres, likedMovies]);


  const goToPantallaBusqueda = () => {
    navigation.navigate('PantallaBusqueda');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1B2A' }}>
        <Text style={{ color: '#FFF', fontSize: 18 }}>Cargando películas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionText}>Tus recomendaciones</Text>
        <View style={styles.sectionLine} />
      </View>
      <FlatList
      
          data={movies.filter(
              (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
          )} // Filtra duplicados
          keyExtractor={(item) => item.id.toString()} // Usa el ID como clave
          renderItem={({ item }) => (
              <TouchableOpacity
                  onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
              >
                  <View style={styles.movieItem}>
                      <Image
                           source={{ 
                            uri: item.poster_path 
                              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                              : 'https://via.placeholder.com/150x225' // Imagen por defecto
                          }}
                          style={styles.poster}
                      />
                      <Text
                          style={styles.movieTitle}
                          numberOfLines={1} // Limita a una línea
                          ellipsizeMode="tail" // Agrega puntos suspensivos al final si no cabe
                      >
                          {item.title}
                      </Text>
                      <Text style={styles.movieRating}>⭐ {item.vote_average.toFixed(1)}</Text>
                  </View>
              </TouchableOpacity>
          )}
          numColumns={2} // Muestra 2 elementos por fila
          contentContainerStyle={styles.movieList}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSpace: {
    width: 24,
  },
  title: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchText: {
    fontSize: 16,
    color: '#E0E1DD',
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
    color: '#FFD700', // Color dorado para la estrella
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4, // Espaciado entre el título y la puntuación
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
});

export default Home;