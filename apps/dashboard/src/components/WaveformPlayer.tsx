import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl?: string | null;
  duration?: number;
  transcript?: string | null;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl, duration = 5, transcript }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulated visual waveform bars
  const bars = [24, 45, 60, 85, 40, 75, 95, 60, 30, 80, 55, 90, 70, 45, 85, 100, 65, 40, 70, 50, 30, 65, 80, 45, 30];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= (duration || 5)) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // Demo playback simulation
      setIsPlaying(!isPlaying);
      if (currentTime >= (duration || 5)) setCurrentTime(0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progressPercent = Math.min(100, ((currentTime / (duration || 5)) * 100));

  return (
    <div className="bg-surface-card border border-border rounded-lg p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-medium text-slate-300">Voice Note Telemetry</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {currentTime.toFixed(1)}s / {(duration || 5.0).toFixed(1)}s
        </span>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          className="hidden"
        />
      )}

      {/* Waveform Visualization Bars */}
      <div
        className="h-10 flex items-center gap-[3px] px-2 py-1 bg-bg-elevated/70 rounded border border-border/50 cursor-pointer relative overflow-hidden"
        onClick={togglePlay}
        title="Click to play / pause voice recording"
      >
        {/* Progress Background Overlay */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-100 pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />

        {bars.map((h, i) => {
          const barProgress = (i / bars.length) * 100;
          const isPassed = barProgress <= progressPercent;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              style={{
                height: `${Math.max(15, h * (isPlaying ? 0.7 + Math.random() * 0.3 : 0.8))}%`,
              }}
            />
          );
        })}
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-sm transition-colors"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
        </button>

        <button
          onClick={() => {
            setCurrentTime(0);
            if (audioRef.current) audioRef.current.currentTime = 0;
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-surface-hover transition-colors"
          title="Restart audio"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Audio Transcript Card */}
      {transcript && (
        <div className="mt-2 text-xs bg-bg/70 border border-border/60 rounded p-2 text-slate-300 leading-relaxed font-sans">
          <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-0.5">
            Voice Transcript
          </span>
          "{transcript}"
        </div>
      )}
    </div>
  );
};
