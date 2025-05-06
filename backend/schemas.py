from pydantic import BaseModel, Field
from typing import List, Optional


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

class UserPreferences(BaseModel):
    selected_movies: List[int]
    liked_movies: Optional[List[int]] = None
    search_history: Optional[List[str]] = None

#class RecommendationRequest(UserPreferences):
 #   limit: Optional[int] = 20

#class RecommendationRequest(BaseModel):
#   selectedMovies: List[int] 
#    likedMovies: Optional[List[int]] = None
#    searchHistory: Optional[List[str]] = None
#    limit: Optional[int] = 20
class RecommendationRequest(BaseModel):
    selected_movies: List[int]
    #preferred_genres: Optional[List[int]] = None  # Nuevo campo importante
    #liked_movies: Optional[List[int]] = None
    #preferred_genres: Optional[List[int]] = Field(default_factory=list)
    #liked_movies: Optional[List[int]] = Field(default_factory=list)
    limit: Optional[int] = 20

class MovieRecommendation(BaseModel):
    movie_id: int
    title: str
    similarity_score: float
    poster_path: Optional[str] = None

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    generated_at: str
    algorithm_version: str = "content-based-v1"