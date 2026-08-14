import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

/**
 * Feature 10: Electromagnetic Pulsing Microphone Button
 * Renders expanding electromagnetic wave rings during active audio recording.
 */
export default function ElectromagneticMic({
  isRecording = false,
  onClick,
  disabled = false,
  size = 'md', // sm, md, lg
  label = '',
}) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      {/* Expanding Electromagnetic Pulse Rings when recording */}
      {isRecording && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-red-500/60 electromagnetic-pulse-ring pointer-events-none" />
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/50 electromagnetic-pulse-ring pointer-events-none"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-purple-500/40 electromagnetic-pulse-ring pointer-events-none"
            style={{ animationDelay: '1s' }}
          />
        </>
      )}

      {/* Main Microphone Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
          sizeClasses[size] || sizeClasses.md
        } ${
          isRecording
            ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/50 scale-110'
            : 'theme-btn-primary hover:scale-105 active:scale-95'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'إيقاف التسجيل الصوتي' : 'ابدأ التحدث والتسجيل الصوتي'}
        aria-label="Microphone record button"
      >
        {isRecording ? (
          <Square className={`${iconSizes[size]} fill-current animate-pulse`} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {label && (
        <span className="text-[11px] font-bold mt-2 opacity-80 font-arabic text-center">
          {label}
        </span>
      )}
    </div>
  );
}
