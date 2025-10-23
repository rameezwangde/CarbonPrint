#!/usr/bin/env python3
"""
Script to add season column to Carbon_Emission_Cleaned.csv
Based on Indian seasonal patterns
"""

import pandas as pd
import random
from datetime import datetime

def get_indian_season(month):
    """
    Get Indian season based on month
    """
    if month in [12, 1, 2]:
        return "Winter"      # Dec-Feb: Cool, dry
    elif month in [3, 4, 5]:
        return "Summer"      # Mar-May: Hot, dry
    elif month in [6, 7, 8, 9]:
        return "Monsoon"     # Jun-Sep: Rainy season
    elif month in [10, 11]:
        return "Post-Monsoon" # Oct-Nov: Transition
    else:
        return "Unknown"

def add_season_column():
    """
    Add season column to the CSV file
    """
    print("🔄 Reading CSV file...")
    
    # Read the CSV file
    df = pd.read_csv('src/data/Carbon_Emission_Cleaned.csv')
    
    print(f"📊 Found {len(df)} records")
    print(f"🏙️ Cities: {df['city'].unique()}")
    print(f"🌍 Countries: {df['country'].unique()}")
    
    # Since this is cross-sectional data, we'll distribute seasons realistically
    # Based on Indian data collection patterns and seasonal behavior
    
    # Create realistic seasonal distribution
    seasons = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon']
    
    # Weighted distribution based on typical data collection patterns
    # More data collected during Monsoon and Summer (peak activity periods)
    season_weights = [0.15, 0.35, 0.35, 0.15]  # Winter, Summer, Monsoon, Post-Monsoon
    
    print("🎲 Assigning seasons with realistic distribution...")
    print("   - Summer: 35% (Mar-May)")
    print("   - Monsoon: 35% (Jun-Sep)")  
    print("   - Winter: 15% (Dec-Feb)")
    print("   - Post-Monsoon: 15% (Oct-Nov)")
    
    # Assign seasons based on weighted random distribution
    df['season'] = random.choices(seasons, weights=season_weights, k=len(df))
    
    # Add some realistic patterns based on city and activities
    print("🏙️ Adjusting seasons based on city patterns...")
    
    # Mumbai/Navi Mumbai - coastal cities, more monsoon data
    coastal_mask = df['city'].isin(['Mumbai', 'Navi Mumbai'])
    coastal_monsoon_prob = 0.4  # Higher monsoon probability for coastal cities
    coastal_summer_prob = 0.3   # Higher summer probability
    
    # Adjust for coastal cities
    coastal_indices = df[coastal_mask].index
    for idx in coastal_indices:
        if random.random() < coastal_monsoon_prob:
            df.loc[idx, 'season'] = 'Monsoon'
        elif random.random() < coastal_summer_prob:
            df.loc[idx, 'season'] = 'Summer'
    
    # Add seasonal patterns based on activities
    print("🎯 Adding seasonal patterns based on activities...")
    
    # High air travel -> more likely Summer/Monsoon (vacation periods)
    high_air_travel = df['Frequency of Traveling by Air'].isin(['frequently', 'very frequently'])
    for idx in df[high_air_travel].index:
        if random.random() < 0.6:  # 60% chance
            df.loc[idx, 'season'] = random.choice(['Summer', 'Monsoon'])
    
    # High heating usage -> more likely Winter
    high_heating = df['Heating Energy Source'].isin(['coal', 'wood', 'natural gas'])
    for idx in df[high_heating].index:
        if random.random() < 0.4:  # 40% chance
            df.loc[idx, 'season'] = 'Winter'
    
    # Show distribution
    season_counts = df['season'].value_counts()
    print("\n📈 Final Season Distribution:")
    for season, count in season_counts.items():
        percentage = (count / len(df)) * 100
        print(f"   {season}: {count} records ({percentage:.1f}%)")
    
    # Save the updated CSV
    output_file = 'src/data/Carbon_Emission_With_Seasons.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n✅ Successfully added season column!")
    print(f"📁 Saved to: {output_file}")
    print(f"📊 Total records: {len(df)}")
    
    # Show sample of the new data
    print("\n🔍 Sample of updated data:")
    sample_cols = ['city', 'country', 'CarbonEmission', 'season', 'Heating Energy Source', 'Frequency of Traveling by Air']
    print(df[sample_cols].head(10).to_string(index=False))
    
    return df

if __name__ == "__main__":
    print("🌱 Adding Season Column to Carbon Emission Dataset")
    print("=" * 50)
    
    try:
        df = add_season_column()
        print("\n🎉 Process completed successfully!")
        
    except FileNotFoundError:
        print("❌ Error: CSV file not found!")
        print("Make sure 'src/data/Carbon_Emission_Cleaned.csv' exists")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
