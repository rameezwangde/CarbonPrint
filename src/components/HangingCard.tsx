import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HangingCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  co2Value: number;
  index: number;
  totalCards: number;
}

const HangingCard: React.FC<HangingCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onChange,
  min,
  max,
  unit,
  co2Value,
  index,
  totalCards
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [currentMotivationMsg, setCurrentMotivationMsg] = useState('');
  
  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  
  const progressPercentage = ((value - min) / (max - min)) * 100;
  
  // Motivational messages
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
    ],
    electricity: [
      "⚡ Energy efficiency is key!",
      "🌱 Every kWh saved helps!",
      "💚 You're powering a greener future!",
      "🌟 Smart energy choices matter!"
    ],
    lpgUsage: [
      "🔥 Efficient cooking saves energy!",
      "🌱 Every kg of LPG saved counts!",
      "💚 You're cooking sustainably!",
      "🌟 Smart fuel choices matter!"
    ],
    waste: [
      "♻️ Waste reduction is powerful!",
      "🌱 Every kg less waste helps!",
      "💚 You're closing the loop!",
      "🌟 Circular thinking matters!"
    ]
  };

  const handleSliderChange = (newValue: number) => {
    onChange(newValue);
    
    // Show motivational message
    const messages = motivationalMessages[title.toLowerCase().replace(/\s+/g, '') as keyof typeof motivationalMessages] || motivationalMessages.transportation;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMotivationMsg(randomMsg);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 3000);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Calculate hanging position with slight offset for natural look
  const cardOffset = (index - (totalCards - 1) / 2) * 20;
  const stringLength = 60 + (index % 3) * 20; // Varying string lengths
  
  // Responsive adjustments
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const adjustedCardOffset = isMobile ? cardOffset * 0.5 : cardOffset;
  const adjustedStringLength = isMobile ? stringLength * 0.8 : stringLength;

  return (
    <motion.div
      className="relative"
      style={{
        x: adjustedCardOffset,
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: -100, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      {/* Hanging String/Rope */}
      <motion.div
        className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <div 
          className="w-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-lg"
          style={{ height: `${adjustedStringLength}px` }}
        />
        {/* String attachment point */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-amber-700 rounded-full shadow-lg" />
      </motion.div>

      {/* Card Container */}
      <motion.div
        className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 overflow-hidden"
        style={{
          transform: "translateZ(20px)",
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)"
            : "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -10 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Card Header with Icon */}
        <motion.div 
          className="flex items-center space-x-4 mb-6"
          animate={{ 
            scale: showMotivation ? [1, 1.1, 1] : 1,
            rotate: showMotivation ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg"
            animate={{ 
              scale: showMotivation ? [1, 1.2, 1] : 1,
              rotate: showMotivation ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </motion.div>

        {/* Slider Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">{min} {unit}</span>
            <span className="text-sm font-medium text-gray-600">{max} {unit}</span>
          </div>
          
          {/* Enhanced Slider Container */}
          <div className="relative w-full h-10 flex items-center">
            {/* Track Background with 3D effect */}
            <div className="absolute w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shadow-inner" />
            
            {/* Progress Fill with dynamic colors and 3D effect */}
            <motion.div 
              className={`absolute h-3 rounded-full shadow-lg ${
                progressPercentage < 30 ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600' :
                progressPercentage < 70 ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600' :
                'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
              animate={{ 
                boxShadow: showMotivation ? "0 0 25px rgba(34, 197, 94, 0.6)" : "0 4px 12px rgba(0, 0, 0, 0.2)"
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
              className="absolute w-full h-10 opacity-0 cursor-pointer z-10"
            />
            
            {/* Enhanced Custom Thumb with 3D effect */}
            <motion.div 
              className={`absolute w-8 h-8 rounded-full shadow-xl border-4 border-white transform -translate-x-1/2 ${
                progressPercentage < 30 ? 'bg-gradient-to-br from-green-500 to-green-700' :
                progressPercentage < 70 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                'bg-gradient-to-br from-red-500 to-red-700'
              }`}
              style={{ left: `${progressPercentage}%` }}
              animate={{ 
                scale: showMotivation ? [1, 1.4, 1] : isHovered ? 1.1 : 1,
                boxShadow: showMotivation ? "0 0 30px rgba(34, 197, 94, 0.8)" : "0 8px 25px rgba(0, 0, 0, 0.3)"
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Value Display */}
          <motion.div 
            className="flex items-center justify-center mt-4"
            animate={{ scale: showMotivation ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-2xl font-bold text-gray-900">{value} {unit}</span>
          </motion.div>
        </div>

        {/* CO2 Value Display */}
        <motion.div 
          className="text-center"
          animate={{ scale: showMotivation ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-3xl font-bold text-emerald-600">{co2Value} kg CO₂</span>
        </motion.div>

        {/* Motivational message with 3D effect */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ 
            opacity: showMotivation ? 1 : 0, 
            y: showMotivation ? 0 : 10, 
            scale: showMotivation ? 1 : 0.9 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <p className="text-sm text-emerald-700 font-medium text-center">
              {currentMotivationMsg}
            </p>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full opacity-20"
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
          className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20"
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
      </motion.div>
    </motion.div>
  );
};

export default HangingCard;
