import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { ExternalLink, Sparkles, Crosshair, Play } from 'lucide-react';

export const WidgetDemoPage: React.FC = () => {
  useEffect(() => {
    // Dynamically initialize PointFeedback widget in the sandbox
    const initScript = async () => {
      try {
        // Import widget dynamically
        const { PointFeedback } = await import('../../../widget/src/index');
        PointFeedback.init({
          apiKey: 'pf_live_default_key_2026',
          apiUrl: '/api/v1',
          position: 'bottom-right'
        });
      } catch (e) {
        console.warn('Widget sandbox init note:', e);
      }
    };

    initScript();

    return () => {
      // Clean up widget when navigating away
      const el = document.getElementById('point-feedback-root');
      if (el) el.remove();
      const highlight = document.getElementById('pf-highlight-box');
      if (highlight) highlight.remove();
      const tooltip = document.getElementById('pf-inspector-tooltip');
      if (tooltip) tooltip.remove();
    };
  }, []);

  const triggerWidgetInspection = () => {
    const trigger = document.getElementById('pf-launcher-trigger');
    if (trigger) {
      trigger.click();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg">
      <Header
        title="Live Widget Sandbox Testbed"
        subtitle="Test pointing, speaking, and submitting visual bug telemetry"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Banner with action button */}
        <div className="bg-gradient-to-r from-primary/20 via-surface to-bg border border-primary/40 rounded-xl p-5 flex items-center justify-between shadow-glow-primary">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Interactive Sandbox Environment</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              The floating widget launcher is active in the bottom right corner. Click it to enter{' '}
              <strong className="text-sky-300 font-mono">POINT & SPEAK MODE</strong>, hover over any UI element below, leave a voice note, and submit!
            </p>
          </div>

          <button
            onClick={triggerWidgetInspection}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-mono font-medium rounded-lg shadow-lg shadow-indigo-500/25 transition-all shrink-0"
          >
            <Crosshair className="w-4 h-4" />
            <span>Launch Point & Speak Mode</span>
          </button>
        </div>

        {/* Sample Application UI (Simulated SaaS Store & Billing) */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <div className="border-b border-border/80 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-1">
                SAMPLE CLIENT APPLICATION
              </span>
              <h3 className="text-lg font-bold text-white">Acme Cloud Infrastructure Platform</h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-bg text-slate-400 font-mono text-xs border border-border">
              https://acme-cloud.io/pricing
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-3 gap-5">
            {/* Hobby Card */}
            <div className="bg-bg-elevated border border-border rounded-lg p-5 space-y-4" id="hobby-plan-card">
              <div>
                <h4 className="font-semibold text-white text-base">Hobby Tier</h4>
                <p className="text-xs text-slate-400 mt-1">For independent developers & prototyping</p>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-200">
                $0 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li className="flex items-center gap-1.5 text-slate-300">✓ 5 Serverless functions</li>
                <li className="flex items-center gap-1.5 text-slate-300">✓ 1 GB Vector store</li>
                <li className="flex items-center gap-1.5 text-slate-300">✓ Community Discord</li>
              </ul>
              <button
                id="btn-select-hobby"
                className="w-full py-2 px-3 rounded bg-surface hover:bg-surface-hover border border-border text-slate-300 text-xs font-medium transition-colors"
              >
                Current Plan
              </button>
            </div>

            {/* Pro Card (Recommended) */}
            <div
              className="bg-bg-elevated border-2 border-primary rounded-lg p-5 space-y-4 relative shadow-glow-primary"
              id="pro-plan-card"
            >
              <div className="absolute -top-2.5 right-4 bg-primary text-white text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Production Pro</h4>
                <p className="text-xs text-slate-400 mt-1">For high-throughput applications</p>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-300">
                $99 <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li className="flex items-center gap-1.5 text-slate-200">✓ Unlimited Edge Deployments</li>
                <li className="flex items-center gap-1.5 text-slate-200">✓ 50 GB High-Speed Vector DB</li>
                <li className="flex items-center gap-1.5 text-slate-200">✓ 99.99% Guaranteed SLA</li>
                <li className="flex items-center gap-1.5 text-slate-200">✓ Dedicated Slack Connect</li>
              </ul>
              <button
                id="checkout"
                data-testid="checkout-trigger"
                className="w-full py-2.5 px-3 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Enterprise Card */}
            <div className="bg-bg-elevated border border-border rounded-lg p-5 space-y-4" id="enterprise-plan-card">
              <div>
                <h4 className="font-semibold text-white text-base">Enterprise Grid</h4>
                <p className="text-xs text-slate-400 mt-1">Custom VPCs, dedicated bare-metal</p>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-200">
                Custom
              </div>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li className="flex items-center gap-1.5 text-slate-300">✓ SOC2 Type II Certified</li>
                <li className="flex items-center gap-1.5 text-slate-300">✓ SAML 2.0 / Okta SSO</li>
                <li className="flex items-center gap-1.5 text-slate-300">✓ Dedicated Account Manager</li>
              </ul>
              <button
                id="btn-contact-sales"
                className="w-full py-2 px-3 rounded bg-surface hover:bg-surface-hover border border-border text-slate-300 text-xs font-medium transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
