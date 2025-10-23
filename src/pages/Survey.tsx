import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Car, Plane, Utensils, ShoppingBag, Zap, Trash2, Recycle, Leaf, Bus, Bike, Loader2, CheckCircle, AlertCircle, Sparkles, Heart, Trophy, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../contexts/DataContext';
import { apiService, UserSubmission } from '../services/apiService';

interface SurveyData {
  // Key inputs for CO2 calculation
  transportation: number; // km/month
  airTravel: number; // hours/year
  meatMeals: number; // meals/month
  diningOut: number; // times/month
  electricity: number; // kWh/month
  lpgUsage: number; // kg/month
  waste: number; // kg/month
  
  // Dropdown selections
  diet: string;
  socialActivity: string;
  city: string;
  country: string;
  area: string;
  cookingEnergy: string;
  profession: string;
  heatingSource: string;
  recycling: string;
  cookingMethods: string[];
}

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const { loadYourData, emissionData, refreshUserPrediction } = useDataContext();
  const { scrollY } = useScroll();
  
  // Animation states
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Unique UX states
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTip, setCurrentTip] = useState<string>('');
  const [showTip, setShowTip] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(100);
  const [currentSeason, setCurrentSeason] = useState('spring');
  
  // Scroll-based animations
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);
  
  // Helper function to get consistent select styling
  const getSelectStyles = (disabled = false) => 
    `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white bg-no-repeat bg-right bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] pr-10 ${disabled ? 'disabled:bg-gray-100 disabled:cursor-not-allowed' : ''}`;
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    transportation: 30,      // 30 km/month = 6.3 kg CO₂
    airTravel: 1,           // 1 hour/year = 90 kg CO₂
    meatMeals: 10,          // 10 meals/month = 25 kg CO₂
    diningOut: 3,           // 3 times/month = 9.6 kg CO₂
    electricity: 150,       // 150 kWh/month = 67.5 kg CO₂
    lpgUsage: 5,            // 5 kg/month = 15 kg CO₂
    waste: 15,              // 15 kg/month = 7.5 kg CO₂
    diet: 'Omnivore',
    socialActivity: 'Medium',
    city: 'Mumbai',
    country: 'India',
    area: 'Bandra Kurla Complex',
    cookingEnergy: 'LPG',
    profession: 'Engineering',
    heatingSource: 'Electricity',
    recycling: 'Sometimes',
    cookingMethods: ['Stove']
  });

  // Get unique areas for each city from CSV data
  const getAreasByCity = (city: string): string[] => {
    if (!emissionData || emissionData.length === 0) {
      // Fallback to hardcoded areas if CSV data is not loaded
      const fallbackAreas = {
        'Mumbai': [
          'Andheri (Airport area)',
          'Bandra Kurla Complex',
          'Borivali',
          'Goregaon',
          'Malad West',
          'Sion',
          'Worli'
        ],
        'Navi Mumbai': [
          'CBD Belapur',
          'Ghansoli',
          'Kharghar',
          'Koparkhairane',
          'Nerul',
          'Taloja',
          'Turbhe',
          'Vashi'
        ]
      };
      return fallbackAreas[city as keyof typeof fallbackAreas] || [];
    }
    
    const areas = new Set<string>();
    emissionData.forEach(data => {
      if (data.city === city && data.area) {
        areas.add(data.area);
      }
    });
    return Array.from(areas).sort();
  };

  const mumbaiAreas = getAreasByCity('Mumbai');
  const naviMumbaiAreas = getAreasByCity('Navi Mumbai');
  
  const availableCities = ['Mumbai', 'Navi Mumbai'];
  const currentCityAreas = surveyData.city === 'Mumbai' ? mumbaiAreas : naviMumbaiAreas;

  const totalSteps = 3;

  // Unique motivational system
  const motivationalMessages = {
    transportation: [
      "🚗 Every mile you reduce saves the planet!",
      "🌱 Your transportation choices matter!",
      "💚 You're building a greener future!",
      "🌟 Small changes, big impact!"
    ],
    airTravel: [
      "✈️ Conscious travel choices make a difference!",
      "🌍 You're thinking globally, acting locally!",
      "💫 Every flight decision counts!",
      "🎯 You're on the right path!"
    ],
    meatMeals: [
      "🥗 Plant-based choices are powerful!",
      "🌿 Your diet is your climate action!",
      "💚 Every meal is a chance to heal the planet!",
      "🌟 You're nourishing both body and Earth!"
    ],
    diningOut: [
      "🍽️ Mindful dining choices matter!",
      "🌱 You're supporting sustainable practices!",
      "💫 Every meal is a vote for the future!",
      "🎯 You're making conscious decisions!"
    ]
  };

  const achievements = useMemo(() => [
    { id: 'first_step', title: '🌱 Green Beginner', description: 'Started your carbon journey!', threshold: 1 },
    { id: 'eco_warrior', title: '🛡️ Eco Warrior', description: 'Completed transportation section!', threshold: 2 },
    { id: 'climate_champion', title: '🏆 Climate Champion', description: 'Halfway through your journey!', threshold: 3 },
    { id: 'earth_guardian', title: '🌍 Earth Guardian', description: 'Almost there, planet saver!', threshold: 4 },
    { id: 'carbon_master', title: '⭐ Carbon Master', description: 'You\'re a sustainability expert!', threshold: 5 }
  ], []);

  const dynamicTips = useMemo(() => [
    "💡 Did you know? Walking 1 mile saves 0.3 kg CO₂!",
    "🌱 Fun fact: A tree absorbs 22 kg CO₂ per year!",
    "⚡ Energy tip: LED bulbs use 75% less energy!",
    "🚲 Cycling fact: 10 minutes of cycling = 0.1 kg CO₂ saved!",
    "🌍 Global impact: If everyone reduced meat by 1 meal/week, we'd save 1.5 billion tons CO₂!",
    "💧 Water wisdom: Shorter showers save both water and energy!",
    "🌿 Green hack: Houseplants improve air quality by 25%!",
    "♻️ Recycling reality: 1 aluminum can saves enough energy to power a TV for 3 hours!"
  ], []);


  // Step completion tracking with unique effects
  useEffect(() => {
    const stepFields = {
      1: ['transportation', 'airTravel', 'meatMeals', 'diningOut'],
      2: ['electricity', 'lpgUsage', 'heatingSource', 'recycling', 'cookingMethods', 'waste'],
      3: ['diet', 'socialActivity', 'city', 'country', 'area', 'cookingEnergy', 'profession']
    };

    const currentStepFields = stepFields[currentStep as keyof typeof stepFields] || [];
    const isStepComplete = currentStepFields.every(field => {
      const value = surveyData[field as keyof SurveyData];
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    });

    if (isStepComplete && !completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      
      // Trigger celebration
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      // Check for achievements
      const newProgress = completedSteps.length + 1;
      
      const achievement = achievements.find(a => a.threshold === newProgress);
      if (achievement) {
        setAchievementUnlocked(achievement.title);
        setTimeout(() => setAchievementUnlocked(null), 4000);
      }
    }
  }, [surveyData, currentStep, completedSteps, achievements]);

  // Dynamic tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      const randomTip = dynamicTips[Math.floor(Math.random() * dynamicTips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      setTimeout(() => setShowTip(false), 5000);
    }, 15000);

    return () => clearInterval(tipInterval);
  }, [dynamicTips]);

  // Energy level based on progress
  useEffect(() => {
    const progressPercentage = (completedSteps.length / totalSteps) * 100;
    setEnergyLevel(Math.min(100, 50 + progressPercentage * 0.5));
  }, [completedSteps.length, totalSteps]);

  // Seasonal background changes
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setCurrentSeason('spring');
    else if (hour >= 12 && hour < 18) setCurrentSeason('summer');
    else if (hour >= 18 && hour < 22) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  const handleInputChange = (field: keyof SurveyData, value: string | number) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof SurveyData, value: string[]) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

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

  // Memoized calculations for performance
  const totalCO2 = useMemo(() => {
    return Math.round((
      calculateCO2('transportation', surveyData.transportation) +
      calculateCO2('airTravel', surveyData.airTravel) +
      calculateCO2('meatMeals', surveyData.meatMeals) +
      calculateCO2('diningOut', surveyData.diningOut) +
      calculateCO2('electricity', surveyData.electricity) +
      calculateCO2('lpgUsage', surveyData.lpgUsage) +
      calculateCO2('waste', surveyData.waste)
    ) * 10) / 10;
  }, [surveyData]);

  const ecoScore = useMemo(() => {
    if (totalCO2 < 200) return 90;
    if (totalCO2 < 300) return 80;
    if (totalCO2 < 400) return 70;
    if (totalCO2 < 500) return 60;
    if (totalCO2 < 600) return 50;
    if (totalCO2 < 800) return 40;
    if (totalCO2 < 1000) return 30;
    return 20;
  }, [totalCO2]);

  // Legacy functions for backward compatibility
  const calculateTotalCO2 = (): number => totalCO2;
  const calculateEcoScore = (): number => ecoScore;

  // Convert survey data to backend format
  const convertToBackendFormat = (data: SurveyData): UserSubmission => {
    // Map diet options
    const dietMap: { [key: string]: string } = {
      'Vegetarian': 'vegetarian',
      'Vegan': 'vegan',
      'Pescatarian': 'pescatarian',
      'Omnivore': 'omnivore'
    };

    // Map social activity
    const socialMap: { [key: string]: string } = {
      'Low': 'rarely',
      'Medium': 'often',
      'High': 'very often',
      'None': 'never'
    };

    // Map air travel frequency based on actual air travel hours
    const getAirTravelFrequency = (hours: number): string => {
      if (hours === 0) return 'never';
      if (hours <= 5) return 'rarely';
      if (hours <= 20) return 'frequently';
      return 'very frequently';
    };

    // Map energy efficiency
    const energyMap: { [key: string]: string } = {
      'Yes': 'Yes',
      'No': 'No',
      'Sometimes': 'Sometimes'
    };

    // Map shower frequency
    const showerMap: { [key: string]: string } = {
      'Daily': 'daily',
      'Twice Daily': 'twice a day',
      'Less Frequently': 'less frequently',
      'More Frequently': 'more frequently'
    };

    // Map heating energy
    const heatingMap: { [key: string]: string } = {
      'Natural Gas': 'natural gas',
      'Electricity': 'electricity',
      'Coal': 'coal',
      'Wood': 'wood',
      'LPG': 'natural gas' // Map LPG to natural gas for simplicity
    };

    return {
      // Personal info
      body_type: 'normal', // Default value
      sex: 'male', // Default value - using 'male' as training data only has 'male' and 'female'
      
      // Lifestyle
      diet: dietMap[data.diet] || 'omnivore',
      shower_frequency: showerMap[data.socialActivity] || 'daily',
      heating_energy: heatingMap[data.heatingSource] || 'natural gas',
      
      // Transport
      transport: data.transportation > 0 ? 1.0 : 0.0,
      vehicle_distance: data.transportation,
      air_travel: getAirTravelFrequency(data.airTravel),
      
      // Social & Consumption
      social_activity: socialMap[data.socialActivity] || 'often',
      grocery_bill: Math.max(50, data.meatMeals * 8 + data.diningOut * 12), // More realistic estimates
      new_clothes: Math.max(0, Math.floor(data.diningOut / 3)), // More conservative estimate
      
      // Technology & Energy - more realistic estimates
      tv_pc_hours: Math.min(12, Math.max(1, data.electricity / 50)), // Cap at 12 hours, minimum 1
      internet_hours: Math.min(16, Math.max(1, data.electricity / 40)), // Cap at 16 hours, minimum 1
      energy_efficiency: energyMap[data.recycling] || 'Sometimes',
      
      // Waste & Recycling
      recycling: data.recycling === 'Always' ? ['Paper', 'Plastic', 'Glass', 'Metal'] : 
                 data.recycling === 'Sometimes' ? ['Paper', 'Plastic'] : 
                 data.recycling === 'Never' ? [] : ['Paper'],
      waste_bag_size: 10.0, // Default value
      waste_bag_count: Math.ceil(data.waste / 5), // Estimate based on waste
      
      // Cooking
      cooking_methods: data.cookingMethods,
      
      // Location
      city: data.city,
      area: data.area,
      
      // Additional fields for better accuracy
      electricity: data.electricity,
      lpg_kg: data.lpgUsage,
      flights_hours: data.airTravel,
      meat_meals: data.meatMeals,
      dining_out: data.diningOut,
      shopping_spend: data.meatMeals * 5 + data.diningOut * 8, // More conservative shopping estimate
      waste_kg: data.waste
    };
  };

  const validatePrediction = (predicted: number, current: number): number => {
    // More conservative validation bounds
    // If prediction is more than 1.8x current, cap it at 1.5x current
    if (predicted > current * 1.8) {
      console.warn(`Prediction ${predicted} is too high compared to current ${current}, capping at ${current * 1.5}`);
      return current * 1.5;
    }
    // If prediction is less than 0.6x current, set minimum to 0.7x current
    if (predicted < current * 0.6) {
      console.warn(`Prediction ${predicted} is too low compared to current ${current}, setting minimum to ${current * 0.7}`);
      return current * 0.7;
    }
    
    // If prediction is still too high (more than 1.3x), apply additional smoothing
    if (predicted > current * 1.3) {
      const smoothed = current * 1.2; // 20% above current
      console.warn(`Prediction ${predicted} is still high, applying additional smoothing to ${smoothed}`);
      return smoothed;
    }
    
    return predicted;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setShowSuccess(true);
    
    // Hide success animation after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000);
    
    try {
      // Convert survey data to backend format
      const backendData = convertToBackendFormat(surveyData);
      
      // Debug: Log the data being sent
      console.log('Survey Data:', surveyData);
      console.log('Backend Data:', backendData);
      
      // Get prediction from backend
      const prediction = await apiService.predictCO2(backendData);
      
      // Validate and adjust prediction if needed
      const currentCO2 = calculateTotalCO2();
      let validatedPrediction = validatePrediction(prediction.predicted_co2, currentCO2);
      
      // If prediction is still unreasonable, use a simple forecast
      if (validatedPrediction > currentCO2 * 1.5) {
        // Simple forecast: current + 10% for next month
        validatedPrediction = currentCO2 * 1.1;
        console.warn(`Using simple forecast: ${validatedPrediction} (10% above current)`);
      }
      
      // Calculate local CO2 for comparison
      const localCO2 = calculateTotalCO2();
      const ecoScore = calculateEcoScore();
      
      // Store user data in localStorage for dashboard
      localStorage.setItem('userSurveyData', JSON.stringify({
        ...surveyData,
        carbonFootprint: localCO2,
        predictedCO2: validatedPrediction,
        confidence: prediction.confidence,
        modelUsed: prediction.model_used,
        recommendations: prediction.recommendations,
        peerComparison: prediction.peer_comparison,
        ecoScore,
        timestamp: new Date().toISOString()
      }));
      
      // Append lightweight history entry in localStorage
      try {
        const key = 'submissionHistory';
        const raw = localStorage.getItem(key);
        const history = raw ? JSON.parse(raw) : [];
        const entry = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          area: backendData.area,
          current_co2: localCO2,
          predicted_co2: validatedPrediction,
          actual_co2: null,
          model: prediction.model_used || 'XGBoost',
          confidence: prediction.confidence ?? 85.0
        };
        const next = [entry, ...history].slice(0, 50); // cap
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save history:', e);
      }

      // Load the CSV data for comparison
      await loadYourData();
      
      // Refresh user prediction data in context
      refreshUserPrediction();
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Error getting prediction:', err);
      setError('Failed to get prediction. Using local calculation instead.');
      
      // Fallback to local calculation
      const carbonFootprint = calculateTotalCO2();
      const ecoScore = calculateEcoScore();
      
      localStorage.setItem('userSurveyData', JSON.stringify({
        ...surveyData,
        carbonFootprint,
        ecoScore,
        timestamp: new Date().toISOString()
      }));

      // Append fallback history entry (using local current footprint)
      try {
        const key = 'submissionHistory';
        const raw = localStorage.getItem(key);
        const history = raw ? JSON.parse(raw) : [];
        const entry = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          area: surveyData.area,
          current_co2: carbonFootprint,
          predicted_co2: carbonFootprint,
          actual_co2: null,
          model: 'Local',
          confidence: 85.0
        };
        const next = [entry, ...history].slice(0, 50);
        localStorage.setItem(key, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save fallback history:', e);
      }
      
      await loadYourData();
      refreshUserPrediction();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const SliderCard = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    value, 
    onChange, 
    min, 
    max, 
    unit, 
    co2Value 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    unit: string;
    co2Value: number;
  }) => {
    const progressPercentage = ((value - min) / (max - min)) * 100;
    const [showMotivation, setShowMotivation] = useState(false);
    const [currentMotivationMsg, setCurrentMotivationMsg] = useState('');
    
    const handleSliderChange = (newValue: number) => {
      onChange(newValue);
      
      // Show motivational message
      const messages = motivationalMessages[title.toLowerCase().replace(/\s+/g, '') as keyof typeof motivationalMessages] || motivationalMessages.transportation;
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMotivationMsg(randomMsg);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 3000);
    };
    
    return (
      <motion.div 
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Achievement sparkle effect */}
        {showMotivation && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <motion.div 
              className="p-2 bg-emerald-100 rounded-lg"
              animate={{ 
                scale: showMotivation ? [1, 1.2, 1] : 1,
                rotate: showMotivation ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-5 h-5 text-emerald-600" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{min} {unit}</span>
              <span className="text-sm text-gray-600">{max} {unit}</span>
            </div>
            
            {/* Enhanced Slider Container */}
            <div className="relative w-full h-8 flex items-center">
              {/* Track Background */}
              <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
              
              {/* Progress Fill with dynamic colors */}
              <motion.div 
                className={`absolute h-2 rounded-lg ${
                  progressPercentage < 30 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  progressPercentage < 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
                animate={{ 
                  boxShadow: showMotivation ? "0 0 20px rgba(34, 197, 94, 0.5)" : "none"
                }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Slider Input */}
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
              />
              
              {/* Enhanced Custom Thumb */}
              <motion.div 
                className={`absolute w-6 h-6 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 ${
                  progressPercentage < 30 ? 'bg-green-600' :
                  progressPercentage < 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ left: `${progressPercentage}%` }}
                animate={{ 
                  scale: showMotivation ? [1, 1.3, 1] : 1,
                  boxShadow: showMotivation ? "0 0 25px rgba(34, 197, 94, 0.8)" : "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <motion.div 
              className="flex items-center justify-center mt-2"
              animate={{ scale: showMotivation ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-lg font-semibold text-gray-900">{value} {unit}</span>
              {title === 'Transportation' && (
                <motion.div
                  animate={{ rotate: showMotivation ? [0, 15, -15, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Bike className="w-4 h-4 text-emerald-600 ml-2" />
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center"
            animate={{ scale: showMotivation ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-2xl font-bold text-emerald-600">{co2Value} kg CO₂</span>
          </motion.div>
          
          {/* Motivational message */}
          <AnimatePresence>
            {showMotivation && (
              <motion.div
                className="mt-3 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-emerald-700 font-medium text-center">
                  {currentMotivationMsg}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SliderCard
                icon={Car}
                title="Transportation"
                value={surveyData.transportation}
                onChange={(value) => handleInputChange('transportation', value)}
                min={0}
                max={500}
                unit="km/month"
                co2Value={calculateCO2('transportation', surveyData.transportation)}
              />
              
              <SliderCard
                icon={Plane}
                title="Air Travel"
                value={surveyData.airTravel}
                onChange={(value) => handleInputChange('airTravel', value)}
                min={0}
                max={100}
                unit="hours/year"
                co2Value={calculateCO2('airTravel', surveyData.airTravel)}
              />
              
              <SliderCard
                icon={Utensils}
                title="Meat Meals"
                subtitle="Meat Consumption"
                value={surveyData.meatMeals}
                onChange={(value) => handleInputChange('meatMeals', value)}
                min={0}
                max={90}
                unit="meals/month"
                co2Value={calculateCO2('meatMeals', surveyData.meatMeals)}
              />
              
              <SliderCard
                icon={ShoppingBag}
                title="Dining Out"
                value={surveyData.diningOut}
                onChange={(value) => handleInputChange('diningOut', value)}
                min={0}
                max={60}
                unit="times/month"
                co2Value={calculateCO2('diningOut', surveyData.diningOut)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SliderCard
                icon={Zap}
                title="Electricity"
                value={surveyData.electricity}
                onChange={(value) => handleInputChange('electricity', value)}
                min={0}
                max={1000}
                unit="kWh/month"
                co2Value={calculateCO2('electricity', surveyData.electricity)}
              />
              
              <SliderCard
                icon={Zap}
                title="LPG Usage"
                value={surveyData.lpgUsage}
                onChange={(value) => handleInputChange('lpgUsage', value)}
                min={0}
                max={50}
                unit="kg/month"
                co2Value={calculateCO2('lpgUsage', surveyData.lpgUsage)}
              />
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Heating Source</h3>
                </div>
                <select 
                  value={surveyData.heatingSource}
                  onChange={(e) => handleInputChange('heatingSource', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Wood">Wood</option>
                  <option value="Coal">Coal</option>
                  <option value="Solar">Solar</option>
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Recycle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Recycling Habit</h3>
                </div>
                <select 
                  value={surveyData.recycling}
                  onChange={(e) => handleInputChange('recycling', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Never">Never</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="Always">Always</option>
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Cooking Methods</h3>
                </div>
                <div className="space-y-2">
                  {['Stove', 'Oven', 'Microwave', 'Grill', 'Airfryer'].map((method) => (
                    <label key={method} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={surveyData.cookingMethods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayInputChange('cookingMethods', [...surveyData.cookingMethods, method]);
                          } else {
                            handleArrayInputChange('cookingMethods', surveyData.cookingMethods.filter(m => m !== method));
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <SliderCard
                icon={Trash2}
                title="Waste"
                value={surveyData.waste}
                onChange={(value) => handleInputChange('waste', value)}
                min={0}
                max={200}
                unit="kg/month"
                co2Value={calculateCO2('waste', surveyData.waste)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Diet</h3>
                </div>
                <select 
                  value={surveyData.diet}
                  onChange={(e) => handleInputChange('diet', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Omnivore">Omnivore</option>
                  <option value="Pescatarian">Pescatarian</option>
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Social Activity</h3>
                </div>
                <select 
                  value={surveyData.socialActivity}
                  onChange={(e) => handleInputChange('socialActivity', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                    </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">City</h3>
                </div>
                <select 
                  value={surveyData.city}
                  onChange={(e) => {
                    handleInputChange('city', e.target.value);
                    handleInputChange('area', ''); // Reset area when city changes
                  }}
                  className={getSelectStyles()}
                >
                  <option value="">Select City</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    </div>
                  <h3 className="font-semibold text-gray-900">Country</h3>
                </div>
                <select 
                  value={surveyData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Cooking Energy</h3>
                </div>
                <select 
                  value={surveyData.cookingEnergy}
                  onChange={(e) => handleInputChange('cookingEnergy', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="LPG">LPG</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Wood">Wood</option>
                  <option value="Coal">Coal</option>
                </select>
            </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Profession / Subdomain</h3>
                </div>
                <select 
                  value={surveyData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Area</h3>
                </div>
                <select 
                  value={surveyData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  disabled={!surveyData.city}
                  className={getSelectStyles(!surveyData.city)}
                >
                  <option value="">{surveyData.city ? 'Select Area' : 'Select City First'}</option>
                  {currentCityAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen py-8 relative overflow-hidden ${
      currentSeason === 'spring' ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50' :
      currentSeason === 'summer' ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50' :
      currentSeason === 'autumn' ? 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50' :
      'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Dynamic seasonal background elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: y1 }}
      >
        {currentSeason === 'spring' && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-20"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}
        
        {currentSeason === 'summer' && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-20"
              animate={{
                scale: [1.1, 1.4, 1.1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
        
        {currentSeason === 'autumn' && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-16 h-16 bg-red-200 rounded-full opacity-20"
              animate={{
                scale: [1.2, 1, 1.2],
                y: [0, 15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
        
        {currentSeason === 'winter' && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20"
              animate={{
                scale: [1.1, 1.3, 1.1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}
        
        <motion.div
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 360],
                  y: [0, -100],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement notification */}
      <AnimatePresence>
        {achievementUnlocked && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl shadow-2xl border-2 border-yellow-300">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                  <p className="text-sm">{achievementUnlocked}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic tip notification */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            className="fixed bottom-4 left-4 z-50 max-w-sm"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-emerald-200">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-emerald-600 mt-1" />
                <p className="text-sm text-gray-700">{currentTip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Unique Energy Level & Progress Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <motion.div
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">Energy Level</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    energyLevel > 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    energyLevel > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    energyLevel > 40 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${energyLevel}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{energyLevel}%</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-700">{completedSteps.length}/{totalSteps}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Progress Indicators */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {[1, 2, 3].map((step) => {
            const isCompleted = completedSteps.includes(step);
            const isCurrent = step === currentStep;
            const isPast = step < currentStep;
            
            return (
              <motion.div
              key={step}
                className="relative flex items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: step * 0.2, duration: 0.5 }}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full mx-2 flex items-center justify-center transition-all duration-300 ${
                    isCompleted || isPast 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600' 
                        : 'bg-gray-300 text-gray-500'
                  }`}
                  animate={{
                    scale: isCurrent ? [1, 1.1, 1] : 1,
                    boxShadow: isCurrent ? "0 0 20px rgba(16, 185, 129, 0.5)" : "none"
                  }}
                  transition={{ duration: 0.5, repeat: isCurrent ? Infinity : 0 }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </motion.div>
                
                {/* Connecting line */}
                {step < 3 && (
                  <motion.div
                    className={`w-8 h-0.5 ${
                      isPast ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: isPast ? 32 : 32 }}
                    transition={{ duration: 0.5, delay: step * 0.2 + 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced CO2 Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
          style={{ opacity }}
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Estimated Monthly CO₂ (Preview)
          </motion.h1>
          <motion.p 
            className="text-sm text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Final prediction will come from the model
          </motion.p>
          
          {/* Enhanced Impact Slider */}
          <motion.div 
            className="max-w-md mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Low Impact</span>
              <span>High Impact</span>
            </div>
            <div className="relative w-full h-8 flex items-center">
              {/* Track Background */}
              <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
              
              {/* Progress Fill with gradient */}
              <motion.div 
                className="absolute h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg"
                style={{ width: `${Math.min(100, Math.max(10, (totalCO2 / 500) * 100))}%` }}
                animate={{ 
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)"
                }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={Math.min(100, Math.max(10, (totalCO2 / 500) * 100))}
                readOnly
                className="absolute w-full h-8 opacity-0 cursor-pointer z-10"
              />
              
              {/* Enhanced Custom Thumb */}
              <motion.div 
                className="absolute w-6 h-6 bg-emerald-600 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2"
                style={{ left: `${Math.min(100, Math.max(10, (totalCO2 / 500) * 100))}%` }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Enhanced CO2 Display */}
          <motion.div 
            className="flex items-center justify-center space-x-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-32 h-32 relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${Math.min(251.2, (totalCO2 / 500) * 251.2)} 251.2`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 251.2" }}
                    animate={{ strokeDasharray: `${Math.min(251.2, (totalCO2 / 500) * 251.2)} 251.2` }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </svg>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-gray-900"
                      key={totalCO2}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {totalCO2} kg
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
                </div>
          </motion.div>

          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-lg font-semibold text-gray-700">Eco Score: </span>
            <motion.span 
              className="text-2xl font-bold text-emerald-600"
              key={ecoScore}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {ecoScore}
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Main Content */}
            <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Complete!</h3>
                <p className="text-gray-600">Your carbon footprint is being calculated...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 rounded-lg bg-white/50 backdrop-blur-sm">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span>Cycling 5 km can save ~1 kg CO₂ vs driving.</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 rounded-lg bg-white/50 backdrop-blur-sm">
            <Bus className="w-4 h-4 text-emerald-600" />
            <span>Public transport can cut commute emissions by ~60%.</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center mt-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep > 1 && '← Back'}
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing data...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze My Carbon Footprint</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;