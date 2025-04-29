import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { fetchMoviesByGenres } from '../../services/movieGenreService';
import styles from './seleccionarPeliculas.styles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const SeleccionarPeliculasGeneros = ({ route, navigation }: { route: any; navigation: any }) => {
    const { selectedGenres } = route.params;
    const [moviesByGenre, setMoviesByGenre] = useState<{ [key: number]: any[] }>({});
    const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    useEffect(() => {
        const loadMoviesByGenre = async () => {
            try {
                const moviesData: { [key: number]: any[] } = {};
                const seenMovies = new Set<number>();

                for (const genre of selectedGenres) {
                    const data = await fetchMoviesByGenres([genre.id]);
                    const uniqueMovies = data.results.filter((movie: any) => {
                        if (seenMovies.has(movie.id)) {
                            return false;
                        }
                        seenMovies.add(movie.id);
                        return true;
                    });
                    moviesData[genre.id] = uniqueMovies;
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
            setSelectedMovies(selectedMovies.filter((id) => id !== movieId));
        } else if (selectedMovies.length < 5) {
            setSelectedMovies([...selectedMovies, movieId]);
        } else {
            Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 5 películas.');
        }
    };

    const handleFinalize = () => {
        if (selectedMovies.length < 1) {
            Alert.alert('Selecciona al menos 1 película.');
            return;
        }
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
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Preferencias Iniciales</Text>
                <Text style={styles.textTitle}>Selecciona tus películas favoritas</Text>
                {selectedGenres.map((genre: any) => (
                    <View key={genre.id} style={styles.genreSection}>
                        <Text style={styles.genreTitle}>{genre.name}</Text>
                        <FlatList
                            data={moviesByGenre[genre.id]}
                            horizontal
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => {
                                const isSelected = selectedMovies.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        style={styles.movieItem}
                                        onPress={() => toggleMovieSelection(item.id)}
                                    >
                                        <View>
                                            <Image
                                                source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
                                                style={[
                                                    styles.poster,
                                                    isSelected && { opacity: 0.4 }, // Aplica opacidad si está seleccionada
                                                ]}
                                            />
                                            {isSelected && (
                                                <View style={styles.selectedOverlay}>
                                                    <FontAwesome name="smile-o" size={40} color="#E0E1DD" />
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                ))}
            </ScrollView>
            <View style={styles.finalizeButtonContainer}>
                <Text style={styles.text}>Selecciona máximo 5 películas</Text>
                <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
                    <Text style={styles.finalizeButtonText}>Finalizar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SeleccionarPeliculasGeneros;