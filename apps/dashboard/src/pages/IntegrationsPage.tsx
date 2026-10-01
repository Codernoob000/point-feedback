import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Check, ExternalLink, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const [linearConnected, setLinearConnected] = useState(true);
  const [jiraConnected, setJiraConnected] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [testingSlack, setTestingSlack] = useState(false);
  const [slackSuccess, setSlackSuccess] = useState(false);

  const testSlack = () => {
    setTestingSlack(true);
    setTimeout(() => {
      setTestingSlack(false);
      setSlackSuccess(true);
      setTimeout(() => setSlackSuccess(false), 2500);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg">
      <Header title="Developer Tool Integrations" subtitle="Connect bug pipelines to Linear, Jira, and Slack" />

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        {/* Linear Integration Card */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/30 flex items-center justify-center text-[#A5ADF7] font-bold text-sm">
                <div className="w-4 h-4 rounded-full bg-[#5E6AD2]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Linear
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Automatically convert visual feedback into actionable Linear issues with target screenshots, DOM hierarchy, and viewport telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setLinearConnected(!linearConnected)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                linearConnected
                  ? 'bg-bg-elevated text-slate-300 border-border hover:bg-surface-hover'
                  : 'bg-primary text-white border-primary-hover'
              }`}
            >
              {linearConnected ? 'Configure Team' : 'Connect Linear'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-bg-elevated/70 rounded-lg border border-border/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Target Team
              </span>
              <span className="text-indigo-300 font-semibold">Core Product (ENG)</span>
            </div>
            <div className="p-3 bg-bg-elevated/70 rounded-lg border border-border/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Default Label
              </span>
              <span className="text-emerald-400 font-semibold">visual-feedback</span>
            </div>
          </div>
        </div>

        {/* Jira Software Card */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0052CC]/10 border border-[#0052CC]/30 flex items-center justify-center text-[#4C9AFF] font-bold text-sm">
                <div className="w-4 h-4 rounded-full bg-[#0052CC]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Jira Software
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Connected
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Dispatch developer bug reports with full markdown matrices directly to Atlassian Jira projects.
                </p>
              </div>
            </div>

            <button
              onClick={() => setJiraConnected(!jiraConnected)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-bg-elevated text-slate-300 border border-border hover:bg-surface-hover transition-colors"
            >
              Configure Project
            </button>
          </div>

          <div className="p-3 bg-bg-elevated/70 rounded-lg border border-border/60 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">Instance: <span className="text-slate-200">acme-corp.atlassian.net</span></span>
            <span className="text-slate-400">Project Key: <span className="text-sky-400">PF</span></span>
          </div>
        </div>

        {/* Slack Webhook Alerts */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4A154B]/20 border border-[#E01E5A]/30 flex items-center justify-center text-[#E01E5A] font-bold text-base">
              #
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Slack / Discord Realtime Webhook</h3>
              <p className="text-xs text-slate-400">
                Receive instant notifications when angry or critical issues are reported.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Incoming Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={testSlack}
                disabled={testingSlack}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-mono font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                {testingSlack ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : slackSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{slackSuccess ? 'Sent!' : 'Send Test'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
