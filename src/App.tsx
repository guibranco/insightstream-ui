import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';

import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { ToastContainer } from './components/ToastContainer';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LinksPage } from './pages/LinksPage';
import { PreferencesPage } from './pages/PreferencesPage';

// Protected Route Guard Wrapper
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <MobileTabBar />
      <ToastContainer />
    </div>
  );
};

// Route wrapper for LinksPage to pass parameter
const LinksPageRouteWrapper: React.FC = () => {
  const [status, setStatus] = useState<string>('awaiting');

  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '';
      const match = hash.match(/#\/links\/(.+)/);
      if (match && match[1]) {
        setStatus(match[1]);
      } else {
        setStatus('awaiting');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  return <LinksPage statusParam={status} />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <ToastProvider>
            <HashRouter>
              <Routes>
                {/* Public Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard Route */}
                <Route
                  path="/"
                  element={
                    <ProtectedLayout>
                      <DashboardPage />
                    </ProtectedLayout>
                  }
                />

                {/* Links Filter Routes */}
                <Route
                  path="/links/*"
                  element={
                    <ProtectedLayout>
                      <LinksPageRouteWrapper />
                    </ProtectedLayout>
                  }
                />

                {/* Preferences Route */}
                <Route
                  path="/preferences"
                  element={
                    <ProtectedLayout>
                      <PreferencesPage />
                    </ProtectedLayout>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </HashRouter>
          </ToastProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
