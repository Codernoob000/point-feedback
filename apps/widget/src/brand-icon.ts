export const BRAND_ICON_SVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="pf-brand-icon">
  <defs>
    <radialGradient id="pfFocalGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#4F46E5" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Outer Crosshair Circle -->
  <circle cx="50" cy="50" r="43" stroke="#4F46E5" stroke-width="3.5" stroke-opacity="0.6" stroke-dasharray="5 3" />
  <circle cx="50" cy="50" r="32" stroke="#6366F1" stroke-width="1.8" stroke-opacity="0.4" />
  <!-- Cardinal Crosshair Reticles -->
  <line x1="50" y1="4" x2="50" y2="18" stroke="#818CF8" stroke-width="3.5" stroke-linecap="round" />
  <line x1="50" y1="82" x2="50" y2="96" stroke="#818CF8" stroke-width="3.5" stroke-linecap="round" />
  <line x1="4" y1="50" x2="18" y2="50" stroke="#818CF8" stroke-width="3.5" stroke-linecap="round" />
  <line x1="82" y1="50" x2="96" y2="50" stroke="#818CF8" stroke-width="3.5" stroke-linecap="round" />
  <!-- Audio Waveform Bars -->
  <rect x="30" y="44" width="4" height="12" rx="2" fill="#818CF8" />
  <rect x="38" y="36" width="4" height="28" rx="2" fill="#6366F1" />
  <rect x="58" y="36" width="4" height="28" rx="2" fill="#6366F1" />
  <rect x="66" y="44" width="4" height="12" rx="2" fill="#818CF8" />
  <!-- Center Focal Point -->
  <circle cx="50" cy="50" r="14" fill="url(#pfFocalGlow)" />
  <circle cx="50" cy="50" r="4.5" fill="#38BDF8" />
  <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
</svg>
`;
