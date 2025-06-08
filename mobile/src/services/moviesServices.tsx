import CONFIG from '../config/config';
import { Movie, PopularMoviesResponse } from '../types';

export const fetchMovieById = async (movieId: number, language: string = 'es') => {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/movie/${movieId}?language=${language}`, {
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

export const fetchPopularMovies = async (language: string = 'es', page: number = 1): Promise<Movie[]> => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/movie/popular?language=${language}&page=${page}`, {
        method: 'GET',
        headers: {
          Authorization: CONFIG.API_KEY,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data: PopularMoviesResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error al cargar películas populares:', error);
      throw error;
    }
  };
  
  export const fetchSimilarMovies = async (movieId: number, language: string = 'es', page: number = 1): Promise<PopularMoviesResponse> => {
    try {
      const url = `${CONFIG.API_BASE_URL}/movie/${movieId}/similar?language=${language}&page=${page}`;
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
  
      return await response.json();
    } catch (error) {
      console.error('Error al cargar películas similares:', error);
      throw error;
    }
  };