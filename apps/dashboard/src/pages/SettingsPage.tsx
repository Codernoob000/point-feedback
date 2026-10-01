import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Project } from '../types';
import { api } from '../api/client';
import { Copy, Check, Key, ShieldCheck, Code, Globe, Plus } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [origins, setOrigins] = useState<string>('https://acme-cloud.io, http://localhost:3000, http://localhost:5173');

  useEffect(() => {
    api.getProjects().then((projects) => {
      if (projects.length > 0) setProject(projects[0]);
    }).catch(console.error);
  }, []);

  const apiKey = project?.api_key || 'pf_live_98a72b610c144e88';

  const embedSnippet = `<!-- POINT.FEEDBACK SDK Integration -->
<script src="http://localhost:5174/dist/widget.umd.js"></script>
<script>
  PointFeedback.init({
    apiKey: "${apiKey}",
    position: "bottom-right",
    theme: "dark",
    voiceRecordingLimit: 10
  });
</script>`;

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg">
      <Header title="Project Settings & SDK" subtitle="Manage API keys, domain restrictions, and client install snippet" />

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl space-y-6">
        {/* Project Credentials */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Project API Credentials</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Project Name
              </label>
              <input
                type="text"
                readOnly
                value={project?.name || 'Linear / Acme Production App'}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Production Client Key (Public SDK Key)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 px-3 py-2 bg-[#050811] border border-border rounded-lg text-indigo-300 font-mono text-xs select-all focus:outline-none"
                />
                <button
                  onClick={copyApiKey}
                  className="px-3.5 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{apiKeyCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Script Snippet */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>HTML / React Embed Snippet</span>
            </div>
            <button
              onClick={copySnippet}
              className="px-3 py-1 text-xs font-mono rounded bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 transition-colors"
            >
              {snippetCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{snippetCopied ? 'Copied to Clipboard' : 'Copy Snippet'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Paste this snippet right before the closing <code className="text-indigo-300 font-mono">&lt;/body&gt;</code> tag on any web application.
          </p>

          <pre className="p-3.5 bg-[#050811] border border-border/80 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {embedSnippet}
          </pre>
        </div>

        {/* Allowed Origins (CORS Security) */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Allowed Domains & Origins</span>
          </div>

          <p className="text-xs text-slate-400">
            Comma-separated origins permitted to submit feedback using this API key. Use <code className="text-indigo-300 font-mono">*</code> for local testing.
          </p>

          <div className="space-y-2 font-mono text-xs">
            <input
              type="text"
              value={origins}
              onChange={(e) => setOrigins(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => alert('Allowed origins updated!')}
              className="px-3.5 py-1.5 bg-bg-elevated hover:bg-surface-hover text-slate-200 rounded border border-border transition-colors text-xs"
            >
              Save Origins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
