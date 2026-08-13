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
        className="px-2 py-1 rounded-xl text-[10px] font-black border transition-all theme-btn-secondary hover:brightness-110 active:scale-95 shadow-sm shrink-0 flex items-center gap-1"
        title="انقر لتغيير سرعة النطق الصوتي (Click to cycle audio speed)"
      >
        <span>⚡ {currentSpeed}x</span>
      </button>
    );
  }

  return (
    <div dir="ltr" className="ltr-isolate inline-flex items-center gap-1 p-1 rounded-xl border bg-black/5 shadow-sm select-none shrink-0">
      {!compact && (
        <span className="flex items-center gap-1 text-[10px] font-black opacity-75 px-1">
          <Gauge className="w-3 h-3 text-cyan-500" />
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
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all border active:scale-90 ${
              isActive
                ? 'theme-btn-primary shadow-sm'
                : 'theme-btn-secondary opacity-70 hover:opacity-100'
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
