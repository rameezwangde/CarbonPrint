import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Users, 
  MapPin, 
  Target, 
  History, 
  Settings,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Menu,
  PieChart,
  Calendar,
  FileText
} from 'lucide-react';
import { useDataContext } from '../contexts/DataContext';
import logoUrl from '../assets/logo.png';
import CO2TrendChart from '../components/CO2TrendChart';
import CO2BreakdownPieChart from '../components/CO2BreakdownPieChart';
import SeasonalAnalysis from '../components/SeasonalAnalysis';
import PeerComparisonChart from '../components/PeerComparisonChart';
import AreaAnalysisChart from '../components/AreaAnalysisChart';
import Maps from './Maps';
import SummaryReport from './SummaryReport';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { calculateAreaEmissions } from '../utils/areaEmissionFactors';

type DashboardSection = 'insights' | 'pie-chart' | 'seasonal' | 'forecast' | 'recommendations' | 'peer-comparison' | 'area-analysis' | 'maps' | 'summary-report' | 'history' | 'settings';

const Dashboard: React.FC = () => {
  const { userPrediction, refreshUserPrediction } = useDataContext();
  
  // Add CSS animations for text effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes textShimmer {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DashboardSection>('insights');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submissionStats, setSubmissionStats] = useState<{
    submissions_since_last_retrain: number;
    retrain_threshold: number;
    submissions_until_retrain: number;
  } | null>(null);
  const [sliderValues, setSliderValues] = useState<{
    [key: string]: number;
  }>({
    airTravel: 0,
    transportation: 0,
    electricity: 0
  });
  const [top3Categories, setTop3Categories] = useState<Array<{
    name: string;
    current: number;
    percentage: number;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }>>([]);
  const [top3Loading, setTop3Loading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [historyData, setHistoryData] = useState<Array<{
    id: string;
    created_at: string;
    area: string;
    current_co2?: number;
    predicted_co2?: number;
    actual_co2?: number;
    model?: string;
    confidence?: number;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const navigationItems = [
    { id: 'insights', label: 'Insights', icon: Brain, color: 'text-purple-600' },
    { id: 'pie-chart', label: 'CO₂ Breakdown', icon: PieChart, color: 'text-blue-600' },
    { id: 'seasonal', label: 'Seasonal Analysis', icon: Calendar, color: 'text-green-600' },
    { id: 'forecast', label: '12-Month Forecast', icon: TrendingUp, color: 'text-orange-600' },
    { id: 'recommendations', label: 'Recommendations', icon: Target, color: 'text-green-600' },
    { id: 'peer-comparison', label: 'Peer Comparison', icon: Users, color: 'text-orange-600' },
    { id: 'area-analysis', label: 'Area Analysis', icon: MapPin, color: 'text-indigo-600' },
    { id: 'maps', label: 'Maps', icon: MapPin, color: 'text-purple-600' },
    { id: 'summary-report', label: 'Summary Report', icon: FileText, color: 'text-emerald-600' },
    { id: 'history', label: 'History', icon: History, color: 'text-gray-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
  ];

  const loadSubmissionStats = useCallback(async () => {
    try {
      const stats = await apiService.getSubmissionStats();
      setSubmissionStats(stats);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to load submission stats:', error);
      setRetryCount(prev => prev + 1);
      
      // Set fallback values if API fails and stop retrying after 3 attempts
      if (retryCount >= 3) {
        setSubmissionStats({
          submissions_since_last_retrain: 0,
          retrain_threshold: 20,
          submissions_until_retrain: 20
        });
      }
    }
  }, [retryCount]);

  const getPieChartData = useCallback(() => {
    // Use the EXACT same logic as CO2BreakdownPieChart component
    if (!userPrediction) return [];

    // Get survey data from localStorage (same as pie chart)
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

    // Calculate individual CO2 contributions (EXACT same as pie chart)
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
      const breakdown = [
        {
          name: 'Transportation',
          value: calculateCO2('transportation', surveyData.transportation || 0),
          icon: '🚗',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          description: 'Daily commuting and travel'
        },
        {
          name: 'Electricity',
          value: calculateCO2('electricity', surveyData.electricity || 0),
          icon: '⚡',
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'Home electricity consumption'
        },
        {
          name: 'LPG/Gas',
          value: calculateCO2('lpgUsage', surveyData.lpgUsage || 0),
          icon: '🔥',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          description: 'Cooking gas consumption'
        },
        {
          name: 'Air Travel',
          value: calculateCO2('airTravel', surveyData.airTravel || 0),
          icon: '✈️',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Annual flight emissions'
        },
        {
          name: 'Meat Consumption',
          value: calculateCO2('meatMeals', surveyData.meatMeals || 0),
          icon: '🥩',
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'Meat and dairy consumption'
        },
        {
          name: 'Dining Out',
          value: calculateCO2('diningOut', surveyData.diningOut || 0),
          icon: '🍽️',
          color: 'from-cyan-500 to-blue-500',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200',
          description: 'Restaurant and takeout meals'
        },
        {
          name: 'Shopping',
          value: Math.round((surveyData.meatMeals || 0) * 0.5 + (surveyData.diningOut || 0) * 0.8),
          icon: '🛍️',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Shopping and consumption'
        },
        {
          name: 'Waste',
          value: calculateCO2('waste', surveyData.waste || 0),
          icon: '🗑️',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          description: 'Waste disposal emissions'
        },
        {
          name: 'Diet',
          value: Math.round((surveyData.diet === 'Vegan' ? 0.3 : surveyData.diet === 'Vegetarian' ? 0.6 : 1) * (surveyData.meatMeals || 0) * 0.5),
          icon: '🥗',
          color: 'from-lime-500 to-green-500',
          bgColor: 'bg-lime-50',
          borderColor: 'border-lime-200',
          description: 'Diet-related emissions'
        },
        {
          name: 'Heating',
          value: Math.round((surveyData.heatingSource === 'Electricity' ? 0.2 : 0.1) * (surveyData.electricity || 0) * 0.45),
          icon: '🏠',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Home heating emissions'
        },
        {
          name: 'Recycling',
          value: Math.round((surveyData.recycling === 'Always' ? -5 : surveyData.recycling === 'Sometimes' ? -2 : 0)),
          icon: '♻️',
          color: 'from-teal-500 to-cyan-500',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-200',
          description: 'Recycling impact'
        },
        {
          name: 'Cooking',
          value: Math.round((surveyData.cookingEnergy === 'LPG' ? 0.3 : 0.1) * (surveyData.lpgUsage || 0) * 3),
          icon: '👨‍🍳',
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Cooking energy emissions'
        },
        {
          name: 'Social',
          value: Math.round((surveyData.socialActivity === 'High' ? 15 : surveyData.socialActivity === 'Medium' ? 8 : 3)),
          icon: '👥',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          description: 'Social activity emissions'
        }
      ];

      // Filter out zero or negative values (EXACT same as pie chart)
      const filteredBreakdown = breakdown.filter(item => item.value > 0);
      
      // Use calculated values directly without scaling for consistency
      const breakdownWithCurrent = filteredBreakdown.map(item => ({
        ...item,
        current: item.value,
        percentage: 0
      }));

      // Calculate percentages based on calculated total
      const calculatedTotal = breakdownWithCurrent.reduce((sum, cat) => sum + cat.current, 0);
      breakdownWithCurrent.forEach(cat => {
        cat.percentage = calculatedTotal > 0 ? Math.round((cat.current / calculatedTotal) * 100) : 0;
      });

      // Return top 3 categories sorted by current emissions (highest first)
      return breakdownWithCurrent
        .sort((a, b) => b.current - a.current)
        .slice(0, 3);
    }

    // Fallback if no survey data
    return [];
  }, [userPrediction]);

  const getFallbackCategories = useCallback((surveyData: Record<string, unknown>): Array<{
    name: string;
    current: number;
    percentage: number;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }> => {
    const airTravelHours = Number(surveyData.airTravel) || 0;
    const transportationKm = Number(surveyData.transportation) || 0;
    const electricityKwh = Number(surveyData.electricity) || 0;
    const totalCO2 = userPrediction?.carbonFootprint || 0;
    
    const categories = [
      {
        name: 'Air Travel',
        current: airTravelHours > 0 ? Math.round(airTravelHours * 0.255) : Math.round(totalCO2 * 0.15),
        percentage: 0,
        icon: '✈️',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Annual flight emissions'
      },
      {
        name: 'Transportation',
        current: transportationKm > 0 ? Math.round(transportationKm * 0.12) : Math.round(totalCO2 * 0.25),
        percentage: 0,
        icon: '🚗',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Daily commuting and travel'
      },
      {
        name: 'Electricity',
        current: electricityKwh > 0 ? Math.round(electricityKwh * 0.82) : Math.round(totalCO2 * 0.20),
        percentage: 0,
        icon: '⚡',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Home electricity consumption'
      }
    ];

    // Calculate percentages
    const total = categories.reduce((sum, cat) => sum + cat.current, 0);
    categories.forEach(cat => {
      cat.percentage = total > 0 ? Math.round((cat.current / total) * 100) : 0;
    });

    return categories.sort((a, b) => b.current - a.current).slice(0, 3);
  }, [userPrediction]);

  const loadTop3Categories = useCallback(async () => {
    try {
      setTop3Loading(true);
      
      // Use the same data source as the pie chart for complete consistency
      // This ensures recommendations match insights page exactly
      const pieChartData = getPieChartData();
      setTop3Categories(pieChartData);
      
    } catch (error) {
      console.error('Error loading top 3 categories:', error);
      // Fallback to localStorage data if calculation fails
      const surveyData = JSON.parse(localStorage.getItem('userSurveyData') || '{}');
      const fallbackCategories = getFallbackCategories(surveyData);
      setTop3Categories(fallbackCategories);
    } finally {
      setTop3Loading(false);
    }
  }, [getPieChartData, getFallbackCategories]);

  // LocalStorage-based History (lightweight, no backend dependency)
  const HISTORY_KEY = 'submissionHistory';

  const readHistoryFromLocalStorage = (): Array<{
    id: string;
    created_at: string;
    area: string;
    current_co2?: number;
    predicted_co2?: number;
    actual_co2?: number;
    model?: string;
    confidence?: number;
  }> => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const loadHistoryData = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = readHistoryFromLocalStorage();
      setHistoryData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading history data:', error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);


  // Load user prediction data when component mounts
  React.useEffect(() => {
    refreshUserPrediction();
  }, []); // Remove refreshUserPrediction from dependencies to prevent infinite loop

  // Load submission stats when component mounts
  React.useEffect(() => {
    loadSubmissionStats();
    loadTop3Categories();
    loadHistoryData();
    
    // Only retry once after 5 seconds, then stop
    const timeout = setTimeout(() => {
      if (!submissionStats) {
        loadSubmissionStats();
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []); // Remove submissionStats from dependencies to prevent infinite loop

  // Hide footer when Maps section is active
  React.useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      if (activeSection === 'maps') {
        footer.style.display = 'none';
      } else {
        footer.style.display = 'block';
      }
    }
    
    // Cleanup function to restore footer when component unmounts
    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, [activeSection]);


  const renderInsights = () => {
    console.log('renderInsights - userPrediction:', userPrediction);
    
    if (!userPrediction) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
            <p className="text-gray-600">Please complete the survey to view your carbon insights.</p>
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                Debug: userPrediction is null. Check if survey data is saved in localStorage.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // Calculate prediction increase reasons
    const currentCO2 = userPrediction.carbonFootprint;
    const predictedCO2 = userPrediction.predictedCO2 || 0;
    const increase = predictedCO2 - currentCO2;
    const increasePercent = currentCO2 > 0 ? ((increase / currentCO2) * 100).toFixed(1) : 0;

    // Generate reasons for increase with percentages
    const getIncreaseReasons = () => {
      const reasons = [];
      if (increase > 50) {
        reasons.push({ text: "Higher transportation usage expected", percentage: "35%", icon: "🚗", color: "from-orange-500 to-red-500" });
        reasons.push({ text: "Seasonal energy consumption increase", percentage: "25%", icon: "⚡", color: "from-yellow-500 to-orange-500" });
      }
      if (increase > 100) {
        reasons.push({ text: "Increased heating/cooling needs", percentage: "20%", icon: "🌡️", color: "from-blue-500 to-cyan-500" });
        reasons.push({ text: "More frequent dining out patterns", percentage: "15%", icon: "🍽️", color: "from-pink-500 to-rose-500" });
      }
      if (increase > 150) {
        reasons.push({ text: "Planned travel or events", percentage: "10%", icon: "✈️", color: "from-purple-500 to-indigo-500" });
        reasons.push({ text: "Home energy efficiency decline", percentage: "5%", icon: "🏠", color: "from-gray-500 to-slate-500" });
      }
      if (reasons.length === 0) {
        reasons.push({ text: "Normal seasonal variation", percentage: "60%", icon: "🍂", color: "from-emerald-500 to-teal-500" });
        reasons.push({ text: "Minor lifestyle changes", percentage: "40%", icon: "📈", color: "from-green-500 to-emerald-500" });
      }
      return reasons;
    };

    const increaseReasons = getIncreaseReasons();

    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Ultra-Dynamic Background Effects */}
        <div className="absolute inset-0 -z-10">
        <motion.div
            animate={{ 
              x: [0, 30, -20, 0], 
              y: [0, -20, 10, 0],
              scale: [1, 1.2, 0.8, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-pink-400/40 via-purple-400/30 to-indigo-400/35 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, -25, 15, 0], 
              y: [0, 25, -15, 0],
              scale: [1, 0.9, 1.1, 1],
              rotate: [0, -90, -180, -270, -360]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-r from-orange-400/35 via-red-400/30 to-pink-400/40 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, 20, -30, 0], 
              y: [0, -30, 20, 0],
              scale: [1, 1.3, 0.7, 1],
              rotate: [0, 120, 240, 360]
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 6
            }}
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/30 via-blue-400/25 to-purple-400/35 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, -15, 25, 0], 
              y: [0, 15, -25, 0],
              scale: [1, 0.8, 1.2, 1],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ 
              duration: 22, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 9
            }}
            className="absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-r from-yellow-400/25 via-orange-400/20 to-red-400/30 rounded-full blur-2xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              x: [0, 40, -20, 0], 
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.9, 1],
              rotate: [0, 60, 120, 180, 240, 300, 360]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 12
            }}
            className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-emerald-400/30 via-teal-400/25 to-cyan-400/35 rounded-full blur-2xl"
          ></motion.div>
          </div>
          
        {/* Floating Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          
          {/* Left Column - Current Emissions & Key Stats */}
                <motion.div
            initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Current Emissions Card - Enhanced */}
            <motion.div 
              className="relative group"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                rotateY: 5
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/25 to-indigo-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"
              ></motion.div>
              <div className="relative bg-white/20 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  >
                    🌱
                </motion.div>
                  <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-2"
                  >
                    Current Emissions
                  </motion.h3>
                <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 0px rgba(0,0,0,0)",
                        "0 0 20px rgba(236, 72, 153, 0.3)",
                        "0 0 0px rgba(0,0,0,0)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="text-4xl font-black text-gray-900 mb-2"
                  >
                    {userPrediction?.carbonFootprint?.toFixed(1) || '0.0'}
        </motion.div>
                  <div className="text-gray-600 font-medium">kg CO2/month</div>
          <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-sm font-semibold text-green-700"
                  >
                    -5.2% vs last month
              </motion.div>
            </div>
          </div>
        </motion.div>

            {/* Model Confidence Card - Enhanced */}
        <motion.div
              className="relative group"
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                rotateY: -5
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-purple-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"
              ></motion.div>
              <div className="relative bg-white/20 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="text-center">
                  <motion.div 
                    animate={{ 
                      rotate: [0, -15, 15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                  >
                    🧠
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent mb-2"
                  >
                    Model Confidence
                  </motion.h3>
              <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      textShadow: [
                        "0 0 0px rgba(0,0,0,0)",
                        "0 0 15px rgba(59, 130, 246, 0.4)",
                        "0 0 0px rgba(0,0,0,0)"
                      ]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="text-3xl font-black text-gray-900 mb-2"
                  >
                    {userPrediction?.confidence ? `${(userPrediction.confidence * 100).toFixed(0)}%` : '85%'}
                  </motion.div>
                  <div className="text-gray-600 font-medium text-sm">Prediction Accuracy</div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-3 text-sm font-semibold text-blue-700"
                  >
                    High Confidence
                  </motion.div>
              </div>
            </div>
          </motion.div>
          </motion.div>

          {/* Center Column - Main Forecast Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
                
                <div className="text-center mb-8 relative z-10">
                  <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                    Next Month Forecast
                  </h3>
                  <p className="text-gray-700 text-lg font-medium">AI-powered prediction of your carbon footprint</p>
              </div>
                  
                {/* Main Forecast Display */}
                <div className="text-center mb-8 relative z-10">
                  <div className="text-8xl font-black text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {userPrediction?.predictedCO2?.toFixed(1) || '0.0'}
                    </div>
                  <div className="text-2xl text-gray-600 mb-6">kg CO2/month</div>
                  
                  {/* Increase Indicator */}
                  <div className="inline-flex items-center px-6 py-3 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full shadow-lg">
                    <span className="text-orange-700 font-bold text-xl">
                      +{increasePercent}% increase
                    </span>
                </div>
              </div>
              
                {/* Forecast Details */}
                <div className="grid grid-cols-3 gap-6 relative z-10">
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                    <div className="text-lg font-bold text-gray-800 mb-1">Current</div>
                    <div className="text-xl font-black text-gray-900">{userPrediction?.carbonFootprint?.toFixed(1) || '0.0'} kg</div>
                    </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                    <div className="text-lg font-bold text-gray-800 mb-1">Forecast</div>
                    <div className="text-xl font-black text-gray-900">{userPrediction?.predictedCO2?.toFixed(1) || '0.0'} kg</div>
                  </div>
                  <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                    <div className="text-lg font-bold text-gray-800 mb-1">Change</div>
                    <div className="text-xl font-black text-orange-600">+{increase.toFixed(1)} kg</div>
                    </div>
                    </div>
                  </div>
            </div>
          </motion.div>
          </div>

        {/* Bottom Section - Analysis & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Increase Analysis Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Increase Analysis</h3>
                <p className="text-gray-600 text-sm">Breakdown of expected CO₂ increase factors</p>
          </div>
          
            {/* Increase Summary */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-6 py-3 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full shadow-lg">
                  <span className="text-orange-700 font-bold text-2xl">
                    +{increase.toFixed(1)} kg ({increasePercent}% increase)
                  </span>
              </div>
            </div>
            
                {/* Contributing Factors - Enhanced */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Expected Contributing Factors</h4>
              <div className="space-y-3">
                {increaseReasons.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 5,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                    className="group flex items-center justify-between bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.3
                        }}
                        className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                      >
                        {reason.icon}
                      </motion.div>
                      <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">{reason.text}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-200/50 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: reason.percentage }}
                          transition={{ duration: 1.5, delay: 0.8 + index * 0.1 }}
                          className={`bg-gradient-to-r ${reason.color} h-3 rounded-full relative overflow-hidden`}
                        >
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: 1 + index * 0.2
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          ></motion.div>
                        </motion.div>
                      </div>
                      <motion.span 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          color: ["#ea580c", "#dc2626", "#ea580c"]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                        className="text-orange-600 font-bold text-sm w-12 text-right"
                      >
                        {reason.percentage}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>

          {/* Model Performance Chart */}
      <motion.div
            initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
              className="relative group"
            >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Model Performance</h3>
                <p className="text-gray-600 text-sm">Advanced machine learning metrics</p>
                </div>
          
              {/* Model Stats Grid - Enhanced */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    icon: Brain, 
                    title: "Model Used", 
                    value: userPrediction?.modelUsed || 'XGBoost', 
                    color: "from-blue-500 to-purple-500",
                    textColor: "text-blue-600",
                    delay: 0
                  },
                  { 
                    icon: TrendingUp, 
                    title: "R² Score", 
                    value: "0.848", 
                    color: "from-green-500 to-emerald-500",
                    textColor: "text-green-600",
                    delay: 0.1
                  },
                  { 
                    icon: BarChart3, 
                    title: "MAE", 
                    value: "242.9 kg", 
                    color: "from-emerald-500 to-teal-500",
                    textColor: "text-emerald-600",
                    delay: 0.2
                  },
                  { 
                    icon: RefreshCw, 
                    title: "Auto-Retrain", 
                    value: submissionStats ? `${submissionStats.submissions_until_retrain}/20` : 'Loading...', 
                    color: "from-orange-500 to-red-500",
                    textColor: "text-orange-600",
                    delay: 0.3
                  }
                ].map((stat) => (
            <motion.div 
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + stat.delay }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      rotateY: 5
                    }}
                    className="text-center p-4 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/20 transition-all duration-300 group"
                  >
            <motion.div 
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: stat.delay
                      }}
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
            </motion.div>
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">{stat.title}</h4>
                    <motion.p 
                      animate={{ 
                        scale: [1, 1.05, 1],
                        textShadow: [
                          "0 0 0px rgba(0,0,0,0)",
                          "0 0 10px rgba(59, 130, 246, 0.3)",
                          "0 0 0px rgba(0,0,0,0)"
                        ]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1 + stat.delay
                      }}
                      className={`text-lg font-bold ${stat.textColor}`}
                    >
                      {stat.value}
                    </motion.p>
            </motion.div>
                ))}
          </div>
              
              {/* Progress Bar - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-6"
              >
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Retrain Progress</span>
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      color: ["#6b7280", "#f97316", "#6b7280"]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="font-bold"
                  >
                    {submissionStats ? `${Math.round((submissionStats.submissions_until_retrain / 20) * 100)}%` : '0%'}
                  </motion.span>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-4 overflow-hidden">
      <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: submissionStats ? `${(submissionStats.submissions_until_retrain / 20) * 100}%` : '0%'
                    }}
                    transition={{ duration: 2, delay: 1.5 }}
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 h-4 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    ></motion.div>
      </motion.div>
              </div>
            </motion.div>
        </div>
      </motion.div>
        </div>

        {/* Insights Content */}
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Carbon Insights</h2>
            <p className="text-gray-600 mb-8">Your carbon footprint analysis and predictions</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Current Emissions</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {userPrediction?.carbonFootprint?.toFixed(1) || 0} kg
                </div>
                <p className="text-gray-600">Monthly carbon footprint</p>
          </div>
          
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Predicted Emissions</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {userPrediction?.predictedCO2?.toFixed(1) || 0} kg
            </div>
                <p className="text-gray-600">Next month forecast</p>
          </div>
          
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Model Confidence</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userPrediction?.confidence || 85}%
          </div>
                <p className="text-gray-600">Prediction accuracy</p>
        </div>
            </div>
          </div>
        </div>
    </div>
  );
  };

  const renderRecommendations = () => {
    // Use the same calculated breakdown as CO2 Breakdown page for consistency
    const categories = top3Categories.length > 0 ? top3Categories : [];
    // Use the ML prediction for consistency with Insights page
    const totalCurrent = userPrediction?.carbonFootprint || 0;

    // Calculate scenario values based on slider reductions
    const calculateScenarioValues = () => {
      return categories.map(category => {
        const reductionPercent = sliderValues[category.name.toLowerCase().replace(' ', '')] || 0;
        const reduction = (category.current * reductionPercent) / 100;
        return {
          ...category,
          scenario: category.current - reduction,
          savings: reduction
        };
      });
    };

    const scenarioValues = calculateScenarioValues();
    // Calculate savings based on the top 3 categories from user's actual breakdown
    const totalSavings = scenarioValues.reduce((sum, cat) => sum + cat.savings, 0);
    const totalScenario = Math.max(0, totalCurrent - totalSavings);
    const savingsPercentage = totalCurrent > 0 ? Math.round((totalSavings / totalCurrent) * 100) : 0;

    // Show loading state if data is being fetched
    if (top3Loading) {
      return (
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 text-lg font-medium">Loading smart recommendations...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show fallback if no data available
    if (categories.length === 0) {
      return (
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="flex items-center justify-center h-96">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <div className="text-gray-700 text-lg font-medium mb-6">No recommendation data available</div>
          <button 
            onClick={loadTop3Categories}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-r from-teal-400/25 to-cyan-400/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-r from-lime-400/15 to-green-400/15 rounded-full blur-2xl animate-pulse delay-1500"></div>
          </div>
          
        {/* Floating Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          
          {/* Left Column - Current Emissions & Top Categories */}
            <motion.div
            initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Current Emissions Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    📊
          </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Emissions</h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {totalCurrent.toFixed(1)}
                  </div>
                  <div className="text-gray-600 font-medium">kg CO2/month</div>
                </div>
              </div>
            </div>

        {/* Top 3 Categories */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900 text-center">Top Categories</h4>
              {categories.slice(0, 3).map((category, index) => (
              <motion.div
                key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                className="relative group"
              >
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500`}></div>
                  <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{category.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{category.name}</div>
                        <div className="text-lg font-black text-gray-900">{category.current.toFixed(1)} kg</div>
                        <div className="text-xs text-gray-600">{category.percentage}% of total</div>
                </div>
              </div>
            </div>
              </motion.div>
            ))}
            </div>
          </motion.div>

          {/* Center Column - Interactive Sliders */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
                
                <div className="text-center mb-8 relative z-10">
                  <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                    Smart Recommendations
                  </h3>
                  <p className="text-gray-700 text-lg font-medium">Adjust sliders to see potential savings</p>
      </div>

                {/* Interactive Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {categories.map((category, index) => (
      <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="relative group"
              >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500`}></div>
                      <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center mb-6">
                          <div className="text-4xl mb-3">{category.icon}</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                          <div className="text-2xl font-black text-gray-900 mb-1">{category.current.toFixed(1)} kg</div>
                  <p className="text-sm text-gray-600">Current Emission</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3 text-center">Small consistent changes matter.</p>
                  
                          {/* Enhanced Slider */}
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValues[category.name.toLowerCase().replace(' ', '')] || 0}
                              className="w-full h-4 bg-gray-200/50 rounded-lg appearance-none cursor-pointer slider relative z-10"
                            style={{
                                background: `linear-gradient(to right, #10B981 0%, #10B981 ${sliderValues[category.name.toLowerCase().replace(' ', '')] || 0}%, rgba(255,255,255,0.3) ${sliderValues[category.name.toLowerCase().replace(' ', '')] || 0}%, rgba(255,255,255,0.3) 100%)`,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              const categoryKey = category.name.toLowerCase().replace(' ', '');
                              
                              // Update slider state
                              setSliderValues(prev => ({
                                ...prev,
                                [categoryKey]: value
                              }));
                              
                              // Update visual feedback
                                e.target.style.background = `linear-gradient(to right, #10B981 0%, #10B981 ${value}%, rgba(255,255,255,0.3) ${value}%, rgba(255,255,255,0.3) 100%)`;
                            }}
                          />
                        </div>
                  
                          <div className="text-center mt-4">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                              Reduction: {sliderValues[category.name.toLowerCase().replace(' ', '')] || 0}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {((category.current * (sliderValues[category.name.toLowerCase().replace(' ', '')] || 0)) / 100).toFixed(1)} kg saved
                            </div>
                    </div>
              </div>
            </div>
              </motion.div>
          ))}
        </div>
                </div>
        </div>
      </motion.div>

          {/* Right Column - Scenario Results & Charts */}
        <motion.div
            initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Scenario Results Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    🎯
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Scenario</h3>
                  <div className="text-4xl font-black text-gray-900 mb-2">
                    {totalScenario.toFixed(1)}
                  </div>
                  <div className="text-gray-600 font-medium">kg CO2/month</div>
                  <div className="mt-3 text-sm font-semibold text-orange-700">
                    {savingsPercentage}% reduction
                </div>
              </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    💰
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Total Savings</h3>
                  <div className="text-3xl font-black text-gray-900 mb-2">
                    {totalSavings.toFixed(1)} kg
                  </div>
                  <div className="text-gray-600 font-medium text-sm">CO2 Emissions Reduced</div>
                  <div className="mt-3 text-sm font-semibold text-emerald-700">
                    {Math.round(totalSavings / 22)} trees saved/month
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        {/* Bottom Section - Visual Charts & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Chart 1: Current vs Scenario Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Emissions Comparison</h3>
                <p className="text-gray-600 text-sm">Current vs Your Scenario</p>
            </div>
            
              {/* Bar Chart */}
              <div className="h-64 flex items-end justify-center space-x-8">
              {/* Current Bar */}
                <div className="flex flex-col items-center group">
                  <div className="w-16 bg-gradient-to-t from-green-600 to-green-500 rounded-t-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 relative" 
                       style={{ height: '200px' }}>
                  <div className="w-full h-full bg-gradient-to-t from-green-400 to-green-300 rounded-t-2xl"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-900">
                      {totalCurrent.toFixed(0)}
                </div>
                  </div>
                  <div className="text-sm font-bold text-gray-800">Current</div>
                  <div className="text-xs text-gray-600">kg CO2</div>
                </div>
                
                {/* Scenario Bar */}
                <div className="flex flex-col items-center group">
                  <div className="w-16 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 relative" 
                       style={{ height: `${Math.max(60, (totalScenario / totalCurrent) * 200)}px` }}>
                    <div className="w-full h-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-2xl"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-900">
                      {totalScenario.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-800">Scenario</div>
                  <div className="text-xs text-gray-600">kg CO2</div>
                </div>
              </div>
              
              {/* Savings Indicator */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 rounded-full">
                  <span className="text-emerald-700 font-bold text-lg">
                    -{totalSavings.toFixed(1)} kg saved
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chart 2: Category-wise Savings Breakdown */}
              <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Savings by Category</h3>
                <p className="text-gray-600 text-sm">Where you're saving the most</p>
              </div>
              
              {/* Horizontal Bar Chart */}
              <div className="space-y-4">
                {scenarioValues.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{category.icon}</span>
                        <span className="text-sm font-semibold text-gray-800">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{category.savings.toFixed(1)} kg</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(category.savings / Math.max(...scenarioValues.map(c => c.savings))) * 100}%` }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                      />
                </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0 kg</span>
                      <span className="font-semibold">{category.savings.toFixed(1)} kg saved</span>
                  </div>
              </motion.div>
                ))}
            </div>
            
              {/* Total Savings Summary */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-teal-500/20 rounded-full">
                  <span className="text-teal-700 font-bold text-lg">
                    Total: {totalSavings.toFixed(1)} kg saved
                  </span>
              </div>
              </div>
            </div>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">💡 Smart Tips</h3>
                <p className="text-gray-600 text-sm">Actionable advice to reduce your footprint</p>
            </div>
            
              {/* Tips Grid */}
              <div className="space-y-4">
                {/* Energy Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ⚡
              </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Energy Efficiency</h4>
                      <p className="text-xs text-gray-600">Use LED bulbs, unplug devices, and set thermostat to 24°C</p>
                    </div>
                  </div>
                </motion.div>

                {/* Transport Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      🚗
              </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Transportation</h4>
                      <p className="text-xs text-gray-600">Walk, cycle, or use public transport for short trips</p>
                    </div>
                  </div>
                </motion.div>

                {/* Food Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      🥗
              </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Food Choices</h4>
                      <p className="text-xs text-gray-600">Reduce meat consumption and choose local produce</p>
            </div>
                  </div>
                </motion.div>

                {/* Waste Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ♻️
                    </div>
                <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Waste Reduction</h4>
                      <p className="text-xs text-gray-600">Compost organic waste and recycle properly</p>
                    </div>
                  </div>
                </motion.div>

                {/* Water Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      💧
                </div>
                <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Water Conservation</h4>
                      <p className="text-xs text-gray-600">Fix leaks, use low-flow fixtures, and collect rainwater</p>
                    </div>
                  </div>
                </motion.div>

                {/* Lifestyle Tips */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      🌱
                </div>
                <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Lifestyle</h4>
                      <p className="text-xs text-gray-600">Buy second-hand, repair instead of replace</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Call to Action */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 rounded-full">
                  <span className="text-purple-700 font-bold text-sm">
                    Start with one tip today! 🌟
                  </span>
                </div>
              </div>
            </div>
        </motion.div>
        </div>
    </div>
  );
  };

  const renderPeerComparison = () => (
    <div className="relative z-10 w-full">
      {/* Enhanced Peer Comparison Chart with Full Layout */}
      <PeerComparisonChart 
        userEmissions={userPrediction?.carbonFootprint || 0}
        city={userPrediction?.city || 'Mumbai'}
        area={userPrediction?.area || 'Bandra Kurla Complex'}
      />
    </div>
  );

  const renderAreaAnalysis = () => {
    // Get realistic data using emission factors and base multipliers
    const city = userPrediction?.city || 'Mumbai';
    const area = userPrediction?.area || 'Borivali';
    
    // Calculate emissions using emission factors × base multipliers
    const co2_breakdown = calculateAreaEmissions(city, area);
    
    // Calculate top contributors using the same data as the bar graph
    const totalEmissions = Object.values(co2_breakdown).reduce((sum, val) => sum + val, 0);
    const topContributors = Object.entries(co2_breakdown)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        factor: name,
        impact: totalEmissions > 0 ? (value / totalEmissions) * 100 : 0,
        value: value, // Include the actual kg value
        color: getContributorColor(name),
        icon: getContributorIcon(name)
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3); // Top 3 contributors

    // Calculate area features based on bar graph data
    const areaFeatures = calculateAreaFeatures(co2_breakdown, totalEmissions);
    
    const areaData = {
      city,
      area,
      co2_breakdown: co2_breakdown as {
        Residential: number;
        Corporate: number;
        Industrial: number;
        Vehicular: number;
        Construction: number;
        Airport: number;
      }
    };

    return (
    <div className="space-y-6">
      {/* Area Analysis Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Area Analysis</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Detailed breakdown of CO2 emissions by area type and characteristics
        </p>
      </motion.div>

        {/* Area Analysis Chart */}
      <div className="relative z-10 w-full h-96">
        <AreaAnalysisChart data={areaData} />
      </div>

        {/* Enhanced Area Characteristics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
          className="relative overflow-hidden"
        >
          {/* Enhanced Dynamic Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-blue-400/25 to-cyan-400/25 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-green-400/25 to-emerald-400/25 rounded-full blur-xl animate-pulse delay-1500"></div>
            <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 rounded-full blur-lg animate-pulse delay-2500"></div>
            </div>

          {/* Main Container */}
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Area Characteristics
                </h3>
                <p className="text-gray-600 text-lg">Detailed insights about {area} area</p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Contributors */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  
                  <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">Top Contributors</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {topContributors.map((contributor, index) => (
                        <motion.div
                          key={contributor.factor}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="relative group/item"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{contributor.icon}</span>
                              <span className="font-semibold text-gray-800">{contributor.factor}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3 shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${contributor.impact}%` }}
                                  transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                  className={`h-3 rounded-full bg-gradient-to-r ${contributor.color} shadow-lg`}
                      />
                    </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">
                                  {contributor.impact.toFixed(1)}%
                  </div>
                                <div className="text-sm text-gray-600">
                                  {contributor.value.toFixed(1)} kg
                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
              ))}
            </div>
        </div>
      </motion.div>

                {/* Area Features */}
      <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  {/* Card Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  
                  <div className="relative bg-white/30 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                </div>
                      <h4 className="text-xl font-bold text-gray-800">Area Features</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {areaFeatures.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="relative group/item"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 rounded-xl hover:bg-white/20 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{item.icon}</span>
                              <span className="font-semibold text-gray-800">{item.feature}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-3 shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.percentage}%` }}
                                  transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                  className={`h-3 rounded-full bg-gradient-to-r ${item.color} shadow-lg`}
                      />
                    </div>
                              <span className="text-lg font-bold text-gray-800 w-12 text-right">
                                {item.percentage}%
                    </span>
                  </div>
                </div>
                        </motion.div>
              ))}
            </div>
          </div>
                </motion.div>
                </div>

              {/* Additional Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/20 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
            </div>
                    <h4 className="text-xl font-bold text-gray-800">Area Insights</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/20 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600 mb-1">High</div>
                      <div className="text-sm text-gray-600">Emission Density</div>
                    </div>
                    <div className="text-center p-4 bg-white/20 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 mb-1">Urban</div>
                      <div className="text-sm text-gray-600">Area Type</div>
                    </div>
                    <div className="text-center p-4 bg-white/20 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 mb-1">Active</div>
                      <div className="text-sm text-gray-600">Development</div>
                    </div>
                  </div>
                </div>
              </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
  };

  const renderHistory = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };


    const getConfidenceBadge = (confidence: number) => {
      if (confidence >= 80) return 'bg-green-100 text-green-800';
      if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    };

    return (
    <div className="space-y-6">
      {/* History Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Submission History</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track your carbon footprint journey over time
        </p>
      </motion.div>

        {/* Refresh Button (LocalStorage only) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadHistoryData}
            disabled={historyLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
            <span>{historyLoading ? 'Loading...' : 'Refresh'}</span>
          </motion.button>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-green-200 shadow-xl"
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm"></div>
          
          <div className="relative overflow-x-auto">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <span className="text-gray-600 font-medium">Loading history data...</span>
                </div>
              </div>
            ) : historyData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Data</h3>
                  <p className="text-gray-500">No submissions found for your area yet.</p>
                </div>
              </div>
            ) : (
          <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
              <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Area
                </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date & Time
                </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Current CO₂*
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Predicted CO₂
                </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Model Used
                </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Confidence
                </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                </th>
              </tr>
            </thead>
                <tbody className="divide-y divide-green-200">
                  {historyData.map((entry, index) => (
                    <motion.tr
                      key={entry.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-green-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.area || '-'}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatDate(entry.created_at)}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {typeof entry.current_co2 === 'number'
                          ? `${entry.current_co2.toFixed(1)} kg`
                          : (entry.actual_co2 ? `${entry.actual_co2.toFixed(1)} kg`
                          : (entry.predicted_co2 ? `${entry.predicted_co2.toFixed(1)} kg` : 'N/A'))}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                        {entry.predicted_co2 ? `${entry.predicted_co2.toFixed(1)} kg` : 'N/A'}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {entry.model || 'XGBoost'}
                        </span>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadge(entry.confidence || 85)}`}>
                          {entry.confidence ? `${entry.confidence.toFixed(1)}%` : '85.0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </motion.tr>
              ))}
            </tbody>
          </table>
            )}
        </div>
      </motion.div>

        {/* Table Note */}
        {historyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500">
              * Current CO₂ shows predicted values for recent submissions (actual values available after verification)
            </p>
          </motion.div>
        )}

        {/* Summary Stats */}
        {historyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="text-2xl font-bold text-gray-800">{historyData.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="text-2xl font-bold text-green-600">
                {historyData.length > 0 ? (historyData.reduce((sum, entry) => sum + (entry.confidence || 85), 0) / historyData.length).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
              <div className="text-2xl font-bold text-blue-600">
                {historyData.length > 0 ? new Date(Math.max(...historyData.map(entry => new Date(entry.created_at).getTime()))).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Latest Submission</div>
            </div>
          </motion.div>
        )}
    </div>
  );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure your dashboard preferences and data sources
        </p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-refresh data</h4>
              <p className="text-sm text-gray-500">Automatically update dashboard data every 5 minutes</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-green-600 rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show smart recommendations</h4>
              <p className="text-sm text-gray-500">Display personalized smart suggestions</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-green-600 rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email notifications</h4>
              <p className="text-sm text-gray-500">Receive updates about your carbon footprint</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to calculate total CO2 from breakdown
  const getCalculatedTotal = useCallback(() => {
    if (!userPrediction) return 0;
    
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
    if (!surveyData) return userPrediction.carbonFootprint;

    // Calculate individual CO2 contributions (same as pie chart)
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
      { value: calculateCO2('transportation', surveyData.transportation || 0) },
      { value: calculateCO2('electricity', surveyData.electricity || 0) },
      { value: calculateCO2('lpgUsage', surveyData.lpgUsage || 0) },
      { value: calculateCO2('airTravel', surveyData.airTravel || 0) },
      { value: calculateCO2('meatMeals', surveyData.meatMeals || 0) },
      { value: calculateCO2('diningOut', surveyData.diningOut || 0) },
      { value: calculateCO2('waste', surveyData.waste || 0) },
      { value: Math.round((surveyData.meatMeals || 0) * 0.5 + (surveyData.diningOut || 0) * 0.8) },
      { value: Math.round((surveyData.heatingSource === 'Electricity' ? 0.2 : 0.1) * (surveyData.electricity || 0) * 0.45) },
      { value: Math.round((surveyData.diet === 'Vegan' ? 0.3 : surveyData.diet === 'Vegetarian' ? 0.6 : 1) * (surveyData.meatMeals || 0) * 0.5) },
      { value: Math.round((surveyData.socialActivity === 'High' ? 15 : surveyData.socialActivity === 'Medium' ? 8 : 3)) },
      { value: Math.round((surveyData.cookingEnergy === 'LPG' ? 0.3 : 0.1) * (surveyData.lpgUsage || 0) * 3) },
      { value: Math.round((surveyData.recycling === 'Always' ? -5 : surveyData.recycling === 'Sometimes' ? -2 : 0)) }
    ];

    const filteredBreakdown = breakdown.filter(item => item.value > 0);
    return filteredBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [userPrediction]);

  // New render functions for chart pages
  const renderPieChart = useMemo(() => {
    // Get breakdown data for detailed analysis
    const getBreakdownData = () => {
      if (!userPrediction) return [];
      
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
      const totalCO2 = userPrediction?.carbonFootprint || 0;

      if (surveyData) {
        // Use the same calculation method as the survey for consistency
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

        const filteredBreakdown = breakdown.filter(item => item.value > 0);
        
        // Return exact calculated values without scaling
        return filteredBreakdown.map(item => ({
          ...item,
          value: Math.round(item.value * 100) / 100
        }));
      }

      // Fallback data - use same calculation method as survey
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

      // Use default survey values for fallback
      const defaultValues = {
        transportation: 30,
        airTravel: 1,
        meatMeals: 10,
        diningOut: 3,
        electricity: 150,
        lpgUsage: 5,
        waste: 15
      };

      return [
        { name: 'Transportation', value: Math.round(calculateCO2('transportation', defaultValues.transportation)), color: '#20B2AA', icon: '🚗' },
        { name: 'Electricity', value: Math.round(calculateCO2('electricity', defaultValues.electricity)), color: '#0000FF', icon: '⚡' },
        { name: 'LPG/Gas', value: Math.round(calculateCO2('lpgUsage', defaultValues.lpgUsage)), color: '#8A2BE2', icon: '🔥' },
        { name: 'Air Travel', value: Math.round(calculateCO2('airTravel', defaultValues.airTravel)), color: '#FF4500', icon: '✈️' },
        { name: 'Meat Consumption', value: Math.round(calculateCO2('meatMeals', defaultValues.meatMeals)), color: '#FF0000', icon: '🥩' },
        { name: 'Dining Out', value: Math.round(calculateCO2('diningOut', defaultValues.diningOut)), color: '#00BFFF', icon: '🍽️' },
        { name: 'Waste', value: Math.round(calculateCO2('waste', defaultValues.waste)), color: '#FF8C00', icon: '🗑️' }
      ];
    };

    const breakdownData = getBreakdownData();
    const sortedData = [...breakdownData].sort((a, b) => b.value - a.value);
    const totalCalculatedCO2 = breakdownData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-6 space-y-8 relative overflow-hidden">
        {/* Enhanced Dark Green Background Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-400/15 to-emerald-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Additional Atmospheric Effects */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-300/10 to-emerald-300/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-teal-300/15 to-green-300/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }}></div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
        >
          {/* Total CO2 Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 relative overflow-hidden group"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-3xl group-hover:from-green-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 group-hover:shadow-2xl transition-all duration-300"
                >
                  <span className="text-white text-2xl">🌱</span>
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">Total CO₂</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Current emissions</p>
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors"
              >
                {userPrediction?.carbonFootprint?.toFixed(1) || '0.0'}
              </motion.div>
              <p className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors">kg CO₂/month</p>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-green-600 font-semibold group-hover:text-green-700 transition-colors">-5.2% vs last month</span>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          {/* Top Contributor Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 relative overflow-hidden group"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 group-hover:shadow-2xl transition-all duration-300"
                >
                  <span className="text-white text-2xl">🏆</span>
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">Top Contributor</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Highest emission source</p>
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors"
              >
                {sortedData[0]?.name || 'N/A'}
              </motion.div>
              <p className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors">{sortedData[0]?.value.toFixed(1) || 0} kg CO₂</p>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                  {((sortedData[0]?.value / totalCalculatedCO2) * 100).toFixed(1)}% of total
                </span>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          {/* Categories Count Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 relative overflow-hidden group"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 group-hover:shadow-2xl transition-all duration-300"
                >
                  <span className="text-white text-2xl">📊</span>
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">Categories</h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Emission sources</p>
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors"
              >
                {sortedData.length}
              </motion.div>
              <p className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors">Active sources</p>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">Comprehensive analysis</span>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Pie Chart with Interactive Animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 relative overflow-hidden group"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Floating Particles Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
          
          {/* Enhanced Header */}
          <div className="relative z-10 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xl">📊</span>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">CO₂ Breakdown Analysis</h3>
                  <p className="text-gray-600">Interactive emission source visualization</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                Live Data
              </motion.div>
            </motion.div>
          </div>
          
          <div className="relative z-10">
            <div className="w-full h-96">
              <CO2BreakdownPieChart />
            </div>
          </div>
        </motion.div>

        {/* Animated Progress Bars for All Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-br from-emerald-100/80 via-teal-100/80 to-green-100/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-emerald-200/60 relative overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-4xl mr-4"
                >
                  📈
                </motion.span>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">Detailed Breakdown</h3>
                  <p className="text-gray-600">Animated progress visualization for all emission sources</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50"
              >
                <span className="text-sm font-semibold text-gray-700">Interactive Bars</span>
              </motion.div>
            </div>
            
            {/* Animated Progress Bars */}
            <div className="space-y-6">
              {sortedData.map((item, index) => {
                const percentage = ((item.value / totalCalculatedCO2) * 100);
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.icon}
                        </motion.div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.value.toFixed(1)} kg CO₂</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                          className="text-2xl font-bold text-gray-800"
                        >
                          {percentage.toFixed(1)}%
                        </motion.span>
                      </div>
                    </div>
                    
                    {/* Animated Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, delay: 1.5 + index * 0.2, ease: "easeOut" }}
                          className="h-full rounded-full relative overflow-hidden"
                          style={{ backgroundColor: item.color }}
                        >
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 2 + index * 0.2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      
                      {/* Animated Dots */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
                        className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2"
                        style={{ 
                          left: `${Math.min(percentage, 95)}%`,
                          borderColor: item.color,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Top 3 Contributors with Staggered Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-br from-emerald-100/80 via-teal-100/80 to-green-100/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-emerald-200/60"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-4xl mr-4"
              >
                🏆
              </motion.span>
              <div>
                <h3 className="text-3xl font-bold text-gray-800">Top 3 Contributors</h3>
                <p className="text-gray-600">Your highest emission sources</p>
    </div>
    </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50"
            >
              <span className="text-sm font-semibold text-gray-700">Ranked by Impact</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedData.slice(0, 3).map((item, index) => {
              const percentage = ((item.value / totalCalculatedCO2) * 100).toFixed(1);
              const rank = index + 1;
              const rankColors = ['bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800', 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800', 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800'];
              const rankIcons = ['🥇', '🥈', '🥉'];
              const borderColors = ['border-yellow-400', 'border-gray-400', 'border-orange-400'];
              const cardGradients = ['from-yellow-50 to-yellow-100', 'from-gray-50 to-gray-100', 'from-orange-50 to-orange-100'];
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className={`relative bg-gradient-to-br ${cardGradients[index]} rounded-3xl p-6 border-2 ${borderColors[index]} shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        className="text-4xl"
                      >
                        {rankIcons[index]}
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`text-sm font-bold px-4 py-2 rounded-full shadow-sm ${rankColors[index]}`}
                      >
                        {percentage}%
                      </motion.span>
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-full shadow-md" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-bold text-gray-800 text-xl">{item.name}</div>
                        <div className="text-sm text-gray-600 font-medium">{item.value} kg CO₂</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 1.2 + index * 0.2 }}
                        className={`h-2 rounded-full ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Rank #{rank} contributor</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Complete Breakdown with Grid Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <span className="text-3xl mr-4">📊</span>
              <div>
                <h4 className="text-2xl font-bold text-gray-800">Complete Breakdown</h4>
                <p className="text-gray-600">All emission sources analyzed</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full"
            >
              <span className="text-sm font-semibold">{sortedData.length} Categories</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedData.map((item, index) => {
              const percentage = ((item.value / totalCalculatedCO2) * 100).toFixed(1);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-5 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-700 truncate group-hover:text-gray-900 transition-colors">{item.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{item.value} kg CO₂</div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full flex-shrink-0 shadow-sm group-hover:bg-gray-100 transition-colors"
                    >
                      {percentage}%
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Action Tips with Enhanced Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl mr-4"
              >
                💡
              </motion.span>
              <div>
                <h4 className="text-2xl font-bold text-gray-800">Quick Action Tips</h4>
                <p className="text-gray-600">Personalized recommendations for top contributors</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full"
            >
              <span className="text-sm font-semibold">6 Categories</span>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedData.slice(0, 6).map((item, index) => {
              const tips = {
                'Heating': ['Set AC to 26°C', 'Use fans + AC', 'Close curtains during peak heat', 'Improve home insulation'],
                'Diet': ['Reduce meat to 2-3x/week', 'Choose local foods', 'Plan meals to reduce waste', 'Try plant-based alternatives'],
                'Social': ['Choose local venues', 'Carpool to events', 'Virtual meetups when possible', 'Share resources with friends'],
                'Transportation': ['Use public transport', 'Carpool when possible', 'Walk for short distances', 'Consider electric vehicles'],
                'LPG/Gas': ['Use pressure cooker', 'Optimize cooking times', 'Maintain gas appliances', 'Consider induction cooking'],
                'Electricity': ['Use LED bulbs', 'Unplug unused devices', 'Use energy-efficient appliances', 'Switch to renewable energy'],
                'Shopping': ['Buy second-hand items', 'Choose quality over quantity', 'Support local businesses', 'Avoid fast fashion'],
                'Air Travel': ['Combine trips', 'Choose direct flights', 'Consider train for short distances', 'Offset carbon emissions'],
                'Waste': ['Compost organic waste', 'Recycle properly', 'Reduce packaging', 'Buy in bulk'],
                'Meat Consumption': ['Meatless Mondays', 'Try plant proteins', 'Reduce portion sizes', 'Choose sustainable meat'],
                'Dining Out': ['Choose local restaurants', 'Share large portions', 'Avoid food waste', 'Bring your own containers'],
                'Cooking': ['Use pressure cooker', 'Cook in batches', 'Use lids while cooking', 'Plan weekly meals'],
                'Recycling': ['Sort waste properly', 'Find recycling centers', 'Buy recyclable products', 'Reduce single-use items']
              };
              
              const categoryTips = tips[item.name as keyof typeof tips] || ['Look for energy-efficient alternatives'];
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white p-6 rounded-2xl border border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{item.name}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full group-hover:bg-green-200 transition-colors">
                      {((item.value / totalCalculatedCO2) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    {categoryTips.map((tip, tipIndex) => (
                      <motion.div
                        key={tipIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.8 + index * 0.1 + tipIndex * 0.05 }}
                        className="flex items-start space-x-3 text-sm text-gray-700 group-hover:text-gray-800 transition-colors"
                      >
                        <span className="text-green-500 mt-1 font-bold group-hover:text-green-600 transition-colors">•</span>
                        <span className="leading-relaxed">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="bg-gradient-to-br from-emerald-100/80 via-teal-100/80 to-green-100/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-emerald-200/60 relative overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mr-4"
                >
                  🔄
                </motion.span>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">Impact Comparison</h3>
                  <p className="text-gray-600">See how your choices affect your carbon footprint</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                Live Impact
              </motion.div>
            </div>
            
            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Scenario */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg"
                    >
                      📊
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-800">Current Impact</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total CO₂</span>
                      <span className="text-2xl font-bold text-blue-600">{totalCalculatedCO2.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Categories</span>
                      <span className="text-lg font-semibold text-gray-800">{sortedData.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Top Source</span>
                      <span className="text-lg font-semibold text-gray-800">{sortedData[0]?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Optimized Scenario */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg"
                    >
                      🌱
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-800">Optimized Impact</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reduced CO₂</span>
                      <span className="text-2xl font-bold text-green-600">{(totalCalculatedCO2 * 0.7).toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Savings</span>
                      <span className="text-lg font-semibold text-green-600">-30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Potential</span>
                      <span className="text-lg font-semibold text-gray-800">High Impact</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className="mt-8 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Optimization Tips
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }, [userPrediction]);

  const renderSeasonal = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
          Seasonal Analysis
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600 text-xl font-medium"
          >
            Discover how weather patterns influence your carbon footprint throughout the year
          </motion.p>
        </div>

        {/* Enhanced Seasonal Chart Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group hover:shadow-3xl transition-all duration-500"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl group-hover:from-emerald-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
          
          {/* Floating Weather Icons */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {['❄️', '🌸', '☀️', '🌧️', '🍂'].map((icon, i) => (
              <motion.div
                key={icon}
                className="absolute text-4xl opacity-20"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 360, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                }}
              >
                {icon}
              </motion.div>
            ))}
          </div>

          <div className="relative z-10">
            <div className="h-[500px] group-hover:scale-[1.02] transition-transform duration-500">
          <SeasonalAnalysis />
        </div>
      </div>
        </motion.div>

        {/* Seasonal Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Winter Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">❄️</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Winter</h3>
                  <p className="text-sm text-gray-600">Dec - Feb</p>
    </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">245 kg</div>
                <p className="text-gray-600 font-medium">Avg CO₂</p>
                <p className="text-sm text-gray-500">Heating & Indoor Activities</p>
              </div>
            </div>
          </motion.div>

          {/* Spring Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">🌸</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">Spring</h3>
                  <p className="text-sm text-gray-600">Mar - Apr</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">235 kg</div>
                <p className="text-gray-600 font-medium">Avg CO₂</p>
                <p className="text-sm text-gray-500">Natural Ventilation</p>
              </div>
            </div>
          </motion.div>

          {/* Summer Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">☀️</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">Summer</h3>
                  <p className="text-sm text-gray-600">May - Jun</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">235 kg</div>
                <p className="text-gray-600 font-medium">Avg CO₂</p>
                <p className="text-sm text-gray-500">Cooling & Outdoor</p>
              </div>
            </div>
          </motion.div>

          {/* Monsoon Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">🌧️</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">Monsoon</h3>
                  <p className="text-sm text-gray-600">Jul - Aug</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">240 kg</div>
                <p className="text-gray-600 font-medium">Avg CO₂</p>
                <p className="text-sm text-gray-500">Humidity Control</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Seasonal Impact Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Seasonal Impact Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Key Insights</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">Summer shows lowest emissions</p>
                      <p className="text-sm text-gray-600">Natural ventilation reduces energy consumption</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">Winter requires most energy</p>
                      <p className="text-sm text-gray-600">Heating systems increase carbon footprint</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-800">Monsoon affects efficiency</p>
                      <p className="text-sm text-gray-600">Humidity control systems consume more energy</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Recommendations</h4>
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                    <p className="font-medium text-emerald-800">Optimize for Summer</p>
                    <p className="text-sm text-emerald-600">Use natural ventilation and outdoor activities</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="font-medium text-blue-800">Winter Efficiency</p>
                    <p className="text-sm text-blue-600">Insulate properly and use energy-efficient heating</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="font-medium text-purple-800">Monsoon Management</p>
                    <p className="text-sm text-purple-600">Use dehumidifiers and maintain HVAC systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  ), []);

  const renderForecast = useMemo(() => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
          12-Month CO₂ Forecast
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600 text-xl font-medium"
          >
            Interactive timeline with seasonal analysis and trend insights
          </motion.p>
        </div>

        {/* Enhanced Forecast Chart Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden group hover:shadow-3xl transition-all duration-500"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
          
          {/* Floating Particles Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="h-[500px] group-hover:scale-[1.02] transition-transform duration-500">
          <CO2TrendChart 
            data={userPrediction ? [{
              month: 'Current',
              current: userPrediction.carbonFootprint,
              predicted: userPrediction.predictedCO2 || 0
            }] : undefined}
          />
        </div>
      </div>
        </motion.div>

        {/* Enhanced Forecast Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Current Status Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">📊</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors duration-300">Current Status</h3>
                  <p className="text-sm text-gray-600">Your emissions today</p>
    </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300"
              >
                {userPrediction?.carbonFootprint?.toFixed(1) || '0.0'} kg
              </motion.div>
              <p className="text-gray-600 font-medium">CO₂ this month</p>
            </div>
          </motion.div>

          {/* Next Month Prediction Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">🔮</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">Next Month</h3>
                  <p className="text-sm text-gray-600">AI prediction</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300"
              >
                {userPrediction?.predictedCO2?.toFixed(1) || '0.0'} kg
              </motion.div>
              <p className="text-gray-600 font-medium">Expected CO₂</p>
            </div>
          </motion.div>

          {/* Seasonal Impact Card */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 group cursor-pointer relative overflow-hidden"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-2xl">🌡️</span>
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">Seasonal Impact</h3>
                  <p className="text-sm text-gray-600">Weather influence</p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="text-4xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300"
              >
                ±15%
              </motion.div>
              <p className="text-gray-600 font-medium">Seasonal variation</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Forecast Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Current emissions are tracked in real-time</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Predictions use advanced ML algorithms</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Seasonal patterns influence predictions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Interactive tooltips provide detailed insights</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  ), []);

  const renderContent = () => {
    switch (activeSection) {
      case 'insights':
        return renderInsights();
      case 'pie-chart':
        return renderPieChart;
      case 'seasonal':
        return renderSeasonal;
      case 'forecast':
        return renderForecast;
      case 'recommendations':
        return renderRecommendations();
      case 'peer-comparison':
        return renderPeerComparison();
      case 'area-analysis':
        return renderAreaAnalysis();
      case 'maps':
        return <Maps />;
      case 'summary-report':
        return <SummaryReport />;
      case 'history':
        return renderHistory();
      case 'settings':
        return renderSettings();
      default:
        return renderInsights();
    }
  };

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.7);
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
        .custom-scrollbar:hover {
          scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
        }
      `}</style>
      
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 relative overflow-hidden">
      {/* Optimized Eco-Themed Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced Green Floating Elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`element-${i}`}
            className="absolute text-green-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${18 + Math.random() * 16}px`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.1, 0.6, 0.1],
              rotate: [0, Math.random() * 360, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut",
            }}
          >
            {['🍃', '🌿', '🌱', '🌾', '🌿', '🍀', '🌿', '🌱'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
        
        {/* Enhanced Green Gradient Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-40 h-40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%)`,
            }}
            animate={{
              scale: [0.8, 1.4, 0.8],
              opacity: [0.1, 0.4, 0.1],
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Additional Green Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 bg-green-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 60 - 30, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="flex relative z-10">
        {/* Enhanced Sidebar with Advanced Glassmorphism */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: sidebarOpen ? 0 : -300,
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            mass: 0.8
          }}
          className="fixed inset-y-0 left-0 z-50 w-80 overflow-hidden"
        >
          {/* Dynamic Background Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-green-400/40 to-emerald-400/40 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-teal-400/35 to-cyan-400/35 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-blue-400/25 to-purple-400/25 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-xl animate-pulse delay-1500"></div>
          </div>

          {/* Main Sidebar Container */}
          <div className="relative h-full bg-white/25 backdrop-blur-2xl border-r border-white/40 shadow-2xl">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/10 pointer-events-none"></div>
            
            <div className="relative p-6 h-full flex flex-col">
            {/* Unique Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8"
            >
              {/* Header Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-3xl blur-2xl"></div>
              
              {/* Main Header Container */}
                <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-2xl">
                  {/* Dashboard Title */}
                 <div className="text-center mb-4 pt-4 flex items-center justify-center space-x-3">
                   <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-md shadow" />
              <motion.h1 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-black drop-shadow-2xl"
                      style={{
                        background: 'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #f59e0b)',
                        backgroundSize: '300% 300%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradientShift 3s ease-in-out infinite'
                      }}
              >
                Carbon Dashboard
              </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto mt-2"
                  ></motion.div>
                </div>
                
                {/* Close Button */}
              <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                onClick={() => setSidebarOpen(false)}
                  className="absolute top-3 right-3 p-3 rounded-2xl bg-white/40 backdrop-blur-xl border-2 border-white/60 hover:bg-white/50 hover:border-white/70 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                  <ChevronRight className="w-6 h-6 text-gray-800 font-bold" />
              </motion.button>
            </div>
            </motion.div>

              {/* Unique Navigation Items */}
              <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {navigationItems.map((item, index) => (
                  <motion.div
                  key={item.id}
                    initial={{ opacity: 0, x: -40, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                    className="relative group"
                  >
                    {/* Unique Background Glow Effect */}
                    <div className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
                      activeSection === item.id 
                        ? 'bg-gradient-to-r from-green-500/60 to-emerald-500/60 blur-xl scale-110'
                        : 'bg-gradient-to-r from-gray-400/15 to-gray-500/15 blur-sm group-hover:blur-lg group-hover:scale-105'
                    }`}></div>
                    
                    {/* Main Navigation Card */}
                    <motion.button
                  whileHover={{ 
                        scale: 1.03, 
                        x: 12,
                        transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ 
                        scale: 0.97,
                    transition: { duration: 0.1 }
                  }}
                  onClick={() => setActiveSection(item.id as DashboardSection)}
                      className={`relative w-full rounded-3xl transition-all duration-500 border-2 ${
                    activeSection === item.id
                          ? 'bg-white/40 backdrop-blur-2xl border-white/60 text-white shadow-2xl'
                          : 'bg-white/20 backdrop-blur-xl border-white/30 text-gray-800 hover:bg-white/30 hover:border-white/50 hover:shadow-xl'
                      }`}
                    >
                      {/* Card Content */}
                      <div className="flex items-center p-5">
                        {/* Icon Container with Enhanced Styling */}
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className={`p-4 rounded-2xl transition-all duration-500 ${
                    activeSection === item.id 
                              ? 'bg-white/50 shadow-xl' 
                              : 'bg-white/40 group-hover:bg-white/50 group-hover:shadow-lg'
                          }`}
                        >
                          <item.icon className={`w-6 h-6 transition-colors duration-500 ${
                      activeSection === item.id 
                        ? 'text-white' 
                              : 'text-gray-700 group-hover:text-gray-900'
                    }`} />
                        </motion.div>
                        
                        {/* Label with Animated Reactive Text */}
                        <div className="flex-1 ml-4 text-left min-w-0">
                          <motion.span 
                            className={`font-bold text-lg transition-all duration-500 whitespace-nowrap ${
                              activeSection === item.id 
                                ? 'text-white drop-shadow-lg' 
                                : 'text-gray-800 group-hover:text-gray-900'
                            }`}
                            style={activeSection === item.id ? {
                              background: 'linear-gradient(45deg, #ffffff, #f0f9ff, #ffffff)',
                              backgroundSize: '200% 200%',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              animation: 'textShimmer 2s ease-in-out infinite'
                            } : {}}
                            whileHover={{ 
                              scale: 1.05,
                              transition: { duration: 0.2 }
                            }}
                          >
                            {item.label}
                          </motion.span>
                  </div>
                        
                        {/* Enhanced Active Indicator */}
                  {activeSection === item.id && (
                    <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -180 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 20,
                              delay: 0.2 
                            }}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                            <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Unique Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.button>
                  </motion.div>
              ))}
              
              {/* Unique Quick Actions Section */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-8 mt-6"
              >
                {/* Separator with Glass Effect */}
                <div className="relative mb-8 flex justify-center">
                  <div className="relative bg-gradient-to-br from-white/15 to-transparent backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
                    <motion.span 
                      className="text-sm font-bold"
                      style={{
                        background: 'linear-gradient(45deg, #374151, #6b7280, #374151)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'textShimmer 3s ease-in-out infinite'
                      }}
                    >
                      Quick Actions
                    </motion.span>
                  </div>
                </div>

                {/* Back to Survey Button */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 8 }}
                  className="relative group w-full mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/survey')}
                    className="relative w-full rounded-3xl bg-white/30 backdrop-blur-2xl border-2 border-white/50 hover:bg-white/40 hover:border-white/60 transition-all duration-500 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center p-5">
                      <motion.div
                        whileHover={{ rotate: -5, scale: 1.1 }}
                        className="p-4 bg-white/40 rounded-2xl group-hover:bg-white/50 transition-all duration-500 shadow-lg"
                      >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                      </motion.div>
                      <div className="flex-1 ml-4 text-left">
                        <motion.span 
                          className="font-bold text-lg"
                          style={{
                            background: 'linear-gradient(45deg, #1f2937, #374151, #1f2937)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'textShimmer 2.5s ease-in-out infinite'
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                        >
                          Back to Survey
                        </motion.span>
                  </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.button>
                </motion.div>

                {/* Refresh Data Button */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 8 }}
                  className="relative group w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/50 to-green-500/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                    className="relative w-full rounded-3xl bg-white/30 backdrop-blur-2xl border-2 border-white/50 hover:bg-white/40 hover:border-white/60 transition-all duration-500 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center p-5">
                      <motion.div
                        whileHover={{ rotate: 180, scale: 1.1 }}
                        className="p-4 bg-white/40 rounded-2xl group-hover:bg-white/50 transition-all duration-500 shadow-lg"
                      >
                        <RefreshCw className="w-6 h-6 text-gray-700" />
                      </motion.div>
                      <div className="flex-1 ml-4 text-left">
                        <motion.span 
                          className="font-bold text-lg"
                          style={{
                            background: 'linear-gradient(45deg, #1f2937, #374151, #1f2937)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'textShimmer 2.5s ease-in-out infinite'
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                        >
                          Refresh Data
                        </motion.span>
                  </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.button>
                </motion.div>
              </motion.div>
            </nav>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="p-6 bg-gradient-to-br from-pink-50/30 via-purple-50/20 to-cyan-50/30">
            {/* Ultra-Enhanced Header with Advanced Animations */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-8"
            >
              {/* Dynamic Background Orbs with Vibrant Colors */}
              <div className="absolute inset-0 -z-10">
                <motion.div 
                  animate={{ 
                    x: [0, 20, 0], 
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-12 -left-12 w-72 h-72 bg-gradient-to-tr from-pink-400/40 via-purple-400/30 to-indigo-400/35 rounded-full blur-3xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    x: [0, -15, 0], 
                    y: [0, 15, 0],
                    scale: [1, 0.9, 1]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute -bottom-16 right-0 w-80 h-80 bg-gradient-to-tl from-orange-400/35 via-red-400/30 to-pink-400/40 rounded-full blur-3xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    x: [0, 10, 0], 
                    y: [0, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 4
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/30 to-blue-400/35 rounded-full blur-2xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    x: [0, -20, 0], 
                    y: [0, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-yellow-400/40 via-orange-400/30 to-red-400/35 rounded-full blur-2xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    x: [0, 15, 0], 
                    y: [0, -8, 0],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 9, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 3
                  }}
                  className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-tl from-green-400/35 via-emerald-400/30 to-teal-400/40 rounded-full blur-2xl"
                ></motion.div>
              </div>

              {/* Main Header Container */}
              <div className="relative bg-white/60 backdrop-blur-3xl p-8 rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
                {/* Animated Border Glow with Vibrant Colors */}
                <motion.div
                  animate={{ 
                    background: [
                      "linear-gradient(45deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #06b6d4)",
                      "linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4, #10b981, #f59e0b)",
                      "linear-gradient(45deg, #06b6d4, #10b981, #f59e0b, #ef4444, #ec4899)",
                      "linear-gradient(45deg, #ef4444, #ec4899, #8b5cf6, #06b6d4, #10b981)",
                      "linear-gradient(45deg, #10b981, #f59e0b, #ef4444, #ec4899, #8b5cf6)",
                      "linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444)"
                    ]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-3xl p-[3px]"
                >
                  <div className="w-full h-full bg-white/70 backdrop-blur-3xl rounded-3xl"></div>
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Top Row */}
                  <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
                    {/* Back Button with Enhanced Animation */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.05, 
                        y: -3,
                        boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/survey')}
                      className="group relative flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="relative z-10"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </motion.div>
                      <span className="relative z-10 font-bold text-lg">Back to Survey</span>
                      <motion.div
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                        transition={{ duration: 0.3 }}
                      ></motion.div>
                    </motion.button>

                    {/* Animated Title Section */}
                    <div className="flex-1 min-w-[300px] text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                      >
                      <motion.h1 
                          animate={{ 
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                          }}
                          className="text-5xl font-black tracking-tight bg-gradient-to-r from-purple-800 via-pink-600 to-indigo-800 bg-[length:200%_100%] bg-clip-text text-transparent"
                        >
                          {navigationItems.find(item => item.id === activeSection)?.label || 'Insights'}
                      </motion.h1>
                        
                        {/* Animated Underline */}
                        <motion.div 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "100%", opacity: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-2 mt-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: 1
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          ></motion.div>
                        </motion.div>

                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [0, -20, 0],
                              x: [0, Math.random() * 20 - 10, 0],
                              opacity: [0, 1, 0]
                            }}
                            transition={{
                              duration: 3 + i * 0.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                              ease: "easeInOut"
                            }}
                            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: "50%"
                            }}
                          ></motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Enhanced Refresh Button */}
                  <motion.div 
                      initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center space-x-4"
                  >
                    <motion.button
                        whileHover={{ 
                          scale: 1.08, 
                          rotate: 5,
                          boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)"
                        }}
                        whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        refreshUserPrediction();
                        loadSubmissionStats();
                        }}
                        className="group relative px-6 py-4 border-2 border-orange-400/70 rounded-2xl bg-white/50 text-orange-700 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "linear",
                            delay: 0.5
                          }}
                          className="inline-block mr-3"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                        <span className="relative z-10">Refresh Data</span>
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-2xl"
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                    </motion.button>

                    {!sidebarOpen && (
                      <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => setSidebarOpen(true)}
                          className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                          <Menu className="w-6 h-6" />
                      </motion.button>
                    )}
                  </motion.div>
                </div>

                  {/* Enhanced Segmented Location Blocks */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                  >
                    {[
                      { label: "City", value: userPrediction?.city || 'Mumbai', icon: "🏙️", color: "from-blue-500 to-indigo-600" },
                      { label: "Area", value: userPrediction?.area || 'Borivali', icon: "📍", color: "from-pink-500 to-rose-600" },
                      { label: "Section", value: navigationItems.find(item => item.id === activeSection)?.label || 'Insights', icon: "📊", color: "from-orange-500 to-yellow-500" }
                    ].map((block, index) => (
                      <motion.div
                        key={block.label}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -5,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                        }}
                        className="group relative rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Animated Background Gradient */}
                        <motion.div
                          animate={{ 
                            background: [
                              `linear-gradient(135deg, ${block.color.split(' ')[1]}, ${block.color.split(' ')[3]})`,
                              `linear-gradient(135deg, ${block.color.split(' ')[3]}, ${block.color.split(' ')[1]})`,
                              `linear-gradient(135deg, ${block.color.split(' ')[1]}, ${block.color.split(' ')[3]})`
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                        ></motion.div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{block.label}</span>
                            <motion.span
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                              className="text-2xl"
                            >
                              {block.icon}
                            </motion.span>
              </div>
                          <motion.div 
                            className="text-xl font-black text-gray-900"
                            animate={{ 
                              textShadow: [
                                "0 0 0px rgba(0,0,0,0)",
                                "0 0 15px rgba(236, 72, 153, 0.4)",
                                "0 0 0px rgba(0,0,0,0)"
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          >
                            {block.value}
            </motion.div>
                        </div>

                        {/* Hover Glow Effect */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 to-transparent"
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>


            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// Helper functions for area analysis
function getContributorColor(areaType: string): string {
  const colors: { [key: string]: string } = {
    'Residential': 'from-green-500 to-emerald-500',
    'Corporate': 'from-blue-500 to-cyan-500',
    'Industrial': 'from-orange-500 to-red-500',
    'Vehicular': 'from-purple-500 to-pink-500',
    'Construction': 'from-yellow-500 to-orange-500',
    'Airport': 'from-cyan-500 to-blue-500'
  };
  return colors[areaType] || 'from-gray-500 to-gray-600';
}

function getContributorIcon(areaType: string): string {
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

function calculateAreaFeatures(co2_breakdown: { [key: string]: number }, totalEmissions: number): Array<{
  feature: string;
  percentage: number;
  color: string;
  icon: string;
}> {
  if (totalEmissions === 0) {
    return [
      { feature: 'Mixed residential and commercial', percentage: 35, color: 'from-blue-500 to-cyan-500', icon: '🏢' },
      { feature: 'High traffic area', percentage: 25, color: 'from-orange-500 to-red-500', icon: '🚦' },
      { feature: 'Green spaces available', percentage: 20, color: 'from-green-500 to-emerald-500', icon: '🌳' }
    ];
  }

  // Calculate percentages for each area type
  const residentialPct = (co2_breakdown.Residential / totalEmissions) * 100;
  const corporatePct = (co2_breakdown.Corporate / totalEmissions) * 100;
  const vehicularPct = (co2_breakdown.Vehicular / totalEmissions) * 100;
  const industrialPct = (co2_breakdown.Industrial / totalEmissions) * 100;
  const constructionPct = (co2_breakdown.Construction / totalEmissions) * 100;

  // Calculate area features based on emission patterns
  const mixedResidentialCommercial = Math.min(95, Math.max(15, (residentialPct + corporatePct) * 0.8));
  const highTrafficArea = Math.min(90, Math.max(10, vehicularPct * 1.2));
  const greenSpacesAvailable = Math.min(85, Math.max(5, 100 - (industrialPct + constructionPct) * 1.5));

  return [
    { 
      feature: 'Mixed residential and commercial', 
      percentage: Math.round(mixedResidentialCommercial), 
      color: 'from-blue-500 to-cyan-500', 
      icon: '🏢' 
    },
    { 
      feature: 'High traffic area', 
      percentage: Math.round(highTrafficArea), 
      color: 'from-orange-500 to-red-500', 
      icon: '🚦' 
    },
    { 
      feature: 'Green spaces available', 
      percentage: Math.round(greenSpacesAvailable), 
      color: 'from-green-500 to-emerald-500', 
      icon: '🌳' 
    }
  ];
}

export default Dashboard;