from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class MovieFeatures(BaseModel):
    id: int
    title: str
    genres: List[str]
    keywords: List[str]
    vote_average: float
    popularity: float
    overview: Optional[str] = None
    director: Optional[str] = None
    main_actors: Optional[List[str]] = None

class RatedMovie(BaseModel):
   # movie_id: int = Field(..., alias="movieId")
    movie_id: int 
    rating: float

class UserPreferences(BaseModel):
    selected_movies: List[int] = Field(default_factory=list)
    liked_movies: List[int] = Field(default_factory=list)
    search_history: List[str] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    selected_movies: List[int] = Field(default_factory=list)
    liked_movies: List[int] = Field(default_factory=list)
    watched_movies: List[int] = Field(default_factory=list)
    rated_movies: List[RatedMovie] = Field(default_factory=list)
    limit: int = Field(default=20, ge=1, le=50)

class MovieRecommendation(BaseModel):
    movie_id: int
    title: str
    similarity_score: float
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    overview: Optional[str] = None
    release_date: Optional[str] = None

class RecommendationSection(BaseModel):
    title: str
    movies: List[MovieRecommendation]
    reference_movies: Optional[List[int]] = None
    reference_movie: Optional[int] = None

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    algorithm_version: str = "content-based-v2"
    sections: Optional[Dict[str, RecommendationSection]] = None
