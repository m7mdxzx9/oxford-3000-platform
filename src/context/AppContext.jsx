import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../data/translations';
import { DEFAULT_GEMINI_KEY } from '../services/geminiService';
import { VOICE_PRESETS } from '../services/audioService';
import { playTabSwitchSound, playSuccessChime } from '../services/soundEffects';
import { calculateNextSRS, isWordDueForReview, SRS_RATINGS } from '../utils/srsUtils';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  AUTH_USER: 'oxford3000_auth_user',
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
  SRS: 'oxford3000_srs_records',
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
  { id: 'brutalism', name: 'النيو-بروتاليزم (أكسفورد كلاسيك)', emoji: '⚡', label: 'Neo-Brutalism', font: 'Cairo & Inter' },
  { id: 'organic', name: 'التيراكوتا الطبيعي (Organic)', emoji: '🌿', label: 'Terracotta', font: 'Tajawal & Cairo' },
  { id: 'swiss', name: 'المينيمالي السويسري (Swiss Red)', emoji: '🇨🇭', label: 'Swiss Red', font: 'Inter & Cairo' },
];

export const AppProvider = ({ children }) => {
  // 1. Authentication State
  const [authUser, setAuthUser] = useState(() => loadFromStorage(STORAGE_KEYS.AUTH_USER, null));

  const loginUser = useCallback((userObj) => {
    setAuthUser(userObj);
    saveToStorage(STORAGE_KEYS.AUTH_USER, userObj);
  }, []);

  const logoutUser = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }, []);

  // 2. Navigation & Notifications
  const [activeTab, setActiveTabState] = useState('grid');
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const setActiveTab = useCallback((newTab) => {
    try {
      playTabSwitchSound();
    } catch (e) {}
    setActiveTabState(newTab);
  }, []);

  // 3. Theme & Appearance
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('uqu_theme') || localStorage.getItem(STORAGE_KEYS.THEME);
    return stored || 'brutalism';
  });

  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem('uqu_mode') || localStorage.getItem(STORAGE_KEYS.MODE);
    return stored || 'dark';
  });

  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return stored || 'ar';
  });

  const [voicePreset, setVoicePreset] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_PRESET);
    return stored || 'us-female';
  });

  const [audioSpeed, setAudioSpeed] = useState(() => {
    const stored = localStorage.getItem('oxford3000_audio_speed');
    return stored ? parseFloat(stored) : 1.0;
  });

  // 4. Offline State (Feature 63)
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addNotification('تمت استعادة الاتصال بالإنترنت 🟢', 'success', 3000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      addNotification('وضع عدم الاتصال مفعل - جميع المفردات والبطاقات متاحة محلياً 💾', 'info', 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  // 5. XP & Streak Tracking (Feature 71)
  const [xp, setXp] = useState(() => loadFromStorage(STORAGE_KEYS.XP, 120));
  const [streak, setStreak] = useState(() => loadFromStorage(STORAGE_KEYS.STREAK, 3));

  const addXp = useCallback((amount = 10) => {
    setXp((prev) => {
      const next = prev + amount;
      saveToStorage(STORAGE_KEYS.XP, next);
      return next;
    });
  }, []);

  // 6. Lexicon, Favorites, Mastered & Custom
  const [favorites, setFavorites] = useState(() => loadFromStorage(STORAGE_KEYS.FAVORITES, []));
  const [mastered, setMastered] = useState(() => loadFromStorage(STORAGE_KEYS.MASTERED, []));
  const [customWords, setCustomWords] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOM_WORDS, []));
  const [selectedWords, setSelectedWords] = useState([]);

  // 7. Spaced Repetition (SRS) Records (Feature 31)
  const [srsRecords, setSrsRecords] = useState(() => loadFromStorage(STORAGE_KEYS.SRS, {}));

  const rateWordSRS = useCallback((wordTerm, rating = SRS_RATINGS.GOOD) => {
    setSrsRecords((prev) => {
      const current = prev[wordTerm] || {};
      const updated = calculateNextSRS(current, rating);
      const nextRecords = { ...prev, [wordTerm]: updated };
      saveToStorage(STORAGE_KEYS.SRS, nextRecords);
      return nextRecords;
    });
  }, []);

  // Calculate Due Reviews Count
  const dueSRSCount = Object.values(srsRecords).filter(isWordDueForReview).length;

  // 8. API Keys & Modals
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored !== null && stored.trim() !== '' ? stored : DEFAULT_GEMINI_KEY;
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Sync Root Theme / Mode Attributes
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
    const langDict = translations[language] || translations.ar || translations.en;
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

  const toggleFavorite = useCallback((wordTerm) => {
    setFavorites((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      addNotification(
        exists ? `تمت إزالة "${wordTerm}" من المفضلة` : `تمت إضافة "${wordTerm}" إلى المفضلة ⭐`,
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
        exists ? `تم إلغاء تمييز "${wordTerm}" كمتقن` : `تم تمييز "${wordTerm}" كـ كلمة متقنة 🎯`,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  }, [addNotification]);

  const isMastered = useCallback((wordTerm) => mastered.includes(wordTerm), [mastered]);

  const addCustomWord = useCallback((wordObj) => {
    setCustomWords((prev) => [wordObj, ...prev]);
    addNotification(`تمت إضافة كلمة مخصصة: "${wordObj.word}"`, 'success');
  }, [addNotification]);

  const clearSelectedWords = useCallback(() => {
    setSelectedWords([]);
    addNotification('تم تفريغ الكلمات المحددة', 'info', 2000);
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
    authUser,
    loginUser,
    logoutUser,
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
    isOffline,
    xp,
    addXp,
    streak,
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
