import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { fetchMoviesByGenres } from '../../services/movieGenreService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SeleccionarPeliculasGeneros = ({ route }: { route: any }) => {
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#0D1B2A',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#EFEFEF',
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
        color: '#EFEFEF',
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    genreSection: {
        marginBottom: 24,
    },
    genreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#EFEFEF',
    },
    movieItem: {
        marginRight: 16,
        alignItems: 'center',
        position: 'relative',
    },
    poster: {
        width: 120,
        height: 180,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 5,
    },
});

export default SeleccionarPeliculasGeneros;