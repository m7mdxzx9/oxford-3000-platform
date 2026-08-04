# Milestone 1: Project Foundation & Layout Setup — Handoff Report

## 1. Observation

- **Directory Inspection**: Running `list_dir` on target path `c:\Users\HP\Downloads\English\oxford-3000-platform` revealed only `.agents/` and `ORIGINAL_REQUEST.md`. No build configuration files (`package.json`, `vite.config.js`, `tailwind.config.js`) or source code directory (`src/`) currently exist in the root directory.
- **Requirements Analysis**: `ORIGINAL_REQUEST.md` (lines 34-36) and `PROJECT.md` (lines 14-16) mandate React 18, Vite, Tailwind CSS with custom dark glassmorphic styling (`#060d21`), Lucide icons, LTR font/isolation CSS, base path configuration for GitHub Pages, tabbed header navigation, and global application shell setup.

## 2. Logic Chain

1. **Clean Canvas**: Since the repository directory currently contains no pre-existing application files, Milestone 1 must establish the full foundational setup from scratch.
2. **Build Toolchain**: React 18 with Vite provides fast HMR and lightweight bundle size. Tailwind CSS with PostCSS and Autoprefixer allows rapid creation of custom glassmorphic styling without heavy component libraries.
3. **GitHub Pages Compatibility**: Setting `base: './'` in `vite.config.js` ensures that all assets are resolved using relative paths, preventing 404 errors when deployed on GitHub Pages subpaths (e.g., `https://<user>.github.io/oxford-3000-platform/`).
4. **Glassmorphism & LTR Isolation**:
   - Background `#060d21` with `.glass-panel` and `.glass-card` classes using `backdrop-filter: blur(...)` and semi-transparent borders provides the exact dark aesthetic requested.
   - Arabic translations mixed with English terms can cause text layout corruption unless LTR isolation (`direction: ltr !important; unicode-bidi: isolate !important;`) is strictly enforced on English tokens.
5. **Modular Shell**: `Navbar.jsx` with active tab indicators and a Gemini API Key configuration modal ensures seamless transitions across all 7 module views (Lexicon Grid, Sentence Generator, Storyteller, Tutor, Flashcards, Quiz, Analytics).

## 3. Caveats

- **Node / NPM Environment**: The build commands assume a standard Node.js environment (v18+ recommended) with npm installed.
- **Scope Limit**: As Explorer 1, this task is read-only technical design. Implementation must be carried out by the Implementer agent based on the code specifications below.

## 4. Conclusion & Complete Technical Design

The complete design specifications for Milestone 1 are provided below. The Implementer agent should create these exact files in `c:\Users\HP\Downloads\English\oxford-3000-platform\`.

---

### Specification 1: `package.json`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\package.json`

```json
{
  "name": "oxford-3000-platform",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}
```

---

### Specification 2: `vite.config.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
});
```

---

### Specification 3: `postcss.config.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### Specification 4: `tailwind.config.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#060d21',
          card: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cefr: {
          a1: '#10b981',
          a2: '#06b6d4',
          b1: '#3b82f6',
          b2: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

### Specification 5: `src/index.css`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\src\index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #060d21;
  color: #f1f5f9;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Glassmorphism Classes */
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s ease-in-out;
}

.glass-card:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.glass-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
  color: #f8fafc;
}

.glass-input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* LTR Isolation Rules for English Terms */
.ltr-token,
.ltr-isolate,
[dir="ltr"] {
  direction: ltr !important;
  unicode-bidi: isolate !important;
  display: inline-block;
  text-align: left;
}

/* RTL Rule for Arabic Text */
.rtl-text,
[dir="rtl"] {
  direction: rtl !important;
  unicode-bidi: isolate !important;
  font-family: 'Tajawal', sans-serif;
  text-align: right;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(6, 13, 33, 0.5);
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

---

### Specification 6: `index.html`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Oxford 3000 CEFR Lexicon Application</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  </head>
  <body class="bg-[#060d21] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### Specification 7: `src/main.jsx`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\src\main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### Specification 8: `src/components/Navbar.jsx`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\src\components\Navbar.jsx`

```jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  BookMarked, 
  MessageSquare, 
  Layers, 
  HelpCircle, 
  BarChart2, 
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiKey, setApiKey }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const tabs = [
    { id: 'grid', label: 'Lexicon Catalog', icon: BookOpen },
    { id: 'sentence', label: 'AI Sentence Builder', icon: Sparkles },
    { id: 'story', label: 'AI Storyteller', icon: BookMarked },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'flashcards', label: '3D Flashcards', icon: Layers },
    { id: 'quiz', label: 'Quiz Game', icon: HelpCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const handleSaveKey = (e) => {
    e.preventDefault();
    setApiKey(tempKey);
    localStorage.setItem('gemini_api_key', tempKey);
    setShowKeyModal(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Oxford 3000<span className="text-indigo-400 font-medium text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">CEFR A1-B2</span>
            </h1>
            <p className="text-xs text-slate-400">Interactive AI Lexicon Master</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* API Key Modal Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTempKey(apiKey);
              setShowKeyModal(true);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'API Key Set' : 'Set Gemini Key'}</span>
            {apiKey ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700/80 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              Configure Gemini API Key
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your Google Gemini API key to enable AI Sentence Generation, AI Storyteller, Personal Tutor, and live term fetching.
            </p>

            <form onSubmit={handleSaveKey}>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm mb-4 font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/30"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
```

---

### Specification 9: `src/App.jsx`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\src\App.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

export default function App() {
  const [activeTab, setActiveTab] = useState('grid');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d21] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'grid' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Lexicon Catalog Grid</h2>
            <p className="text-sm text-slate-400">Milestone 2 component target: Virtual pagination, A-Z filter, CEFR filter, and LTR isolation.</p>
          </div>
        )}

        {activeTab === 'sentence' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">AI Sentence Builder</h2>
            <p className="text-sm text-slate-400">Milestone 4 component target: Interactive sentence generation with Gemini AI.</p>
          </div>
        )}

        {activeTab === 'story' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">AI Storyteller</h2>
            <p className="text-sm text-slate-400">Milestone 4 component target: Contextual AI stories with line-by-line audio evaluation.</p>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">AI Personal Tutor</h2>
            <p className="text-sm text-slate-400">Milestone 4 component target: Roleplay scenarios and grammar feedback.</p>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">3D Flashcards</h2>
            <p className="text-sm text-slate-400">Milestone 5 component target: 3D SRS flip cards with mastery tracking.</p>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Game</h2>
            <p className="text-sm text-slate-400">Milestone 5 component target: Multiple choice practice questions.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Progress Analytics</h2>
            <p className="text-sm text-slate-400">Milestone 5 component target: Mastery breakdown by CEFR level.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        <p>Oxford 3000 CEFR Lexicon Application &copy; 2026. Built with React 18, Vite & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
```

---

## 5. Verification Method

To independently verify the implementation after files are written:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
   *Expected Output*: Dependencies installed cleanly without severe npm resolution errors.

2. **Local Development Server**:
   ```bash
   npm run dev
   ```
   *Expected Output*: Vite dev server starts on `http://localhost:3000` showing dark glassmorphic layout, header navigation, tab switching, and API key modal.

3. **Production Static Build**:
   ```bash
   npm run build
   ```
   *Expected Output*: Build completes successfully with zero errors, outputting bundled static assets in `./dist`.
