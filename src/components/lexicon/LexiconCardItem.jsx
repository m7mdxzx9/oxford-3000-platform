import React, { useState, useEffect } from 'react';
import { Volume2, Star, Check, Sparkles, Mic, BookOpen, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playAudio } from '../../services/audioService';
import { generateSentence } from '../../services/geminiService';
import { startListening, stopListening, evaluateSpeech } from '../../services/speechEvaluation';
import { getCuratedWordImage, fetchWordImage } from '../../services/imageService';
import SentenceTokenViewer from '../SentenceTokenViewer';
import SpeechScoreVisualizer from '../SpeechScoreVisualizer';
import IpaSyllableVisualizer from '../IpaSyllableVisualizer';
import { getWordExample, getWordExampleArabic } from '../../utils/exampleSentenceService';
import { getWordMeanings } from '../../utils/wordMeaningsDictionary';

const CEFR_BADGES = {
  A1: { bg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30', label: 'A1 Beginner' },
  A2: { bg: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30', label: 'A2 Elementary' },
  B1: { bg: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30', label: 'B1 Intermediate' },
  B2: { bg: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30', label: 'B2 Upper-Int' },
  C1: { bg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30', label: 'C1 Advanced' },
};

const POS_STYLES = {
  n: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  noun: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  v: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
  verb: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
  adj: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  adjective: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  adv: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
  adverb: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
  prep: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  preposition: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
};

export const LexiconCardItem = React.memo(({ wordObj, onCardClick }) => {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    isSelectedWord,
    toggleSelectWord,
    selectedWordsCount,
    addNotification,
    voicePreset,
    apiKey,
  } = useApp();

  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [cardImg, setCardImg] = useState(() => getCuratedWordImage(wordObj.word));
  const [customAiSentence, setCustomAiSentence] = useState(null);
  const [isGeneratingAiSentence, setIsGeneratingAiSentence] = useState(false);
  const [showAllMeanings, setShowAllMeanings] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchWordImage(wordObj.word).then((url) => {
      if (isMounted && url) setCardImg(url);
    });
    return () => {
      isMounted = false;
    };
  }, [wordObj.word]);

  const favorited = isFavorite(wordObj.word);
  const mastered = isMastered(wordObj.word);
  const selected = isSelectedWord(wordObj);

  const cefrStyle = CEFR_BADGES[wordObj.cefr] || {
    bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    label: wordObj.cefr || 'CEFR',
  };

  const posStyle = POS_STYLES[wordObj.pos?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  const activeSentence = customAiSentence?.sentence || getWordExample(wordObj);
  const activeArabic = customAiSentence?.arabic || getWordExampleArabic(wordObj);
  const activeWordTranslations = customAiSentence?.wordTranslations;

  // Multi-Meaning Semantic Parsing (Feature 0301)
  const meanings = getWordMeanings(wordObj);
  const hasMultipleMeanings = meanings.alternatives.length > 1 || meanings.synonyms.length > 0;

  const handlePlayWord = async (e) => {
    e.stopPropagation();
    try {
      setIsPlayingWord(true);
      await playAudio(wordObj.word, { speed: 0.85, presetId: voicePreset });
    } catch (err) {
    } finally {
      setIsPlayingWord(false);
    }
  };

  const handlePlayExample = async (e) => {
    if (e) e.stopPropagation();
    if (!activeSentence) return;
    try {
      setIsPlayingExample(true);
      await playAudio(activeSentence, { speed: 0.9, presetId: voicePreset });
    } catch (err) {
    } finally {
      setIsPlayingExample(false);
    }
  };

  const handleStartPractice = (e) => {
    if (e) e.stopPropagation();
    if (!activeSentence) return;
    setIsPracticing(true);
    setIsListening(true);
    setEvalResult(null);

    startListening(
      (spoken) => {
        setIsListening(false);
        const result = evaluateSpeech(activeSentence, spoken);
        setEvalResult(result);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleClosePractice = (e) => {
    if (e) e.stopPropagation();
    stopListening();
    setIsPracticing(false);
    setIsListening(false);
    setEvalResult(null);
  };

  const handleSelectWord = (e) => {
    e.stopPropagation();
    if (!selected && selectedWordsCount >= 5) {
      addNotification('الحد الأقصى لاختيار الكلمات هو 5 كلمات للقصة.', 'warning');
      return;
    }
    toggleSelectWord(wordObj);
  };

  const handleCreateNewAiSentence = async (e) => {
    if (e) e.stopPropagation();
    try {
      setIsGeneratingAiSentence(true);
      const res = await generateSentence(wordObj.word, 'medium', 'any', 'Casual Conversation', 'Present', apiKey);
      if (res && res.sentence) {
        setCustomAiSentence(res);
        addNotification(`تم توليد مثال ذكي جديد لكلمة "${wordObj.word}" ✨`, 'success');
      }
    } catch (err) {
      addNotification('تعذر توليد الجملة بالذكاء الاصطناعي', 'error');
    } finally {
      setIsGeneratingAiSentence(false);
    }
  };

  const toggleMeaningsExpand = (e) => {
    e.stopPropagation();
    setShowAllMeanings((prev) => !prev);
  };

  return (
    <div
      onClick={() => onCardClick(wordObj)}
      className={`relative rounded-3xl border transition-all duration-300 card-theme-target p-5 flex flex-col justify-between group cursor-pointer overflow-hidden shadow-lg ${
        selected ? 'ring-2 ring-cyan-500 shadow-cyan-500/20 scale-[1.01]' : 'hover:scale-[1.01]'
      }`}
    >
      <div>
        {/* Top Header: CEFR & Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${cefrStyle.bg}`}>
              {cefrStyle.label}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border uppercase ${posStyle}`}>
              {wordObj.pos || 'pos'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSelectWord}
              className={`p-1.5 rounded-xl border transition-all ${
                selected ? 'bg-cyan-500 text-white border-cyan-500 shadow-md' : 'opacity-60 hover:opacity-100 theme-btn-secondary'
              }`}
              title="إضافة لمولد القصص"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(wordObj.word);
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                favorited ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'opacity-60 hover:opacity-100 theme-btn-secondary'
              }`}
              title="المفضلة"
            >
              <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMastered(wordObj.word);
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                mastered ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' : 'opacity-60 hover:opacity-100 theme-btn-secondary'
              }`}
              title="تم الإتقان"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Word Display & Audio */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight ltr-token flex items-center gap-2">
              <span>{wordObj.word}</span>
            </h3>
            {wordObj.ipa && (
              <IpaSyllableVisualizer
                ipa={wordObj.ipa}
                word={wordObj.word}
                isPlaying={isPlayingWord}
                className="mt-1"
              />
            )}
          </div>

          <button
            onClick={handlePlayWord}
            disabled={isPlayingWord}
            className="p-3 rounded-2xl theme-btn-primary shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="استمع للنطق"
          >
            <Volume2 className={`w-5 h-5 ${isPlayingWord ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Primary Arabic Translation with Multi-meaning expander */}
        <div className="mb-3 text-start">
          <div className="flex items-center justify-between gap-2">
            <span
              onClick={toggleMeaningsExpand}
              className="text-base font-black font-arabic text-emerald-500 dark:text-emerald-400 cursor-pointer hover:underline inline-flex items-center gap-1.5"
              title="انقر لعرض جميع المعاني والترجمات"
            >
              <span>{meanings.primary}</span>
              {hasMultipleMeanings && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                  +{meanings.alternatives.length - 1} معانٍ
                </span>
              )}
            </span>

            {hasMultipleMeanings && (
              <button
                onClick={toggleMeaningsExpand}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 text-xs theme-btn-secondary"
                title="توسيع كافة المعاني"
              >
                {showAllMeanings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Expanded All Translations & Synonyms Accordion */}
          {showAllMeanings && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs font-arabic animate-fadeIn"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Layers className="w-3 h-3" />
                <span>كافة المعاني والترجمات:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meanings.alternatives.map((alt, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-black/10 dark:bg-white/10 text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/5"
                  >
                    {alt}
                  </span>
                ))}
              </div>

              {meanings.synonyms.length > 0 && (
                <div className="pt-1.5 border-t border-emerald-500/20">
                  <span className="text-[10px] opacity-70 block mb-1">مرادفات إنجليزية:</span>
                  <div className="flex flex-wrap gap-1">
                    {meanings.synonyms.map((syn, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[10px] font-mono border border-cyan-500/20"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Example Sentence */}
        {activeSentence && (
          <div className="p-3 rounded-2xl box-surface text-xs font-mono mb-3 space-y-1.5 text-start">
            <SentenceTokenViewer sentence={activeSentence} targetWord={wordObj.word} wordTranslations={activeWordTranslations} />
            {activeArabic && <p className="text-[11px] font-bold font-arabic text-emerald-500 dark:text-emerald-400 pt-1 border-t border-[var(--border-color)]">{activeArabic}</p>}
          </div>
        )}
      </div>


      {/* Practice Speech Output */}
      {isPracticing && (
        <div className="p-3.5 rounded-3xl bg-black/10 dark:bg-white/10 border mb-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-xs font-bold font-arabic">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse text-rose-500' : ''}`} />
              <span>{isListening ? '🎙️ المايك مفتوح، اقرأ الجملة بهدوء...' : '✓ تم فحص وتقييم النطق'}</span>
            </span>
            <button onClick={handleClosePractice} className="opacity-60 hover:opacity-100 text-xs px-2 py-0.5 rounded-lg theme-btn-secondary cursor-pointer">
              إغلاق ✕
            </button>
          </div>

          {isListening && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-arabic">
              <span className="text-cyan-600 dark:text-cyan-300 font-bold animate-pulse">
                🗣️ تحدث الآن بطلاقة، المايك متاح لك...
              </span>
              <button
                onClick={() => {
                  stopListening();
                  setIsListening(false);
                }}
                className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
              >
                🛑 إنهاء وتقييم
              </button>
            </div>
          )}

          {evalResult && (
            <SpeechScoreVisualizer
              evalResult={evalResult}
              evaluationResult={evalResult}
              targetSentence={activeSentence}
              expectedText={activeSentence}
              onRetry={handleStartPractice}
            />
          )}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-black/10 dark:border-white/10 flex-wrap">
        <button
          onClick={handlePlayExample}
          disabled={isPlayingExample}
          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold theme-btn-secondary flex items-center gap-1 cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>مثال</span>
        </button>

        <button
          onClick={isPracticing ? handleClosePractice : handleStartPractice}
          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
            isPracticing ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'theme-btn-secondary'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <span>تدرب</span>
        </button>

        <button
          onClick={handleCreateNewAiSentence}
          disabled={isGeneratingAiSentence}
          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold theme-btn-secondary flex items-center gap-1 ms-auto cursor-pointer"
          title="توليد جملة بالذكاء الاصطناعي"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingAiSentence ? 'animate-spin' : ''}`} />
          <span>AI مثال</span>
        </button>
      </div>
    </div>
  );
});

export default LexiconCardItem;
