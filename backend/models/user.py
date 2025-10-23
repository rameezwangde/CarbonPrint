from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserSubmission(BaseModel):
    """User survey data submission"""
    # Personal info
    body_type: str = Field(..., description="Body type: underweight, normal, overweight, obese")
    sex: str = Field(..., description="Sex: male, female, other")
    
    # Lifestyle
    diet: str = Field(..., description="Diet type: vegetarian, vegan, pescatarian, omnivore")
    shower_frequency: str = Field(..., description="Shower frequency: less frequently, daily, twice a day, more frequently")
    heating_energy: str = Field(..., description="Heating energy source: natural gas, coal, wood, electricity")
    
    # Transport
    transport: float = Field(..., description="Transport usage (0.0 for no transport)")
    vehicle_distance: float = Field(..., description="Monthly vehicle distance in km")
    air_travel: str = Field(..., description="Air travel frequency: rarely, frequently, very frequently, never")
    
    # Social & Consumption
    social_activity: str = Field(..., description="Social activity: never, rarely, often, very often")
    grocery_bill: float = Field(..., description="Monthly grocery bill")
    new_clothes: int = Field(..., description="New clothes per month")
    
    # Technology & Energy
    tv_pc_hours: float = Field(..., description="Daily TV/PC hours")
    internet_hours: float = Field(..., description="Daily internet hours")
    energy_efficiency: str = Field(..., description="Energy efficiency: Yes, No, Sometimes")
    
    # Waste & Recycling
    recycling: List[str] = Field(..., description="Recycling materials: Paper, Plastic, Glass, Metal")
    waste_bag_size: float = Field(..., description="Waste bag size")
    waste_bag_count: int = Field(..., description="Weekly waste bag count")
    
    # Cooking
    cooking_methods: List[str] = Field(..., description="Cooking methods: Stove, Oven, Microwave, Grill, Airfryer")
    
    # Location
    city: str = Field(..., description="City: Mumbai, Navi Mumbai")
    area: str = Field(..., description="Area within city")
    
    # Calculated fields (will be computed)
    electricity: Optional[float] = None
    lpg_kg: Optional[float] = None
    flights_hours: Optional[float] = None
    meat_meals: Optional[int] = None
    dining_out: Optional[int] = None
    shopping_spend: Optional[float] = None
    waste_kg: Optional[float] = None

class PredictionResponse(BaseModel):
    """CO2 prediction response"""
    predicted_co2: float = Field(..., description="Predicted CO2 emissions for next month")
    confidence: float = Field(..., description="Prediction confidence (0-1)")
    model_used: str = Field(..., description="ML model used for prediction")
    recommendations: List[Dict[str, Any]] = Field(..., description="Personalized recommendations")
    peer_comparison: Dict[str, Any] = Field(..., description="Peer comparison data")

class RecommendationResponse(BaseModel):
    """CO2 reduction recommendations"""
    category: str = Field(..., description="Recommendation category")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    potential_savings: float = Field(..., description="Potential CO2 savings (kg/month)")
    difficulty: str = Field(..., description="Implementation difficulty: Easy, Medium, Hard")
    priority: int = Field(..., description="Priority level (1-5)")

class UserHistory(BaseModel):
    """User history entry"""
    id: int
    submission_data: UserSubmission
    actual_co2: Optional[float] = None
    predicted_co2: Optional[float] = None
    created_at: datetime
    city: str
    area: str

class AreaStatistics(BaseModel):
    """Area-specific statistics"""
    city: str
    area: str
    total_users: int
    avg_co2: float
    median_co2: float
    co2_breakdown: Dict[str, float]  # Residential, Corporate, Industrial, Vehicular, Construction
    top_contributors: List[Dict[str, Any]]
    peer_rank: Optional[int] = None
