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
  Key,
  Copy,
  Layers,
  Split,
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
import { GrokService } from '@/features/ai-engine/services/grokService';
import { CefrLevelChoice, GrokSentenceResponse } from '@/features/ai-engine/types';
import { GrokKeySettingsModal } from '@/features/ai-engine/components/GrokKeySettingsModal';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface WordPracticeDialogProps {
  word: LexiconItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WordPracticeDialog({ word, isOpen, onClose }: WordPracticeDialogProps) {
  const [selectedCefr, setSelectedCefr] = React.useState<CefrLevelChoice>('B1');
  const [generatedSentence, setGeneratedSentence] = React.useState<GrokSentenceResponse | null>(null);
  const [isGeneratingSentence, setIsGeneratingSentence] = React.useState(false);
  const [showSentenceArabic, setShowSentenceArabic] = React.useState(true);
  const [isGrokModalOpen, setIsGrokModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Pronunciation Assessment 1: Target Word
  const [isWordRecording, setIsWordRecording] = React.useState(false);
  const [wordEvaluation, setWordEvaluation] = React.useState<SpeechEvaluationResult | null>(null);
  const [wordErrorMsg, setWordErrorMsg] = React.useState<string | null>(null);

  // Pronunciation Assessment 2: Dynamic Sentence
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

  // Generate initial contextual sentence whenever word opens
  React.useEffect(() => {
    if (word && isOpen) {
      const initialLevel = ((word.cefr as CefrLevelChoice) || 'B1') as CefrLevelChoice;
      setSelectedCefr(initialLevel);
      fetchGrokSentence(word.word, initialLevel);
      setWordEvaluation(null);
      setSentenceEvaluation(null);
      setWordErrorMsg(null);
      setSentenceErrorMsg(null);
    }
  }, [word, isOpen]);

  // Clean up recording on close
  React.useEffect(() => {
    if (!isOpen) {
      stopWordRecording();
      stopSentenceRecording();
    }
  }, [isOpen]);

  const fetchGrokSentence = async (term: string, level: CefrLevelChoice) => {
    setIsGeneratingSentence(true);
    try {
      const response = await GrokService.generateLevelSentence(term, level);
      setGeneratedSentence(response);
      setSentenceEvaluation(null);
    } catch (e) {
      console.error('Failed to generate sentence with Grok:', e);
    } finally {
      setIsGeneratingSentence(false);
    }
  };

  // --- Pronunciation Drill 1: Target Word ---
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
      setWordErrorMsg('تعذر الوصول إلى الميكروفون.');
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

  // --- Pronunciation Drill 2: Dynamic Sentence ---
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
      setSentenceErrorMsg('تعذر الوصول إلى الميكروفون.');
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

  const handleCopySentence = () => {
    if (!generatedSentence) return;
    navigator.clipboard.writeText(`${generatedSentence.english}\n${generatedSentence.arabic}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!word) return null;

  const isMastered = masteredWordIds.includes(word.id);
  const isFavorite = favoriteWordIds.includes(word.id);
  const meanings = extractArabicMeanings(word.arabic);
  const syllables = GrokService.breakdownIpaSyllables(word.word, word.ipa);
  const cefrLevels: CefrLevelChoice[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="archetype-card max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-surface">
          {/* Header */}
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
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
                    className="archetype-badge font-mono text-xs px-2.5 py-0.5"
                  >
                    CEFR {word.cefr}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                    {word.pos}
                  </span>
                </div>

                <DialogTitle className="text-3xl sm:text-4xl font-black font-heading text-foreground tracking-tight ltr-isolate">
                  {word.word}
                </DialogTitle>

                {/* Syllable-by-Syllable IPA Breakdown */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground font-mono">Syllables:</span>
                  <div className="flex items-center gap-1">
                    {syllables.map((syl, sIdx) => (
                      <span
                        key={sIdx}
                        className="archetype-badge px-2 py-0.5 rounded-md bg-muted/60 text-xs font-mono font-bold text-primary border border-border/60"
                      >
                        /{syl}/
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGrokModalOpen(true)}
                  className="archetype-btn h-9 text-xs gap-1.5"
                  title="إعدادات مفتاح Grok (xAI API)"
                >
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Grok API</span>
                </Button>

                <Button
                  variant={isFavorite ? 'accent' : 'outline'}
                  size="icon"
                  onClick={() => toggleFavorite(word.id)}
                  title={isFavorite ? 'Starred Favorite' : 'Add to Favorites'}
                  className="archetype-btn h-9 w-9"
                >
                  <Star className={cn('h-4 w-4', isFavorite && 'fill-current text-amber-500')} />
                </Button>

                <Button
                  variant={isMastered ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMastered(word.id)}
                  className="archetype-btn h-9 text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{isMastered ? 'متقنة' : 'تمييز كـ متقنة'}</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Section 1: Complete Meaning Stack Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                المعاني والتصنيفات العربية المعتمدة
              </h4>
              <div className="flex flex-wrap gap-2">
                {meanings.map((meaning, idx) => (
                  <div
                    key={idx}
                    className="archetype-badge px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary font-bold text-sm rtl-text shadow-sm"
                  >
                    {meaning}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Target Word Pronunciation Test */}
            <div className="archetype-card p-4 bg-muted/20 border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">اختبار نطق الكلمة المستهدفة</h4>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => AudioEngineService.playWord(word.word, audioRate)}
                  className="archetype-btn h-7 text-xs gap-1.5"
                >
                  <Volume2 className="h-3.5 w-3.5" /> استماع للنطق
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={isWordRecording ? stopWordRecording : startWordRecording}
                  className={cn(
                    'archetype-btn gap-2 text-xs font-bold transition-all',
                    isWordRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  <Mic className="h-4 w-4" />
                  {isWordRecording ? 'جاري الاستماع... اضغط للإيقاف' : 'تسجيل وتقييم نطق الكلمة'}
                </Button>

                {wordEvaluation && (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'archetype-badge text-xs font-bold px-2.5 py-1',
                        wordEvaluation.overallScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : wordEvaluation.overallScore >= 50
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      )}
                    >
                      الدقة: {wordEvaluation.overallScore}%
                    </span>
                    {wordEvaluation.passed && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> +25 XP
                      </span>
                    )}
                  </div>
                )}
              </div>

              {wordErrorMsg && <p className="text-xs text-red-500">{wordErrorMsg}</p>}
            </div>

            {/* Section 3: Grok Level-Targeted Sentence Generator & Instant Swapping */}
            <div className="archetype-card p-5 bg-surface border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">
                    توليد الجمل التكيفي الذكي (Grok Engine)
                  </h4>
                </div>

                {/* CEFR Level Segmented Selector */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                  {cefrLevels.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedCefr(lvl);
                        fetchGrokSentence(word.word, lvl);
                      }}
                      className={cn(
                        'archetype-badge px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer',
                        selectedCefr === lvl
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Sentence Result */}
              {generatedSentence && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base sm:text-lg font-bold font-heading text-foreground ltr-isolate leading-relaxed">
                        {generatedSentence.english}
                      </p>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            AudioEngineService.playWord(generatedSentence.english, audioRate)
                          }
                          title="استماع للجملة بالصوت الطبيعي"
                          className="h-8 w-8 text-primary"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowSentenceArabic(!showSentenceArabic)}
                          title="إظهار / إخفاء الترجمة العربية"
                          className="h-8 w-8"
                        >
                          <Languages className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopySentence}
                          title="نسخ الجملة"
                          className="h-8 w-8"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {showSentenceArabic && (
                      <p className="text-sm font-medium text-muted-foreground rtl-text border-t border-border/40 pt-2 leading-relaxed">
                        {generatedSentence.arabic}
                      </p>
                    )}

                    {generatedSentence.grammarInsight && (
                      <p className="text-xs text-primary/90 italic border-t border-border/30 pt-1.5">
                        💡 {generatedSentence.grammarInsight}
                      </p>
                    )}
                  </div>

                  {/* Primary & Instant Swap Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => fetchGrokSentence(word.word, selectedCefr)}
                      disabled={isGeneratingSentence}
                      className="archetype-btn text-xs gap-1.5"
                    >
                      <RefreshCw
                        className={cn('h-3.5 w-3.5', isGeneratingSentence && 'animate-spin')}
                      />
                      <span>تبديل الجملة بذكاء اصطناعي (New Sentence)</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={
                        isSentenceRecording ? stopSentenceRecording : startSentenceRecording
                      }
                      className={cn(
                        'archetype-btn text-xs gap-1.5 font-bold',
                        isSentenceRecording && 'border-red-500 text-red-500 animate-pulse'
                      )}
                    >
                      <Mic className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {isSentenceRecording ? 'جاري الاستماع...' : 'تقييم نطق الجملة كاملة'}
                      </span>
                    </Button>
                  </div>

                  {sentenceErrorMsg && <p className="text-xs text-red-500">{sentenceErrorMsg}</p>}

                  {/* Token-by-Token Sentence Assessment Breakdown */}
                  {sentenceEvaluation && (
                    <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-muted-foreground">
                          دقة نطق الجملة التوليدية
                        </span>
                        <span
                          className={cn(
                            'archetype-badge font-bold px-2 py-0.5',
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
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 pt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> طلاقة ممتازة! +50 XP
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grok Key Settings Modal */}
      <GrokKeySettingsModal isOpen={isGrokModalOpen} onClose={() => setIsGrokModalOpen(false)} />
    </>
  );
}
