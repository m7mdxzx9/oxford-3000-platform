import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '../data/translations';
import { DEFAULT_GEMINI_KEY } from '../services/geminiService';
import { VOICE_PRESETS } from '../services/audioService';
import { playTabSwitchSound, playSuccessChime } from '../services/soundEffects';
import { calculateNextSRS, isWordDueForReview, SRS_RATINGS } from '../utils/srsUtils';
import { THEME_DEFINITIONS } from '../utils/themePalettes';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  AUTH_USER: 'oxford3000_auth_user',
  THEME: 'oxford3000_theme',
  COLOR_PALETTE: 'oxford3000_color_palette',
  MODE: 'oxford3000_mode',
  LANGUAGE: 'oxford3000_language',
  VOICE_PRESET: 'oxford3000_voice_preset',
  AUDIO_SPEED: 'oxford3000_audio_speed',
  API_KEY: 'oxford3000_gemini_api_key',
};

const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : fallback;
  } catch (err) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {}
};

/**
 * User-Scoped Storage Helper:
 * Ensures complete data isolation between "محمد" and "ريوف"
 */
const getUserKey = (username, key) => {
  const safeUser = username ? encodeURIComponent(username.trim()) : 'guest';
  return `oxford3000_user_${safeUser}_${key}`;
};

export const THEMES = [
  { id: 'brutalism', name: 'النيو-بروتاليزم (أكسفورد كلاسيك)', emoji: '⚡', label: 'Neo-Brutalism', font: 'Cairo & Inter' },
  { id: 'organic', name: 'التيراكوتا الطبيعي (Organic)', emoji: '🌿', label: 'Terracotta', font: 'Tajawal & Cairo' },
  { id: 'swiss', name: 'المينيمالي السويسري (Swiss Red)', emoji: '🇨🇭', label: 'Swiss Red', font: 'Inter & Cairo' },
];

