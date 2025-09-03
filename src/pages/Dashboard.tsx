import React from 'react';
import { motion } from 'framer-motion';
import ReportEmbed from '../components/ReportEmbed';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Carbon Footprint Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore comprehensive analytics and insights about carbon footprint patterns across different domains and regions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <ReportEmbed />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;