import CONFIG from '../config/config';

// Función para obtener películas similares
export const fetchSimilarMovies = async (movieId: number, language: string = 'es', page: number = 1) => {
    try {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/similar?language=${language}&page=${page}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: CONFIG.API_KEY, 
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar las películas similares:', error);
        throw error;
    }
};