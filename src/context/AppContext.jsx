import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { oxford3000Data } from '../data/oxford3000Data';
import { seedWordsIfEmpty, migrateFromLocalStorage } from '../services/db';
import { SettingsProvider, useSettings, THEMES } from './SettingsContext';
import { LearningProvider, useLearning } from './LearningContext';
import { GameStateProvider, useGameState } from './GameStateContext';

export { THEMES, useSettings, useLearning, useGameState };

const AppContext = createContext(null);

function AppContextBridge({ children }) {
  const settings = useSettings();
  const learning = useLearning();
  const gameState = useGameState();

  // 0. Seed 3000 words into Dexie IndexedDB and migrate legacy localStorage on boot
  useEffect(() => {
    seedWordsIfEmpty(oxford3000Data);
    migrateFromLocalStorage();
  }, []);

  const combinedValue = useMemo(() => ({
    ...settings,
    ...learning,
    ...gameState,
  }), [settings, learning, gameState]);

  return <AppContext.Provider value={combinedValue}>{children}</AppContext.Provider>;
}

export const AppProvider = ({ children }) => {
  return (
    <SettingsProvider>
      <LearningProvider>
        <GameStateProvider>
          <AppContextBridge>{children}</AppContextBridge>
        </GameStateProvider>
      </LearningProvider>
    </SettingsProvider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
