import React, { useState } from 'react';
import { FeedbackItem } from '../types';
import { X, Check, ExternalLink, Sparkles, Send } from 'lucide-react';
import { api } from '../api/client';

interface LinearJiraModalProps {
  item: FeedbackItem;
  type: 'linear' | 'jira';
  onClose: () => void;
  onSuccess: (updatedItem: FeedbackItem) => void;
}

export const LinearJiraModal: React.FC<LinearJiraModalProps> = ({ item, type, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [ticketKey, setTicketKey] = useState<string | null>(
    (type === 'linear' ? item.linear_issue_url : item.jira_issue_key) || null
  );

  const title = item.ai_summary || `Issue on ${item.target_selector}`;
  const priority = item.priority?.toUpperCase() || 'MEDIUM';
  const category = item.category || 'UI Bug';

  const generatedDescription = `## 🐞 Bug Report via POINT.FEEDBACK

**Target Selector**: \`${item.target_selector}\`
**Category**: ${category}
**Priority**: ${priority}
**User Sentiment**: ${item.sentiment === 'angry' ? '😠 Frustrated' : item.sentiment === 'loved' ? '😍 Delighted' : '😐 Neutral'}

### User Feedback
> "${item.comment}"

${item.audio_transcript ? `### 🎙️ Voice Transcript\n> "${item.audio_transcript}"\n` : ''}

### 🖥️ Client Telemetry
| Metric | Value |
| --- | --- |
| Viewport | ${item.viewport_width} x ${item.viewport_height} px |
| Browser | ${item.browser || item.telemetry?.browser || 'Chrome'} |
| Pixel Ratio | ${item.pixel_ratio || 1.0}x DPR |
| Page URL | ${item.page_url} |

### 🌳 DOM Ancestry
\`\`\`
${item.dom_hierarchy?.join(' > ') || item.target_selector}
\`\`\`
`;

  const handleExport = async () => {
    setLoading(true);
    try {
      if (type === 'linear') {
        const res = await api.pushToLinear(item.id);
        setTicketKey(res.linear_issue_url);
        onSuccess({ ...item, linear_issue_url: res.linear_issue_url });
      } else {
        const res = await api.pushToJira(item.id);
        setTicketKey(res.jira_issue_key);
        onSuccess({ ...item, jira_issue_key: res.jira_issue_key });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg-elevated/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${type === 'linear' ? 'bg-[#5E6AD2]' : 'bg-[#0052CC]'}`} />
            <h3 className="font-semibold text-sm tracking-wide">
              {type === 'linear' ? 'Export to Linear Team Backlog' : 'Create Jira Software Issue'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Issue Title
            </label>
            <input
              type="text"
              readOnly
              value={title}
              className="w-full px-3 py-2 bg-bg border border-border rounded-md text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </span>
              <div className="px-3 py-1.5 bg-bg border border-border rounded font-mono text-amber-400 font-semibold">
                {priority}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <div className="px-3 py-1.5 bg-bg border border-border rounded font-mono text-indigo-300">
                {category}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Formatted Markdown Payload
            </label>
            <textarea
              readOnly
              rows={8}
              value={generatedDescription}
              className="w-full p-2.5 bg-[#050811] border border-border/80 rounded-md text-[11px] font-mono text-slate-300 leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {ticketKey && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                <Check className="w-4 h-4" />
                <span>Ticket successfully created: {ticketKey}</span>
              </div>
              {type === 'linear' && (
                <a
                  href={ticketKey}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-border bg-bg-elevated/40">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-md hover:bg-surface-hover transition-colors"
          >
            Close
          </button>
          {!ticketKey ? (
            <button
              onClick={handleExport}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md text-white shadow-md transition-all ${
                type === 'linear'
                  ? 'bg-[#5E6AD2] hover:bg-[#4E5AC0]'
                  : 'bg-[#0052CC] hover:bg-[#0747A6]'
              }`}
            >
              {loading ? (
                <span>Exporting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Export</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
