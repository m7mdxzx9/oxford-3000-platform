import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { StorageAdapter, STORAGE_KEYS } from '../services/storageAdapter';

const GameStateContext = createContext(null);

const DEFAULT_SIBLING_STATS = {
  محمد: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
  ريوف: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
};

export const GameStateProvider = ({ children }) => {
  // 1. Sibling scoreboard stats (Shared between DualPlayerHub, games & duel tabs)
  const [siblingStats, setSiblingStats] = useState(() => {
    return StorageAdapter.getItem(STORAGE_KEYS.SIBLING_STATS, DEFAULT_SIBLING_STATS);
  });

  const updateSiblingStat = useCallback((user, field, delta = 1) => {
    setSiblingStats((prev) => {
      const current = prev || DEFAULT_SIBLING_STATS;
      const userStats = current[user] || { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 };
      const updated = {
        ...current,
        [user]: {
          ...userStats,
          [field]: (userStats[field] || 0) + delta,
        },
      };
      StorageAdapter.setItem(STORAGE_KEYS.SIBLING_STATS, updated);
      return updated;
    });
  }, []);

  const resetSiblingStats = useCallback(() => {
    setSiblingStats(DEFAULT_SIBLING_STATS);
    StorageAdapter.setItem(STORAGE_KEYS.SIBLING_STATS, DEFAULT_SIBLING_STATS);
  }, []);

  // 2. Ephemeral Game Session Tracking
  const [activeGameUser, setActiveGameUserState] = useState(() => {
    return StorageAdapter.getString(STORAGE_KEYS.USER_SESSION, 'guest');
  });

  const setActiveGameUser = useCallback((username) => {
    setActiveGameUserState(username);
    StorageAdapter.setString(STORAGE_KEYS.USER_SESSION, username);
  }, []);

  // 3. Mini-game Session High Scores & Solved History
  const [gameScores, setGameScores] = useState(() => {
    return StorageAdapter.getItem('oxford3000_game_high_scores', {
      wordChain: { bestStreak: 0, totalPlayed: 0 },
      wordDetective: { casesSolved: 0, bestStreak: 0 },
      spellingBee: { perfectScores: 0, bestStreak: 0 },
      quizGame: { highPoints: 0, perfectRounds: 0 },
    });
  });

  const recordGameScore = useCallback((gameKey, scoreData) => {
    setGameScores((prev) => {
      const current = prev[gameKey] || {};
      const updatedGame = { ...current, ...scoreData };
      const nextScores = { ...prev, [gameKey]: updatedGame };
      StorageAdapter.setItem('oxford3000_game_high_scores', nextScores);
      return nextScores;
    });
  }, []);

  const value = useMemo(() => ({
    siblingStats,
    updateSiblingStat,
    resetSiblingStats,
    activeGameUser,
    setActiveGameUser,
    gameScores,
    recordGameScore,
  }), [
    siblingStats,
    updateSiblingStat,
    resetSiblingStats,
    activeGameUser,
    setActiveGameUser,
    gameScores,
    recordGameScore,
  ]);

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
};

export default GameStateContext;
