import React, { useEffect, useState, useMemo } from 'react';
import { Palette } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import ApiKeyModal from './components/ApiKeyModal';
import ToastNotifications from './components/ToastNotifications';
import ThemeColorStudioModal from './components/ThemeColorStudioModal';
import BackupRestoreModal from './components/BackupRestoreModal';
import LexiconGrid from './components/LexiconGrid';


import KickstartZeroSection from './components/KickstartZeroSection';
import B1BridgeSection from './components/B1BridgeSection';
import SpeedListeningDrill from './components/SpeedListeningDrill';
import MinimalPairsTrainer from './components/MinimalPairsTrainer';
import SpellingBee from './components/SpellingBee';
import ActiveRecallTrainer from './components/ActiveRecallTrainer';
import VoiceArchiveStudio from './components/VoiceArchiveStudio';
import SentenceGenerator from './components/SentenceGenerator';
import Storyteller from './components/Storyteller';
import PersonalTutor from './components/PersonalTutor';
import PronunciationStudio from './components/PronunciationStudio';
import WordChainGame from './components/WordChainGame';
import DualPlayerHub from './components/DualPlayerHub';
import WordDetectiveGame from './components/WordDetectiveGame';
import Flashcards from './components/Flashcards';
import QuizGame from './components/QuizGame';
import Analytics from './components/Analytics';

function AmbientBackgroundMesh({ activeTab }) {
  const orbColors = useMemo(() => {
    switch (activeTab) {
      case 'grid':
      case 'kickstart':
      case 'bridge':
      case 'flashcards':
        return {
          orb1: 'bg-cyan-500/20',
          orb2: 'bg-emerald-500/20',
        };
      case 'speed-drill':
      case 'minimal-pairs':
      case 'spelling-bee':
      case 'active-recall':
      case 'voice-archive':
      case 'pronunciation':
        return {
          orb1: 'bg-purple-500/20',
          orb2: 'bg-rose-500/20',
        };
      case 'sentence':
      case 'story':
      case 'tutor':
        return {
          orb1: 'bg-indigo-500/20',
          orb2: 'bg-cyan-500/20',
        };
      case 'quiz':
      case 'chain':
      case 'detective':
      case 'dual':
        return {
          orb1: 'bg-amber-500/20',
          orb2: 'bg-orange-500/20',
        };
      case 'analytics':
      default:
        return {
          orb1: 'bg-sky-500/20',
          orb2: 'bg-teal-500/20',
        };
    }
  }, [activeTab]);

  return (
    <div
      className="ambient-glow-mesh pointer-events-none"
      style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
    >
      <div
        className={`ambient-orb w-[420px] h-[420px] -top-32 -start-32 ${orbColors.orb1} animate-float-orb-1`}
        style={{ willChange: 'transform' }}
      />
      <div
        className={`ambient-orb w-[480px] h-[480px] top-1/3 -end-40 ${orbColors.orb2} animate-float-orb-2`}
        style={{ willChange: 'transform' }}
      />
      <div
        className={`ambient-orb w-[360px] h-[360px] -bottom-24 start-1/3 ${orbColors.orb1} animate-float-orb-1`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}

function PageTransitionBar({ activeTab }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (!animating) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-500 top-progress-bar shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
    </div>
  );
}

function MainContent() {
  const { activeTab } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 xl:pb-8 relative z-10">
      <div key={activeTab} className="section-enter-animation">
        {/* Vocab & Sections */}
        {activeTab === 'grid' && <LexiconGrid />}
        {activeTab === 'kickstart' && <KickstartZeroSection />}
        {activeTab === 'bridge' && <B1BridgeSection />}
        {activeTab === 'flashcards' && <Flashcards />}

        {/* Skill Laboratories */}
        {activeTab === 'speed-drill' && <SpeedListeningDrill />}
        {activeTab === 'minimal-pairs' && <MinimalPairsTrainer />}
        {activeTab === 'spelling-bee' && <SpellingBee />}
        {activeTab === 'active-recall' && <ActiveRecallTrainer />}
        {activeTab === 'voice-archive' && <VoiceArchiveStudio />}
        {activeTab === 'pronunciation' && <PronunciationStudio />}

        {/* AI & Games */}
        {activeTab === 'sentence' && <SentenceGenerator />}
        {activeTab === 'story' && <Storyteller />}
        {activeTab === 'tutor' && <PersonalTutor />}
        {activeTab === 'quiz' && <QuizGame />}
        {activeTab === 'chain' && <WordChainGame />}
        {activeTab === 'detective' && <WordDetectiveGame />}
        {activeTab === 'dual' && <DualPlayerHub />}

        {/* Growth Analytics */}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </main>
  );
}

function AppContainer() {
  const {
    authUser,
    loginUser,
    activeTab,
    isThemeModalOpen,
    setIsThemeModalOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
  } = useApp();

  // Authentication Gate: if user is not logged in, show LoginScreen
  if (!authUser) {
    return <LoginScreen onLoginSuccess={loginUser} />;
  }

  return (
    <div
      id="theme-app"
      className="min-h-screen flex flex-col transition-colors duration-500 font-sans relative overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}
    >
      <AmbientBackgroundMesh activeTab={activeTab} />
      <PageTransitionBar activeTab={activeTab} />
      <Navbar />
      <MainContent />
      <footer className="glass-panel border-t py-4 px-4 text-center text-xs opacity-75 mt-auto relative z-10 font-arabic">
        <p>منصة أكسفورد 3000™ لتعلم الإنجليزية &copy; 2026. مهيأة ومطورة بأحدث معايير CEFR.</p>
      </footer>

      {/* Floating Quick Color & Contrast Studio Trigger */}
      <button
        onClick={() => setIsThemeModalOpen(true)}
        className="fixed bottom-20 xl:bottom-6 start-4 z-40 px-3.5 py-2.5 rounded-2xl theme-btn-primary shadow-2xl flex items-center gap-2 text-xs font-black font-arabic active:scale-95 transition-all hover:scale-105 border cursor-pointer group"
        title="تخصيص ألوان الخط والمربعات والتباين"
      >
        <Palette className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
        <span>🎨 ألوان الخط والمربعات</span>
      </button>

      <ApiKeyModal />
      <ThemeColorStudioModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
      <BackupRestoreModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} />
      <ToastNotifications />
    </div>
  );
}



export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}
