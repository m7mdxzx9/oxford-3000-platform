import React, { useState, useEffect } from 'react';
import { X, Check, Palette, Sun, Moon, Plus, Trash2, Type, Square, Sliders, RefreshCw, Eye, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEME_DEFINITIONS, HIGH_CONTRAST_PRESETS } from '../utils/themePalettes';

export default function ThemeColorStudioModal({ isOpen, onClose }) {
  const {
    theme,
    setTheme,
    colorPaletteId,
    selectColorPalette,
    customThemeColors,
    updateCustomColor,
    applyHighContrastPreset,
    resetThemeContrastColors,
    mode,
    toggleMode,
    addNotification,
  } = useApp();

  const [activeStudioTab, setActiveStudioTab] = useState('contrast'); // 'contrast' | 'themes' | 'custom-colors'

  // Custom User Palettes state (Feature 1404)
  const [customPalettes, setCustomPalettes] = useState(() => {
    try {
      const saved = localStorage.getItem('oxford3000_custom_palettes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#06B6D4');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const currentThemeDef = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS.brutalism;

  // Active color values with fallbacks to current computed styles
  const currentTextColor = customThemeColors?.textColor || (mode === 'dark' ? '#F0F6FC' : '#111827');
  const currentTextMuted = customThemeColors?.textMuted || (mode === 'dark' ? '#8B949E' : '#4B5563');
  const currentCardBg = customThemeColors?.cardBg || (mode === 'dark' ? '#161B22' : '#FFFFFF');
  const currentSurfaceBg = customThemeColors?.surfaceBg || (mode === 'dark' ? '#21262D' : '#F4EFE6');
  const currentPageBg = customThemeColors?.pageBg || (mode === 'dark' ? '#0D1117' : '#FFFDF0');
  const currentAccent = customThemeColors?.accentColor || (mode === 'dark' ? '#3B82F6' : '#2563EB');
  const currentBorder = customThemeColors?.borderColor || (mode === 'dark' ? '#30363D' : '#111827');

  const handleSaveCustomPalette = () => {
    if (!customName.trim()) {
      addNotification('يرجى كتابة اسم اللوحة المخصصة', 'warning');
      return;
    }

    const newPal = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      previewColors: [customPrimaryColor, customSecondaryColor],
      isCustom: true,
      colors: {
        light: { bgAccent: customPrimaryColor, textAccent: '#ffffff' },
        dark: { bgAccent: customPrimaryColor, textAccent: '#ffffff' },
      },
    };

    const updated = [...customPalettes, newPal];
    setCustomPalettes(updated);
    localStorage.setItem('oxford3000_custom_palettes', JSON.stringify(updated));

    updateCustomColor('accentColor', customPrimaryColor);

    setIsCreatingCustom(false);
    setCustomName('');
    addNotification(`تم حفظ لوحة الألوان المخصصة "${newPal.name}" بنجاح! 🎨`, 'success');
  };

  const handleDeleteCustomPalette = (id, e) => {
    e.stopPropagation();
    const updated = customPalettes.filter((p) => p.id !== id);
    setCustomPalettes(updated);
    localStorage.setItem('oxford3000_custom_palettes', JSON.stringify(updated));
    addNotification('تم حذف لوحة الألوان المخصصة', 'info');
  };

  const applyCustomPalette = (pal) => {
    updateCustomColor('accentColor', pal.previewColors[0]);
    selectColorPalette(pal.id);
    addNotification(`تم تطبيق سمة الألوان "${pal.name}" ✨`, 'success');
  };

  const handleResetContrast = () => {
    resetThemeContrastColors();
    addNotification('تمت استعادة الألوان الافتراضية للسمة بنجاح 🔄', 'info');
  };

  // Quick text color options
  const QUICK_TEXT_COLORS = [
    { label: 'أبيض ناصع', color: '#FFFFFF', darkOnly: true },
    { label: 'أصفر نيون', color: '#FDE047', darkOnly: true },
    { label: 'سماوي ناصع', color: '#38BDF8', darkOnly: true },
    { label: 'أخضر فسفوري', color: '#4ADE80', darkOnly: true },
    { label: 'أسود فاحم', color: '#000000', lightOnly: true },
    { label: 'رمادي غامق', color: '#0F172A', lightOnly: true },
    { label: 'حبر داكن', color: '#1C1917', lightOnly: true },
  ];

  // Quick box / card color options
  const QUICK_BOX_COLORS = [
    { label: 'أسود كربوني', color: '#111827' },
    { label: 'كحلي ليلي', color: '#0F172A' },
    { label: 'سواد مطلق', color: '#000000' },
    { label: 'رمادي عميق', color: '#1E293B' },
    { label: 'أبيض نقي', color: '#FFFFFF' },
    { label: 'عاجي دافئ', color: '#F5EFE6' },
    { label: 'ورق رملي', color: '#FDFBF7' },
  ];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="card-theme-target w-full max-w-2xl border rounded-3xl p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col font-arabic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl theme-btn-primary shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">استوديو الألوان والتباين البصري 🎨</h2>
              <p className="text-[11px] opacity-75">تحكم بلون الخط، لون المربعات، والتباين الفائق لراحة القراءة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-btn-secondary opacity-75 hover:opacity-100 transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveStudioTab('contrast')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeStudioTab === 'contrast' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary opacity-75'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>تخصيص الخط والمربعات</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('presets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeStudioTab === 'presets' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary opacity-75'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>أنماط التباين الفائق</span>
          </button>

          <button
            onClick={() => setActiveStudioTab('themes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeStudioTab === 'themes' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary opacity-75'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>السمات واللوحات الكلاسيكية</span>
          </button>
        </div>

        {/* Scrollable Studio Body */}
        <div className="overflow-y-auto pe-1 py-3 space-y-4 flex-1 no-scrollbar text-start">
          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl border bg-[var(--bg-card)] shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--bg-accent)]" />
                معاينة حية للتباين المقروء (Live Contrast Preview):
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg theme-btn-primary font-mono font-bold">
                A2 Noun
              </span>
            </div>

            {/* Simulated Word Box */}
            <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono text-[var(--text-main)]">ability</span>
                  <div className="inline-flex items-center gap-1 font-mono text-xs">
                    <span className="text-[var(--text-muted)]">/</span>
                    <span className="text-[var(--text-main)]">ə</span>
                    <span className="px-1.5 py-0.5 rounded theme-btn-primary text-[11px] font-bold">ˈbɪl</span>
                    <span className="text-[var(--text-main)]">ə</span>
                    <span className="text-[var(--text-main)]">ti</span>
                    <span className="text-[var(--text-muted)]">/</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg theme-btn-primary">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Arabic Translation Sub-box */}
              <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-center">
                <span className="text-sm font-black text-[var(--text-main)]">قُدْرَة، مَقْدِرَة، استطاعة</span>
              </div>

              {/* Example Sentence with highlighted token */}
              <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono ltr-token text-start">
                <span className="text-[var(--text-main)]">She has the </span>
                <span className="px-1.5 py-0.5 rounded-md theme-btn-primary font-black mx-0.5">ability</span>
                <span className="text-[var(--text-main)]"> to learn languages very quickly.</span>
              </div>
            </div>
          </div>

          {/* TAB 1: Direct Font & Box Colors Customization */}
          {activeStudioTab === 'contrast' && (
            <div className="space-y-4 animate-fadeIn">
              {/* 1. Font / Text Color Controls */}
              <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-[var(--bg-accent)]" />
                    <div>
                      <span className="text-xs font-black block">1. لون الخط والنصوص الأساسية</span>
                      <span className="text-[10px] opacity-70">يحدد لون الكلمات، الجمل، والمقاطع الصوتية</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold">{currentTextColor}</span>
                    <input
                      type="color"
                      value={currentTextColor}
                      onChange={(e) => updateCustomColor('textColor', e.target.value)}
                      className="w-8 h-8 rounded-lg border cursor-pointer"
                      title="اختر لون الخط"
                    />
                  </div>
                </div>

                {/* Quick Font Color Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] opacity-75 font-bold">خيارات سريعة:</span>
                  {QUICK_TEXT_COLORS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateCustomColor('textColor', item.color)}
                      className="px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 theme-btn-secondary hover:brightness-110 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Muted Text Color Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-[11px] font-bold opacity-80">لون النصوص الفرعية والتوضيحات:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono opacity-75">{currentTextMuted}</span>
                    <input
                      type="color"
                      value={currentTextMuted}
                      onChange={(e) => updateCustomColor('textMuted', e.target.value)}
                      className="w-7 h-7 rounded-lg border cursor-pointer"
                      title="اختر لون النصوص الفرعية"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Box / Card Background Color Controls */}
              <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-[var(--bg-accent)]" />
                    <div>
                      <span className="text-xs font-black block">2. لون المربعات والبطاقات الرئيسية</span>
                      <span className="text-[10px] opacity-70">يحدد خلفية بطاقات الكلمات والنوافذ المنبثقة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold">{currentCardBg}</span>
                    <input
                      type="color"
                      value={currentCardBg}
                      onChange={(e) => updateCustomColor('cardBg', e.target.value)}
                      className="w-8 h-8 rounded-lg border cursor-pointer"
                      title="اختر لون خلفية البطاقات"
                    />
                  </div>
                </div>

                {/* Quick Card Color Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] opacity-75 font-bold">خلفيات بطاقات جاهزة:</span>
                  {QUICK_BOX_COLORS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateCustomColor('cardBg', item.color)}
                      className="px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 theme-btn-secondary hover:brightness-110 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Inner Surface Sub-box Color Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-[11px] font-bold block">لون الصناديق الداخلية (مربعات الجمل والمقاطع):</span>
                    <span className="text-[9px] opacity-70">المربعات الداخلية مثل صندوق النطق والترجمة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono opacity-75">{currentSurfaceBg}</span>
                    <input
                      type="color"
                      value={currentSurfaceBg}
                      onChange={(e) => updateCustomColor('surfaceBg', e.target.value)}
                      className="w-7 h-7 rounded-lg border cursor-pointer"
                      title="اختر لون الصناديق الداخلية"
                    />
                  </div>
                </div>

                {/* Page Background Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-[11px] font-bold block">لون خلفية الصفحة العامة:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono opacity-75">{currentPageBg}</span>
                    <input
                      type="color"
                      value={currentPageBg}
                      onChange={(e) => updateCustomColor('pageBg', e.target.value)}
                      className="w-7 h-7 rounded-lg border cursor-pointer"
                      title="اختر لون خلفية الصفحة"
                    />
                  </div>
                </div>

                {/* Border Color Row */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-[11px] font-bold block">لون حدود المربعات والبطاقات:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono opacity-75">{currentBorder}</span>
                    <input
                      type="color"
                      value={currentBorder}
                      onChange={(e) => updateCustomColor('borderColor', e.target.value)}
                      className="w-7 h-7 rounded-lg border cursor-pointer"
                      title="اختر لون حدود المربعات"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Accent & Highlight Color Controls */}
              <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black block">3. لون تمييز الكلمات والأزرار (Accent):</span>
                  <span className="text-[10px] opacity-70">لون الأزرار النشطة والكلمات المميزة في الجمل</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold">{currentAccent}</span>
                  <input
                    type="color"
                    value={currentAccent}
                    onChange={(e) => updateCustomColor('accentColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border cursor-pointer"
                    title="اختر لون التمييز"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: One-Click High Contrast Presets */}
          {activeStudioTab === 'presets' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80 block text-start">
                أنماط جاهزة مصممة خصيصاً لأعلى درجات التباين والوضوح:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HIGH_CONTRAST_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      applyHighContrastPreset(preset);
                      addNotification(`تم تفعيل نمط "${preset.name}" عالي التباين ⚡`, 'success');
                    }}
                    className="p-3.5 rounded-2xl border text-start flex flex-col justify-between gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer theme-btn-secondary"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{preset.emoji}</span>
                        <span className="text-xs font-black">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: preset.textColor }} title="لون الخط" />
                        <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: preset.cardBg }} title="لون المربعات" />
                        <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: preset.accentColor }} title="لون التمييز" />
                      </div>
                    </div>
                    <p className="text-[10px] opacity-75 font-medium leading-relaxed">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Classic Themes & Custom Palette Creator */}
          {activeStudioTab === 'themes' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Theme Selection Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80 block text-start">
                  1. نمط الهوية البصرية:
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
                        className={`p-3 rounded-2xl border text-start transition-all flex flex-col justify-between gap-2 active:scale-95 cursor-pointer ${
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

              {/* Color Palettes */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
                  2. درجات ألوان {currentThemeDef.name.split(' ')[0]}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentThemeDef.palettes.map((pal) => {
                    const isSelected =
                      colorPaletteId === pal.id ||
                      (colorPaletteId === 'default' && pal.id === currentThemeDef.palettes[0].id);

                    return (
                      <button
                        key={pal.id}
                        onClick={() => selectColorPalette(pal.id)}
                        className={`p-3 rounded-2xl border text-start transition-all flex items-center justify-between gap-2.5 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[var(--bg-accent)] bg-black/5 dark:bg-white/5 shadow-sm'
                            : 'theme-btn-secondary opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold block">{pal.name}</span>
                          <div className="flex items-center gap-1">
                            {pal.previewColors.map((col, idx) => (
                              <span key={idx} className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ backgroundColor: col }} />
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

              {/* Custom Palettes Builder */}
              <div className="space-y-2.5 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    3. إنشاء لوحة ألوان خاصة:
                  </span>
                  <button
                    onClick={() => setIsCreatingCustom((prev) => !prev)}
                    className="px-2 py-1 rounded-lg theme-btn-secondary text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إنشاء لون خاص</span>
                  </button>
                </div>

                {isCreatingCustom && (
                  <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-3 animate-fadeIn">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="اسم اللوحة (مثال: نيون سايبر)..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold border focus:outline-none"
                    />
                    <div className="flex items-center justify-around gap-2">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] opacity-70 block">اللون الأساسي</span>
                        <input
                          type="color"
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-10 h-8 rounded-lg border cursor-pointer"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-[10px] opacity-70 block">اللون الثانوي</span>
                        <input
                          type="color"
                          value={customSecondaryColor}
                          onChange={(e) => setCustomSecondaryColor(e.target.value)}
                          className="w-10 h-8 rounded-lg border cursor-pointer"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveCustomPalette}
                      className="w-full py-2 rounded-xl theme-btn-primary text-xs font-bold shadow-md cursor-pointer"
                    >
                      حفظ وتطبيق اللوحة المخصصة ✓
                    </button>
                  </div>
                )}

                {customPalettes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {customPalettes.map((cp) => (
                      <div
                        key={cp.id}
                        onClick={() => applyCustomPalette(cp)}
                        className="p-3 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer theme-btn-secondary hover:brightness-105 transition-all"
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold block">{cp.name}</span>
                          <div className="flex items-center gap-1">
                            {cp.previewColors.map((c, i) => (
                              <span key={i} className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCustomPalette(cp.id, e)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Light / Dark Mode Switch */}
          <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
              <div className="text-start">
                <span className="text-xs font-bold block">مظهر الإضاءة (Light/Dark Mode)</span>
                <span className="text-[10px] opacity-70">
                  {mode === 'light' ? 'الوضع النهاري الفاتح' : 'الوضع الليلي الداكن'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleMode}
              className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
            >
              {mode === 'light' ? 'تحويل لليلي 🌙' : 'تحويل لنهاري ☀️'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t flex items-center gap-2">
          <button
            onClick={handleResetContrast}
            className="py-2.5 px-3 rounded-xl theme-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100"
            title="استعادة ألوان السمة الافتراضية"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl theme-btn-primary text-xs font-black shadow-md active:scale-95 cursor-pointer"
          >
            حفظ وإغلاق الاستوديو ✓
          </button>
        </div>
      </div>
    </div>
  );
}

