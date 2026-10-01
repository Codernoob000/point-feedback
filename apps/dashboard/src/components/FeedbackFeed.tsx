import React from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Mic, Globe, Code, ArrowUpRight, MessageSquare, Frown, Meh, Smile, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeedbackFeedProps {
  items: FeedbackItem[];
  selectedId: string | null;
  onSelect: (item: FeedbackItem) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sentimentFilter: string;
  onSentimentFilterChange: (sentiment: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export const FeedbackFeed: React.FC<FeedbackFeedProps> = ({
  items,
  selectedId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  sentimentFilter,
  onSentimentFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  page,
  totalPages,
  totalCount,
  onPageChange
}) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'angry':
        return <Frown className="w-3.5 h-3.5 text-danger shrink-0" />;
      case 'loved':
        return <Smile className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      default:
        return <Meh className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg overflow-hidden">
      {/* Dense Filter Bar */}
      <div className="px-5 py-2.5 border-b border-border bg-surface/30 flex items-center justify-between text-xs gap-3 overflow-x-auto shrink-0 font-mono">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-lg border border-border">
          {['all', 'open', 'in_progress', 'resolved', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded text-[11px] capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Sentiment & Priority Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={sentimentFilter}
            onChange={(e) => onSentimentFilterChange(e.target.value)}
            className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-[11px] text-slate-300 focus:outline-none"
          >
            <option value="all">All Sentiments</option>
            <option value="angry">😠 Frustrated</option>
            <option value="neutral">😐 Neutral</option>
            <option value="loved">😍 Loved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-2.5 py-1 rounded bg-bg-elevated border border-border text-[11px] text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Dense Linear-Inspired Master Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs">
            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            No feedback entries match your criteria
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedId === item.id;
            const pathName = (() => {
              try {
                return new URL(item.page_url).pathname;
              } catch {
                return item.page_url;
              }
            })();

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`px-5 py-3.5 flex items-start justify-between gap-4 cursor-pointer transition-colors group ${
                  isSelected
                    ? 'bg-surface-active/80 border-l-2 border-primary'
                    : 'hover:bg-surface/50'
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Sentiment Dot / Icon */}
                  <div className="mt-0.5 p-1 rounded bg-bg-elevated border border-border shrink-0">
                    {getSentimentIcon(item.sentiment)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Header: Title / Summary */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                        {item.ai_summary || item.comment || `Feedback on ${item.target_selector}`}
                      </span>

                      {item.audio_url && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 text-[10px] font-mono border border-indigo-800/80 shrink-0">
                          <Mic className="w-2.5 h-2.5" />
                          <span>Voice {item.audio_duration ? `${item.audio_duration.toFixed(0)}s` : ''}</span>
                        </span>
                      )}
                    </div>

                    {/* Comment preview if different from summary */}
                    {item.comment && item.ai_summary && (
                      <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                        "{item.comment}"
                      </p>
                    )}

                    {/* Metadata pill row */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                      {/* Target element selector */}
                      <span className="flex items-center gap-1 text-slate-400 max-w-[200px] truncate bg-bg/80 px-1.5 py-0.5 rounded border border-border/40">
                        <Code className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{item.target_selector}</span>
                      </span>

                      {/* Route */}
                      <span className="flex items-center gap-1 text-slate-400 bg-bg/80 px-1.5 py-0.5 rounded border border-border/40">
                        <Globe className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{pathName}</span>
                      </span>

                      {/* Viewport badge */}
                      <span className="text-slate-500">
                        {item.viewport_width}×{item.viewport_height}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Timestamp */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 font-mono text-[11px]">
                  <span className="text-slate-500">
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer (Fix 13) */}
      <div className="px-5 py-2.5 border-t border-border bg-surface/40 flex items-center justify-between text-xs font-mono shrink-0">
        <span className="text-slate-400 text-[11px]">
          Showing <span className="text-slate-200 font-medium">{items.length}</span> of{' '}
          <span className="text-slate-200 font-medium">{totalCount}</span> items
        </span>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">
            Page <span className="text-indigo-400 font-semibold">{page}</span> of{' '}
            <span className="text-slate-300">{totalPages || 1}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded bg-bg-elevated hover:bg-surface-hover border border-border text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded bg-bg-elevated hover:bg-surface-hover border border-border text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] transition-colors"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

