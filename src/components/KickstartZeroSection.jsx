import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Star, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playWordAudio } from '../services/audioService';
import LiveEqualizer from './LiveEqualizer';

const ALPHABET_DATA = [
  { letter: 'Aa', sound: '/eɪ/', example: 'Apple (تفاحة)', word: 'apple' },
  { letter: 'Bb', sound: '/biː/', example: 'Book (كتاب)', word: 'book' },
  { letter: 'Cc', sound: '/siː/', example: 'Cat (قطة)', word: 'cat' },
  { letter: 'Dd', sound: '/diː/', example: 'Door (باب)', word: 'door' },
  { letter: 'Ee', sound: '/iː/', example: 'Egg (بيضة)', word: 'egg' },
  { letter: 'Ff', sound: '/ef/', example: 'Fish (سمكة)', word: 'fish' },
  { letter: 'Gg', sound: '/dʒiː/', example: 'Girl (فتاة)', word: 'girl' },
  { letter: 'Hh', sound: '/eɪtʃ/', example: 'House (منزل)', word: 'house' },
  { letter: 'Ii', sound: '/aɪ/', example: 'Ice (جليد)', word: 'ice' },
  { letter: 'Jj', sound: '/dʒeɪ/', example: 'Juice (عصير)', word: 'juice' },
  { letter: 'Kk', sound: '/keɪ/', example: 'Key (مفتاح)', word: 'key' },
  { letter: 'Ll', sound: '/el/', example: 'Lion (أسد)', word: 'lion' },
  { letter: 'Mm', sound: '/em/', example: 'Moon (قمر)', word: 'moon' },
  { letter: 'Nn', sound: '/en/', example: 'Night (ليل)', word: 'night' },
  { letter: 'Oo', sound: '/oʊ/', example: 'Orange (برتقال)', word: 'orange' },
  { letter: 'Pp', sound: '/piː/', example: 'Pen (قلم)', word: 'pen' },
  { letter: 'Qq', sound: '/kjuː/', example: 'Queen (ملكة)', word: 'queen' },
  { letter: 'Rr', sound: '/ɑːr/', example: 'Rain (مطر)', word: 'rain' },
  { letter: 'Ss', sound: '/es/', example: 'Sun (شمس)', word: 'sun' },
  { letter: 'Tt', sound: '/tiː/', example: 'Tree (شجرة)', word: 'tree' },
  { letter: 'Uu', sound: '/juː/', example: 'Umbrella (مظلة)', word: 'umbrella' },
  { letter: 'Vv', sound: '/viː/', example: 'Van (شاحنة)', word: 'van' },
  { letter: 'Ww', sound: '/ˈdʌb.əl.juː/', example: 'Water (ماء)', word: 'water' },
  { letter: 'Xx', sound: '/eks/', example: 'Box (صندوق)', word: 'box' },
  { letter: 'Yy', sound: '/waɪ/', example: 'Yellow (أصفر)', word: 'yellow' },
  { letter: 'Zz', sound: '/zed/ or /ziː/', example: 'Zoo (حديقة حيوان)', word: 'zoo' },
];

const SURVIVAL_PHRASES = [
  { en: 'Hello, how are you?', ar: 'مرحباً، كيف حالك؟', audioText: 'Hello, how are you?' },
  { en: 'Nice to meet you.', ar: 'تشرفت بلقائك.', audioText: 'Nice to meet you.' },
  { en: 'Excuse me, where is the restroom?', ar: 'معذرة، أين دورة المياه؟', audioText: 'Excuse me, where is the restroom?' },
  { en: 'Could you please help me?', ar: 'هل يمكنك مساعدتي من فضلك؟', audioText: 'Could you please help me?' },
  { en: 'How much does this cost?', ar: 'كم سعر هذا الشيء؟', audioText: 'How much does this cost?' },
  { en: 'I do not understand English very well.', ar: 'أنا لا أفهم الإنجليزية جيداً.', audioText: 'I do not understand English very well.' },
  { en: 'Can you speak more slowly, please?', ar: 'هل يمكنك التحدث ببطء أكثر، من فضلك؟', audioText: 'Can you speak more slowly, please?' },
  { en: 'Thank you very much for your help!', ar: 'شكراً جزيلاً على مساعدتك!', audioText: 'Thank you very much for your help!' },
];

