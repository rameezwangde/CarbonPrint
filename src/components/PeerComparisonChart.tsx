import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';
import { useDataContext } from '../contexts/DataContext';

interface ComparisonData {
  user: {
    emissions: number;
    label: string;
    color: string;
  };
  area_avg: {
    emissions: number;
    label: string;
    color: string;
    percentage_diff: number;
  };
  city_avg: {
    emissions: number;
    label: string;
    color: string;
    percentage_diff: number;
  };
}

interface BreakdownData {
  transportation: number;
  electricity: number;
  lpg_usage: number;
  air_travel: number;
  meat_meals: number;
  dining_out: number;
  waste: number;
}

interface PeerComparisonProps {
  userEmissions: number;
  city?: string;
  area?: string;
}

const PeerComparisonChart: React.FC<PeerComparisonProps> = ({ 
  userEmissions, 
  city = 'Mumbai', 
  area = 'Andheri' 
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [areaBreakdown, setAreaBreakdown] = useState<BreakdownData | null>(null);
  const [cityBreakdown, setCityBreakdown] = useState<BreakdownData | null>(null);
  const [insights, setInsights] = useState<{area_message: string; city_message: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    loadPeerComparisonData();
  }, [userEmissions, city, area]);

  const loadPeerComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getPeerComparisonData(city, area, userEmissions);
      
      setComparisonData(data.comparison_data);
      setAreaBreakdown(data.area_breakdown);
      setCityBreakdown(data.city_breakdown);
      setInsights(data.insights);
    } catch (err) {
      console.error('Error loading peer comparison data:', err);
      setError('Failed to load comparison data');
      
      // Fallback data
      setComparisonData({
        user: {
          emissions: userEmissions,
          label: 'You',
          color: '#3B82F6'
        },
        area_avg: {
          emissions: 850.0,
          label: `${area} Avg`,
          color: '#10B981',
          percentage_diff: 35.3
        },
        city_avg: {
          emissions: 820.0,
          label: `${city} Avg`,
          color: '#F59E0B',
          percentage_diff: 40.2
        }
      });
      setInsights({
        area_message: `You emit 35.3% more than the average resident in ${area}`,
        city_message: `You emit 40.2% more than the ${city} average`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarClick = (barType: string) => {
    setSelectedBar(barType);
    setShowBreakdown(true);
  };

  const getBreakdownData = () => {
    if (selectedBar === 'area' && areaBreakdown) {
      return areaBreakdown;
    } else if (selectedBar === 'city' && cityBreakdown) {
      return cityBreakdown;
    }
    return null;
  };

  const formatBreakdownData = (breakdown: BreakdownData) => {
    return [
      { name: 'Transportation', value: breakdown.transportation, color: '#3B82F6', icon: '🚗' },
      { name: 'Electricity', value: breakdown.electricity, color: '#F59E0B', icon: '⚡' },
      { name: 'LPG/Gas', value: breakdown.lpg_usage, color: '#EF4444', icon: '🔥' },
      { name: 'Air Travel', value: breakdown.air_travel, color: '#8B5CF6', icon: '✈️' },
      { name: 'Meat Meals', value: breakdown.meat_meals, color: '#DC2626', icon: '🥩' },
      { name: 'Dining Out', value: breakdown.dining_out, color: '#06B6D4', icon: '🍽️' },
      { name: 'Waste', value: breakdown.waste, color: '#F97316', icon: '🗑️' }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && !comparisonData) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={loadPeerComparisonData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!comparisonData) return null;

  const chartData = [
    {
      name: comparisonData.user.label,
      emissions: comparisonData.user.emissions,
      color: comparisonData.user.color,
      type: 'user'
    },
    {
      name: comparisonData.area_avg.label,
      emissions: comparisonData.area_avg.emissions,
      color: comparisonData.area_avg.color,
      type: 'area',
      percentage_diff: comparisonData.area_avg.percentage_diff
    },
    {
      name: comparisonData.city_avg.label,
      emissions: comparisonData.city_avg.emissions,
      color: comparisonData.city_avg.color,
      type: 'city',
      percentage_diff: comparisonData.city_avg.percentage_diff
    }
  ];

  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-r from-emerald-400/25 to-cyan-400/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-400/15 to-red-400/15 rounded-full blur-2xl animate-pulse delay-1500"></div>
      </div>

      {/* Floating Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        
        {/* Left Column - User Stats */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* User Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  YOU
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Emissions</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {comparisonData?.user.emissions || 0}
                </div>
                <div className="text-gray-600 font-medium">kg CO2/month</div>
              </div>
            </div>
          </div>

          {/* Comparison Insights */}
          {insights && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <span className="text-orange-800 font-semibold text-sm">{insights.area_message}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <span className="text-red-800 font-semibold text-sm">{insights.city_message}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Center Column - Interactive Chart */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                  Community Comparison
                </h3>
                <p className="text-gray-700 text-lg font-medium">Interactive comparison with your community</p>
              </div>

              {/* Interactive Bar Chart */}
              <div className="h-96 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 16, fill: '#374151', fontWeight: '700' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                    />
                    <YAxis 
                      label={{ value: 'CO2 Emissions (kg/month)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontWeight: '700' } }}
                      tick={{ fontSize: 14, fill: '#374151', fontWeight: '600' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} kg CO2/month`, 'Emissions']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Bar 
                      dataKey="emissions" 
                      radius={[16, 16, 0, 0]}
                      cursor="pointer"
                      onClick={(data) => handleBarClick(data.type)}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          style={{ 
                            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))',
                            cursor: 'pointer',
                            transition: 'all 0.4s ease',
                            transform: 'scale(1)',
                            transformOrigin: 'bottom'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.08)';
                            e.target.style.filter = 'drop-shadow(0 16px 32px rgba(0,0,0,0.3))';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))';
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Click Instructions */}
              <div className="text-center mt-8 relative z-10">
                <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full shadow-lg">
                  <span className="text-gray-700 text-sm font-semibold">
                    🖱️ Click on any bar to see detailed breakdown
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Comparison Cards */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Area Average Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div 
              className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleBarClick('area')}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {area?.charAt(0) || 'A'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{area} Average</h3>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {comparisonData?.area_avg.emissions || 0}
                </div>
                <div className="text-gray-600 font-medium text-sm">kg CO2/month</div>
                <div className="mt-3 text-sm font-semibold text-green-700">
                  {comparisonData?.area_avg.percentage_diff > 0 ? '+' : ''}{comparisonData?.area_avg.percentage_diff || 0}% vs You
                </div>
              </div>
            </div>
          </div>

          {/* City Average Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div 
              className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleBarClick('city')}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {city?.charAt(0) || 'C'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{city} Average</h3>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {comparisonData?.city_avg.emissions || 0}
                </div>
                <div className="text-gray-600 font-medium text-sm">kg CO2/month</div>
                <div className="mt-3 text-sm font-semibold text-amber-700">
                  {comparisonData?.city_avg.percentage_diff > 0 ? '+' : ''}{comparisonData?.city_avg.percentage_diff || 0}% vs You
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBreakdown(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-3xl font-black text-gray-900 drop-shadow-sm">
                  {selectedBar === 'area' ? `${area} Breakdown` : `${city} Breakdown`}
                </h3>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="text-gray-600 hover:text-gray-800 text-3xl transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/20"
                >
                  ×
                </button>
              </div>

              {getBreakdownData() && (
                <div className="space-y-6 relative z-10">
                  <p className="text-gray-700 text-lg mb-6 font-medium">
                    Average CO2 emissions by category in {selectedBar === 'area' ? area : city}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formatBreakdownData(getBreakdownData()!).map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center p-5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden group hover:bg-white/25 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div 
                          className="w-5 h-5 rounded-full mr-4 shadow-lg"
                          style={{ 
                            backgroundColor: item.color,
                            boxShadow: `0 0 20px ${item.color}40`
                          }}
                        ></div>
                        <span className="text-3xl mr-4 drop-shadow-lg">{item.icon}</span>
                        <div className="flex-1 relative z-10">
                          <div className="font-bold text-gray-900 text-lg mb-1">{item.name}</div>
                          <div className="text-xl text-gray-900 font-black bg-white/30 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/40 shadow-lg">
                            {item.value} kg/month
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeerComparisonChart;
