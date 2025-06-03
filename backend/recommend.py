import requests
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Any
import numpy as np
from backend.schemas import MovieFeatures
from backend.tmdb_client import tmdb_client

class ContentBasedRecommender:
    """Recomendador basado en contenido para películas usando TMDB."""
    def __init__(self, tmdb_client_instance): 
       
        self.base_url = "https://api.themoviedb.org/3"
        self.tmdb = tmdb_client_instance
        self.tmdb_api_key = tmdb_client_instance.api_key
        self.movie_features_cache: Dict[int, Dict[str, Any]] = {}

    def _get_movie_features(self, movie_id: int):
        """Obtiene características de una película desde TMDB usando tmdb_client."""
        if movie_id in self.movie_features_cache:
            return self.movie_features_cache[movie_id]

        try:
            movie_data = self.tmdb.get_movie_details(movie_id)
            if not movie_data:
                return None

            genres = [genre["name"] for genre in movie_data.get("genres", [])]
            # Las keywords ya vienen con append_to_response
            keywords = [kw["name"] for kw in movie_data.get("keywords", {}).get("keywords", [])]

            features = {
                "id": movie_id,
                "title": movie_data.get("title", "Unknown"), # Obtener el título aquí
                "genres": "|".join(genres),
                "keywords": "|".join(keywords),
                "vote_average": movie_data.get("vote_average", 0),
                "popularity": movie_data.get("popularity", 0),
                "poster_path": movie_data.get("poster_path"),
                "backdrop_path": movie_data.get("backdrop_path"),
                "overview": movie_data.get("overview", ""),
                "release_date": movie_data.get("release_date", "")
            }
            self.movie_features_cache[movie_id] = features
            return features
        except Exception as e:
            print(f"Excepción al obtener película {movie_id}: {str(e)}")
            return None

    def _build_feature_matrix(self, movies: List[int]):
        """Construye una matriz de características para las películas."""
        features = []
        for movie_id in movies:
            movie_features = self._get_movie_features(movie_id)
            if movie_features:
                features.append(movie_features)
        return features

    def _compute_similarity(self, target_features, candidate_features):
        """Calcula similitud del coseno entre películas."""
        # Combina géneros y keywords para TF-IDF
        target_text = f"{target_features['genres']} {target_features['keywords']}"
        candidate_text = f"{candidate_features['genres']} {candidate_features['keywords']}"

        # Vectorización TF-IDF
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([target_text, candidate_text])

        # Similitud del coseno
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        # Pondera con popularidad y rating (ajustable)
        popularity_weight = 0.2
        rating_weight = 0.3

        weighted_similarity = (
            similarity * 0.5 + 
            (candidate_features["popularity"] / 100) * popularity_weight +
            (candidate_features["vote_average"] / 10) * rating_weight
        )

        return weighted_similarity

    def get_initial_recommendations(
            self,
            selected_movies: List[int],
            limit: int = 20
        ):
        if not selected_movies:
            return []

        # Obtiene características de las películas seleccionadas (ya usa el caché)
        target_features_list = self._build_feature_matrix(selected_movies)

        # Obtiene películas candidatas (películas populares como base)
        candidate_movie_ids = self._get_popular_movies()

        # Obtiene características de todas las películas candidatas de una vez
        # Esto es crucial: todas las llamadas a _get_movie_features para candidatos
        # se benefician del caché y de la única llamada optimizada.
        candidate_features_list = self._build_feature_matrix(candidate_movie_ids)

        print(f"Películas objetivo: {len(target_features_list)}")
        print(f"Películas candidatas procesadas: {len(candidate_features_list)}")

        recommendations = []
        for candidate_features in candidate_features_list:
            if candidate_features["id"] in selected_movies:
                continue

            max_similarity = 0
            for target_features in target_features_list:
                similarity = self._compute_similarity(target_features, candidate_features)
                if similarity > max_similarity:
                    max_similarity = similarity

            if max_similarity > 0:
                recommendations.append({
                    "movie_id": candidate_features["id"],
                    "title": candidate_features["title"],
                    "vote_average": candidate_features["vote_average"],
                    "poster_path": candidate_features["poster_path"],
                    "backdrop_path": candidate_features["backdrop_path"],
                    "overview": candidate_features["overview"],
                    "release_date": candidate_features["release_date"],
                    "popularity": candidate_features["popularity"],
                    "genre_ids": [g_id for g_id in self.tmdb.get_movie_details(candidate_features["id"]).get("genres", [])] if self.tmdb.get_movie_details(candidate_features["id"]) else [], # Ojo: esto sigue siendo una llamada extra. Considera guardarlo en caché también
                    "similarity_score": max_similarity
                })

        recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)
        print(f"Recomendaciones generadas: {len(recommendations)}")
        return recommendations[:limit]

    def _get_popular_movies(self, count: int = 100):
        """Obtiene películas populares como candidatas."""
        try:
            url = f"{self.base_url}/movie/popular?api_key={self.tmdb_api_key}&page=1"
            response = requests.get(url)
            print(f"Respuesta de películas populares: {response.status_code}")
            print(f"Response text: {response.text[:200]}")
            results = response.json().get("results", [])
            print(f"Películas populares obtenidas: {len(results)}")
            return [movie["id"] for movie in results[:count]]
        except Exception as e:
            print(f"Error al obtener películas populares: {str(e)}")
            return []

   
    # En recommender.py, añadir este método
    def update_recommendations(
        self,
        user_profile: List[int],  # Películas que le gustan al usuario
        new_interaction: int,     # Nueva película con la que interactuó
        limit: int = 20
        ):
        """Actualiza recomendaciones basadas en nueva interacción"""
        # Añadir la nueva película al perfil si no está ya
        if new_interaction not in user_profile:
            updated_profile = user_profile + [new_interaction]
        else:
            updated_profile = user_profile
        
        # Reutilizar el método existente
        return self.get_initial_recommendations(updated_profile, limit)