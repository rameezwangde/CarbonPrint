import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

const AreaListCard: React.FC = () => {
  const { emissionData, selectedArea, setSelectedArea } = useDataContext();

  if (emissionData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-sm">Upload CSV data to view areas</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <MapPin className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Areas Overview</h3>
        <span className="text-sm text-gray-500">({emissionData.length} regions)</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {emissionData.map((area, index) => {
          const isAboveTarget = area.target && area.avg_CO2 > area.target;
          const isAboveBenchmark = area.avg_CO2 > area.benchmark;
          const isSelected = selectedArea === area.area;

          return (
            <motion.div
              key={area.area}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedArea(area.area)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-emerald-100 border-2 border-emerald-300 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isAboveTarget ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <h4 className="font-medium text-gray-900">{area.area}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  {isAboveTarget ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Total CO₂</p>
                  <p className="font-medium text-gray-900">
                    {(area.total_co2 / 1000).toFixed(1)}K
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Avg CO₂</p>
                  <p className={`font-medium ${
                    isAboveTarget ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {area.avg_CO2.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Target</p>
                  <p className="font-medium text-gray-900">
                    {area.target ? area.target.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Performance</span>
                  <span>
                    {area.target 
                      ? `${((area.avg_CO2 / area.target) * 100).toFixed(0)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isAboveTarget ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: area.target 
                        ? `${Math.min((area.avg_CO2 / area.target) * 100, 100)}%` 
                        : '0%' 
                    }}
                  />
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center space-x-3">
                  {isAboveBenchmark && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>Above Benchmark</span>
                    </div>
                  )}
                  {isAboveTarget && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <Target className="w-3 h-3" />
                      <span>Above Target</span>
                    </div>
                  )}
                </div>
                {!isAboveTarget && !isAboveBenchmark && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>On Track</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Areas On Track</p>
            <p className="text-2xl font-bold text-green-600">
              {emissionData.filter(area => !area.target || area.avg_CO2 <= area.target).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Need Improvement</p>
            <p className="text-2xl font-bold text-red-600">
              {emissionData.filter(area => area.target && area.avg_CO2 > area.target).length}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AreaListCard;
