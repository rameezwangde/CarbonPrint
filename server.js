import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Mock Power BI embed configuration
app.get('/api/pbi/embed-config', (req, res) => {
  // Mock configuration for demo purposes
  const mockConfig = {
    embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=sample-report-id',
    reportId: 'sample-report-id',
    accessToken: 'mock-access-token-for-demo'
  };
  
  res.json(mockConfig);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
});