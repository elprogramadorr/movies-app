import requests
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List
import numpy as np
from backend.schemas import MovieFeatures
from backend.tmdb_client import tmdb_client

class ContentBasedRecommender:
    """Recomendador basado en contenido para películas usando TMDB."""
    def __init__(self, tmdb_client_instance): 
       
        self.base_url = "https://api.themoviedb.org/3"
        self.tmdb = tmdb_client_instance
        self.tmdb_api_key = tmdb_client_instance.api_key

    def _get_movie_features(self, movie_id: int):
        try:   
            """Obtiene características de una película desde TMDB."""
            url = f"{self.base_url}/movie/{movie_id}?api_key={self.tmdb_api_key}"
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Error obteniendo película {movie_id}: {response.status_code}")
                return None
            movie_data = response.json()

            # Extrae géneros, keywords y otros metadatos relevantes
            genres = [genre["name"] for genre in movie_data.get("genres", [])]
            keywords_url = f"{self.base_url}/movie/{movie_id}/keywords?api_key={self.tmdb_api_key}"
            keywords_data = requests.get(keywords_url).json()
            keywords = [kw["name"] for kw in keywords_data.get("keywords", [])]

            return {
                "id": movie_id,
                "genres": "|".join(genres),
                "keywords": "|".join(keywords),
                "vote_average": movie_data.get("vote_average", 0),
                "popularity": movie_data.get("popularity", 0),
            }
        except Exception as e:
            print(f"Excepción al obtener película {movie_id}: {str(e)}")
            return None

    def _build_feature_matrix(self, movies: List[int]):
        """Construye una matriz de características para las películas."""
        features = []
        for movie_id in movies:
            movie_features = self._get_movie_features(movie_id)
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
        """Genera recomendaciones basadas únicamente en las películas seleccionadas al inicio."""
        if not selected_movies:
            return []

        # Obtiene características de las películas seleccionadas
        target_features_list = self._build_feature_matrix(selected_movies)

        # Obtiene películas candidatas (películas populares como base)
        candidate_movies = self._get_popular_movies()
        candidate_features_list = self._build_feature_matrix(candidate_movies)
        print(f"Películas objetivo: {len(target_features_list)}")
        print(f"Películas candidatas: {len(candidate_features_list)}")

        # Calcula similitud para cada candidato
        recommendations = []
        for candidate in candidate_features_list:
            if candidate["id"] in selected_movies:
                continue  # Evita recomendar películas ya seleccionadas

            max_similarity = 0
            for target in target_features_list:
                similarity = self._compute_similarity(target, candidate)
                if similarity > max_similarity:
                    max_similarity = similarity

            if max_similarity > 0:  # Ajusta este umbral según necesites
                details = self.tmdb.get_movie_details(candidate["id"])
                recommendations.append({
                    #"id": candidate["id"],  # Usar 'id' en lugar de 'movie_id'
                    "movie_id": candidate["id"],
                    "title": self._get_movie_title(candidate["id"]),
                    "vote_average": details.get("vote_average", 0) if details else 0,
                    "poster_path": details.get("poster_path") if details else None,
                    "backdrop_path": details.get("backdrop_path") if details else None,
                    "overview": details.get("overview", "") if details else "",
                    "release_date": details.get("release_date", "") if details else "",
                    "popularity": details.get("popularity", 0) if details else 0,
                    "genre_ids": [g["id"] for g in details.get("genres", [])] if details else [],
                    "similarity_score": max_similarity
                })

        # Ordena por puntuación de similitud
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

    def _get_movie_title(self, movie_id: int):
        """Obtiene el título de una película."""
        url = f"{self.base_url}/movie/{movie_id}?api_key={self.tmdb_api_key}"
        return requests.get(url).json().get("title", "Unknown")
    