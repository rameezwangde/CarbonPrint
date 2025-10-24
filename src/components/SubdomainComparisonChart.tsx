import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  ShoppingBag, 
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ScatterChart as ScatterChartIcon,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Calendar
} from 'lucide-react';

interface MonthlyEmissions {
  month: string;
  co2: number;
  trend: 'up' | 'down' | 'stable';
  factors: {
    transportation: number;
    energy: number;
    food: number;
    waste: number;
    other: number;
  };
}

interface SubdomainData {
  subdomain: string;
  count: number;
  mean_co2: number;
  median_co2: number;
  std_co2: number;
  min_co2: number;
  max_co2: number;
  q25: number;
  q75: number;
  top_city: string;
  top_area_type: string;
  avg_vehicle_distance: number;
  avg_grocery_bill: number;
  avg_tv_hours: number;
  avg_internet_hours: number;
  monthly_emissions: MonthlyEmissions[];
  lifestyle_factors: {
    work_from_home: number;
    office_days: number;
    business_travel: number;
    team_meetings: number;
    client_visits: number;
  };
  emission_breakdown: {
    transportation: number;
    energy: number;
    food: number;
    waste: number;
    business_travel: number;
    office_energy: number;
  };
  subdomain_breakdown?: {
    [key: string]: {
      count: number;
      percentage: number;
      avg_co2: number;
      description: string;
    };
  };
}

interface SubdomainComparisonChartProps {
  className?: string;
}

