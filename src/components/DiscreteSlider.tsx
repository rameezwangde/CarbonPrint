import React from 'react';
import { motion } from 'framer-motion';

interface DiscreteSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: string[];
  helpText?: string;
}

const DiscreteSlider: React.FC<DiscreteSliderProps> = ({
  label,
  value,
  onChange,
  options,
  helpText,
}) => {
  const percentage = (value / (options.length - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-lg font-semibold text-emerald-600">
          {options[value]}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-emerald-600 rounded-full shadow-md"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />

        {/* Option markers */}
        <div className="absolute top-0 w-full h-2 flex justify-between">
          {options.map((_, index) => (
            <div
              key={index}
              className="w-1 h-1 bg-gray-400 rounded-full"
              style={{ marginTop: '2px' }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{options[0]}</span>
        <span>{options[options.length - 1]}</span>
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default DiscreteSlider;