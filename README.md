# 🌱 Carbon Footprint Prediction App

A modern web application that predicts your carbon footprint using machine learning and provides personalized recommendations for reducing environmental impact.

## ✨ Features

- **📊 Smart Predictions**: AI-powered CO2 forecasting using XGBoost
- **📝 Interactive Survey**: Multi-step carbon footprint assessment
- **📈 Real-time Dashboard**: Live insights and analytics
- **🔄 Auto-Retraining**: Model improves every 20 submissions
- **📱 Responsive Design**: Works on all devices
- **🎯 Personalized Recommendations**: Tailored eco-friendly suggestions

## 🚀 Quick Start

### Option 1: Using Batch Files (Windows)
1. **Start Backend**: Double-click `start_backend.bat`
2. **Start Frontend**: Double-click `start_frontend.bat`
3. **Open Browser**: Go to `http://localhost:8080`

### Option 2: Manual Setup
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **XGBoost** - Gradient boosting for predictions
- **Scikit-learn** - Machine learning utilities
- **Pandas** - Data manipulation
- **SQLite** - Lightweight database
- **Pydantic** - Data validation

## 📁 Project Structure

```
project/
├── 📁 backend/              # Python FastAPI backend
│   ├── main.py             # FastAPI application entry point
│   ├── models/             # Pydantic data models
│   ├── services/           # ML and business logic services
│   ├── data/              # Training datasets
│   └── requirements.txt   # Python dependencies
├── 📁 src/                 # React frontend source
│   ├── pages/             # Main page components
│   ├── components/        # Reusable UI components
│   ├── services/          # API communication
│   ├── contexts/          # React state management
│   └── data/             # Static data files
├── 📄 package.json        # Node.js dependencies
├── 📄 vite.config.ts      # Vite configuration
├── 📄 SETUP_GUIDE.md      # Detailed setup instructions
├── 🚀 start_backend.bat   # Windows backend starter
└── 🚀 start_frontend.bat  # Windows frontend starter
```

## 🎯 How It Works

1. **User fills survey** → Transportation, energy, diet, waste data
2. **Data processed** → Converted to ML model format
3. **ML prediction** → XGBoost predicts next month's CO2
4. **Results displayed** → Dashboard shows current vs predicted
5. **Auto-retraining** → Model improves every 20 submissions

## 📊 Model Performance

- **R² Score**: 0.848 (84.8% variance explained)
- **MAE**: 242.9 kg (Mean Absolute Error)
- **Confidence**: 85% average prediction confidence
- **Auto-Retraining**: Every 20 user submissions

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Development
```bash
npm install
npm run dev
```

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/predict` - CO2 prediction
- `GET /api/submission-stats` - Retraining progress
- `POST /api/retrain` - Manual retraining

## 🌍 Environmental Impact

This application helps users:
- **Understand** their carbon footprint
- **Predict** future emissions
- **Reduce** environmental impact
- **Track** progress over time

## 📈 Future Enhancements

- [ ] **Real-time Charts**: Interactive CO2 trend visualization
- [ ] **Goal Setting**: Personal emission reduction targets
- [ ] **Social Features**: Compare with friends and family
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Carbon Credits**: Integration with offset programs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Dataset**: Carbon emission data from various sources
- **ML Models**: XGBoost and Scikit-learn
- **UI Components**: Lucide React icons
- **Styling**: Tailwind CSS framework

---

**Built with ❤️ for a sustainable future 🌱**
