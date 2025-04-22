import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { fetchGenres } from '../../services/genresServices';
import styles from './seleccionarGustos.styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types'; // Asegúrate de importar el tipo

const GenresScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [genres, setGenres] = useState<any[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]); // IDs de géneros seleccionados
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

    const toggleGenreSelection = (id: number) => {
        if (selectedGenres.includes(id)) {
            // Si ya está seleccionado, lo deseleccionamos
            setSelectedGenres(selectedGenres.filter((genreId) => genreId !== id));
        } else {
            // Si no está seleccionado, lo agregamos
            setSelectedGenres([...selectedGenres, id]);
        }
    };
    const handleNext = () => {
        console.log('Géneros seleccionados:', selectedGenres); // Muestra los géneros seleccionados en la consola
        const selectedGenresData = genres.filter((genre) => selectedGenres.includes(genre.id));
        navigation.navigate('seleccionarPeliculasGeneros', { selectedGenres: selectedGenresData });
    };

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

    const renderGenre = ({ item }: { item: any }) => {
        const isSelected = selectedGenres.includes(item.id); // Verifica si el género está seleccionado
        return (
            <TouchableOpacity
                style={[
                    styles.genreButton,
                    isSelected && styles.genreButtonSelected, // Aplica estilo si está seleccionado
                ]}
                onPress={() => toggleGenreSelection(item.id)}
            >
                <Text style={styles.genreText}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

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
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Siguiente</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GenresScreen;