import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  CheckCircle,
  Sparkles,
  Heart,
  Target
} from 'lucide-react';
import HangingCard from './HangingCard';

interface SurveyData {
  transportation: number;
  airTravel: number;
  meatMeals: number;
  diningOut: number;
  electricity: number;
  lpgUsage: number;
  waste: number;
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

interface HangingCardsLayoutProps {
  currentStep: number;
  surveyData: SurveyData;
  onInputChange: (field: keyof SurveyData, value: string | number) => void;
  onArrayInputChange: (field: keyof SurveyData, value: string[]) => void;
  calculateCO2: (type: string, value: number) => number;
  getSelectStyles: (disabled?: boolean) => string;
  availableCities: string[];
  currentCityAreas: string[];
  completedSteps: number[];
  totalSteps: number;
  energyLevel: number;
  totalCO2: number;
  ecoScore: number;
}

const HangingCardsLayout: React.FC<HangingCardsLayoutProps> = ({
  currentStep,
  surveyData,
  onInputChange,
  onArrayInputChange,
  calculateCO2,
  getSelectStyles,
  availableCities,
  currentCityAreas,
  completedSteps,
  totalSteps,
  energyLevel,
  totalCO2,
  ecoScore
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState<string>('');
  const [showTip, setShowTip] = useState(false);

  // Dynamic tips
  const dynamicTips = [
    "💡 Did you know? Walking 1 mile saves 0.3 kg CO₂!",
    "🌱 Fun fact: A tree absorbs 22 kg CO₂ per year!",
    "⚡ Energy tip: LED bulbs use 75% less energy!",
    "🚲 Cycling fact: 10 minutes of cycling = 0.1 kg CO₂ saved!",
    "🌍 Global impact: If everyone reduced meat by 1 meal/week, we'd save 1.5 billion tons CO₂!",
    "💧 Water wisdom: Shorter showers save both water and energy!",
    "🌿 Green hack: Houseplants improve air quality by 25%!",
    "♻️ Recycling reality: 1 aluminum can saves enough energy to power a TV for 3 hours!"
  ];

  // Achievement system
  const achievements = [
    { id: 'first_step', title: '🌱 Green Beginner', description: 'Started your carbon journey!', threshold: 1 },
    { id: 'eco_warrior', title: '🛡️ Eco Warrior', description: 'Completed transportation section!', threshold: 2 },
    { id: 'climate_champion', title: '🏆 Climate Champion', description: 'Halfway through your journey!', threshold: 3 },
    { id: 'earth_guardian', title: '🌍 Earth Guardian', description: 'Almost there, planet saver!', threshold: 4 },
    { id: 'carbon_master', title: '⭐ Carbon Master', description: 'You\'re a sustainability expert!', threshold: 5 }
  ];

  // Step completion tracking
  React.useEffect(() => {
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
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      const newProgress = completedSteps.length + 1;
      const achievement = achievements.find(a => a.threshold === newProgress);
      if (achievement) {
        setAchievementUnlocked(achievement.title);
        setTimeout(() => setAchievementUnlocked(null), 4000);
      }
    }
  }, [surveyData, currentStep, completedSteps, achievements]);

  // Dynamic tip rotation
  React.useEffect(() => {
    const tipInterval = setInterval(() => {
      const randomTip = dynamicTips[Math.floor(Math.random() * dynamicTips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      setTimeout(() => setShowTip(false), 5000);
    }, 15000);

    return () => clearInterval(tipInterval);
  }, [dynamicTips]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-12">
            {/* Hanging Cards for Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <HangingCard
                icon={Car}
                title="Transportation"
                value={surveyData.transportation}
                onChange={(value) => onInputChange('transportation', value)}
                min={0}
                max={500}
                unit="km/month"
                co2Value={calculateCO2('transportation', surveyData.transportation)}
                index={0}
                totalCards={4}
              />
              
              <HangingCard
                icon={Plane}
                title="Air Travel"
                value={surveyData.airTravel}
                onChange={(value) => onInputChange('airTravel', value)}
                min={0}
                max={100}
                unit="hours/year"
                co2Value={calculateCO2('airTravel', surveyData.airTravel)}
                index={1}
                totalCards={4}
              />
              
              <HangingCard
                icon={Utensils}
                title="Meat Meals"
                subtitle="Meat Consumption"
                value={surveyData.meatMeals}
                onChange={(value) => onInputChange('meatMeals', value)}
                min={0}
                max={90}
                unit="meals/month"
                co2Value={calculateCO2('meatMeals', surveyData.meatMeals)}
                index={2}
                totalCards={4}
              />
              
              <HangingCard
                icon={ShoppingBag}
                title="Dining Out"
                value={surveyData.diningOut}
                onChange={(value) => onInputChange('diningOut', value)}
                min={0}
                max={60}
                unit="times/month"
                co2Value={calculateCO2('diningOut', surveyData.diningOut)}
                index={3}
                totalCards={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-12">
            {/* Hanging Cards for Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <HangingCard
                icon={Zap}
                title="Electricity"
                value={surveyData.electricity}
                onChange={(value) => onInputChange('electricity', value)}
                min={0}
                max={1000}
                unit="kWh/month"
                co2Value={calculateCO2('electricity', surveyData.electricity)}
                index={0}
                totalCards={4}
              />
              
              <HangingCard
                icon={Zap}
                title="LPG Usage"
                value={surveyData.lpgUsage}
                onChange={(value) => onInputChange('lpgUsage', value)}
                min={0}
                max={50}
                unit="kg/month"
                co2Value={calculateCO2('lpgUsage', surveyData.lpgUsage)}
                index={1}
                totalCards={4}
              />
              
              <HangingCard
                icon={Trash2}
                title="Waste"
                value={surveyData.waste}
                onChange={(value) => onInputChange('waste', value)}
                min={0}
                max={200}
                unit="kg/month"
                co2Value={calculateCO2('waste', surveyData.waste)}
                index={2}
                totalCards={4}
              />
            </div>

            {/* Additional form cards for Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Heating Source</h3>
                </div>
                <select 
                  value={surveyData.heatingSource}
                  onChange={(e) => onInputChange('heatingSource', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Wood">Wood</option>
                  <option value="Coal">Coal</option>
                  <option value="Solar">Solar</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Recycle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recycling Habit</h3>
                </div>
                <select 
                  value={surveyData.recycling}
                  onChange={(e) => onInputChange('recycling', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Never">Never</option>
                  <option value="Sometimes">Sometimes</option>
                  <option value="Always">Always</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden md:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cooking Methods</h3>
                </div>
                <div className="space-y-3">
                  {['Stove', 'Oven', 'Microwave', 'Grill', 'Airfryer'].map((method) => (
                    <label key={method} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={surveyData.cookingMethods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onArrayInputChange('cookingMethods', [...surveyData.cookingMethods, method]);
                          } else {
                            onArrayInputChange('cookingMethods', surveyData.cookingMethods.filter(m => m !== method));
                          }
                        }}
                        className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Hanging Cards for Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Diet</h3>
                </div>
                <select 
                  value={surveyData.diet}
                  onChange={(e) => onInputChange('diet', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Omnivore">Omnivore</option>
                  <option value="Pescatarian">Pescatarian</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Social Activity</h3>
                </div>
                <select 
                  value={surveyData.socialActivity}
                  onChange={(e) => onInputChange('socialActivity', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">City</h3>
                </div>
                <select 
                  value={surveyData.city}
                  onChange={(e) => {
                    onInputChange('city', e.target.value);
                    onInputChange('area', ''); // Reset area when city changes
                  }}
                  className={getSelectStyles()}
                >
                  <option value="">Select City</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Country</h3>
                </div>
                <select 
                  value={surveyData.country}
                  onChange={(e) => onInputChange('country', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cooking Energy</h3>
                </div>
                <select 
                  value={surveyData.cookingEnergy}
                  onChange={(e) => onInputChange('cookingEnergy', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="LPG">LPG</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Wood">Wood</option>
                  <option value="Coal">Coal</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Profession</h3>
                </div>
                <select 
                  value={surveyData.profession}
                  onChange={(e) => onInputChange('profession', e.target.value)}
                  className={getSelectStyles()}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </motion.div>
              
              <motion.div
                className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative overflow-hidden md:col-span-2 lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Area</h3>
                </div>
                <select 
                  value={surveyData.area}
                  onChange={(e) => onInputChange('area', e.target.value)}
                  disabled={!surveyData.city}
                  className={getSelectStyles(!surveyData.city)}
                >
                  <option value="">{surveyData.city ? 'Select Area' : 'Select City First'}</option>
                  {currentCityAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
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
                <Target className="w-8 h-8" />
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

      {/* Main content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>
    </div>
  );
};

export default HangingCardsLayout;
