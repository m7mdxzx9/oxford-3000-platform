import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DualPlayerHeader from './dual-player/DualPlayerHeader';
import RoleplayDialogueTab from './dual-player/RoleplayDialogueTab';
import WordChainDuelTab from './dual-player/WordChainDuelTab';
import QuizDuelTab from './dual-player/QuizDuelTab';
import SiblingLeaderboardTab from './dual-player/SiblingLeaderboardTab';
import DualPlayerLoginModal from './dual-player/DualPlayerLoginModal';

/**
 * DualPlayerHub Component (قسم التعلم المشترك والتحدي الثنائي)
 * Clean modular architecture composed of 6 specialized submodules.
 */
export default function DualPlayerHub() {
  const { voicePreset, audioSpeed, apiKey, addNotification } = useApp();

  // 1. User Session State
  const [activeUser, setActiveUser] = useState(() => {
    try {
      return localStorage.getItem('oxford3000_user_session') || 'guest';
    } catch (e) {
      return 'guest';
    }
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [subTab, setSubTab] = useState('dialogue');

  // 2. Sibling Scoreboard State
  const [stats, setStats] = useState(() => {
    const defaultStats = {
      محمد: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
      ريوف: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
    };
    try {
      const stored = localStorage.getItem('oxford3000_sibling_stats');
      return stored ? JSON.parse(stored) : defaultStats;
    } catch (e) {
      return defaultStats;
    }
  });

  const updateSiblingStat = (user, field, delta = 1) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        [user]: {
          ...prev[user],
          [field]: (prev[user]?.[field] || 0) + delta,
        },
      };
      try {
        localStorage.setItem('oxford3000_sibling_stats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetStats = () => {
    if (window.confirm('هل أنت متأكد من تصفير سجلات لوحة الصدارة؟')) {
      const cleared = {
        محمد: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
        ريوف: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
      };
      setStats(cleared);
      try {
        localStorage.setItem('oxford3000_sibling_stats', JSON.stringify(cleared));
      } catch (e) {}
      addNotification('تم تصفير لوحة الصدارة بنجاح.', 'info');
    }
  };

  const handleLoginSuccess = (username) => {
    setActiveUser(username);
    try {
      localStorage.setItem('oxford3000_user_session', username);
    } catch (e) {}
    addNotification(`تم تسجيل الدخول بنجاح كـ ${username} 👋`, 'success');
  };

  const handleLogout = () => {
    setActiveUser('guest');
    try {
      localStorage.removeItem('oxford3000_user_session');
    } catch (e) {}
    addNotification('تم تسجيل الخروج.', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Header & Navigation */}
      <DualPlayerHeader
        activeUser={activeUser}
        subTab={subTab}
        setSubTab={setSubTab}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Active Tab Sub-module */}
      {subTab === 'dialogue' && (
        <RoleplayDialogueTab
          activeUser={activeUser}
          voicePreset={voicePreset}
          audioSpeed={audioSpeed}
          apiKey={apiKey}
          addNotification={addNotification}
        />
      )}

      {subTab === 'chain' && (
        <WordChainDuelTab
          activeUser={activeUser}
          voicePreset={voicePreset}
          audioSpeed={audioSpeed}
          updateSiblingStat={updateSiblingStat}
          addNotification={addNotification}
        />
      )}

      {subTab === 'quiz' && (
        <QuizDuelTab
          activeUser={activeUser}
          voicePreset={voicePreset}
          audioSpeed={audioSpeed}
          updateSiblingStat={updateSiblingStat}
          addNotification={addNotification}
        />
      )}

      {subTab === 'leaderboard' && (
        <SiblingLeaderboardTab
          stats={stats}
          onResetStats={handleResetStats}
          addNotification={addNotification}
        />
      )}

      {/* 3. Authentication & Account Modal */}
      <DualPlayerLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        activeUser={activeUser}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
