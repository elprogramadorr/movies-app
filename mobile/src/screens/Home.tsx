import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { fetchSimilarMovies } from '../services/moviebymovieService.tsx';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavBar from '../components/NavBar.tsx'; 

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Para obtener los parámetros pasados desde la pantalla anterior
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);

  useEffect(() => {
    const fetchSelectedMovies = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert('Error', 'No se encontró un usuario autenticado.');
          return;
        }

        const firestore = getFirestore();
        const userDoc = doc(firestore, 'users', user.uid); // Reemplaza 'USER_ID' con el ID del usuario autenticado
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const movies = userData?.selectedMovies || [];
          if (movies.length > 0) {
            setSelectedMovies(movies);
          } else {
            navigation.navigate('seleccionarGustos'); // Redirige si no hay películas seleccionadas
          }
        } else {
          navigation.navigate('seleccionarGustos'); // Redirige si no existe el documento
        }
      } catch (error) {
        console.error('Error al obtener las películas seleccionadas:', error);
        navigation.navigate('seleccionarGustos'); // Redirige en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedMovies();
  }, []);

  const goToPantallaBusqueda = () => {
    navigation.navigate('PantallaBusqueda');
  };

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const allMovies: any[] = [];
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

    if (selectedMovies.length > 0) {
      loadMovies();
    } else {
      navigation.navigate('GenresScreen');
    }
  }, [selectedMovies]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando películas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        />
      {/* NavBar al final */}
      <NavBar />
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
});

export default Home;
