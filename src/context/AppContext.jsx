import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../data/translations';
import { DEFAULT_GEMINI_KEY } from '../services/geminiService';
import { VOICE_PRESETS } from '../services/audioService';
import { playTabSwitchSound, playSuccessChime } from '../services/soundEffects';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  FAVORITES: 'oxford3000_favorites',
  MASTERED: 'oxford3000_mastered',
  API_KEY: 'oxford3000_gemini_api_key',
  CUSTOM_WORDS: 'oxford3000_custom_words',
  LANGUAGE: 'oxford3000_language',
  VOICE_PRESET: 'oxford3000_voice_preset',
  THEME: 'oxford3000_theme',
  MODE: 'oxford3000_mode',
  XP: 'oxford3000_xp',
  STREAK: 'oxford3000_streak',
};

const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {}
};

export const THEMES = [
  { id: 'brutalism', name: 'Neo-Brutalism', emoji: '⚡', label: 'Neo-Brutalism' },
  { id: 'organic', name: 'Organic Terracotta', emoji: '🌿', label: 'Terracotta' },
  { id: 'swiss', name: 'Swiss Minimalist', emoji: '🇨🇭', label: 'Swiss Red' },
];

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTabState] = useState('grid');
  const [xp, setXp] = useState(() => loadFromStorage(STORAGE_KEYS.XP, 120));
  const [dailyStreak, setDailyStreak] = useState(() => loadFromStorage(STORAGE_KEYS.STREAK, 1));
  const [lastXpBurst, setLastXpBurst] = useState(null);

  const setActiveTab = useCallback((newTab) => {
    try {
      playTabSwitchSound();
    } catch (e) {}
    setActiveTabState(newTab);
  }, []);

  const addXp = useCallback((amount, reason) => {
    setXp((prev) => {
      const next = prev + amount;
      saveToStorage(STORAGE_KEYS.XP, next);
      return next;
    });

    try {
      playSuccessChime();
    } catch (e) {}

    setLastXpBurst({ amount, reason, id: Date.now() });

    if (reason) {
      addNotification(`+${amount} XP: ${reason} 🌟`, 'success', 2500);
    }
  }, [addNotification]);

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('uqu_theme') || localStorage.getItem(STORAGE_KEYS.THEME);
    return stored || 'brutalism';
  });

  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('uqu_mode') || localStorage.getItem(STORAGE_KEYS.MODE);
    return stored || 'light';
  });

  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return stored || 'en';
  });

  const [voicePreset, setVoicePreset] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_PRESET);
    return stored || 'us-female';
  });

  const [audioSpeed, setAudioSpeed] = useState(() => {
    const stored = localStorage.getItem('oxford3000_audio_speed');
    return stored ? parseFloat(stored) : 0.9;
  });

  const [favorites, setFavorites] = useState(() => loadFromStorage(STORAGE_KEYS.FAVORITES, []));
  const [mastered, setMastered] = useState(() => loadFromStorage(STORAGE_KEYS.MASTERED, []));
  const [customWords, setCustomWords] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOM_WORDS, []));
  const [selectedWords, setSelectedWords] = useState([]);

  // Default API Key set to provided Gemini key AIzaSyC747z4ewiUEQTenTLdphM11WLbr1EVbXs
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored !== null && stored.trim() !== '' ? stored : DEFAULT_GEMINI_KEY;
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Update root data-theme and data-mode attributes whenever theme or mode changes
  useEffect(() => {
    localStorage.setItem('uqu_theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('uqu_mode', mode);
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOICE_PRESET, voicePreset);
  }, [voicePreset]);

  const t = useCallback((key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  useEffect(() => { saveToStorage(STORAGE_KEYS.FAVORITES, favorites); }, [favorites]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.MASTERED, mastered); }, [mastered]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CUSTOM_WORDS, customWords); }, [customWords]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }, [apiKey]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => { removeNotification(id); }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleFavorite = useCallback((wordTerm) => {
    setFavorites((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      addNotification(
        exists ? `Removed "${wordTerm}" from favorites` : `Added "${wordTerm}" to favorites`,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  }, [addNotification]);

  const isFavorite = useCallback((wordTerm) => favorites.includes(wordTerm), [favorites]);

  const toggleMastered = useCallback((wordTerm) => {
    setMastered((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      addNotification(
        exists ? `Unmarked "${wordTerm}" as mastered` : `Marked "${wordTerm}" as mastered`,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  }, [addNotification]);

  const isMastered = useCallback((wordTerm) => mastered.includes(wordTerm), [mastered]);

  const addCustomWord = useCallback((wordObj) => {
    setCustomWords((prev) => [wordObj, ...prev]);
    addNotification(`Added custom word: "${wordObj.word}"`, 'success');
  }, [addNotification]);

  const level = Math.floor(xp / 100) + 1;

  const clearSelectedWords = useCallback(() => {
    setSelectedWords([]);
    addNotification('Cleared selected words', 'info', 2000);
  }, [addNotification]);

  const toggleSelectWord = useCallback((wordObj) => {
    setSelectedWords((prev) => {
      const exists = prev.some((w) => w.word === wordObj.word);
      if (exists) {
        return prev.filter((w) => w.word !== wordObj.word);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, wordObj];
      }
    });
  }, []);

  const isSelectedWord = useCallback(
    (wordObj) => selectedWords.some((w) => w.word === wordObj.word),
    [selectedWords]
  );

  const value = {
    theme,
    setTheme,
    mode,
    setMode,
    toggleMode,
    THEMES,
    activeTab,
    setActiveTab,
    language,
    toggleLanguage,
    voicePreset,
    setVoicePreset,
    voicePresets: VOICE_PRESETS,
    audioSpeed,
    setAudioSpeed,
    favorites,
    favoritesCount: favorites.length,
    toggleFavorite,
    isFavorite,
    mastered,
    masteredCount: mastered.length,
    toggleMastered,
    isMastered,
    customWords,
    addCustomWord,
    selectedWords,
    toggleSelectWord,
    clearSelectedWords,
    isSelectedWord,
    selectedWordsCount: selectedWords.length,
    xp,
    addXp,
    lastXpBurst,
    setLastXpBurst,
    level,
    dailyStreak,
    apiKey,
    setApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    notifications,
    addNotification,
    removeNotification,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
