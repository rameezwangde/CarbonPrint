import pandas as pd
import numpy as np
import joblib
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.models_loaded = False
        self.model_performance = {}
        self.csv_path = "../src/data/Carbon_Emission_With_Seasons.csv"
        
    async def initialize_models(self):
        """Initialize and train all ML models"""
        try:
            logger.info("Starting ML model initialization...")
            
            # Load and prepare data
            df = await self._load_and_prepare_data()
            logger.info(f"Data loaded successfully: {df.shape}")
            
            # Train multiple models with error handling
            try:
                await self._train_random_forest(df)
                logger.info("Random Forest model trained successfully")
            except Exception as e:
                logger.error(f"Random Forest training failed: {str(e)}")
            
            try:
                await self._train_xgboost(df)
                logger.info("XGBoost model trained successfully")
            except Exception as e:
                logger.error(f"XGBoost training failed: {str(e)}")
            
            try:
                await self._train_neural_network(df)
                logger.info("Neural Network model trained successfully")
            except Exception as e:
                logger.error(f"Neural Network training failed: {str(e)}")
            
            # Select best model
            await self._select_best_model()
            
            self.models_loaded = True
            logger.info("All ML models initialized successfully")
            logger.info("All ML models initialized successfully")
            
        except Exception as e:
            logger.error(f"Model initialization failed: {str(e)}")
            raise

    async def _load_and_prepare_data(self) -> pd.DataFrame:
        """Load and preprocess the CSV data"""
        try:
            df = pd.read_csv(self.csv_path)
            
            # Clean and prepare features
            df = self._clean_data(df)
            df = self._engineer_features(df)
            
            return df
            
        except Exception as e:
            logger.error(f"Data loading failed: {str(e)}")
            raise

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate the dataset"""
        # Remove rows with missing target values
        df = df.dropna(subset=['CarbonEmission'])
        
        # Handle missing values in features
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
        
        # Handle categorical missing values
        categorical_columns = df.select_dtypes(include=['object']).columns
        df[categorical_columns] = df[categorical_columns].fillna('Unknown')
        
        return df

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create additional features for better predictions"""
        # Create interaction features (using available columns)
        df['grocery_meat_interaction'] = df['Monthly Grocery Bill'] * df['meat_meals']
        df['energy_tech_interaction'] = df['How Long TV PC Daily Hour'] * df['How Long Internet Daily Hour']
        
        # Create efficiency scores (using available columns)
        df['waste_efficiency'] = df['Waste Bag Weekly Count'] / 5  # Simplified since Waste Bag Size was dropped
        df['energy_efficiency_score'] = df['Energy efficiency'].map({'Yes': 3, 'Sometimes': 2, 'No': 1})
        
        # Create lifestyle scores
        df['lifestyle_score'] = (
            df['How Long TV PC Daily Hour'] + 
            df['How Long Internet Daily Hour'] + 
            df['How Many New Clothes Monthly']
        )
        
        return df

    async def _train_random_forest(self, df: pd.DataFrame):
        """Train Random Forest model"""
        try:
            X, y = self._prepare_features(df)
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train Random Forest
            rf_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            
            rf_model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = rf_model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.models['random_forest'] = rf_model
            self.model_performance['random_forest'] = {
                'mae': mae,
                'r2': r2,
                'feature_importance': dict(zip(X.columns, rf_model.feature_importances_))
            }
            
            logger.info(f"Random Forest trained - MAE: {mae:.2f}, R2: {r2:.3f}")
            
        except Exception as e:
            logger.error(f"Random Forest training failed: {str(e)}")

    async def _train_xgboost(self, df: pd.DataFrame):
        """Train XGBoost model"""
        try:
            X, y = self._prepare_features(df)
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train XGBoost
            xgb_model = xgb.XGBRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42
            )
            
            xgb_model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = xgb_model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.models['xgboost'] = xgb_model
            self.model_performance['xgboost'] = {
                'mae': mae,
                'r2': r2,
                'feature_importance': dict(zip(X.columns, xgb_model.feature_importances_))
            }
            
            logger.info(f"XGBoost trained - MAE: {mae:.2f}, R2: {r2:.3f}")
            
        except Exception as e:
            logger.error(f"XGBoost training failed: {str(e)}")

    async def _train_neural_network(self, df: pd.DataFrame):
        """Train Neural Network model"""
        try:
            X, y = self._prepare_features(df)
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Build neural network
            model = Sequential([
                Dense(128, activation='relu', input_shape=(X_train_scaled.shape[1],)),
                Dropout(0.3),
                Dense(64, activation='relu'),
                Dropout(0.3),
                Dense(32, activation='relu'),
                Dropout(0.2),
                Dense(1, activation='linear')
            ])
            
            model.compile(
                optimizer=Adam(learning_rate=0.001),
                loss='mse',
                metrics=['mae']
            )
            
            # Train model
            history = model.fit(
                X_train_scaled, y_train,
                epochs=100,
                batch_size=32,
                validation_split=0.2,
                verbose=0
            )
            
            # Evaluate
            y_pred = model.predict(X_test_scaled, verbose=0).flatten()
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.models['neural_network'] = model
            self.scalers['neural_network'] = scaler
            self.model_performance['neural_network'] = {
                'mae': mae,
                'r2': r2,
                'training_history': history.history
            }
            
            logger.info(f"Neural Network trained - MAE: {mae:.2f}, R2: {r2:.3f}")
            
        except Exception as e:
            logger.error(f"Neural Network training failed: {str(e)}")

    def _prepare_features(self, df: pd.DataFrame):
        """Prepare features for training"""
        # Select relevant features
        feature_columns = [
            'Body Type', 'Sex', 'Diet', 'How Often Shower', 'Heating Energy Source',
 'Social Activity', 'Monthly Grocery Bill', 'Frequency of Traveling by Air',
            'Vehicle Monthly Distance Km',  'Waste Bag Weekly Count',
            'How Long TV PC Daily Hour', 'How Many New Clothes Monthly', 'How Long Internet Daily Hour',
            'Energy efficiency', 'lpg_kg', 'flights_hours', 'meat_meals', 'dining_out',
            'shopping_spend', 'waste_kg', 'Residential', 'Corporate', 'Industrial',
            'Vehicular', 'Construction', 'Airport', 'transport_waste_interaction',
            'grocery_meat_interaction', 'energy_tech_interaction', 'waste_efficiency',
            'energy_efficiency_score', 'lifestyle_score'
        ]
        
        # Filter available columns
        available_columns = [col for col in feature_columns if col in df.columns]
        X = df[available_columns].copy()
        y = df['CarbonEmission']
        
        # Encode categorical variables
        categorical_columns = X.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if col not in self.encoders:
                self.encoders[col] = LabelEncoder()
                X[col] = self.encoders[col].fit_transform(X[col].astype(str))
            else:
                X[col] = self.encoders[col].transform(X[col].astype(str))
        
        return X, y

    async def _select_best_model(self):
        """Select the best performing model"""
        if not self.model_performance:
            return
        
        # Select model with best R2 score
        best_model = max(self.model_performance.items(), key=lambda x: x[1]['r2'])
        self.best_model_name = best_model[0]
        logger.info(f"Best model selected: {self.best_model_name}")

    async def predict_co2(self, submission) -> Dict[str, Any]:
        """Predict CO2 emissions for a user submission"""
        try:
            if not self.models_loaded:
                await self.initialize_models()
            
            # Convert submission to DataFrame
            submission_df = self._submission_to_dataframe(submission)
            
            # Prepare features
            X = self._prepare_submission_features(submission_df)
            
            # Get prediction from best model
            if self.best_model_name == 'neural_network':
                X_scaled = self.scalers['neural_network'].transform(X)
                prediction = self.models['neural_network'].predict(X_scaled, verbose=0)[0][0]
            else:
                prediction = self.models[self.best_model_name].predict(X)[0]
            
            # Apply prediction smoothing and validation
            prediction = self._smooth_prediction(prediction, submission)
            
            # Calculate confidence based on model performance
            confidence = min(0.95, max(0.6, self.model_performance[self.best_model_name]['r2']))
            
            return {
                "predicted_co2": float(prediction),
                "confidence": float(confidence),
                "model_used": self.best_model_name
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise

    def _submission_to_dataframe(self, submission) -> pd.DataFrame:
        """Convert user submission to DataFrame format"""
        data = {
            'Body Type': submission.body_type,
            'Sex': submission.sex,
            'Diet': submission.diet,
            'How Often Shower': submission.shower_frequency,
            'Heating Energy Source': submission.heating_energy,
            'Social Activity': submission.social_activity,
            'Monthly Grocery Bill': submission.grocery_bill,
            'Frequency of Traveling by Air': submission.air_travel,
            'Vehicle Monthly Distance Km': submission.vehicle_distance,
            'Waste Bag Weekly Count': submission.waste_bag_count,
            'How Long TV PC Daily Hour': submission.tv_pc_hours,
            'How Many New Clothes Monthly': submission.new_clothes,
            'How Long Internet Daily Hour': submission.internet_hours,
            'Energy efficiency': submission.energy_efficiency,
            'lpg_kg': submission.lpg_kg or 0,
            'flights_hours': submission.flights_hours or 0,
            'meat_meals': submission.meat_meals or 0,
            'dining_out': submission.dining_out or 0,
            'shopping_spend': submission.shopping_spend or 0,
            'waste_kg': submission.waste_kg or 0,
            'Residential': 1 if 'Residential' in submission.area else 0,
            'Corporate': 1 if 'Corporate' in submission.area else 0,
            'Industrial': 1 if 'Industrial' in submission.area else 0,
            'Vehicular': 1 if 'Vehicular' in submission.area else 0,
            'Construction': 1 if 'Construction' in submission.area else 0,
            'Airport': 1 if 'Airport' in submission.area else 0,
        }
        
        return pd.DataFrame([data])

    def _prepare_submission_features(self, df: pd.DataFrame):
        """Prepare features for prediction"""
        # Create interaction features
        # Removed transport_waste_interaction since Transport column was dropped
        df['grocery_meat_interaction'] = df['Monthly Grocery Bill'] * df['meat_meals']
        df['energy_tech_interaction'] = df['How Long TV PC Daily Hour'] * df['How Long Internet Daily Hour']
        
        # Create efficiency scores
        df['waste_efficiency'] = df['Waste Bag Weekly Count'] / 5  # Simplified since Waste Bag Size was dropped
        df['energy_efficiency_score'] = df['Energy efficiency'].map({'Yes': 3, 'Sometimes': 2, 'No': 1})
        
        # Create lifestyle scores
        df['lifestyle_score'] = (
            df['How Long TV PC Daily Hour'] + 
            df['How Long Internet Daily Hour'] + 
            df['How Many New Clothes Monthly']
        )
        
        # Select features in same order as training
        feature_columns = [
            'Body Type', 'Sex', 'Diet', 'How Often Shower', 'Heating Energy Source',
 'Social Activity', 'Monthly Grocery Bill', 'Frequency of Traveling by Air',
            'Vehicle Monthly Distance Km',  'Waste Bag Weekly Count',
            'How Long TV PC Daily Hour', 'How Many New Clothes Monthly', 'How Long Internet Daily Hour',
            'Energy efficiency', 'lpg_kg', 'flights_hours', 'meat_meals', 'dining_out',
            'shopping_spend', 'waste_kg', 'Residential', 'Corporate', 'Industrial',
            'Vehicular', 'Construction', 'Airport', 'transport_waste_interaction',
            'grocery_meat_interaction', 'energy_tech_interaction', 'waste_efficiency',
            'energy_efficiency_score', 'lifestyle_score'
        ]
        
        available_columns = [col for col in feature_columns if col in df.columns]
        X = df[available_columns].copy()
        
        # Encode categorical variables
        categorical_columns = X.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if col in self.encoders:
                X[col] = self.encoders[col].transform(X[col].astype(str))
            else:
                # Handle unseen categories
                X[col] = 0
        
        return X

    def _smooth_prediction(self, prediction: float, submission) -> float:
        """Apply smoothing and validation to predictions for better accuracy"""
        try:
            # Calculate a more accurate baseline prediction based on survey inputs
            baseline = 0
            
            # Transportation contribution
            if submission.transport > 0:
                baseline += submission.vehicle_distance * 0.21  # kg CO2 per km
            
            # Air travel contribution
            if hasattr(submission, 'flights_hours') and submission.flights_hours:
                baseline += submission.flights_hours * 90  # kg CO2 per hour
            
            # Energy contribution - use actual electricity input if available
            if hasattr(submission, 'electricity') and submission.electricity:
                baseline += submission.electricity * 0.45  # Direct electricity to CO2 conversion
            elif hasattr(submission, 'tv_pc_hours') and submission.tv_pc_hours:
                # Fallback: estimate from TV/PC hours
                estimated_electricity = submission.tv_pc_hours * 0.1 * 30  # 0.1 kW average * 30 days
                baseline += estimated_electricity * 0.45  # 0.45 kg CO2 per kWh
            
            # LPG contribution
            if hasattr(submission, 'lpg_kg') and submission.lpg_kg:
                baseline += submission.lpg_kg * 3.0  # kg CO2 per kg LPG
            
            # Diet contribution
            if hasattr(submission, 'meat_meals') and submission.meat_meals:
                baseline += submission.meat_meals * 2.5  # kg CO2 per meal
            
            # Dining out contribution
            if hasattr(submission, 'dining_out') and submission.dining_out:
                baseline += submission.dining_out * 3.2  # kg CO2 per meal
            
            # Waste contribution
            if hasattr(submission, 'waste_kg') and submission.waste_kg:
                baseline += submission.waste_kg * 0.5  # kg CO2 per kg waste
            
            # Apply smoothing: blend ML prediction with baseline
            if baseline > 0:
                # More conservative blending: 50% ML + 50% baseline for better accuracy
                smoothed = 0.5 * prediction + 0.5 * baseline
                
                # Tighter bounds: 0.7x to 1.5x baseline for more realistic predictions
                min_reasonable = baseline * 0.7
                max_reasonable = baseline * 1.5
                
                smoothed = max(min_reasonable, min(smoothed, max_reasonable))
                
                # Additional check: if ML prediction is way off, use mostly baseline
                if prediction > baseline * 3:
                    smoothed = baseline * 1.1  # Just 10% above baseline
                    logger.info(f"ML prediction too high, using conservative estimate: {prediction:.2f} -> {smoothed:.2f}")
                elif prediction < baseline * 0.3:
                    smoothed = baseline * 0.9  # Just 10% below baseline
                    logger.info(f"ML prediction too low, using conservative estimate: {prediction:.2f} -> {smoothed:.2f}")
                
                logger.info(f"Prediction smoothed: {prediction:.2f} -> {smoothed:.2f} (baseline: {baseline:.2f})")
                return smoothed
            
            return prediction
            
        except Exception as e:
            logger.warning(f"Prediction smoothing failed: {str(e)}")
            return prediction

    async def retrain_models(self) -> Dict[str, Any]:
        """Retrain models with latest data including user submissions"""
        try:
            logger.info("Starting model retraining...")
            
            # Load fresh data including new submissions
            df = await self._load_and_prepare_data()
            
            # Retrain all models
            await self._train_random_forest(df)
            await self._train_xgboost(df)
            await self._train_neural_network(df)
            
            # Select best model
            await self._select_best_model()
            
            # Save models
            await self._save_models()
            
            logger.info("Model retraining completed successfully")
            return {
                "status": "success",
                "models_retrained": list(self.models.keys()),
                "best_model": self.best_model_name,
                "performance": self.model_performance
            }
            
        except Exception as e:
            logger.error(f"Model retraining failed: {str(e)}")
            raise

    async def _save_models(self):
        """Save trained models to disk"""
        try:
            os.makedirs("models", exist_ok=True)
            
            for name, model in self.models.items():
                if name == 'neural_network':
                    model.save(f"models/{name}.h5")
                else:
                    joblib.dump(model, f"models/{name}.pkl")
            
            # Save scalers and encoders
            joblib.dump(self.scalers, "models/scalers.pkl")
            joblib.dump(self.encoders, "models/encoders.pkl")
            joblib.dump(self.model_performance, "models/performance.pkl")
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.error(f"Model saving failed: {str(e)}")

    async def get_model_performance(self) -> Dict[str, Any]:
        """Get current model performance metrics"""
        return {
            "models_loaded": self.models_loaded,
            "best_model": getattr(self, 'best_model_name', None),
            "performance": self.model_performance
        }
