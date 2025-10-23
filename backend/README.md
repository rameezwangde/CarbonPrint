# CO2 Prediction Backend

A comprehensive Python backend for CO2 emission prediction, recommendations, and user analytics using machine learning.

## 🚀 Features

### Core ML Capabilities
- **Multiple ML Models**: Random Forest, XGBoost, Neural Networks
- **Dynamic Retraining**: Models automatically retrain with new user data
- **Best Model Selection**: Automatically selects the most accurate model
- **Real-time Predictions**: Fast CO2 emission predictions for next month

### User Analytics
- **User History Tracking**: Store and analyze user submissions
- **Peer Comparison**: Compare users with others in same city/area
- **Area Statistics**: Detailed CO2 breakdown by area type
- **Last 5 Users**: Show recent users from same city and area

### Recommendation Engine
- **Personalized Recommendations**: Based on user's specific data
- **Area-Specific Advice**: Tailored to city and area characteristics
- **CO2 Reduction Strategies**: Actionable steps to reduce emissions
- **Priority-Based Suggestions**: Ranked by impact and difficulty

## 🏗️ Architecture

```
backend/
├── main.py                 # FastAPI application
├── run.py                  # Server startup script
├── setup.py               # Environment setup
├── requirements.txt       # Python dependencies
├── models/
│   ├── user.py           # Pydantic data models
│   └── database.py       # SQLAlchemy database models
└── services/
    ├── ml_service.py     # Machine learning pipeline
    ├── recommendation_service.py  # Recommendation engine
    └── history_service.py # User analytics and history
```

## 🛠️ Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd project/backend
   ```

2. **Run setup script**:
   ```bash
   python setup.py
   ```

3. **Or install manually**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

```bash
python run.py
```

The server will start on `http://localhost:8000`

## 📚 API Endpoints

### Core Prediction
- `POST /api/predict` - Predict CO2 emissions for user
- `GET /api/health` - Health check endpoint

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

### User Analytics
- `GET /api/history/{city}/{area}` - Get user history for area
- `GET /api/area-stats/{city}/{area}` - Get area statistics

### Model Management
- `POST /api/retrain` - Manually retrain models
- `GET /api/model-performance` - Get model performance metrics

## 🤖 Machine Learning Models

### 1. Random Forest
- **Use Case**: Baseline predictions
- **Strengths**: Handles mixed data types well, interpretable
- **Features**: 100 trees, max depth 15

### 2. XGBoost
- **Use Case**: High-accuracy predictions
- **Strengths**: Excellent performance, handles missing data
- **Features**: 200 estimators, learning rate 0.1

### 3. Neural Network
- **Use Case**: Complex pattern recognition
- **Strengths**: Captures non-linear relationships
- **Architecture**: 128-64-32-1 neurons with dropout

### Model Selection
The system automatically selects the best performing model based on R² score and uses it for all predictions.

## 📊 Data Processing

### Feature Engineering
- **Interaction Features**: Transport × Waste, Grocery × Meat
- **Efficiency Scores**: Waste efficiency, energy efficiency
- **Lifestyle Scores**: Combined screen time and consumption

### Data Validation
- **Missing Value Handling**: Median imputation for numeric, mode for categorical
- **Outlier Detection**: IQR-based outlier identification
- **Data Type Conversion**: Automatic type inference and conversion

## 🔄 Dynamic Retraining

### Automatic Retraining
- Models retrain when new user data is available
- Retraining happens in background to avoid delays
- Performance metrics are tracked and compared

### Retraining Triggers
- Every 10 new user submissions
- Weekly scheduled retraining
- Manual retraining via API endpoint

## 📈 Performance Monitoring

### Metrics Tracked
- **MAE**: Mean Absolute Error
- **R²**: Coefficient of determination
- **Feature Importance**: Model interpretability
- **Prediction Confidence**: Uncertainty estimation

### Model Comparison
- Side-by-side performance comparison
- Best model selection based on multiple metrics
- Performance degradation detection

## 🗄️ Database Schema

### User Submissions
```sql
user_submissions:
- id (Primary Key)
- submission_data (JSON)
- actual_co2 (Float)
- predicted_co2 (Float)
- city (String)
- area (String)
- created_at (DateTime)
```

### Key Features (for quick access)
- body_type, sex, diet
- transport, vehicle_distance
- grocery_bill, tv_pc_hours
- waste_bag_count, recycling_count

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string
- `MODEL_PATH`: Path to save/load models
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)

### Model Configuration
- Model parameters can be adjusted in `ml_service.py`
- Retraining frequency in `history_service.py`
- Recommendation rules in `recommendation_service.py`

## 🚀 Deployment

### Development
```bash
python run.py
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "run.py"]
```

## 📝 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testing

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
    ...
  }'
```

## 🔍 Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all dependencies are installed
2. **Database Errors**: Check SQLite file permissions
3. **Model Loading**: Verify CSV file path is correct
4. **Memory Issues**: Reduce model complexity or increase system memory

### Logs
- Check console output for detailed error messages
- Logs include model training progress and API requests
- Error logs are written to console with timestamps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the CO2 Prediction System and follows the same license terms.
