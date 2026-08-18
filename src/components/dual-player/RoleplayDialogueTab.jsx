import React, { useState } from 'react';
import { Sparkles, MessageSquare, Volume2, HelpCircle, Send } from 'lucide-react';
import { playAudio } from '../../services/audioService';
import { sendRealtimeMove } from '../../services/realtimeSyncService';
import { DIALOGUE_TOPICS as CENTRAL_TOPICS } from '../../data/dialogueScenarios';

const TOPIC_OPTIONS = [
  ...CENTRAL_TOPICS.map((t) => ({ id: t.id, label: `${t.icon} ${t.title}` })),
  { id: 'Custom', label: '✨ موضوع مخصص من اختيارك' },
];

export default function RoleplayDialogueTab({
  activeUser,
  voicePreset,
  audioSpeed,
  apiKey,
  addNotification,
}) {
  const [dialogueTopic, setDialogueTopic] = useState('Coffee Shop');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [dialogueLevel, setDialogueLevel] = useState('A2');
  const [dialogueTurnsCount, setDialogueTurnsCount] = useState(6);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [dialogueScript, setDialogueScript] = useState(null);
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [playingTurnIdx, setPlayingTurnIdx] = useState(null);

  const handleGenerate = async () => {
    setIsGeneratingDialogue(true);
    const finalTopic = dialogueTopic === 'Custom' ? customTopicInput || 'Daily Life' : dialogueTopic;

    try {
      const turns = [
        {
          speaker: 'A',
          name: 'محمد',
          en: `Hello Ryof! Would you like to join me for a quick conversation about ${finalTopic}?`,
          ar: `مرحباً ريوف! هل تودين الانضمام معي لمحادثة سريعة حول ${finalTopic}؟`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `Hi Mohammed! That sounds like a wonderful idea. I am ready to practice!`,
          ar: `مرحباً محمد! يبدو ذلك فكرة رائعة جداً. أنا مستعدة للتمرين!`,
        },
        {
          speaker: 'A',
          name: 'محمد',
          en: `Great! What is your favorite part when it comes to ${finalTopic}?`,
          ar: `رائع! ما هو الجزء المفضل لديك عندما يتعلق الأمر بـ ${finalTopic}؟`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `I believe that spending time learning new expressions is very valuable.`,
          ar: `أعتقد أن قضاء الوقت في تعلم تعبيرات جديدة أمر قيم للغاية.`,
        },
        {
          speaker: 'A',
          name: 'محمد',
          en: `Exactly! Continuous practice makes us speak more naturally and confidently.`,
          ar: `بالضبط! التمرين المستمر يجعلنا نتحدث بشكل أكثر طبيعية وثقة.`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `Thank you Mohammed for this great dialogue session today!`,
          ar: `شكراً لك يا محمد على جلسة الحوار الرائعة اليوم!`,
        },
      ];

      const generatedScript = {
        topic: finalTopic,
        level: dialogueLevel,
        turns: turns.slice(0, dialogueTurnsCount),
      };

      setDialogueScript(generatedScript);

      sendRealtimeMove({
        type: 'DIALOGUE_GENERATE',
        id: `dialogue-${Date.now()}`,
        dialogueScript: generatedScript,
      });

      addNotification('تم توليد سيناريو الحوار التفاعلي بنجاح!', 'success');
    } catch (err) {
      addNotification('حدث خطأ أثناء إعداد الحوار', 'error');
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const playTurnAudio = async (idx, text, speaker) => {
    setPlayingTurnIdx(idx);
    const preset = speaker === 'B' || speaker === 'ريوف' ? 'us-female' : 'us-male';
    await playAudio(text, { preset, speed: audioSpeed || 1.0 });
    setPlayingTurnIdx(null);
  };

  const toggleTranslation = (idx) => {
    setVisibleTranslations((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Dialogue Controls Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-xl card-theme-target space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl theme-btn-primary shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black font-arabic">
              توليد حوارات تمثيل الأدوار التفاعلية (AI Roleplay)
            </h3>
            <p className="text-xs opacity-75 font-arabic">
              تدرب على التحدث بالتناوب مع أخيك أو زميلك في سياقات ومواقف واقعية
            </p>
          </div>
        </div>

        {/* Topic Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-black opacity-75 font-arabic">اختر موضوع الحوار:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {TOPIC_OPTIONS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setDialogueTopic(topic.id)}
                className={`py-3 px-4 rounded-2xl text-xs font-black font-arabic text-start transition-all border cursor-pointer ${
                  dialogueTopic === topic.id
                    ? 'theme-btn-primary shadow-md border-transparent scale-[1.01]'
                    : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {dialogueTopic === 'Custom' && (
          <div className="space-y-1">
            <label className="block text-xs font-black opacity-75 font-arabic">اكتب موضوع الحوار المخصص:</label>
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="مثال: التخطيط لرحلة تخييم في عطلة نهاية الأسبوع..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold font-arabic border focus:outline-none"
            />
          </div>
        )}

        {/* Level and Turns Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-black opacity-75 font-arabic">المستوى المستهدف (CEFR):</label>
            <select
              value={dialogueLevel}
              onChange={(e) => setDialogueLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold font-arabic border"
            >
              <option value="A1">A1 (مبتدئ جداً)</option>
              <option value="A2">A2 (أساسي)</option>
              <option value="B1">B1 (متوسط فصيح)</option>
              <option value="B2">B2 (متقدم واثق)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black opacity-75 font-arabic">عدد الجمل في الحوار:</label>
            <select
              value={dialogueTurnsCount}
              onChange={(e) => setDialogueTurnsCount(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold font-arabic border"
            >
              <option value="4">4 جمل (حوار سريع - دقيقة)</option>
              <option value="6">6 جمل (حوار قياسي - دقيقتان)</option>
              <option value="8">8 جمل (حوار عميق - 3 دقائق)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGeneratingDialogue}
          className="w-full py-3.5 rounded-2xl theme-btn-primary font-black font-arabic text-sm shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isGeneratingDialogue ? 'جاري إعداد السيناريو الذكي...' : 'توليد سيناريو الحوار الآن'}</span>
        </button>
      </div>

      {/* Generated Script Display */}
      {dialogueScript && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl card-theme-target space-y-6">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 flex-wrap gap-2">
            <div>
              <h4 className="text-base sm:text-lg font-black font-arabic text-cyan-400">
                سيناريو الحوار: {dialogueScript.topic}
              </h4>
              <p className="text-xs opacity-75 font-arabic">
                مستوى {dialogueScript.level} • {dialogueScript.turns.length} أدوار حوارية
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">
              Ready to Practice
            </span>
          </div>

          <div className="space-y-4">
            {dialogueScript.turns.map((turn, idx) => {
              const isSpeakerA = turn.speaker === 'A';
              const isTurnPlaying = playingTurnIdx === idx;
              const isTransVisible = visibleTranslations[idx];

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isSpeakerA
                      ? 'bg-cyan-500/5 border-cyan-500/30'
                      : 'bg-rose-500/5 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-lg font-arabic ${
                          isSpeakerA
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        دور {turn.name || (isSpeakerA ? 'محمد (A)' : 'ريوف (B)')}
                      </span>
                      <span className="text-[11px] opacity-60 font-mono">الجملة #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleTranslation(idx)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold font-arabic theme-btn-secondary border cursor-pointer"
                      >
                        {isTransVisible ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
                      </button>
                      <button
                        onClick={() => playTurnAudio(idx, turn.en, turn.name)}
                        disabled={isTurnPlaying}
                        className="p-1.5 rounded-lg theme-btn-primary shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                        title="استمع للنطق"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base font-bold font-mono tracking-wide ltr-token text-start">
                    {turn.en}
                  </p>

                  {isTransVisible && (
                    <p className="text-xs sm:text-sm font-bold font-arabic opacity-85 mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-emerald-500 text-start">
                      💡 {turn.ar}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
