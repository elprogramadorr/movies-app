import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { fetchGenres } from '../../services/genresServices';
import styles from './seleccionarGustos.styles';

const GenresScreen = () => {
    const [genres, setGenres] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const data = await fetchGenres(); // Llama al servicio para obtener los géneros
                setGenres(data.genres); // Accede a la propiedad "genres" del JSON
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado');
            }
        };

        loadGenres();
    }, []);

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Error: {error}</Text>
            </View>
        );
    }

    if (!genres.length) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Cargando géneros...</Text>
            </View>
        );
    }

    const renderGenre = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.genreButton}>
            <Text style={styles.genreText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona tus géneros favoritos</Text>
            <FlatList
                data={genres}
                renderItem={renderGenre}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2} // Muestra dos botones por fila
                columnWrapperStyle={styles.row} // Estilo para las filas
            />
        </View>
    );
};

export default GenresScreen;