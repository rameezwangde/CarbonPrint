import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EmbedConfig {
  embedUrl: string;
  reportId: string;
  accessToken: string;
}

const ReportEmbed: React.FC = () => {
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbedConfig = async () => {
      try {
        // Add a small delay to simulate real API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('/api/pbi/embed-config');
        if (!response.ok) {
          throw new Error('Failed to fetch embed configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEmbedConfig();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-96 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
      >
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading dashboard...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-96 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg"
      >
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </motion.div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-screen bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <PowerBIEmbed
        embedConfig={{
          type: 'report',
          id: config.reportId,
          embedUrl: config.embedUrl,
          accessToken: config.accessToken,
          tokenType: models.TokenType.Embed,
          settings: {
            panes: {
              filters: {
                expanded: false,
                visible: true,
              },
            },
            background: models.BackgroundType.Transparent,
          },
        }}
        eventHandlers={
          new Map([
            ['loaded', () => console.log('Report loaded')],
            ['rendered', () => console.log('Report rendered')],
            ['error', (event) => {
              console.error('Report error:', event.detail);
              setError('Report failed to load');
            }],
          ])
        }
        cssClassName="w-full h-full"
      />
    </motion.div>
  );
};

export default ReportEmbed;