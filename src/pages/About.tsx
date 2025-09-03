import React from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, Users, BarChart3, Brain, Globe } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Our Methodology
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our Carbon Footprint Insights platform combines robust data science with interactive 
            visualizations to provide accurate, actionable environmental impact analysis.
          </p>
        </motion.div>

        {/* Methodology Overview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 mx-auto">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h3>
              <p className="text-gray-600">
                Survey-driven data collection capturing lifestyle patterns, consumption habits, and demographic information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4 mx-auto">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Machine Learning</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze patterns and generate predictions based on established environmental research.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 mx-auto">
                <BarChart3 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualization</h3>
              <p className="text-gray-600">
                Power BI dashboards transform complex data into intuitive, interactive visual insights.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Foundation</h2>
          <div className="prose prose-lg max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kaggle Dataset Baseline</h3>
                <p className="text-gray-600 mb-4">
                  Our foundation is built on comprehensive synthetic datasets from Kaggle, providing 
                  robust baseline measurements across diverse demographic and geographic segments.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• 10,000+ synthetic data points</li>
                  <li>• 15+ lifestyle and consumption variables</li>
                  <li>• Global demographic representation</li>
                  <li>• Validated against research studies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-World Survey Data</h3>
                <p className="text-gray-600 mb-4">
                  User-contributed survey responses enhance our models with real-world patterns, 
                  improving accuracy and regional specificity over time.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Continuous data collection</li>
                  <li>• Regional pattern analysis</li>
                  <li>• Lifestyle trend identification</li>
                  <li>• Model validation and refinement</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Users}
            title="Personal Carbon Analysis"
            description="Individual carbon footprint calculation based on lifestyle factors including transportation, energy consumption, diet, and consumption patterns."
            delay={0.1}
          />
          <FeatureCard
            icon={Globe}
            title="Domain & Geographic Insights"
            description="Regional and domain-specific carbon footprint analysis revealing patterns across different geographic areas and industry sectors."
            delay={0.2}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Predictive Forecasting"
            description="Machine learning models provide future carbon footprint projections based on current trends and proposed lifestyle changes."
            delay={0.3}
          />
        </div>

        {/* Technical Implementation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-8 mt-16"
        >
          <h2 className="text-2xl font-bold mb-6">Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Analysis Engine</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Python-based data processing pipeline</li>
                <li>• Scikit-learn for machine learning models</li>
                <li>• Pandas for data manipulation and analysis</li>
                <li>• Statistical validation and cross-validation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Visualization Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Microsoft Power BI for dashboard creation</li>
                <li>• Interactive filtering and drill-down capabilities</li>
                <li>• Real-time data refresh and updates</li>
                <li>• Responsive design for all device types</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;