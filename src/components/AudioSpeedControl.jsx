import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25];

/**
 * Audio Playback Speed Control Pill Selector.
 * Persists preferred playback speed in localStorage and updates global audio options.
 */
export const AudioSpeedControl = ({ speed, onSpeedChange, compact = false }) => {
  const [currentSpeed, setCurrentSpeed] = useState(() => {
    if (speed !== undefined) return speed;
    try {
      const stored = localStorage.getItem('oxford3000_audio_speed');
      return stored ? parseFloat(stored) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  useEffect(() => {
    if (speed !== undefined && speed !== currentSpeed) {
      setCurrentSpeed(speed);
    }
  }, [speed]);

  const handleSelectSpeed = (newSpeed, e) => {
    if (e) e.stopPropagation();
    setCurrentSpeed(newSpeed);
    try {
      localStorage.setItem('oxford3000_audio_speed', String(newSpeed));
    } catch (err) {}
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    }
  };

  const handleCycleSpeed = (e) => {
    if (e) e.stopPropagation();
    const currentIndex = SPEED_OPTIONS.findIndex((v) => Math.abs(v - currentSpeed) < 0.05);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIndex];
    handleSelectSpeed(newSpeed, e);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCycleSpeed}
        className="px-2 py-1 rounded-xl text-[10px] font-black border transition-all bg-cyan-500/15 text-cyan-950 dark:text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25 active:scale-95 shadow-sm shrink-0 flex items-center gap-1"
        title="انقر لتغيير سرعة النطق الصوتي (Click to cycle audio speed)"
      >
        <span>⚡ {currentSpeed}x</span>
      </button>
    );
  }

  return (
    <div dir="ltr" className="ltr-isolate inline-flex items-center gap-1 p-1 rounded-xl border bg-slate-100 dark:bg-slate-950/60 border-slate-300 dark:border-slate-800/80 shadow-sm select-none shrink-0">
      {!compact && (
        <span className="flex items-center gap-1 text-[10px] font-black text-slate-700 dark:text-slate-400 px-1">
          <Gauge className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>Speed:</span>
        </span>
      )}

      {SPEED_OPTIONS.map((val) => {
        const isActive = Math.abs(currentSpeed - val) < 0.05;
        return (
          <button
            key={val}
            type="button"
            onClick={(e) => handleSelectSpeed(val, e)}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black transition-all active:scale-90 ${
              isActive
                ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-400 font-extrabold'
                : 'text-slate-800 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
            title={`Set audio playback speed to ${val}x`}
          >
            {val}x
          </button>
        );
      })}
    </div>
  );
};

export default AudioSpeedControl;
