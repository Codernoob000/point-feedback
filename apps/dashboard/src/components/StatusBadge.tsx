import React from 'react';
import { FeedbackStatus, FeedbackPriority, FeedbackCategory } from '../types';

export const StatusBadge: React.FC<{ status: FeedbackStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const styles: Record<FeedbackStatus, { label: string; bg: string; text: string; dot: string }> = {
    open: {
      label: 'Open',
      bg: 'bg-primary/10 border-primary/30',
      text: 'text-indigo-400',
      dot: 'bg-indigo-400'
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-warning/10 border-warning/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400'
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-success/10 border-success/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400'
    },
    archived: {
      label: 'Archived',
      bg: 'bg-slate-800/60 border-slate-700',
      text: 'text-slate-400',
      dot: 'bg-slate-500'
    }
  };

  const current = styles[status] || styles.open;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium font-mono uppercase tracking-wider ${current.bg} ${current.text} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${status === 'open' ? 'animate-pulse' : ''}`} />
      {current.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority?: FeedbackPriority }> = ({ priority = 'medium' }) => {
  const p = priority.toLowerCase() as FeedbackPriority;
  const config: Record<FeedbackPriority, { label: string; text: string; bg: string }> = {
    high: { label: 'High Priority', text: 'text-danger', bg: 'bg-danger/10 border-danger/30' },
    medium: { label: 'Medium', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    low: { label: 'Low', text: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' }
  };

  const curr = config[p] || config.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${curr.bg} ${curr.text}`}>
      {curr.label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category?: string }> = ({ category = 'UI Bug' }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/80">
      {category}
    </span>
  );
};
