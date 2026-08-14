import React from 'react';
import { X, Check, Sparkles, Palette, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEME_DEFINITIONS } from '../utils/themePalettes';

export default function ThemeColorStudioModal({ isOpen, onClose }) {
  const { theme, setTheme, colorPaletteId, selectColorPalette, mode, toggleMode } = useApp();

  if (!isOpen) return null;

  const currentThemeDef = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS.brutalism;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="card-theme-target w-full max-w-lg border rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[90vh] flex flex-col font-arabic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl theme-btn-primary shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">استوديو الهوية البصرية والألوان 🎨</h2>
              <p className="text-[11px] opacity-70">خصص هويتك واختر درجات الألوان المناسبة لذوقك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-btn-secondary opacity-75 hover:opacity-100 transition-all"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
          {/* 1. Theme Selection Grid (3 Core Identities) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
              1. اختر نمط الهوية البصرية:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.values(THEME_DEFINITIONS).map((th) => {
                const isActive = theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      if (th.palettes && th.palettes.length > 0) {
                        selectColorPalette(th.palettes[0].id);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                      isActive
                        ? 'theme-btn-primary shadow-md scale-102 font-black'
                        : 'theme-btn-secondary opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{th.emoji}</span>
                      {isActive && <Check className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{th.name.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-70 font-mono block truncate">{th.fontAr}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Palettes for the Active Theme */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                2. درجات ألوان {currentThemeDef.name.split(' ')[0]}:
              </span>
              <span className="text-[10px] font-mono opacity-60">4 لوحات ألوان متناسقة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentThemeDef.palettes.map((pal) => {
                const isSelected =
                  colorPaletteId === pal.id ||
                  (colorPaletteId === 'default' && pal.id === currentThemeDef.palettes[0].id);

                return (
                  <button
                    key={pal.id}
                    onClick={() => selectColorPalette(pal.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-2.5 active:scale-95 ${
                      isSelected
                        ? 'border-2 border-[var(--bg-accent)] bg-black/5 dark:bg-white/5 shadow-sm'
                        : 'theme-btn-secondary opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold block">{pal.name}</span>
                      {/* Color Preview Dots */}
                      <div className="flex items-center gap-1">
                        {pal.previewColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border shadow-sm"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full theme-btn-primary flex items-center justify-center text-xs shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Light / Dark Mode Toggle */}
          <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <div>
                <span className="text-xs font-bold block">مظهر الإضاءة</span>
                <span className="text-[10px] opacity-70">
                  {mode === 'light' ? 'الوضع النهاري الفاتح' : 'الوضع الليلي الداكن'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleMode}
              className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-bold shadow-sm active:scale-95"
            >
              {mode === 'light' ? 'تحويل لليلي 🌙' : 'تحويل لنهاري ☀️'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl theme-btn-primary text-xs font-black shadow-md active:scale-95"
          >
            حفظ وتطبيق التغييرات ✓
          </button>
        </div>
      </div>
    </div>
  );
}
