export type RootStackParamList = {
    Splash: undefined;
    Home: { selectedMovies: number[] };
    PantallaBusqueda: undefined;
    GenresScreen: undefined;
    seleccionarPeliculasGeneros: { selectedGenres: any[] };
    MovieDetails: { movieId: number };
    MisListasScreen: undefined;
    AddMoviesList: { listId: string };
    CategoryScreen: {
      categoryId: number;
      categoryName: string;
      movies: Movie[];
    };
  };
    export interface Movie {
    id: number;
    title: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average: number;
    overview?: string;
    release_date?: string;
    genre_ids?: number[];
    popularity?: number;
  }
  
  export interface Genre {
    id: number;
    name: string;
  }
  
  export interface MovieDetails extends Movie {
    runtime?: number;
    genres?: Genre[];
    imdb_id?: string;
  }
  export interface RecommendationSection {
  title: string;
  movies: Movie[];
  reference_movies?: number[];
  reference_movie?: number;
 }
  export interface RecommendationsResponse {
    recommendations: Movie[];
  }
  
  export interface PopularMoviesResponse {
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;
  }
  export interface RecommendationResponse {
  recommendations: Movie[];
  sections: {
    based_on_likes?: RecommendationSection;
    based_on_last_liked?: RecommendationSection;
    based_on_watched?: RecommendationSection;
    based_on_last_watched?: RecommendationSection;
    based_on_high_rated?: RecommendationSection;
  };
  generated_at: string;
  algorithm_version: string;
}
export interface RecommendationSections {
  based_on_likes?: RecommendationSection;
  based_on_last_liked?: RecommendationSection;
  based_on_watched?: RecommendationSection;
  based_on_last_watched?: RecommendationSection;
  based_on_high_rated?: RecommendationSection;
}