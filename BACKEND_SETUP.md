# CO2 Prediction Backend Setup Guide

## 🚀 Quick Start

### 1. Navigate to Backend Directory
```bash
cd project/backend
```

### 2. Run Setup Script
```bash
python setup.py
```

### 3. Start the Backend Server
```bash
python run.py
```

### 4. Test the Backend
```bash
# In another terminal
python test_backend.py
```

## 📋 What's Included

### ✅ Complete ML Pipeline
- **Random Forest** - Baseline predictions
- **XGBoost** - High-accuracy predictions  
- **Neural Network** - Complex pattern recognition
- **Auto Model Selection** - Picks best performing model

### ✅ Dynamic Retraining
- Models retrain automatically with new user data
- Background retraining every 10 submissions
- Manual retraining via API endpoint

### ✅ User Analytics
- **User History Tracking** - Store all submissions
- **Peer Comparison** - Compare with users in same city/area
- **Last 5 Users** - Show recent users from same location
- **Area Statistics** - Detailed CO2 breakdown by area type

### ✅ Recommendation Engine
- **Personalized Recommendations** - Based on user's specific data
- **Area-Specific Advice** - Tailored to Mumbai/Navi Mumbai areas
- **CO2 Reduction Strategies** - Actionable steps with impact estimates
- **Priority-Based Suggestions** - Ranked by impact and difficulty

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/predict` | POST | Predict CO2 emissions |
| `/api/recommendations` | GET | Get personalized recommendations |
| `/api/history/{city}/{area}` | GET | Get user history for area |
| `/api/area-stats/{city}/{area}` | GET | Get area statistics |
| `/api/retrain` | POST | Manually retrain models |
| `/api/model-performance` | GET | Get model performance metrics |

## 📊 Data Flow

1. **User Submits Survey** → Frontend sends data to `/api/predict`
2. **ML Models Predict** → Best model predicts next month CO2
3. **Recommendations Generated** → Personalized advice based on user data
4. **Data Stored** → User submission saved for future retraining
5. **Peer Comparison** → Compare with other users in same area
6. **Models Retrain** → Automatically retrain with new data

## 🎯 Key Features

### Smart Model Selection
- Trains 3 different ML models
- Automatically selects best performing model
- Tracks performance metrics over time

### Dynamic Data Integration
- Each user submission updates the dataset
- Models retrain with new data automatically
- Maintains accuracy as more data comes in

### Comprehensive Analytics
- User-specific predictions and recommendations
- Area-based statistics and comparisons
- Peer ranking and benchmarking

### Production Ready
- FastAPI with automatic API documentation
- SQLite database for data persistence
- Comprehensive error handling and logging
- Health checks and monitoring endpoints

## 🔍 Testing

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Sample Prediction
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "body_type": "normal",
    "sex": "male", 
    "diet": "vegetarian",
    "city": "Mumbai",
    "area": "Worli",
    "transport": 0.0,
    "vehicle_distance": 1000.0,
    "grocery_bill": 200.0,
    "tv_pc_hours": 4.0,
    "internet_hours": 6.0,
    "energy_efficiency": "Yes",
    "recycling": ["Paper", "Plastic"],
    "waste_bag_size": 10.0,
    "waste_bag_count": 2,
    "cooking_methods": ["Stove", "Microwave"],
    "shower_frequency": "daily",
    "heating_energy": "natural gas",
    "air_travel": "rarely",
    "social_activity": "often",
    "new_clothes": 3
  }'
```

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Backend README**: `backend/README.md`

## 🚨 Troubleshooting

### Common Issues
1. **Port 8000 in use**: Change port in `run.py`
2. **Import errors**: Run `python setup.py` again
3. **Database errors**: Delete `co2_predictions.db` and restart
4. **Memory issues**: Reduce model complexity in `ml_service.py`

### Logs
- Check console output for detailed error messages
- All API requests are logged with timestamps
- Model training progress is shown in console

## 🎉 Ready for Frontend Integration!

The backend is now ready to connect with your React frontend. The API endpoints match exactly what you need for:

- Survey form submissions
- Dashboard data display
- User analytics and comparisons
- Personalized recommendations
- Area-specific statistics

Next step: Update your frontend to connect to `http://localhost:8000`!
