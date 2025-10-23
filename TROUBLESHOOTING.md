# 🔧 Troubleshooting Guide

Common issues and solutions for the Carbon Footprint Prediction App.

## 🚨 Common Issues

### Backend Won't Start

#### Issue: Port 9000 already in use
```bash
# Find what's using port 9000
netstat -ano | findstr :9000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

#### Issue: Python dependencies not found
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

#### Issue: Module not found errors
```bash
# Make sure you're in the backend directory
cd backend
python main.py
```

### Frontend Won't Start

#### Issue: Port 8080 already in use
```bash
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F
```

#### Issue: Node modules not found
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

#### Issue: Vite proxy errors
- Ensure backend is running on port 9000
- Check `vite.config.ts` proxy configuration
- Restart both frontend and backend

### API Connection Issues

#### Issue: CORS errors
- Backend CORS is configured for `http://localhost:8080`
- Ensure frontend is running on port 8080
- Check browser console for specific errors

#### Issue: 404 Not Found
- Verify backend is running: `http://localhost:9000/api/health`
- Check network tab in browser dev tools
- Ensure no firewall blocking connection

#### Issue: 500 Internal Server Error
- Check backend terminal for error logs
- Verify all required fields are being sent
- Check database connection

## 🔍 Debugging Steps

### 1. Check Service Status
```bash
# Backend health check
curl http://localhost:9000/api/health

# Frontend accessibility
curl http://localhost:8080
```

### 2. Check Logs
- **Backend**: Look at terminal where `python main.py` is running
- **Frontend**: Check browser console (F12)
- **Network**: Check Network tab in browser dev tools

### 3. Verify Dependencies
```bash
# Backend
cd backend
pip list

# Frontend
npm list
```

### 4. Reset Everything
```bash
# Stop all services (Ctrl+C in terminals)
# Clear frontend cache
rm -rf node_modules
npm install

# Reinstall backend dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Restart both services
```

## 🛠️ Advanced Troubleshooting

### Database Issues
```bash
# Check if database exists
cd backend
ls -la *.db

# Reset database (if needed)
rm co2_predictions.db
python main.py
```

### ML Model Issues
```bash
# Check if models are loading
curl http://localhost:9000/api/health

# Manual retraining
curl -X POST http://localhost:9000/api/retrain
```

### Memory Issues
- Close other applications
- Restart your computer
- Check available RAM (8GB+ recommended)

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** in both terminal windows
2. **Verify ports** 8080 and 9000 are available
3. **Check dependencies** are properly installed
4. **Restart both services** if needed
5. **Check firewall/antivirus** settings

## 🎯 Quick Fixes

### Windows Users
```cmd
# Kill all Node processes
taskkill /f /im node.exe

# Kill all Python processes
taskkill /f /im python.exe

# Restart services
start_backend.bat
start_frontend.bat
```

### macOS/Linux Users
```bash
# Kill processes on ports
lsof -ti:8080 | xargs kill -9
lsof -ti:9000 | xargs kill -9

# Restart services
cd backend && python main.py &
cd .. && npm run dev
```

---

**Still having issues? Check the main README.md for more details!** 📚
