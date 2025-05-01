import CONFIG from '../config/config';
import { Movie, RecommendationsResponse } from '../types';

interface RecommendationRequest {
    selectedMovies: number[];
    likedMovies?: number[];
    searchHistory?: string[];
}

export const fetchRecommendations = async (data: RecommendationRequest) => {
    try {
        const response = await fetch('http://tu-backend-ip:8000/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};