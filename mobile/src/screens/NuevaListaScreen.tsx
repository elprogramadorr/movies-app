import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types.ts';
import {collection, doc, setDoc, serverTimestamp, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../android/app/src/config/firebaseConfig';
import {Image} from 'react-native';
import {useAuthStore} from '../store/useAuthStore';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const NuevaListaScreen = () => {
  const user = useAuthStore(state => state.user);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<
    {id: number; poster_path: string}[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [privada, setPrivada] = useState(true);

  const handleTitleChange = (text: string) => {
    if (text.length <= 25) {
      setTitle(text);
      setTitleError('');
    } else {
      setTitleError('Máximo 25 caracteres');
    }
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= 500) {
      setDescription(text);
      setDescriptionError('');
    } else {
      setDescriptionError('Máximo 500 caracteres');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);

      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }
      const listasRef = collection(db, 'users', user.uid, 'listas');
      const q = query(listasRef, where('nombreLista', '==', title.trim()));
      const querySnapshot = await getDocs(q);

      if(title.trim() == "Ver más tarde" || title.trim() == "Favoritos" || title.trim() == "Vistos" || title.trim() == "vistos") {
        setTitleError('No puedes usar ese nombre para una lista personalizada');
        setLoading(false);
        return;
      }

      if (!querySnapshot.empty) {
        setTitleError('Ya existe una lista con ese nombre');
        setLoading(false);
        return;
      }

      const docRef = doc(collection(db, 'users', user.uid, 'listas'));
      await setDoc(docRef, {
        idLista: docRef.id,
        nombreLista: title,
        descripcion: description,
        peliculas: selectedMovies.map(movie => movie.id),
        fechaCreacion: serverTimestamp(),
        privada: privada,
      });

      Alert.alert('Éxito', 'Lista guardada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar la lista:', error);
      Alert.alert('Error', 'No se pudo guardar la lista');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedMovie = ({
    item,
  }: {
    item: {id: number; poster_path: string};
  }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{uri: `${IMAGE_BASE_URL}${item.poster_path}`}}
        style={styles.poster}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <FontAwesome name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva lista</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <FontAwesome name="check" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        placeholderTextColor="#A1A1A1"
        value={title}
        onChangeText={handleTitleChange}
      />
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción..."
        placeholderTextColor="#A1A1A1"
        multiline
        value={description}
        onChangeText={handleDescriptionChange}
      />
      {descriptionError ? (
        <Text style={styles.errorText}>{descriptionError}</Text>
      ) : null}
      <View style={styles.privacyContainer}>
        <Text style={styles.privacyLabel}>Visibilidad de la lista:</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {backgroundColor: privada ? '#3B3B98' : '#26A69A'},
          ]}
          onPress={() => setPrivada(!privada)}>
          <Text style={styles.toggleButtonText}>
            {privada ? 'Privada' : 'Pública'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedMovies.length > 0 ? (
        <FlatList
          data={selectedMovies}
          keyExtractor={item => item.id.toString()}
          renderItem={renderSelectedMovie}
          numColumns={3}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <TouchableOpacity
          disabled={loading}
          onPress={() =>
            navigation.navigate('AddMoviesList', {
              selectedMovies, // Pasar las películas seleccionadas
              setSelectedMovies: (
                updatedMovies: {id: number; poster_path: string}[],
              ) => {
                setSelectedMovies(updatedMovies); // Actualizar las películas seleccionadas al regresar
              },
            })
          }>
          <Text style={styles.addMovies}>Añadir películas...</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01161E',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#A1A1A1',
    color: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addMovies: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorText: {
    color: '#D9534F',
    marginBottom: 8,
  },
  grid: {
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1 / 3,
    margin: 5,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 10,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  privacyLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 10,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default NuevaListaScreen;
