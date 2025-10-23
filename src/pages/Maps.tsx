import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// import { useDataContext } from '../contexts/DataContext'; // Removed unused import
import { apiService } from '../services/apiService';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Area coordinates for Mumbai and Navi Mumbai (corrected)
const AREA_COORDINATES = {
  // Mumbai Areas
  'Andheri (Airport area)': [19.1136, 72.8697],
  'Bandra Kurla Complex': [19.0544, 72.8406],
  'Worli': [19.0176, 72.8262],
  'Goregaon': [19.1547, 72.8575],
  'Sion': [19.0176, 72.8562],
  'Mazgaon': [18.9878, 72.8364],
  'Malad West': [19.1861, 72.8481],
  'Borivali': [19.2307, 72.8607],
  'Chembur': [19.0519, 72.8955],
  
  // Navi Mumbai Areas (corrected coordinates)
  'Nerul': [19.0330, 73.0197],
  'Vashi': [19.0736, 72.9986],
  'Koparkhairane': [19.1036, 73.0103],
  'Airoli': [19.1506, 72.9961],
  'Ghansoli': [19.1167, 73.0000],
  'Kharghar': [19.0506, 73.0619],
  'Turbhe': [19.0668, 73.0211], // Turbhe - corrected coordinates
  'Taloja': [19.0833, 73.0833],
  'CBD Belapur': [19.0167, 73.0333]
};

// CO2 level thresholds
const CO2_THRESHOLDS = {
  LOW: 240,    // Green
  MEDIUM: 260, // Orange
  HIGH: 280    // Red
};

// Pie chart colors for sectors
const SECTOR_COLORS = {
  'Residential': '#3B82F6',
  'Corporate': '#10B981',
  'Industrial': '#F59E0B',
  'Vehicular': '#EF4444',
  'Construction': '#8B5CF6',
  'Airport': '#06B6D4'
};

