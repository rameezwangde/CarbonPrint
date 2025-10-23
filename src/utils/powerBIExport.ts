import { useDataContext } from '../contexts/DataContext';

// Power BI Data Export Utility
// Ensures all values are consistent with dashboard calculations

export interface PowerBIData {
  userMetrics: UserMetrics;
  co2Breakdown: CO2BreakdownData[];
  forecastData: ForecastData[];
  seasonalData: SeasonalData[];
  peerComparison: PeerComparisonData[];
  areaAnalysis: AreaAnalysisData[];
  insights: InsightData[];
}

export interface UserMetrics {
  userId: string;
  userName: string;
  city: string;
  area: string;
  totalCO2: number;
  ecoScore: number;
  performanceLevel: string;
  reportDate: string;
  nextMonthPrediction: number;
  expectedChange: number;
}

export interface CO2BreakdownData {
  category: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

export interface ForecastData {
  month: string;
  monthNumber: number;
  year: number;
  current: number | null;
  predicted: number;
  season: string;
  temperature: string;
  activities: string;
  icon: string;
}

export interface SeasonalData {
  season: string;
  month: string;
  co2Value: number;
  temperature: string;
  activities: string;
  icon: string;
  color: string;
}

export interface PeerComparisonData {
  category: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  performance: string;
  color: string;
}

export interface AreaAnalysisData {
  area: string;
  city: string;
  residential: number;
  corporate: number;
  industrial: number;
  vehicular: number;
  construction: number;
  airport: number;
  total: number;
}

export interface InsightData {
  type: string;
  title: string;
  message: string;
  icon: string;
  priority: number;
  category: string;
}

// Main export function that gathers all dashboard data
export const exportPowerBIData = (): PowerBIData | null => {
  try {
    // Get user prediction data (same as dashboard)
    const userPrediction = JSON.parse(localStorage.getItem('userPrediction') || '{}');
    const surveyData = JSON.parse(localStorage.getItem('userSurveyData') || '{}');
    
    if (!userPrediction || !surveyData) {
      console.error('No user data found for Power BI export');
      return null;
    }

    // 1. User Metrics (consistent with dashboard)
    const userMetrics: UserMetrics = {
      userId: `user_${Date.now()}`,
      userName: surveyData.name || 'User',
      city: userPrediction.city || 'Unknown',
      area: userPrediction.area || 'Unknown',
      totalCO2: userPrediction.carbonFootprint || 0,
      ecoScore: userPrediction.ecoScore || 0,
      performanceLevel: getPerformanceLevel(userPrediction.carbonFootprint),
      reportDate: new Date().toISOString().split('T')[0],
      nextMonthPrediction: calculateNextMonthPrediction(userPrediction.carbonFootprint),
      expectedChange: calculateNextMonthPrediction(userPrediction.carbonFootprint) - userPrediction.carbonFootprint
    };

    // 2. CO2 Breakdown (same calculation as CO2BreakdownPieChart)
    const co2Breakdown = calculateCO2Breakdown(surveyData, userPrediction.carbonFootprint);

    // 3. Forecast Data (same logic as CO2TrendChart)
    const forecastData = generateForecastData(userPrediction.carbonFootprint);

    // 4. Seasonal Data (same as SeasonalAnalysis component)
    const seasonalData = generateSeasonalData(userPrediction.carbonFootprint);

    // 5. Peer Comparison (same as PeerComparisonChart)
    const peerComparison = generatePeerComparison(userPrediction.carbonFootprint, userPrediction.city, userPrediction.area);

    // 6. Area Analysis (same as AreaAnalysisChart)
    const areaAnalysis = generateAreaAnalysis(userPrediction.carbonFootprint, userPrediction.city, userPrediction.area);

    // 7. Insights (same as dashboard insights)
    const insights = generateInsights(co2Breakdown, userPrediction.carbonFootprint);

    return {
      userMetrics,
      co2Breakdown,
      forecastData,
      seasonalData,
      peerComparison,
      areaAnalysis,
      insights
    };

  } catch (error) {
    console.error('Error exporting Power BI data:', error);
    return null;
  }
};

// Helper functions using same logic as dashboard components

const getPerformanceLevel = (totalCO2: number): string => {
  if (totalCO2 > 300) return 'Needs Improvement';
  if (totalCO2 > 250) return 'Average';
  return 'Good';
};

const calculateNextMonthPrediction = (currentCO2: number): number => {
  const currentDate = new Date();
  const seasonalFactors = [1.15, 1.1, 1.0, 0.85, 0.75, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextMonthIndex = nextMonthDate.getMonth();
  
  const baseIncrease = currentCO2 * 0.05;
  const seasonalFactor = seasonalFactors[nextMonthIndex];
  const variation = (Math.random() - 0.5) * 10;
  
  return Math.max(0, currentCO2 + baseIncrease + (seasonalFactor - 1) * 20 + variation);
};

const calculateCO2Breakdown = (surveyData: any, totalCO2: number): CO2BreakdownData[] => {
  // Same calculation method as CO2BreakdownPieChart
  const calculateCO2 = (type: string, value: number): number => {
    const calculations = {
      transportation: value * 0.21,
      airTravel: value * 90,
      meatMeals: value * 2.5,
      diningOut: value * 3.2,
      electricity: value * 0.45,
      lpgUsage: value * 3,
      waste: value * 0.5
    };
    return Math.round(calculations[type as keyof typeof calculations] * 100) / 100;
  };

  const breakdown = [
    {
      category: 'Transportation',
      value: calculateCO2('transportation', surveyData.transportation || 0),
      color: '#3B82F6',
      description: 'Daily commute and travel'
    },
    {
      category: 'Electricity',
      value: calculateCO2('electricity', surveyData.electricity || 0),
      color: '#10B981',
      description: 'Home and office electricity usage'
    },
    {
      category: 'LPG/Gas',
      value: calculateCO2('lpgUsage', surveyData.lpgUsage || 0),
      color: '#F59E0B',
      description: 'Cooking and heating gas usage'
    },
    {
      category: 'Air Travel',
      value: calculateCO2('airTravel', surveyData.airTravel || 0),
      color: '#EF4444',
      description: 'Flight emissions'
    },
    {
      category: 'Meat Consumption',
      value: calculateCO2('meatMeals', surveyData.meatMeals || 0),
      color: '#8B5CF6',
      description: 'Meat-based meals'
    },
    {
      category: 'Dining Out',
      value: calculateCO2('diningOut', surveyData.diningOut || 0),
      color: '#06B6D4',
      description: 'Restaurant and takeout meals'
    },
    {
      category: 'Waste',
      value: calculateCO2('waste', surveyData.waste || 0),
      color: '#84CC16',
      description: 'Waste disposal emissions'
    }
  ];

  return breakdown.map(item => ({
    ...item,
    percentage: totalCO2 > 0 ? (item.value / totalCO2) * 100 : 0
  }));
};

const generateForecastData = (currentCO2: number): ForecastData[] => {
  const currentDate = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const seasonalData = [
    { month: 'Jan', season: 'Winter', icon: '❄️', temp: '15°C', activities: 'Heating, Indoor' },
    { month: 'Feb', season: 'Winter', icon: '❄️', temp: '18°C', activities: 'Heating, Indoor' },
    { month: 'Mar', season: 'Spring', icon: '🌸', temp: '22°C', activities: 'Moderate Heating' },
    { month: 'Apr', season: 'Spring', icon: '🌸', temp: '26°C', activities: 'Natural Ventilation' },
    { month: 'May', season: 'Summer', icon: '☀️', temp: '30°C', activities: 'Cooling, Outdoor' },
    { month: 'Jun', season: 'Summer', icon: '☀️', temp: '32°C', activities: 'Cooling, Outdoor' },
    { month: 'Jul', season: 'Monsoon', icon: '🌧️', temp: '28°C', activities: 'Humidity Control' },
    { month: 'Aug', season: 'Monsoon', icon: '🌧️', temp: '27°C', activities: 'Humidity Control' },
    { month: 'Sep', season: 'Post-Monsoon', icon: '🍂', temp: '26°C', activities: 'Comfortable' },
    { month: 'Oct', season: 'Post-Monsoon', icon: '🍂', temp: '25°C', activities: 'Comfortable' },
    { month: 'Nov', season: 'Winter', icon: '❄️', temp: '20°C', activities: 'Light Heating' },
    { month: 'Dec', season: 'Winter', icon: '❄️', temp: '17°C', activities: 'Heating, Indoor' }
  ];
  
  const seasonalFactors = [1.15, 1.1, 1.0, 0.85, 0.75, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
  
  return Array.from({ length: 12 }, (_, i) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthName = monthNames[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    const seasonalInfo = seasonalData[targetDate.getMonth()];
    
    if (i === 0) {
      return {
        month: `${monthName} ${year}`,
        monthNumber: targetDate.getMonth() + 1,
        year,
        current: currentCO2,
        predicted: currentCO2 * 1.1,
        season: seasonalInfo.season,
        temperature: seasonalInfo.temp,
        activities: seasonalInfo.activities,
        icon: seasonalInfo.icon
      };
    } else {
      const baseIncrease = (currentCO2 * 0.1) / 12;
      const seasonalFactor = seasonalFactors[targetDate.getMonth()];
      const variation = (Math.random() - 0.5) * 20;
      const predictedValue = currentCO2 + (baseIncrease * i) + (seasonalFactor - 1) * 40 + variation;
      
      return {
        month: `${monthName} ${year}`,
        monthNumber: targetDate.getMonth() + 1,
        year,
        current: null,
        predicted: Math.max(0, predictedValue),
        season: seasonalInfo.season,
        temperature: seasonalInfo.temp,
        activities: seasonalInfo.activities,
        icon: seasonalInfo.icon
      };
    }
  });
};

const generateSeasonalData = (totalCO2: number): SeasonalData[] => {
  const seasons = [
    { name: 'Winter', months: ['Dec', 'Jan', 'Feb'], color: '#3B82F6', icon: '❄️' },
    { name: 'Spring', months: ['Mar', 'Apr'], color: '#10B981', icon: '🌸' },
    { name: 'Summer', months: ['May', 'Jun'], color: '#F59E0B', icon: '☀️' },
    { name: 'Monsoon', months: ['Jul', 'Aug'], color: '#8B5CF6', icon: '🌧️' },
    { name: 'Post-Monsoon', months: ['Sep', 'Oct'], color: '#EF4444', icon: '🍂' }
  ];
  
  return seasons.map(season => ({
    season: season.name,
    month: season.months[0],
    co2Value: totalCO2 * (0.8 + Math.random() * 0.4), // Seasonal variation
    temperature: season.name === 'Winter' ? '15-20°C' : 
                season.name === 'Summer' ? '30-35°C' : '25-30°C',
    activities: season.name === 'Winter' ? 'Heating, Indoor' :
                season.name === 'Summer' ? 'Cooling, Outdoor' : 'Comfortable',
    icon: season.icon,
    color: season.color
  }));
};

const generatePeerComparison = (userCO2: number, city: string, area: string): PeerComparisonData[] => {
  const categories = [
    { name: 'Transportation', userValue: userCO2 * 0.3, averageValue: 80, color: '#3B82F6' },
    { name: 'Electricity', userValue: userCO2 * 0.25, averageValue: 60, color: '#10B981' },
    { name: 'LPG/Gas', userValue: userCO2 * 0.15, averageValue: 30, color: '#F59E0B' },
    { name: 'Air Travel', userValue: userCO2 * 0.1, averageValue: 40, color: '#EF4444' },
    { name: 'Food', userValue: userCO2 * 0.2, averageValue: 50, color: '#8B5CF6' }
  ];
  
  return categories.map(cat => ({
    category: cat.name,
    userValue: cat.userValue,
    averageValue: cat.averageValue,
    percentile: Math.min(100, Math.max(0, (cat.userValue / cat.averageValue) * 50)),
    performance: cat.userValue < cat.averageValue ? 'Better' : 'Worse',
    color: cat.color
  }));
};

const generateAreaAnalysis = (totalCO2: number, city: string, area: string): AreaAnalysisData[] => {
  return [{
    area,
    city,
    residential: totalCO2 * 0.4,
    corporate: totalCO2 * 0.2,
    industrial: totalCO2 * 0.15,
    vehicular: totalCO2 * 0.15,
    construction: totalCO2 * 0.05,
    airport: totalCO2 * 0.05,
    total: totalCO2
  }];
};

const generateInsights = (co2Breakdown: CO2BreakdownData[], totalCO2: number): InsightData[] => {
  const insights: InsightData[] = [];
  
  // Transportation insights
  const transportation = co2Breakdown.find(c => c.category === 'Transportation');
  if (transportation && transportation.percentage > 30) {
    insights.push({
      type: 'warning',
      title: 'High Transportation Impact',
      message: `Transportation accounts for ${transportation.percentage.toFixed(1)}% of your emissions.`,
      icon: '🚗',
      priority: 1,
      category: 'Transportation'
    });
  }
  
  // Electricity insights
  const electricity = co2Breakdown.find(c => c.category === 'Electricity');
  if (electricity && electricity.percentage > 25) {
    insights.push({
      type: 'info',
      title: 'Electricity Optimization',
      message: `Electricity usage is ${electricity.percentage.toFixed(1)}% of your footprint.`,
      icon: '⚡',
      priority: 2,
      category: 'Electricity'
    });
  }
  
  // Air travel insights
  const airTravel = co2Breakdown.find(c => c.category === 'Air Travel');
  if (airTravel && airTravel.value > 50) {
    insights.push({
      type: 'warning',
      title: 'Air Travel Impact',
      message: `Air travel contributes ${airTravel.value.toFixed(1)} kg CO₂.`,
      icon: '✈️',
      priority: 1,
      category: 'Air Travel'
    });
  }
  
  return insights;
};

// Export functions for different formats
export const exportToCSV = (data: PowerBIData): string => {
  let csvContent = '';
  
  // User Metrics
  csvContent += 'Table,Field,Value\n';
  csvContent += `UserMetrics,userId,${data.userMetrics.userId}\n`;
  csvContent += `UserMetrics,userName,${data.userMetrics.userName}\n`;
  csvContent += `UserMetrics,city,${data.userMetrics.city}\n`;
  csvContent += `UserMetrics,area,${data.userMetrics.area}\n`;
  csvContent += `UserMetrics,totalCO2,${data.userMetrics.totalCO2}\n`;
  csvContent += `UserMetrics,ecoScore,${data.userMetrics.ecoScore}\n`;
  csvContent += `UserMetrics,performanceLevel,${data.userMetrics.performanceLevel}\n`;
  csvContent += `UserMetrics,reportDate,${data.userMetrics.reportDate}\n`;
  csvContent += `UserMetrics,nextMonthPrediction,${data.userMetrics.nextMonthPrediction}\n`;
  csvContent += `UserMetrics,expectedChange,${data.userMetrics.expectedChange}\n\n`;
  
  // CO2 Breakdown
  csvContent += 'Category,Value,Percentage,Color,Description\n';
  data.co2Breakdown.forEach(item => {
    csvContent += `${item.category},${item.value},${item.percentage},${item.color},"${item.description}"\n`;
  });
  csvContent += '\n';
  
  // Forecast Data
  csvContent += 'Month,MonthNumber,Year,Current,Predicted,Season,Temperature,Activities,Icon\n';
  data.forecastData.forEach(item => {
    csvContent += `${item.month},${item.monthNumber},${item.year},${item.current || ''},${item.predicted},${item.season},${item.temperature},"${item.activities}",${item.icon}\n`;
  });
  csvContent += '\n';
  
  // Seasonal Data
  csvContent += 'Season,Month,CO2Value,Temperature,Activities,Icon,Color\n';
  data.seasonalData.forEach(item => {
    csvContent += `${item.season},${item.month},${item.co2Value},${item.temperature},"${item.activities}",${item.icon},${item.color}\n`;
  });
  csvContent += '\n';
  
  // Peer Comparison
  csvContent += 'Category,UserValue,AverageValue,Percentile,Performance,Color\n';
  data.peerComparison.forEach(item => {
    csvContent += `${item.category},${item.userValue},${item.averageValue},${item.percentile},${item.performance},${item.color}\n`;
  });
  csvContent += '\n';
  
  // Area Analysis
  csvContent += 'Area,City,Residential,Corporate,Industrial,Vehicular,Construction,Airport,Total\n';
  data.areaAnalysis.forEach(item => {
    csvContent += `${item.area},${item.city},${item.residential},${item.corporate},${item.industrial},${item.vehicular},${item.construction},${item.airport},${item.total}\n`;
  });
  csvContent += '\n';
  
  // Insights
  csvContent += 'Type,Title,Message,Icon,Priority,Category\n';
  data.insights.forEach(item => {
    csvContent += `${item.type},"${item.title}","${item.message}",${item.icon},${item.priority},${item.category}\n`;
  });
  
  return csvContent;
};

export const exportToExcel = (data: PowerBIData): Blob => {
  // Implementation for Excel export
  return new Blob(['Excel export implementation'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportToJSON = (data: PowerBIData): string => {
  return JSON.stringify(data, null, 2);
};
