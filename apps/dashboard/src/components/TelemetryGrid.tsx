import React from 'react';
import { TelemetryData } from '../types';
import { Monitor, Globe, Cpu, Smartphone, Layers, ExternalLink } from 'lucide-react';

interface TelemetryGridProps {
  telemetry?: TelemetryData;
  viewportWidth?: number;
  viewportHeight?: number;
  browser?: string;
  userAgent?: string;
  pixelRatio?: number;
  pageUrl?: string;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  telemetry,
  viewportWidth,
  viewportHeight,
  browser,
  userAgent,
  pixelRatio,
  pageUrl
}) => {
  const width = viewportWidth || telemetry?.viewportWidth || 1920;
  const height = viewportHeight || telemetry?.viewportHeight || 1080;
  const currentBrowser = browser || telemetry?.browser || 'Chrome';
  const ua = userAgent || telemetry?.userAgent || 'Unknown UA';
  const dpr = pixelRatio || telemetry?.pixelRatio || 1.0;
  const url = pageUrl || telemetry?.url || 'https://example.com';
  const os = telemetry?.os || (ua.includes('iPhone') ? 'iOS' : ua.includes('Mac') ? 'macOS' : ua.includes('Windows') ? 'Windows' : 'Linux');

  return (
    <div className="bg-surface-card border border-border rounded-lg p-3.5 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Device & Telemetry Matrix</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Telemetry Verified
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Viewport */}
        <div className="bg-bg-elevated/70 border border-border/60 rounded p-2.5 flex items-start gap-2.5">
          <Monitor className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Viewport</div>
            <div className="text-slate-200 font-bold">{width} × {height} px</div>
            <div className="text-[10px] text-slate-500">{width < 768 ? 'Mobile Viewport' : width < 1024 ? 'Tablet Viewport' : 'Desktop Viewport'}</div>
          </div>
        </div>

        {/* Browser & OS */}
        <div className="bg-bg-elevated/70 border border-border/60 rounded p-2.5 flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Browser & OS</div>
            <div className="text-slate-200 font-bold truncate">{currentBrowser}</div>
            <div className="text-[10px] text-slate-500">{os}</div>
          </div>
        </div>

        {/* Pixel Ratio */}
        <div className="bg-bg-elevated/70 border border-border/60 rounded p-2.5 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Device Pixel Ratio</div>
            <div className="text-slate-200 font-bold">{dpr}x DPR</div>
            <div className="text-[10px] text-slate-500">{dpr > 1 ? 'HiDPI / Retina Display' : 'Standard DPI'}</div>
          </div>
        </div>

        {/* Platform */}
        <div className="bg-bg-elevated/70 border border-border/60 rounded p-2.5 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Client Platform</div>
            <div className="text-slate-200 font-bold">{os}</div>
            <div className="text-[10px] text-slate-500">{telemetry?.language || 'en-US'}</div>
          </div>
        </div>
      </div>

      {/* Target URL */}
      <div className="bg-bg/60 border border-border/40 rounded p-2 flex items-center justify-between">
        <div className="truncate text-[11px] text-slate-400">
          <span className="text-slate-500 mr-1.5">URL:</span>
          <span className="text-indigo-300 select-all">{url}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-white ml-2 p-1"
          title="Open page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* User Agent String */}
      <div className="bg-bg/40 border border-border/30 rounded p-2 text-[10px] text-slate-500 break-all leading-normal">
        <span className="text-slate-400 font-semibold block mb-0.5">User-Agent:</span>
        {ua}
      </div>
    </div>
  );
};
