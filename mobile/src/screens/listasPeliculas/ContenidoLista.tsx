import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Image, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from './ContenidoLista.styles';
import {fetchMoviePosters} from '../../services/fetchMoviePosters';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const ContenidoLista: React.FC = () => {
  const route = useRoute();
  let {nombreLista, descripcion, tiempoCreacion, peliculas, privada} =
    route.params as {
      nombreLista: string;
      descripcion: string;
      tiempoCreacion: string;
      peliculas: number[];
      privada: boolean;
    };

  if (privada == undefined) {
    privada = true;
  }
  const navigation = useNavigation();
  const [moviePosters, setMoviePosters] = useState<string[]>([]); // Array de poster_path

  useEffect(() => {
    console.log('ContenidoLista - peliculas:', nombreLista);
    if (!peliculas || peliculas.length === 0) {
      console.log('El array de películas está vacío o no es válido.');
      return;
    }

    const loadPosters = async () => {
      try {
        const posters = await fetchMoviePosters(peliculas); // Llama al servicio
        setMoviePosters(posters);
      } catch (error) {
        console.error('Error al cargar los posters:', error);
      }
    };

    loadPosters();
  }, [peliculas]);

  const renderItem = ({item, index}: {item: string; index: number}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MovieDetails', {movieId: peliculas[index]})
      }>
      <View style={styles.posterContainer}>
        <Image
          source={{uri: `${IMAGE_BASE_URL}${item}`}} // Usa el poster_path obtenido del servicio
          style={styles.poster}
        />
        <Text style={styles.posterNumber}>{index + 1}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{nombreLista}</Text>
      </View>

      {/* Contenido */}
      <Text style={styles.description}>{descripcion}</Text>
      <Text style={styles.creationTime}>Creado el: {tiempoCreacion}</Text>
      <Text style={styles.visibility}>
        Visibilidad: {privada ? 'Privada 🔒' : 'Pública 🌐'}
      </Text>

      {/* Lista de películas */}
      <FlatList
        data={moviePosters}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={4} // 4 posters por fila
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay películas en esta lista.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ContenidoLista;
