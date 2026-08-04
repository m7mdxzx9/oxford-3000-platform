import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../data/translations';
import { DEFAULT_GEMINI_KEY } from '../services/geminiService';
import { VOICE_PRESETS } from '../services/audioService';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  FAVORITES: 'oxford3000_favorites',
  MASTERED: 'oxford3000_mastered',
  API_KEY: 'oxford3000_gemini_api_key',
  CUSTOM_WORDS: 'oxford3000_custom_words',
  LANGUAGE: 'oxford3000_language',
  VOICE_PRESET: 'oxford3000_voice_preset',
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

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('grid');

  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return stored || 'en';
  });

  const [voicePreset, setVoicePreset] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOICE_PRESET);
    return stored || 'us-female';
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
        exists ? `Marked "${wordTerm}" as learning` : `🎉 Mastered "${wordTerm}"!`,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  }, [addNotification]);

  const isMastered = useCallback((wordTerm) => mastered.includes(wordTerm), [mastered]);

  const toggleSelectWord = useCallback((wordObj) => {
    setSelectedWords((prev) => {
      const term = typeof wordObj === 'string' ? wordObj : wordObj.word;
      const exists = prev.some((w) => (typeof w === 'string' ? w : w.word) === term);

      if (exists) {
        return prev.filter((w) => (typeof w === 'string' ? w : w.word) !== term);
      } else {
        if (prev.length >= 5) {
          addNotification('Maximum 5 words can be selected for Storytelling.', 'warning');
          return prev;
        }
        return [...prev, wordObj];
      }
    });
  }, [addNotification]);

  const clearSelectedWords = useCallback(() => {
    setSelectedWords([]);
  }, []);

  const isSelectedWord = useCallback((wordObj) => {
    const term = typeof wordObj === 'string' ? wordObj : wordObj.word;
    return selectedWords.some((w) => (typeof w === 'string' ? w : w.word) === term);
  }, [selectedWords]);

  const addCustomWord = useCallback((wordObj) => {
    setCustomWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === wordObj.word.toLowerCase());
      if (exists) return prev;
      addNotification(`Added missing term "${wordObj.word}" to Lexicon!`, 'success');
      return [wordObj, ...prev];
    });
  }, [addNotification]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,

    voicePreset,
    setVoicePreset,
    voicePresets: VOICE_PRESETS,

    activeTab,
    setActiveTab,

    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,

    mastered,
    toggleMastered,
    isMastered,
    masteredCount: mastered.length,

    selectedWords,
    toggleSelectWord,
    clearSelectedWords,
    isSelectedWord,
    selectedWordsCount: selectedWords.length,

    customWords,
    addCustomWord,

    apiKey,
    setApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,

    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
