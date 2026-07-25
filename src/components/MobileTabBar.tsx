import React from 'react';
import { LayoutDashboard, Inbox, Heart, Trash2, Settings } from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const currentHash = window.location.hash || '#/';

  const tabs = [
    { label: 'Dashboard', hash: '#/', icon: LayoutDashboard },
    { label: 'Awaiting', hash: '#/links/awaiting', icon: Inbox },
    { label: 'Liked', hash: '#/links/liked', icon: Heart },
    { label: 'Discarded', hash: '#/links/discarded', icon: Trash2 },
    { label: 'Settings', hash: '#/preferences', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const isActive =
          currentHash === tab.hash ||
          (tab.hash !== '#/' && currentHash.startsWith(tab.hash));
        const Icon = tab.icon;

        return (
          <a
            key={tab.hash}
            href={tab.hash}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] text-center ${
              isActive
                ? 'text-brand-purple dark:text-purple-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
