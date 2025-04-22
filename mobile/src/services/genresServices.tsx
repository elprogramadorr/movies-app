import CONFIG from '../config/config';

export const fetchGenres = async (language: string = 'es') => {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/genre/movie/list?language=${language}`, {
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
        console.error('Error al cargar la película:', error);
        throw error;
    }
};