'use client';

import * as React from 'react';
import {
  Volume2,
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Languages,
  BookOpen,
  Award,
  Zap,
  Star,
  Check,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LexiconItem } from '@/features/lexicon/types';
import { extractArabicMeanings } from '@/lib/arabic-search';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { SpeechEvaluationResult } from '@/features/audio-speech/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export type PracticeCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface WordPracticeDialogProps {
  word: LexiconItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WordPracticeDialog({ word, isOpen, onClose }: WordPracticeDialogProps) {
  const [selectedCefr, setSelectedCefr] = React.useState<PracticeCefrLevel>('B1');
  const [generatedSentence, setGeneratedSentence] = React.useState<{
    english: string;
    arabic: string;
  } | null>(null);
  const [isGeneratingSentence, setIsGeneratingSentence] = React.useState(false);
  const [showSentenceArabic, setShowSentenceArabic] = React.useState(true);

  // Pronunciation Evaluation 1: Target Word
  const [isWordRecording, setIsWordRecording] = React.useState(false);
  const [wordEvaluation, setWordEvaluation] = React.useState<SpeechEvaluationResult | null>(null);
  const [wordErrorMsg, setWordErrorMsg] = React.useState<string | null>(null);

  // Pronunciation Evaluation 2: Sentence
  const [isSentenceRecording, setIsSentenceRecording] = React.useState(false);
  const [sentenceEvaluation, setSentenceEvaluation] = React.useState<SpeechEvaluationResult | null>(null);
  const [sentenceErrorMsg, setSentenceErrorMsg] = React.useState<string | null>(null);

  const wordRecognitionRef = React.useRef<any>(null);
  const sentenceRecognitionRef = React.useRef<any>(null);

  const audioRate = useStore((state) => state.audioPlaybackRate);
  const addXp = useStore((state) => state.addXp);
  const masteredWordIds = useStore((state) => state.masteredWordIds);
  const favoriteWordIds = useStore((state) => state.favoriteWordIds);
  const toggleMastered = useStore((state) => state.toggleMastered);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  // Generate initial contextual sentence whenever the word changes
  React.useEffect(() => {
    if (word && isOpen) {
      generateContextualSentence(word.word, (word.cefr as PracticeCefrLevel) || 'B1');
      setSelectedCefr((word.cefr as PracticeCefrLevel) || 'B1');
      setWordEvaluation(null);
      setSentenceEvaluation(null);
      setWordErrorMsg(null);
      setSentenceErrorMsg(null);
    }
  }, [word, isOpen]);

  // Clean up recording on unmount / close
  React.useEffect(() => {
    if (!isOpen) {
      stopWordRecording();
      stopSentenceRecording();
    }
  }, [isOpen]);

  const generateContextualSentence = async (term: string, level: PracticeCefrLevel) => {
    setIsGeneratingSentence(true);
    // Simulate / execute level-appropriate sentence synthesis
    await new Promise((r) => setTimeout(r, 300));

    const sentenceTemplates: Record<PracticeCefrLevel, { english: string; arabic: string }> = {
      A1: {
        english: `I see a ${term} every day in my classroom.`,
        arabic: `أرى ${term} كل يوم في فصلي الدراسي.`,
      },
      A2: {
        english: `Can you please help me understand how this ${term} works?`,
        arabic: `هل يمكنك من فضلك مساعدتي في فهم كيف يعمل هذا (${term})؟`,
      },
      B1: {
        english: `Developing a clear understanding of ${term} requires consistent daily practice and curiosity.`,
        arabic: `يتطلب تطوير فهم واضح لـ (${term}) ممارسة يومية مستمرة وفضولاً معرفياً.`,
      },
      B2: {
        english: `The team analyzed the complex dynamics to ensure ${term} was effectively integrated into the workflow.`,
        arabic: `قام الفريق بتحليل الديناميكيات المعقدة لضمان دمج (${term}) بفعالية في سير العمل.`,
      },
      C1: {
        english: `A profound comprehension of ${term} empowers professionals to navigate multifaceted organizational challenges seamlessly.`,
        arabic: `الفهم العميق لـ (${term}) يمكّن المهنيين من التعامل مع التحديات التنظيمية متعددة الأوجه بسلاسة.`,
      },
      C2: {
        english: `The quintessential manifestation of ${term} demonstrates an exquisite synthesis of empirical rigor and nuanced intuition.`,
        arabic: `التجلي الجوهري لـ (${term}) يُظهر اندماجاً رائعاً بين الدقة التجريبية والحدس الدقيق.`,
      },
    };

    const chosen = sentenceTemplates[level] || sentenceTemplates.B1;
    setGeneratedSentence(chosen);
    setSentenceEvaluation(null);
    setIsGeneratingSentence(false);
  };

  // --- Pronunciation Engine 1: Target Word ---
  const startWordRecording = () => {
    if (!word) return;
    setWordErrorMsg(null);
    setWordEvaluation(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setWordErrorMsg('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsWordRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const result = AudioEngineService.evaluateSpeech(word.word, transcript);
        setWordEvaluation(result);
        if (result.passed) addXp(25);
      };
      recognition.onerror = (event: any) => {
        setIsWordRecording(false);
        if (event.error !== 'no-speech') setWordErrorMsg(`Microphone: ${event.error}`);
      };
      recognition.onend = () => setIsWordRecording(false);

      wordRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsWordRecording(false);
      setWordErrorMsg('Microphone access denied.');
    }
  };

  const stopWordRecording = () => {
    if (wordRecognitionRef.current) {
      try {
        wordRecognitionRef.current.stop();
      } catch {}
    }
    setIsWordRecording(false);
  };

  // --- Pronunciation Engine 2: Sentence ---
  const startSentenceRecording = () => {
    if (!generatedSentence) return;
    setSentenceErrorMsg(null);
    setSentenceEvaluation(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSentenceErrorMsg('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsSentenceRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const result = AudioEngineService.evaluateSpeech(generatedSentence.english, transcript);
        setSentenceEvaluation(result);
        if (result.passed) addXp(50);
      };
      recognition.onerror = (event: any) => {
        setIsSentenceRecording(false);
        if (event.error !== 'no-speech') setSentenceErrorMsg(`Microphone: ${event.error}`);
      };
      recognition.onend = () => setIsSentenceRecording(false);

      sentenceRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsSentenceRecording(false);
      setSentenceErrorMsg('Microphone access denied.');
    }
  };

  const stopSentenceRecording = () => {
    if (sentenceRecognitionRef.current) {
      try {
        sentenceRecognitionRef.current.stop();
      } catch {}
    }
    setIsSentenceRecording(false);
  };

  if (!word) return null;

  const isMastered = masteredWordIds.includes(word.id);
  const isFavorite = favoriteWordIds.includes(word.id);
  const meanings = extractArabicMeanings(word.arabic);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant={
                    word.cefr === 'A1'
                      ? 'a1'
                      : word.cefr === 'A2'
                      ? 'a2'
                      : word.cefr === 'B1'
                      ? 'b1'
                      : 'b2'
                  }
                  className="font-mono text-xs px-2.5 py-0.5"
                >
                  CEFR {word.cefr}
                </Badge>
                <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                  {word.pos}
                </span>
              </div>
              <DialogTitle className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight ltr-isolate">
                {word.word}
              </DialogTitle>
              <p className="text-sm font-mono text-muted-foreground ltr-isolate mt-0.5">
                {word.ipa}
              </p>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <Button
                variant={isFavorite ? 'accent' : 'outline'}
                size="icon"
                onClick={() => toggleFavorite(word.id)}
                title={isFavorite ? 'Starred Favorite' : 'Add to Favorites'}
                className="h-9 w-9"
              >
                <Star className={cn('h-4 w-4', isFavorite && 'fill-current text-amber-500')} />
              </Button>
              <Button
                variant={isMastered ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleMastered(word.id)}
                className="h-9 text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Section 1: Meaning Stack Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Arabic Meaning Stack & Synonyms
            </h4>
            <div className="flex flex-wrap gap-2">
              {meanings.map((meaning, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm rtl-text shadow-sm"
                >
                  {meaning}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Word Pronunciation Drill */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">Target Word Pronunciation</h4>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => AudioEngineService.playWord(word.word, audioRate)}
                className="h-7 text-xs gap-1.5"
              >
                <Volume2 className="h-3.5 w-3.5" /> Listen Native
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={isWordRecording ? stopWordRecording : startWordRecording}
                className={cn(
                  'gap-2 text-xs font-bold transition-all',
                  isWordRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                <Mic className="h-4 w-4" />
                {isWordRecording ? 'Listening... Tap to Stop' : 'Record Word Pronunciation'}
              </Button>

              {wordEvaluation && (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-full',
                      wordEvaluation.overallScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : wordEvaluation.overallScore >= 50
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-red-500/20 text-red-700 dark:text-red-300'
                    )}
                  >
                    Score: {wordEvaluation.overallScore}%
                  </span>
                  {wordEvaluation.passed && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> +25 XP
                    </span>
                  )}
                </div>
              )}
            </div>

            {wordErrorMsg && <p className="text-xs text-red-500">{wordErrorMsg}</p>}
          </div>

          {/* Section 3: AI Contextual Sentence Generator (CEFR A1–C2) */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-foreground">AI Sentence Generator</h4>
              </div>

              {/* CEFR Level Selector Pills */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSelectedCefr(lvl);
                      generateContextualSentence(word.word, lvl);
                    }}
                    className={cn(
                      'px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all',
                      selectedCefr === lvl
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentence Display Card */}
            {generatedSentence && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-medium text-foreground ltr-isolate leading-relaxed">
                      {generatedSentence.english}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          AudioEngineService.playWord(generatedSentence.english, audioRate)
                        }
                        title="Listen Sentence"
                        className="h-8 w-8 text-primary"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSentenceArabic(!showSentenceArabic)}
                        title="Toggle Arabic Translation"
                        className="h-8 w-8"
                      >
                        <Languages className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {showSentenceArabic && (
                    <p className="text-sm text-muted-foreground rtl-text border-t border-border/40 pt-2 leading-relaxed">
                      {generatedSentence.arabic}
                    </p>
                  )}
                </div>

                {/* Sentence Pronunciation Assessment */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={
                        isSentenceRecording ? stopSentenceRecording : startSentenceRecording
                      }
                      className={cn(
                        'gap-2 text-xs font-bold',
                        isSentenceRecording &&
                          'border-red-500 text-red-500 animate-pulse bg-red-500/10'
                      )}
                    >
                      <Mic className="h-4 w-4 text-primary" />
                      {isSentenceRecording
                        ? 'Listening to Sentence...'
                        : 'Test Full Sentence Pronunciation'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateContextualSentence(word.word, selectedCefr)}
                      disabled={isGeneratingSentence}
                      className="text-xs text-muted-foreground hover:text-primary gap-1"
                    >
                      <RefreshCw
                        className={cn('h-3.5 w-3.5', isGeneratingSentence && 'animate-spin')}
                      />
                      Regenerate
                    </Button>
                  </div>

                  {sentenceErrorMsg && <p className="text-xs text-red-500">{sentenceErrorMsg}</p>}

                  {/* Token-by-Token Sentence Scoring Breakdown */}
                  {sentenceEvaluation && (
                    <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">
                          Sentence Phonetic Accuracy
                        </span>
                        <span
                          className={cn(
                            'font-bold px-2 py-0.5 rounded-md',
                            sentenceEvaluation.overallScore >= 75
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          )}
                        >
                          {sentenceEvaluation.overallScore}%
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 ltr-isolate">
                        {sentenceEvaluation.breakdown.map((item, idx) => (
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

                      {sentenceEvaluation.passed && (
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 pt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Great fluency score! +50 XP
                          earned.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
