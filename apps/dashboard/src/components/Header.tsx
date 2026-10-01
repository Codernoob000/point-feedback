import React from 'react';
import { Search, RefreshCw, Zap, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="h-16 px-6 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-mono text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search selector, route, comment... (/) "
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-hover border border-border/80 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Realtime Ingestion</span>
        </div>
      </div>
    </header>
  );
};
