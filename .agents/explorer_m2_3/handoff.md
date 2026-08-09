# Handoff Report: AI Instant Lexicon Fetcher Feature Design (Milestone 2)

## 1. Observation

### 1.1 Existing Codebase State & Line References
- **`src/services/geminiService.js`** (lines 1-59):
  ```javascript
  export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  export const fetchMissingTerm = async (term, apiKey = '') => {
    if (!term || typeof term !== 'string' || !term.trim()) {
      return null;
    }
    const cleanTerm = term.trim().toLowerCase();
    // ... API call and fallback implementation ...
  };
  ```
- **`src/context/AppContext.jsx`** (lines 7, 11, 45, 73-75, 160-167):
  ```javascript
  // Storage key: CUSTOM_WORDS: 'oxford3000_custom_words'
  const [customWords, setCustomWords] = useState(() => loadFromStorage(STORAGE_KEYS.CUSTOM_WORDS, []));

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOM_WORDS, customWords);
  }, [customWords]);

  const addCustomWord = useCallback((wordObj) => {
    setCustomWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === wordObj.word.toLowerCase());
      if (exists) return prev;
      addNotification(`Added missing term "${wordObj.word}" to Lexicon!`, 'success');
      return [wordObj, ...prev];
    });
  }, [addNotification]);
  ```
- **`src/data/oxford3000.js`** (lines 1-111):
  Defines Oxford 3000 entries with structure: `{ id, word, pos, cefr, arabic, example, ipa }`.

- **`src/components/LexiconGrid.jsx`**:
  Currently pending implementation under Milestone 2.

---

## 2. Logic Chain

1. **User Interaction & Search Evaluation**:
   - The user inputs a search query (e.g. `"eloquent"`) in the search bar within `LexiconGrid.jsx`.
   - `LexiconGrid` filters the unified dataset (`allWords = [...customWords, ...oxford3000Data]`).
   - If `searchTerm.trim() !== ''` and `filteredWords.length === 0`, `hasZeroMatches` is evaluated to `true`.

2. **Triggering the AI Instant Lexicon Fetcher**:
   - Instead of a plain "No results found" message, `LexiconGrid` displays the **AI Instant Lexicon Fetcher** component card.
   - The card features a prominent CTA button: `"Fetch '[term]' with Gemini AI"`.

3. **Executing `fetchMissingTerm(term, apiKey)`**:
   - Clicking the CTA sets `isFetching = true` (displaying an inline SVG loading spinner).
   - `fetchMissingTerm` normalizes `term` (trimmed, lowercase) and retrieves `apiKey` (either passed directly or loaded from `localStorage` under `oxford3000_gemini_api_key`).
   - If an API key is available, `fetchMissingTerm` issues a `POST` request to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` with a structured prompt requesting a raw JSON object `{ word, pos, cefr, arabic, example, ipa }`.
   - The response text is sanitized (stripping ```json markdown wrappers) and parsed into a structured JavaScript object.
   - If no API key is provided or the network request fails/errors out, `fetchMissingTerm` returns a structured fallback object containing the requested term, default POS (`noun`), default CEFR (`B1`), placeholder Arabic translation, example sentence, and IPA string.

4. **Live Context Update & Storage Sync**:
   - Upon receiving the word object, `LexiconGrid` calls `addCustomWord(fetchedWordObject)` from `AppContext`.
   - `addCustomWord` verifies uniqueness, prepends `fetchedWordObject` to `customWords` state array, triggers `saveToStorage('oxford3000_custom_words', ...)` to sync with `localStorage`, and calls `addNotification(...)` to display a toast notification (`"Added missing term 'eloquent' to Lexicon!"`).
   - Because `customWords` is part of `allWords` in `LexiconGrid`, React automatically re-renders the grid, making the newly fetched term immediately visible to the user.

---

## 3. Caveats

- **API Key Dependency & Graceful Fallback**: If the user has not configured a Gemini API key in `AppContext`, `fetchMissingTerm` falls back gracefully without throwing unhandled exceptions, returning a structured object so user workflow is uninterrupted.
- **Code Block Formatting in Gemini Responses**: Gemini API may wrap JSON responses in markdown code blocks (` ```json ... ``` `). The parser must regex-strip code fences before `JSON.parse`.
- **Duplicate Protection**: `addCustomWord` in `AppContext` performs case-insensitive check (`w.word.toLowerCase() === wordObj.word.toLowerCase()`). If a word is already in `customWords`, duplicate insertion is prevented.

---

## 4. Conclusion & Technical Design Specifications

### 4.1 Service Specification: `src/services/geminiService.js`

