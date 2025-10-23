import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

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

  const loadPeerComparisonData = useCallback(async () => {
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
  }, [userEmissions, city, area]);

  useEffect(() => {
    loadPeerComparisonData();
  }, [loadPeerComparisonData]);

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-amber-400/15 to-orange-400/15 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
          animate={{
            y: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
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
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="text-center relative z-10">
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  👤
                </motion.div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">Your Impact</h3>
                <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {comparisonData?.user.emissions || 0}
                </div>
                <div className="text-gray-700 font-semibold text-lg">kg CO₂/month</div>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200">
                  <span className="text-indigo-700 font-medium text-sm">🌱 Personal Carbon Footprint</span>
                </div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/25 to-orange-500/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-start">
                    <div className="text-3xl mr-4 animate-pulse">📈</div>
                    <div>
                      <div className="text-amber-800 font-bold text-sm mb-1">Area Comparison</div>
                      <span className="text-amber-900 font-semibold text-sm leading-relaxed">{insights.area_message}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/25 to-pink-500/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-start">
                    <div className="text-3xl mr-4 animate-pulse">🏙️</div>
                    <div>
                      <div className="text-rose-800 font-bold text-sm mb-1">City Comparison</div>
                      <span className="text-rose-900 font-semibold text-sm leading-relaxed">{insights.city_message}</span>
                    </div>
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="text-center mb-8 relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mb-4 shadow-2xl"
                >
                  <span className="text-3xl">📊</span>
                </motion.div>
                <h3 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
                  Community Insights
                </h3>
                <p className="text-gray-700 text-xl font-semibold">Compare your impact with your community</p>
                <div className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full border border-emerald-200">
                  <span className="text-emerald-700 font-medium">🎯 Interactive Data Visualization</span>
                </div>
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
                      onClick={(data) => handleBarClick(data.type || 'user')}
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
                            const target = e.target as HTMLElement;
                            target.style.transform = 'scale(1.08)';
                            target.style.filter = 'drop-shadow(0 16px 32px rgba(0,0,0,0.3))';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.transform = 'scale(1)';
                            target.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))';
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Enhanced Click Instructions */}
              <div className="text-center mt-8 relative z-10">
                <motion.div 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-sm border border-white/40 rounded-full shadow-xl"
                  animate={{
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 10px 25px rgba(0,0,0,0.1)",
                      "0 15px 35px rgba(0,0,0,0.15)",
                      "0 10px 25px rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-2xl mr-3">🖱️</span>
                  <span className="text-gray-800 text-lg font-bold">
                    Click any bar for detailed breakdown
                  </span>
                  <span className="text-2xl ml-3">✨</span>
                </motion.div>
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div 
              className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleBarClick('area')}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="text-center relative z-10">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                  animate={{
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🏘️
                </motion.div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">{area} Average</h3>
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                  {comparisonData?.area_avg.emissions || 0}
                </div>
                <div className="text-gray-700 font-semibold text-lg mb-4">kg CO₂/month</div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full border border-emerald-200">
                  <span className="text-emerald-700 font-bold text-sm">
                  {comparisonData?.area_avg.percentage_diff > 0 ? '+' : ''}{comparisonData?.area_avg.percentage_diff || 0}% vs You
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* City Average Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div 
              className="relative bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleBarClick('city')}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="text-center relative z-10">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  🏙️
                </motion.div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">{city} Average</h3>
                <div className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  {comparisonData?.city_avg.emissions || 0}
                </div>
                <div className="text-gray-700 font-semibold text-lg mb-4">kg CO₂/month</div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full border border-amber-200">
                  <span className="text-amber-700 font-bold text-sm">
                  {comparisonData?.city_avg.percentage_diff > 0 ? '+' : ''}{comparisonData?.city_avg.percentage_diff || 0}% vs You
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Detailed Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowBreakdown(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white/25 backdrop-blur-xl border border-white/40 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
                boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-2xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    📊
                  </motion.div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-sm">
                  {selectedBar === 'area' ? `${area} Breakdown` : `${city} Breakdown`}
                </h3>
                </div>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="text-gray-600 hover:text-gray-800 text-4xl transition-all duration-200 hover:scale-110 p-3 rounded-full hover:bg-white/30 shadow-lg"
                >
                  ×
                </button>
              </div>

              {getBreakdownData() && (
                <div className="space-y-8 relative z-10">
                  <div className="text-center mb-8">
                    <p className="text-gray-800 text-xl font-semibold mb-2">
                      Average CO₂ emissions by category in {selectedBar === 'area' ? area : city}
                    </p>
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full border border-indigo-200">
                      <span className="text-indigo-700 font-medium">📈 Detailed Analysis</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formatBreakdownData(getBreakdownData()!).map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="relative flex items-center p-6 bg-white/25 backdrop-blur-sm border border-white/40 rounded-3xl overflow-hidden group hover:bg-white/30 transition-all duration-300 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <motion.div 
                          className="w-6 h-6 rounded-full mr-5 shadow-xl"
                          style={{ 
                            backgroundColor: item.color,
                            boxShadow: `0 0 25px ${item.color}50`
                          }}
                          animate={{
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              `0 0 25px ${item.color}50`,
                              `0 0 35px ${item.color}70`,
                              `0 0 25px ${item.color}50`
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2
                          }}
                        />
                        <span className="text-4xl mr-5 drop-shadow-lg">{item.icon}</span>
                        <div className="flex-1 relative z-10">
                          <div className="font-black text-gray-900 text-xl mb-2">{item.name}</div>
                          <div className="text-2xl text-gray-900 font-black bg-white/40 px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/50 shadow-xl">
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
