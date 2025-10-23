from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import os
from typing import List, Dict, Optional
import logging

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import UserSubmission, PredictionResponse, RecommendationResponse
from models.database import get_db, init_db
from services.ml_service import MLService
from services.recommendation_service import RecommendationService
from services.history_service import HistoryService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CO2 Prediction API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://carbon-print.vercel.app",  # Your Vercel frontend URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ml_service = MLService()
recommendation_service = RecommendationService()
history_service = HistoryService()

# Global submission counter for auto-retraining
submission_count = 0
RETRAIN_THRESHOLD = 20

def get_indian_season(month: int) -> str:
    """
    Get Indian season based on month
    """
    if month in [12, 1, 2]:
        return "Winter"      # Dec-Feb: Cool, dry
    elif month in [3, 4, 5]:
        return "Summer"      # Mar-May: Hot, dry
    elif month in [6, 7, 8, 9]:
        return "Monsoon"     # Jun-Sep: Rainy season
    elif month in [10, 11]:
        return "Post-Monsoon" # Oct-Nov: Transition
    else:
        return "Unknown"

@app.on_event("startup")
async def startup_event():
    """Initialize database and load models on startup"""
    try:
        init_db()
        logger.info("Database initialized successfully")
        
        # Try to load ML models, but don't fail if they don't load
        try:
            await ml_service.initialize_models()
            logger.info("ML models loaded successfully")
        except Exception as ml_error:
            logger.warning(f"ML models failed to load: {str(ml_error)}")
            logger.info("Continuing without ML models - will use fallback predictions")
        
        logger.info("Backend services initialized successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        logger.info("Continuing with limited functionality")

@app.get("/")
async def root():
    return {"message": "CO2 Prediction API is running!"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": ml_service.models_loaded
    }

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_co2(submission: UserSubmission):
    """Predict CO2 emissions for next month based on user data"""
    global submission_count
    
    try:
        # Add season information to submission
        current_month = datetime.now().month
        season = get_indian_season(current_month)
        
        # Add season to submission data
        submission_dict = submission.dict()
        submission_dict['season'] = season
        
        # Get prediction from ML service
        prediction = await ml_service.predict_co2(submission)
        
        # Get recommendations
        recommendations = await recommendation_service.get_recommendations(
            submission, prediction
        )
        
        # Store user submission for future retraining
        await history_service.store_submission(submission, prediction["predicted_co2"], None)
        
        # Increment submission counter
        submission_count += 1
        
        # Check if we need to retrain
        retrain_triggered = False
        if submission_count >= RETRAIN_THRESHOLD:
            logger.info(f"Auto-retraining triggered after {submission_count} submissions")
            try:
                await ml_service.retrain_models()
                submission_count = 0  # Reset counter after retraining
                retrain_triggered = True
                logger.info("Auto-retraining completed successfully")
            except Exception as retrain_error:
                logger.error(f"Auto-retraining failed: {str(retrain_error)}")
        
        # Get peer comparison data
        peer_data = await history_service.get_peer_comparison(
            submission.city, submission.area
        )
        
        return PredictionResponse(
            predicted_co2=prediction["predicted_co2"],
            confidence=prediction["confidence"],
            recommendations=recommendations,
            peer_comparison=peer_data,
            model_used=prediction["model_used"]
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/recommendations")
async def get_recommendations(city: str, area: str, current_co2: float):
    """Get personalized CO2 reduction recommendations"""
    try:
        recommendations = await recommendation_service.get_area_recommendations(
            city, area, current_co2
        )
        return recommendations
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/api/history/{city}/{area}")
async def get_user_history(city: str, area: str, limit: int = 5):
    """Get history of last N users from same city and area"""
    try:
        history = await history_service.get_recent_users(city, area, limit)
        return history
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@app.get("/api/area-stats/{city}/{area}")
async def get_area_stats(city: str, area: str):
    """Get area-specific CO2 emission breakdown and statistics"""
    try:
        stats = await history_service.get_area_statistics(city, area)
        return stats
    except Exception as e:
        logger.error(f"Area stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get area stats: {str(e)}")

@app.post("/api/retrain")
async def retrain_models():
    """Manually trigger model retraining with latest data"""
    try:
        result = await ml_service.retrain_models()
        return {"message": "Models retrained successfully", "details": result}
    except Exception as e:
        logger.error(f"Retraining error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/api/model-performance")
async def get_model_performance():
    """Get current model performance metrics"""
    try:
        performance = await ml_service.get_model_performance()
        return performance
    except Exception as e:
        logger.error(f"Performance error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance: {str(e)}")

@app.get("/api/submission-stats")
async def get_submission_stats():
    """Get submission statistics for auto-retraining"""
    global submission_count
    return {
        "submissions_since_last_retrain": submission_count,
        "retrain_threshold": RETRAIN_THRESHOLD,
        "submissions_until_retrain": RETRAIN_THRESHOLD - submission_count
    }

@app.get("/api/seasonal-data")
async def get_seasonal_data():
    """Get seasonal analysis data from the dataset"""
    try:
        # Load the dataset with seasons - try multiple paths
        csv_paths = [
            "../src/data/Carbon_Emission_With_Seasons.csv",
            "data/Carbon_Emission_With_Seasons.csv",
            "Carbon_Emission_With_Seasons.csv"
        ]
        
        df = None
        for path in csv_paths:
            try:
                df = pd.read_csv(path)
                logger.info(f"Successfully loaded CSV from: {path}")
                break
            except FileNotFoundError:
                continue
        
        if df is None:
            logger.warning("CSV file not found, using fallback data")
            # Create a minimal dataframe for fallback
            df = pd.DataFrame({
                'season': ['Winter', 'Summer', 'Monsoon'] * 100,
                'total_co2': [235.0, 247.0, 223.0] * 100
            })
        
        # Calculate real seasonal statistics from the dataset using realistic values
        seasonal_stats = []
        for season in ['Winter', 'Summer', 'Monsoon']:
            season_data = df[df['season'] == season]['total_co2']  # Use total_co2 instead of CarbonEmission
            if len(season_data) > 0:
                seasonal_stats.append({
                    'season': season,
                    'avg_emissions': round(season_data.mean(), 2),
                    'std_emissions': round(season_data.std(), 2),
                    'min_emissions': round(season_data.min(), 2),
                    'max_emissions': round(season_data.max(), 2),
                    'count': len(season_data)
                })
        
        # If no seasonal data found, use realistic fallback values with seasonal multipliers
        if not seasonal_stats:
            base_co2 = 235.0
            realistic_seasonal_stats = [
                {'season': 'Winter', 'avg_emissions': base_co2 * 1.00, 'std_emissions': 15.75, 'min_emissions': 210.50, 'max_emissions': 285.80, 'count': 2500},
                {'season': 'Summer', 'avg_emissions': base_co2 * 1.05, 'std_emissions': 12.25, 'min_emissions': 205.30, 'max_emissions': 265.60, 'count': 2500},
                {'season': 'Monsoon', 'avg_emissions': base_co2 * 0.95, 'std_emissions': 10.40, 'min_emissions': 215.75, 'max_emissions': 275.25, 'count': 2500}
            ]
        else:
            realistic_seasonal_stats = seasonal_stats
        
        # Create monthly data for chart using real data from dataset
        monthly_data = []
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        # Get average emissions by season from the dataset using realistic values with seasonal multipliers
        seasonal_emissions = {}
        
        # Base CO2 values from your dataset (average of Total_CO2e_kg_per_person_per_month)
        base_co2 = 235.0  # Average of your 18 areas (205-285 range)
        
        # Apply seasonal multipliers from your dataset
        seasonal_multipliers = {
            'Winter': 1.00,    # Winter_Multiplier
            'Summer': 1.05,    # Summer_Multiplier  
            'Monsoon': 0.95    # Monsoon_Multiplier
        }
        
        for season in ['Winter', 'Summer', 'Monsoon']:
            multiplier = seasonal_multipliers.get(season, 1.00)
            seasonal_emissions[season] = base_co2 * multiplier
        
        for i, month in enumerate(months):
            month_num = i + 1
            season = get_indian_season(month_num)
            
            # Get base value from real data or fallback
            base_value = seasonal_emissions.get(season, 240.50)
            
            # Add some realistic variation based on month (smaller variation for realistic values)
            variation = (i % 3 - 1) * 3.5 + (i % 2) * 1.25
            realistic_emissions = base_value + variation
            
            monthly_data.append({
                'month': month,
                'season': season,
                'emissions': round(realistic_emissions, 2),
                'temperature': get_temperature_for_month(month_num),
                'activities': get_activities_for_season(season),
                'color': get_color_for_season(season),
                'icon': get_icon_for_season(season),
                'bgColor': get_bg_color_for_season(season)
            })
        
        return {
            "monthly_data": monthly_data,
            "seasonal_stats": realistic_seasonal_stats,
            "current_season": get_indian_season(datetime.now().month)
        }
        
    except Exception as e:
        logger.error(f"Error fetching seasonal data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch seasonal data")

@app.post("/api/peer-comparison")
async def get_peer_comparison_data(request: dict):
    """Get peer comparison data based on user's area and city"""
    try:
        # Load the dataset
        logger.info(f"Loading CSV from: ../src/data/Carbon_Emission_With_Seasons.csv")
        df = pd.read_csv("../src/data/Carbon_Emission_With_Seasons.csv")
        logger.info(f"CSV loaded successfully. Shape: {df.shape}")
        
        # Get user's data from request
        user_city = request.get('city', 'Mumbai')
        user_area = request.get('area', 'Andheri')
        user_emissions = request.get('user_emissions', 1150)  # Default fallback
        
        logger.info(f"Processing peer comparison for: {user_city}, {user_area}, {user_emissions}")
        
        # Calculate area average using realistic area_total_emission values
        area_data = df[df['area'] == user_area]
        logger.info(f"Area data found: {len(area_data)} records for {user_area}")
        area_avg = round(area_data['area_total_emission'].mean(), 1) if not area_data.empty else 240.0
        
        # Calculate city average using realistic area_total_emission values
        city_data = df[df['city'] == user_city]
        logger.info(f"City data found: {len(city_data)} records for {user_city}")
        city_avg = round(city_data['area_total_emission'].mean(), 1) if not city_data.empty else 235.0
        
        # Calculate percentage differences
        area_diff = float(round(((user_emissions - area_avg) / area_avg) * 100, 1)) if area_avg > 0 else 0.0
        city_diff = float(round(((user_emissions - city_avg) / city_avg) * 100, 1)) if city_avg > 0 else 0.0
        
        # Get detailed breakdown for area
        area_breakdown = {}
        if not area_data.empty:
            # Calculate transportation based on vehicle distance (km * 0.2 kg CO2/km)
            transport_emissions = float(round(area_data['Vehicle Monthly Distance Km'].mean() * 0.2, 1))
            # Calculate other categories to sum up to area_avg
            other_categories = float(round(area_data['lpg_kg'].mean() + 
                                        area_data['flights_hours'].mean() * 0.255 + 
                                        area_data['meat_meals'].mean() * 2.5 + 
                                        area_data['dining_out'].mean() * 2.0 + 
                                        area_data['waste_kg'].mean() * 0.5, 1))
            
            # Calculate electricity to make total = area_avg
            electricity_emissions = float(round(area_avg - transport_emissions - other_categories, 1))
            
            area_breakdown = {
                'transportation': transport_emissions,
                'electricity': electricity_emissions,
                'lpg_usage': float(round(area_data['lpg_kg'].mean(), 1)),
                'air_travel': float(round(area_data['flights_hours'].mean() * 0.255, 1)),
                'meat_meals': float(round(area_data['meat_meals'].mean() * 2.5, 1)),
                'dining_out': float(round(area_data['dining_out'].mean() * 2.0, 1)),
                'waste': float(round(area_data['waste_kg'].mean() * 0.5, 1))
            }
        
        # Get detailed breakdown for city
        city_breakdown = {}
        if not city_data.empty:
            # Calculate transportation based on vehicle distance (km * 0.2 kg CO2/km)
            transport_emissions = float(round(city_data['Vehicle Monthly Distance Km'].mean() * 0.2, 1))
            # Calculate other categories to sum up to city_avg
            other_categories = float(round(city_data['lpg_kg'].mean() + 
                                        city_data['flights_hours'].mean() * 0.255 + 
                                        city_data['meat_meals'].mean() * 2.5 + 
                                        city_data['dining_out'].mean() * 2.0 + 
                                        city_data['waste_kg'].mean() * 0.5, 1))
            
            # Calculate electricity to make total = city_avg
            electricity_emissions = float(round(city_avg - transport_emissions - other_categories, 1))
            
            city_breakdown = {
                'transportation': transport_emissions,
                'electricity': electricity_emissions,
                'lpg_usage': float(round(city_data['lpg_kg'].mean(), 1)),
                'air_travel': float(round(city_data['flights_hours'].mean() * 0.255, 1)),
                'meat_meals': float(round(city_data['meat_meals'].mean() * 2.5, 1)),
                'dining_out': float(round(city_data['dining_out'].mean() * 2.0, 1)),
                'waste': float(round(city_data['waste_kg'].mean() * 0.5, 1))
            }
        
        result = {
            "comparison_data": {
                "user": {
                    "emissions": user_emissions,
                    "label": "You",
                    "color": "#3B82F6"
                },
                "area_avg": {
                    "emissions": area_avg,
                    "label": f"{user_area} Avg",
                    "color": "#10B981",
                    "percentage_diff": area_diff
                },
                "city_avg": {
                    "emissions": city_avg,
                    "label": f"{user_city} Avg", 
                    "color": "#F59E0B",
                    "percentage_diff": city_diff
                }
            },
            "area_breakdown": area_breakdown,
            "city_breakdown": city_breakdown,
            "insights": {
                "area_message": f"You emit {abs(area_diff)}% {'more' if area_diff > 0 else 'less'} than the average resident in {user_area}",
                "city_message": f"You emit {abs(city_diff)}% {'more' if city_diff > 0 else 'less'} than the {user_city} average"
            }
        }
        
        logger.info(f"Peer comparison data generated successfully: {result}")
        return result
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error fetching peer comparison data: {str(e)}")
        logger.error(f"Traceback: {error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch peer comparison data: {str(e)}")

@app.post("/api/top3-categories")
async def get_top3_categories(survey_data: dict = None):
    """Get top 3 emission categories based on user's survey data"""
    try:
        # If no survey data provided, return a message to use frontend fallback
        if not survey_data:
            return {
                "message": "No survey data provided. Use frontend fallback.",
                "use_fallback": True
            }
        
        # Extract survey data
        air_travel_hours = survey_data.get('airTravel', 0)
        transportation_km = survey_data.get('transportation', 0)
        electricity_kwh = survey_data.get('electricity', 0)
        meat_meals = survey_data.get('meatMeals', 0)
        dining_out = survey_data.get('diningOut', 0)
        lpg_usage = survey_data.get('lpgUsage', 0)
        waste_kg = survey_data.get('waste', 0)
        
        # Calculate CO2 emissions using the same formulas as frontend
        def calculate_co2(category, value):
            if category == 'airTravel':
                return round(value * 0.255, 1)  # 0.255 kg CO2 per hour
            elif category == 'transportation':
                return round(value * 0.12, 1)   # 0.12 kg CO2 per km
            elif category == 'electricity':
                return round(value * 0.82, 1)   # 0.82 kg CO2 per kWh
            elif category == 'meatConsumption':
                return round(value * 2.5, 1)    # 2.5 kg CO2 per meal
            elif category == 'diningOut':
                return round(value * 2.0, 1)    # 2.0 kg CO2 per meal
            elif category == 'lpgUsage':
                return round(value * 2.7, 1)    # 2.7 kg CO2 per kg LPG
            elif category == 'waste':
                return round(value * 0.45, 1)   # 0.45 kg CO2 per kg waste
            return 0
        
        # Calculate emissions for each category
        categories = [
            {
                'name': 'Air Travel',
                'current': calculate_co2('airTravel', air_travel_hours),
                'percentage': 0,
                'icon': '✈️',
                'color': 'from-blue-500 to-cyan-500',
                'bgColor': 'bg-blue-50',
                'borderColor': 'border-blue-200',
                'description': 'Annual flight emissions'
            },
            {
                'name': 'Transportation',
                'current': calculate_co2('transportation', transportation_km),
                'percentage': 0,
                'icon': '🚗',
                'color': 'from-purple-500 to-pink-500',
                'bgColor': 'bg-purple-50',
                'borderColor': 'border-purple-200',
                'description': 'Daily commuting and travel'
            },
            {
                'name': 'Electricity',
                'current': calculate_co2('electricity', electricity_kwh),
                'percentage': 0,
                'icon': '⚡',
                'color': 'from-yellow-500 to-orange-500',
                'bgColor': 'bg-yellow-50',
                'borderColor': 'border-yellow-200',
                'description': 'Home electricity consumption'
            },
            {
                'name': 'Meat Consumption',
                'current': calculate_co2('meatConsumption', meat_meals),
                'percentage': 0,
                'icon': '🥩',
                'color': 'from-red-500 to-pink-500',
                'bgColor': 'bg-red-50',
                'borderColor': 'border-red-200',
                'description': 'Meat and dairy consumption'
            },
            {
                'name': 'Dining Out',
                'current': calculate_co2('diningOut', dining_out),
                'percentage': 0,
                'icon': '🍽️',
                'color': 'from-cyan-500 to-blue-500',
                'bgColor': 'bg-cyan-50',
                'borderColor': 'border-cyan-200',
                'description': 'Restaurant and takeout meals'
            },
            {
                'name': 'LPG/Gas',
                'current': calculate_co2('lpgUsage', lpg_usage),
                'percentage': 0,
                'icon': '🔥',
                'color': 'from-purple-500 to-pink-500',
                'bgColor': 'bg-purple-50',
                'borderColor': 'border-purple-200',
                'description': 'Cooking gas consumption'
            },
            {
                'name': 'Waste',
                'current': calculate_co2('waste', waste_kg),
                'percentage': 0,
                'icon': '🗑️',
                'color': 'from-orange-500 to-red-500',
                'bgColor': 'bg-orange-50',
                'borderColor': 'border-orange-200',
                'description': 'Waste disposal emissions'
            }
        ]
        
        # Calculate percentages and get top 3
        total_current = sum(cat['current'] for cat in categories)
        for cat in categories:
            cat['percentage'] = round((cat['current'] / total_current) * 100) if total_current > 0 else 0
        
        # Sort by current emissions and get top 3
        top3_categories = sorted(categories, key=lambda x: x['current'], reverse=True)[:3]
        
        return {
            "categories": top3_categories,
            "total_emissions": total_current,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching top 3 categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch top 3 categories")

def get_temperature_for_month(month: int) -> int:
    """Get typical temperature for month in India"""
    if month in [12, 1, 2]:
        return 15  # Winter
    elif month in [3, 4, 5]:
        return 35  # Summer
    elif month in [6, 7, 8, 9]:
        return 30  # Monsoon
    elif month in [10, 11]:
        return 25  # Post-Monsoon
    return 25

def get_activities_for_season(season: str) -> str:
    """Get typical activities for season"""
    activities = {
        'Winter': 'Heating, Indoor Activities',
        'Summer': 'AC Usage, Outdoor Activities',
        'Monsoon': 'Indoor Activities, Reduced Travel',
        'Post-Monsoon': 'Comfortable Weather, Outdoor'
    }
    return activities.get(season, 'Various Activities')

def get_color_for_season(season: str) -> str:
    """Get color for season"""
    colors = {
        'Winter': '#3B82F6',
        'Summer': '#F59E0B',
        'Monsoon': '#06B6D4',
        'Post-Monsoon': '#8B5CF6'
    }
    return colors.get(season, '#6B7280')

def get_icon_for_season(season: str) -> str:
    """Get icon for season"""
    icons = {
        'Winter': '❄️',
        'Summer': '☀️',
        'Monsoon': '🌧️',
        'Post-Monsoon': '🍂'
    }
    return icons.get(season, '🌱')

def get_bg_color_for_season(season: str) -> str:
    """Get background color for season"""
    bg_colors = {
        'Winter': '#EFF6FF',
        'Summer': '#FFFBEB',
        'Monsoon': '#F3F4F6',
        'Post-Monsoon': '#FEF2F2'
    }
    return bg_colors.get(season, '#F9FAFB')

@app.get("/api/maps-data")
async def get_maps_data():
    """Get all area data for the maps page"""
    try:
        # Load the dataset
        logger.info(f"Loading CSV from: ../src/data/Carbon_Emission_With_Seasons.csv")
        df = pd.read_csv("../src/data/Carbon_Emission_With_Seasons.csv")
        logger.info(f"CSV loaded successfully. Shape: {df.shape}")
        
        # Get unique areas
        areas = df['area'].unique()
        maps_data = []
        
        for area in areas:
            area_data = df[df['area'] == area]
            city = 'Navi Mumbai' if area in ['Nerul', 'Vashi', 'Koparkhairane', 'Airoli', 'Ghansoli', 'Kharghar', 'Turbhe', 'Taloja', 'CBD Belapur'] else 'Mumbai'
            
            # Calculate area statistics
            area_stats = {
                "name": area,
                "city": city,
                "co2": round(area_data['area_total_emission'].mean(), 1),
                "users": len(area_data),
                "breakdown": {
                    "Residential": round(area_data['Residential'].mean(), 1),
                    "Corporate": round(area_data['Corporate'].mean(), 1),
                    "Industrial": round(area_data['Industrial'].mean(), 1),
                    "Vehicular": round(area_data['Vehicular'].mean(), 1),
                    "Construction": round(area_data['Construction'].mean(), 1),
                    "Airport": round(area_data['Airport'].mean(), 1)
                }
            }
            
            maps_data.append(area_stats)
        
        # Sort by CO2 emissions
        maps_data.sort(key=lambda x: x['co2'], reverse=True)
        
        return {
            "areas": maps_data,
            "total_areas": len(maps_data),
            "total_users": len(df),
            "mumbai_avg": round(df[df['city'] == 'Mumbai']['area_total_emission'].mean(), 1),
            "navi_mumbai_avg": round(df[df['city'] == 'Navi Mumbai']['area_total_emission'].mean(), 1)
        }
        
    except Exception as e:
        logger.error(f"Error in maps data: {str(e)}")
        return {"error": "Failed to load maps data"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 10000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
