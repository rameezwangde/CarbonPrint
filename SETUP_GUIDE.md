# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend  
cd project
npm install
npm run dev
# Carbon Footprint Prediction App - Setup Guide

This guide will help you set up and run both the frontend and backend of the Carbon Footprint Prediction application.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd project-bolt-sb1-16wyq3mo/project
```

### 2. Backend Setup (Python/FastAPI)

#### Navigate to backend directory:
```bash
cd backend
```

#### Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### Start the backend server:
```bash
python main.py
```

**Backend will be running on:** `http://localhost:9000`

**Available endpoints:**
- `GET /api/health` - Health check
- `POST /api/predict` - CO2 prediction
- `GET /api/submission-stats` - Submission statistics
- `POST /api/retrain` - Manual model retraining

### 3. Frontend Setup (React/Vite)

#### Open a new terminal and navigate to project root:
```bash
cd project
```

#### Install Node.js dependencies:
```bash
npm install
```

#### Start the frontend development server:
```bash
npm run dev
```

**Frontend will be running on:** `http://localhost:8080`

## 🔧 Detailed Setup Instructions

### Backend (Python/FastAPI)

#### Step 1: Python Environment
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Step 2: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 3: Run Backend
```bash
python main.py
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:9000
```

### Frontend (React/Vite)

#### Step 1: Install Dependencies
```bash
cd project
npm install
```

#### Step 2: Start Development Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v4.4.5  ready in 500 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

## 🌐 Access the Application

1. **Open your browser** and go to `http://localhost:8080`
2. **Fill out the survey** with your carbon footprint data
3. **View predictions** and insights on the dashboard

## 🔄 Auto-Retraining Feature

The application automatically retrains the ML model every 20 user submissions:

- **Counter**: Shows "X/20 submissions until retrain" in the dashboard
- **Automatic**: No manual intervention required
- **Transparent**: Progress visible in the UI
- **Reliable**: Continues working even if retraining fails

## 🛠️ Troubleshooting

### Backend Issues

#### Port 9000 already in use:
```bash
# Find process using port 9000
netstat -ano | findstr :9000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Python dependencies not found:
```bash
# Reinstall requirements
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Issues

#### Port 8080 already in use:
```bash
# Kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### Node modules issues:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

#### Vite proxy issues:
- Ensure backend is running on port 9000
- Check `vite.config.ts` proxy configuration
- Restart both frontend and backend

### Common Issues

#### CORS errors:
- Backend CORS is configured for `http://localhost:8080`
- Ensure frontend is running on port 8080
- Check browser console for specific CORS errors

#### API connection failed:
- Verify backend is running: `http://localhost:9000/api/health`
- Check network tab in browser dev tools
- Ensure no firewall blocking the connection

## 📁 Project Structure

```
project/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── models/             # Pydantic models
│   ├── services/           # ML and business logic
│   ├── data/              # Training data
│   └── requirements.txt   # Python dependencies
├── src/                   # React frontend
│   ├── pages/            # React components
│   ├── components/       # Reusable components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   └── data/            # Static data files
├── package.json          # Node.js dependencies
├── vite.config.ts        # Vite configuration
└── SETUP_GUIDE.md       # This file
```

## 🚀 Production Deployment

### Backend (Production)
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:9000
```

### Frontend (Production)
```bash
# Build for production
npm run build

# Serve with a static server
npm install -g serve
serve -s dist -l 8080
```

## 📞 Support

If you encounter any issues:

1. **Check the logs** in both terminal windows
2. **Verify ports** 8080 and 9000 are available
3. **Check dependencies** are properly installed
4. **Restart both services** if needed

## 🎯 Features

- ✅ **Survey Form**: Multi-step carbon footprint assessment
- ✅ **ML Predictions**: AI-powered CO2 forecasting
- ✅ **Dashboard**: Interactive insights and analytics
- ✅ **Auto-Retraining**: Model improves with more data
- ✅ **Real-time Updates**: Live submission counter
- ✅ **Responsive Design**: Works on all devices

---

**Happy coding! 🌱**
