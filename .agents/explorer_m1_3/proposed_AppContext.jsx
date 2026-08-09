import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create AppContext
const AppContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: 'oxford3000_favorites',
  MASTERED: 'oxford3000_mastered',
  API_KEY: 'oxford3000_gemini_api_key',
  CUSTOM_WORDS: 'oxford3000_custom_words',
};

// Safe localStorage loader
const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
};

// Safe localStorage saver
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
};

export const AppProvider = ({ children }) => {
  // Active Tab state ('grid', 'sentence', 'story', 'tutor', 'flashcards', 'quiz', 'analytics')
  const [activeTab, setActiveTab] = useState('grid');

  // Favorites state
  const [favorites, setFavorites] = useState(() => loadFromStorage(STORAGE_KEYS.FAVORITES, []));

  // Mastered words state
  const [mastered, setMastered] = useState(() => loadFromStorage(STORAGE_KEYS.MASTERED, []));

  // Custom fetched lexicon terms state
  const [customWords, setCustomWords] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOM_WORDS, []));

  // Selected words for Storyteller (Max 5)
  const [selectedWords, setSelectedWords] = useState([]);

  // Custom Gemini API Key state
  const [apiKey, setApiKey] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
    return stored !== null ? stored : (import.meta.env.VITE_GEMINI_API_KEY || '');
  });

  // Modal UI state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Toast Notification System state
  const [notifications, setNotifications] = useState([]);

  // Sync favorites to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  // Sync mastered to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MASTERED, mastered);
  }, [mastered]);

  // Sync custom words to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOM_WORDS, customWords);
  }, [customWords]);

  // Sync API Key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }, [apiKey]);

  // Toast Notification handler
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Toggle Favorites
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

  // Toggle Mastered
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

  // Selected Words for Storyteller (Limit 5)
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

  // Add Custom AI Fetched Word
  const addCustomWord = useCallback((wordObj) => {
    setCustomWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === wordObj.word.toLowerCase());
      if (exists) return prev;
      addNotification(`Added missing term "${wordObj.word}" to Lexicon!`, 'success');
      return [wordObj, ...prev];
    });
  }, [addNotification]);

  const value = {
    // Tab Navigation
    activeTab,
    setActiveTab,

    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,

    // Mastered
    mastered,
    toggleMastered,
    isMastered,
    masteredCount: mastered.length,

    // Selected Words for Storyteller
    selectedWords,
    toggleSelectWord,
    clearSelectedWords,
    isSelectedWord,
    selectedWordsCount: selectedWords.length,

    // Custom Fetched Terms
    customWords,
    addCustomWord,

    // API Key State
    apiKey,
    setApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,

    // Toast Notifications
    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
