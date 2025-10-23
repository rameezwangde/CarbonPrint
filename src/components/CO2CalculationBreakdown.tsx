import React from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Plane, 
  Utensils, 
  ShoppingBag, 
  Zap, 
  Trash2, 
  Leaf
} from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

interface CO2CalculationBreakdownProps {
  className?: string;
}

const CO2CalculationBreakdown: React.FC<CO2CalculationBreakdownProps> = ({ className = '' }) => {
  const { userPrediction } = useDataContext();

  // Get survey data from localStorage
  const getSurveyData = () => {
    if (typeof window === 'undefined') return null;
    const savedData = localStorage.getItem('userSurveyData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing survey data:', error);
        return null;
      }
    }
    return null;
  };

  const surveyData = getSurveyData();

  // CO2 calculation functions (same as in Survey component)
  const calculateCO2 = (type: string, value: number): number => {
    const calculations = {
      transportation: value * 0.21, // kg CO2 per km
      airTravel: value * 90, // kg CO2 per hour
      meatMeals: value * 2.5, // kg CO2 per meal
      diningOut: value * 3.2, // kg CO2 per meal
      electricity: value * 0.45, // kg CO2 per kWh
      lpgUsage: value * 3, // kg CO2 per kg LPG
      waste: value * 0.5 // kg CO2 per kg waste
    };
    return Math.round(calculations[type as keyof typeof calculations] * 100) / 100;
  };

  if (!surveyData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
      >
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧮</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No Calculation Data Available</h3>
          <p className="text-sm">Complete the survey to see detailed CO₂ calculations</p>
        </div>
      </motion.div>
    );
  }

  const calculations = [
    {
      category: 'Transportation',
      icon: Car,
      color: 'blue',
      value: surveyData.transportation || 0,
      unit: 'km/month',
      co2PerUnit: 0.21,
      co2Total: calculateCO2('transportation', surveyData.transportation || 0),
      description: 'Personal vehicle usage and commuting'
    },
    {
      category: 'Air Travel',
      icon: Plane,
      color: 'purple',
      value: surveyData.airTravel || 0,
      unit: 'hours/year',
      co2PerUnit: 90,
      co2Total: calculateCO2('airTravel', surveyData.airTravel || 0),
      description: 'Flights and air travel'
    },
    {
      category: 'Meat Consumption',
      icon: Utensils,
      color: 'red',
      value: surveyData.meatMeals || 0,
      unit: 'meals/month',
      co2PerUnit: 2.5,
      co2Total: calculateCO2('meatMeals', surveyData.meatMeals || 0),
      description: 'Meat-based meals consumption'
    },
    {
      category: 'Dining Out',
      icon: ShoppingBag,
      color: 'orange',
      value: surveyData.diningOut || 0,
      unit: 'times/month',
      co2PerUnit: 3.2,
      co2Total: calculateCO2('diningOut', surveyData.diningOut || 0),
      description: 'Restaurant and takeout meals'
    },
    {
      category: 'Electricity',
      icon: Zap,
      color: 'yellow',
      value: surveyData.electricity || 0,
      unit: 'kWh/month',
      co2PerUnit: 0.45,
      co2Total: calculateCO2('electricity', surveyData.electricity || 0),
      description: 'Home electricity consumption'
    },
    {
      category: 'LPG Usage',
      icon: Zap,
      color: 'green',
      value: surveyData.lpgUsage || 0,
      unit: 'kg/month',
      co2PerUnit: 3,
      co2Total: calculateCO2('lpgUsage', surveyData.lpgUsage || 0),
      description: 'LPG gas for cooking and heating'
    },
    {
      category: 'Waste Generation',
      icon: Trash2,
      color: 'gray',
      value: surveyData.waste || 0,
      unit: 'kg/month',
      co2PerUnit: 0.5,
      co2Total: calculateCO2('waste', surveyData.waste || 0),
      description: 'Household waste disposal'
    }
  ];

  const totalCO2 = calculations.reduce((sum, calc) => sum + calc.co2Total, 0);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      yellow: 'from-yellow-500 to-yellow-600',
      green: 'from-green-500 to-green-600',
      gray: 'from-gray-500 to-gray-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  const getBgColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      green: 'bg-green-50 border-green-200',
      gray: 'bg-gray-50 border-gray-200',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
    >
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <span className="text-2xl">🧮</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">CO₂ Calculation Breakdown</h3>
            <p className="text-sm text-gray-600">Detailed calculation of your carbon footprint by category</p>
          </div>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold text-gray-900">{totalCO2.toFixed(1)} kg</span>
          <span className="text-lg text-gray-600 ml-2">CO₂ per month</span>
        </div>
      </div>

      <div className="space-y-4">
        {calculations.map((calc, index) => {
          const percentage = totalCO2 > 0 ? ((calc.co2Total / totalCO2) * 100).toFixed(1) : 0;
          const isHighest = calc.co2Total === Math.max(...calculations.map(c => c.co2Total));
          
          return (
            <motion.div
              key={calc.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${getBgColorClasses(calc.color)} rounded-xl p-4 border ${
                isHighest ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-gradient-to-r ${getColorClasses(calc.color)} rounded-lg`}>
                    <calc.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      {calc.category}
                      {isHighest && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          Highest
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-600">{calc.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{calc.co2Total.toFixed(1)} kg</div>
                  <div className="text-sm text-gray-600">{percentage}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Input Value:</span>
                  <span className="font-medium">{calc.value} {calc.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CO₂ per {calc.unit.split('/')[0]}:</span>
                  <span className="font-medium">{calc.co2PerUnit} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: (index * 0.1) + 0.5, duration: 0.8 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(calc.color)}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
      >
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <span className="text-lg mr-2">📊</span>
          Calculation Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Calculated CO₂:</span>
            <span className="font-semibold ml-2">{totalCO2.toFixed(1)} kg/month</span>
          </div>
          <div>
            <span className="text-gray-600">Highest Contributor:</span>
            <span className="font-semibold ml-2">
              {calculations.find(c => c.co2Total === Math.max(...calculations.map(calc => calc.co2Total)))?.category}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CO2CalculationBreakdown;
