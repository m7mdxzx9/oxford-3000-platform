import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playWordAudio } from '../services/audioService';
import LiveEqualizer from './LiveEqualizer';

const PHRASAL_VERBS = [
  { verb: 'give up', meaning: 'يستسلم / يقلع عن عادة', example: 'Never give up on your dreams.', audio: 'Never give up on your dreams.' },
  { verb: 'look after', meaning: 'يعتني بـ / يرعى', example: 'She looks after her younger sister.', audio: 'She looks after her younger sister.' },
  { verb: 'run out of', meaning: 'ينفد منه شيء', example: 'We have run out of milk and coffee.', audio: 'We have run out of milk and coffee.' },
  { verb: 'bring up', meaning: 'يربي / يطرح موضوعاً للنقاش', example: 'They brought up an important point in the meeting.', audio: 'They brought up an important point in the meeting.' },
  { verb: 'turn down', meaning: 'يرفض طلباً / يخفض الصوت', example: 'He had to turn down the job offer.', audio: 'He had to turn down the job offer.' },
  { verb: 'set up', meaning: 'يؤسس / يجهز نظاماً', example: 'She wants to set up her own tech startup.', audio: 'She wants to set up her own tech startup.' },
  { verb: 'put off', meaning: 'يؤجل موعداً', example: 'Do not put off until tomorrow what you can do today.', audio: 'Do not put off until tomorrow what you can do today.' },
  { verb: 'figure out', meaning: 'يفهم / يكتشف حلاً', example: 'I need to figure out how this software works.', audio: 'I need to figure out how this software works.' },
];

const CONNECTORS = [
  { connector: 'However', meaning: 'ومع ذلك / لكن', usage: 'للتعبير عن التناقض بين فكرتين', example: 'The test was difficult. However, he passed with an A.' },
  { connector: 'Although', meaning: 'على الرغم من أن', usage: 'لربط جملتين متناقضتين في جملة واحدة', example: 'Although it was raining, we went for a long walk.' },
  { connector: 'Furthermore', meaning: 'علاوة على ذلك / بالإضافة إلى', usage: 'لإضافة معلومة جديدة تدعم الفكرة', example: 'The hotel is cheap. Furthermore, it is near the beach.' },
  { connector: 'Therefore', meaning: 'لذلك / وبناءً عليه', usage: 'لتوضيح النتيجة المترتبة على سبب', example: 'She studied diligently; therefore, she succeeded.' },
  { connector: 'On the other hand', meaning: 'من ناحية أخرى', usage: 'لعرض وجهة نظر بديلة أو متباينة', example: 'Living in a city is exciting. On the other hand, it can be noisy.' },
];

const DEPENDENT_PREPOSITIONS = [
  { phrase: 'interested in', meaning: 'مهتم بـ', tip: 'دائماً تأتي مع in وليس at أو with', example: 'I am interested in learning AI and English.' },
  { phrase: 'good at', meaning: 'جيد أو ماهر في', tip: 'دائماً good at وليس good in في المهارات', example: 'He is extremely good at problem solving.' },
  { phrase: 'depend on', meaning: 'يعتمد على', tip: 'دائماً depend on وليس depend from', example: 'Our success depends on teamwork and dedication.' },
  { phrase: 'afraid of', meaning: 'خائف من', tip: 'تستخدم مع of للتعبير عن الخوف', example: 'She is not afraid of speaking in public.' },
  { phrase: 'responsible for', meaning: 'مسؤول عن', tip: 'تستخدم مع for عند تحديد المسؤوليات', example: 'He is responsible for managing the design project.' },
];

export default function B1BridgeSection() {
  const { voicePreset, audioSpeed } = useApp();
  const [activeTab, setActiveTab] = useState('phrasal'); // phrasal | connectors | prepositions
  const [playingKey, setPlayingKey] = useState(null);

  const handlePlay = async (text, key) => {
    setPlayingKey(key);
    await playWordAudio(text, { preset: voicePreset, speed: audioSpeed });
    setPlayingKey(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xl">
              🌉
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-arabic flex items-center gap-2">
                <span>جسر الانتقال إلى المستوى المتوسط (A2 ➔ B1)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono font-bold">
                  B1 Bridge
                </span>
              </h2>
              <p className="text-xs sm:text-sm opacity-75 font-arabic">
                المفاتيح الأساسية للقفز من التحدث البسيط إلى التعبير المتوسط الطليق
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t font-arabic overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('phrasal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'phrasal' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>الأفعال المركبة (Phrasal Verbs)</span>
          </button>
          <button
            onClick={() => setActiveTab('connectors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'connectors' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>روابط الجمل والنقاش (Connectors)</span>
          </button>
          <button
            onClick={() => setActiveTab('prepositions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prepositions' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>حروف الجر المرتبطة (Prepositions)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Phrasal Verbs Grid */}
      {activeTab === 'phrasal' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dropdown-animate">
          {PHRASAL_VERBS.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-3xl border shadow-lg card-theme-target space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-cyan-400 ltr-token">
                    {item.verb}
                  </span>
                  <span className="text-xs font-bold font-arabic px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                    {item.meaning}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs sm:text-sm italic ltr-token border">
                  "{item.example}"
                </div>
              </div>

              <button
                onClick={() => handlePlay(item.audio, `phrasal-${idx}`)}
                className="w-full py-2 rounded-xl theme-btn-secondary text-xs font-bold flex items-center justify-center gap-2 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <LiveEqualizer isPlaying={playingKey === `phrasal-${idx}`} />
                <span className="font-arabic">نطق المثال الكامل</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Connectors Grid */}
      {activeTab === 'connectors' && (
        <div className="space-y-3 dropdown-animate">
          {CONNECTORS.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-3xl border shadow-lg card-theme-target space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono text-indigo-400 ltr-token">
                    {item.connector}
                  </span>
                  <span className="text-xs font-bold font-arabic opacity-80">({item.meaning})</span>
                </div>
                <span className="text-[11px] font-arabic opacity-70 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border">
                  {item.usage}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs sm:text-sm font-medium ltr-token border">
                "{item.example}"
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handlePlay(item.example, `connector-${idx}`)}
                  className="px-4 py-1.5 rounded-xl theme-btn-primary text-xs font-bold flex items-center gap-2 active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <LiveEqualizer isPlaying={playingKey === `connector-${idx}`} />
                  <span className="font-arabic">استمع للسياق</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dependent Prepositions */}
      {activeTab === 'prepositions' && (
        <div className="space-y-3 dropdown-animate">
          {DEPENDENT_PREPOSITIONS.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-3xl border shadow-lg card-theme-target space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-lg font-black font-mono text-amber-500 ltr-token">
                  {item.phrase}
                </span>
                <span className="text-xs font-bold font-arabic opacity-90 text-emerald-500">
                  {item.meaning}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center gap-2 font-arabic">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>{item.tip}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs sm:text-sm font-medium ltr-token border">
                "{item.example}"
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handlePlay(item.example, `prep-${idx}`)}
                  className="px-4 py-1.5 rounded-xl theme-btn-secondary text-xs font-bold flex items-center gap-2 active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <LiveEqualizer isPlaying={playingKey === `prep-${idx}`} />
                  <span className="font-arabic">استمع للجملة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
