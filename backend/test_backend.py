#!/usr/bin/env python3
"""
Test script for CO2 Prediction Backend
This script tests all major backend functionality
"""

import requests
import json
import time
import sys

# Backend URL
BASE_URL = "http://localhost:9000"

def test_health_check():
    """Test health check endpoint"""
    print("[INFO] Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Health check passed: {data}")
            return True
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Health check error: {e}")
        return False

def test_prediction():
    """Test CO2 prediction endpoint"""
    print("[INFO] Testing CO2 prediction...")
    
    # Sample user submission
    sample_submission = {
        "body_type": "normal",
        "sex": "male",
        "diet": "vegetarian",
        "shower_frequency": "daily",
        "heating_energy": "natural gas",
        "transport": 0.0,
        "vehicle_distance": 1000.0,
        "air_travel": "rarely",
        "social_activity": "often",
        "grocery_bill": 200.0,
        "new_clothes": 3,
        "tv_pc_hours": 4.0,
        "internet_hours": 6.0,
        "energy_efficiency": "Yes",
        "recycling": ["Paper", "Plastic"],
        "waste_bag_size": 10.0,
        "waste_bag_count": 2,
        "cooking_methods": ["Stove", "Microwave"],
        "city": "Mumbai",
        "area": "Worli"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/predict",
            json=sample_submission,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Prediction successful:")
            print(f"   Predicted CO2: {data.get('predicted_co2', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            print(f"   Model Used: {data.get('model_used', 'N/A')}")
            return True
        else:
            print(f"[ERROR] Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Prediction error: {e}")
        return False

def test_recommendations():
    """Test recommendations endpoint"""
    print("[INFO] Testing recommendations...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/recommendations",
            params={
                "city": "Mumbai",
                "area": "Worli",
                "current_co2": 2500.0
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Recommendations received: {len(data)} items")
            for i, rec in enumerate(data[:3], 1):
                print(f"   {i}. {rec.get('title', 'N/A')} - {rec.get('potential_savings', 'N/A')} kg CO2")
            return True
        else:
            print(f"[ERROR] Recommendations failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Recommendations error: {e}")
        return False

def test_user_history():
    """Test user history endpoint"""
    print("[INFO] Testing user history...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/history/Mumbai/Worli?limit=5")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] User history received: {len(data)} entries")
            return True
        else:
            print(f"[ERROR] User history failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] User history error: {e}")
        return False

def test_area_stats():
    """Test area statistics endpoint"""
    print("[INFO] Testing area statistics...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/area-stats/Mumbai/Worli")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Area stats received:")
            print(f"   Total users: {data.get('total_users', 'N/A')}")
            print(f"   Avg CO2: {data.get('avg_co2', 'N/A')}")
            return True
        else:
            print(f"[ERROR] Area stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Area stats error: {e}")
        return False

def test_model_performance():
    """Test model performance endpoint"""
    print("[INFO] Testing model performance...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/model-performance")
        
        if response.status_code == 200:
            data = response.json()
            print(f"[SUCCESS] Model performance received:")
            print(f"   Models loaded: {data.get('models_loaded', 'N/A')}")
            print(f"   Best model: {data.get('best_model', 'N/A')}")
            return True
        else:
            print(f"[ERROR] Model performance failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Model performance error: {e}")
        return False

def main():
    """Run all tests"""
    print("CO2 Prediction Backend Test Suite")
    print("=" * 50)
    
    # Wait for server to start
    print("[INFO] Waiting for server to start...")
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health_check),
        ("CO2 Prediction", test_prediction),
        ("Recommendations", test_recommendations),
        ("User History", test_user_history),
        ("Area Statistics", test_area_stats),
        ("Model Performance", test_model_performance)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n[TEST] {test_name}")
        print("-" * 30)
        if test_func():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"[RESULTS] Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("[SUCCESS] All tests passed! Backend is working correctly.")
        return 0
    else:
        print("[ERROR] Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
