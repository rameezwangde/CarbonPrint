import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

const ChartCard: React.FC = () => {
  const { emissionData } = useDataContext();
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');

  if (emissionData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-sm">Upload CSV data to view charts</p>
        </div>
      </motion.div>
    );
  }

  // Prepare data for charts
  const barData = emissionData.map(area => ({
    name: area.area.length > 10 ? area.area.substring(0, 10) + '...' : area.area,
    fullName: area.area,
    totalCO2: area.total_co2,
    avgCO2: area.avg_CO2,
    target: area.target || 0,
    benchmark: area.benchmark,
  }));

  const pieData = emissionData.map(area => ({
    name: area.area,
    value: area.total_co2,
    avgCO2: area.avg_CO2,
  }));

  const COLORS = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.fullName}</p>
          <p className="text-sm text-gray-600">
            Total CO₂: {data.totalCO2.toLocaleString()} tons
          </p>
          <p className="text-sm text-gray-600">
            Avg CO₂: {data.avgCO2.toFixed(1)} per unit
          </p>
          {data.target > 0 && (
            <p className="text-sm text-gray-600">
              Target: {data.target.toFixed(1)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Data Visualization</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Bar
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <PieChartIcon className="w-4 h-4 inline mr-1" />
            Pie
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalCO2" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Total CO₂"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} tons`,
                  'Total CO₂'
                ]}
                labelFormatter={(label: string) => `Area: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Legend for Bar Chart */}
      {chartType === 'bar' && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Total CO₂ emissions by region (in thousands of metric tons)
          </p>
        </div>
      )}

      {/* Chart Legend for Pie Chart */}
      {chartType === 'pie' && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChartCard;
