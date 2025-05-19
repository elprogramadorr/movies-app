export type RootStackParamList = {
    Splash: undefined;
    Home: { selectedMovies: number[] };
    PantallaBusqueda: undefined;
    GenresScreen: undefined;
    seleccionarPeliculasGeneros: { selectedGenres: any[] };
    MovieDetails: { movieId: number };

    CategoryScreen: {
      categoryId: number;
      categoryName: string;
      movies: Movie[]; // Usamos la interfaz Movie que ya tienes
    };

    MisListasScreen: undefined;
    AddMoviesList: { listId: string };
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
  
  export interface RecommendationsResponse {
    recommendations: Movie[];
  }
  
  export interface PopularMoviesResponse {
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;
  }
  