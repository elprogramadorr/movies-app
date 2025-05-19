import { db } from '../../../android/app/src/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Obtiene todas las listas de Firestore.
 * @returns Promesa que resuelve con un array de listas.
 */
export const obtainLists = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'lista'));
    const lists = querySnapshot.docs.map((doc) => ({
      id: doc.id, // ID del documento
      ...doc.data(), // Datos del documento
    }));
    console.log('Listas obtenidas:', lists); // Verifica las listas en la consola
    return lists;
  } catch (error) {
    console.error('Error al obtener las listas:', error);
    throw error;
  }
};