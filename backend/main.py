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
TMDB_API_KEY = "5dbdbb368b27fcb081d9270432837455"
#TMDB_API_KEY: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYTZhOGU3MDk3NWFlMjZiOGRhMjg4ZDRkYTIwYjQ0ZSIsIm5iZiI6MTc0Mzg5NDExNC4xNjYwMDAxLCJzdWIiOiI2N2YxYjY2MmVkZGVjMjhiMDNhZDNhOGMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.69DTQqGK7B0VuMZ3TkjfdJZ9OcJIMtPMIRtIig5UlRg',

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