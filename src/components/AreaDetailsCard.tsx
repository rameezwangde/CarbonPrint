import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

const AreaDetailsCard: React.FC = () => {
  const { emissionData, selectedArea } = useDataContext();

  const selectedAreaData = emissionData.find(area => area.area === selectedArea);

  if (!selectedAreaData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Select an Area</h3>
          <p className="text-sm">Choose an area from the list to view detailed information</p>
        </div>
      </motion.div>
    );
  }

  const isAboveTarget = selectedAreaData.target && selectedAreaData.avg_CO2 > selectedAreaData.target;
  const isAboveBenchmark = selectedAreaData.avg_CO2 > selectedAreaData.benchmark;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <MapPin className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{selectedAreaData.area}</h3>
            {selectedAreaData.city && (
              <p className="text-sm text-gray-600">{selectedAreaData.city}, {selectedAreaData.country}</p>
            )}
            {selectedAreaData.area_type && (
              <p className="text-xs text-gray-500">{selectedAreaData.area_type}</p>
            )}
          </div>
        </div>
        {isAboveTarget ? (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Above Target</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">On Track</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total CO2 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Total CO₂</h4>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {selectedAreaData.total_co2.toLocaleString()}
          </p>
          <p className="text-xs text-blue-700">metric tons</p>
        </div>

        {/* Average CO2 */}
        <div className={`rounded-xl p-4 ${
          isAboveTarget 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-gradient-to-br from-green-50 to-green-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Avg CO₂</h4>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <p className={`text-2xl font-bold ${
            isAboveTarget ? 'text-red-900' : 'text-green-900'
          }`}>
            {selectedAreaData.avg_CO2.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600">per unit</p>
        </div>

        {/* Target Value */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Target</h4>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {selectedAreaData.target ? selectedAreaData.target.toFixed(1) : 'N/A'}
          </p>
          <p className="text-xs text-purple-700">goal per unit</p>
        </div>

        {/* Benchmark */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Benchmark</h4>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {selectedAreaData.benchmark.toFixed(1)}
          </p>
          <p className="text-xs text-orange-700">industry standard</p>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Performance vs Target</h4>
          <span className={`text-sm font-medium ${
            isAboveTarget ? 'text-red-600' : 'text-green-600'
          }`}>
            {isAboveTarget ? 'Needs Improvement' : 'Meeting Goals'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              isAboveTarget ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ 
              width: selectedAreaData.target 
                ? `${Math.min((selectedAreaData.avg_CO2 / selectedAreaData.target) * 100, 100)}%` 
                : '0%' 
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {selectedAreaData.target 
            ? `${((selectedAreaData.avg_CO2 / selectedAreaData.target) * 100).toFixed(1)}% of target`
            : 'No target set'
          }
        </p>
      </div>
    </motion.div>
  );
};

export default AreaDetailsCard;
