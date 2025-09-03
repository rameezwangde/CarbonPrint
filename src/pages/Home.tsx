import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp, Users } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-20 pb-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
          >
            Carbon Footprint
            <span className="text-emerald-600 block">Insights</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Understand your environmental impact through personalized analysis, 
            comprehensive data visualization, and actionable insights for a sustainable future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link
              to="/dashboard"
              className="group bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/survey"
              className="group border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <span>Take Survey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful Features for Climate Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides the tools you need to measure, 
              understand, and reduce your carbon footprint effectively.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Personal Analysis"
              description="Get detailed insights into your individual carbon footprint based on lifestyle choices, consumption patterns, and daily activities."
              delay={0.1}
            />
            <FeatureCard
              icon={BarChart3}
              title="Domain Analysis"
              description="Explore carbon footprint patterns across different domains and areas to identify key improvement opportunities."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Forecasts"
              description="View predictive models and forecasts to understand future environmental impact trends and plan accordingly."
              delay={0.3}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;