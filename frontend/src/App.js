import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import '@/App.css';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { UserManagement } from '@/pages/UserManagement';
import { QuickShifts } from '@/pages/QuickShifts';
import { PlotTwists } from '@/pages/PlotTwists';
import { AffirmationMeditation } from '@/pages/AffirmationMeditation';
import { OnboardingManagement } from '@/pages/OnboardingManagement';

// Analytics & Settings placeholder pages
const Analytics = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-4">Analytics & Reports</h1>
    <p className="text-muted-foreground">Comprehensive platform analytics and user insights coming soon.</p>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-4">Platform Settings</h1>
    <p className="text-muted-foreground">Global app configuration and admin management coming soon.</p>
  </div>
);

const TeachingMoments = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-4">Teaching Moments</h1>
    <p className="text-muted-foreground">Manage "Let's talk to Little You" content and personal growth insights.</p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Content Management */}
            <Route path="/quick-shifts" element={<QuickShifts />} />
            <Route path="/plot-twists" element={<PlotTwists />} />
            <Route path="/affirmations" element={<AffirmationMeditation />} />
            <Route path="/teaching-moments" element={<TeachingMoments />} />
            
            {/* Management & Insights */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/onboarding" element={<OnboardingManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;