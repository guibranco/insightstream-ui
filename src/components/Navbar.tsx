import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ApiConfigModal } from './ApiConfigModal';
import { getEffectiveApiUrl } from '../services/apiClient';
import {
  Sparkles,
  LayoutDashboard,
  Inbox,
  Heart,
  Trash2,
  EyeOff,
  Settings,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Globe,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [activeApiUrl, setActiveApiUrl] = useState(getEffectiveApiUrl());

  useEffect(() => {
    const handleUrlChange = () => {
      setActiveApiUrl(getEffectiveApiUrl());
    };
    window.addEventListener('insightstream_api_url_changed', handleUrlChange);
    return () => {
      window.removeEventListener('insightstream_api_url_changed', handleUrlChange);
    };
  }, []);

  const isRemoteApi = Boolean(activeApiUrl.trim());

  const currentHash = window.location.hash || '#/';

  const navItems = [
    { label: 'Dashboard', hash: '#/', icon: LayoutDashboard },
    { label: 'Awaiting', hash: '#/links/awaiting', icon: Inbox },
    { label: 'Liked', hash: '#/links/liked', icon: Heart },
    { label: 'Discarded', hash: '#/links/discarded', icon: Trash2 },
    { label: 'Reviewed', hash: '#/links/discarded_after_review', icon: EyeOff },
    { label: 'Preferences', hash: '#/preferences', icon: Settings },
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0A0B0D]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#/"
            className="flex items-center gap-3 font-bold text-lg text-slate-900 dark:text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[#79378B] rounded-lg p-1 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#79378B] text-white flex items-center justify-center shadow-lg shadow-[#79378B]/20">
              <Sparkles className="w-5 h-5 text-[#93CD3F]" />
            </div>
            <span className="tracking-tight text-xl font-bold">
              Insight<span className="text-[#93CD3F]">Stream</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive =
                currentHash === item.hash ||
                (item.hash !== '#/' && currentHash.startsWith(item.hash));
              const Icon = item.icon;

              return (
                <a
                  key={item.hash}
                  href={item.hash}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#79378B]/10 dark:bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] border border-[#79378B]/20 dark:border-[#79378B]/30 font-bold'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#79378B] dark:text-[#93CD3F]' : ''}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right side controls: API status badge, gear config, theme toggle, profile */}
          <div className="flex items-center gap-2.5">
            {/* API Mode Indicator Badge */}
            <button
              onClick={() => setApiModalOpen(true)}
              title={
                isRemoteApi
                  ? `Connected to API: ${activeApiUrl}. Click gear or badge to edit.`
                  : 'Running in offline local storage mode. Click to configure API URL.'
              }
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                isRemoteApi
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-purple-50 dark:bg-[#79378B]/20 text-purple-700 dark:text-[#93CD3F] border-purple-200 dark:border-[#79378B]/30'
              }`}
            >
              <Globe className="w-3 h-3 shrink-0" />
              {isRemoteApi ? 'Remote API' : 'Local Storage API'}
            </button>

            {/* Gear Icon Button for API URL Settings */}
            <button
              onClick={() => setApiModalOpen(true)}
              aria-label="Configure API URL"
              title="Configure API Base URL"
              className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#16191F] transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10 hover:border-[#79378B]/40"
            >
              <Settings className="w-4 h-4 text-[#79378B] dark:text-[#93CD3F]" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              aria-label={`Current theme: ${theme}. Click to change.`}
              title={`Current theme: ${theme} (Effective: ${effectiveTheme})`}
              className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#16191F] transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-[#93CD3F]" />}
              {theme === 'auto' && <Laptop className="w-4 h-4 text-slate-400" />}
            </button>

            {/* User Menu Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#16191F] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#79378B] to-[#93CD3F] p-[1px]">
                    <div className="w-full h-full rounded-full bg-[#0F1115] flex items-center justify-center font-bold text-xs text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-gray-200">
                    {user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16191F] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-1.5 z-20 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                          Premium Plan
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setApiModalOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#79378B] dark:text-[#93CD3F]" />
                        API Settings
                      </button>

                      <a
                        href="#/preferences"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Preferences
                      </a>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <ApiConfigModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
      />
    </>
  );
};
