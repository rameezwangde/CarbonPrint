import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface CO2TrendChartProps {
  data?: Array<{
    month: string;
    current: number;
    predicted: number;
  }>;
}

const CO2TrendChart: React.FC<CO2TrendChartProps> = ({ data }) => {
  // Generate dynamic data starting from current month for next 12 months
  const generateChartData = () => {
    const currentDate = new Date();
    const months = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Seasonal data with icons and colors
    const seasonalData = [
      { month: 'Jan', season: 'Winter', icon: '❄️', color: '#3B82F6', bgColor: '#EFF6FF', temp: '15°C', activities: 'Heating, Indoor' },
      { month: 'Feb', season: 'Winter', icon: '❄️', color: '#3B82F6', bgColor: '#EFF6FF', temp: '18°C', activities: 'Heating, Indoor' },
      { month: 'Mar', season: 'Spring', icon: '🌸', color: '#10B981', bgColor: '#ECFDF5', temp: '22°C', activities: 'Moderate Heating' },
      { month: 'Apr', season: 'Spring', icon: '🌸', color: '#10B981', bgColor: '#ECFDF5', temp: '26°C', activities: 'Natural Ventilation' },
      { month: 'May', season: 'Summer', icon: '☀️', color: '#F59E0B', bgColor: '#FFFBEB', temp: '30°C', activities: 'Cooling, Outdoor' },
      { month: 'Jun', season: 'Summer', icon: '☀️', color: '#F59E0B', bgColor: '#FFFBEB', temp: '32°C', activities: 'Cooling, Outdoor' },
      { month: 'Jul', season: 'Monsoon', icon: '🌧️', color: '#8B5CF6', bgColor: '#F3F4F6', temp: '28°C', activities: 'Humidity Control' },
      { month: 'Aug', season: 'Monsoon', icon: '🌧️', color: '#8B5CF6', bgColor: '#F3F4F6', temp: '27°C', activities: 'Humidity Control' },
      { month: 'Sep', season: 'Post-Monsoon', icon: '🍂', color: '#EF4444', bgColor: '#FEF2F2', temp: '26°C', activities: 'Comfortable' },
      { month: 'Oct', season: 'Post-Monsoon', icon: '🍂', color: '#EF4444', bgColor: '#FEF2F2', temp: '25°C', activities: 'Comfortable' },
      { month: 'Nov', season: 'Winter', icon: '❄️', color: '#3B82F6', bgColor: '#EFF6FF', temp: '20°C', activities: 'Light Heating' },
      { month: 'Dec', season: 'Winter', icon: '❄️', color: '#3B82F6', bgColor: '#EFF6FF', temp: '17°C', activities: 'Heating, Indoor' }
    ];
    
    // Get current month data (if available from props)
    const currentCO2 = data && data.length > 0 ? data[0].current : 366.3; // Default current value
    const predictedCO2 = data && data.length > 0 ? data[0].predicted : 402.9; // Default predicted value
    
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = monthNames[targetDate.getMonth()];
      const year = targetDate.getFullYear();
      const displayMonth = `${monthName} ${year}`;
      
      const seasonalInfo = seasonalData[targetDate.getMonth()];
      
      if (i === 0) {
        // Current month - show actual current value
        months.push({
          month: displayMonth,
          current: currentCO2,
          predicted: predictedCO2,
          ...seasonalInfo,
          isCurrent: true
        });
      } else {
        // Future months - generate realistic predictions with seasonal patterns
        const baseIncrease = (predictedCO2 - currentCO2) / 12; // Monthly increase
        const monthIndex = targetDate.getMonth();
        
        // Enhanced seasonal factors based on Mumbai climate
        const seasonalFactors = [1.15, 1.1, 1.0, 0.85, 0.75, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
        const seasonalFactor = seasonalFactors[monthIndex];
        
        // Add some realistic variation
        const variation = (Math.random() - 0.5) * 20;
        const predictedValue = predictedCO2 + (baseIncrease * i) + (seasonalFactor - 1) * 40 + variation;
        
        months.push({
          month: displayMonth,
          current: null, // Only show current for current month
          predicted: Math.max(0, predictedValue), // Ensure non-negative values
          ...seasonalInfo,
          isCurrent: false
        });
      }
    }
    
    return months;
  };

  const chartData = generateChartData();

  // Find the maximum predicted CO₂ value and its details
  const maxPrediction = chartData.reduce((max, current) => {
    if (current.predicted && current.predicted > max.predicted) {
      return current;
    }
    return max;
  }, chartData[0] || { predicted: 0 });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isMaxPrediction = data.predicted === maxPrediction.predicted && data.predicted > 0;
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 relative overflow-hidden ${
            isMaxPrediction 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400' 
              : 'bg-white/95 border-white/30'
          }`}
        >
          {/* Animated background for max prediction */}
          {isMaxPrediction && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-50"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{data.icon}</span>
              <div>
                <h4 className={`font-bold text-xl ${isMaxPrediction ? 'text-white' : 'text-gray-900'}`}>
                  {label}
                  {isMaxPrediction && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-2"
                    >
                      ⚠️
                    </motion.span>
                  )}
                </h4>
                <p className={`text-sm ${isMaxPrediction ? 'text-red-100' : 'text-gray-600'}`}>
                  {data.season} • {data.temp} • {data.activities}
                </p>
              </div>
            </div>
            
            {isMaxPrediction && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-400/30 rounded-lg p-3 mb-4 border border-red-300"
              >
                <p className="text-sm font-bold text-white">
                  🚨 PEAK EMISSION ALERT - Highest predicted CO₂ level!
                </p>
              </motion.div>
            )}
            
            <div className="space-y-2">
              {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`text-sm font-medium ${isMaxPrediction ? 'text-red-100' : 'text-gray-700'}`}>
                      {entry.dataKey === 'current' ? 'Current' : 'Predicted'}:
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isMaxPrediction ? 'text-white' : 'text-gray-900'}`}>
                    {entry.value?.toFixed(1)} kg
                    {isMaxPrediction && entry.dataKey === 'predicted' && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="ml-1"
                      >
                        🔥
                      </motion.span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isMaxPrediction = payload.predicted === maxPrediction.predicted && payload.predicted > 0;
    
    return (
      <g>
        {/* Special warning effect for max prediction */}
        {isMaxPrediction && (
          <>
            {/* Outer warning ring */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={20}
              fill="none"
              stroke="#EF4444"
              strokeWidth={3}
              opacity={0.6}
              animate={{
                r: [20, 25, 20],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Warning icon */}
            <motion.text
              x={cx}
              y={cy - 35}
              textAnchor="middle"
              className="text-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ⚠️
            </motion.text>
          </>
        )}
        
        {/* Outer glow effect */}
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={payload.current ? '#10B981' : (isMaxPrediction ? '#EF4444' : '#F59E0B')}
          opacity={0.2}
          className="animate-pulse"
        />
        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={payload.current ? '#10B981' : (isMaxPrediction ? '#EF4444' : '#F59E0B')}
          stroke="white"
          strokeWidth={3}
          className="drop-shadow-lg hover:r-8 transition-all duration-300"
        />
        {/* Inner highlight */}
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="white"
          opacity={0.8}
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full relative">
      {/* Seasonal Background Indicators */}
      <div className="absolute top-0 left-0 right-0 h-10 flex">
        {chartData.map((month, index) => (
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
              {month.season} • {month.temp}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="pt-8 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10B981"
              strokeWidth={4}
              dot={<CustomDot />}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#F59E0B"
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={<CustomDot />}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal Legend */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6 rounded-t-2xl border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-center space-x-8">
          {['Winter', 'Spring', 'Summer', 'Monsoon', 'Post-Monsoon'].map((season, index) => {
            const seasonInfo = chartData.find(d => d.season === season);
            if (!seasonInfo) return null;
            
            return (
              <motion.div
                key={season}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 px-4 py-3 rounded-full group cursor-pointer relative"
                style={{ backgroundColor: seasonInfo.bgColor }}
              >
                <motion.span 
                  className="text-xl group-hover:text-2xl transition-all duration-300"
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

export default CO2TrendChart;