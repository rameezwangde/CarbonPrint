import pandas as pd
import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.recommendations_db = self._initialize_recommendations()
        
    def _initialize_recommendations(self) -> Dict[str, List[Dict[str, Any]]]:
        """Initialize recommendation database"""
        return {
            "transport": [
                {
                    "title": "Use Public Transportation",
                    "description": "Switch to buses, trains, or metro for daily commute. Reduces individual carbon footprint significantly.",
                    "potential_savings": 150.0,
                    "difficulty": "Medium",
                    "priority": 5,
                    "category": "Transport"
                },
                {
                    "title": "Carpool or Bike to Work",
                    "description": "Share rides with colleagues or use bicycle for short distances. Great for health and environment.",
                    "potential_savings": 80.0,
                    "difficulty": "Easy",
                    "priority": 4,
                    "category": "Transport"
                },
                {
                    "title": "Reduce Air Travel",
                    "description": "Choose train or bus for domestic travel. Consider video conferencing for business meetings.",
                    "potential_savings": 200.0,
                    "difficulty": "Hard",
                    "priority": 3,
                    "category": "Transport"
                }
            ],
            "energy": [
                {
                    "title": "Switch to LED Bulbs",
                    "description": "Replace incandescent bulbs with LED lights. Uses 75% less energy and lasts longer.",
                    "potential_savings": 25.0,
                    "difficulty": "Easy",
                    "priority": 5,
                    "category": "Energy"
                },
                {
                    "title": "Unplug Electronics",
                    "description": "Unplug chargers and electronics when not in use. Reduces phantom energy consumption.",
                    "potential_savings": 15.0,
                    "difficulty": "Easy",
                    "priority": 4,
                    "category": "Energy"
                },
                {
                    "title": "Use Energy-Efficient Appliances",
                    "description": "Replace old appliances with Energy Star rated ones. Significant long-term savings.",
                    "potential_savings": 60.0,
                    "difficulty": "Hard",
                    "priority": 3,
                    "category": "Energy"
                }
            ],
            "diet": [
                {
                    "title": "Reduce Meat Consumption",
                    "description": "Have meat-free days or reduce portion sizes. Meat production has high carbon footprint.",
                    "potential_savings": 100.0,
                    "difficulty": "Medium",
                    "priority": 4,
                    "category": "Diet"
                },
                {
                    "title": "Buy Local and Seasonal Food",
                    "description": "Choose locally grown, seasonal produce. Reduces transportation emissions.",
                    "potential_savings": 30.0,
                    "difficulty": "Easy",
                    "priority": 3,
                    "category": "Diet"
                },
                {
                    "title": "Reduce Food Waste",
                    "description": "Plan meals, store food properly, and use leftovers. Reduces methane emissions from landfills.",
                    "potential_savings": 40.0,
                    "difficulty": "Medium",
                    "priority": 4,
                    "category": "Diet"
                }
            ],
            "waste": [
                {
                    "title": "Improve Recycling",
                    "description": "Recycle paper, plastic, glass, and metal properly. Reduces landfill waste and emissions.",
                    "potential_savings": 20.0,
                    "difficulty": "Easy",
                    "priority": 4,
                    "category": "Waste"
                },
                {
                    "title": "Compost Organic Waste",
                    "description": "Start composting kitchen scraps and garden waste. Creates nutrient-rich soil.",
                    "potential_savings": 35.0,
                    "difficulty": "Medium",
                    "priority": 3,
                    "category": "Waste"
                },
                {
                    "title": "Reduce Single-Use Plastics",
                    "description": "Use reusable bags, bottles, and containers. Reduces plastic waste significantly.",
                    "potential_savings": 25.0,
                    "difficulty": "Easy",
                    "priority": 4,
                    "category": "Waste"
                }
            ],
            "lifestyle": [
                {
                    "title": "Reduce Screen Time",
                    "description": "Limit TV and computer usage. Saves energy and improves health.",
                    "potential_savings": 30.0,
                    "difficulty": "Hard",
                    "priority": 2,
                    "category": "Lifestyle"
                },
                {
                    "title": "Buy Fewer Clothes",
                    "description": "Adopt minimal wardrobe approach. Fashion industry has high environmental impact.",
                    "potential_savings": 50.0,
                    "difficulty": "Medium",
                    "priority": 3,
                    "category": "Lifestyle"
                },
                {
                    "title": "Optimize Heating/Cooling",
                    "description": "Use programmable thermostats and proper insulation. Reduces energy consumption.",
                    "potential_savings": 45.0,
                    "difficulty": "Medium",
                    "priority": 3,
                    "category": "Lifestyle"
                }
            ]
        }

    async def get_recommendations(self, submission, prediction: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get personalized recommendations based on user data and prediction"""
        try:
            recommendations = []
            
            # Analyze user's high-impact areas
            high_impact_areas = self._analyze_high_impact_areas(submission, prediction)
            
            # Get recommendations for each high-impact area
            for area in high_impact_areas:
                if area in self.recommendations_db:
                    recommendations.extend(self.recommendations_db[area])
            
            # Add specific recommendations based on user data
            specific_recs = self._get_specific_recommendations(submission)
            recommendations.extend(specific_recs)
            
            # Sort by priority and potential savings
            recommendations.sort(key=lambda x: (x['priority'], x['potential_savings']), reverse=True)
            
            # Return top 5 recommendations
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {str(e)}")
            return []

    def _analyze_high_impact_areas(self, submission, prediction: Dict[str, Any]) -> List[str]:
        """Analyze which areas have highest impact on user's CO2 emissions"""
        areas = []
        
        # Transport analysis
        if submission.vehicle_distance > 1000 or submission.air_travel in ['frequently', 'very frequently']:
            areas.append('transport')
        
        # Energy analysis
        if submission.tv_pc_hours > 8 or submission.internet_hours > 10:
            areas.append('energy')
        
        # Diet analysis
        if submission.diet in ['omnivore'] and submission.grocery_bill > 200:
            areas.append('diet')
        
        # Waste analysis
        if submission.waste_bag_count > 3 or len(submission.recycling) < 2:
            areas.append('waste')
        
        # Lifestyle analysis
        if submission.new_clothes > 5 or submission.tv_pc_hours > 6:
            areas.append('lifestyle')
        
        return areas

    def _get_specific_recommendations(self, submission) -> List[Dict[str, Any]]:
        """Get specific recommendations based on user's exact data"""
        specific_recs = []
        
        # High vehicle distance
        if submission.vehicle_distance > 2000:
            specific_recs.append({
                "title": "Consider Electric Vehicle",
                "description": f"Your monthly distance of {submission.vehicle_distance}km is high. An electric vehicle could reduce emissions by 70%.",
                "potential_savings": 120.0,
                "difficulty": "Hard",
                "priority": 4,
                "category": "Transport"
            })
        
        # High air travel
        if submission.air_travel == 'very frequently':
            specific_recs.append({
                "title": "Video Conferencing for Business",
                "description": "Replace some business trips with video calls. Each avoided flight saves significant CO2.",
                "potential_savings": 300.0,
                "difficulty": "Medium",
                "priority": 5,
                "category": "Transport"
            })
        
        # High screen time
        if submission.tv_pc_hours > 10:
            specific_recs.append({
                "title": "Digital Detox Days",
                "description": f"Reduce your {submission.tv_pc_hours} hours daily screen time. Try outdoor activities instead.",
                "potential_savings": 40.0,
                "difficulty": "Hard",
                "priority": 3,
                "category": "Lifestyle"
            })
        
        # High grocery spending
        if submission.grocery_bill > 300:
            specific_recs.append({
                "title": "Meal Planning",
                "description": "Plan meals weekly to reduce food waste and grocery spending. Buy only what you need.",
                "potential_savings": 60.0,
                "difficulty": "Medium",
                "priority": 3,
                "category": "Diet"
            })
        
        # Low recycling
        if len(submission.recycling) < 2:
            specific_recs.append({
                "title": "Expand Recycling Program",
                "description": f"Currently recycling {len(submission.recycling)} materials. Add more categories for better impact.",
                "potential_savings": 30.0,
                "difficulty": "Easy",
                "priority": 4,
                "category": "Waste"
            })
        
        return specific_recs

    async def get_area_recommendations(self, city: str, area: str, current_co2: float) -> List[Dict[str, Any]]:
        """Get area-specific recommendations based on local conditions"""
        try:
            recommendations = []
            
            # Area-specific recommendations
            if 'Industrial' in area:
                recommendations.append({
                    "title": "Air Quality Awareness",
                    "description": f"Industrial areas like {area} have higher pollution. Use air purifiers and masks when needed.",
                    "potential_savings": 20.0,
                    "difficulty": "Easy",
                    "priority": 3,
                    "category": "Health"
                })
            
            if 'Vehicular' in area:
                recommendations.append({
                    "title": "Traffic-Aware Commuting",
                    "description": f"High traffic area. Use real-time traffic apps to avoid congestion and reduce idling.",
                    "potential_savings": 35.0,
                    "difficulty": "Easy",
                    "priority": 4,
                    "category": "Transport"
                })
            
            if 'Construction' in area:
                recommendations.append({
                    "title": "Dust Protection",
                    "description": f"Construction areas generate dust. Keep windows closed and use air filters.",
                    "potential_savings": 15.0,
                    "difficulty": "Easy",
                    "priority": 2,
                    "category": "Health"
                })
            
            # City-specific recommendations
            if city == 'Mumbai':
                recommendations.append({
                    "title": "Use Mumbai Metro",
                    "description": "Mumbai Metro is expanding. Use it for daily commute to reduce traffic congestion.",
                    "potential_savings": 80.0,
                    "difficulty": "Medium",
                    "priority": 4,
                    "category": "Transport"
                })
            
            if city == 'Navi Mumbai':
                recommendations.append({
                    "title": "Navi Mumbai's Green Spaces",
                    "description": "Take advantage of Navi Mumbai's planned green spaces for outdoor activities.",
                    "potential_savings": 25.0,
                    "difficulty": "Easy",
                    "priority": 2,
                    "category": "Lifestyle"
                })
            
            # CO2 level-based recommendations
            if current_co2 > 4000:
                recommendations.append({
                    "title": "Comprehensive Carbon Audit",
                    "description": "Your CO2 levels are high. Consider a comprehensive lifestyle audit and major changes.",
                    "potential_savings": 200.0,
                    "difficulty": "Hard",
                    "priority": 5,
                    "category": "General"
                })
            elif current_co2 > 2500:
                recommendations.append({
                    "title": "Moderate Lifestyle Changes",
                    "description": "Focus on 2-3 key areas for improvement. Small changes can make a big difference.",
                    "potential_savings": 100.0,
                    "difficulty": "Medium",
                    "priority": 4,
                    "category": "General"
                })
            else:
                recommendations.append({
                    "title": "Maintain Good Practices",
                    "description": "You're doing well! Focus on maintaining these practices and fine-tuning.",
                    "potential_savings": 50.0,
                    "difficulty": "Easy",
                    "priority": 3,
                    "category": "General"
                })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Area recommendations failed: {str(e)}")
            return []
