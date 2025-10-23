@echo off
echo Starting Carbon Footprint Backend...
echo.

cd backend
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting backend server on port 9000...
python main.py

pause
