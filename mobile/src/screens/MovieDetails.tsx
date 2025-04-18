import React, {useEffect, useState} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from 'react-native-config';
import axios from 'axios';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types';
import LinearGradient from 'react-native-linear-gradient';
import WatchProvider from '../components/WatchProvider';

type MovieDetailsRouteProp = RouteProp<RootStackParamList, 'MovieDetails'>;

const MovieDetails = () => {
  const route = useRoute<MovieDetailsRouteProp>();
  const {movieId} = route.params;
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('API KEY:', Config.TMDB_API_KEY);
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: Config.TMDB_API_KEY,
              language: 'es-ES',
              append_to_response: 'credits,watch/providers',
            },
          },
        );
        setMovieData(response.data);
      } catch (error) {
        console.error('Error al obtener detalles de la película:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
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
  console.log('datos brutos');
  console.log(boliviaProviders);
  const allProviders = [
    ...(boliviaProviders?.flatrate || []),
    ...(boliviaProviders?.buy || []),
    ...(boliviaProviders?.rent || []),
  ];
  console.log(allProviders);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.backdropContainer}>
          <Image source={{uri: backdropUrl}} style={styles.backdropImage} />
          <LinearGradient
            colors={['transparent', '#0D1B2A']}
            locations={[0, 0.9]} // La transición comienza desde arriba y termina al 60%
            style={styles.backdropGradient}
          />
        </View>
        <View style={styles.mainContainer}>
          {/* Información a la izquierda */}
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

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.button}>
                <FontAwesome name="play-circle" size={14} color="white" />
                <Text style={styles.buttonText}>Trailer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.likeButton]}>
                <AntDesign name="heart" size={14} color="#E63946" />
                <Text style={styles.buttonText}>Te gusta</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Póster a la derecha con margen */}
          <View style={styles.posterWrapper}>
            <Image source={{uri: posterUrl}} style={styles.posterImage} />
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
          <Text style={styles.synopsisText}>{movieData.overview}</Text>
        </View>

        <Text style={styles.sectionTitle}>Plataformas</Text>
        <ScrollView
          horizontal
          bounces={false}
          overScrollMode="never"
          style={styles.platformsSection}>
          {/* <WatchProvider
            link="https://www.netflix.com"
            logoUrl="https://image.tmdb.org/t/p/w500/9ghgSC0MA082EL6HLCW3GalykFD.jpg"
            name="Netflix"
          /> */}
          {allProviders.map(provider => {
            console.log(provider);
            return (
              <WatchProvider
                key={provider.provider_id}
                link={provider.link}
                logoUrl={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                name={provider.provider_name}
              />
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
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
    paddingRight: 12,
  },
  posterWrapper: {
    flex: 0.3,
    alignItems: 'center', // <--- CAMBIO AQUÍ
  },

  posterImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    aspectRatio: 2 / 3,
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
    width: '100% + 32px', // Compensa el padding del ScrollView (16px a cada lado)
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
    height: '40%', // Ajusta el tamaño del gradiente según lo que necesites
  },
  platformsSection: {
    flexDirection: 'row',
    marginBottom: 100,
  },
};

export default MovieDetails;
