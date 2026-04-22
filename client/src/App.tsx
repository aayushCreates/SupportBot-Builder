import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AppShell from './components/layout/AppShell';
import BotLayout from './components/layout/BotLayout';
import AxiosInterceptor from './components/auth/AxiosInterceptor';
import NewBotPage from './pages/NewBotPage';

// Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const BotsPage = React.lazy(() => import('./pages/BotsPage'));
const BotOverviewPage = React.lazy(() => import('./pages/BotOverviewPage'));


const SourcesPage = React.lazy(() => import('./pages/SourcesPage'));
const ConversationsPage = React.lazy(() => import('./pages/ConversationsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const EmbedPage = React.lazy(() => import('./pages/EmbedPage'));
const BillingPage = React.lazy(() => import('./pages/BillingPage'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/*"
            element={
              <>
                <SignedIn>
                  <AxiosInterceptor>
                    <Routes>
                      <Route element={<AppShell />}>
                        <Route path="dashboard" element={<BotsPage />} />
                        <Route path="bots/new" element={<NewBotPage />} />
                      
                      {/* Bot Specific Managed Routes */}


                      <Route path="bots/:botId" element={<BotLayout />}>
                        <Route index element={<BotOverviewPage />} />
                        <Route path="sources" element={<SourcesPage />} />
                        <Route path="conversations" element={<ConversationsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="embed" element={<EmbedPage />} />
                      </Route>

                      <Route path="billing" element={<BillingPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                  </AxiosInterceptor>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" replace />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default App;
