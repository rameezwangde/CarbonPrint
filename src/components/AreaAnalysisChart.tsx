import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AreaAnalysisChartProps {
  data: {
    city: string;
    area: string;
    co2_breakdown: {
      Residential: number;
      Corporate: number;
      Industrial: number;
      Vehicular: number;
      Construction: number;
      Airport: number;
    };
  };
}

const AreaAnalysisChart: React.FC<AreaAnalysisChartProps> = ({ data }) => {
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Transform data for the chart, sorted in descending order
  const rawEntries = Object.entries(data.co2_breakdown);
  const total = rawEntries.reduce((sum, [, v]) => sum + (Number(v) || 0), 0);

  const chartData = rawEntries
    .map(([name, value]) => {
      const val = Number(value) || 0;
      const pct = total > 0 ? (val / total) * 100 : 0;
      return {
        name,
        value: Number(val.toFixed(2)),
        percent: Number(pct.toFixed(2)),
        icon: getAreaIcon(name),
        color: getAreaColor(name),
        description: getAreaDescription(name)
      };
    })
    .sort((a, b) => b.value - a.value); // Sort in descending order

  const maxValue = Math.max(...chartData.map(item => item.value));

  const handleBarClick = (name: string) => {
    setSelectedBar(selectedBar === name ? null : name);
  };

  const handleBarHover = (name: string | null) => {
    setHoveredBar(name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-96 overflow-hidden"
    >
      {/* Enhanced Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-r from-teal-400/25 to-cyan-400/25 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-pink-400/25 to-orange-400/25 rounded-full blur-xl animate-pulse delay-1500"></div>
        <div className="absolute bottom-1/4 right-1/3 w-28 h-28 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Glassmorphism Container with Unique Background */}
      <div className="relative h-full overflow-hidden">
        {/* Unique Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/25 rounded-3xl"></div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-white/15 pointer-events-none rounded-3xl"></div>
        
        {/* Additional Color Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-t-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 rounded-full blur-2xl"></div>

        {/* Enhanced Header with Unique Styling */}
        <div className="relative z-10 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            {/* Header Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
            
            <div className="relative bg-white/20 backdrop-blur-sm border border-white/40 rounded-2xl p-4 shadow-lg">
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 drop-shadow-sm"
              >
                Area Context
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-2"
              >
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <span className="text-xl">📍</span>
                </div>
                <p className="text-gray-800 text-lg font-bold">
                  {data.area}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Chart with Enhanced Background */}
        <div className="relative z-10 h-64">
          {/* Chart Background */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30"></div>
          
          <div className="relative p-4 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 'bold' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 'bold' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.4)' }}
                  domain={[0, maxValue * 1.1]}
                />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as any;
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-2xl max-w-xs"
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                          <span className="text-2xl">{d.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{label}</p>
                          <p className="text-sm text-gray-600">{d.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Emissions:</span>
                          <span className="text-lg font-black text-green-600">
                            {d.value.toFixed(2)} kg CO₂/month
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Share:</span>
                          <span className="text-lg font-bold text-purple-600">
                            {d.percent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.percent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              onClick={(data) => handleBarClick(data.name)}
              onMouseEnter={(data) => handleBarHover(data.name)}
              onMouseLeave={() => handleBarHover(null)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{
                    filter: hoveredBar === entry.name ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 
                            selectedBar === entry.name ? 'brightness(1.1) drop-shadow(0 0 12px rgba(0,0,0,0.4))' : 
                            'brightness(1)',
                    transform: hoveredBar === entry.name ? 'scale(1.05)' : 
                              selectedBar === entry.name ? 'scale(1.02)' : 
                              'scale(1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Summary with Enhanced Styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-6 space-y-4"
        >
          {/* Summary Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl blur-lg"></div>
          
          {/* Selected Bar Details */}
          <AnimatePresence>
            {selectedBar && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <span className="text-2xl">{chartData.find(item => item.name === selectedBar)?.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Selected: {selectedBar}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {chartData.find(item => item.name === selectedBar)?.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {chartData.find(item => item.name === selectedBar)?.value.toFixed(2)} kg CO₂/month
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {chartData.find(item => item.name === selectedBar)?.percent.toFixed(2)}% of total
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center shadow-xl">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                  {chartData[0]?.name}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Highest Source</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center shadow-xl">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  {chartData.filter(item => item.value > 0).length}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Active Types</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center shadow-xl">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  {total.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">Total kg/month</div>
              </div>
            </motion.div>
          </div>

          {/* Click Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-3 shadow-lg">
                <p className="text-sm text-gray-600 font-semibold">
                  💡 Click on any bar to see detailed information
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper functions
function getAreaIcon(areaType: string): string {
  const icons: { [key: string]: string } = {
    'Residential': '🏠',
    'Corporate': '🏢',
    'Industrial': '🏭',
    'Vehicular': '🚗',
    'Construction': '🏗️',
    'Airport': '✈️'
  };
  return icons[areaType] || '📊';
}

function getAreaColor(areaType: string): string {
  const colors: { [key: string]: string } = {
    'Residential': '#10B981',    // Green
    'Corporate': '#3B82F6',      // Blue
    'Industrial': '#F59E0B',     // Amber
    'Vehicular': '#8B5CF6',      // Purple
    'Construction': '#EF4444',   // Red
    'Airport': '#06B6D4'         // Cyan
  };
  return colors[areaType] || '#6B7280';
}

function getAreaDescription(areaType: string): string {
  const descriptions: { [key: string]: string } = {
    'Residential': 'Housing and residential buildings',
    'Corporate': 'Office buildings and commercial spaces',
    'Industrial': 'Manufacturing and industrial facilities',
    'Vehicular': 'Transportation and traffic emissions',
    'Construction': 'Construction activities and development',
    'Airport': 'Aviation operations and airport facilities'
  };
  return descriptions[areaType] || 'Area type emissions';
}

export default AreaAnalysisChart;
