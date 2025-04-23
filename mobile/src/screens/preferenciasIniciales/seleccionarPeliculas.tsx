import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { fetchMoviesByGenres } from '../../services/movieGenreService';
import styles from './seleccionarPeliculas.styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SeleccionarPeliculasGeneros = ({ route, navigation }: { route: any; navigation: any }) => {
    const { selectedGenres } = route.params; // Obtén los géneros seleccionados desde los parámetros
    const [moviesByGenre, setMoviesByGenre] = useState<{ [key: number]: any[] }>({});
    const [selectedMovies, setSelectedMovies] = useState<number[]>([]); // IDs de películas seleccionadas
    const [error, setError] = useState<string | null>(null);

    // URL base para las imágenes de TMDb
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    
    useEffect(() => {
        const loadMoviesByGenre = async () => {
            try {
                const moviesData: { [key: number]: any[] } = {};
                for (const genre of selectedGenres) {
                    const data = await fetchMoviesByGenres([genre.id]);
                    moviesData[genre.id] = data.results; // Guarda las películas por género
                }
                setMoviesByGenre(moviesData);
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado');
            }
        };

        loadMoviesByGenre();
    }, [selectedGenres]);

    const toggleMovieSelection = (movieId: number) => {
        if (selectedMovies.includes(movieId)) {
            // Si ya está seleccionado, lo deseleccionamos
            setSelectedMovies(selectedMovies.filter((id) => id !== movieId));
        } else {
            // Si no está seleccionado, lo agregamos
            setSelectedMovies([...selectedMovies, movieId]);
        }
    };

    const handleFinalize = () => {
        // Muestra los IDs seleccionados en una alerta (puedes cambiar esto según tus necesidades)
        Alert.alert('Películas seleccionadas', `IDs: ${selectedMovies.join(', ')}`);
        // También puedes navegar a otra pantalla o realizar alguna acción adicional
        navigation.navigate('Home', { selectedMovies: selectedMovies });
    };

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }

    if (!Object.keys(moviesByGenre).length) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Cargando películas...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Películas por Géneros</Text>
            {selectedGenres.map((genre: any) => (
                <View key={genre.id} style={styles.genreSection}>
                    <Text style={styles.genreTitle}>{genre.name}</Text>
                    <FlatList
                        data={moviesByGenre[genre.id]}
                        horizontal
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const isSelected = selectedMovies.includes(item.id); // Verifica si la película está seleccionada
                            return (
                                <TouchableOpacity
                                    style={styles.movieItem}
                                    onPress={() => toggleMovieSelection(item.id)}
                                >
                                    <Image
                                        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
                                        style={styles.poster}
                                    />
                                    {isSelected && (
                                        <View style={styles.selectedOverlay}>
                                            <Icon name="emoji-emotions" size={30} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            ))}
            <View style={styles.finalizeButtonContainer}>
                <Button title="Finalizar" onPress={handleFinalize} color="#007BFF" />
            </View>
        </ScrollView>
    );
};

export default SeleccionarPeliculasGeneros;