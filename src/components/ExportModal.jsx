import React, { useState } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, FileCode, CheckCircle, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000Data';

export const ExportModal = ({ isOpen, onClose, filteredWords = [] }) => {
  const { favorites, mastered, addNotification } = useApp();
  const [exportScope, setExportScope] = useState('favorites'); // 'favorites' | 'mastered' | 'filtered' | 'all'
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf' | 'anki' | 'md' | 'json'
  const [includeSentences, setIncludeSentences] = useState(true);
  const [includeTranslations, setIncludeTranslations] = useState(true);

  if (!isOpen) return null;

  // Resolve target words based on selected scope
  const getTargetWords = () => {
    let list = [];
    if (exportScope === 'favorites') {
      list = oxford3000Data.filter((w) => favorites.includes(w.id || w.word));
    } else if (exportScope === 'mastered') {
      list = oxford3000Data.filter((w) => mastered.includes(w.id || w.word));
    } else if (exportScope === 'filtered') {
      list = filteredWords.length > 0 ? filteredWords : oxford3000Data.slice(0, 50);
    } else {
      list = oxford3000Data;
    }
    return list;
  };

  const targetWords = getTargetWords();

  // Helper to trigger file download in browser
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to sanitize text and prevent DOM XSS injection in print windows
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // 1. Export as Printable PDF Document (HTML Print Preview)
  const handleExportPDF = (words) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification('Please allow popups to open the PDF print preview window.', 'error');
      return;
    }

    const rows = words.map((w, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <td style="padding: 10px; font-weight: bold; color: #0f172a;">${idx + 1}. ${escapeHtml(w.word)}</td>
        <td style="padding: 10px; color: #64748b; font-family: monospace;">${escapeHtml(w.phonetic || '')}</td>
        <td style="padding: 10px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1;">
            ${escapeHtml(w.cefr || 'A1')}
          </span>
        </td>
        <td style="padding: 10px; color: #64748b; font-style: italic;">${escapeHtml(w.pos || '')}</td>
        ${includeTranslations ? `<td style="padding: 10px; font-weight: bold; color: #1e293b; direction: rtl; text-align: right;">${escapeHtml(w.arabic || '')}</td>` : ''}
        ${includeSentences ? `<td style="padding: 10px; color: #334155; max-width: 250px;">${escapeHtml(w.example || w.aiSentence?.sentence || '—')}</td>` : ''}
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Oxford 3000 Vocabulary Deck (${words.length} Words)</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .header h1 { margin: 0; font-size: 24px; color: #0369a1; }
          .header p { margin: 5px 0 0; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f8fafc; text-align: left; padding: 12px 10px; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ Oxford 3000™ Vocabulary Study Deck</h1>
          <p>Generated via Oxford 3000 PRO Platform • Total Words: ${words.length} • Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Word</th>
              <th>Phonetic</th>
              <th style="text-align: center;">CEFR</th>
              <th>POS</th>
              ${includeTranslations ? `<th style="text-align: right;">Arabic Meaning</th>` : ''}
              ${includeSentences ? `<th>Example Sentence</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    addNotification('PDF print preview window generated successfully!', 'success');
  };

  // 2. Export as Anki CSV Deck
  const handleExportAnkiCSV = (words) => {
    let csv = '\uFEFF#separator:tab\n#html:true\n#tags column:3\n';
    csv += 'Front\tBack\tTags\n';

    for (const w of words) {
      const sentenceStr = includeSentences && (w.example || w.aiSentence?.sentence)
        ? `<br><br><i>"${w.example || w.aiSentence?.sentence}"</i>`
        : '';

      const front = `<b>${w.word}</b> <i>${w.phonetic || ''}</i> [${w.pos || ''}]${sentenceStr}`;

      const arabicSentenceStr = includeSentences && w.aiSentence?.arabic
        ? `<br><br><span dir="rtl">"${w.aiSentence.arabic}"</span>`
        : '';

      const back = `<b dir="rtl" style="font-size:18px;">${w.arabic || ''}</b>${arabicSentenceStr}`;
      const tag = `Oxford3000 CEFR_${w.cefr || 'A1'}`;

      csv += `${front.replace(/\t/g, ' ')}\t${back.replace(/\t/g, ' ')}\t${tag}\n`;
    }

    downloadFile(csv, `Oxford3000_Anki_Deck_${exportScope}_${words.length}.csv`, 'text/csv;charset=utf-8;');
    addNotification(`Exported ${words.length} words to Anki CSV Deck!`, 'success');
  };

  // 3. Export as Markdown Notes
  const handleExportMarkdown = (words) => {
    let md = `# 📚 Oxford 3000™ Vocabulary Study Notes\n\n`;
    md += `*Export Scope: **${exportScope.toUpperCase()}** | Total Words: **${words.length}** | Date: **${new Date().toLocaleDateString()}***\n\n`;
    md += `| Word | Phonetic | Level | POS | Arabic Translation | Example Sentence |\n`;
    md += `| :--- | :---: | :---: | :---: | :--- | :--- |\n`;

    for (const w of words) {
      const ex = includeSentences ? (w.example || w.aiSentence?.sentence || '—') : '—';
      const ar = includeTranslations ? (w.arabic || '—') : '—';
      md += `| **${w.word}** | \`${w.phonetic || ''}\` | \`${w.cefr || 'A1'}\` | *${w.pos || ''}* | ${ar} | ${ex} |\n`;
    }

    downloadFile(md, `Oxford3000_Notes_${exportScope}_${words.length}.md`, 'text/markdown;charset=utf-8;');
    addNotification(`Exported ${words.length} words to Markdown study notes!`, 'success');
  };

  // 4. Export as JSON Data
  const handleExportJSON = (words) => {
    const dataStr = JSON.stringify(words, null, 2);
    downloadFile(dataStr, `Oxford3000_Data_${exportScope}_${words.length}.json`, 'application/json;charset=utf-8;');
    addNotification(`Exported ${words.length} words to JSON data!`, 'success');
  };

  // Main Export Action Trigger
  const handleExecuteExport = () => {
    if (targetWords.length === 0) {
      addNotification('No words found in the selected scope to export.', 'warning');
      return;
    }

    if (exportFormat === 'pdf') {
      handleExportPDF(targetWords);
    } else if (exportFormat === 'anki') {
      handleExportAnkiCSV(targetWords);
    } else if (exportFormat === 'md') {
      handleExportMarkdown(targetWords);
    } else if (exportFormat === 'json') {
      handleExportJSON(targetWords);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card-theme-target relative w-full max-w-xl border rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-3.5 dir-rtl">
          <div className="p-3 rounded-2xl theme-btn-primary shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">
              📥 تصدير قائمة المفردات والجمل (Export Vocabulary)
            </h2>
            <p className="text-xs opacity-75 mt-0.5">
              قم بتصدير الكلمات والجمل كملف PDF للطباعة أو كارد لكروت Anki
            </p>
          </div>
        </div>

        {/* 1. Scope Selection Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider opacity-80 dir-rtl">
            1. اختر مجال الكلمات المراد تصديرها (Scope):
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setExportScope('favorites')}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                exportScope === 'favorites'
                  ? 'theme-btn-primary shadow-md'
                  : 'bg-[var(--bg-card)] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🌟 المفضلة فقط</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 font-mono">
                  {favorites.length}
                </span>
              </div>
              <p className="text-[10px] opacity-75 mt-1">الكلمات في قائمة المفضلة</p>
            </button>

            <button
              onClick={() => setExportScope('mastered')}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                exportScope === 'mastered'
                  ? 'theme-btn-primary shadow-md'
                  : 'bg-[var(--bg-card)] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">✅ المتقنة فقط</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 font-mono">
                  {mastered.length}
                </span>
              </div>
              <p className="text-[10px] opacity-75 mt-1">الكلمات المحفوظة بنجاح</p>
            </button>

            <button
              onClick={() => setExportScope('filtered')}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                exportScope === 'filtered'
                  ? 'theme-btn-primary shadow-md'
                  : 'bg-[var(--bg-card)] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">🔍 القائمة المفلترة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-cyan-500/20 text-cyan-300 font-mono">
                  {filteredWords.length}
                </span>
              </div>
              <p className="text-[10px] opacity-75 mt-1">نتيجة التصفية الحالية</p>
            </button>

            <button
              onClick={() => setExportScope('all')}
              className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                exportScope === 'all'
                  ? 'theme-btn-primary shadow-md'
                  : 'bg-[var(--bg-card)] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">📚 الكتالوج الكامل</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/20 text-indigo-300 font-mono">
                  {oxford3000Data.length}
                </span>
              </div>
              <p className="text-[10px] opacity-75 mt-1">جميع مفردات أكسفورد 3000</p>
            </button>
          </div>
        </div>

        {/* 2. Export Format Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider opacity-80 dir-rtl">
            2. اختر صيغة الملف للتصدير (Export Format):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setExportFormat('pdf')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportFormat === 'pdf' ? 'theme-btn-primary shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span className="text-xs font-bold">📄 PDF / طباعة</span>
            </button>

            <button
              onClick={() => setExportFormat('anki')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportFormat === 'anki' ? 'theme-btn-primary shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="text-xs font-bold">🗃️ Anki CSV</span>
            </button>

            <button
              onClick={() => setExportFormat('md')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportFormat === 'md' ? 'theme-btn-primary shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold">📝 Markdown</span>
            </button>

            <button
              onClick={() => setExportFormat('json')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                exportFormat === 'json' ? 'theme-btn-primary shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <FileCode className="w-5 h-5" />
              <span className="text-xs font-bold">📊 JSON</span>
            </button>
          </div>
        </div>

        {/* 3. Export Options Toggle */}
        <div className="p-3.5 rounded-2xl border bg-[var(--bg-card)] space-y-2 text-xs font-bold dir-rtl">
          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
            <input
              type="checkbox"
              checked={includeSentences}
              onChange={(e) => setIncludeSentences(e.target.checked)}
              className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4"
            />
            <span>تضمين الأمثلة والجمل المولدة بالذكاء الاصطناعي (AI Sentences)</span>
          </label>
          <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
            <input
              type="checkbox"
              checked={includeTranslations}
              onChange={(e) => setIncludeTranslations(e.target.checked)}
              className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4"
            />
            <span>تضمين الترجمات العربية وشروحات المفردات</span>
          </label>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs opacity-80 font-bold font-mono">
            سيتم تصدير: <span className="text-emerald-400 font-extrabold">{targetWords.length}</span> كلمة
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-extrabold opacity-70 hover:opacity-100"
            >
              إلغاء
            </button>
            <button
              onClick={handleExecuteExport}
              className="px-5 py-2.5 rounded-xl theme-btn-primary text-xs font-black flex items-center gap-2 shadow-lg hover:brightness-110"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
