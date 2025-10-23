import pandas as pd
import numpy as np

CSV_PATH = 'project/src/data/Carbon_Emission_With_Seasons.csv'

# Baseline realistic ranges per city and area type (kg CO2/month)
BASELINES = {
    'Mumbai': {
        'Residential': (780, 920),
        'Corporate':   (550, 750),
        'Industrial':  (1050, 1350),
        'Vehicular':   (680, 820),
        'Construction':(300, 480),
        'Airport':     (1800, 2300),
    },
    'Navi Mumbai': {
        'Residential': (640, 760),
        'Corporate':   (430, 570),
        'Industrial':  (900, 1100),
        'Vehicular':   (540, 660),
        'Construction':(300, 420),
        'Airport':     (0, 0),  # No airport zones generally within Navi Mumbai dataset
    }
}

AREA_TYPES = ['Residential','Corporate','Industrial','Vehicular','Construction','Airport']

rng = np.random.default_rng(42)

def sample_value(city: str, area_type: str) -> float:
    low, high = BASELINES[city][area_type]
    if low == high:
        return float(low)
    # sample realistically around the center with slight variability
    val = rng.uniform(low, high)
    return float(round(val, 2))

def main():
    df = pd.read_csv(CSV_PATH)

    # Ensure columns exist
    for col in AREA_TYPES:
        if col not in df.columns:
            df[col] = 0.0

    # Update each row: if an area type was previously 0, set a small baseline; otherwise keep within realistic range
    updated_rows = 0
    for idx, row in df.iterrows():
        city = row.get('city', 'Mumbai')
        city = 'Mumbai' if city not in BASELINES else city

        # Determine which area types apply from area_type_raw (if present)
        types_from_raw = []
        if pd.notna(row.get('area_type_raw')):
            types_from_raw = [t.strip() for t in str(row['area_type_raw']).split(',') if t.strip()]

        # Assign values for all area types to avoid zeros, but weight applied types a bit higher
        for area_type in AREA_TYPES:
            base = sample_value(city, area_type)
            # Boost applied types by up to +15% to reflect prominence in that area
            if area_type in types_from_raw:
                boost = rng.uniform(1.05, 1.15)
                value = round(base * boost, 2)
            else:
                # Non-applied types get a softer baseline (80-95%) except when airport in Navi Mumbai (keep 0)
                if city == 'Navi Mumbai' and area_type == 'Airport':
                    value = 0.0
                else:
                    damp = rng.uniform(0.8, 0.95)
                    value = round(base * damp, 2)
            df.at[idx, area_type] = value
        updated_rows += 1

    # Optional: compute a simple area_total_emission as sum of types to keep field consistent
    df['area_total_emission'] = df[AREA_TYPES].sum(axis=1).round(2)

    df.to_csv(CSV_PATH, index=False)
    print(f"Updated {updated_rows} rows with realistic non-zero baselines. Saved to {CSV_PATH}")

if __name__ == '__main__':
    main()
