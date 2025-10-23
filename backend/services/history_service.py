import pandas as pd
import numpy as np
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models.database import get_db, UserSubmissionDB
from models.user import UserSubmission, UserHistory, AreaStatistics
from services.ml_service import MLService

logger = logging.getLogger(__name__)

class HistoryService:
    def __init__(self):
        self.csv_path = "../src/data/Carbon_Emission_Cleaned.csv"
        
    async def store_submission(self, submission: UserSubmission, predicted_co2: float = None, actual_co2: float = None):
        """Store user submission in database"""
        try:
            db = next(get_db())
            
            # Calculate additional fields
            submission.lpg_kg = self._calculate_lpg_kg(submission)
            submission.flights_hours = self._calculate_flights_hours(submission)
            submission.meat_meals = self._calculate_meat_meals(submission)
            submission.dining_out = self._calculate_dining_out(submission)
            submission.shopping_spend = self._calculate_shopping_spend(submission)
            submission.waste_kg = self._calculate_waste_kg(submission)
            
            # Create database entry
            db_submission = UserSubmissionDB(
                submission_data=submission.dict(),
                city=submission.city,
                area=submission.area,
                body_type=submission.body_type,
                sex=submission.sex,
                diet=submission.diet,
                transport=submission.transport,
                vehicle_distance=submission.vehicle_distance,
                grocery_bill=submission.grocery_bill,
                tv_pc_hours=submission.tv_pc_hours,
                internet_hours=submission.internet_hours,
                waste_bag_count=submission.waste_bag_count,
                recycling_count=len(submission.recycling),
                predicted_co2=predicted_co2,
                actual_co2=actual_co2
            )
            
            db.add(db_submission)
            db.commit()
            db.refresh(db_submission)
            
            logger.info(f"User submission stored with ID: {db_submission.id}")
            return db_submission.id
            
        except Exception as e:
            logger.error(f"Failed to store submission: {str(e)}")
            raise
        finally:
            db.close()

    def _calculate_lpg_kg(self, submission: UserSubmission) -> float:
        """Calculate LPG consumption based on cooking methods and household size"""
        base_lpg = 10.0  # Base LPG consumption
        
        # Adjust based on cooking methods
        if 'Stove' in submission.cooking_methods:
            base_lpg += 5.0
        if 'Oven' in submission.cooking_methods:
            base_lpg += 3.0
        if 'Grill' in submission.cooking_methods:
            base_lpg += 2.0
            
        # Adjust based on diet
        if submission.diet == 'vegetarian':
            base_lpg *= 0.8
        elif submission.diet == 'vegan':
            base_lpg *= 0.6
        elif submission.diet == 'omnivore':
            base_lpg *= 1.2
            
        return base_lpg

    def _calculate_flights_hours(self, submission: UserSubmission) -> float:
        """Calculate flight hours based on air travel frequency"""
        frequency_map = {
            'never': 0.0,
            'rarely': 2.0,
            'frequently': 8.0,
            'very frequently': 16.0
        }
        return frequency_map.get(submission.air_travel, 0.0)

    def _calculate_meat_meals(self, submission: UserSubmission) -> int:
        """Calculate meat meals per month based on diet and grocery bill"""
        if submission.diet == 'vegan':
            return 0
        elif submission.diet == 'vegetarian':
            return 0
        elif submission.diet == 'pescatarian':
            return int(submission.grocery_bill * 0.1)  # 10% of grocery bill
        else:  # omnivore
            return int(submission.grocery_bill * 0.2)  # 20% of grocery bill

    def _calculate_dining_out(self, submission: UserSubmission) -> int:
        """Calculate dining out frequency based on social activity and grocery bill"""
        base_dining = 5  # Base dining out per month
        
        if submission.social_activity == 'very often':
            base_dining += 10
        elif submission.social_activity == 'often':
            base_dining += 5
        elif submission.social_activity == 'rarely':
            base_dining -= 2
            
        # Adjust based on grocery bill (lower grocery = more dining out)
        if submission.grocery_bill < 100:
            base_dining += 5
        elif submission.grocery_bill > 300:
            base_dining -= 3
            
        return max(0, base_dining)

    def _calculate_shopping_spend(self, submission: UserSubmission) -> float:
        """Calculate shopping spend based on new clothes and lifestyle"""
        base_spend = submission.new_clothes * 50  # 50 per clothing item
        
        # Add lifestyle factors
        if submission.tv_pc_hours > 8:
            base_spend += 100  # Electronics/entertainment
        if submission.internet_hours > 10:
            base_spend += 50   # Online shopping
            
        return base_spend

    def _calculate_waste_kg(self, submission: UserSubmission) -> float:
        """Calculate waste generation in kg per month"""
        base_waste = submission.waste_bag_count * 2.5  # 2.5 kg per bag
        
        # Adjust based on lifestyle
        if submission.grocery_bill > 200:
            base_waste *= 1.2  # More consumption = more waste
        if len(submission.recycling) > 2:
            base_waste *= 0.8  # Better recycling = less waste
            
        return base_waste

    async def get_recent_users(self, city: str, area: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent users from same city and area"""
        try:
            db = next(get_db())
            
            # Get recent submissions from same city and area
            recent_submissions = db.query(UserSubmissionDB).filter(
                UserSubmissionDB.city == city,
                UserSubmissionDB.area == area
            ).order_by(UserSubmissionDB.created_at.desc()).limit(limit).all()
            
            history = []
            ml_service = MLService()
            # Lazily initialize models if needed
            if not ml_service.models_loaded:
                try:
                    await ml_service.initialize_models()
                except Exception:
                    pass

            for submission in recent_submissions:
                predicted_value = submission.predicted_co2
                # If DB doesn't have prediction, compute on the fly from stored submission JSON
                if predicted_value is None and hasattr(submission, "submission_data") and submission.submission_data:
                    try:
                        user_sub = UserSubmission(**submission.submission_data)
                        pred = await ml_service.predict_co2(user_sub)
                        predicted_value = float(pred.get("predicted_co2")) if pred and "predicted_co2" in pred else None
                    except Exception:
                        predicted_value = None

                history.append({
                    "id": submission.id,
                    "created_at": submission.created_at.isoformat(),
                    "area": submission.area,
                    "predicted_co2": predicted_value,
                    "actual_co2": submission.actual_co2,
                    "diet": submission.diet,
                    "transport": submission.transport,
                    "vehicle_distance": submission.vehicle_distance,
                    "grocery_bill": submission.grocery_bill,
                    "waste_bag_count": submission.waste_bag_count,
                    "recycling_count": submission.recycling_count,
                    "confidence": 85.0,  # Default confidence
                    "model": "XGBoost"  # Default model
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get recent users: {str(e)}")
            return []
        finally:
            db.close()

    async def get_peer_comparison(self, city: str, area: str) -> Dict[str, Any]:
        """Get peer comparison data for user's city and area"""
        try:
            db = next(get_db())
            
            # Get all submissions from same city and area
            area_submissions = db.query(UserSubmissionDB).filter(
                UserSubmissionDB.city == city,
                UserSubmissionDB.area == area
            ).all()
            
            if not area_submissions:
                return self._get_default_comparison()
            
            # Calculate statistics
            co2_values = [s.predicted_co2 for s in area_submissions if s.predicted_co2]
            if not co2_values:
                return self._get_default_comparison()
            
            # Get city-wide data
            city_submissions = db.query(UserSubmissionDB).filter(
                UserSubmissionDB.city == city
            ).all()
            city_co2_values = [s.predicted_co2 for s in city_submissions if s.predicted_co2]
            
            # Get India-wide data (from CSV)
            india_data = await self._get_india_data()
            
            return {
                "area_stats": {
                    "count": len(area_submissions),
                    "avg_co2": np.mean(co2_values),
                    "median_co2": np.median(co2_values),
                    "min_co2": np.min(co2_values),
                    "max_co2": np.max(co2_values)
                },
                "city_stats": {
                    "count": len(city_submissions),
                    "avg_co2": np.mean(city_co2_values) if city_co2_values else 0,
                    "median_co2": np.median(city_co2_values) if city_co2_values else 0
                },
                "india_stats": india_data,
                "peer_rank": self._calculate_peer_rank(co2_values)
            }
            
        except Exception as e:
            logger.error(f"Failed to get peer comparison: {str(e)}")
            return self._get_default_comparison()
        finally:
            db.close()

    def _get_default_comparison(self) -> Dict[str, Any]:
        """Return default comparison data when no peer data available"""
        return {
            "area_stats": {
                "count": 0,
                "avg_co2": 2500,
                "median_co2": 2500,
                "min_co2": 1500,
                "max_co2": 4000
            },
            "city_stats": {
                "count": 0,
                "avg_co2": 2800,
                "median_co2": 2800
            },
            "india_stats": {
                "avg_co2": 3000,
                "median_co2": 3000
            },
            "peer_rank": 50
        }

    async def _get_india_data(self) -> Dict[str, Any]:
        """Get India-wide statistics from CSV data"""
        try:
            df = pd.read_csv(self.csv_path)
            co2_values = df['CarbonEmission'].dropna()
            
            return {
                "avg_co2": float(np.mean(co2_values)),
                "median_co2": float(np.median(co2_values)),
                "min_co2": float(np.min(co2_values)),
                "max_co2": float(np.max(co2_values))
            }
        except Exception as e:
            logger.error(f"Failed to get India data: {str(e)}")
            return {
                "avg_co2": 3000.0,
                "median_co2": 3000.0,
                "min_co2": 1000.0,
                "max_co2": 5000.0
            }

    def _calculate_peer_rank(self, co2_values: List[float]) -> int:
        """Calculate user's rank among peers (0-100, lower is better)"""
        if not co2_values:
            return 50
        
        # Sort values and find percentile
        sorted_values = sorted(co2_values)
        n = len(sorted_values)
        
        # Return percentile rank (0-100)
        return int((n - 1) * 100 / n) if n > 1 else 50

    async def get_area_statistics(self, city: str, area: str) -> Dict[str, Any]:
        """Get detailed area statistics and CO2 breakdown"""
        try:
            # Load CSV data for area analysis
            df = pd.read_csv(self.csv_path)
            area_data = df[(df['city'] == city) & (df['area'] == area)]
            
            if area_data.empty:
                return self._get_default_area_stats(city, area)
            
            # Calculate CO2 breakdown by area type using the new emission values
            co2_breakdown = {}
            area_types = ['Residential', 'Corporate', 'Industrial', 'Vehicular', 'Construction', 'Airport']
            
            for area_type in area_types:
                if area_type in area_data.columns:
                    # Use the actual emission values from the updated dataset
                    type_emissions = area_data[area_type]
                    # Get the average emission value for this area type in this area
                    co2_breakdown[area_type] = float(type_emissions.mean()) if not type_emissions.empty else 0.0
                else:
                    co2_breakdown[area_type] = 0.0
            
            # Get top contributors
            top_contributors = self._get_top_contributors(area_data)
            
            return {
                "city": city,
                "area": area,
                "total_users": len(area_data),
                "avg_co2": float(area_data['CarbonEmission'].mean()),
                "median_co2": float(area_data['CarbonEmission'].median()),
                "co2_breakdown": co2_breakdown,
                "top_contributors": top_contributors,
                "area_characteristics": self._get_area_characteristics(area_data)
            }
            
        except Exception as e:
            logger.error(f"Failed to get area statistics: {str(e)}")
            return self._get_default_area_stats(city, area)

    def _get_default_area_stats(self, city: str, area: str) -> Dict[str, Any]:
        """Return default area statistics with realistic Mumbai/Navi Mumbai values"""
        # Define realistic emission values based on city
        if city == "Mumbai":
            co2_breakdown = {
                "Residential": 850.0,
                "Corporate": 650.0,
                "Industrial": 1200.0,
                "Vehicular": 750.0,
                "Construction": 400.0,
                "Airport": 2000.0
            }
        else:  # Navi Mumbai
            co2_breakdown = {
                "Residential": 700.0,
                "Corporate": 500.0,
                "Industrial": 1000.0,
                "Vehicular": 600.0,
                "Construction": 350.0,
                "Airport": 1500.0
            }
        
        return {
            "city": city,
            "area": area,
            "total_users": 0,
            "avg_co2": 2500.0,
            "median_co2": 2500.0,
            "co2_breakdown": co2_breakdown,
            "top_contributors": [
                {"factor": "Transport", "impact": 35.0},
                {"factor": "Energy", "impact": 25.0},
                {"factor": "Diet", "impact": 20.0}
            ],
            "area_characteristics": ["Mixed residential and commercial"]
        }

    def _get_top_contributors(self, area_data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Get top CO2 contributing factors for the area"""
        contributors = []
        
        # Analyze different factors
        factors = {
            "Transport": area_data['Transport'].mean() * 100,
            "Energy": (area_data['How Long TV PC Daily Hour'].mean() + 
                      area_data['How Long Internet Daily Hour'].mean()) * 10,
            "Diet": area_data['Monthly Grocery Bill'].mean() * 2,
            "Waste": area_data['Waste Bag Weekly Count'].mean() * 20,
            "Lifestyle": area_data['How Many New Clothes Monthly'].mean() * 15
        }
        
        # Sort by impact
        sorted_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)
        
        for factor, impact in sorted_factors[:3]:
            contributors.append({
                "factor": factor,
                "impact": round(impact, 1)
            })
        
        return contributors

    def _get_area_characteristics(self, area_data: pd.DataFrame) -> List[str]:
        """Get characteristics of the area based on data"""
        characteristics = []
        
        # Analyze area types
        area_types = ['Residential', 'Corporate', 'Industrial', 'Vehicular', 'Construction', 'Airport']
        present_types = [t for t in area_types if t in area_data.columns and area_data[t].sum() > 0]
        
        if 'Residential' in present_types:
            characteristics.append("Residential area")
        if 'Corporate' in present_types:
            characteristics.append("Business district")
        if 'Industrial' in present_types:
            characteristics.append("Industrial zone")
        if 'Vehicular' in present_types:
            characteristics.append("High traffic area")
        if 'Construction' in present_types:
            characteristics.append("Development zone")
        if 'Airport' in present_types:
            characteristics.append("Airport vicinity")
        
        # Analyze lifestyle patterns
        if area_data['How Long TV PC Daily Hour'].mean() > 6:
            characteristics.append("High screen time area")
        if area_data['Transport'].mean() > 0.5:
            characteristics.append("Transport-dependent area")
        if area_data['Monthly Grocery Bill'].mean() > 200:
            characteristics.append("High consumption area")
        
        return characteristics if characteristics else ["Mixed urban area"]
