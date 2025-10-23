// Emission factors and base multipliers for area analysis
// Based on real data provided by user

export interface AreaEmissionData {
  city: string;
  area: string;
  factors: {
    Residential: number;
    Corporate: number;
    Industrial: number;
    Vehicular: number;
    Construction: number;
    Airport: number;
  };
}

// Base multipliers (kg/month) for each sector - Updated with realistic values
const BASE_MULTIPLIERS = {
  Residential: 1,     // Direct values from dataset
  Corporate: 1,       // Direct values from dataset
  Industrial: 1,      // Direct values from dataset
  Vehicular: 1,       // Direct values from dataset
  Construction: 1,    // Direct values from dataset
  Airport: 1          // Direct values from dataset
};

// Emission factors data from user
const EMISSION_FACTORS: AreaEmissionData[] = [
  // Mumbai areas
  { city: 'Mumbai', area: 'Andheri (Airport area)', factors: { Residential: 39.00, Vehicular: 117.00, Corporate: 31.20, Industrial: 7.80, Construction: 26.00, Airport: 39.00 } },
  { city: 'Mumbai', area: 'BKC', factors: { Residential: 24.00, Vehicular: 60.00, Corporate: 132.00, Industrial: 4.80, Construction: 14.40, Airport: 4.80 } },
  { city: 'Mumbai', area: 'Borivali', factors: { Residential: 73.50, Vehicular: 94.50, Corporate: 16.80, Industrial: 6.30, Construction: 14.70, Airport: 4.20 } },
  { city: 'Mumbai', area: 'Chembur', factors: { Residential: 30.60, Vehicular: 63.75, Corporate: 25.50, Industrial: 114.75, Construction: 15.30, Airport: 5.10 } },
  { city: 'Mumbai', area: 'Goregaon', factors: { Residential: 57.50, Vehicular: 92.00, Corporate: 46.00, Industrial: 18.40, Construction: 11.50, Airport: 4.60 } },
  { city: 'Mumbai', area: 'Malad West', factors: { Residential: 67.50, Vehicular: 101.25, Corporate: 22.50, Industrial: 13.50, Construction: 15.75, Airport: 4.50 } },
  { city: 'Mumbai', area: 'Mazgaon', factors: { Residential: 42.30, Vehicular: 82.25, Corporate: 35.25, Industrial: 47.00, Construction: 23.50, Airport: 4.70 } },
  { city: 'Mumbai', area: 'Sion', factors: { Residential: 52.80, Vehicular: 91.20, Corporate: 36.00, Industrial: 36.00, Construction: 19.20, Airport: 4.80 } },
  { city: 'Mumbai', area: 'Worli', factors: { Residential: 45.00, Vehicular: 90.00, Corporate: 56.25, Industrial: 11.25, Construction: 18.00, Airport: 4.50 } },
  
  // Navi Mumbai areas
  { city: 'Navi Mumbai', area: 'Airoli', factors: { Residential: 63.00, Vehicular: 72.00, Corporate: 33.75, Industrial: 40.50, Construction: 11.25, Airport: 4.50 } },
  { city: 'Navi Mumbai', area: 'CBD Belapur', factors: { Residential: 57.40, Vehicular: 61.50, Corporate: 61.50, Industrial: 8.20, Construction: 12.30, Airport: 4.10 } },
  { city: 'Navi Mumbai', area: 'Ghansoli', factors: { Residential: 61.25, Vehicular: 73.50, Corporate: 29.40, Industrial: 61.25, Construction: 14.70, Airport: 4.90 } },
  { city: 'Navi Mumbai', area: 'Kharghar', factors: { Residential: 72.00, Vehicular: 84.00, Corporate: 36.00, Industrial: 28.80, Construction: 14.40, Airport: 4.80 } },
  { city: 'Navi Mumbai', area: 'Koparkhairane', factors: { Residential: 73.60, Vehicular: 75.90, Corporate: 34.50, Industrial: 27.60, Construction: 13.80, Airport: 4.60 } },
  { city: 'Navi Mumbai', area: 'Nerul', factors: { Residential: 75.90, Vehicular: 80.50, Corporate: 34.50, Industrial: 18.40, Construction: 16.10, Airport: 4.60 } },
  { city: 'Navi Mumbai', area: 'Taloja', factors: { Residential: 14.25, Vehicular: 42.75, Corporate: 8.55, Industrial: 199.50, Construction: 14.25, Airport: 5.70 } },
  { city: 'Navi Mumbai', area: 'Turbhe', factors: { Residential: 21.20, Vehicular: 66.25, Corporate: 13.25, Industrial: 145.75, Construction: 13.25, Airport: 5.30 } },
  { city: 'Navi Mumbai', area: 'Vashi', factors: { Residential: 70.50, Vehicular: 82.25, Corporate: 35.25, Industrial: 23.50, Construction: 18.80, Airport: 4.70 } }
];

export function getAreaEmissionData(city: string, area: string): AreaEmissionData | null {
  // Try exact match first
  let data = EMISSION_FACTORS.find(d => d.city === city && d.area === area);
  
  // If not found, try partial area match
  if (!data) {
    data = EMISSION_FACTORS.find(d => 
      d.city === city && 
      area.toLowerCase().includes(d.area.toLowerCase().split(' ')[0])
    );
  }
  
  // If still not found, use city defaults
  if (!data) {
    if (city === 'Mumbai') {
      data = EMISSION_FACTORS.find(d => d.city === 'Mumbai' && d.area === 'Borivali');
    } else if (city === 'Navi Mumbai') {
      data = EMISSION_FACTORS.find(d => d.city === 'Navi Mumbai' && d.area === 'Vashi');
    }
  }
  
  return data || null;
}

export function calculateAreaEmissions(city: string, area: string) {
  const areaData = getAreaEmissionData(city, area);
  if (!areaData) {
    // Fallback values
    return {
      Residential: 0,
      Corporate: 0,
      Industrial: 0,
      Vehicular: 0,
      Construction: 0,
      Airport: 0
    };
  }

  const emissions: { [key: string]: number } = {};
  
  Object.entries(areaData.factors).forEach(([sector, factor]) => {
    const baseMultiplier = BASE_MULTIPLIERS[sector as keyof typeof BASE_MULTIPLIERS];
    emissions[sector] = Number((factor * baseMultiplier).toFixed(2));
  });

  return emissions;
}
