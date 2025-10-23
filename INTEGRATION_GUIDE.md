# Frontend-Backend Integration Guide

## 🎉 **Integration Complete!**

Your React frontend is now fully connected to the Python backend with AI-powered CO2 predictions!

## 🚀 **Quick Start**

### 1. Start the Backend
```bash
cd project/backend
python setup.py    # Install dependencies (first time only)
python run.py      # Start the backend server
```

### 2. Start the Frontend
```bash
cd project
npm run dev        # Start the React frontend
```

### 3. Test the Integration
```bash
# In browser console or run:
node test_integration.js
```

## 🔗 **What's Connected**

### ✅ **Survey Form → Backend API**
- **User-friendly interface** - Kept the existing simple survey form
- **Smart data mapping** - Converts survey data to backend format automatically
- **AI predictions** - Gets ML-powered CO2 predictions from backend
- **Fallback system** - Uses local calculation if backend is unavailable
- **Loading states** - Shows "Analyzing with AI..." during prediction

### ✅ **Backend Integration**
- **3 ML Models**: Random Forest, XGBoost, Neural Network
- **Auto Model Selection**: Picks best performing model
- **Dynamic Retraining**: Models improve with each user submission
- **Real-time Predictions**: Fast CO2 forecasting for next month

### ✅ **Data Flow**
1. **User fills survey** → Simple, user-friendly form
2. **Data conversion** → Automatically maps to backend format
3. **Backend prediction** → AI models predict CO2 emissions
4. **Data storage** → Saves both local and AI predictions
5. **Dashboard ready** → All data available for dashboard display

## 📊 **Data Available for Dashboard**

### **User Prediction Data**
```typescript
{
  carbonFootprint: number,        // Local calculation
  predictedCO2: number,           // AI prediction
  confidence: number,             // Prediction confidence (0-1)
  modelUsed: string,              // Which ML model was used
  recommendations: Recommendation[], // Personalized advice
  peerComparison: PeerComparison,    // Compare with others
  ecoScore: number,               // User's eco score
  timestamp: string               // When prediction was made
}
```

### **Recommendations**
- **Personalized advice** based on user's specific data
- **Area-specific tips** for Mumbai/Navi Mumbai
- **CO2 reduction strategies** with impact estimates
- **Priority-based suggestions** ranked by effectiveness

### **Peer Comparison**
- **Area statistics** - Compare with users in same area
- **City statistics** - Compare with city average
- **India statistics** - Compare with national average
- **Peer ranking** - Your rank among similar users

## 🛠️ **Technical Details**

### **API Service** (`src/services/apiService.ts`)
- Handles all backend communication
- Type-safe interfaces for all data
- Error handling and fallbacks
- Easy to extend with new endpoints

### **Data Context** (`src/contexts/DataContext.tsx`)
- Manages user prediction data
- Loads data from localStorage
- Provides data to all components
- Handles backend integration

### **Survey Form** (`src/pages/Survey.tsx`)
- Kept user-friendly interface
- Smart data mapping to backend format
- Loading states and error handling
- Fallback to local calculation

## 🎯 **ML Models Used**

### **1. Random Forest**
- **Purpose**: Baseline predictions
- **Strengths**: Handles mixed data types, interpretable
- **Features**: 100 trees, max depth 15

### **2. XGBoost**
- **Purpose**: High-accuracy predictions
- **Strengths**: Excellent performance, handles missing data
- **Features**: 200 estimators, learning rate 0.1

### **3. Neural Network**
- **Purpose**: Complex pattern recognition
- **Strengths**: Captures non-linear relationships
- **Architecture**: 128-64-32-1 neurons with dropout

### **Model Selection**
- **Automatic**: System picks best performing model
- **Based on**: R² score and validation metrics
- **Dynamic**: Updates as more data comes in

## 🔄 **Dynamic Retraining**

### **Automatic Retraining**
- **Trigger**: Every 10 new user submissions
- **Background**: Happens without user interruption
- **Performance**: Models improve over time
- **Manual**: Can trigger via `/api/retrain` endpoint

### **Data Integration**
- **Each submission** updates the dataset
- **Models retrain** with new data
- **Accuracy improves** as more users participate
- **Real-time updates** for better predictions

## 🧪 **Testing**

### **Health Check**
```bash
curl http://localhost:8000/api/health
```

### **Test Prediction**
```bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"body_type": "normal", "sex": "male", "diet": "vegetarian", ...}'
```

### **Integration Test**
```bash
node test_integration.js
```

## 🚨 **Troubleshooting**

### **Backend Issues**
1. **Port 8000 in use**: Change port in `backend/run.py`
2. **Import errors**: Run `python setup.py` again
3. **Database errors**: Delete `co2_predictions.db` and restart
4. **Memory issues**: Reduce model complexity

### **Frontend Issues**
1. **API errors**: Check if backend is running
2. **CORS errors**: Backend CORS is configured for localhost:5173
3. **Data not loading**: Check browser console for errors
4. **Predictions failing**: Backend fallback will use local calculation

### **Integration Issues**
1. **Connection refused**: Make sure backend is running on port 8000
2. **Data mapping errors**: Check survey data format
3. **Prediction errors**: Check backend logs for ML errors
4. **Performance issues**: Check backend model loading

## 🎉 **Ready for Dashboard!**

Your system now has:
- ✅ **User-friendly survey** (kept simple)
- ✅ **AI-powered predictions** (3 ML models)
- ✅ **Personalized recommendations**
- ✅ **Peer comparison data**
- ✅ **Dynamic model retraining**
- ✅ **Robust error handling**

**Next step**: Build the dashboard to display all this rich data! 🚀

## 📚 **API Endpoints Available**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/predict` | POST | Get CO2 prediction |
| `/api/recommendations` | GET | Get recommendations |
| `/api/history/{city}/{area}` | GET | Get user history |
| `/api/area-stats/{city}/{area}` | GET | Get area statistics |
| `/api/retrain` | POST | Retrain models |
| `/api/model-performance` | GET | Get model performance |

## 🔧 **Configuration**

### **Backend URL**
- Default: `http://localhost:8000`
- Change in: `src/services/apiService.ts`

### **CORS Settings**
- Configured for: `http://localhost:5173`
- Change in: `backend/main.py`

### **Model Settings**
- Adjust in: `backend/services/ml_service.py`
- Retraining frequency in: `backend/services/history_service.py`
