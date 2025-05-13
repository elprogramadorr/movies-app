import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { fetchGenres } from '../../services/genresServices';
import styles from './seleccionarGustos.styles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types'; // Asegúrate de importar el tipo
import { getFirestore, collection, doc, setDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

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
        } else if (selectedGenres.length < 3) {
            // Si no está seleccionado y no se ha alcanzado el máximo, lo agregamos
            setSelectedGenres([...selectedGenres, id]);
        } else {
            // Si ya hay 3 géneros seleccionados, no permitimos agregar más
            Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 3 géneros.');
        }
    };

    const saveGenresToFirestore = async () => {
        const auth = getAuth(); // Obtén la instancia de autenticación
        const user = auth.currentUser; // Obtén el usuario autenticado
        if (!user) {
            Alert.alert('Error', 'No se encontró un usuario autenticado.');
            return;
        }
        try {
            const firestore = getFirestore(); // Obtén la instancia de Firestore
            const userDoc = doc(collection(firestore, 'users'), user.uid); // Referencia al documento del usuario
            await setDoc(
                userDoc,
                {
                    selectedGenres, // Guarda los géneros seleccionados
                },
                { merge: true } // Combina con los datos existentes
            );
            console.log('Géneros guardados en Firestore');
        } catch (error) {
            console.error('Error al guardar los géneros en Firestore:', error);
            Alert.alert('Error', 'No se pudieron guardar los géneros.');
        }
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

    const handleNext = async () => {
        if (selectedGenres.length < 3) {
            Alert.alert('Debes seleccionar al menos 3 géneros.');
            return;
        }
        try {
            await saveGenresToFirestore(); // Guarda los géneros en Firestore
            const selectedGenresData = genres.filter((genre) => selectedGenres.includes(genre.id));
            navigation.navigate('seleccionarPeliculasGeneros', { selectedGenres: selectedGenresData });
        } catch (error) {
            console.error('Error al guardar los géneros antes de navegar:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Preferencias iniciales</Text>
            <Text style={styles.textTitle}>Selecciona tus géneros favoritos</Text>
            <FlatList
                data={genres}
                renderItem={renderGenre}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2} // Muestra dos botones por fila
                columnWrapperStyle={styles.row} // Estilo para las filas
            />
            <Text style={styles.text}>Selecciona 3 generos</Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Siguiente</Text>
            </TouchableOpacity>
        </View>
    );
};

export default GenresScreen;