import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { apiService } from '../services/apiService';

interface SeasonalAnalysisProps {
  className?: string;
}

const SeasonalAnalysis: React.FC<SeasonalAnalysisProps> = ({ className = '' }) => {
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackData = [
    { month: 'Jan', season: 'Winter', emissions: 245, temperature: 15, activities: 'Heating, Indoor Activities', color: '#3B82F6', icon: '❄️', bgColor: '#EFF6FF' },
    { month: 'Feb', season: 'Winter', emissions: 242, temperature: 18, activities: 'Heating, Indoor Activities', color: '#3B82F6', icon: '❄️', bgColor: '#EFF6FF' },
    { month: 'Mar', season: 'Spring', emissions: 235, temperature: 22, activities: 'Moderate Heating', color: '#10B981', icon: '🌸', bgColor: '#ECFDF5' },
    { month: 'Apr', season: 'Spring', emissions: 232, temperature: 26, activities: 'Natural Ventilation', color: '#10B981', icon: '🌸', bgColor: '#ECFDF5' },
    { month: 'May', season: 'Summer', emissions: 228, temperature: 30, activities: 'Cooling, Outdoor Activities', color: '#F59E0B', icon: '☀️', bgColor: '#FFFBEB' },
    { month: 'Jun', season: 'Summer', emissions: 231, temperature: 32, activities: 'Cooling, Outdoor Activities', color: '#F59E0B', icon: '☀️', bgColor: '#FFFBEB' },
    { month: 'Jul', season: 'Monsoon', emissions: 238, temperature: 28, activities: 'Humidity Control', color: '#8B5CF6', icon: '🌧️', bgColor: '#F3F4F6' },
    { month: 'Aug', season: 'Monsoon', emissions: 241, temperature: 27, activities: 'Humidity Control', color: '#8B5CF6', icon: '🌧️', bgColor: '#F3F4F6' },
    { month: 'Sep', season: 'Post-Monsoon', emissions: 244, temperature: 26, activities: 'Comfortable Weather', color: '#EF4444', icon: '🍂', bgColor: '#FEF2F2' },
    { month: 'Oct', season: 'Post-Monsoon', emissions: 247, temperature: 25, activities: 'Comfortable Weather, Outdoor', color: '#EF4444', icon: '🍂', bgColor: '#FEF2F2' },
    { month: 'Nov', season: 'Winter', emissions: 243, temperature: 20, activities: 'Light Heating', color: '#3B82F6', icon: '❄️', bgColor: '#EFF6FF' },
    { month: 'Dec', season: 'Winter', emissions: 246, temperature: 17, activities: 'Heating, Indoor Activities', color: '#3B82F6', icon: '❄️', bgColor: '#EFF6FF' }
  ];

  useEffect(() => {
    const fetchSeasonalData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSeasonalData();
        setSeasonalData(data.monthly_data || fallbackData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching seasonal data:', err);
        setError('Failed to load seasonal data');
        setSeasonalData(fallbackData);
        setLoading(false);
      }
    };

    fetchSeasonalData();
  }, []);

  const currentMonth = new Date().getMonth();
  const currentData = seasonalData[currentMonth] || seasonalData[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/30"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.span 
              className="text-3xl"
              whileHover={{ rotate: 360, scale: 1.2 }}
            >
              {data.icon}
            </motion.span>
            <div>
              <h4 className="font-bold text-xl text-gray-900">{data.month} - {data.season}</h4>
              <p className="text-sm text-gray-600">{data.temperature}°C • {data.activities}</p>
            </div>
          </div>
          <div className="text-right">
            <motion.div 
              className="text-3xl font-bold text-gray-900 mb-1"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {data.emissions} kg
            </motion.div>
            <div className="text-sm text-gray-600 font-medium">CO₂ this month</div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Loading...</h3>
          <p className="text-sm">Fetching seasonal data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Seasonal Background Indicators */}
      <div className="absolute top-0 left-0 right-0 h-10 flex">
        {seasonalData.map((month, index) => (
          <motion.div
            key={month.month}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, y: -2 }}
            className="flex-1 flex items-center justify-center relative group cursor-pointer"
            style={{ backgroundColor: month.bgColor }}
          >
            <motion.span 
              className="text-xl group-hover:text-2xl transition-all duration-300"
              whileHover={{ rotate: 360 }}
            >
              {month.icon}
            </motion.span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent group-hover:border-t-6 transition-all duration-300" 
                 style={{ borderTopColor: month.color }}></div>
            {/* Hover tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
              {month.season} • {month.temperature}°C
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="pt-8 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#374151', fontWeight: '600' }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#374151', fontWeight: '600' }}
              label={{ value: 'CO₂ (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontWeight: '700' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#10B981"
              fill="url(#seasonalGradient)"
              fillOpacity={0.4}
              strokeWidth={4}
              className="drop-shadow-lg"
            />
            <defs>
              <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal Legend */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 rounded-t-2xl border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-center space-x-6">
          {['Winter', 'Spring', 'Summer', 'Monsoon', 'Post-Monsoon'].map((season, index) => {
            const seasonInfo = seasonalData.find(d => d.season === season);
            if (!seasonInfo) return null;
            
            return (
              <motion.div
                key={season}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-3 py-2 rounded-full group cursor-pointer relative"
                style={{ backgroundColor: seasonInfo.bgColor }}
              >
                <motion.span 
                  className="text-lg group-hover:text-xl transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                >
                  {seasonInfo.icon}
                </motion.span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{season}</span>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeasonalAnalysis;