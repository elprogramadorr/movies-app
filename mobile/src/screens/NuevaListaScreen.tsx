import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types.ts';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';

const NuevaListaScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [loading, setLoading] = useState(false);

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

      const docRef = doc(collection(db, 'lista')); // Crea referencia con ID generado
      await setDoc(docRef, {
        idLista: docRef.id,
        nombreLista: title,
        descripcion: description,
        fechaCreacion: serverTimestamp(),
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
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
      {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}

      <TouchableOpacity disabled={loading}>
        <Text style={styles.addMovies}>Añadir películas...</Text>
      </TouchableOpacity>
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
});

export default NuevaListaScreen;
