import React, { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge';
import { DomInspector } from './DomInspector';
import { TelemetryGrid } from './TelemetryGrid';
import { WaveformPlayer } from './WaveformPlayer';
import { LinearJiraModal } from './LinearJiraModal';
import { api } from '../api/client';
import {
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  Share2,
  Trash2,
  RefreshCw,
  Camera,
  Layers,
  Smile,
  Meh,
  Frown,
  Mic
} from 'lucide-react';

interface InspectionPanelProps {
  item: FeedbackItem | null;
  onClose: () => void;
  onUpdate: (updated: FeedbackItem) => void;
  onDelete: (id: string) => void;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({ item, onClose, onUpdate, onDelete }) => {
  const [exportModal, setExportModal] = useState<'linear' | 'jira' | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-bg-elevated/40 border-l border-border">
        <Layers className="w-12 h-12 text-slate-700 mb-3 animate-pulse-subtle" />
        <p className="text-sm font-medium text-slate-400">Select a feedback item to inspect</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          View pixel-accurate element bounding boxes, DOM hierarchy, client telemetry, and voice recordings.
        </p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    setStatusUpdating(true);
    try {
      const updated = await api.updateFeedback(item.id, { status: newStatus });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAiReanalyze = async () => {
    setAiAnalyzing(true);
    try {
      const updated = await api.reanalyzeWithAI(item.id);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const sentimentIcon = {
    angry: <Frown className="w-4 h-4 text-danger" />,
    neutral: <Meh className="w-4 h-4 text-warning" />,
    loved: <Smile className="w-4 h-4 text-emerald-400" />
  }[item.sentiment] || <Meh className="w-4 h-4 text-slate-400" />;

  const sentimentLabel = {
    angry: 'Frustrated / Broken',
    neutral: 'Neutral Observation',
    loved: 'Delighted'
  }[item.sentiment] || 'Feedback';

  return (
    <div className="h-full flex flex-col bg-bg-elevated/70 border-l border-border overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-border bg-surface/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <StatusBadge status={item.status} size="sm" />
          <PriorityBadge priority={item.priority} />
          <CategoryBadge category={item.category} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Feedback permalink copied to clipboard!');
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-surface-hover transition-colors"
            title="Share permalink"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this feedback report?')) {
                onDelete(item.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-danger rounded hover:bg-surface-hover transition-colors"
            title="Delete feedback"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Ticket Summary & AI Insights */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-white tracking-tight leading-snug">
              {item.ai_summary || item.comment || `Feedback on ${item.target_selector}`}
            </h2>
            <button
              onClick={handleAiReanalyze}
              disabled={aiAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-500/25 shrink-0 disabled:opacity-50"
              title="Run AI triage analysis with Groq"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiAnalyzing ? 'animate-spin' : ''}`} />
              <span>{aiAnalyzing ? 'Triaging...' : 'AI Triage'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              {sentimentIcon}
              <span>{sentimentLabel}</span>
            </span>
            <span>•</span>
            <span>{new Date(item.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Dedicated AI Analysis Section */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-surface-card to-surface-card border border-indigo-500/30 rounded-xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </span>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
                AI Analysis
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
              Groq Llama / OSS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Summary */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                Summary:
              </span>
              <p className="text-sm font-medium text-slate-100 bg-bg/70 border border-border/80 rounded-md p-2.5 leading-snug">
                {item.ai_summary || 'No summary generated yet. Click "AI Triage" above to analyze.'}
              </p>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                  Category:
                </span>
                <CategoryBadge category={item.category || 'UI Bug'} />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
                  Priority:
                </span>
                <PriorityBadge priority={item.priority || 'medium'} />
              </div>
            </div>

            {/* Transcript */}
            <div className="space-y-1 pt-1 border-t border-border/40">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-indigo-400" />
                <span>Transcript:</span>
              </span>
              <div className="bg-bg/70 border border-border/80 rounded-md p-2.5 font-mono text-xs text-slate-300 leading-relaxed">
                {item.audio_transcript ? (
                  <p className="italic text-slate-200">"{item.audio_transcript}"</p>
                ) : (
                  <span className="text-slate-500 italic">No audio transcript available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Comment Box */}
        <div className="bg-surface/80 border border-border rounded-lg p-3.5 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            User Context Note
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            "{item.comment || 'No text note provided. See recorded telemetry and voice note.'}"
          </p>
        </div>

        {/* Voice Playback Card */}
        {(item.audio_url || item.audio_duration || item.audio_transcript) && (
          <WaveformPlayer
            audioUrl={item.audio_url}
            duration={item.audio_duration || 4.5}
            transcript={item.audio_transcript}
          />
        )}

        {/* Screenshot Preview with Target Highlight */}
        <div className="bg-surface-card border border-border rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Target Viewport Snapshot</span>
            </div>
            {item.bounding_box && (
              <span className="text-[10px] font-mono text-indigo-400 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Box: {item.bounding_box.width}×{item.bounding_box.height} at ({item.bounding_box.x}, {item.bounding_box.y})
              </span>
            )}
          </div>

          {/* Screenshot Display Frame */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-[#050811] aspect-[16/10] flex items-center justify-center group">
            {item.screenshot_url ? (
              <img
                src={item.screenshot_url}
                alt="Target element screenshot"
                className="w-full h-full object-contain"
              />
            ) : (
              /* Simulated High-Res Canvas Representation of the target */
              <div className="w-full h-full p-4 flex flex-col justify-center items-center relative bg-gradient-to-br from-slate-900 to-[#070b16]">
                {/* Target highlight bounding box simulation */}
                <div className="relative p-3 rounded border-2 border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.35)] animate-pulse-subtle">
                  <div className="text-[11px] font-mono text-indigo-300 font-bold mb-1">
                    {item.target_selector}
                  </div>
                  <div className="text-xs text-white bg-indigo-600 px-3 py-1.5 rounded font-medium shadow">
                    {item.target_text_snippet || 'Selected Element'}
                  </div>
                  {/* Cardinal crosshairs */}
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
                  Target Bounding Area +200px Context
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DOM Inspector */}
        <DomInspector
          selector={item.target_selector}
          hierarchy={item.dom_hierarchy}
          metadata={item.element_metadata}
        />

        {/* Telemetry Grid */}
        <TelemetryGrid
          telemetry={item.telemetry}
          viewportWidth={item.viewport_width}
          viewportHeight={item.viewport_height}
          browser={item.browser}
          userAgent={item.user_agent}
          pixelRatio={item.pixel_ratio}
          pageUrl={item.page_url}
        />

        {/* Status Transitions & Actions */}
        <div className="bg-surface-card border border-border rounded-lg p-3.5 space-y-3 font-mono">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block">
            Workflow Actions
          </span>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={statusUpdating || item.status === 'in_progress'}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-surface hover:bg-surface-hover border border-border text-amber-400 font-medium transition-colors disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={statusUpdating || item.status === 'resolved'}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-surface hover:bg-surface-hover border border-border text-emerald-400 font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve</span>
            </button>
            <button
              onClick={() => handleStatusChange('archived')}
              disabled={statusUpdating || item.status === 'archived'}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-surface hover:bg-surface-hover border border-border text-slate-400 font-medium transition-colors disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setExportModal('linear')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#5E6AD2]/20 hover:bg-[#5E6AD2]/30 border border-[#5E6AD2]/40 text-[#A5ADF7] text-xs font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
              <span>{item.linear_issue_url ? 'View Linear Issue' : 'Push to Linear'}</span>
            </button>
            <button
              onClick={() => setExportModal('jira')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#0052CC]/20 hover:bg-[#0052CC]/30 border border-[#0052CC]/40 text-[#4C9AFF] text-xs font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
              <span>{item.jira_issue_key ? `Jira: ${item.jira_issue_key}` : 'Create Jira Ticket'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportModal && (
        <LinearJiraModal
          item={item}
          type={exportModal}
          onClose={() => setExportModal(null)}
          onSuccess={(updated) => {
            onUpdate(updated);
          }}
        />
      )}
    </div>
  );
};
