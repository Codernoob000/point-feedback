import React, { useEffect, useState } from 'react';
import { AnalyticsSummary } from '../types';
import { api } from '../api/client';
import { Header } from '../components/Header';
import {
  BarChart3,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Layers,
  Globe,
  Code2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header title="Analytics & Trends" subtitle="Aggregated bug volume and sentiment breakdown" />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading telemetry analytics...
        </div>
      </div>
    );
  }

  const totalSentiment =
    (data.sentiment_breakdown.angry || 0) +
    (data.sentiment_breakdown.neutral || 0) +
    (data.sentiment_breakdown.loved || 0) || 1;

  const angryPercent = Math.round(((data.sentiment_breakdown.angry || 0) / totalSentiment) * 100);
  const neutralPercent = Math.round(((data.sentiment_breakdown.neutral || 0) / totalSentiment) * 100);
  const lovedPercent = Math.round(((data.sentiment_breakdown.loved || 0) / totalSentiment) * 100);

  const maxVolume = Math.max(...data.daily_volume.map((d) => d.count), 5);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg">
      <Header title="Analytics & Telemetry Intelligence" subtitle="Live trends, sentiment distribution, and DOM bottlenecks" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Total Reports</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {data.total_feedback}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>+18% from last week</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Open Issues</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {data.open_count}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Awaiting developer triage
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>In Progress</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400">
              {data.in_progress_count}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Linked to Linear / Jira
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Resolved</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {data.resolved_count}
            </div>
            <div className="text-[11px] text-emerald-400/80 font-mono">
              Fixed in production
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Feedback Volume (7-day bar chart) */}
          <div className="col-span-2 bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Daily Feedback Ingestion Volume</h3>
                <p className="text-xs text-slate-400 font-mono">Incoming visual bug reports (7-day timeline)</p>
              </div>
              <span className="text-[11px] font-mono text-indigo-400 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Last 7 Days
              </span>
            </div>

            {/* Custom Bar Visualizer */}
            <div className="h-44 pt-6 flex items-end justify-between gap-3 border-b border-border/70 pb-2">
              {data.daily_volume.map((d, i) => {
                const heightPercent = Math.max(12, (d.count / maxVolume) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div className="w-full max-w-[40px] bg-slate-800 rounded-t-md overflow-hidden flex flex-col justify-end h-32">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-indigo-400 rounded-t-md transition-all duration-300 group-hover:from-indigo-600 group-hover:to-indigo-300 shadow-glow-primary"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Sentiment Ratio</h3>
              <p className="text-xs text-slate-400 font-mono">User emotional telemetry</p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Frustrated */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-danger">
                    <Frown className="w-3.5 h-3.5" />
                    <span>Frustrated / Broken</span>
                  </span>
                  <span className="text-slate-300">{angryPercent}% ({data.sentiment_breakdown.angry})</span>
                </div>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${angryPercent}%` }} />
                </div>
              </div>

              {/* Neutral */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-warning">
                    <Meh className="w-3.5 h-3.5" />
                    <span>Neutral Observation</span>
                  </span>
                  <span className="text-slate-300">{neutralPercent}% ({data.sentiment_breakdown.neutral})</span>
                </div>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${neutralPercent}%` }} />
                </div>
              </div>

              {/* Loved */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Smile className="w-3.5 h-3.5" />
                    <span>Delighted</span>
                  </span>
                  <span className="text-slate-300">{lovedPercent}% ({data.sentiment_breakdown.loved})</span>
                </div>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${lovedPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Breakdown Grids */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Top Reported Routes</span>
              </h3>
              <span className="text-[11px] text-slate-500">By frequency</span>
            </div>

            <div className="divide-y divide-border/60">
              {data.top_pages.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">No page data yet</div>
              ) : (
                data.top_pages.map((p, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[70%]">{p.url}</span>
                    <span className="px-2 py-0.5 rounded bg-bg-elevated text-indigo-400 border border-border">
                      {p.count} reports
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most Reported DOM Elements */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Most Reported DOM Targets</span>
              </h3>
              <span className="text-[11px] text-slate-500">By selector</span>
            </div>

            <div className="divide-y divide-border/60">
              {data.most_reported_elements.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">No elements reported yet</div>
              ) : (
                data.most_reported_elements.map((el, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate max-w-[70%]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                        {el.tag}
                      </span>
                      <span className="text-indigo-300 truncate">{el.selector}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-bg-elevated text-amber-400 border border-border">
                      {el.count} flags
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
