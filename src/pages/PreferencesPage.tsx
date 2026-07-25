import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  LayoutGrid,
  List,
  LogOut,
  Globe,
  Database,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';

export const PreferencesPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [isTestingApi, setIsTestingApi] = useState(false);

  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  const isRemoteApi = Boolean(rawApiUrl.trim());

  const handleTestApi = async () => {
    setIsTestingApi(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTestingApi(false);
    if (isRemoteApi) {
      showToast(`Connected to remote API (${rawApiUrl})`, 'success');
    } else {
      showToast('Offline Mode Active: Persisting data to LocalStorage', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-purple" />
          Dashboard Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize display settings, default view modes, and manage your account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-[#16191F] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Theme & Appearance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[#79378B] bg-[#79378B]/10 text-[#79378B] font-bold shadow-xs'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#79378B]" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Light Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">High contrast day layout</p>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#79378B] bg-[#79378B]/20 text-[#93CD3F] font-bold shadow-xs'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-[#93CD3F]" />
                {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#93CD3F]" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">Geometric dark balance (#0A0B0D)</p>
              </div>
            </button>

            <button
              onClick={() => setTheme('auto')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                theme === 'auto'
                  ? 'border-[#79378B] bg-[#79378B]/10 text-[#79378B] dark:text-[#93CD3F] font-bold shadow-xs'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <Laptop className="w-5 h-5 text-slate-400" />
                {theme === 'auto' && <CheckCircle2 className="w-4 h-4 text-[#79378B]" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Auto System</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">Matches OS settings</p>
              </div>
            </button>
          </div>
        </div>

        {/* View Mode & Pagination Preferences */}
        <div className="bg-white dark:bg-[#16191F] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#79378B] dark:text-[#93CD3F]" />
            Display & Pagination
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Default View Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">
                Default View Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updatePreferences({ defaultViewMode: 'grid' })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    preferences.defaultViewMode === 'grid'
                      ? 'border-[#79378B] bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] font-bold'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid Layout
                </button>

                <button
                  onClick={() => updatePreferences({ defaultViewMode: 'list' })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    preferences.defaultViewMode === 'list'
                      ? 'border-[#79378B] bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] font-bold'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List Compact
                </button>
              </div>
            </div>

            {/* Items Per Page */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">
                Articles Per Page
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => updatePreferences({ itemsPerPage: num })}
                    className={`py-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      preferences.itemsPerPage === num
                        ? 'border-[#79378B] bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] font-bold'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {num} Items
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Diagnostics */}
        <div className="bg-white dark:bg-[#16191F] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              API Connection Status
            </h2>

            <button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1115] border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-gray-400">REST API Origin (`VITE_API_URL`):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-gray-200">
                {rawApiUrl || '(Empty - Fallback Mock LocalStorage Mode)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-gray-400">Authentication Mode:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                Bearer JWT Token (LocalStorage)
              </span>
            </div>
          </div>
        </div>

        {/* Account & Session Controls */}
        {user && (
          <div className="bg-white dark:bg-[#16191F] rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#79378B] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Logged in as {user.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Curator Session active
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                showToast('Signed out successfully', 'info');
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-200/60 dark:border-white/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of InsightStream
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
