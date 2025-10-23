import React from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Plane, 
  Utensils, 
  ShoppingBag, 
  Zap, 
  Trash2, 
  Recycle, 
  Leaf, 
  Home, 
  Building,
  MapPin,
  User,
  Settings
} from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';

interface SurveyInputBreakdownProps {
  className?: string;
}

const SurveyInputBreakdown: React.FC<SurveyInputBreakdownProps> = ({ className = '' }) => {
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

  if (!surveyData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
      >
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No Survey Data Available</h3>
          <p className="text-sm">Complete the survey to see your input breakdown</p>
        </div>
      </motion.div>
    );
  }

  const inputCategories = [
    {
      title: 'Transportation & Travel',
      icon: Car,
      color: 'blue',
      inputs: [
        { label: 'Monthly Transportation', value: `${surveyData.transportation || 0} km`, icon: Car },
        { label: 'Annual Air Travel', value: `${surveyData.airTravel || 0} hours`, icon: Plane },
      ]
    },
    {
      title: 'Food & Dining',
      icon: Utensils,
      color: 'green',
      inputs: [
        { label: 'Meat Meals per Month', value: `${surveyData.meatMeals || 0} meals`, icon: Utensils },
        { label: 'Dining Out per Month', value: `${surveyData.diningOut || 0} times`, icon: ShoppingBag },
        { label: 'Diet Type', value: surveyData.diet || 'Not specified', icon: Leaf },
      ]
    },
    {
      title: 'Energy & Utilities',
      icon: Zap,
      color: 'yellow',
      inputs: [
        { label: 'Monthly Electricity', value: `${surveyData.electricity || 0} kWh`, icon: Zap },
        { label: 'Monthly LPG Usage', value: `${surveyData.lpgUsage || 0} kg`, icon: Zap },
      ]
    },
    {
      title: 'Waste & Recycling',
      icon: Trash2,
      color: 'red',
      inputs: [
        { label: 'Monthly Waste', value: `${surveyData.waste || 0} kg`, icon: Trash2 },
        { label: 'Recycling Habit', value: surveyData.recycling || 'Not specified', icon: Recycle },
      ]
    },
    {
      title: 'Location',
      icon: MapPin,
      color: 'indigo',
      inputs: [
        { label: 'City', value: surveyData.city || 'Not specified', icon: MapPin },
        { label: 'Area', value: surveyData.area || 'Not specified', icon: MapPin },
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  const getBgColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      red: 'bg-red-50 border-red-200',
      purple: 'bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-50 border-indigo-200',
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
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Survey Inputs</h3>
            <p className="text-sm text-gray-600">Complete breakdown of all your lifestyle choices and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className={`${getBgColorClasses(category.color)} rounded-xl p-4 border`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 bg-gradient-to-r ${getColorClasses(category.color)} rounded-lg`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900">{category.title}</h4>
            </div>
            
            <div className="space-y-3">
              {category.inputs.map((input, inputIndex) => (
                <motion.div
                  key={input.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (categoryIndex * 0.1) + (inputIndex * 0.05) }}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white/50"
                >
                  <div className="flex items-center space-x-2">
                    <input.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{input.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{input.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">📊</span>
          Input Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{surveyData.transportation || 0}</div>
            <div className="text-sm text-gray-600">km/month transport</div>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{surveyData.electricity || 0}</div>
            <div className="text-sm text-gray-600">kWh/month energy</div>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{surveyData.meatMeals || 0}</div>
            <div className="text-sm text-gray-600">meat meals/month</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SurveyInputBreakdown;
