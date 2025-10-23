import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDataContext } from '../contexts/DataContext';

interface CO2BreakdownPieChartProps {
  className?: string;
}

const CO2BreakdownPieChart: React.FC<CO2BreakdownPieChartProps> = ({ className = '' }) => {
  const { userPrediction } = useDataContext();
  
  // Debug logging
  console.log('CO2BreakdownPieChart - userPrediction:', userPrediction);
  console.log('CO2BreakdownPieChart - localStorage data:', localStorage.getItem('userSurveyData'));

  // Calculate CO2 breakdown based on user input
  const calculateCO2Breakdown = () => {
    if (!userPrediction) return [];

    // Get survey data from localStorage for more detailed breakdown
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
    const totalCO2 = userPrediction.carbonFootprint;

    // Calculate individual CO2 contributions
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

    if (surveyData) {
      // Use the same calculation method as the survey for consistency
      const breakdown = [
        {
          name: 'Transportation',
          value: Math.round(calculateCO2('transportation', surveyData.transportation || 0)),
          color: '#20B2AA',
          icon: '🚗'
        },
        {
          name: 'Electricity',
          value: Math.round(calculateCO2('electricity', surveyData.electricity || 0)),
          color: '#0000FF',
          icon: '⚡'
        },
        {
          name: 'LPG/Gas',
          value: Math.round(calculateCO2('lpgUsage', surveyData.lpgUsage || 0)),
          color: '#8A2BE2',
          icon: '🔥'
        },
        {
          name: 'Air Travel',
          value: Math.round(calculateCO2('airTravel', surveyData.airTravel || 0)),
          color: '#FF4500',
          icon: '✈️'
        },
        {
          name: 'Meat Consumption',
          value: Math.round(calculateCO2('meatMeals', surveyData.meatMeals || 0)),
          color: '#FF0000',
          icon: '🥩'
        },
        {
          name: 'Dining Out',
          value: Math.round(calculateCO2('diningOut', surveyData.diningOut || 0)),
          color: '#00BFFF',
          icon: '🍽️'
        },
        {
          name: 'Waste',
          value: Math.round(calculateCO2('waste', surveyData.waste || 0)),
          color: '#FF8C00',
          icon: '🗑️'
        }
      ];

      // Filter out zero or negative values and ensure we have positive values
      const filteredBreakdown = breakdown.filter(item => item.value > 0);
      
      // Return exact calculated values without scaling
      return filteredBreakdown.map(item => ({
        ...item,
        value: Math.round(item.value * 100) / 100
      }));
    }

    // Fallback data - use same calculation method as survey
    const defaultValues = {
      transportation: 30,
      airTravel: 1,
      meatMeals: 10,
      diningOut: 3,
      electricity: 150,
      lpgUsage: 5,
      waste: 15
    };

    const breakdown = [
      {
        name: 'Transportation',
        value: Math.round(calculateCO2('transportation', defaultValues.transportation)),
        color: '#20B2AA',
        icon: '🚗'
      },
      {
        name: 'Electricity',
        value: Math.round(calculateCO2('electricity', defaultValues.electricity)),
        color: '#0000FF',
        icon: '⚡'
      },
      {
        name: 'LPG/Gas',
        value: Math.round(calculateCO2('lpgUsage', defaultValues.lpgUsage)),
        color: '#8A2BE2',
        icon: '🔥'
      },
      {
        name: 'Air Travel',
        value: Math.round(calculateCO2('airTravel', defaultValues.airTravel)),
        color: '#FF4500',
        icon: '✈️'
      },
      {
        name: 'Meat Consumption',
        value: Math.round(calculateCO2('meatMeals', defaultValues.meatMeals)),
        color: '#FF0000',
        icon: '🥩'
      },
      {
        name: 'Dining Out',
        value: Math.round(calculateCO2('diningOut', defaultValues.diningOut)),
        color: '#00BFFF',
        icon: '🍽️'
      },
      {
        name: 'Waste',
        value: Math.round(calculateCO2('waste', defaultValues.waste)),
        color: '#FF8C00',
        icon: '🗑️'
      }
    ];

    return breakdown.filter(item => item.value > 0);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalCO2 = userPrediction?.carbonFootprint || 0;
      const percentage = ((data.value / totalCO2) * 100).toFixed(1);
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{data.icon}</span>
            <span className="font-semibold text-gray-900">{data.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: data.color }}
              />
              <span>{data.value} kg CO₂ ({percentage}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    const totalCalculatedCO2 = payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0);
    
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalCalculatedCO2) * 100).toFixed(1);
          return (
            <div
              key={entry.value}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-gray-700">{entry.value}</span>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Show chart even without userPrediction using test data
  if (!userPrediction) {
    console.log('CO2BreakdownPieChart - No userPrediction, using test data');
  }

  const breakdownData = calculateCO2Breakdown();
  
  // Debug logging
  console.log('CO2BreakdownPieChart - breakdownData:', breakdownData);
  console.log('CO2BreakdownPieChart - breakdownData length:', breakdownData.length);

  // Fallback data for testing
  const testData = [
    { name: 'Transportation', value: 200, color: '#3B82F6', icon: '🚗' },
    { name: 'Energy', value: 300, color: '#EF4444', icon: '💡' },
    { name: 'Food', value: 150, color: '#84CC16', icon: '🍽️' },
    { name: 'Shopping', value: 100, color: '#A855F7', icon: '🛍️' },
    { name: 'Other', value: 50, color: '#0891B2', icon: '📱' }
  ];

  const chartData = breakdownData.length > 0 ? breakdownData : testData;
  
  console.log('CO2BreakdownPieChart - using chartData:', chartData);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CO2BreakdownPieChart;