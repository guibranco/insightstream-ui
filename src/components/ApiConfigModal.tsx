import React, { useState, useEffect } from 'react';
import { Settings, Check, X, Globe, RotateCcw, Database } from 'lucide-react';
import { getEffectiveApiUrl, getStoredApiUrl, setCustomApiUrl } from '../services/apiClient';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiUrlInput(getStoredApiUrl() || getEffectiveApiUrl());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiUrl(apiUrlInput);
    setSavedSuccess(true);
    
    // Dispatch custom event so other components update immediately
    window.dispatchEvent(new Event('insightstream_api_url_changed'));
    
    if (onSaved) {
      onSaved();
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setCustomApiUrl('');
    setApiUrlInput('');
    setSavedSuccess(true);
    window.dispatchEvent(new Event('insightstream_api_url_changed'));
    if (onSaved) {
      onSaved();
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const effectiveUrl = getEffectiveApiUrl();
  const isCustom = Boolean(getStoredApiUrl());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#16191F] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#79378B]/10 text-[#79378B] dark:text-[#93CD3F]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">API Settings</h2>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Configure remote REST API endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
              API Base URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://api.yourdomain.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#79378B] dark:focus:border-[#93CD3F] font-mono transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 leading-relaxed">
              Saved in your browser&apos;s <code className="text-[#79378B] dark:text-[#93CD3F] font-mono">localStorage</code>.
              Leave blank to run in offline local storage mode.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F1115] border border-slate-200/60 dark:border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-gray-400">Effective URL:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-gray-200 truncate max-w-[200px]">
                {effectiveUrl || '(None - Local Storage Mode)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-gray-400">Current Mode:</span>
              <span className={`font-semibold flex items-center gap-1 ${effectiveUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-[#93CD3F]'}`}>
                {effectiveUrl ? <Globe className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                {effectiveUrl ? (isCustom ? 'Custom API (localStorage)' : 'Environment API') : 'Local Storage Mode'}
              </span>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              API URL updated successfully!
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            {isCustom && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#79378B] hover:bg-[#5e2b6c] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#93CD3F]" />
              Save API URL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
