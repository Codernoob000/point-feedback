export interface Telemetry {
  url: string;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  browser: string;
  userAgent: string;
  os: string;
  language: string;
  referrer: string;
  timestamp: string;
}

export function collectTelemetry(): Telemetry {
  const ua = navigator.userAgent;
  let browser = 'Unknown';

  if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('Chrome') && !ua.includes('Edg/')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  }

  let os = 'Unknown OS';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';

  return {
    url: window.location.href,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    browser,
    userAgent: ua,
    os,
    language: navigator.language || 'en-US',
    referrer: document.referrer || '',
    timestamp: new Date().toISOString()
  };
}