```javascript
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Dynamically queries Gemini API endpoint for an uncatalogued word term.
 * Returns structured JSON: { id, word, pos, cefr, arabic, example, ipa, isCustom }.
 */
export const fetchMissingTerm = async (term, apiKey = '') => {
  if (!term || typeof term !== 'string' || !term.trim()) {
    return null;
  }
  const cleanTerm = term.trim().toLowerCase();

  // Load API key from localStorage if not provided
  if (!apiKey && typeof window !== 'undefined' && window.localStorage) {
    apiKey = window.localStorage.getItem('oxford3000_gemini_api_key') || window.localStorage.getItem('gemini_api_key') || '';
  }

  // Graceful fallback if API key is missing
  if (!apiKey) {
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: cleanTerm,
      pos: 'noun',
      cefr: 'B1',
      arabic: `ترجمة ${cleanTerm}`,
      example: `This is an example sentence featuring ${cleanTerm}.`,
      ipa: `/${cleanTerm}/`,
      isCustom: true
    };
  }

  try {
    const promptText = `Provide exact raw JSON for the English vocabulary word "${cleanTerm}". Do not include markdown or code block fences. Output structure:
{
  "word": "${cleanTerm}",
  "pos": "noun|verb|adjective|adverb|preposition|conjunction",
  "cefr": "A1|A2|B1|B2",
  "arabic": "accurate Arabic translation",
  "example": "Natural English example sentence using the word",
  "ipa": "/phonetic transcription/"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API response status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean markdown code blocks if present
    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.word) {
        return {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          word: (parsed.word || cleanTerm).toLowerCase(),
          pos: parsed.pos || 'noun',
          cefr: parsed.cefr || 'B1',
          arabic: parsed.arabic || `ترجمة ${cleanTerm}`,
          example: parsed.example || `Example sentence with ${cleanTerm}.`,
          ipa: parsed.ipa || `/${cleanTerm}/`,
          isCustom: true
        };
      }
    }
  } catch (err) {
    console.warn(`fetchMissingTerm API error for "${cleanTerm}", utilizing fallback:`, err);
  }

  // Error fallback
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    word: cleanTerm,
    pos: 'noun',
    cefr: 'B1',
    arabic: `ترجمة ${cleanTerm}`,
    example: `This is an example sentence featuring ${cleanTerm}.`,
    ipa: `/${cleanTerm}/`,
    isCustom: true
  };
};
```

---

### 4.2 UI Integration Specification: `src/components/LexiconGrid.jsx`

```jsx
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000';
import { fetchMissingTerm } from '../services/geminiService';

export default function LexiconGrid() {
  const { customWords, addCustomWord, apiKey, addNotification } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedCefr, setSelectedCefr] = useState('ALL');
  const [isFetching, setIsFetching] = useState(false);

  // Combine Oxford dataset with AI-fetched custom words
  const allWords = useMemo(() => {
    return [...customWords, ...oxford3000Data];
  }, [customWords]);

  // Filtering
  const filteredWords = useMemo(() => {
    return allWords.filter((item) => {
      const matchesSearch = item.word.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesLetter = selectedLetter === 'ALL' || item.word.toUpperCase().startsWith(selectedLetter);
      const matchesCefr = selectedCefr === 'ALL' || item.cefr.toUpperCase() === selectedCefr.toUpperCase();
      return matchesSearch && matchesLetter && matchesCefr;
    });
  }, [allWords, searchTerm, selectedLetter, selectedCefr]);

  // Zero results trigger condition
  const hasZeroMatches = searchTerm.trim().length > 0 && filteredWords.length === 0;

  // Handle AI Fetch button click
  const handleAiFetch = async () => {
    const term = searchTerm.trim();
    if (!term || isFetching) return;

    setIsFetching(true);
    try {
      const fetchedWord = await fetchMissingTerm(term, apiKey);
      if (fetchedWord) {
        addCustomWord(fetchedWord);
      }
    } catch (err) {
      addNotification(`Failed to fetch missing term "${term}": ${err.message}`, 'error');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Search Bar */}
      {/* ... search input, letter filter, cefr filter ... */}

      {/* Zero Search Matches - AI Instant Lexicon Fetcher Card */}
      {hasZeroMatches ? (
        <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 text-center max-w-lg mx-auto shadow-2xl shadow-cyan-950/40 my-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Instant Lexicon Fetcher
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            No local matches for "<span className="text-cyan-400" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{searchTerm.trim()}</span>"
          </h3>
          <p className="text-sm text-slate-300 mb-6">
            Word is missing from the local Oxford 3000 dataset. Dynamically query Gemini AI to fetch CEFR level, Arabic translation, IPA phonetic, and usage example.
          </p>

          <button
            onClick={handleAiFetch}
            disabled={isFetching}
            className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium px-6 py-3.5 rounded-xl shadow-lg transition-all transform active:scale-98"
          >
            {isFetching ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Fetching '{searchTerm.trim()}' with Gemini AI...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.1a2 2 0 00-1.022.547l-1.8 1.8a2 2 0 001.414 3.414h15.616a2 2 0 001.414-3.414l-1.8-1.8z" />
                </svg>
                <span>Fetch '{searchTerm.trim()}' with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Regular Catalog Grid Render */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card items with LTR isolation */}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Verification Method

To independently verify the AI Instant Lexicon Fetcher design and code:

1. **Build Check**:
   Run `npm run build` in root workspace to verify zero syntax/type errors in JSX and JS files.
2. **Functional Verification Scenario**:
   - Launch application (`npm run dev` or inspect static build).
   - In `LexiconGrid`, enter an uncatalogued search query (e.g. `"serendipity"`).
   - Confirm zero local matches trigger the "AI Instant Lexicon Fetcher" card with button text `"Fetch 'serendipity' with Gemini AI"`.
   - Click the button; confirm loading spinner displays during fetch.
   - Confirm toast notification `"Added missing term 'serendipity' to Lexicon!"` appears.
   - Confirm `"serendipity"` is appended live to global `customWords` and displayed in `LexiconGrid`.
   - Reload page and verify `"oxford3000_custom_words"` in `localStorage` retains `"serendipity"`.
