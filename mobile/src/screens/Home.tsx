import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { fetchSimilarMovies } from '../services/moviebymovieService.tsx';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavBar from '../components/NavBar.tsx'; 

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Para obtener los parámetros pasados desde la pantalla anterior
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>(); // Lista de películas relacionadas
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const selectedMovies = route.params?.selectedMovies || []; // IDs de las películas seleccionadas

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const allMovies: any[] = [];
        for (const movieId of selectedMovies) { // Llama al servicio para cada ID
          const data = await fetchSimilarMovies(movieId); // Agrega las películas relacionadas
          allMovies.push(...data.results);
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
      navigation.navigate('GenresScreen');
    }
  }, [selectedMovies]);

  const goToPantallaBusqueda = () => {
    navigation.navigate('PantallaBusqueda');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando películas...</Text>
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
=======
    <SafeAreaView style={styles.container}>
>>>>>>> main
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
<<<<<<< HEAD
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
                          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
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
          ListFooterComponent={
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() =>
                navigation.navigate('ContenidoLista', {
                  nombreLista: 'Mis Películas Favoritas',
                  descripcion: 'Esta es una lista de mis películas favoritas.',
                  tiempoCreacion: '2025-05-06',
                  peliculas: [950387, 1197306, 324544, 1045938, 1195506], // Cambia esto según tus datos
                })
              }
            >
              <Text style={styles.footerButtonText}>Ver Lista Completa</Text>
            </TouchableOpacity>
          }
        />
=======

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
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.poster}
              />
              <Text style={styles.movieTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text style={styles.movieRating}>⭐ {item.vote_average.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2}
        contentContainerStyle={styles.movieList}
      />

      {/* NavBar al final */}
      <NavBar />
>>>>>>> main
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
<<<<<<< HEAD
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
=======
>>>>>>> main
});

export default Home;
