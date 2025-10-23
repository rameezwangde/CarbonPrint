# Carbon Footprint App - Start All Services
Write-Host "🌱 Starting Carbon Footprint Prediction App..." -ForegroundColor Green
Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
    Set-Location backend
    Write-Host "Installing Python dependencies..."
    pip install -r requirements.txt
    Write-Host "Starting FastAPI server on port 9000..."
    Start-Process python -ArgumentList "main.py" -WindowStyle Normal
    Set-Location ..
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
    Write-Host "Installing Node.js dependencies..."
    npm install
    Write-Host "Starting Vite dev server on port 8080..."
    Start-Process npm -ArgumentList "run", "dev" -WindowStyle Normal
}

# Start both services
Start-Backend
Start-Sleep -Seconds 3
Start-Frontend

Write-Host ""
Write-Host "✅ Both services are starting up!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📡 Backend: http://localhost:9000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
