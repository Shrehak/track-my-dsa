import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Track My DSA Backend API running at http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
