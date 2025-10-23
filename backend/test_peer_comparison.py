import pandas as pd
import traceback

try:
    print("Loading CSV...")
    df = pd.read_csv("../src/data/Carbon_Emission_With_Seasons.csv")
    print(f"CSV loaded successfully. Shape: {df.shape}")
    
    print("\nTesting area filtering...")
    user_area = 'Chembur'
    area_data = df[df['area'] == user_area]
    print(f"Area data found: {len(area_data)} records for {user_area}")
    
    if not area_data.empty:
        area_avg = round(area_data['CarbonEmission'].mean() / 30, 1)
        print(f"Area average: {area_avg}")
    else:
        print("No area data found!")
    
    print("\nTesting city filtering...")
    user_city = 'Mumbai'
    city_data = df[df['city'] == user_city]
    print(f"City data found: {len(city_data)} records for {user_city}")
    
    if not city_data.empty:
        city_avg = round(city_data['CarbonEmission'].mean() / 30, 1)
        print(f"City average: {city_avg}")
    else:
        print("No city data found!")
        
    print("\nTesting breakdown calculation...")
    if not area_data.empty:
        area_breakdown = {
            'transportation': round(area_data['Transport_share'].mean() * area_avg, 1),
            'electricity': round(area_avg * 0.3, 1),
            'lpg_usage': round(area_data['lpg_kg'].mean() / 30, 1),
            'air_travel': round(area_data['flights_hours'].mean() * 0.255, 1),
            'meat_meals': round(area_data['meat_meals'].mean() * 2.5 / 30, 1),
            'dining_out': round(area_data['dining_out'].mean() * 2.0 / 30, 1),
            'waste': round(area_data['waste_kg'].mean() * 0.5 / 30, 1)
        }
        print(f"Area breakdown: {area_breakdown}")
    
    print("\nTest completed successfully!")
    
except Exception as e:
    print(f"Error: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")
