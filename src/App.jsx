import React, { useEffect, useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import ToastNotifications from './components/ToastNotifications';
import FloatingXpBurst from './components/FloatingXpBurst';
import LexiconGrid from './components/LexiconGrid';
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
      case 'flashcards':
        return {
          orb1: 'bg-cyan-500/20',
          orb2: 'bg-emerald-500/20',
        };
      case 'sentence':
      case 'story':
      case 'tutor':
      case 'pronunciation':
        return {
          orb1: 'bg-purple-500/20',
          orb2: 'bg-indigo-500/20',
        };
      case 'quiz':
      case 'chain':
      case 'detective':
      case 'dual':
        return {
          orb1: 'bg-amber-500/20',
          orb2: 'bg-rose-500/20',
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
    <div className="ambient-glow-mesh">
      <div
        className={`ambient-orb w-[420px] h-[420px] -top-32 -left-32 ${orbColors.orb1} animate-float-orb-1`}
      />
      <div
        className={`ambient-orb w-[480px] h-[480px] top-1/3 -right-40 ${orbColors.orb2} animate-float-orb-2`}
      />
      <div
        className={`ambient-orb w-[360px] h-[360px] -bottom-24 left-1/3 ${orbColors.orb1} animate-float-orb-1`}
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
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden pointer-events-none">
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
        {activeTab === 'grid' && <LexiconGrid />}
        {activeTab === 'flashcards' && <Flashcards />}
        {activeTab === 'sentence' && <SentenceGenerator />}
        {activeTab === 'story' && <Storyteller />}
        {activeTab === 'dual' && <DualPlayerHub />}
        {activeTab === 'detective' && <WordDetectiveGame />}
        {activeTab === 'tutor' && <PersonalTutor />}
        {activeTab === 'pronunciation' && <PronunciationStudio />}
        {activeTab === 'chain' && <WordChainGame />}
        {activeTab === 'quiz' && <QuizGame />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </main>
  );
}

function AppContainer() {
  const { activeTab } = useApp();

  return (
    <div
      id="theme-app"
      className="min-h-screen flex flex-col transition-colors duration-500 font-sans relative overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}
    >
      <AmbientBackgroundMesh activeTab={activeTab} />
      <PageTransitionBar activeTab={activeTab} />
      <FloatingXpBurst />
      <Navbar />
      <MainContent />
      <footer className="glass-panel border-t py-4 px-4 text-center text-xs opacity-75 mt-auto relative z-10">
        <p>Oxford 3000™ CEFR Lexicon Application &copy; 2026. Built with React 18, Vite & Tailwind CSS.</p>
      </footer>
      <ApiKeyModal />
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
