import { db } from '../../android/app/src/config/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

/**
 * Elimina una película de una lista en Firestore.
 * @param listId ID de la lista en Firestore.
 * @param movieDocId ID del documento de la película en la subcolección.
 * @returns Promesa que resuelve cuando la película se elimina correctamente.
 */
export const deleteMovieFromList = async (listId: string, movieDocId: string) => {
  try {
    const docRef = doc(db, `listas/${listId}/peliculas/${movieDocId}`);
    await deleteDoc(docRef);
    console.log('Película eliminada con éxito:', movieDocId);
  } catch (error) {
    console.error('Error al eliminar la película de la lista:', error);
    throw error;
  }
};