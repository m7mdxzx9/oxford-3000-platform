import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastNotifications = () => {
  const { notifications, removeNotification } = useApp();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm pointer-events-none">
      {notifications.map((toast) => {
        let badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
        if (toast.type === 'success') badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        if (toast.type === 'warning') badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        if (toast.type === 'error') badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-xl bg-[#081229]/90 shadow-lg shadow-black/50 text-xs font-medium ${badgeColor} transition-all duration-300 transform translate-y-0`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeNotification(toast.id)}
              className="ml-3 text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastNotifications;
