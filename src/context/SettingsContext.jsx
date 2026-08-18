import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations } from '../data/translations';
import { DEFAULT_GEMINI_KEY } from '../services/geminiService';
import { VOICE_PRESETS } from '../services/audioEngine';
import { playTabSwitchSound } from '../services/soundEffects';
import { THEME_DEFINITIONS } from '../utils/themePalettes';
import { StorageAdapter, STORAGE_KEYS } from '../services/storageAdapter';

export const THEMES = [
  { id: 'brutalism', name: 'النيو-بروتاليزم (أكسفورد كلاسيك)', emoji: '⚡', label: 'Neo-Brutalism', font: 'Cairo & Inter' },
  { id: 'organic', name: 'التيراكوتا الطبيعي (Organic)', emoji: '🌿', label: 'Terracotta', font: 'Tajawal & Cairo' },
  { id: 'swiss', name: 'المينيمالي السويسري (Swiss Red)', emoji: '🇨🇭', label: 'Swiss Red', font: 'Inter & Cairo' },
];

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  // 1. Authentication State
  const [authUser, setAuthUser] = useState(() => StorageAdapter.getItem(STORAGE_KEYS.AUTH_USER, null));

  const loginUser = useCallback((userObj) => {
    setAuthUser(userObj);
    StorageAdapter.setItem(STORAGE_KEYS.AUTH_USER, userObj);
  }, []);

  const logoutUser = useCallback(() => {
    setAuthUser(null);
    StorageAdapter.removeItem(STORAGE_KEYS.AUTH_USER);
  }, []);

  // 2. Navigation & Notifications
  const [activeTab, setActiveTabState] = useState('grid');
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const notificationObj = typeof message === 'object' ? { id, ...message } : { id, message, type };
    setNotifications((prev) => [...prev, notificationObj]);
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
  const [theme, setTheme] = useState(() => StorageAdapter.getString(STORAGE_KEYS.THEME, 'brutalism'));
  const [colorPaletteId, setColorPaletteId] = useState(() => StorageAdapter.getString(STORAGE_KEYS.COLOR_PALETTE, 'default'));
  const [customThemeColors, setCustomThemeColors] = useState(() => StorageAdapter.getItem(STORAGE_KEYS.CUSTOM_THEME_COLORS, {}));
  const [mode, setMode] = useState(() => StorageAdapter.getString(STORAGE_KEYS.MODE, 'dark'));

  // Sync Root Theme / Mode Attributes and CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    StorageAdapter.setString(STORAGE_KEYS.THEME, theme);
    StorageAdapter.setString(STORAGE_KEYS.MODE, mode);

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

    if (customThemeColors.textColor) {
      root.style.setProperty('--text-main', customThemeColors.textColor);
    } else {
      root.style.removeProperty('--text-main');
    }

    if (customThemeColors.textMuted) {
      root.style.setProperty('--text-muted', customThemeColors.textMuted);
    } else {
      root.style.removeProperty('--text-muted');
    }

    if (customThemeColors.cardBg) {
      root.style.setProperty('--bg-card', customThemeColors.cardBg);
    } else {
      root.style.removeProperty('--bg-card');
    }

    if (customThemeColors.surfaceBg) {
      root.style.setProperty('--bg-surface', customThemeColors.surfaceBg);
    } else {
      root.style.removeProperty('--bg-surface');
    }

    if (customThemeColors.pageBg) {
      root.style.setProperty('--bg-page', customThemeColors.pageBg);
    } else {
      root.style.removeProperty('--bg-page');
    }

    if (customThemeColors.accentColor) {
      root.style.setProperty('--bg-accent', customThemeColors.accentColor);
      root.style.setProperty('--primary', customThemeColors.accentColor);
    }

    if (customThemeColors.borderColor) {
      root.style.setProperty('--border-color', customThemeColors.borderColor);
      root.style.setProperty('--border-card', `2px solid ${customThemeColors.borderColor}`);
      root.style.setProperty('--border-input', `2px solid ${customThemeColors.borderColor}`);
    } else {
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--border-card');
      root.style.removeProperty('--border-input');
    }
  }, [theme, colorPaletteId, mode, customThemeColors]);

  const selectColorPalette = useCallback((paletteId) => {
    setColorPaletteId(paletteId);
    StorageAdapter.setString(STORAGE_KEYS.COLOR_PALETTE, paletteId);
  }, []);

  const updateCustomColor = useCallback((key, value) => {
    setCustomThemeColors((prev) => {
      const next = { ...prev, [key]: value };
      StorageAdapter.setItem(STORAGE_KEYS.CUSTOM_THEME_COLORS, next);
      return next;
    });
  }, []);

  const applyHighContrastPreset = useCallback((preset) => {
    if (!preset) return;
    if (preset.mode && preset.mode !== mode) {
      setMode(preset.mode);
      StorageAdapter.setString(STORAGE_KEYS.MODE, preset.mode);
    }
    const newColors = {
      textColor: preset.textColor,
      textMuted: preset.textMuted,
      cardBg: preset.cardBg,
      surfaceBg: preset.surfaceBg,
      pageBg: preset.pageBg,
      accentColor: preset.accentColor,
      borderColor: preset.borderColor,
    };
    setCustomThemeColors(newColors);
    StorageAdapter.setItem(STORAGE_KEYS.CUSTOM_THEME_COLORS, newColors);
  }, [mode]);

  const resetThemeContrastColors = useCallback(() => {
    setCustomThemeColors({});
    StorageAdapter.removeItem(STORAGE_KEYS.CUSTOM_THEME_COLORS);
    const root = document.documentElement;
    root.style.removeProperty('--text-main');
    root.style.removeProperty('--text-muted');
    root.style.removeProperty('--bg-card');
    root.style.removeProperty('--bg-surface');
    root.style.removeProperty('--bg-page');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--border-card');
    root.style.removeProperty('--border-input');
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // 4. Language & i18n
  const [language, setLanguage] = useState(() => StorageAdapter.getString(STORAGE_KEYS.LANGUAGE, 'ar'));

  useEffect(() => {
    StorageAdapter.setString(STORAGE_KEYS.LANGUAGE, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key) => {
    const langDict = translations[language] || translations.ar || translations.en;
    return langDict[key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  // 5. Voice & Audio Speed
  const [voicePreset, setVoicePreset] = useState(() => StorageAdapter.getString(STORAGE_KEYS.VOICE_PRESET, 'us-female'));
  const [audioSpeed, setAudioSpeed] = useState(() => {
    const stored = StorageAdapter.getString(STORAGE_KEYS.AUDIO_SPEED, '1.0');
    return stored ? parseFloat(stored) : 1.0;
  });

  useEffect(() => {
    StorageAdapter.setString(STORAGE_KEYS.VOICE_PRESET, voicePreset);
  }, [voicePreset]);

  useEffect(() => {
    StorageAdapter.setString(STORAGE_KEYS.AUDIO_SPEED, audioSpeed.toString());
  }, [audioSpeed]);

  // 6. Network Offline Listener
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

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

  // 7. API Keys & Modals
  const [apiKey, setApiKey] = useState(() => {
    const stored = StorageAdapter.getString(STORAGE_KEYS.API_KEY, '');
    return stored && stored.trim() !== '' ? stored : DEFAULT_GEMINI_KEY;
  });

  useEffect(() => {
    if (apiKey) {
      StorageAdapter.setString(STORAGE_KEYS.API_KEY, apiKey);
    }
  }, [apiKey]);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const value = useMemo(() => ({
    authUser,
    loginUser,
    logoutUser,
    activeTab,
    setActiveTab,
    notifications,
    addNotification,
    removeNotification,
    theme,
    setTheme,
    colorPaletteId,
    selectColorPalette,
    customThemeColors,
    updateCustomColor,
    applyHighContrastPreset,
    resetThemeContrastColors,
    THEME_DEFINITIONS,
    THEMES,
    mode,
    setMode,
    toggleMode,
    language,
    toggleLanguage,
    t,
    voicePreset,
    setVoicePreset,
    voicePresets: VOICE_PRESETS,
    audioSpeed,
    setAudioSpeed,
    isOffline,
    apiKey,
    setApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    isThemeModalOpen,
    setIsThemeModalOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
  }), [
    authUser,
    loginUser,
    logoutUser,
    activeTab,
    setActiveTab,
    notifications,
    addNotification,
    removeNotification,
    theme,
    colorPaletteId,
    selectColorPalette,
    customThemeColors,
    updateCustomColor,
    applyHighContrastPreset,
    resetThemeContrastColors,
    mode,
    toggleMode,
    language,
    toggleLanguage,
    t,
    voicePreset,
    audioSpeed,
    isOffline,
    apiKey,
    isApiKeyModalOpen,
    isThemeModalOpen,
    isBackupModalOpen,
  ]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export default SettingsContext;
