import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Trash2, Cpu, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ApiKeyModal = () => {
  const { apiKey, setApiKey, isApiKeyModalOpen, setIsApiKeyModalOpen, addNotification } = useApp();
  
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [activeProviderTab, setActiveProviderTab] = useState('gemini');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen && typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('oxford3000_gemini_api_key') || apiKey || '');
      setGroqKey(localStorage.getItem('oxford3000_groq_api_key') || '');
      setNvidiaKey(localStorage.getItem('oxford3000_nvidia_api_key') || '');
    }
  }, [isApiKeyModalOpen, apiKey]);

  if (!isApiKeyModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (geminiKey.trim()) {
        localStorage.setItem('oxford3000_gemini_api_key', geminiKey.trim());
        setApiKey(geminiKey.trim());
      } else {
        localStorage.removeItem('oxford3000_gemini_api_key');
      }

      if (groqKey.trim()) {
        localStorage.setItem('oxford3000_groq_api_key', groqKey.trim());
      } else {
        localStorage.removeItem('oxford3000_groq_api_key');
      }

      if (nvidiaKey.trim()) {
        localStorage.setItem('oxford3000_nvidia_api_key', nvidiaKey.trim());
      } else {
        localStorage.removeItem('oxford3000_nvidia_api_key');
      }
    }

    addNotification('تم تحديث مفاتيح الذكاء الاصطناعي بنجاح وحفظها محلياً بأمان 🛡️', 'success');
    setIsApiKeyModalOpen(false);
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oxford3000_gemini_api_key');
      localStorage.removeItem('oxford3000_groq_api_key');
      localStorage.removeItem('oxford3000_nvidia_api_key');
    }
    setGeminiKey('');
    setGroqKey('');
    setNvidiaKey('');
    setApiKey('');
    addNotification('تم حذف جميع المفاتيح والعودة للنمط المحلي الذكي', 'info');
    setIsApiKeyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="card-theme-target relative w-full max-w-lg border rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-4 end-4 p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pe-8">
          <div className="p-2.5 rounded-2xl theme-btn-primary shadow-md shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-arabic">إدارة مفاتيح الذكاء الاصطناعي الآمنة</h3>
            <p className="text-xs opacity-75 font-medium">Secure Multi-Provider AI (Gemini • Groq • NVIDIA)</p>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/10 dark:bg-white/5 mb-4">
          <button
            type="button"
            onClick={() => setActiveProviderTab('gemini')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeProviderTab === 'gemini' ? 'theme-btn-primary shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveProviderTab('groq')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeProviderTab === 'groq' ? 'theme-btn-primary shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Groq (Ultra-Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveProviderTab('nvidia')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeProviderTab === 'nvidia' ? 'theme-btn-primary shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span>NVIDIA NIM</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {activeProviderTab === 'gemini' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-75">
                  Google Gemini API Key (AIzaSy...)
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="opacity-60 hover:opacity-100 text-[11px] font-bold"
                >
                  {showKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm font-bold focus:outline-none"
              />
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold space-y-1.5 leading-relaxed font-arabic dir-rtl text-right">
                <p className="font-black text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>حصة مجانية يومية من Google AI Studio:</span>
                </p>
                <p className="text-[11px] opacity-90">يمكنك الحصول على مفتاح مجاني للاستخدام الشخصي بضغطة زر:</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl theme-btn-secondary text-[11px] font-black hover:brightness-110"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>الحصول على مفتاح مجاني من Google AI Studio ➔</span>
                </a>
              </div>
            </div>
          )}

          {activeProviderTab === 'groq' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-75">
                  Groq API Key (gsk_...)
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="opacity-60 hover:opacity-100 text-[11px] font-bold"
                >
                  {showKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm font-bold focus:outline-none"
              />
              <div className="mt-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold space-y-1.5 leading-relaxed font-arabic dir-rtl text-right">
                <p className="font-black text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>محرك Groq فائق السرعة (Llama 3.1):</span>
                </p>
                <p className="text-[11px] opacity-90">يتميز بسرعة استجابة تقل عن نصف ثانية لتوليد القصص والتمارين.</p>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl theme-btn-secondary text-[11px] font-black hover:brightness-110"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>إنشاء مفتاح Groq مجاني من وحدة التحكم ➔</span>
                </a>
              </div>
            </div>
          )}

          {activeProviderTab === 'nvidia' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider opacity-75">
                  NVIDIA NIM API Key (nvapi-...)
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="opacity-60 hover:opacity-100 text-[11px] font-bold"
                >
                  {showKey ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={nvidiaKey}
                onChange={(e) => setNvidiaKey(e.target.value)}
                placeholder="nvapi-..."
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm font-bold focus:outline-none"
              />
              <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold space-y-1.5 leading-relaxed font-arabic dir-rtl text-right">
                <p className="font-black text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>حصة مطوري NVIDIA:</span>
                </p>
                <p className="text-[11px] opacity-90">تمنح NVIDIA 1000 نقطة استدعاء مجانية لنماذج Llama 3.1 و Nemotron.</p>
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl theme-btn-secondary text-[11px] font-black hover:brightness-110"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>بوابة NVIDIA NIM المفتوحة ➔</span>
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-3 flex-wrap border-t border-black/10 dark:border-white/10">
            {(geminiKey || groqKey || nvidiaKey) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl text-xs font-black text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكل</span>
              </button>
            )}
            <div className="flex items-center gap-2 ms-auto">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-black theme-btn-secondary"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-black theme-btn-primary shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>حفظ المفاتيح</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
