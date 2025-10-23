import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Target, Award, AlertCircle } from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

const BenchmarkSummaryCard: React.FC = () => {
  const { emissionData } = useDataContext();

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
          <p className="text-sm">Upload CSV data to view benchmark summary</p>
        </div>
      </motion.div>
    );
  }

  // Calculate statistics
  const totalEmissions = emissionData.reduce((sum, area) => sum + area.total_co2, 0);
  const avgEmissions = emissionData.reduce((sum, area) => sum + area.avg_CO2, 0) / emissionData.length;
  const avgBenchmark = emissionData.reduce((sum, area) => sum + area.benchmark, 0) / emissionData.length;
  
  const areasAboveTarget = emissionData.filter(area => 
    area.target && area.avg_CO2 > area.target
  ).length;
  
  const areasAboveBenchmark = emissionData.filter(area => 
    area.avg_CO2 > area.benchmark
  ).length;

  const bestPerformer = emissionData.reduce((best, current) => 
    current.avg_CO2 < best.avg_CO2 ? current : best
  );

  const worstPerformer = emissionData.reduce((worst, current) => 
    current.avg_CO2 > worst.avg_CO2 ? current : worst
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Benchmark Summary</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Emissions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Total Emissions</h4>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {(totalEmissions / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-blue-700">metric tons CO₂</p>
        </div>

        {/* Average Performance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Avg Performance</h4>
            <Target className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            {avgEmissions.toFixed(1)}
          </p>
          <p className="text-xs text-green-700">CO₂ per unit</p>
        </div>

        {/* Areas Above Target */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Above Target</h4>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">
            {areasAboveTarget}
          </p>
          <p className="text-xs text-red-700">areas need improvement</p>
        </div>

        {/* Areas Above Benchmark */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Above Benchmark</h4>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {areasAboveBenchmark}
          </p>
          <p className="text-xs text-orange-700">areas exceed standard</p>
        </div>
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Performer */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="font-medium text-gray-900">Best Performer</h4>
          </div>
          <p className="text-lg font-bold text-emerald-900 mb-1">
            {bestPerformer.area}
          </p>
          <p className="text-sm text-emerald-700">
            {bestPerformer.avg_CO2.toFixed(1)} CO₂ per unit
          </p>
        </div>

        {/* Needs Attention */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-gray-900">Needs Attention</h4>
          </div>
          <p className="text-lg font-bold text-red-900 mb-1">
            {worstPerformer.area}
          </p>
          <p className="text-sm text-red-700">
            {worstPerformer.avg_CO2.toFixed(1)} CO₂ per unit
          </p>
        </div>
      </div>

      {/* Overall Performance Indicator */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Overall Performance</h4>
          <span className={`text-sm font-medium ${
            areasAboveTarget <= emissionData.length / 2 ? 'text-green-600' : 'text-red-600'
          }`}>
            {areasAboveTarget <= emissionData.length / 2 ? 'Good' : 'Needs Improvement'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              areasAboveTarget <= emissionData.length / 2 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${((emissionData.length - areasAboveTarget) / emissionData.length) * 100}%` 
            }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {emissionData.length - areasAboveTarget} of {emissionData.length} areas meeting targets
        </p>
      </div>
    </motion.div>
  );
};

export default BenchmarkSummaryCard;
