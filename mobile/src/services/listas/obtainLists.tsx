import {db} from '../../../android/app/src/config/firebaseConfig';
import {collection, getDocs, doc, setDoc} from 'firebase/firestore';

export const obtainLists = async (userID: string): Promise<any[]> => {
  try {
    const listasRef = collection(db, 'users', userID, 'listas');
    const querySnapshot = await getDocs(listasRef);

    // Verificar si "ver_mas_tarde" existe
    const verMasTardeExiste = querySnapshot.docs.some(
      doc => doc.id === 'ver_mas_tarde',
    );

    // Si no existe, crearla
    if (!verMasTardeExiste) {
      const nuevaRef = doc(db, 'users', userID, 'listas', 'ver_mas_tarde');
      await setDoc(nuevaRef, {
        title: 'Ver máis tarde',
        fechaCreacion: new Date(),
        description: 'Películas guardadas para ver luego',
        nombreLista: 'Ver más tarde',
      });
    }

    let lists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtrar listas autogeneradas
    lists = lists.filter(item => {
      return item.id !== 'me_gusta' && item.id !== 'vistos';
    });

    lists.sort((a, b) =>
      a.id === 'ver_mas_tarde' ? -1 : b.id === 'ver_mas_tarde' ? 1 : 0,
    );

    console.log('Listas obtenidas:', lists);
    return lists;
  } catch (error) {
    console.error('Error al obtener las listas:', error);
    throw error;
  }
};
