import React from 'react';
import { SearchX, StarOff, RotateCcw, Sparkles } from 'lucide-react';

/**
 * EmptyState Component
 * Displays polished, accessible empty state UI for no search results or empty bookmarks.
 */
export const EmptyState = ({
  type = 'search', // 'search' | 'favorites' | 'mastered'
  title = '',
  description = '',
  searchQuery = '',
  onReset = null,
  onAiFetch = null,
  isFetchingTerm = false,
}) => {
  if (type === 'favorites') {
    return (
      <div className="card-theme-target p-8 sm:p-12 rounded-3xl border border-amber-500/30 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8 bg-[var(--bg-card)] text-[var(--text-main)]">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-md">
          <StarOff className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black">{title || 'لا توجد كلمات مفضلة محددة بعد'}</h3>
        <p className="text-xs sm:text-sm opacity-80 font-bold max-w-md mx-auto leading-relaxed">
          {description ||
            'لم تقم بحفظ أي كلمات في قائمتك المفضلة حتى الآن. انقر على أيقونة النجمة ⭐ الموجودة في أي كارت كلمة للحفظ والمراجعة السريعة.'}
        </p>
      </div>
    );
  }

  if (type === 'mastered') {
    return (
      <div className="card-theme-target p-8 sm:p-12 rounded-3xl border border-emerald-500/30 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8 bg-[var(--bg-card)] text-[var(--text-main)]">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black">{title || 'لا توجد كلمات مكتملة الإتقان بعد'}</h3>
        <p className="text-xs sm:text-sm opacity-80 font-bold max-w-md mx-auto leading-relaxed">
          {description ||
            'علامة الإتقان تتيح لك متابعة تقدمك الإجمالي في مفردات أكسفورد الـ 3000. انقر علىعلامة الصواب (✓) في الكارت عند حظها وتدربك عليها.'}
        </p>
      </div>
    );
  }

  // Default: No Search Results Found Empty State
  return (
    <div className="card-theme-target p-8 sm:p-12 rounded-3xl border text-center max-w-xl mx-auto shadow-2xl space-y-5 my-8 bg-[var(--bg-card)] text-[var(--text-main)]">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-md">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black">
          {title || 'لم يتم العثور على كلمات مطابقة'}
        </h3>
        <p className="text-xs sm:text-sm opacity-80 font-bold max-w-md mx-auto leading-relaxed">
          {description || (
            <>
              لم تجد نتائج مطابقة للبحث عن{' '}
              {searchQuery ? (
                <strong dir="ltr" className="ltr-isolate font-extrabold text-cyan-600 dark:text-cyan-400 mx-1">
                  "{searchQuery}"
                </strong>
              ) : (
                'التصفية الحالية'
              )}
              . يمكنك إعادة ضبط الفلاتر أو توليد تعريف الكلمة بالذكاء الاصطناعي.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl theme-btn-secondary text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط البحث والتصفية</span>
          </button>
        )}

        {onAiFetch && searchQuery && (
          <button
            onClick={onAiFetch}
            disabled={isFetchingTerm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl theme-btn-primary text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isFetchingTerm ? 'جاري الجلب بالذكاء الاصطناعي...' : `جلب "${searchQuery}" بـ AI`}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
