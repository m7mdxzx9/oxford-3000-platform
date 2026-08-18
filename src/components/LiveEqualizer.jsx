import React from 'react';

/**
 * Feature 67: Live Equalizer Sound Wave Visualizer
 * Renders dynamic animated audio frequency bars during speech or TTS playback.
 */
const LiveEqualizer = React.memo(function LiveEqualizer({ isPlaying = false, barColor = 'bg-cyan-500', barCount = 5 }) {
  if (!isPlaying) {
    return (
      <div className="flex items-center gap-1 h-5 px-1 opacity-40">
        {[...Array(barCount)].map((_, i) => (
          <div key={i} className="w-1 h-1.5 rounded-full bg-current" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 h-6 px-1" title="Audio Equalizer Playing">
      <div className={`w-1 rounded-full ${barColor} eq-bar eq-bar-1`} />
      <div className={`w-1 rounded-full ${barColor} eq-bar eq-bar-2`} />
      <div className={`w-1 rounded-full ${barColor} eq-bar eq-bar-3`} />
      <div className={`w-1 rounded-full ${barColor} eq-bar eq-bar-4`} />
      <div className={`w-1 rounded-full ${barColor} eq-bar eq-bar-5`} />
    </div>
  );
});

export default LiveEqualizer;
