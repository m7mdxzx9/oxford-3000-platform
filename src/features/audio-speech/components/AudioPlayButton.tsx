'use client';

import * as React from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioEngineService } from '../services/audioService';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AudioPlayButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'accent';
  label?: string;
}

export function AudioPlayButton({
  text,
  className,
  size = 'icon',
  variant = 'outline',
  label,
}: AudioPlayButtonProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioPlaybackRate = useStore((state) => state.audioPlaybackRate);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      AudioEngineService.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      await AudioEngineService.playWord(text, audioPlaybackRate);
    } catch {
      // Audio error handled gracefully
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePlay}
      className={cn('transition-all', isPlaying && 'ring-2 ring-primary text-primary', className)}
      title="Play Pronunciation"
    >
      {isPlaying ? (
        <Volume2 className="h-4 w-4 animate-pulse text-primary" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {label && <span className="ml-2 text-xs">{label}</span>}
    </Button>
  );
}
