from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
from recommend import ContentBasedRecommender

app = FastAPI()

# Configura CORS para permitir conexión con React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clave API de TMDB (usa la misma que en tu frontend)
TMDB_API_KEY = "tu_api_key_de_tmdb"

recommender = ContentBasedRecommender(TMDB_API_KEY)

class UserPreferences(BaseModel):
    selected_movies: List[int]  # IDs de películas seleccionadas
    liked_movies: Optional[List[int]] = None  # IDs de películas con "like"
    search_history: Optional[List[str]] = None  # Términos de búsqueda

@app.post("/recommendations")
async def get_recommendations(prefs: UserPreferences):
    try:
        recommendations = recommender.get_recommendations(
            prefs.selected_movies,
            prefs.liked_movies,
            prefs.search_history
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))