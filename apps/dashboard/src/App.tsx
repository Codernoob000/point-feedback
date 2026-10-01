import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { FeedbackPage } from './pages/FeedbackPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WidgetDemoPage } from './pages/WidgetDemoPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen bg-bg text-slate-100 overflow-hidden font-sans">
        {/* Main Left Sidebar */}
        <Sidebar />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Routes>
            <Route path="/" element={<FeedbackPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/sandbox" element={<WidgetDemoPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
