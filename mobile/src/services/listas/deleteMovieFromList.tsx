import { db } from '../../../android/app/src/config/firebaseConfig';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';

/**
 * Elimina una película del arreglo `peliculas` en Firestore.
 * @param listId ID de la lista en Firestore.
 * @param movieId ID de la película que se eliminará.
 * @returns Promesa que resuelve cuando la película se elimina correctamente.
 */
export const deleteMovieFromList = async (listId: string, movieId: string) => {
  try {
    const listRef = doc(db, 'lista', listId); // Referencia al documento de la lista
    await updateDoc(listRef, {
      peliculas: arrayRemove(movieId), // Elimina el ID de la película del arreglo
    });
    console.log(`Película con ID ${movieId} eliminada de la lista con ID ${listId}`);
  } catch (error) {
    console.error('Error al eliminar la película de la lista:', error);
    throw error;
  }
};