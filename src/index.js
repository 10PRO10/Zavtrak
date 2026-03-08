import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
      {/* 🔴 Vercel Analytics */}
      <Analytics />
      {/* 🔴 Vercel Speed Insights */}
      <SpeedInsights />
    </React.StrictMode>
  );
}