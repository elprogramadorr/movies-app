import requests
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class ContentBasedRecommender:
    def __init__(self, tmdb_api_key: str):
        self.tmdb_api_key = tmdb_api_key
        self.base_url = "https://api.themoviedb.org/3"

    def _get_movie_features(self, movie_id: int):
        """Obtiene características de una película desde TMDB."""
        url = f"{self.base_url}/movie/{movie_id}?api_key={self.tmdb_api_key}"
        response = requests.get(url)
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

    def get_recommendations(
        self, 
        selected_movies: List[int], 
        liked_movies: List[int] = None,
        search_history: List[str] = None
    ):
        """Genera recomendaciones basadas en contenido."""
        # Obtiene características de las películas seleccionadas y liked
        target_movies = selected_movies + (liked_movies or [])
        if not target_movies:
            return []

        target_features_list = self._build_feature_matrix(target_movies)

        # Obtiene películas candidatas (ej: populares o relacionadas con búsquedas)
        candidate_movies = self._get_candidate_movies(search_history)
        candidate_features_list = self._build_feature_matrix(candidate_movies)

        # Calcula similitud para cada candidato
        recommendations = []
        for candidate in candidate_features_list:
            if candidate["id"] in target_movies:
                continue  # Evita recomendar películas ya seleccionadas

            max_similarity = 0
            for target in target_features_list:
                similarity = self._compute_similarity(target, candidate)
                if similarity > max_similarity:
                    max_similarity = similarity

            recommendations.append({
                "movie_id": candidate["id"],
                "title": self._get_movie_title(candidate["id"]),
                "similarity_score": max_similarity,
            })

        # Ordena por puntuación de similitud
        recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)

        return recommendations[:20]  # Top 20 recomendaciones

    def _get_candidate_movies(self, search_history: List[str] = None):
        """Obtiene películas candidatas basadas en historial de búsqueda o populares."""
        if search_history:
            # Busca películas relacionadas con términos de búsqueda
            candidates = set()
            for term in search_history:
                url = f"{self.base_url}/search/movie?query={term}&api_key={self.tmdb_api_key}"
                results = requests.get(url).json().get("results", [])
                candidates.update([movie["id"] for movie in results])
            return list(candidates)
        else:
            # Películas populares como fallback
            url = f"{self.base_url}/movie/popular?api_key={self.tmdb_api_key}"
            return [movie["id"] for movie in requests.get(url).json().get("results", [])]

    def _get_movie_title(self, movie_id: int):
        """Obtiene el título de una película."""
        url = f"{self.base_url}/movie/{movie_id}?api_key={self.tmdb_api_key}"
        return requests.get(url).json().get("title", "Unknown")