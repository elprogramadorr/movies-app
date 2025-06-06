import CONFIG from '../config/config';
import { Movie, RecommendationResponse,RecommendationSection } from '../types';

interface RecommendationRequest {
        selected_movies: number[];
        limit?: number;
    }

  export const fetchRecommendations = async (
    selectedMovies: number[],
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
  // En recommendationServices.tsx
  export const updateRecommendations = async (
    selectedMovies: number[] = [], 
    likedMovies: number[] = [],
    watchedMovies: number[] = [],
    ratedMovies: Array<{movie_id: number, rating: number}> = [],
    options?: { limit?: number }
  ): Promise<Movie[]> => {
    try {
      const response = await fetch('http://10.0.2.2:8000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_movies: selectedMovies,
        liked_movies: likedMovies,
        watched_movies: watchedMovies,
        rated_movies: ratedMovies,
        limit: options?.limit || 20
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.recommendations.map((rec: any) => ({
        id: rec.movie_id,
        title: rec.title,
        poster_path: rec.poster_path,
        backdrop_path: rec.backdrop_path,
        vote_average: rec.similarity_score * 10 / 2,
        overview: rec.overview || '',
        release_date: rec.release_date || ''
      })) as Movie[];
    } catch (error) {
      console.error('Error updating recommendations:', error);
      throw error;
    }
  };
