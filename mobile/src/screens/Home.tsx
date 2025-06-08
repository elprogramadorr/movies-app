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
import { useNavigation } from '@react-navigation/native';
import { fetchSimilarMovies as fetchSimilarMovieService} from '../services/moviebymovieService';
import { getFirestore, doc, getDoc,collection, getDocs } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavBar from '../components/NavBar.tsx'; 
import { fetchRecommendations, updateRecommendations} from '../services/recommendationService';
//import { fetchPopularMovies,fetchMovieById } from '../services/moviesServices';
import { fetchMovieById, fetchSimilarMovies, fetchPopularMovies } from '../services/moviesServices';
import { fetchGenres} from '../services/genresServices';
import { fetchMoviesByGenres } from '../services/movieGenreService';
import { Movie, RecommendationSections } from '../types';

type Genre = { id: number; name: string };

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
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
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [recommendationSections, setRecommendationSections] = useState<RecommendationSections>({});

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
        // Considera navegar a la pantalla de login o gustos si no hay usuario
        navigation.navigate('seleccionarGustos'); 
        return;
      }

      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);

      let initialUserSelectedMovies: number[] = [];
      let initialLikedMovies: number[] = [];
      let initialWatchedMovies: number[] = [];
      let initialRatedMovies: Array<{movie_id: number, rating: number}> = [];

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        initialUserSelectedMovies = userData?.selectedMovies || [];
        setSelectedGenres(userData?.selectedGenres || []);
        // No necesitamos cargar likedMovies/watchedMovies/ratedMovies del documento principal
        // si los cargaremos de las subcolecciones, pero si quieres tener un fallback, puedes dejarlos.
        // Por ahora, nos enfocamos en las subcolecciones.
      } else {
        // Si el documento principal del usuario no existe, navega para que seleccione gustos iniciales
        navigation.navigate('seleccionarGustos');
        setInitialLoading(false); // Detener carga si no hay usuario o documento
        setLoading(false);
        return; // Detener la ejecución si no hay documento de usuario
      }

      // --- NUEVA LÓGICA: OBTENER LIKED MOVIES Y WATCHED MOVIES DE LAS SUBCLECIONES 'listas' ---
      const likedListRef = doc(firestore, 'users', user.uid, 'listas', 'me_gusta');
      const likedListSnapshot = await getDoc(likedListRef);
      if (likedListSnapshot.exists()) {
        initialLikedMovies = likedListSnapshot.data()?.peliculas?.map((id: string) => parseInt(id)) || [];
      } else {
        console.log("La lista 'me_gusta' no existe para el usuario.");
      }

      const watchedListRef = doc(firestore, 'users', user.uid, 'listas', 'vistos');
      const watchedListSnapshot = await getDoc(watchedListRef);
      if (watchedListSnapshot.exists()) {
        initialWatchedMovies = watchedListSnapshot.data()?.peliculas?.map((id: string) => parseInt(id)) || [];
      } else {
        console.log("La lista 'vistos' no existe para el usuario.");
      }

      // --- NUEVA LÓGICA: OBTENER RATED MOVIES DE LA SUBCOLECCIÓN 'ratings' ---
      const ratingsCollectionRef = collection(firestore, 'users', user.uid, 'ratings');
      const ratingsSnapshot = await getDocs(ratingsCollectionRef);
      initialRatedMovies = ratingsSnapshot.docs.map(doc => ({
        movie_id: parseInt(doc.id), // El ID de la película es el ID del documento en 'ratings'
        rating: doc.data().rating
      }));
      
      // Actualizar los estados relevantes en Home
      setSelectedMovies(initialUserSelectedMovies);
      // Combinar los likes iniciales con los de la lista 'me_gusta' para el backend
      setUserLikes([...new Set([...initialUserSelectedMovies, ...initialLikedMovies])]); 
      

    } catch (error) {
      console.error('Error al obtener las películas seleccionadas o listas:', error);
      Alert.alert('Error', 'No se pudieron cargar tus preferencias de películas.');
      navigation.navigate('seleccionarGustos'); // Navegar si hay un error crítico
    } finally {
      setSelectedMoviesLoaded(true);
      
    }
  };

  // Cargar recomendaciones de películas
