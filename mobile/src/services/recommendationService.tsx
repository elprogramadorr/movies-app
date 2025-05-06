import CONFIG from '../config/config';
import { Movie, RecommendationsResponse } from '../types';

interface RecommendationRequest {
        selected_movies: number[];
        //liked_movies?: number[];
        //search_history?: string[];
        //preferred_genres?: number[];
        limit?: number;
    }

  export const fetchRecommendations = async (
    selectedMovies: number[],
    //selectedGenres: number[] = [],
    //likedMovies: number[] = [],
    //searchHistory: string[] = []
    options?: {
      limit?: number;
  }
  ): Promise<Movie[]> => {
    try {
      const response = await fetch('http://10.0.2.2:8000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        selected_movies: selectedMovies,
        //preferred_genres: selectedGenres,
        //liked_movies: likedMovies,
       // search_history: searchHistory,
       limit: options?.limit || 20
        })
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      // Transformar los datos del backend al formato que espera el frontend
      return data.recommendations.map((rec: any) => ({
        id: rec.movie_id,
        title: rec.title,
        poster_path: rec.poster_path,
        backdrop_path: rec.backdrop_path,
        vote_average: rec.similarity_score * 10 / 2, // Convertir similarity_score a escala de votos
        overview: rec.overview || '',
        release_date: rec.release_date || ''
      })) as Movie[];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  };