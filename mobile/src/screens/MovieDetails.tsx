import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from 'react-native-config';
import axios from 'axios';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types';
import LinearGradient from 'react-native-linear-gradient';
import WatchProvider from '../components/WatchProvider';
import Actor from '../components/Actor';
import Visto from '../components/Visto';
import VerMasTarde from '../components/VerMasTarde';
import {ToastAndroid} from 'react-native';
import CalificarPelicula from '../components/CalificarPelicula';
import BotonCalificacion from '../components/BotonCalificacion';
import {
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import {db} from '../../android/app/src/config/firebaseConfig';
import {Timestamp} from 'firebase/firestore';
import {useAuthStore} from '../store/useAuthStore';
import ListasSlide from '../components/ListasSlide';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

type MovieDetailsRouteProp = RouteProp<RootStackParamList, 'MovieDetails'>;

const MovieDetails = () => {
  const user = useAuthStore(state => state.user);
  if (!user) {
    console.error('No hay usuario autenticado');
    return null;
  }
  const route = useRoute<MovieDetailsRouteProp>();
  const {movieId} = route.params;
  const [movieData, setMovieData] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Detalles');
  const [liked, setLiked] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isWatched, setIsWatched] = useState(false);
  const snapPoints = useMemo(() => ['25%', '50%'], []); // Define los puntos de altura del BottomSheet

  const handleOpenBottomSheet = useCallback(() => {
    console.log('Abriendo BottomSheet');
    bottomSheetRef.current?.expand(); // Abre el BottomSheet
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close(); // Cierra el BottomSheet
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: Config.TMDB_API_KEY,
              language: 'es-ES',
              append_to_response: 'credits,watch/providers',
            },
          },
        );
        setMovieData(movieRes.data);
        const docRef = doc(
          db,
          'users',
          user.uid,
          'listas',
          'me_gusta',
          'peliculas',
          movieId.toString(),
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log('ya existita');
          setLiked(true); // Ya estaba marcado como favorito
        } else {
          console.log('no existita');
          setLiked(false); // No estaba marcado
        }
        
        const videoRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}/videos`,
          {
            params: {
              api_key: Config.TMDB_API_KEY,
              language: 'es-ES',
            },
          },
        );

        const videoEN = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}/videos`,
          {
            params: {
              api_key: Config.TMDB_API_KEY,
            },
          },
        );

        const videos = videoRes.data.results;

        const youtubeVideo = videos.find(
          (video: any) => video.site === 'YouTube' && video.type === 'Trailer',
        );

        if (youtubeVideo) {
          setVideoUrl(`https://www.youtube.com/watch?v=${youtubeVideo.key}`);
        } else {
          const videosEn = videoEN.data.results;
          const youtubeVideoEn = videosEn.find((v: any) => {
            v.site === 'YouTube' && v.type === 'Trailer';
          });
          if (youtubeVideoEn) {
            setVideoUrl(`https://www.youtube.com/watch?v=${youtubeVideo.key}`);
          }
        }
      } catch (error) {
        console.error(
          'Error al obtener detalles de la película o el video:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);
  // 🔹 useEffect que carga la calificación del usuario
   useEffect(() => {
      const fetchRating = async () => {
        if (!isWatched) {
          setUserRating(null);
          return;
        }
  
        const ratingDoc = await getDoc(doc(db, 'users', user.uid, 'ratings', movieId.toString()));
        if (ratingDoc.exists()) {
          setUserRating(ratingDoc.data()?.rating || null);
        } else {
          setUserRating(null);
        }
      };
  
      fetchRating();
    }, [movieId, user.uid, isWatched]);
    // Escuchar desde la lista "listas/vistos"
      useEffect(() => {
        const ref = doc(db, 'users', user.uid, 'listas', 'vistos');
        const unsubscribe = onSnapshot(ref, (snapshot) => {
          if (snapshot.exists()) {
            const peliculas = snapshot.data().peliculas || [];
            setIsWatched(peliculas.includes(movieId));
          } else {
            setIsWatched(false);
          }
        });
        return () => unsubscribe();
      }, [movieId]);
    
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#E7A325" />
      </SafeAreaView>
    );
  }

  if (!movieData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No se encontraron datos.</Text>
      </SafeAreaView>
    );
  }

  const posterUrl = `https://image.tmdb.org/t/p/original${movieData.poster_path}`;
  const backdropUrl = `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`;

  const director = movieData.credits?.crew?.find(
    (person: any) => person.job === 'Director',
  );

  const countries =
    movieData.production_countries
      ?.map((country: any) => country.name)
      .join(', ')
      .replace('United States of America', 'United States') || 'Desconocido';

  const boliviaProviders = movieData['watch/providers'].results.BO;
  const allProviders = [
    ...(boliviaProviders?.flatrate || []),
    ...(boliviaProviders?.buy || []),
    ...(boliviaProviders?.rent || []),
  ];

  const openTrailer = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl);
    } else {
      Alert.alert('Trailer no disponible', 'No se pudo encontrar el trailer.');
    }
  };
  const docRef = doc(db, 'users', user.uid, 'me_gusta', movieId.toString());

  const uniqueProviders = Array.from(
    new Map(allProviders.map(p => [p.provider_id, p])).values(),
  );

  return (
    <>
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.backdropContainer}>
          <Image source={{uri: backdropUrl}} style={styles.backdropImage} />
          <LinearGradient
            colors={['transparent', '#0D1B2A']}
            locations={[0, 0.9]}
            style={styles.backdropGradient}
          />
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.leftContainer}>
            <View
              style={{
                height: 60,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                marginBottom: 0,
              }}>
              <Text style={styles.title}>{movieData.title}</Text>
            </View>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>
                {movieData.release_date?.substring(0, 4)} • {movieData.runtime}{' '}
                min
              </Text>
              <Text style={styles.metaText}>
                Dirigido por {director?.name || 'Desconocido'}
              </Text>
              <Text style={[styles.metaText, {marginBottom: 1.3}]}>
                {countries}
              </Text>
            </View>

            <View style={styles.botonesContainer}>
              {/* Fila superior: Trailer, Me gusta, Listas */}
              <View style={styles.filaSuperior}>
                <TouchableOpacity style={styles.button} onPress={openTrailer}>
                  <FontAwesome name="play-circle" size={14} color="white" />
                  <Text style={styles.buttonText}>Trailer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.likeButton]}
                  onPress={async () => {
                    console.log('toque el me gusta');
                    const newStatus = !liked;
                    setLiked(newStatus);

                    try {
                      const listRef = doc(
                        db,
                        'users',
                        user.uid,
                        'listas',
                        'me_gusta', // colección fija para favoritos
                      );

                      // Si la lista "me_gusta" no existe aún, créala
                      const listSnap = await getDoc(listRef);
                      if (!listSnap.exists()) {
                        console.log('estoy creando una nueva');
                        await setDoc(listRef, {
                          nombreLista: 'Favoritos',
                          descripcion: 'Películas que te gustan',
                          fechaCreacion: Timestamp.now(),
                        });
                      } else {
                        // Actualiza el array de películas
                        await updateDoc(listRef, {
                          peliculas: newStatus
                            ? arrayUnion(movieId)
                            : arrayRemove(movieId),
                        });
                      }
                      ToastAndroid.show(
                        newStatus
                          ? 'Se agregó a tus favoritos. ❤️'
                          : 'Se eliminó de tus favoritos. ❌',
                        ToastAndroid.SHORT,
                      );
                    } catch (error) {
                      console.error('Error al actualizar favoritos:', error);
                    }
                  }}>
                  <AntDesign
                    name={liked ? 'heart' : 'hearto'}
                    size={14}
                    color={liked ? '#E63946' : 'white'}
                  />
                  <Text style={styles.buttonText}>
                    {liked ? 'Te gusta' : 'Me gusta'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.listButton}
                  onPress={handleOpenBottomSheet} // Abre el BottomSheet
                >
                  <FontAwesome name="list" size={14} color="white" />
                </TouchableOpacity>
              </View>

              {/* Fila inferior: Visto + Ver más tarde */}
              <View style={styles.filaInferior}>
                <Visto
                  movieId={movieId}
                  onToggle={async (watched: boolean) => {
                    setIsWatched(watched);
                    if (!watched) {
                      setUserRating(null);
                      await deleteDoc(doc(db, 'users', user.uid, 'ratings', movieId.toString()));
                    }
                  }}
                />
              </View>

              {/* Sección Calificación */}
              <BotonCalificacion
                rating={userRating}
                isWatched={isWatched}
                onPress={() => setShowRatingModal(true)}
              />

              <CalificarPelicula
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onRated={(value: number) => setUserRating(value)}
                userId={user.uid}
                movieId={movieId}
                initialRating={userRating}
              />

            </View>
          </View>

          <View style={styles.posterWrapper}>
            <Image
              source={
                posterUrl ? {uri: posterUrl} : require('../assets/noPoster.jpg')
              }
              style={styles.posterImage}
            />
            <Text style={{color: 'white', fontSize: 10}}>Puntuación general:</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingValue}>
                {(movieData.vote_average / 2).toFixed(1)}{' '}
                <Text style={styles.ratingMax}>/ 5</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.synopsisContainer}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsisText}>
            {movieData.overview ? movieData.overview : 'Sinopsis no disponible'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Plataformas</Text>
        {uniqueProviders.length > 0 ? (
          <ScrollView
            horizontal
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            style={styles.platformsSection}>
            {uniqueProviders.map(provider => (
              <WatchProvider
                key={provider.provider_id}
                link={provider.link}
                logoUrl={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                name={provider.provider_name}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.synopsisText}>
            No disponible en plataformas de streaming
          </Text>
        )}
        <View style={{marginTop: 0}}>
          <View style={{flexDirection: 'row', marginBottom: 30}}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('Detalles')}>
              <Text
                style={{
                  color: activeTab == 'Detalles' ? '#E7A325' : '#E0E1DD',
                  fontSize: 14,
                  fontWeight: activeTab == 'Detalles' ? '600' : 'normal',
                  paddingVertical: 10,
                }}>
                Detalles
              </Text>
              <View
                style={{
                  height: 2,
                  width: '90%',
                  backgroundColor:
                    activeTab === 'Detalles' ? '#E7A325' : 'transparent',
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
              }}
              onPress={() => setActiveTab('Elenco')}>
              <Text
                style={{
                  color: activeTab == 'Elenco' ? '#E7A325' : '#E0E1DD',
                  fontWeight: activeTab == 'Elenco' ? '600' : 'normal',
                  paddingVertical: 10,
                }}>
                Elenco
              </Text>
              <View
                style={{
                  height: 2,
                  width: '90%',
                  backgroundColor:
                    activeTab === 'Elenco' ? '#E7A325' : 'transparent',
                }}
              />
            </TouchableOpacity>
          </View>

          {activeTab === 'Detalles' ? (
            <View style={{marginLeft: '20'}}>
              <Text style={styles.sectionTitle}> Productoras</Text>
              <Text style={styles.indentedText}>
                {movieData.production_companies
                  ?.map((company: any) => company.name)
                  .join(', ') || 'No disponible'}
              </Text>

              <Text style={styles.sectionTitle}>Fecha de estreno</Text>
              <Text style={styles.indentedText}>
                {movieData.release_date || 'No disponible'}
              </Text>

              <Text style={styles.sectionTitle}>Géneros</Text>
              <Text style={styles.indentedText}>
                {movieData.genres?.map((genre: any) => genre.name).join(', ') ||
                  'No disponible'}
              </Text>

              <Text style={styles.sectionTitle}>Presupuesto</Text>
              <Text style={styles.indentedText}>
                ${movieData.budget?.toLocaleString() || 'No disponible'}
              </Text>

              <Text style={styles.sectionTitle}>Ingresos</Text>
              <Text style={styles.indentedText}>
                ${movieData.revenue?.toLocaleString() || 'No disponible'}
              </Text>
            </View>
          ) : (
            <View>
              {movieData.credits?.cast && movieData.credits.cast.length > 0 ? (
                <View style={styles.twoColumnGrid}>
                  {movieData.credits.cast.slice(0, 200).map((actor: any) => (
                    <View key={actor.cast_id} style={styles.actorColumn}>
                      <Actor
                        name={actor.name}
                        photoUrl={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                            : null
                        }
                        role={actor.character}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.synopsisText}>
                  No hay información del elenco disponible.
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {/* BottomSheet */}
      {showRatingModal === false && (
        <BottomSheet
          snapPoints={snapPoints}
          ref={bottomSheetRef}
          enablePanDownToClose={true}
          index={-1}
          backgroundStyle={{ backgroundColor: '#415A77' }}
        >
          <BottomSheetView style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetContent}>
              <ListasSlide onClose={handleCloseBottomSheet} movieId={movieId} />
            </View>
          </BottomSheetView>
        </BottomSheet>
      )}

    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  calificarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  botonesContainer: {
    marginTop: 4,
    paddingHorizontal: 5,
  },

  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },

  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#0D1B2A',
    flex: 1,
  },
  scrollView: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftContainer: {
    flex: 0.7,
    paddingRight: 8,
  },
  posterWrapper: {
    flex: 0.3,
    alignItems: 'center',
  },
  posterImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    aspectRatio: 2 / 3,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  metaContainer: {
    margin: 7,
    marginLeft: 0,
  },
  metaText: {
    color: '#E0E1DD',
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#778DA9',
    height: 30,
    width: 90,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  listButton: {
    backgroundColor: '#415A77',
    height: 30,
    width: 30,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  likeButton: {
    backgroundColor: '#415A77',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  ratingContainer: {
    marginTop: 8,
    backgroundColor: '#E7A325',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ratingValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingMax: {
    fontSize: 12,
  },
  sectionTitle: {
    color: '#E0E1DD',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
  synopsisContainer: {
    marginBottom: 24,
  },
  synopsisText: {
    color: '#E0E1DD',
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  comingSoon: {
    color: '#778DA9',
    fontStyle: 'italic',
  },
  backdropContainer: {
    position: 'relative',
    width: '100% + 32px',
    height: 220,
    marginBottom: -35,
    marginLeft: -16,
    marginRight: -16,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  platformsSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  indentedText: {
    color: 'white',
    paddingLeft: '30',
    paddingBottom: '8',
  },
  actorCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  actorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  actorName: {
    color: '#E0E1DD',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  actorCharacter: {
    color: '#778DA9',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actorColumn: {
    width: '48%',
    marginBottom: 16,
  },

  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#32455b',
    padding: 16,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: '#32455b', // Color de fondo opaco
    opacity: 1,
    padding: 16,
    borderWidth: 1, // Agrega un borde temporal para depuración
    borderColor: '#0D1B2A', // Color del borde para verificar visibilidad
  },
});

export default MovieDetails;
