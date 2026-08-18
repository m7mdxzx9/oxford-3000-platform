import { create } from 'zustand';
import { DEFAULT_THEME_ID } from '../styles/themes';

export interface UserProgressState {
  masteredWordIds: number[];
  favoriteWordIds: number[];
  totalXp: number;
  currentStreakDays: number;
  lastStudyDate: string;
  themeId: string;
  isDarkMode: boolean;
  audioPlaybackRate: number;
  geminiApiKey: string;
  
  // Actions
  toggleMastered: (wordId: number) => void;
  toggleFavorite: (wordId: number) => void;
  addXp: (amount: number) => void;
  setThemeId: (id: string) => void;
  toggleDarkMode: () => void;
  setAudioPlaybackRate: (rate: number) => void;
  setGeminiApiKey: (key: string) => void;
  recordStudyActivity: () => void;
}

const STORAGE_KEY = 'oxford_3000_enterprise_progress';

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      masteredWordIds: [],
      favoriteWordIds: [],
      totalXp: 120,
      currentStreakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      themeId: DEFAULT_THEME_ID,
      isDarkMode: false,
      audioPlaybackRate: 0.9,
      geminiApiKey: '',
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse localStorage progress:', e);
  }

  return {
    masteredWordIds: [],
    favoriteWordIds: [],
    totalXp: 120,
    currentStreakDays: 1,
    lastStudyDate: new Date().toISOString().split('T')[0],
    themeId: DEFAULT_THEME_ID,
    isDarkMode: false,
    audioPlaybackRate: 0.9,
    geminiApiKey: '',
  };
};

export const useStore = create<UserProgressState>((set, get) => {
  const initial = getInitialState();

  const syncStorage = (state: Partial<UserProgressState>) => {
    if (typeof window !== 'undefined') {
      try {
        const full = { ...get(), ...state };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
      } catch (e) {
        console.error('Failed to sync storage:', e);
      }
    }
  };

  return {
    ...initial,

    toggleMastered: (wordId: number) => {
      set((state) => {
        const isCurrentlyMastered = state.masteredWordIds.includes(wordId);
        const nextMastered = isCurrentlyMastered
          ? state.masteredWordIds.filter((id) => id !== wordId)
          : [...state.masteredWordIds, wordId];
        const xpGain = isCurrentlyMastered ? 0 : 25;
        const nextState = {
          masteredWordIds: nextMastered,
          totalXp: state.totalXp + xpGain,
        };
        syncStorage(nextState);
        return nextState;
      });
    },

    toggleFavorite: (wordId: number) => {
      set((state) => {
        const isFavorite = state.favoriteWordIds.includes(wordId);
        const nextFavorites = isFavorite
          ? state.favoriteWordIds.filter((id) => id !== wordId)
          : [...state.favoriteWordIds, wordId];
        const nextState = { favoriteWordIds: nextFavorites };
        syncStorage(nextState);
        return nextState;
      });
    },

    addXp: (amount: number) => {
      set((state) => {
        const nextState = { totalXp: state.totalXp + amount };
        syncStorage(nextState);
        return nextState;
      });
    },

    setThemeId: (id: string) => {
      set(() => {
        const nextState = { themeId: id };
        syncStorage(nextState);
        return nextState;
      });
    },

    toggleDarkMode: () => {
      set((state) => {
        const nextState = { isDarkMode: !state.isDarkMode };
        syncStorage(nextState);
        return nextState;
      });
    },

    setAudioPlaybackRate: (rate: number) => {
      set(() => {
        const nextState = { audioPlaybackRate: rate };
        syncStorage(nextState);
        return nextState;
      });
    },

    setGeminiApiKey: (key: string) => {
      set(() => {
        const nextState = { geminiApiKey: key };
        syncStorage(nextState);
        return nextState;
      });
    },

    recordStudyActivity: () => {
      set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastStudyDate === today) return state;

        const lastDate = new Date(state.lastStudyDate);
        const currentDate = new Date(today);
        const diffDays = Math.round(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
        );

        let streak = state.currentStreakDays;
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }

        const nextState = {
          lastStudyDate: today,
          currentStreakDays: streak,
          totalXp: state.totalXp + 50,
        };
        syncStorage(nextState);
        return nextState;
      });
    },
  };
});
