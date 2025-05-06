from fastapi import FastAPI, HTTPException, Request
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from backend.recommend import ContentBasedRecommender
from backend.tmdb_client import tmdb_client
from backend.schemas import RecommendationRequest, RecommendationResponse

app = FastAPI()

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Usa el cliente TMDB configurado
recommender = ContentBasedRecommender(tmdb_client)

# Middleware para debug (opcional)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    body = await request.body()
    print(f"Request recibido: {body.decode()}")
    response = await call_next(request)
    return response

# Un único endpoint bien definido
@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Endpoint para obtener recomendaciones personalizadas"""
    try:
        print("Datos recibidos:", request.dict())
         # Validar que haya películas seleccionadas
        if not request.selected_movies:
            raise HTTPException(status_code=400, detail="No movies selected")
        
        #recommendations = recommender.get_recommendations(
        recommendations = recommender.get_initial_recommendations(
            selected_movies=request.selected_movies,
           # liked_movies=request.liked_movies,
          #  search_history=request.search_history,
            #preferred_genres=request.preferred_genres,  
            limit=request.limit
        )
         # Validar que haya recomendaciones
        if not recommendations:
            raise HTTPException(status_code=404, detail="No recommendations found")
        # Formatear las recomendaciones
        return {
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat(),
            "algorithm_version": "content-based-v2"
        }
    except HTTPException:
        raise   
    except Exception as e:
        print(f"Error en recomendaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))