const PRONOUNS = [
  { pronoun: 'I', ar: 'أنا', ex: 'I am a student.' },
  { pronoun: 'You', ar: 'أنتَ / أنتِ / أنتم', ex: 'You are welcome.' },
  { pronoun: 'He', ar: 'هو (للمفرد المذكر)', ex: 'He is my brother.' },
  { pronoun: 'She', ar: 'هي (للمفرد المؤنث)', ex: 'She is a doctor.' },
  { pronoun: 'It', ar: 'هو / هي (لغير العاقل)', ex: 'It is a sunny day.' },
  { pronoun: 'We', ar: 'نحن', ex: 'We are learning English.' },
  { pronoun: 'They', ar: 'هم / هما / هن', ex: 'They are happy.' },
];

export default function KickstartZeroSection() {
  const { voicePreset, audioSpeed } = useApp();
  const [activeTab, setActiveTab] = useState('alphabet'); // alphabet | pronouns | survival
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xl">
              🌱
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-arabic flex items-center gap-2">
                <span>قسم قفزة البداية للمبتدئين الصفر</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">
                  Absolute Zero
                </span>
              </h2>
              <p className="text-xs sm:text-sm opacity-75 font-arabic">
                كل ما تحتاجه للبدء من الصفر: نطق الحروف، الضمائر الأساسية، وعبارات النجاة الأولى
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t font-arabic">
          <button
            onClick={() => setActiveTab('alphabet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'alphabet' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>الحروف الإنجليزية (A-Z)</span>
          </button>
          <button
            onClick={() => setActiveTab('pronouns')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pronouns' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>الضمائر وتكوين الجمل</span>
          </button>
          <button
            onClick={() => setActiveTab('survival')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'survival' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <span>عبارات المحادثة الأولى</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Alphabet Cards Grid */}
      {activeTab === 'alphabet' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 dropdown-animate">
          {ALPHABET_DATA.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-2xl border shadow-md card-theme-target text-center space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl font-black font-mono text-cyan-400">{item.letter}</div>
                <div className="text-xs font-mono opacity-70">{item.sound}</div>
                <div className="text-xs font-bold font-arabic mt-1 opacity-90">{item.example}</div>
              </div>

              <button
                onClick={() => handlePlay(item.word, `letter-${idx}`)}
                className="w-full py-1.5 rounded-xl theme-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <LiveEqualizer isPlaying={playingKey === `letter-${idx}`} />
                <span className="font-arabic">نطق</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Pronouns */}
      {activeTab === 'pronouns' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 dropdown-animate">
          {PRONOUNS.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border shadow-md card-theme-target space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-emerald-400 ltr-token">
                  {item.pronoun}
                </span>
                <span className="text-sm font-bold font-arabic opacity-80">{item.ar}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs italic font-medium ltr-token">
                "{item.ex}"
              </div>
              <button
                onClick={() => handlePlay(item.ex, `pronoun-${idx}`)}
                className="w-full py-2 rounded-xl theme-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <LiveEqualizer isPlaying={playingKey === `pronoun-${idx}`} />
                <span className="font-arabic">استمع للجملة</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Survival Phrases */}
      {activeTab === 'survival' && (
        <div className="space-y-3 dropdown-animate">
          {SURVIVAL_PHRASES.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 sm:p-5 rounded-2xl border shadow-md card-theme-target flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
            >
              <div className="space-y-1">
                <div className="text-sm sm:text-base font-bold ltr-token text-slate-900 dark:text-slate-100">
                  {item.en}
                </div>
                <div className="text-xs sm:text-sm font-bold font-arabic text-emerald-600 dark:text-emerald-400">
                  {item.ar}
                </div>
              </div>

              <button
                onClick={() => handlePlay(item.audioText, `survival-${idx}`)}
                className="px-4 py-2 rounded-xl theme-btn-primary text-xs font-bold flex items-center gap-2 active:scale-95 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <LiveEqualizer isPlaying={playingKey === `survival-${idx}`} />
                <span className="font-arabic">نطق العبارة</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