interface AreaData {
  name: string;
  co2: number;
  users: number;
  city: string;
  breakdown: {
    Residential: number;
    Corporate: number;
    Industrial: number;
    Vehicular: number;
    Construction: number;
    Airport: number;
  };
  prediction?: {
    month: string;
    season: string;
    value: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MapsProps {
  // No props needed for this component
}

const Maps: React.FC<MapsProps> = () => {
  // const { userPrediction } = useDataContext(); // Removed unused variable
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [filters, setFilters] = useState({
    co2Level: 'All',
    sector: 'All',
    city: 'All'
  });

  const [scenarios, setScenarios] = useState({
    electricVehicles: false,
    renewableEnergy: false,
    greenBuildings: false,
    publicTransport: false,
    wasteReduction: false,
    industrialEfficiency: false
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load area data from API
  const loadAreaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMapsData();
      
      if (data.areas) {
        setAreaData(data.areas);
      } else {
        // Fallback to generated data if API fails
        const areas = Object.keys(AREA_COORDINATES).map(areaName => {
          const city = areaName.includes('Navi Mumbai') || 
                      ['Nerul', 'Vashi', 'Koparkhairane', 'Airoli', 'Ghansoli', 'Kharghar', 'Turbhe', 'Taloja', 'CBD Belapur'].includes(areaName) 
                      ? 'Navi Mumbai' : 'Mumbai';
          
          const baseCO2 = city === 'Navi Mumbai' ? 230 + Math.random() * 50 : 240 + Math.random() * 40;
          const users = Math.floor(1200 + Math.random() * 300);
          
          return {
            name: areaName,
            co2: Math.round(baseCO2 * 10) / 10,
            users,
            city,
            breakdown: {
              Residential: Math.round(baseCO2 * 0.3 * 10) / 10,
              Corporate: Math.round(baseCO2 * 0.25 * 10) / 10,
              Industrial: Math.round(baseCO2 * 0.2 * 10) / 10,
              Vehicular: Math.round(baseCO2 * 0.15 * 10) / 10,
              Construction: Math.round(baseCO2 * 0.05 * 10) / 10,
              Airport: Math.round(baseCO2 * 0.05 * 10) / 10,
            }
          };
        });
        
        setAreaData(areas);
      }
    } catch (error) {
      console.error('Error loading area data:', error);
      setError('Failed to load map data. Using fallback data.');
      // Fallback to generated data
      const areas = Object.keys(AREA_COORDINATES).map(areaName => {
        const city = areaName.includes('Navi Mumbai') || 
                    ['Nerul', 'Vashi', 'Koparkhairane', 'Airoli', 'Ghansoli', 'Kharghar', 'Turbhe', 'Taloja', 'CBD Belapur'].includes(areaName) 
                    ? 'Navi Mumbai' : 'Mumbai';
        
        const baseCO2 = city === 'Navi Mumbai' ? 230 + Math.random() * 50 : 240 + Math.random() * 40;
        const users = Math.floor(1200 + Math.random() * 300);
        
        return {
          name: areaName,
          co2: Math.round(baseCO2 * 10) / 10,
          users,
          city,
          breakdown: {
            Residential: Math.round(baseCO2 * 0.3 * 10) / 10,
            Corporate: Math.round(baseCO2 * 0.25 * 10) / 10,
            Industrial: Math.round(baseCO2 * 0.2 * 10) / 10,
            Vehicular: Math.round(baseCO2 * 0.15 * 10) / 10,
            Construction: Math.round(baseCO2 * 0.05 * 10) / 10,
            Airport: Math.round(baseCO2 * 0.05 * 10) / 10,
          }
        };
      });
      
      setAreaData(areas);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate prediction for selected area
  const generatePrediction = useCallback((area: AreaData) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // const seasons = ['Winter', 'Summer', 'Monsoon']; // Removed unused variable
    
    // Generate realistic seasonal predictions
    const seasonalMultipliers = {
      'Winter': 1.0,
      'Summer': 1.05,
      'Monsoon': 0.95
    };
    
    const baseCO2 = area.co2;
    let maxPrediction = 0;
    let maxMonth = '';
    let maxSeason = '';
    
    months.forEach((month, index) => {
      const season = index < 3 ? 'Winter' : index < 6 ? 'Summer' : index < 9 ? 'Monsoon' : 'Winter';
      const multiplier = seasonalMultipliers[season as keyof typeof seasonalMultipliers];
      const prediction = baseCO2 * multiplier + (Math.random() - 0.5) * 20;
      
      if (prediction > maxPrediction) {
        maxPrediction = prediction;
        maxMonth = month;
        maxSeason = season;
      }
    });
    
    return {
      month: maxMonth,
      season: maxSeason,
      value: Math.round(maxPrediction * 10) / 10
    };
  }, []);

  // Get marker color based on CO2 level
  const getMarkerColor = useCallback((co2: number) => {
    if (co2 <= CO2_THRESHOLDS.LOW) return '#10B981'; // Green
    if (co2 <= CO2_THRESHOLDS.MEDIUM) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  }, []);

  // Calculate scenario impact on CO2 levels
  const calculateScenarioImpact = useCallback((area: AreaData) => {
    let impactMultiplier = 1;
    const impactBreakdown = { ...area.breakdown };

    if (scenarios.electricVehicles) {
      impactMultiplier *= 0.85; // 15% reduction in vehicular emissions
      impactBreakdown.Vehicular *= 0.85;
    }
    if (scenarios.renewableEnergy) {
      impactMultiplier *= 0.90; // 10% reduction in residential/industrial
      impactBreakdown.Residential *= 0.90;
      impactBreakdown.Industrial *= 0.90;
    }
    if (scenarios.greenBuildings) {
      impactMultiplier *= 0.88; // 12% reduction in construction
      impactBreakdown.Construction *= 0.88;
    }
    if (scenarios.publicTransport) {
      impactMultiplier *= 0.80; // 20% reduction in vehicular
      impactBreakdown.Vehicular *= 0.80;
    }
    if (scenarios.wasteReduction) {
      impactMultiplier *= 0.95; // 5% overall reduction
    }
    if (scenarios.industrialEfficiency) {
      impactMultiplier *= 0.82; // 18% reduction in industrial
      impactBreakdown.Industrial *= 0.82;
    }

    return {
      ...area,
      co2: Math.round(area.co2 * impactMultiplier * 10) / 10,
      breakdown: {
        Residential: Math.round(impactBreakdown.Residential * 10) / 10,
        Corporate: Math.round(impactBreakdown.Corporate * 10) / 10,
        Industrial: Math.round(impactBreakdown.Industrial * 10) / 10,
        Vehicular: Math.round(impactBreakdown.Vehicular * 10) / 10,
        Construction: Math.round(impactBreakdown.Construction * 10) / 10,
        Airport: Math.round(impactBreakdown.Airport * 10) / 10,
      }
    };
  }, [scenarios]);

  // Get marker size based on CO2 level
  const getMarkerSize = useCallback((co2: number) => {
    if (co2 <= CO2_THRESHOLDS.LOW) return 24;
    if (co2 <= CO2_THRESHOLDS.MEDIUM) return 30;
    return 36;
  }, []);

  // Filter areas based on current filters and apply scenario impacts
  const filteredAreas = useMemo(() => {
    if (!areaData || areaData.length === 0) return [];
    
    return areaData
      .map(area => calculateScenarioImpact(area)) // Apply scenario impacts
      .filter(area => {
        const co2Match = filters.co2Level === 'All' || 
          (filters.co2Level === 'Low' && area.co2 <= CO2_THRESHOLDS.LOW) ||
          (filters.co2Level === 'Medium' && area.co2 > CO2_THRESHOLDS.LOW && area.co2 <= CO2_THRESHOLDS.MEDIUM) ||
          (filters.co2Level === 'High' && area.co2 > CO2_THRESHOLDS.MEDIUM);
        
        const cityMatch = filters.city === 'All' || area.city === filters.city;
        
        const sectorMatch = filters.sector === 'All' || area.breakdown[filters.sector as keyof typeof area.breakdown] > 0;
        
        return co2Match && cityMatch && sectorMatch;
      });
  }, [areaData, filters, calculateScenarioImpact]);

  // Get top and bottom areas
  const topAreas = useMemo(() => {
    return [...areaData].sort((a, b) => b.co2 - a.co2).slice(0, 3);
  }, [areaData]);

  const bottomAreas = useMemo(() => {
    return [...areaData].sort((a, b) => a.co2 - b.co2).slice(0, 3);
  }, [areaData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const avgCO2 = areaData.length > 0 ? areaData.reduce((sum, area) => sum + area.co2, 0) / areaData.length : 0;
    const mumbaiAreas = areaData.filter(area => area.city === 'Mumbai');
    const naviMumbaiAreas = areaData.filter(area => area.city === 'Navi Mumbai');
    const mumbaiAvg = mumbaiAreas.length > 0 ? mumbaiAreas.reduce((sum, area) => sum + area.co2, 0) / mumbaiAreas.length : 0;
    const naviMumbaiAvg = naviMumbaiAreas.length > 0 ? naviMumbaiAreas.reduce((sum, area) => sum + area.co2, 0) / naviMumbaiAreas.length : 0;
    
    // Calculate total users with safety check for NaN/undefined
    const totalUsers = areaData.reduce((sum, area) => {
      const users = area.users || 0;
      return sum + (isNaN(users) ? 0 : users);
    }, 0);
    
    return {
      totalUsers,
      avgCO2: Math.round(avgCO2 * 10) / 10,
      mumbaiAvg: Math.round(mumbaiAvg * 10) / 10,
      naviMumbaiAvg: Math.round(naviMumbaiAvg * 10) / 10
    };
  }, [areaData]);

  // Handle area click
  const handleAreaClick = useCallback((area: AreaData) => {
    const prediction = generatePrediction(area);
    setSelectedArea({ ...area, prediction });
    setShowDetails(true);
  }, [generatePrediction]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({ co2Level: 'All', sector: 'All', city: 'All' });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedArea(null);
    setShowDetails(false);
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadAreaData();
  }, [loadAreaData]);

  // Custom marker component
  const CustomMarker = ({ area }: { area: AreaData }) => {
    // const map = useMap(); // Removed unused variable
    
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: ${getMarkerSize(area.co2)}px;
        height: ${getMarkerSize(area.co2)}px;
        background-color: ${getMarkerColor(area.co2)};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.3s ease;
      "></div>`,
      iconSize: [getMarkerSize(area.co2), getMarkerSize(area.co2)],
      iconAnchor: [getMarkerSize(area.co2) / 2, getMarkerSize(area.co2) / 2]
    });

    return (
      <Marker
        position={AREA_COORDINATES[area.name as keyof typeof AREA_COORDINATES] as [number, number]}
        icon={customIcon}
        eventHandlers={{
          click: () => handleAreaClick(area)
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-lg">{area.name}</h3>
            <p className="text-sm text-gray-600">CO2: {area.co2} kg/month</p>
            <p className="text-sm text-gray-600">Users: {area.users}</p>
            <p className="text-sm text-gray-600">City: {area.city}</p>
          </div>
        </Popup>
      </Marker>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Map Data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-lg shadow-lg"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Map Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadAreaData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!areaData || areaData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-lg shadow-lg"
        >
          <div className="text-gray-500 text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Map Data</h2>
          <p className="text-gray-600 mb-4">Unable to load area data. Please try again.</p>
          <button
            onClick={() => loadAreaData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reload
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Reactive Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]"></div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-4 left-10 w-8 h-8 bg-white/20 rounded-full"
        ></motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-8 right-16 w-6 h-6 bg-white/15 rounded-full"
        ></motion.div>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-4 left-1/4 w-4 h-4 bg-white/10 rounded-full"
        ></motion.div>

        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
          >
            Carbon Maps
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-blue-100 font-medium"
          >
            Interactive CO2 Emission Visualization
          </motion.p>
        </div>
      </motion.div>

      <div className="flex h-screen">
        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={[19.0760, 72.8777]} // Mumbai center
            zoom={12}
            className="w-full h-full"
            style={{ zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredAreas.map((area) => (
              <CustomMarker key={area.name} area={area} />
            ))}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
            >
              <h3 className="font-semibold text-gray-800 mb-2">Filters</h3>
              <div className="space-y-2">
                <select
                  value={filters.co2Level}
                  onChange={(e) => setFilters(prev => ({ ...prev, co2Level: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="All">All CO2 Levels</option>
                  <option value="Low">Low (&lt;240 kg)</option>
                  <option value="Medium">Medium (240-260 kg)</option>
                  <option value="High">High (&gt;260 kg)</option>
                </select>
                
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="All">All Sectors</option>
                  <option value="Residential">Residential</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Vehicular">Vehicular</option>
                  <option value="Construction">Construction</option>
                  <option value="Airport">Airport</option>
                </select>
                
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="All">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                </select>
                
                <div className="flex space-x-2">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={clearSelection}
                    className="flex-1 px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
            >
              <h3 className="font-semibold text-gray-800 mb-2">CO2 Levels</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Low: &lt;240 kg/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>Medium: 240-260 kg/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>High: &gt;260 kg/month</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white"
            >
              <h3 className="text-lg font-bold mb-3">Community Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Areas Covered:</span>
                  <span className="font-semibold">{areaData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg CO2:</span>
                  <span className="font-semibold">{stats.avgCO2} kg</span>
                </div>
              </div>
            </motion.div>

            {/* City Benchmarks */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-lg border"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">City Benchmarks</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mumbai</span>
                  <span className="font-semibold text-blue-600">{stats.mumbaiAvg} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Navi Mumbai</span>
                  <span className="font-semibold text-purple-600">{stats.naviMumbaiAvg} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Target</span>
                  <span className="font-semibold text-green-600">200 kg</span>
                </div>
              </div>
            </motion.div>

            {/* Top Areas */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-lg border"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">Top 3 Areas</h3>
              <div className="space-y-2">
                {topAreas.map((area, index) => (
                  <div
                    key={area.name}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAreaClick(area)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium">{area.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">{area.co2} kg</div>
                      <div className="text-xs text-gray-500">{area.users} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Areas */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-lg border"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">Bottom 3 Areas</h3>
              <div className="space-y-2">
                {bottomAreas.map((area, index) => (
                  <div
                    key={area.name}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAreaClick(area)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      <span className="text-sm font-medium">{area.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{area.co2} kg</div>
                      <div className="text-xs text-gray-500">{area.users} users</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Scenario Simulator */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-lg border"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">Scenario Simulator</h3>
              <p className="text-sm text-gray-600 mb-3">Toggle scenarios to see projected impact on map</p>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.electricVehicles}
                    onChange={(e) => setScenarios(prev => ({ ...prev, electricVehicles: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm font-medium">🚗 Electric Vehicles (-15% Vehicular)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.renewableEnergy}
                    onChange={(e) => setScenarios(prev => ({ ...prev, renewableEnergy: e.target.checked }))}
                    className="rounded text-green-600"
                  />
                  <span className="text-sm font-medium">⚡ Renewable Energy (-10% Residential/Industrial)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.greenBuildings}
                    onChange={(e) => setScenarios(prev => ({ ...prev, greenBuildings: e.target.checked }))}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm font-medium">🏢 Green Buildings (-12% Construction)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.publicTransport}
                    onChange={(e) => setScenarios(prev => ({ ...prev, publicTransport: e.target.checked }))}
                    className="rounded text-orange-600"
                  />
                  <span className="text-sm font-medium">🚌 Public Transport (-20% Vehicular)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.industrialEfficiency}
                    onChange={(e) => setScenarios(prev => ({ ...prev, industrialEfficiency: e.target.checked }))}
                    className="rounded text-red-600"
                  />
                  <span className="text-sm font-medium">🏭 Industrial Efficiency (-18% Industrial)</span>
                </label>
                <label className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={scenarios.wasteReduction}
                    onChange={(e) => setScenarios(prev => ({ ...prev, wasteReduction: e.target.checked }))}
                    className="rounded text-yellow-600"
                  />
                  <span className="text-sm font-medium">♻️ Waste Reduction (-5% Overall)</span>
                </label>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Area Details Modal */}
      <AnimatePresence>
        {showDetails && selectedArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedArea.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* CO2 Level */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                  <div className="text-3xl font-bold">{selectedArea.co2} kg</div>
                  <div className="text-sm opacity-90">CO2 per month</div>
                </div>

                {/* Records */}
                <div className="text-center p-4 bg-gray-100 rounded-xl">
                  <div className="text-2xl font-bold text-gray-800">{selectedArea.users}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>

                {/* City */}
                <div className="text-center p-4 bg-gray-100 rounded-xl">
                  <div className="text-lg font-semibold text-gray-800">{selectedArea.city}</div>
                  <div className="text-sm text-gray-600">City</div>
                </div>

                {/* Prediction */}
                {selectedArea.prediction && (
                  <div className="text-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                    <div className="text-lg font-bold">Highest Prediction</div>
                    <div className="text-2xl font-bold">{selectedArea.prediction.value} kg</div>
                    <div className="text-sm opacity-90">
                      {selectedArea.prediction.month} - {selectedArea.prediction.season}
                    </div>
                  </div>
                )}

                {/* Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sector Breakdown</h3>
                  <div className="space-y-2 mb-4">
                    {Object.entries(selectedArea.breakdown)
                      .sort(([,a], [,b]) => b - a) // Sort in descending order
                      .map(([sector, value]) => (
                      <div key={sector} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{sector}</span>
                        <span className="text-sm font-semibold">{value} kg</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pie Chart */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">CO2 Distribution</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(selectedArea.breakdown)
                              .sort(([,a], [,b]) => b - a)
                              .map(([sector, value]) => ({
                                name: sector,
                                value: value,
                                color: SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS]
                              }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {Object.entries(selectedArea.breakdown)
                              .sort(([,a], [,b]) => b - a)
                              .map(([sector], index) => (
                              <Cell key={`cell-${index}`} fill={SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} kg`, 'CO2']}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span style={{ fontSize: '12px', color: '#374151' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maps;
