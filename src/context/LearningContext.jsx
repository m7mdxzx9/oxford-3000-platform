import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from './SettingsContext';
import { calculateNextSRS, isWordDueForReview, SRS_RATINGS } from '../utils/srsUtils';
import { StorageAdapter } from '../services/storageAdapter';

const LearningContext = createContext(null);

export const LearningProvider = ({ children }) => {
  const { authUser } = useSettings();
  const activeUsername = authUser?.username || 'guest';

  // 1. User-Isolated Live Realistic Stats & Activity
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [mastered, setMastered] = useState([]);
  const [customWords, setCustomWords] = useState([]);
  const [srsRecords, setSrsRecords] = useState({});
  const [activityLog, setActivityLog] = useState([]);

  // Load user data whenever active user changes
  useEffect(() => {
    if (!authUser) {
      setXp(0);
      setStreak(0);
      setFavorites([]);
      setMastered([]);
      setCustomWords([]);
      setSrsRecords({});
      setActivityLog([]);
      return;
    }

    const uKey = activeUsername;
    const loadedFavorites = StorageAdapter.getUserItem(uKey, 'favorites', []);
    const loadedMastered = StorageAdapter.getUserItem(uKey, 'mastered', []);
    const loadedCustom = StorageAdapter.getUserItem(uKey, 'custom_words', []);
    const loadedSRS = StorageAdapter.getUserItem(uKey, 'srs', {});
    const loadedActivity = StorageAdapter.getUserItem(uKey, 'activity_log', []);
    const loadedXP = StorageAdapter.getUserItem(uKey, 'xp', 0);

    // Realistic Daily Streak calculation based on actual calendar days
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastActive = StorageAdapter.getUserItem(uKey, 'last_active_date', null);
    let currentStreak = StorageAdapter.getUserItem(uKey, 'streak', 1);

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    StorageAdapter.setUserItem(uKey, 'last_active_date', todayStr);
    StorageAdapter.setUserItem(uKey, 'streak', currentStreak);

    setFavorites(loadedFavorites);
    setMastered(loadedMastered);
    setCustomWords(loadedCustom);
    setSrsRecords(loadedSRS);
    setActivityLog(loadedActivity);
    setXp(loadedXP);
    setStreak(currentStreak);
  }, [authUser, activeUsername]);

  // Record Activity and XP
  const recordActivity = useCallback((type, title, earnedXp = 0, details = '') => {
    if (!authUser) return;
    const uKey = authUser.username;
    const newEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      type,
      title,
      earnedXp,
      details,
      timestamp: Date.now(),
    };

    setActivityLog((prev) => {
      const updated = [newEntry, ...prev].slice(0, 50);
      StorageAdapter.setUserItem(uKey, 'activity_log', updated);
      return updated;
    });

    if (earnedXp > 0) {
      setXp((prev) => {
        const nextXp = prev + earnedXp;
        StorageAdapter.setUserItem(uKey, 'xp', nextXp);
        return nextXp;
      });
    }
  }, [authUser]);

  const addXp = useCallback((amount = 10, reason = 'نشاط دراسي') => {
    recordActivity('xp_gain', reason, amount);
  }, [recordActivity]);

  // Favorites & Mastery
  const toggleFavorite = useCallback((wordTerm) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setFavorites((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      StorageAdapter.setUserItem(uKey, 'favorites', updated);
      if (!exists) {
        recordActivity('favorite', `إضافة "${wordTerm}" إلى المفضلة ⭐`, 5);
      }
      return updated;
    });
  }, [authUser, recordActivity]);

  const isFavorite = useCallback((wordTerm) => favorites.includes(wordTerm), [favorites]);

  const toggleMastered = useCallback((wordTerm) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setMastered((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      StorageAdapter.setUserItem(uKey, 'mastered', updated);
      if (!exists) {
        recordActivity('mastered', `إتقان الكلمة "${wordTerm}" بنجاح 🎓`, 15);
      }
      return updated;
    });
  }, [authUser, recordActivity]);

  const isMastered = useCallback((wordTerm) => mastered.includes(wordTerm), [mastered]);

  const addCustomWord = useCallback((newWordObj) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setCustomWords((prev) => {
      const updated = [newWordObj, ...prev];
      StorageAdapter.setUserItem(uKey, 'custom_words', updated);
      recordActivity('custom_word', `إضافة مفردة جديدة بالذكاء الاصطناعي "${newWordObj.word}" ✨`, 20);
      return updated;
    });
  }, [authUser, recordActivity]);

  // Spaced Repetition (SRS)
  const rateWordSRS = useCallback((wordTerm, rating = SRS_RATINGS.GOOD) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setSrsRecords((prev) => {
      const current = prev[wordTerm] || {};
      const updated = calculateNextSRS(current, rating);
      const nextRecords = { ...prev, [wordTerm]: updated };
      StorageAdapter.setUserItem(uKey, 'srs', nextRecords);

      const ratingNames = { 1: 'إعادة مراجعة', 2: 'صعبة', 3: 'جيدة', 4: 'سهلة ومتقنة' };
      recordActivity('srs_review', `مراجعة تكرار متباعد: "${wordTerm}" (${ratingNames[rating] || 'تقييم'}) 🧠`, 10);
      return nextRecords;
    });
  }, [authUser, recordActivity]);

  const dueSRSCount = useMemo(() => {
    return Object.values(srsRecords).filter(isWordDueForReview).length;
  }, [srsRecords]);

  // Storyteller Selection
  const [selectedWords, setSelectedWords] = useState([]);

  const toggleSelectWord = useCallback((wordObj) => {
    setSelectedWords((prev) => {
      const exists = prev.some((w) => (typeof w === 'string' ? w : w.word) === (typeof wordObj === 'string' ? wordObj : wordObj.word));
      if (exists) {
        return prev.filter((w) => (typeof w === 'string' ? w : w.word) !== (typeof wordObj === 'string' ? wordObj : wordObj.word));
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, wordObj];
      }
    });
  }, []);

  const clearSelectedWords = useCallback(() => setSelectedWords([]), []);

  const isSelectedWord = useCallback(
    (wordObj) => selectedWords.some((w) => (typeof w === 'string' ? w : w.word) === (typeof wordObj === 'string' ? wordObj : wordObj.word)),
    [selectedWords]
  );

  const value = useMemo(() => ({
    xp,
    addXp,
    streak,
    activityLog,
    recordActivity,
    favorites,
    favoritesCount: favorites.length,
    toggleFavorite,
    isFavorite,
    mastered,
    masteredCount: mastered.length,
    toggleMastered,
    isMastered,
    srsRecords,
    rateWordSRS,
    dueSRSCount,
    customWords,
    addCustomWord,
    selectedWords,
    toggleSelectWord,
    clearSelectedWords,
    isSelectedWord,
    selectedWordsCount: selectedWords.length,
  }), [
    xp,
    addXp,
    streak,
    activityLog,
    recordActivity,
    favorites,
    toggleFavorite,
    isFavorite,
    mastered,
    toggleMastered,
    isMastered,
    srsRecords,
    rateWordSRS,
    dueSRSCount,
    customWords,
    addCustomWord,
    selectedWords,
    toggleSelectWord,
    clearSelectedWords,
    isSelectedWord,
  ]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return context;
};

export default LearningContext;
