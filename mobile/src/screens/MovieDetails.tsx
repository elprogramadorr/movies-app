import React, {useEffect, useState} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  Button,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from 'react-native-config';
import axios from 'axios';

import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../utils/types';

type MovieDetailsRouteProp = RouteProp<RootStackParamList, 'MovieDetails'>;

const MovieDetails = () => {
  const route = useRoute<MovieDetailsRouteProp>();
  const {movieId} = route.params;
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: Config.TMDB_API_KEY,
              language: 'es-ES',
              append_to_response: 'credits',
            },
          },
        );
        console.log(response);
        setMovieData(response.data);
        console.log(movieData);
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
        <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>
          Cargando...
        </Text>
      </SafeAreaView>
    );
  }

  if (!movieData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>
          No se encontraron datos.
        </Text>
      </SafeAreaView>
    );
  }

  const posterUrl = `https://image.tmdb.org/t/p/original${movieData.poster_path}`;
  const director = movieData.credits?.crew?.find(
    (person: any) => person.job === 'Director',
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.title}>{movieData.title}</Text>
            <Text style={styles.director}>
              {movieData.release_date?.substring(0, 4)} - Dirigido por{' '}
              {director?.name || 'Desconocido'}
            </Text>
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
          <View style={styles.posterContainer}>
            <Image source={{uri: posterUrl}} style={styles.posterImage} />
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Puntuación:</Text>
              <Text style={styles.ratingValue}>
                {(movieData.vote_average / 2).toFixed(1)} / 5
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.synopsisContainer}>
          <Text style={styles.synopsisTitle}>Sinopsis</Text>
          <Text style={styles.synopsisText}>{movieData.overview}</Text>
        </View>
        <Text style={{color: 'white'}}>Plataformas </Text>
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
    padding: 12,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContainer: {
    flex: 0.6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 12,
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
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  director: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 12,
  },
  posterContainer: {
    flex: 0.4,
    alignItems: 'center',
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 4,
  },
  ratingContainer: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#E7A325',
    borderRadius: 4,
    padding: 8,
    width: 104,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
  },
  ratingValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  synopsisContainer: {
    marginTop: 20,
  },
  synopsisTitle: {
    color: '#E0E1DD',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 10,
  },
  synopsisText: {
    color: '#E0E1DD',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
  },
};

export default MovieDetails;