export const AppProvider = ({ children }) => {
  // 1. Authentication State
  const [authUser, setAuthUser] = useState(() => loadFromStorage(STORAGE_KEYS.AUTH_USER, null));

  const activeUsername = authUser?.username || 'guest';

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

  // 3. Theme & Appearance with Custom Color Palette Switching
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'brutalism';
  });

  const [colorPaletteId, setColorPaletteId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.COLOR_PALETTE) || 'default';
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MODE) || 'dark';
  });

  // Apply dynamic color palettes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);

    const themeDef = THEME_DEFINITIONS[theme];
    if (themeDef && themeDef.palettes) {
      const activePalette = themeDef.palettes.find((p) => p.id === colorPaletteId) || themeDef.palettes[0];
      if (activePalette) {
        const accent = mode === 'dark' ? activePalette.accentDark : activePalette.accentLight;
        const shadow = mode === 'dark' ? activePalette.shadowColorDark : activePalette.shadowColorLight;

        root.style.setProperty('--bg-accent', accent);
        root.style.setProperty('--bg-accent-hover', activePalette.accentHover);
        if (theme === 'brutalism') {
          root.style.setProperty('--shadow-btn', `3px 3px 0px ${shadow}`);
          root.style.setProperty('--shadow-card', `4px 4px 0px ${shadow}`);
        } else {
          root.style.setProperty('--shadow-btn', `0 4px 14px ${shadow}`);
        }
      }
    }
  }, [theme, colorPaletteId, mode]);

  const selectColorPalette = useCallback((paletteId) => {
    setColorPaletteId(paletteId);
    localStorage.setItem(STORAGE_KEYS.COLOR_PALETTE, paletteId);
  }, []);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'ar';
  });

  const [voicePreset, setVoicePreset] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.VOICE_PRESET) || 'us-female';
  });

  const [audioSpeed, setAudioSpeed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_SPEED);
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

  // 5. User-Isolated Live Realistic Stats & Activity (ZERO FAKE DATA)
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
    const loadedFavorites = loadFromStorage(getUserKey(uKey, 'favorites'), []);
    const loadedMastered = loadFromStorage(getUserKey(uKey, 'mastered'), []);
    const loadedCustom = loadFromStorage(getUserKey(uKey, 'custom_words'), []);
    const loadedSRS = loadFromStorage(getUserKey(uKey, 'srs'), {});
    const loadedActivity = loadFromStorage(getUserKey(uKey, 'activity_log'), []);
    const loadedXP = loadFromStorage(getUserKey(uKey, 'xp'), 0);

    // Realistic Daily Streak calculation based on actual calendar days
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastActive = loadFromStorage(getUserKey(uKey, 'last_active_date'), null);
    let currentStreak = loadFromStorage(getUserKey(uKey, 'streak'), 1);

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(todayStr);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged in on consecutive day -> increment streak
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed one or more days -> reset streak to 1
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    saveToStorage(getUserKey(uKey, 'last_active_date'), todayStr);
    saveToStorage(getUserKey(uKey, 'streak'), currentStreak);

    setFavorites(loadedFavorites);
    setMastered(loadedMastered);
    setCustomWords(loadedCustom);
    setSrsRecords(loadedSRS);
    setActivityLog(loadedActivity);
    setXp(loadedXP);
    setStreak(currentStreak);
  }, [authUser, activeUsername]);

  // Record Real Activity and XP
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
      const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50 activities
      saveToStorage(getUserKey(uKey, 'activity_log'), updated);
      return updated;
    });

    if (earnedXp > 0) {
      setXp((prev) => {
        const nextXp = prev + earnedXp;
        saveToStorage(getUserKey(uKey, 'xp'), nextXp);
        return nextXp;
      });
    }
  }, [authUser]);

  const addXp = useCallback((amount = 10, reason = 'نشاط دراسي') => {
    recordActivity('xp_gain', reason, amount);
  }, [recordActivity]);

  const loginUser = useCallback((userObj) => {
    setAuthUser(userObj);
    saveToStorage(STORAGE_KEYS.AUTH_USER, userObj);
  }, []);

  const logoutUser = useCallback(() => {
    setAuthUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }, []);

  // 6. Real Live Lexicon Interactivity Actions
  const toggleFavorite = useCallback((wordTerm) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setFavorites((prev) => {
      const exists = prev.includes(wordTerm);
      const updated = exists ? prev.filter((w) => w !== wordTerm) : [...prev, wordTerm];
      saveToStorage(getUserKey(uKey, 'favorites'), updated);
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
      saveToStorage(getUserKey(uKey, 'mastered'), updated);
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
      saveToStorage(getUserKey(uKey, 'custom_words'), updated);
      recordActivity('custom_word', `إضافة مفردة جديدة بالذكاء الاصطناعي "${newWordObj.word}" ✨`, 20);
      return updated;
    });
  }, [authUser, recordActivity]);

  // 7. Spaced Repetition (SRS) Records (Feature 31)
  const rateWordSRS = useCallback((wordTerm, rating = SRS_RATINGS.GOOD) => {
    if (!authUser) return;
    const uKey = authUser.username;
    setSrsRecords((prev) => {
      const current = prev[wordTerm] || {};
      const updated = calculateNextSRS(current, rating);
      const nextRecords = { ...prev, [wordTerm]: updated };
      saveToStorage(getUserKey(uKey, 'srs'), nextRecords);

      const ratingNames = { 1: 'إعادة مراجعة', 2: 'صعبة', 3: 'جيدة', 4: 'سهلة ومتقنة' };
      recordActivity('srs_review', `مراجعة تكرار متباعد: "${wordTerm}" (${ratingNames[rating]}) 🧠`, 10);
      return nextRecords;
    });
  }, [authUser, recordActivity]);

  const dueSRSCount = useMemo(() => {
    return Object.values(srsRecords).filter(isWordDueForReview).length;
  }, [srsRecords]);

  // 8. Storyteller Selection
  const [selectedWords, setSelectedWords] = useState([]);

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

  const clearSelectedWords = useCallback(() => setSelectedWords([]), []);

  const isSelectedWord = useCallback(
    (wordObj) => selectedWords.some((w) => w.word === wordObj.word),
    [selectedWords]
  );

  // 9. API Keys & Modals
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored !== null && stored.trim() !== '' ? stored : DEFAULT_GEMINI_KEY;
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Sync Root Theme / Mode Attributes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIO_SPEED, audioSpeed.toString());
  }, [audioSpeed]);

  const t = useCallback((key) => {
    const langDict = translations[language] || translations.ar || translations.en;
    return langDict[key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    }
  }, [apiKey]);

  const value = {
    authUser,
    loginUser,
    logoutUser,
    theme,
    setTheme,
    colorPaletteId,
    selectColorPalette,
    THEME_DEFINITIONS,
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
