import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Papa from 'papaparse';
import { PredictionResponse, Recommendation, PeerComparison } from '../services/apiService';

export interface CarbonEmissionData {
  area: string;
  total_co2: number;
  avg_CO2: number;
  benchmark: number;
  target?: number;
  city?: string;
  country?: string;
  area_type?: string;
  carbonEmission?: number;
  count?: number; // Number of records for this area
}

interface UserPredictionData {
  carbonFootprint: number;
  predictedCO2?: number;
  confidence?: number;
  modelUsed?: string;
  recommendations?: Recommendation[];
  peerComparison?: PeerComparison;
  ecoScore: number;
  timestamp: string;
  city?: string;
  area?: string;
}

interface DataContextType {
  emissionData: CarbonEmissionData[];
  selectedArea: string | null;
  setSelectedArea: (area: string | null) => void;
  loading: boolean;
  error: string | null;
  loadYourData: () => Promise<void>;
  userPrediction: UserPredictionData | null;
  setUserPrediction: (data: UserPredictionData | null) => void;
  refreshUserPrediction: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [emissionData, setEmissionData] = useState<CarbonEmissionData[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPrediction, setUserPrediction] = useState<UserPredictionData | null>(null);



  const loadYourData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/Carbon_Emission_With_Seasons.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV file');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as any[];
          
          // Group data by area and calculate aggregated values
          const areaMap = new Map<string, {
            area: string;
            total_co2: number;
            carbonEmissions: number[];
            city?: string;
            country?: string;
            area_type?: string;
            count: number;
          }>();

          parsedData.forEach(row => {
            const area = row.area?.trim();
            if (!area) return;

            const totalCo2 = parseFloat(row.total_co2) || 0;
            const areaTotalEmission = parseFloat(row.area_total_emission) || 0;

            if (!areaMap.has(area)) {
              areaMap.set(area, {
                area,
                total_co2: 0,
                carbonEmissions: [],
                city: row.city?.trim(),
                country: row.country?.trim(),
                area_type: row.area_type_raw?.trim(),
                count: 0
              });
            }

            const areaData = areaMap.get(area)!;
            areaData.total_co2 += areaTotalEmission; // Use area_total_emission for total
            areaData.carbonEmissions.push(totalCo2); // Use total_co2 for individual records
            areaData.count += 1;
          });

          // Convert to CarbonEmissionData format
          const cleanedData: CarbonEmissionData[] = Array.from(areaMap.values()).map(areaData => {
            // Filter out extreme outliers (values > 500 kg are unrealistic)
            const realisticValues = areaData.carbonEmissions.filter(val => val <= 500);
            
            // Use median for more robust calculation, fallback to mean if no realistic values
            let avgCO2;
            if (realisticValues.length > 0) {
              const sortedValues = realisticValues.sort((a, b) => a - b);
              const mid = Math.floor(sortedValues.length / 2);
              avgCO2 = sortedValues.length % 2 === 0 
                ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 
                : sortedValues[mid];
            } else {
              // Fallback to mean if all values are outliers
              avgCO2 = areaData.carbonEmissions.reduce((sum, val) => sum + val, 0) / areaData.carbonEmissions.length;
            }
            
            const benchmark = 250; // Realistic benchmark for carbon emissions (kg/month)
            const target = benchmark * 0.8; // Target is 20% below benchmark (200 kg/month)

            return {
              area: areaData.area,
              total_co2: areaData.total_co2, // This is the sum of area_total_emission values
              avg_CO2: avgCO2, // This is the median of realistic total_co2 values (per-person)
              benchmark,
              target,
              city: areaData.city,
              country: areaData.country,
              area_type: areaData.area_type,
              carbonEmission: avgCO2,
              count: areaData.count
            };
          });

          if (cleanedData.length === 0) {
            throw new Error('No valid data found in CSV file');
          }

          setEmissionData(cleanedData);
          setLoading(false);
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CSV file');
      setLoading(false);
    }
  }, []);

  const refreshUserPrediction = useCallback(() => {
    const savedData = localStorage.getItem('userSurveyData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Refreshed user prediction data:', parsedData);
        
        // Map the stored data to UserPredictionData format
        const userPredictionData: UserPredictionData = {
          carbonFootprint: parsedData.carbonFootprint || 0,
          predictedCO2: parsedData.predictedCO2,
          confidence: parsedData.confidence,
          modelUsed: parsedData.modelUsed,
          recommendations: parsedData.recommendations,
          peerComparison: parsedData.peerComparison,
          ecoScore: parsedData.ecoScore || 0,
          timestamp: parsedData.timestamp,
          city: parsedData.city,
          area: parsedData.area
        };
        
        setUserPrediction(userPredictionData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  }, []);


  // Load user prediction data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('userSurveyData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Loaded user prediction data:', parsedData);
        
        // Map the stored data to UserPredictionData format
        const userPredictionData: UserPredictionData = {
          carbonFootprint: parsedData.carbonFootprint || 0,
          predictedCO2: parsedData.predictedCO2,
          confidence: parsedData.confidence,
          modelUsed: parsedData.modelUsed,
          recommendations: parsedData.recommendations,
          peerComparison: parsedData.peerComparison,
          ecoScore: parsedData.ecoScore || 0,
          timestamp: parsedData.timestamp,
          city: parsedData.city,
          area: parsedData.area
        };
        
        setUserPrediction(userPredictionData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    } else {
      console.log('No user prediction data found in localStorage');
    }
  }, []);

  // Load your CSV data on mount
  useEffect(() => {
    loadYourData();
  }, [loadYourData]);

  const value: DataContextType = {
    emissionData,
    selectedArea,
    setSelectedArea,
    loading,
    error,
    loadYourData,
    userPrediction,
    setUserPrediction,
    refreshUserPrediction,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
