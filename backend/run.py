#!/usr/bin/env python3
"""
CO2 Prediction Backend Server
Run this script to start the FastAPI backend server
"""

import uvicorn
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting CO2 Prediction Backend Server...")
    print("Server will be available at: http://localhost:9000")
    print("API Documentation: http://localhost:9000/docs")
    print("Health Check: http://localhost:9000/api/health")
    print("\n" + "="*50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
        log_level="info"
    )