const SubdomainComparisonChart: React.FC<SubdomainComparisonChartProps> = ({ className = '' }) => {
  const [subdomainData, setSubdomainData] = useState<SubdomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'scatter'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'mean' | 'median' | 'count'>('mean');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubdomain, setSelectedSubdomain] = useState<SubdomainData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMonthlyComparison, setShowMonthlyComparison] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('Jan');

  // Mock data based on your analysis with realistic monthly emissions
  const mockData: SubdomainData[] = [
    {
      subdomain: 'Operations',
      count: 1678,
      mean_co2: 2333.8,
      median_co2: 2153.5,
      std_co2: 1067.29,
      min_co2: 477.0,
      max_co2: 7531.0,
      q25: 1800,
      q75: 2800,
      top_city: 'Mumbai',
      top_area_type: 'Industrial, Vehicular',
      avg_vehicle_distance: 2197,
      avg_grocery_bill: 172,
      avg_tv_hours: 12,
      avg_internet_hours: 8,
      monthly_emissions: [
        { month: 'Jan', co2: 490, trend: 'up', factors: { transportation: 196, energy: 130, food: 84, waste: 40, other: 40 } },
        { month: 'Feb', co2: 476, trend: 'down', factors: { transportation: 190, energy: 124, food: 82, waste: 40, other: 40 } },
        { month: 'Mar', co2: 504, trend: 'up', factors: { transportation: 204, energy: 136, food: 88, waste: 40, other: 36 } },
        { month: 'Apr', co2: 496, trend: 'down', factors: { transportation: 200, energy: 132, food: 86, waste: 40, other: 38 } },
        { month: 'May', co2: 470, trend: 'down', factors: { transportation: 184, energy: 128, food: 84, waste: 40, other: 34 } },
        { month: 'Jun', co2: 456, trend: 'down', factors: { transportation: 176, energy: 124, food: 80, waste: 40, other: 36 } },
        { month: 'Jul', co2: 440, trend: 'down', factors: { transportation: 170, energy: 120, food: 78, waste: 40, other: 32 } },
        { month: 'Aug', co2: 450, trend: 'up', factors: { transportation: 174, energy: 122, food: 80, waste: 40, other: 34 } },
        { month: 'Sep', co2: 464, trend: 'up', factors: { transportation: 184, energy: 126, food: 82, waste: 40, other: 32 } },
        { month: 'Oct', co2: 480, trend: 'up', factors: { transportation: 192, energy: 130, food: 84, waste: 40, other: 34 } },
        { month: 'Nov', co2: 490, trend: 'up', factors: { transportation: 196, energy: 132, food: 86, waste: 40, other: 36 } },
        { month: 'Dec', co2: 500, trend: 'up', factors: { transportation: 200, energy: 136, food: 88, waste: 40, other: 36 } }
      ],
      lifestyle_factors: {
        work_from_home: 2,
        office_days: 3,
        business_travel: 4,
        team_meetings: 8,
        client_visits: 6
      },
      emission_breakdown: {
        transportation: 980,
        energy: 650,
        food: 420,
        waste: 200,
        business_travel: 450,
        office_energy: 200
      }
    },
    {
      subdomain: 'Sales',
      count: 1624,
      mean_co2: 2297.8,
      median_co2: 2080.0,
      std_co2: 1039.9,
      min_co2: 392.0,
      max_co2: 7159.0,
      q25: 1750,
      q75: 2750,
      top_city: 'Mumbai',
      top_area_type: 'Corporate, Vehicular',
      avg_vehicle_distance: 2036,
      avg_grocery_bill: 174,
      avg_tv_hours: 10,
      avg_internet_hours: 9,
      monthly_emissions: [
        { month: 'Jan', co2: 480, trend: 'up', factors: { transportation: 220, energy: 110, food: 76, waste: 36, other: 38 } },
        { month: 'Feb', co2: 470, trend: 'down', factors: { transportation: 216, energy: 106, food: 74, waste: 36, other: 38 } },
        { month: 'Mar', co2: 490, trend: 'up', factors: { transportation: 224, energy: 114, food: 78, waste: 36, other: 38 } },
        { month: 'Apr', co2: 484, trend: 'down', factors: { transportation: 220, energy: 112, food: 76, waste: 36, other: 40 } },
        { month: 'May', co2: 460, trend: 'down', factors: { transportation: 210, energy: 108, food: 72, waste: 36, other: 34 } },
        { month: 'Jun', co2: 450, trend: 'down', factors: { transportation: 204, energy: 104, food: 70, waste: 36, other: 36 } },
        { month: 'Jul', co2: 440, trend: 'down', factors: { transportation: 200, energy: 100, food: 68, waste: 36, other: 36 } },
        { month: 'Aug', co2: 444, trend: 'up', factors: { transportation: 202, energy: 102, food: 70, waste: 36, other: 34 } },
        { month: 'Sep', co2: 456, trend: 'up', factors: { transportation: 208, energy: 106, food: 72, waste: 36, other: 34 } },
        { month: 'Oct', co2: 464, trend: 'up', factors: { transportation: 212, energy: 110, food: 74, waste: 36, other: 32 } },
        { month: 'Nov', co2: 470, trend: 'up', factors: { transportation: 216, energy: 112, food: 76, waste: 36, other: 30 } },
        { month: 'Dec', co2: 476, trend: 'up', factors: { transportation: 218, energy: 114, food: 78, waste: 36, other: 30 } }
      ],
      lifestyle_factors: {
        work_from_home: 1,
        office_days: 2,
        business_travel: 6,
        team_meetings: 4,
        client_visits: 12
      },
      emission_breakdown: {
        transportation: 1100,
        energy: 550,
        food: 380,
        waste: 180,
        business_travel: 600,
        office_energy: 150
      }
    },
    {
      subdomain: 'Engineering',
      count: 4258,
      mean_co2: 1354.9,
      median_co2: 863.94,
      std_co2: 1014.97,
      min_co2: 411.39,
      max_co2: 7226.0,
      q25: 600,
      q75: 1800,
      top_city: 'Mumbai',
      top_area_type: 'Residential, Industrial',
      avg_vehicle_distance: 1340,
      avg_grocery_bill: 217,
      avg_tv_hours: 15,
      avg_internet_hours: 12,
      monthly_emissions: [
        { month: 'Jan', co2: 280, trend: 'up', factors: { transportation: 90, energy: 76, food: 64, waste: 30, other: 20 } },
        { month: 'Feb', co2: 276, trend: 'down', factors: { transportation: 88, energy: 74, food: 62, waste: 30, other: 22 } },
        { month: 'Mar', co2: 284, trend: 'up', factors: { transportation: 92, energy: 78, food: 66, waste: 30, other: 18 } },
        { month: 'Apr', co2: 282, trend: 'down', factors: { transportation: 90, energy: 76, food: 64, waste: 30, other: 22 } },
        { month: 'May', co2: 270, trend: 'down', factors: { transportation: 86, energy: 72, food: 60, waste: 30, other: 22 } },
        { month: 'Jun', co2: 264, trend: 'down', factors: { transportation: 84, energy: 70, food: 58, waste: 30, other: 22 } },
        { month: 'Jul', co2: 260, trend: 'down', factors: { transportation: 82, energy: 68, food: 56, waste: 30, other: 24 } },
        { month: 'Aug', co2: 262, trend: 'up', factors: { transportation: 83, energy: 69, food: 57, waste: 30, other: 23 } },
        { month: 'Sep', co2: 266, trend: 'up', factors: { transportation: 85, energy: 71, food: 59, waste: 30, other: 21 } },
        { month: 'Oct', co2: 270, trend: 'up', factors: { transportation: 87, energy: 73, food: 61, waste: 30, other: 19 } },
        { month: 'Nov', co2: 274, trend: 'up', factors: { transportation: 89, energy: 75, food: 63, waste: 30, other: 17 } },
        { month: 'Dec', co2: 278, trend: 'up', factors: { transportation: 91, energy: 77, food: 65, waste: 30, other: 15 } }
      ],
      lifestyle_factors: {
        work_from_home: 3,
        office_days: 2,
        business_travel: 1,
        team_meetings: 6,
        client_visits: 2
      },
      emission_breakdown: {
        transportation: 450,
        energy: 380,
        food: 320,
        waste: 150,
        business_travel: 100,
        office_energy: 80
      }
    },
    {
      subdomain: 'Student',
      count: 4144,
      mean_co2: 1278.9,
      median_co2: 798.03,
      std_co2: 1001.8,
      min_co2: 312.87,
      max_co2: 6810.0,
      q25: 500,
      q75: 1800,
      top_city: 'Mumbai',
      top_area_type: 'Residential, Construction',
      avg_vehicle_distance: 1824,
      avg_grocery_bill: 180,
      avg_tv_hours: 18,
      avg_internet_hours: 15,
      monthly_emissions: [
        { month: 'Jan', co2: 270, trend: 'up', factors: { transportation: 120, energy: 60, food: 50, waste: 20, other: 20 } },
        { month: 'Feb', co2: 264, trend: 'down', factors: { transportation: 116, energy: 58, food: 48, waste: 20, other: 22 } },
        { month: 'Mar', co2: 276, trend: 'up', factors: { transportation: 124, energy: 62, food: 52, waste: 20, other: 18 } },
        { month: 'Apr', co2: 272, trend: 'down', factors: { transportation: 120, energy: 60, food: 50, waste: 20, other: 22 } },
        { month: 'May', co2: 256, trend: 'down', factors: { transportation: 110, energy: 56, food: 46, waste: 20, other: 24 } },
        { month: 'Jun', co2: 240, trend: 'down', factors: { transportation: 100, energy: 52, food: 44, waste: 20, other: 24 } },
        { month: 'Jul', co2: 56, trend: 'down', factors: { transportation: 16, energy: 20, food: 12, waste: 4, other: 4 } },
        { month: 'Aug', co2: 236, trend: 'up', factors: { transportation: 98, energy: 51, food: 43, waste: 20, other: 24 } },
        { month: 'Sep', co2: 244, trend: 'up', factors: { transportation: 102, energy: 54, food: 45, waste: 20, other: 23 } },
        { month: 'Oct', co2: 252, trend: 'up', factors: { transportation: 106, energy: 57, food: 47, waste: 20, other: 22 } },
        { month: 'Nov', co2: 260, trend: 'up', factors: { transportation: 110, energy: 59, food: 49, waste: 20, other: 22 } },
        { month: 'Dec', co2: 266, trend: 'up', factors: { transportation: 114, energy: 61, food: 51, waste: 20, other: 20 } }
      ],
      lifestyle_factors: {
        work_from_home: 5,
        office_days: 0,
        business_travel: 0,
        team_meetings: 2,
        client_visits: 0
      },
      emission_breakdown: {
        transportation: 600,
        energy: 300,
        food: 250,
        waste: 100,
        business_travel: 0,
        office_energy: 0
      }
    },
    {
      subdomain: 'Finance',
      count: 7470,
      mean_co2: 1108.6,
      median_co2: 842.74,
      std_co2: 823.4,
      min_co2: 302.9,
      max_co2: 6793.0,
      q25: 500,
      q75: 1500,
      top_city: 'Navi Mumbai',
      top_area_type: 'Residential, Construction',
      avg_vehicle_distance: 2112,
      avg_grocery_bill: 190,
      avg_tv_hours: 8,
      avg_internet_hours: 6,
      monthly_emissions: [
        { month: 'Jan', co2: 230, trend: 'up', factors: { transportation: 100, energy: 50, food: 40, waste: 20, other: 20 } },
        { month: 'Feb', co2: 224, trend: 'down', factors: { transportation: 96, energy: 48, food: 38, waste: 20, other: 22 } },
        { month: 'Mar', co2: 232, trend: 'up', factors: { transportation: 102, energy: 52, food: 42, waste: 20, other: 18 } },
        { month: 'Apr', co2: 228, trend: 'down', factors: { transportation: 100, energy: 50, food: 40, waste: 20, other: 18 } },
        { month: 'May', co2: 216, trend: 'down', factors: { transportation: 92, energy: 46, food: 36, waste: 20, other: 22 } },
        { month: 'Jun', co2: 210, trend: 'down', factors: { transportation: 88, energy: 44, food: 34, waste: 20, other: 24 } },
        { month: 'Jul', co2: 58, trend: 'down', factors: { transportation: 18, energy: 16, food: 14, waste: 6, other: 4 } },
        { month: 'Aug', co2: 208, trend: 'up', factors: { transportation: 86, energy: 43, food: 33, waste: 20, other: 26 } },
        { month: 'Sep', co2: 212, trend: 'up', factors: { transportation: 88, energy: 45, food: 35, waste: 20, other: 24 } },
        { month: 'Oct', co2: 216, trend: 'up', factors: { transportation: 90, energy: 47, food: 37, waste: 20, other: 22 } },
        { month: 'Nov', co2: 220, trend: 'up', factors: { transportation: 92, energy: 49, food: 39, waste: 20, other: 20 } },
        { month: 'Dec', co2: 224, trend: 'up', factors: { transportation: 94, energy: 51, food: 41, waste: 20, other: 18 } }
      ],
      lifestyle_factors: {
        work_from_home: 4,
        office_days: 1,
        business_travel: 2,
        team_meetings: 3,
        client_visits: 1
      },
      emission_breakdown: {
        transportation: 500,
        energy: 250,
        food: 200,
        waste: 100,
        business_travel: 150,
        office_energy: 50
      }
    },
    {
      subdomain: 'Other',
      count: 5820,
      mean_co2: 1107.9,
      median_co2: 763.34,
      std_co2: 915.13,
      min_co2: 209.11,
      max_co2: 6792.0,
      q25: 400,
      q75: 1500,
      top_city: 'Navi Mumbai',
      top_area_type: 'Residential, Corporate',
      avg_vehicle_distance: 1843,
      avg_grocery_bill: 153,
      avg_tv_hours: 10,
      avg_internet_hours: 8,
      monthly_emissions: [
        { month: 'Jan', co2: 230, trend: 'up', factors: { transportation: 90, energy: 56, food: 44, waste: 24, other: 16 } },
        { month: 'Feb', co2: 224, trend: 'down', factors: { transportation: 86, energy: 54, food: 42, waste: 24, other: 18 } },
        { month: 'Mar', co2: 232, trend: 'up', factors: { transportation: 92, energy: 58, food: 46, waste: 24, other: 12 } },
        { month: 'Apr', co2: 228, trend: 'down', factors: { transportation: 90, energy: 56, food: 44, waste: 24, other: 14 } },
        { month: 'May', co2: 216, trend: 'down', factors: { transportation: 82, energy: 52, food: 40, waste: 24, other: 18 } },
        { month: 'Jun', co2: 210, trend: 'down', factors: { transportation: 78, energy: 50, food: 38, waste: 24, other: 20 } },
        { month: 'Jul', co2: 57, trend: 'down', factors: { transportation: 17, energy: 18, food: 13, waste: 5, other: 4 } },
        { month: 'Aug', co2: 208, trend: 'up', factors: { transportation: 76, energy: 49, food: 37, waste: 24, other: 22 } },
        { month: 'Sep', co2: 212, trend: 'up', factors: { transportation: 78, energy: 51, food: 39, waste: 24, other: 20 } },
        { month: 'Oct', co2: 216, trend: 'up', factors: { transportation: 80, energy: 53, food: 41, waste: 24, other: 18 } },
        { month: 'Nov', co2: 220, trend: 'up', factors: { transportation: 82, energy: 55, food: 43, waste: 24, other: 16 } },
        { month: 'Dec', co2: 224, trend: 'up', factors: { transportation: 84, energy: 57, food: 45, waste: 24, other: 14 } }
      ],
      lifestyle_factors: {
        work_from_home: 3,
        office_days: 2,
        business_travel: 1,
        team_meetings: 4,
        client_visits: 2
      },
      emission_breakdown: {
        transportation: 90,
        energy: 56,
        food: 44,
        waste: 24,
        business_travel: 20,
        office_energy: 12
      },
      subdomain_breakdown: {
        'Healthcare': {
          count: 1450,
          percentage: 24.9,
          avg_co2: 250,
          description: 'Doctors, nurses, medical staff, healthcare administrators'
        },
        'Education': {
          count: 1200,
          percentage: 20.6,
          avg_co2: 196,
          description: 'Teachers, professors, education administrators, support staff'
        },
        'Government': {
          count: 980,
          percentage: 16.8,
          avg_co2: 220,
          description: 'Government employees, civil servants, public sector workers'
        },
        'Retail': {
          count: 850,
          percentage: 14.6,
          avg_co2: 210,
          description: 'Retail managers, sales associates, store supervisors'
        },
        'Hospitality': {
          count: 720,
          percentage: 12.4,
          avg_co2: 240,
          description: 'Hotel staff, restaurant workers, tourism professionals'
        },
        'Media & Communication': {
          count: 420,
          percentage: 7.2,
          avg_co2: 230,
          description: 'Journalists, content creators, media professionals'
        },
        'Legal': {
          count: 200,
          percentage: 3.4,
          avg_co2: 260,
          description: 'Lawyers, legal assistants, paralegals, court staff'
        }
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setSubdomainData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getSubdomainColor = (subdomain: string) => {
    const colors: { [key: string]: string } = {
      'Operations': '#EF4444', // Red - High emissions
      'Sales': '#F97316',      // Orange - High emissions
      'Engineering': '#3B82F6', // Blue - Medium emissions
      'Student': '#10B981',    // Green - Medium emissions
      'Finance': '#8B5CF6',    // Purple - Low emissions
      'Other': '#6B7280'       // Gray - Low emissions
    };
    return colors[subdomain] || '#6B7280';
  };

  const getSubdomainIcon = (subdomain: string) => {
    const icons: { [key: string]: string } = {
      'Operations': '🏭',
      'Sales': '💼',
      'Engineering': '⚙️',
      'Student': '🎓',
      'Finance': '💰',
      'Other': '📋'
    };
    return icons[subdomain] || '📋';
  };

  const getEmissionLevel = (co2: number) => {
    if (co2 > 2000) return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-50' };
    if (co2 > 1500) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (co2 > 1200) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const handleSubdomainClick = (subdomain: SubdomainData) => {
    setSelectedSubdomain(subdomain);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubdomain(null);
  };

  const sortedData = [...subdomainData].sort((a, b) => {
    const aValue = selectedMetric === 'count' ? a.count : 
                   selectedMetric === 'median' ? a.median_co2 : a.mean_co2;
    const bValue = selectedMetric === 'count' ? b.count : 
                   selectedMetric === 'median' ? b.median_co2 : b.mean_co2;
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const chartData = sortedData.map(item => {
    const monthlyData = item.monthly_emissions.find(m => m.month === selectedMonth);
    const monthlyValue = monthlyData ? monthlyData.co2 : item.mean_co2;
    
    return {
      name: item.subdomain,
      value: showMonthlyComparison ? monthlyValue : 
             (selectedMetric === 'count' ? item.count : 
              selectedMetric === 'median' ? item.median_co2 : item.mean_co2),
      mean: item.mean_co2,
      median: item.median_co2,
      count: item.count,
      monthlyValue: monthlyValue,
      color: getSubdomainColor(item.subdomain),
      icon: getSubdomainIcon(item.subdomain)
    };
  });

  const pieData = sortedData.map(item => ({
    name: item.subdomain,
    value: item.count,
    color: getSubdomainColor(item.subdomain)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const subdomain = sortedData.find(s => s.subdomain === label);
      
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-2xl max-w-sm">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">{data.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-600">{subdomain?.count.toLocaleString()} records</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Mean CO₂:</span>
              <span className="font-semibold">{subdomain?.mean_co2.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Median CO₂:</span>
              <span className="font-semibold">{subdomain?.median_co2.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Range:</span>
              <span className="font-semibold">{subdomain?.min_co2.toFixed(0)} - {subdomain?.max_co2.toFixed(0)} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Top City:</span>
              <span className="font-semibold">{subdomain?.top_city}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-3xl p-8 ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subdomain comparison...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-3xl p-8 ${className}`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-pink-500/30 rounded-2xl">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Subdomain Comparison
              </h2>
              <p className="text-gray-600 mt-1">CO₂ emissions across different professional domains</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Chart Type:</span>
            <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
              {[
                { type: 'bar', icon: BarChart3, label: 'Bar' },
                { type: 'pie', icon: PieChartIcon, label: 'Pie' },
                { type: 'line', icon: LineChartIcon, label: 'Line' },
                { type: 'scatter', icon: ScatterChartIcon, label: 'Scatter' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as any)}
                  className={`p-2 rounded-md transition-all ${
                    chartType === type
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mean">Mean CO₂</option>
              <option value="median">Median CO₂</option>
              <option value="count">Sample Size</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
              <button
                onClick={() => setSortOrder('desc')}
                className={`p-2 rounded-md transition-all ${
                  sortOrder === 'desc'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`p-2 rounded-md transition-all ${
                  sortOrder === 'asc'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMonthlyComparison(!showMonthlyComparison)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showMonthlyComparison
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Monthly Comparison
            </button>
          </div>

          {showMonthlyComparison && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/50 border border-white/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      {showMonthlyComparison && (
        <div className="bg-white/25 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Comparison - {selectedMonth}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} kg CO₂`, `${selectedMonth} Emissions`]}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white/25 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl mb-8">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  fill="#3B82F6"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis 
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            ) : (
              <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis 
                  dataKey="count" 
                  name="Sample Size"
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <YAxis 
                  dataKey="mean" 
                  name="Mean CO₂"
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="mean" fill="#3B82F6" />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subdomain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedData.map((subdomain, index) => {
          const emissionLevel = getEmissionLevel(subdomain.mean_co2);
          const color = getSubdomainColor(subdomain.subdomain);
          const icon = getSubdomainIcon(subdomain.subdomain);
          
          return (
            <motion.div
              key={subdomain.subdomain}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => handleSubdomainClick(subdomain)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{subdomain.subdomain}</h3>
                    <p className="text-sm text-gray-600">#{index + 1} in emissions</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${emissionLevel.bg} ${emissionLevel.color}`}>
                  {emissionLevel.level}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mean CO₂:</span>
                  <span className="font-bold text-lg" style={{ color }}>{subdomain.mean_co2.toFixed(1)} kg</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sample Size:</span>
                  <span className="font-semibold">{subdomain.count.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Top City:</span>
                  <span className="font-semibold">{subdomain.top_city}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vehicle Distance:</span>
                  <span className="font-semibold">{subdomain.avg_vehicle_distance.toFixed(0)} km</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Range:</span>
                  <span className="font-medium">{subdomain.min_co2.toFixed(0)} - {subdomain.max_co2.toFixed(0)} kg</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Low Emission Subdomains (&lt; 300 kg) */}
      <div className="mt-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Low Emission Subdomains (&lt; 300 kg/month)
        </h3>
        <p className="text-gray-600 mb-6">
          Subdomains with monthly emissions below 300 kg CO₂ - showing sustainable lifestyle patterns
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.map((subdomain) => {
            // Find the lowest monthly emission for this subdomain
            const lowestMonth = subdomain.monthly_emissions.reduce((min, month) => 
              month.co2 < min.co2 ? month : min
            );
            
            // Only show if lowest monthly emission is below 300 kg
            if (lowestMonth.co2 < 300) {
              const color = getSubdomainColor(subdomain.subdomain);
              const icon = getSubdomainIcon(subdomain.subdomain);
              
              return (
                <motion.div
                  key={subdomain.subdomain}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icon}</span>
                      <h4 className="font-bold text-gray-900">{subdomain.subdomain}</h4>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {lowestMonth.month}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lowest Monthly:</span>
                      <span className="font-bold text-green-600">{lowestMonth.co2} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transportation:</span>
                      <span className="text-sm">{lowestMonth.factors.transportation} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Energy:</span>
                      <span className="text-sm">{lowestMonth.factors.energy} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Food:</span>
                      <span className="text-sm">{lowestMonth.factors.food} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Waste:</span>
                      <span className="text-sm">{lowestMonth.factors.waste} kg</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="text-xs text-gray-500">
                      Trend: {lowestMonth.trend === 'down' ? '↘ Decreasing' : 
                             lowestMonth.trend === 'up' ? '↗ Increasing' : '→ Stable'}
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })}
        </div>
        
        {sortedData.filter(subdomain => 
          subdomain.monthly_emissions.some(month => month.co2 < 300)
        ).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No subdomains found with monthly emissions below 300 kg</div>
            <div className="text-sm text-gray-400">All subdomains show higher emission patterns</div>
          </div>
        )}
      </div>

      {/* High Emission Subdomains (> 400 kg) */}
      <div className="mt-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          High Emission Subdomains (&gt; 400 kg/month)
        </h3>
        <p className="text-gray-600 mb-6">
          Subdomains with monthly emissions above 400 kg CO₂ - showing areas for improvement
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.map((subdomain) => {
            // Find the highest monthly emission for this subdomain
            const highestMonth = subdomain.monthly_emissions.reduce((max, month) => 
              month.co2 > max.co2 ? month : max
            );
            
            // Only show if highest monthly emission is above 400 kg
            if (highestMonth.co2 > 400) {
              const color = getSubdomainColor(subdomain.subdomain);
              const icon = getSubdomainIcon(subdomain.subdomain);
              
              return (
                <motion.div
                  key={subdomain.subdomain}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icon}</span>
                      <h4 className="font-bold text-gray-900">{subdomain.subdomain}</h4>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {highestMonth.month}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Highest Monthly:</span>
                      <span className="font-bold text-red-600">{highestMonth.co2} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transportation:</span>
                      <span className="text-sm">{highestMonth.factors.transportation} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Energy:</span>
                      <span className="text-sm">{highestMonth.factors.energy} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Food:</span>
                      <span className="text-sm">{highestMonth.factors.food} kg</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Waste:</span>
                      <span className="text-sm">{highestMonth.factors.waste} kg</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="text-xs text-gray-500">
                      Trend: {highestMonth.trend === 'up' ? '↗ Increasing' : 
                             highestMonth.trend === 'down' ? '↘ Decreasing' : '→ Stable'}
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })}
        </div>
        
        {sortedData.filter(subdomain => 
          subdomain.monthly_emissions.some(month => month.co2 > 400)
        ).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No subdomains found with monthly emissions above 400 kg</div>
            <div className="text-sm text-gray-400">All subdomains show moderate emission patterns</div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-600" />
          Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Highest Emissions</h4>
                <p className="text-sm text-gray-600">
                  Operations and Sales professionals have 2x higher CO₂ emissions than Finance and Other domains.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Lowest Emissions</h4>
                <p className="text-sm text-gray-600">
                  Finance and Other domains show the most sustainable lifestyle patterns.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Sample Distribution</h4>
                <p className="text-sm text-gray-600">
                  Finance represents 29.9% of the dataset, making it the largest professional group.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Consistency</h4>
                <p className="text-sm text-gray-600">
                  Sales and Operations show the most consistent emission patterns (lowest variation).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Subdomain Modal */}
      <AnimatePresence>
        {showModal && selectedSubdomain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{getSubdomainIcon(selectedSubdomain.subdomain)}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedSubdomain.subdomain}</h2>
                    <p className="text-gray-600">Detailed CO₂ Emission Analysis</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Emissions Chart */}
                <div className="bg-white/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Monthly CO₂ Emissions
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedSubdomain.monthly_emissions}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: any) => [`${value} kg CO₂`, 'Emissions']}
                          labelStyle={{ color: '#374151' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="co2" 
                          stroke={getSubdomainColor(selectedSubdomain.subdomain)} 
                          strokeWidth={3}
                          dot={{ fill: getSubdomainColor(selectedSubdomain.subdomain), strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Emission Breakdown */}
                <div className="bg-white/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-green-600" />
                    Emission Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedSubdomain.emission_breakdown).map(([category, value]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{category.replace('_', ' ')}:</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${(value / Math.max(...Object.values(selectedSubdomain.emission_breakdown))) * 100}%`,
                                backgroundColor: getSubdomainColor(selectedSubdomain.subdomain)
                              }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900">{value} kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Factors */}
                <div className="bg-white/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Lifestyle Factors
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedSubdomain.lifestyle_factors).map(([factor, value]) => (
                      <div key={factor} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{factor.replace('_', ' ')}:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${(value / 12) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-900">{value}/week</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                    Key Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{selectedSubdomain.count.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{selectedSubdomain.mean_co2.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Mean CO₂ (kg)</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{selectedSubdomain.median_co2.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Median CO₂ (kg)</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600">{selectedSubdomain.std_co2.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Std Deviation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Analysis */}
              <div className="mt-8 bg-white/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
                  Monthly Trend Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedSubdomain.monthly_emissions.slice(0, 3).map((month, index) => (
                    <div key={month.month} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{month.month}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          month.trend === 'up' ? 'bg-red-100 text-red-600' :
                          month.trend === 'down' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {month.trend === 'up' ? '↗' : month.trend === 'down' ? '↘' : '→'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-indigo-600 mb-2">{month.co2} kg</div>
                      <div className="text-sm text-gray-600">
                        Transport: {month.factors.transportation}kg | Energy: {month.factors.energy}kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Subdomain Breakdown */}
              {selectedSubdomain.subdomain === 'Other' && selectedSubdomain.subdomain_breakdown && (
                <div className="mt-8 bg-white/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-cyan-600" />
                    "Other" Subdomain Breakdown
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The "Other" category consists of various professional domains not covered in the main categories. 
                    Here's the detailed breakdown:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(selectedSubdomain.subdomain_breakdown).map(([category, data]) => (
                      <div key={category} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900">{category}</h4>
                          <span className="text-sm text-gray-600">{data.percentage}%</span>
                        </div>
                        <div className="text-2xl font-bold text-cyan-600 mb-2">{data.avg_co2} kg CO₂</div>
                        <div className="text-sm text-gray-600 mb-2">{data.count.toLocaleString()} records</div>
                        <div className="text-xs text-gray-500">{data.description}</div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Insights:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Healthcare</strong> (24.9%) has the highest representation with moderate emissions</li>
                      <li>• <strong>Education</strong> (20.6%) shows the lowest emissions among all categories</li>
                      <li>• <strong>Legal</strong> (3.4%) has the highest per-person emissions despite small sample size</li>
                      <li>• <strong>Government</strong> (16.8%) shows consistent moderate emission patterns</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubdomainComparisonChart;
