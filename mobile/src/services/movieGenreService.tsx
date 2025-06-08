import CONFIG from '../config/config';

export const fetchMoviesByGenres = async (genreIds: number[], language: string = 'en-US', page: number = 1) => {
    try {
        // Convierte los IDs de los géneros en una cadena separada por comas
        const genresParam = genreIds.join(',');

        // Construye la URL con los parámetros
        const url = `${CONFIG.API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=${language}&page=${page}&sort_by=popularity.desc&with_genres=${genresParam}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: CONFIG.API_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar las películas:', error);
        throw error;
    }
};