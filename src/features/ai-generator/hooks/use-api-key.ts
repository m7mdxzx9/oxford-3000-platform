'use client';

import * as React from 'react';
import { ApiKeyProvider, ApiKeyState } from '../types';
import { useStore } from '@/lib/store';

const API_KEY_STORAGE_PREFIX = 'oxford_ai_api_key_';
const API_PROVIDER_STORAGE_KEY = 'oxford_ai_provider_active';

export function useApiKey() {
  const [provider, setProvider] = React.useState<ApiKeyProvider>('gemini');
  const [apiKey, setApiKeyState] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const globalSetKey = useStore((state) => state.setGeminiApiKey);

  // Load stored API key on mount
  React.useEffect(() => {
    try {
      const savedProvider = (localStorage.getItem(API_PROVIDER_STORAGE_KEY) as ApiKeyProvider) || 'gemini';
      const savedKey = localStorage.getItem(`${API_KEY_STORAGE_PREFIX}${savedProvider}`) || '';
      
      setProvider(savedProvider);
      setApiKeyState(savedKey);
      if (savedKey) {
        globalSetKey(savedKey);
      }
    } catch (e) {
      console.error('Failed to load API key from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, [globalSetKey]);

  const saveKey = React.useCallback(
    (newKey: string, newProvider: ApiKeyProvider = provider) => {
      const trimmed = newKey.trim();
      try {
        localStorage.setItem(API_PROVIDER_STORAGE_KEY, newProvider);
        localStorage.setItem(`${API_KEY_STORAGE_PREFIX}${newProvider}`, trimmed);
        setProvider(newProvider);
        setApiKeyState(trimmed);
        globalSetKey(trimmed);
        return true;
      } catch (e) {
        console.error('Failed to save API key:', e);
        return false;
      }
    },
    [provider, globalSetKey]
  );

  const deleteKey = React.useCallback(
    (targetProvider: ApiKeyProvider = provider) => {
      try {
        localStorage.removeItem(`${API_KEY_STORAGE_PREFIX}${targetProvider}`);
        setApiKeyState('');
        globalSetKey('');
        return true;
      } catch (e) {
        console.error('Failed to remove API key:', e);
        return false;
      }
    },
    [provider, globalSetKey]
  );

  const getMaskedKey = React.useCallback((): string => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '••••••••';
    const start = apiKey.slice(0, 4);
    const end = apiKey.slice(-4);
    return `${start}••••••••${end}`;
  }, [apiKey]);

  const toggleShowKey = React.useCallback(() => {
    setShowKey((prev) => !prev);
  }, []);

  return {
    apiKey,
    provider,
    isLoaded,
    isConfigured: apiKey.length > 5,
    showKey,
    maskedKey: getMaskedKey(),
    saveKey,
    deleteKey,
    setProvider,
    toggleShowKey,
  };
}
