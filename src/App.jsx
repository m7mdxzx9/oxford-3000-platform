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
    <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 xl:pb-8">
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
      <div
        id="theme-app"
        className="min-h-screen flex flex-col transition-colors duration-300 font-sans"
        style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}
      >
        <Navbar />
        <MainContent />
        <footer className="glass-panel border-t py-4 px-4 text-center text-xs opacity-75 mt-auto">
          <p>Oxford 3000™ CEFR Lexicon Application &copy; 2026. Built with React 18, Vite & Tailwind CSS.</p>
        </footer>
        <ApiKeyModal />
        <ToastNotifications />
      </div>
    </AppProvider>
  );
}
