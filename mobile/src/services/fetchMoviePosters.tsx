import CONFIG from '../config/config';

/**
 * Obtiene los poster_path de un array de IDs de películas.
 * @param movieIds Array de IDs de películas.
 * @returns Array de poster_path.
 */
export const fetchMoviePosters = async (movieIds: number[]): Promise<string[]> => {
  if (!Array.isArray(movieIds) || movieIds.length === 0) {
    console.error('El array de IDs de películas no es válido.');
    return [];
  }

  try {
    const posters = await Promise.all(
      movieIds.map(async (id) => {
        const response = await fetch(`${CONFIG.API_BASE_URL}/movie/${id}?language=es`, {
          method: 'GET',
          headers: {
            Authorization: `${CONFIG.API_KEY}`, // Usa Bearer si tu API Key requiere este formato
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener los datos de la película con ID ${id}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.poster_path; // Devuelve solo el poster_path
      })
    );
    return posters;
  } catch (error) {
    console.error('Error al obtener los posters:', error);
    throw error;
  }
};