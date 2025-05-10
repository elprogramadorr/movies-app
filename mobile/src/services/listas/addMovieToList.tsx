import { db } from '../../../android/app/src/config/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Añade una película a una lista en Firestore.
 * @param listId ID de la lista en Firestore.
 * @param movieId ID de la película que se añadirá.
 * @returns Promesa que resuelve cuando la película se añade correctamente.
 */
export const addMovieToList = async (listId: string, movieId: string) => {
  try {
    const listRef = doc(db, 'lista', listId); // Referencia al documento de la lista
    const listDoc = await getDoc(listRef); // Obtén el documento de la lista

    if (listDoc.exists()) {
      if (listDoc.data().peliculas) {
        await updateDoc(listRef, {
          peliculas: arrayUnion(movieId), // Agrega el ID de la película al array
        });
        console.log(`Película con ID ${movieId} añadida a la lista con ID ${listId}`);
      } else {
        // Si el campo "peliculas" no existe, crea el campo y agrega la película
        await updateDoc(listRef, {
          peliculas: [movieId], // Crea el campo "peliculas" como un array con el ID de la película
        });
        console.log(`Campo "peliculas" creado y película con ID ${movieId} añadida a la lista con ID ${listId}`);
      }
    } else {
      // Si la lista no existe, lanza un error
      console.error(`La lista con ID ${listId} no existe.`);
      throw new Error(`La lista con ID ${listId} no existe.`);
    }
  } catch (error) {
    console.error('Error al añadir la película a la lista:', error);
    throw error;
  }
};