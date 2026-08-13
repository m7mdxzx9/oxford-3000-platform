import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ApiKeyModal = () => {
  const { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen, addNotification } = useApp();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey]);

  if (!isApiKeyModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
    addNotification('Gemini API key updated successfully', 'success');
    setIsApiKeyModalOpen(false);
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey('');
    addNotification('Gemini API key cleared (reverted to environment default)', 'info');
    setIsApiKeyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-theme-target relative w-full max-w-md border rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="p-2.5 rounded-2xl theme-btn-primary shadow-md shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black">AI API Key (Gemini & NVIDIA)</h3>
            <p className="text-xs opacity-75 font-medium">Google Gemini (AIzaSy...) or NVIDIA NIM</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-75">
              API Key (Google Gemini / NVIDIA NIM)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy... or nvapi-..."
                className="w-full px-4 py-3 pr-10 rounded-2xl glass-input text-xs sm:text-sm font-bold focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 opacity-60 hover:opacity-100 text-xs font-bold"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold space-y-1.5 leading-relaxed font-arabic dir-rtl text-right">
              <p className="font-black text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>معلومات الحصة المجانية من Google AI Studio:</span>
              </p>
              <ul className="list-disc list-inside opacity-90 space-y-1 text-[11px]">
                <li>تمنح جوجل حصة مجانية يومية لكل مفتاح بدون الحاجة لبطاقة بنكية.</li>
                <li>يمكنك توليد مفتاح خاص بك مجاناً بضغطة زر واحدة:</li>
              </ul>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl theme-btn-secondary text-[11px] font-black hover:brightness-110"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>إنشاء مفتاح مجاني من Google AI Studio ➔</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-xl text-xs font-black text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20"
              >
                Clear Key
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-black theme-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black theme-btn-primary shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
