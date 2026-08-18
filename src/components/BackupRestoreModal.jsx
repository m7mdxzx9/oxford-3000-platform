/**
 * ============================================================================
 * File: src/components/BackupRestoreModal.jsx
 * Purpose: Full Database Backup & Restore UI Component
 * Connected To: backupService.js, AppContext.jsx, db.js
 * Description:
 *   Provides an intuitive modal interface allowing users to:
 *     1. Export their entire IndexedDB database (words, progress, stats) as a single JSON file.
 *     2. Import/Restore a backup file with drag-and-drop file ingestion.
 * ============================================================================
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Upload, Database, CheckCircle, AlertTriangle, X, RefreshCw, FileText } from 'lucide-react';
import { exportDatabaseToJson, importDatabaseFromJson } from '../services/backupService';
import { useApp } from '../context/AppContext';

export default function BackupRestoreModal({ isOpen, onClose }) {
  const { addNotification } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [restoreStats, setRestoreStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const result = await exportDatabaseToJson();
      addNotification({
        type: 'success',
        message: `تم تحميل النسخة الاحتياطية بنجاح (${result.wordsCount} كلمة، ${result.progressCount} سجل تقدم).`,
      });
    } catch (err) {
      setErrorMessage(err.message || 'فشل تصدير النسخة الاحتياطية.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setErrorMessage(null);
    setRestoreStats(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        const result = await importDatabaseFromJson(content);
        setRestoreStats(result);
        addNotification({
          type: 'success',
          message: 'تمت استعادة قاعدة البيانات بنجاح!',
        });
      } catch (err) {
        setErrorMessage(err.message || 'الملف غير صالح أو حدث خطأ أثناء الاستعادة.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('فشلت قراءة الملف المحدد.');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg card-theme-target rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 relative overflow-hidden font-arabic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl theme-btn-primary shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">النسخ الاحتياطي والاستعادة (IndexedDB)</h2>
              <p className="text-xs opacity-75">حفظ واسترجاع كافة الكلمات والتقدم الدراسي بملف واحد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {restoreStats && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>
              تمت الاستعادة بنجاح: {restoreStats.restoredWords} كلمة، {restoreStats.restoredProgress} سجل تقدم FSRS!
            </span>
          </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export Card */}
          <div className="p-5 rounded-2xl border box-surface flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-500 font-black text-sm">
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية</span>
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                تنزيل ملف JSON يحتوي على كامل قاعدة بيانات الكلمات وسجل التكرار المتباعد والإحصائيات.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl theme-btn-primary text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExporting ? 'جاري التصدير...' : 'تصدير كملف JSON'}</span>
            </button>
          </div>

          {/* Import Card */}
          <div className="p-5 rounded-2xl border box-surface flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                <Upload className="w-4 h-4" />
                <span>استعادة نسخة احتياطية</span>
              </div>
              <p className="text-xs opacity-75 leading-relaxed">
                استيراد ملف JSON احتياطي واستبدال قاعدة البيانات المحلية به بأمان تام.
              </p>
            </div>
            <label className="w-full py-2.5 px-4 rounded-xl theme-btn-secondary border text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer hover:bg-black/10 dark:hover:bg-white/10">
              {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isImporting ? 'جاري الاستيراد...' : 'اختر ملف JSON'}</span>
              <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" disabled={isImporting} />
            </label>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] leading-relaxed flex items-center gap-2">
          <FileText className="w-4 h-4 shrink-0" />
          <span>البيانات مخزنة محلياً في جهازك بتقنية IndexedDB الفائقة السرعة وتعمل 100% دون اتصال بالإنترنت.</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
