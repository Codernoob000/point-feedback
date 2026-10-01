import React from 'react';
import { NavLink } from 'react-router-dom';
import { BrandIcon } from './BrandIcon';
import {
  MessageSquare,
  BarChart3,
  Sliders,
  Workflow,
  Sparkles,
  PlaySquare,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Feedback Feed', icon: MessageSquare, badge: null },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { to: '/sandbox', label: 'Widget Sandbox', icon: PlaySquare, badge: 'Live' },
    { to: '/integrations', label: 'Integrations', icon: Workflow, badge: 'Linear' },
    { to: '/settings', label: 'Settings & SDK', icon: Sliders, badge: null },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <BrandIcon size={26} glow />
          <div>
            <div className="font-bold font-mono tracking-wider text-sm text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              POINT.FEEDBACK
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Point. Speak. Fix.
            </div>
          </div>
        </NavLink>
      </div>

      {/* Project Switcher Pill */}
      <div className="px-3.5 py-3 border-b border-border/70">
        <div className="px-3 py-2 rounded-lg bg-bg-elevated border border-border/80 flex items-center justify-between text-xs cursor-pointer hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-200 truncate font-medium">Acme Production App</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          Core Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-white shadow-glow-primary'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-bg/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>API Online</span>
          </span>
          <span className="text-slate-600">v1.0.0</span>
        </div>
        <div className="text-[10px] text-slate-500 leading-tight">
          Developer-Grade Visual Bug Telemetry Platform
        </div>
      </div>
    </aside>
  );
};
