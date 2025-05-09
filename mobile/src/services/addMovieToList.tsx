import { db } from '../../android/app/src/config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Añade una película a una lista en Firestore.
 * @param listId ID de la lista en Firestore.
 * @param movieId ID de la película que se añadirá.
 * @returns Promesa que resuelve cuando la película se añade correctamente.
 */
export const addMovieToList = async (listId: string, movieId: number) => {
  try {
    const docRef = await addDoc(collection(db, `listas/${listId}/peliculas`), {
      movieId,
      addedAt: serverTimestamp(), // Marca de tiempo de cuándo se añadió
    });
    console.log('Película añadida con éxito:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al añadir la película a la lista:', error);
    throw error;
  }
};