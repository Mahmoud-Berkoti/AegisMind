import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomePage } from './pages/HomePage';
import { IncidentDashboard } from './pages/IncidentDashboard';
import { useOnlineStatus } from './store/hooks';
import { initMockServer } from './mocks/server';
import './app.css';

// Initialize mock server if enabled
initMockServer();

const App: React.FC = () => {
  useOnlineStatus();
  const [currentPage, setCurrentPage] = React.useState<'home' | 'dashboard'>('home');

  if (currentPage === 'home') {
    return <HomePage onEnter={() => setCurrentPage('dashboard')} />;
  }

  return <IncidentDashboard onBackToHome={() => setCurrentPage('home')} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

