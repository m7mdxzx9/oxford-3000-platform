import { SpeechEvaluationResult, WordEvaluation } from '../types';
import { calculateLevenshteinSimilarity, cleanEnglishText } from '@/lib/utils';

export class AudioEngineService {
  private static activeAudio: HTMLAudioElement | null = null;

  public static playWord(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve) => {
      const cleaned = cleanEnglishText(text);
      if (!cleaned) {
        resolve();
        return;
      }

      // 1. Try Native Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => {
          // Fallback to stream if native fails
          this.playFallbackStream(cleaned, rate).then(resolve);
        };

        window.speechSynthesis.speak(utterance);
        return;
      }

      // 2. Fallback to online TTS stream
      this.playFallbackStream(cleaned, rate).then(resolve);
    });
  }

  private static playFallbackStream(text: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (this.activeAudio) {
          this.activeAudio.pause();
          this.activeAudio = null;
        }

        const encoded = encodeURIComponent(text);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encoded}`;
        const audio = new Audio(url);
        audio.playbackRate = rate;
        this.activeAudio = audio;

        audio.onended = () => {
          this.activeAudio = null;
          resolve();
        };

        audio.onerror = () => {
          this.activeAudio = null;
          resolve();
        };

        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  public static stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }
  }

  public static evaluateSpeech(targetText: string, spokenText: string): SpeechEvaluationResult {
    const targetWords = cleanEnglishText(targetText)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const spokenWords = spokenText
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const breakdown: WordEvaluation[] = targetWords.map((word, idx) => {
      const cleanTargetWord = word.replace(/[^\w]/g, '');
      const spokenWord = spokenWords[idx] ? spokenWords[idx].replace(/[^\w]/g, '') : '';

      if (!spokenWord) {
        return {
          word,
          cleanWord: cleanTargetWord,
          status: 'missed',
          similarity: 0,
          phoneticFeedback: 'Word omitted or not detected clearly',
        };
      }

      const similarity = calculateLevenshteinSimilarity(cleanTargetWord, spokenWord);
      let status: 'correct' | 'incorrect' | 'missed' = 'incorrect';

      if (similarity >= 80) {
        status = 'correct';
      } else if (similarity >= 50) {
        status = 'incorrect';
      } else {
        status = 'incorrect';
      }

      return {
        word,
        cleanWord: cleanTargetWord,
        status,
        similarity,
        phoneticFeedback:
          similarity >= 80
            ? 'Clear American English pronunciation'
            : `Spoken as "${spokenWord}". Practice phonetic vowel stress.`,
      };
    });

    const totalSimilarity = breakdown.reduce((acc, curr) => acc + curr.similarity, 0);
    const overallScore = breakdown.length > 0 ? Math.round(totalSimilarity / breakdown.length) : 0;

    return {
      spokenText,
      targetText,
      overallScore,
      breakdown,
      passed: overallScore >= 70,
      timestamp: Date.now(),
    };
  }
}
