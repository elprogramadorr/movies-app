import CONFIG from '../config/config';
import { Movie, RecommendationResponse,RecommendationSection } from '../types';

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
       // preferred_genres: selectedGenres,
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
  // En recommendationServices.tsx
  export const updateRecommendations = async (
    currentLikedMovies: number[],
    newLikedMovie: number,
    options?: { limit?: number }
  ): Promise<Movie[]> => {
    try {
      const response = await fetch('http://10.0.2.2:8000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_movies: [...currentLikedMovies, newLikedMovie],
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

  export const fetchPersonalizedRecommendations = async (
   selectedMovies: number[] = [], 
  likedMovies: number[] = [],
  watchedMovies: number[] = [],
  ratedMovies: Array<{movie_id: number, rating: number}> = [],
  options?: { limit?: number }
): Promise<RecommendationResponse> => {
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

   const data = await response.json(); // Obtener la respuesta cruda del backend

    // --- ¡TRANSFORMACIÓN CRUCIAL AQUÍ! ---
    // Mapear la sección 'recommendations' principal
    const mappedRecommendations: Movie[] = (data.recommendations || []).map((rec: any) => ({
      id: rec.movie_id, // Asigna movie_id a id
      title: rec.title,
      poster_path: rec.poster_path,
      backdrop_path: rec.backdrop_path,
      vote_average: rec.similarity_score * 10 / 2, // Tu lógica de conversión de score
      overview: rec.overview || '',
      release_date: rec.release_date || '',
      genre_ids: rec.genre_ids, // Asegúrate de incluirlo si viene
      popularity: rec.popularity, // Asegúrate de incluirlo si viene
    }));

    // Mapear las películas dentro de cada subsección de 'sections'
    const mappedSections: { [key: string]: RecommendationSection } = {};
    if (data.sections) {
      for (const sectionKey in data.sections) {
        if (data.sections.hasOwnProperty(sectionKey)) {
          const originalSection = data.sections[sectionKey];
          // Solo si originalSection y originalSection.movies existen, procedemos al mapeo
          if (originalSection && originalSection.movies) {
            mappedSections[sectionKey] = {
              title: originalSection.title,
              movies: originalSection.movies.map((movieData: any) => ({
                id: movieData.movie_id, // <--- ¡Aquí está el cambio clave para las secciones!
                title: movieData.title,
                poster_path: movieData.poster_path,
                backdrop_path: movieData.backdrop_path,
                vote_average: movieData.vote_average, // El backend ya devuelve vote_average directamente aquí
                overview: movieData.overview || '',
                release_date: movieData.release_date || '',
                genre_ids: movieData.genre_ids,
                popularity: movieData.popularity,
              })) as Movie[],
              // Copia otras propiedades de la sección si existen y son relevantes
              reference_movie: originalSection.reference_movie,
              reference_movies: originalSection.reference_movies,
            };
          }
        }
      }
    }

    // Devolver la respuesta con los datos mapeados a la estructura 'Movie' esperada
    return {
      recommendations: mappedRecommendations,
      sections: mappedSections,
      generated_at: data.generated_at,
      algorithm_version: data.algorithm_version,
    };
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    throw error;
  }
};