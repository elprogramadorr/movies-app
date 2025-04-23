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

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>(); // Para obtener los parámetros pasados desde la pantalla anterior
  const [movies, setMovies] = useState<any[]>([]); // Lista de películas relacionadas
  const [loading, setLoading] = useState<boolean>(true);

  const selectedMovies = route.params?.selectedMovies || []; // IDs de las películas seleccionadas

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const allMovies: any[] = [];
        for (const movieId of selectedMovies) {
          const data = await fetchSimilarMovies(movieId); // Llama al servicio para cada ID
          allMovies.push(...data.results); // Agrega las películas relacionadas
        }
        setMovies(allMovies); // Guarda todas las películas en el estado
      } catch (error) {
        console.error('Error al cargar las películas relacionadas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedMovies.length > 0) {
      loadMovies();
    } else {
      setLoading(false);
    }
  }, [selectedMovies]);

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
        <View style={styles.sideSpace} />
        <Text style={styles.title}>¡BIENVENIDO!</Text>
        <TouchableOpacity onPress={goToPantallaBusqueda}>
          <Text style={styles.searchText}>BUSCAR</Text>
        </TouchableOpacity>
        <Button
          title="Ir a Seleccionar Gustos"
          onPress={() => navigation.navigate('GenresScreen')}
        />
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
                          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                          style={styles.poster}
                      />
                      <Text style={styles.movieTitle}>{item.title}</Text>
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
    backgroundColor: '#01161E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSpace: {
    width: 24,
  },
  title: {
    fontSize: 18,
    color: '#EFF6E0',
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
    flex: 1, // Asegura que los elementos ocupen el mismo espacio
    margin: 8, // Espaciado entre los elementos
    alignItems: 'center',
  },
  poster: {
    width: 150, // Ajusta el tamaño del póster según sea necesario
    height: 225,
    borderRadius: 8,
    marginBottom: 8,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  movieRating: {
    color: '#FFD700', // Color dorado para la estrella
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4, // Espaciado entre el título y la puntuación
  },
});

export default Home;