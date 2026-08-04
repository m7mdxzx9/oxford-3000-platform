import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import ToastNotifications from './components/ToastNotifications';
import LexiconGrid from './components/LexiconGrid';
import SentenceGenerator from './components/SentenceGenerator';
import Storyteller from './components/Storyteller';
import PersonalTutor from './components/PersonalTutor';
import PronunciationStudio from './components/PronunciationStudio';
import Flashcards from './components/Flashcards';
import QuizGame from './components/QuizGame';
import Analytics from './components/Analytics';

function MainContent() {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeTab === 'grid' && <LexiconGrid />}
      {activeTab === 'sentence' && <SentenceGenerator />}
      {activeTab === 'story' && <Storyteller />}
      {activeTab === 'tutor' && <PersonalTutor />}
      {activeTab === 'pronunciation' && <PronunciationStudio />}
      {activeTab === 'flashcards' && <Flashcards />}
      {activeTab === 'quiz' && <QuizGame />}
      {activeTab === 'analytics' && <Analytics />}
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#060d21] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <MainContent />
        <footer className="glass-panel border-t border-cyan-900/30 py-4 px-4 text-center text-xs text-slate-400 mt-auto">
          <p>Oxford 3000™ CEFR Lexicon Application &copy; 2026. Built with React 18, Vite & Tailwind CSS.</p>
        </footer>
        <ApiKeyModal />
        <ToastNotifications />
      </div>
    </AppProvider>
  );
}
