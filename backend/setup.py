#!/usr/bin/env python3
"""
Setup script for CO2 Prediction Backend
This script sets up the Python environment and installs dependencies
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"[INFO] {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"[SUCCESS] {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] {description} failed: {e.stderr}")
        return False

def main():
    print("Setting up CO2 Prediction Backend...")
    print("=" * 50)
    
    # Check if Python 3.8+ is available
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("[ERROR] Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"[SUCCESS] Python {python_version.major}.{python_version.minor} detected")
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("[ERROR] Failed to install dependencies")
        sys.exit(1)
    
    # Create necessary directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    print("[SUCCESS] Directories created")
    
    # Test imports
    print("[INFO] Testing imports...")
    try:
        import fastapi
        import pandas
        import sklearn
        import xgboost
        import tensorflow
        print("[SUCCESS] All imports successful")
    except ImportError as e:
        print(f"[ERROR] Import test failed: {e}")
        sys.exit(1)
    
    print("\n[SUCCESS] Setup completed successfully!")
    print("\nNext steps:")
    print("1. Run the backend: python run.py")
    print("2. Open API docs: http://localhost:8000/docs")
    print("3. Test health: http://localhost:8000/api/health")
    print("\nFor development:")
    print("- Backend runs on: http://localhost:8000")
    print("- Frontend should connect to: http://localhost:8000")

if __name__ == "__main__":
    main()
