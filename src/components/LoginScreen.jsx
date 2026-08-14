import React, { useState } from 'react';
import { Sparkles, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { playSuccessChime } from '../services/soundEffects';

const VALID_ACCOUNTS = {
  'محمد': { password: 'm7mdxzx9', name: 'محمد', avatar: '👨‍🎓', role: 'Oxford Scholar' },
  'ريوف': { password: 'fahd1399', name: 'ريوف', avatar: '👩‍🎓', role: 'Oxford Scholar' },
};

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      triggerError('يرجى كتابة اسم المستخدم (محمد أو ريوف)');
      return;
    }

    if (!cleanPass) {
      triggerError('يرجى إدخال كلمة المرور يدوياً للمتابعة');
      return;
    }

    const account = VALID_ACCOUNTS[cleanUser];

    if (account && account.password === cleanPass) {
      setLoading(true);
      try {
        playSuccessChime();
      } catch (err) {}

      setTimeout(() => {
        const authData = {
          username: cleanUser,
          name: account.name,
          avatar: account.avatar,
          role: account.role,
          loginTime: Date.now(),
        };
        localStorage.setItem('oxford3000_auth_user', JSON.stringify(authData));
        onLoginSuccess(authData);
      }, 400);
    } else {
      triggerError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التحقق وإعادة المحاولة');
    }
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-main)]">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />

      {/* Main Glassmorphic Login Card */}
      <div
        className={`w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl relative z-10 card-theme-target ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Animated 3D App Icon */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl border flex items-center justify-center font-black text-3xl sm:text-4xl theme-btn-primary shadow-xl tab-active-bounce cursor-pointer">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Oxford <span className="text-cyan-500">3000™</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-arabic">
              بوابة الدخول الذكية لمنصة إتقان مفردات أكسفورد
            </p>
          </div>
        </div>

        {/* User Selection helper pills (fills only username, leaves password completely empty) */}
        <div className="mb-6 p-3 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider opacity-70 block text-center font-arabic">
            اختر الحساب لكتابة اسم المستخدم 👤
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setUsername('محمد');
                setPassword('');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                username === 'محمد'
                  ? 'theme-btn-primary shadow-md'
                  : 'theme-btn-secondary hover:scale-102'
              }`}
            >
              <span className="text-base">👨‍🎓</span>
              <span>محمد</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('ريوف');
                setPassword('');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                username === 'ريوف'
                  ? 'theme-btn-primary shadow-md'
                  : 'theme-btn-secondary hover:scale-102'
              }`}
            >
              <span className="text-base">👩‍🎓</span>
              <span>ريوف</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-arabic">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold flex items-center gap-1.5 opacity-80">
              <User className="w-3.5 h-3.5 text-cyan-500" />
              <span>اسم المستخدم</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم (محمد أو ريوف)..."
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm border font-medium focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>
          </div>

          {/* Password Input (Must be typed manually) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold flex items-center gap-1.5 opacity-80">
              <Lock className="w-3.5 h-3.5 text-cyan-500" />
              <span>كلمة المرور (أدخلها يدوياً)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الخاصة بك..."
                className="w-full glass-input px-4 py-2.5 pe-10 rounded-xl text-sm border font-medium focus:ring-2 focus:ring-cyan-500/50"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message with Shake */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full theme-btn-primary py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 hover:scale-102 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري التحقق...</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول إلى المنصة</span>
                <ArrowRight className="w-4 h-4 mr-1 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t text-center text-[11px] opacity-60 font-mono">
          Oxford 3000™ Secure Gateway &bull; v2.5 CEFR Engine
        </div>
      </div>
    </div>
  );
}
