import React from 'react';

interface BrandIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ size = 28, className = '', glow = false }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${glow ? 'shadow-glow-primary' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="focalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#4F46E5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Circular Reticle (Crosshair) */}
        <circle
          cx="50"
          cy="50"
          r="43"
          stroke="#4F46E5"
          strokeWidth="3.5"
          strokeOpacity="0.6"
          strokeDasharray="5 3"
        />
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="#6366F1"
          strokeWidth="1.8"
          strokeOpacity="0.4"
        />

        {/* Crosshair Cardinal Reticle Lines */}
        <line x1="50" y1="4" x2="50" y2="18" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="82" x2="50" y2="96" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="4" y1="50" x2="18" y2="50" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="82" y1="50" x2="96" y2="50" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />

        {/* Audio Waveform Bars */}
        <rect x="30" y="44" width="4" height="12" rx="2" fill="#818CF8" />
        <rect x="38" y="36" width="4" height="28" rx="2" fill="#6366F1" />
        <rect x="58" y="36" width="4" height="28" rx="2" fill="#6366F1" />
        <rect x="66" y="44" width="4" height="12" rx="2" fill="#818CF8" />

        {/* Center Focal Point & Glow Dot */}
        <circle cx="50" cy="50" r="14" fill="url(#focalGlow)" />
        <circle cx="50" cy="50" r="4.5" fill="#38BDF8" />
        <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
