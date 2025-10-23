// API Service for Backend Communication
import { cacheService } from './cacheService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9000';

export interface UserSubmission {
  // Personal info
  body_type: string;
  sex: string;
  
  // Lifestyle
  diet: string;
  shower_frequency: string;
  heating_energy: string;
  
  // Transport
  transport: number;
  vehicle_distance: number;
  air_travel: string;
  
  // Social & Consumption
  social_activity: string;
  grocery_bill: number;
  new_clothes: number;
  
  // Technology & Energy
  tv_pc_hours: number;
  internet_hours: number;
  energy_efficiency: string;
  
  // Waste & Recycling
  recycling: string[];
  waste_bag_size: number;
  waste_bag_count: number;
  
  // Cooking
  cooking_methods: string[];
  
  // Location
  city: string;
  area: string;
  
  // Additional fields for better accuracy
  electricity?: number;
  lpg_kg?: number;
  flights_hours?: number;
  meat_meals?: number;
  dining_out?: number;
  shopping_spend?: number;
  waste_kg?: number;
}

export interface PredictionResponse {
  predicted_co2: number;
  confidence: number;
  model_used: string;
  recommendations: Recommendation[];
  peer_comparison: PeerComparison;
}

export interface Recommendation {
  title: string;
  description: string;
  potential_savings: number;
  difficulty: string;
  priority: number;
  category: string;
}

export interface PeerComparison {
  area_stats: {
    count: number;
    avg_co2: number;
    median_co2: number;
    min_co2: number;
    max_co2: number;
  };
  city_stats: {
    count: number;
    avg_co2: number;
    median_co2: number;
  };
  india_stats: {
    avg_co2: number;
    median_co2: number;
    min_co2: number;
    max_co2: number;
  };
  peer_rank: number;
}

export interface AreaStatistics {
  city: string;
  area: string;
  total_users: number;
  avg_co2: number;
  median_co2: number;
  co2_breakdown: {
    Residential: number;
    Corporate: number;
    Industrial: number;
    Vehicular: number;
    Construction: number;
    Airport: number;
  };
  top_contributors: Array<{
    factor: string;
    impact: number;
  }>;
  area_characteristics: string[];
}

export interface UserHistory {
  id: number;
  created_at: string;
  predicted_co2: number | null;
  actual_co2: number | null;
  diet: string;
  transport: number;
  vehicle_distance: number;
  grocery_bill: number;
  waste_bag_count: number;
  recycling_count: number;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Service - Making request to:', url);
    console.log('API Service - Request options:', options);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('API Service - Response status:', response.status);
      console.log('API Service - Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service - Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Service - Response data:', result);
      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; models_loaded: boolean }> {
    return this.makeRequest('/api/health');
  }

  // Predict CO2 emissions
  async predictCO2(submission: UserSubmission): Promise<PredictionResponse> {
    console.log('API Service - Sending prediction request:', submission);
    return this.makeRequest('/api/predict', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  // Get recommendations
  async getRecommendations(city: string, area: string, current_co2: number): Promise<Recommendation[]> {
    const params = new URLSearchParams({
      city,
      area,
      current_co2: current_co2.toString(),
    });
    
    return this.makeRequest(`/api/recommendations?${params}`);
  }

  // Get user history for area
  async getUserHistory(city: string, area: string, limit: number = 5): Promise<UserHistory[]> {
    return this.makeRequest(`/api/history/${city}/${area}?limit=${limit}`);
  }

  // Get area statistics
  async getAreaStatistics(city: string, area: string): Promise<AreaStatistics> {
    return this.makeRequest(`/api/area-stats/${city}/${area}`);
  }

  // Get model performance
  async getModelPerformance(): Promise<{
    models_loaded: boolean;
    best_model: string | null;
    performance: Record<string, any>;
  }> {
    return this.makeRequest('/api/model-performance');
  }

  // Retrain models
  async retrainModels(): Promise<{ message: string; details: any }> {
    return this.makeRequest('/api/retrain', {
      method: 'POST',
    });
  }

  // Get submission statistics
  async getSubmissionStats(): Promise<{
    submissions_since_last_retrain: number;
    retrain_threshold: number;
    submissions_until_retrain: number;
  }> {
    const cacheKey = 'submission-stats';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('API Service - Using cached submission stats');
      return cached;
    }

    const result = await this.makeRequest('/api/submission-stats');
    cacheService.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
    return result;
  }

  // Get seasonal analysis data
  async getSeasonalData(): Promise<any> {
    const cacheKey = 'seasonal-data';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('API Service - Using cached seasonal data');
      return cached;
    }

    const result = await this.makeRequest('/api/seasonal-data');
    cacheService.set(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
    return result;
  }

  // Get top 3 emission categories
  async getTop3Categories(surveyData?: any): Promise<any> {
    if (surveyData) {
      return this.makeRequest('/api/top3-categories', 'POST', surveyData);
    } else {
      return this.makeRequest('/api/top3-categories');
    }
  }

  // Get peer comparison data
  async getPeerComparisonData(city: string, area: string, userEmissions: number): Promise<any> {
    const cacheKey = `peer-comparison-${city}-${area}-${userEmissions}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('API Service - Using cached peer comparison data');
      return cached;
    }

    const result = await this.makeRequest('/api/peer-comparison', {
      method: 'POST',
      body: JSON.stringify({
        city,
        area,
        user_emissions: userEmissions
      }),
    });
    cacheService.set(cacheKey, result, 5 * 60 * 1000); // Cache for 5 minutes
    return result;
  }

  // Get maps data
  async getMapsData(): Promise<any> {
    const cacheKey = 'maps-data';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('API Service - Using cached maps data');
      return cached;
    }

    const result = await this.makeRequest('/api/maps-data');
    cacheService.set(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
    return result;
  }
}

export const apiService = new ApiService();
export default apiService;