const loadRecommendations = async () => {
  try {
    setLoading(true);
    await loadCategories();

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('Usuario no autenticado, no se pueden cargar recomendaciones personalizadas.');
      setLoading(false);
      setInitialLoading(false);
      return;
    }

    const firestore = getFirestore();
    
    // Obtener datos del usuario (optimizado con Promise.all)
    const [userSnapshot, likedListSnapshot, watchedListSnapshot, ratingsSnapshot] = await Promise.all([
      getDoc(doc(firestore, 'users', user.uid)),
      getDoc(doc(firestore, 'users', user.uid, 'listas', 'me_gusta')),
      getDoc(doc(firestore, 'users', user.uid, 'listas', 'vistos')),
      getDocs(collection(firestore, 'users', user.uid, 'ratings'))
    ]);


    let currentSelectedMovies: number[] = [];
    let currentLikedMovies: number[] = [];
    let currentWatchedMovies: number[] = [];
    let currentRatedMovies: Array<{movie_id: number, rating: number}> = [];

    if (userSnapshot.exists()) {
      currentSelectedMovies = userSnapshot.data()?.selectedMovies || [];
    }

    if (likedListSnapshot.exists()) {
      currentLikedMovies = likedListSnapshot.data()?.peliculas?.map((id: string) => parseInt(id)) || [];
    }

    if (watchedListSnapshot.exists()) {
      currentWatchedMovies = watchedListSnapshot.data()?.peliculas?.map((id: string) => parseInt(id)) || [];
    }

    currentRatedMovies = ratingsSnapshot.docs.map(doc => ({
      movie_id: parseInt(doc.id),
      rating: doc.data().rating
    }));

    // Determinar si el usuario es nuevo (sin interacciones)
    const isNewUser = currentLikedMovies.length === 0 && 
                      currentWatchedMovies.length === 0 && 
                      currentRatedMovies.length === 0;

    let allRecommendedMovies: Movie[] = [];
    let sections: RecommendationSections = {};
  
    // 1. Siempre cargar recomendaciones basadas en preferencias iniciales (si existen)
    if (currentSelectedMovies.length > 0) {
      const initialSimilarMovies = await Promise.all(
        currentSelectedMovies.map(movieId => 
          fetchSimilarMovieService(movieId).then(res => res.results.slice(0, 5))
        )
      );
      setSimilarMovies(initialSimilarMovies.flat().slice(0, 10));
      
      const firstMovie = await fetchMovieById(currentSelectedMovies[0]);
      setLikedMovieTitle(firstMovie.title);

      

      // Agregar a todas las recomendaciones
      allRecommendedMovies.push(...initialSimilarMovies.flat());
    }

    if (isNewUser) {
      // 2. Para usuarios nuevos: cargar recomendaciones generales
      const initialResponse = await fetchRecommendations(currentSelectedMovies, { limit: 20 });
      allRecommendedMovies = [...allRecommendedMovies, ...initialResponse];
      
      
    } else {
      // 3. Para usuarios existentes: cargar recomendaciones personalizadas
      const personalizedResponse = await updateRecommendations(
        currentSelectedMovies,
        currentLikedMovies,
        currentWatchedMovies,
        currentRatedMovies,
        { limit: 20 }
      );

      allRecommendedMovies = [...personalizedResponse|| []];
      

      

      // 5. Obtener recomendaciones basadas en interacciones recientes
      const lastLikedMovie = currentLikedMovies[currentLikedMovies.length - 1];
      const lastWatchedMovie = currentWatchedMovies[currentWatchedMovies.length - 1];
      const lastLikedMovieDetails = await fetchMovieById(lastLikedMovie);
      const lastWatchedMovieDetails = await fetchMovieById(lastWatchedMovie);

      const recommendationsPromises = [];
      
      if (lastLikedMovie) {
        recommendationsPromises.push(
          fetchSimilarMovieService(lastLikedMovie)
            .then(res => {
              const movies = res.results.slice(0, 10);
              sections.based_on_last_liked = {
                title: `Porque te gustó esta película${lastLikedMovieDetails.title ? `: ${lastLikedMovieDetails.title}` : ''}`,
                movies: movies
              };
              return movies;
            })
        );
      }

      if (lastWatchedMovie && lastWatchedMovie !== lastLikedMovie) {
        recommendationsPromises.push(
          fetchSimilarMovieService(lastWatchedMovie)
            .then(res => {
              const movies = res.results.slice(0, 10);
              sections.based_on_last_watched = {
                title: `Porque viste esta película ${lastWatchedMovieDetails.title ? `: ${lastWatchedMovieDetails.title}` : ''}`,
                movies: movies
              };
              return movies;
            })
        );
      }

      if (currentRatedMovies.length > 0) {
        const highestRated = currentRatedMovies.reduce((prev, current) => 
          (prev.rating > current.rating) ? prev : current
        );
        const highestRatedMovie = await fetchMovieById(highestRated.movie_id);
        
        recommendationsPromises.push(
          fetchSimilarMovieService(highestRated.movie_id)
            .then(res => {
              const movies = res.results.slice(0, 10);
              sections.based_on_high_rated = {
                title: `Porque te encantó esta película ${highestRatedMovie.title ? `: ${highestRatedMovie.title}` : ''}`,
                movies: movies
              };
              return movies;
            })
        );
      }

      // Esperar y agregar recomendaciones adicionales
      const additionalRecommendations = await Promise.all(recommendationsPromises);
      allRecommendedMovies = [
        ...allRecommendedMovies,
        ...additionalRecommendations.flat()
      ];
    }

    // Filtrar duplicados y actualizar estado
    allRecommendedMovies = allRecommendedMovies.filter(
      (movie, index, self) => index === self.findIndex(m => m.id === movie.id)
    );
     const fallbackMovies = await fetchPopularMovies();
    // Actualizar estados
    setRecommendedMovies(allRecommendedMovies);
    setMovies(fallbackMovies);
    setRecommendationSections(sections);
    setUserLikes([...new Set([...currentLikedMovies, ...currentSelectedMovies])]);

  } catch (error) {
    console.error('Error al cargar recomendaciones:', error);
    // Fallback a películas populares
    const fallbackMovies = await fetchPopularMovies();
    setMovies(fallbackMovies);
    setRecommendedMovies(fallbackMovies);
    setRecommendationSections({});
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
  <FlatList
    data={recommendedMovies.filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    )}
    keyExtractor={(item, index) => {
      if (item && item.id !== undefined && item.id !== null) {
        return item.id.toString();
      }
      return index.toString();
    }}
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
          <Text style={styles.movieRating}>
            ⭐ {(item.vote_average || 0).toFixed(1)}
          </Text>
        </View>
      </TouchableOpacity>
    )}
    numColumns={2}
    contentContainerStyle={styles.movieList}
    ListHeaderComponent={
      <View>
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
              <TouchableOpacity onPress={() => goToCategory(item)} activeOpacity={0.5}>
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

        {/* SECCIONES PERSONALIZADAS */}

        {/* 2. Porque te gustó [última película marcada como me gusta] */}
        {recommendationSections.based_on_last_liked?.movies && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {recommendationSections.based_on_last_liked.title || "Porque te gustó esta película"}
            </Text>
            <FlatList
              horizontal
              data={recommendationSections.based_on_last_liked.movies}
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
              keyExtractor={(item, index) => {
                if (item && item.id !== undefined && item.id !== null) {
                  return item.id.toString();
                }
                return index.toString();
              }}
              contentContainerStyle={styles.horizontalList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Peliculas de gustos inicial */}
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

        {/* Peliculas populares actuales */}
        <View style={styles.horizontalCarteleraContainer}>
          <View style={styles.sectionHeaderCartel}>
            <Text style={styles.sectionTitleCartel}>Películas populares</Text>
          </View>
          <FlatList
            horizontal
            data={movies.filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))}
            keyExtractor={(item, index) => {
              if (item && item.id !== undefined && item.id !== null) {
                return item.id.toString();
              }
              return index.toString();
            }}
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
                  style={styles.horizontalCartelera}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* 4. Porque viste [última película vista] */}
        {recommendationSections.based_on_last_watched?.movies && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {recommendationSections.based_on_last_watched.title || "Porque viste esta película"}
            </Text>
            <FlatList
              horizontal
              data={recommendationSections.based_on_last_watched.movies}
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
              keyExtractor={(item, index) => {
                if (item && item.id !== undefined && item.id !== null) {
                  return item.id.toString();
                }
                return index.toString();
              }}
              contentContainerStyle={styles.horizontalList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* 5. Porque te encantó [película mejor calificada] */}
        {recommendationSections.based_on_high_rated?.movies && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {recommendationSections.based_on_high_rated.title || "Porque te encantaron estas películas"}
            </Text>
            <FlatList
              horizontal
              data={recommendationSections.based_on_high_rated.movies}
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
              keyExtractor={(item, index) => {
                if (item && item.id !== undefined && item.id !== null) {
                  return item.id.toString();
                }
                return index.toString();
              }}
              contentContainerStyle={styles.horizontalList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Sección "Tus recomendaciones" */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionText}>Categorias que te interesan</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Sección de categorías basadas en géneros seleccionados */}
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
              keyExtractor={(item, index) => {
                if (item && item.id !== undefined && item.id !== null) {
                  return item.id.toString();
                }
                return index.toString();
              }}
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
        {/* Fin del header */}
        <Text style={styles.sectionTitle}>Todas tus recomendaciones</Text>
      </View>
    }
    ListFooterComponent={
      <View style={{ height: 80 }} /> // Espacio para el NavBar
    }
  />
  {/* NavBar fijo en la parte inferior */}
  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
    <NavBar />
  </View>
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
    padding: 0,

  },
  movieItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  
  poster: {
    width: 170,
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
   horizontalCarteleraContainer: {
    marginVertical: 10,
  },
  horizontalCartelera: {
    width: 150,
    height: 300,
    borderRadius: 8,
    marginRight: 10,
  },
  horizontalCarteleraTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  horizontalCarteleraRating: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2, 
  }, 
  sectionHeaderCartel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 15,
  },
  sectionTitleCartel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  /**Borrar despues */
});

export default Home;