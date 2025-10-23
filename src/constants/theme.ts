// Eco-themed gradient constants
export const ECO_GRADIENT = 'from-emerald-50 via-green-100 to-sky-50';

// Color schemes for different performance levels
export const PERFORMANCE_COLORS = {
  excellent: {
    bg: 'from-green-50 to-green-100',
    text: 'text-green-900',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
  good: {
    bg: 'from-blue-50 to-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  warning: {
    bg: 'from-yellow-50 to-yellow-100',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
  },
  danger: {
    bg: 'from-red-50 to-red-100',
    text: 'text-red-900',
    border: 'border-red-200',
    icon: 'text-red-600',
  },
  neutral: {
    bg: 'from-gray-50 to-gray-100',
    text: 'text-gray-900',
    border: 'border-gray-200',
    icon: 'text-gray-600',
  },
};

// Chart colors for consistent theming
export const CHART_COLORS = [
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
];

// Animation presets
export const ANIMATION_PRESETS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  stagger: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.1 },
  },
};

// Card styling presets
export const CARD_STYLES = {
  base: 'bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100',
  hover: 'hover:shadow-xl transition-shadow duration-300',
  selected: 'bg-emerald-100 border-2 border-emerald-300 shadow-md',
  interactive: 'cursor-pointer transition-all duration-200 hover:bg-gray-100',
};

// Performance indicators
export const getPerformanceLevel = (avgCO2: number, target?: number, benchmark?: number) => {
  if (target && avgCO2 <= target) return 'excellent';
  if (target && avgCO2 <= target * 1.1) return 'good';
  if (benchmark && avgCO2 <= benchmark) return 'warning';
  return 'danger';
};

// Format numbers for display
export const formatNumber = (num: number, decimals: number = 1) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
