import os
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class TMDBClient:
    def __init__(self):
        self.base_url = "https://api.themoviedb.org/3"
        self.api_key = os.getenv("TMDB_API_KEY", "5dbdbb368b27fcb081d9270432837455")
        #self.api_key = os.getenv("TMDB_API_KEY", "5dbdbb368b27fcb081d9270432837455")
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}
        self.session.headers.update({
          #  "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        })

    def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Obtiene detalles completos de una película"""
        url = f"{self.base_url}/movie/{movie_id}"
        params = {"api_key": self.api_key}
        try:
           # response = self.session.get(url)
            #response = self.session.get(url, params={"api_key": self.api_key})
            #response = self.session.get(url, params=params)
            response = self.session.get(
                url,
                params={
                    "append_to_response": "credits,keywords"  # Obtener más datos en una sola llamada
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching movie details: {e}")
            return None

    def get_movie_keywords(self, movie_id: int) -> list[str]:
        """Obtiene keywords de una película"""
        url = f"{self.base_url}/movie/{movie_id}/keywords"
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return [kw["name"] for kw in response.json().get("keywords", [])]
        except requests.exceptions.RequestException:
            return []

    def get_similar_movies(self, movie_id: int, limit: int = 5) -> list[Dict[str, Any]]:
        """Obtiene películas similares"""
        url = f"{self.base_url}/movie/{movie_id}/similar"
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response.json().get("results", [])[:limit]
        except requests.exceptions.RequestException:
            return []

# Instancia global para reutilizar la conexión
tmdb_client = TMDBClient()