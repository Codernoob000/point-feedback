import React, { useState } from 'react';
import { ElementMetadata } from '../types';
import { Copy, Check, ChevronRight, Code2 } from 'lucide-react';

interface DomInspectorProps {
  selector: string;
  hierarchy?: string[];
  metadata?: ElementMetadata;
}

export const DomInspector: React.FC<DomInspectorProps> = ({ selector, hierarchy = [], metadata }) => {
  const [copied, setCopied] = useState(false);

  const copySelector = () => {
    navigator.clipboard.writeText(selector);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tag = metadata?.tag?.toLowerCase() || selector.split(' ')[0].split('#')[0].toLowerCase() || 'element';
  const elementId = metadata?.id || (selector.includes('#') ? selector.split('#')[1].split('.')[0].split(' ')[0] : undefined);
  const classes = metadata?.classes || '';

  return (
    <div className="bg-surface-card border border-border rounded-lg p-3.5 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>DOM Target Node</span>
        </div>
        <button
          onClick={copySelector}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Selector'}</span>
        </button>
      </div>

      {/* Target DOM Element Code Block */}
      <div className="bg-[#050811] border border-border/80 rounded p-2.5 overflow-x-auto text-[12px] leading-relaxed text-slate-300">
        <span className="text-slate-500">&lt;</span>
        <span className="text-rose-400 font-bold">{tag}</span>
        {elementId && (
          <>
            <span className="text-slate-400"> id</span>
            <span className="text-slate-500">=</span>
            <span className="text-emerald-300">"{elementId}"</span>
          </>
        )}
        {classes && (
          <>
            <span className="text-slate-400"> class</span>
            <span className="text-slate-500">=</span>
            <span className="text-amber-300">"{classes}"</span>
          </>
        )}
        {metadata?.attributes &&
          Object.entries(metadata.attributes).map(([k, v]) => (
            <span key={k}>
              <span className="text-slate-400"> {k}</span>
              <span className="text-slate-500">=</span>
              <span className="text-sky-300">"{v}"</span>
            </span>
          ))}
        <span className="text-slate-500">&gt;</span>
        {metadata?.text && (
          <span className="text-slate-200 font-sans block pl-4 my-1 border-l border-slate-700">
            {metadata.text.length > 80 ? `${metadata.text.substring(0, 80)}...` : metadata.text}
          </span>
        )}
        <span className="text-slate-500">&lt;/</span>
        <span className="text-rose-400 font-bold">{tag}</span>
        <span className="text-slate-500">&gt;</span>
      </div>

      {/* Hierarchy Path Breadcrumbs */}
      <div>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
          DOM Ancestry Hierarchy
        </span>
        <div className="flex flex-wrap items-center gap-1 text-[11px] bg-bg/50 p-2 rounded border border-border/40">
          {(hierarchy && hierarchy.length > 0 ? hierarchy : selector.split(' > ')).map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  idx === arr.length - 1
                    ? 'bg-primary/20 text-indigo-300 font-semibold border border-primary/40'
                    : 'text-slate-400 bg-surface/50'
                }`}
              >
                {item}
              </span>
              {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
