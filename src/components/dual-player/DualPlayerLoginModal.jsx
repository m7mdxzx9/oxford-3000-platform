import React, { useState } from 'react';
import { X, LogIn, Lock, UserCheck, ShieldCheck } from 'lucide-react';

const ACCOUNTS = {
  محمد: 'm7mdxzx9',
  ريوف: 'fahd1399',
};

export default function DualPlayerLoginModal({
  isOpen,
  onClose,
  activeUser,
  onLoginSuccess,
}) {
  const [loginUsername, setLoginUsername] = useState('محمد');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUser = loginUsername.trim();
    if (!trimmedUser) {
      setLoginError('يرجى إدخال اسم المستخدم.');
      return;
    }

    const expectedPass = ACCOUNTS[trimmedUser];
    if (expectedPass) {
      if (!loginPassword || loginPassword.trim() !== expectedPass) {
        setLoginError('كلمة المرور غير صحيحة! يرجى إدخال كلمة المرور الصحيحة');
        return;
      }
    }

    onLoginSuccess(trimmedUser);
    setLoginPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="card-theme-target relative w-full max-w-md border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl theme-btn-primary shadow-md">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black font-arabic">تبديل حساب اللاعب</h3>
            <p className="text-xs opacity-75 font-arabic">اختر حسابك لحفظ نقاطك وتحدياتك بشكل مستقل</p>
          </div>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold font-arabic">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-black opacity-75 font-arabic">اختر اللاعب:</label>
            <div className="grid grid-cols-2 gap-2">
              {['محمد', 'ريوف'].map((user) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => {
                    setLoginUsername(user);
                    setLoginError('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border font-arabic transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginUsername === user
                      ? 'theme-btn-primary shadow-md border-transparent scale-[1.02]'
                      : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-70'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{user}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black opacity-75 font-arabic">
              اسم مخصص (أو اكتب أي اسم آخر):
            </label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="اكتب اسم اللاعب..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold font-arabic border focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black opacity-75 font-arabic">
              كلمة المرور (اختياري للحسابات الخاصة):
            </label>
            <div className="relative">
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold border focus:outline-none"
              />
              <Lock className="w-4 h-4 absolute end-3 top-3 opacity-40" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold theme-btn-secondary cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black theme-btn-primary shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer font-arabic"
            >
              تسجيل الدخول كـ {loginUsername}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
