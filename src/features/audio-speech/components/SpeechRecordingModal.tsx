'use client';

import * as React from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AudioEngineService } from '../services/audioService';
import { SpeechEvaluationResult } from '../types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SpeechRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetText: string;
  ipa?: string;
  arabicTranslation?: string;
}

export function SpeechRecordingModal({
  isOpen,
  onClose,
  targetText,
  ipa,
  arabicTranslation,
}: SpeechRecordingModalProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [spokenTranscript, setSpokenTranscript] = React.useState('');
  const [evaluation, setEvaluation] = React.useState<SpeechEvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const addXp = useStore((state) => state.addXp);

  React.useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setSpokenTranscript('');
      setEvaluation(null);
      setErrorMsg(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setEvaluation(null);
    setSpokenTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        const evalResult = AudioEngineService.evaluateSpeech(targetText, transcript);
        setEvaluation(evalResult);
        if (evalResult.passed) {
          addXp(30);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Recognition start error:', e);
      setIsRecording(false);
      setErrorMsg('Could not access microphone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>AI Speech Pronunciation Studio</span>
          </DialogTitle>
          <DialogDescription>
            Speak the word or sentence into your microphone for real-time AI phonetic scoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Target Word Card */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border text-center space-y-1">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Target Pronunciation
            </p>
            <h2 className="text-2xl font-bold font-heading text-primary ltr-isolate">
              {targetText}
            </h2>
            {ipa && <p className="text-sm font-mono text-muted-foreground ltr-isolate">{ipa}</p>}
            {arabicTranslation && (
              <p className="text-sm text-foreground/80 rtl-text mt-1">{arabicTranslation}</p>
            )}

            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => AudioEngineService.playWord(targetText, 0.9)}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" /> Listen Model Audio
              </Button>
            </div>
          </div>

          {/* Recording Status & Wave */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border bg-surface text-center space-y-4">
            <button
              onClick={isRecording ? stopListening : startListening}
              className={cn(
                'h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer',
                isRecording
                  ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30'
                  : 'bg-primary text-white hover:scale-105 shadow-primary/20'
              )}
            >
              {isRecording ? <Mic className="h-8 w-8 animate-bounce" /> : <Mic className="h-8 w-8" />}
            </button>
            <p className="text-sm font-medium text-muted-foreground">
              {isRecording
                ? 'Listening... Speak now!'
                : 'Click the microphone to start speaking'}
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Evaluation Results */}
          {evaluation && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Evaluation Score</span>
                <span
                  className={cn(
                    'text-lg font-bold px-3 py-0.5 rounded-full',
                    evaluation.overallScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : evaluation.overallScore >= 50
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/30'
                  )}
                >
                  {evaluation.overallScore}%
                </span>
              </div>

              {/* Spoken text breakdown */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">What was detected:</p>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/40 ltr-isolate">
                  {evaluation.breakdown.map((item, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold',
                        item.status === 'correct'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      )}
                      title={item.phoneticFeedback}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>
              </div>

              {evaluation.passed ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Excellent pronunciation! +30 XP added.</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Keep practicing! Listen to the model audio and match the syllable stress.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
