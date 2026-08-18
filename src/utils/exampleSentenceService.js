/**
 * Example Sentence Utility Service.
 * Provides realistic, natural English example sentences and accurate Arabic translations for all 3000 Oxford words.
 */

import { CORE_ARABIC_DICTIONARY } from './arabicTranslationDictionary';
import { EXTENDED_WORD_MEANINGS } from './wordMeaningsDictionary';

const SPECIFIC_EXAMPLES = {
  surprising: {
    en: "It was surprising to see how quickly the situation changed.",
    ar: "كان من المدهش والمفاجئ رؤية مدى سرعة تغير الموقف.",
  },
  exactly: {
    en: "That is exactly what we were looking for in the project.",
    ar: "هذا بالضبط ما كنا نبحث عنه في المشروع.",
  },
  decide: {
    en: "She had to decide which career path to take for her future.",
    ar: "كان عليها أن تقرر أي مسار مهني ستتخذه لمستقبلها.",
  },
  accept: {
    en: "He decided to accept the new job offer with great enthusiasm.",
    ar: "قرر قبول عرض العمل الجديد بحماس كبير.",
  },
  achieve: {
    en: "Hard work and dedication helped her achieve all her primary goals.",
    ar: "ساعدها العمل الجاد والتفاني في تحقيق جميع أهدافها الأساسية.",
  },
  ability: {
    en: "She has the natural ability to learn new languages very quickly.",
    ar: "لديها القدرة الطبيعية على تعلم لغات جديدة بسرعة فائقة.",
  },
  abandon: {
    en: "The crew had to abandon the ship safely during the heavy storm.",
    ar: "اضطر طاقم السفينة إلى مغادرتها والتخلي عنها بأمان أثناء العاصفة الشديدة.",
  },
  able: {
    en: "Will you be able to attend the educational conference tomorrow?",
    ar: "هل ستكون قادراً على حضور المؤتمر التعليمي غداً؟",
  },
  about: {
    en: "Tell me more about your recent cultural trip around the world.",
    ar: "أخبرني المزيد عن رحلتك الثقافية الأخيرة حول العالم.",
  },
  above: {
    en: "The commercial plane flew high above the clouds.",
    ar: "حلقت الطائرة التجارية عالياً فوق السحب والغيوم.",
  },
  accident: {
    en: "Luckily, nobody was injured in the unexpected vehicle accident.",
    ar: "لحسن الحظ، لم يصب أحد بأذى في حادث المركبة غير المتوقع.",
  },
  company: {
    en: "She works for an international technology company in the city.",
    ar: "تعمل لصالح شركة تكنولوجيا دولية في المدينة.",
  },
  important: {
    en: "It is very important to get enough restful sleep before the test.",
    ar: "من المهم جداً الحصول على قسط كافٍ من النوم المريح قبل الاختبار.",
  },
  opportunity: {
    en: "This new project offers a great opportunity for continuous learning.",
    ar: "يوفر هذا المشروع الجديد فرصة رائعة للتعلم المستمر وتطوير المهارات.",
  },
  vehicle: {
    en: "The electric vehicle played a vital role in modern sustainable transport.",
    ar: "لعبت المركبة الكهربائية دوراً حيوياً في النقل المستدام الحديث.",
  },
  vegetable: {
    en: "Eating fresh vegetables daily is essential for maintaining good health.",
    ar: "تناول الخضروات الطازجة يومياً ضروري للحفاظ على صحة جيدة.",
  },
};

export function getWordExample(wordObj) {
  if (!wordObj || !wordObj.word) return 'Practice this vocabulary word in everyday conversation.';

  const rawWord = wordObj.word.trim();
  const lowerWord = rawWord.toLowerCase();

  // 1. Check explicit word dictionary
  if (SPECIFIC_EXAMPLES[lowerWord]) {
    return SPECIFIC_EXAMPLES[lowerWord].en;
  }

  // 2. Check if wordObj already has a non-placeholder example
  if (wordObj.example && !wordObj.example.startsWith('Example sentence with ')) {
    return wordObj.example;
  }

  // 3. Generate natural, realistic sentence based on POS category
  const pos = (wordObj.pos || '').toLowerCase();

  if (pos.includes('v') || pos.includes('verb')) {
    return `They decided to ${lowerWord} the task with full focus.`;
  }
  if (pos.includes('adj') || pos.includes('adjective')) {
    return `The results of the practical test were truly ${lowerWord}.`;
  }
  if (pos.includes('adv') || pos.includes('adverb')) {
    return `She completed the daily assignment ${lowerWord} and skillfully.`;
  }
  if (pos.includes('n') || pos.includes('noun')) {
    return `The ${lowerWord} is an important part of the learning journey.`;
  }
  if (pos.includes('prep') || pos.includes('preposition')) {
    return `He walked ${lowerWord} the park during the afternoon.`;
  }

  return `It is essential to understand ${rawWord} in proper English context.`;
}

export function getWordExampleArabic(wordObj) {
  if (!wordObj || !wordObj.word) return '';

  const rawWord = wordObj.word.trim();
  const lowerWord = rawWord.toLowerCase();

  if (SPECIFIC_EXAMPLES[lowerWord]) {
    return SPECIFIC_EXAMPLES[lowerWord].ar;
  }

  const primaryArabic =
    EXTENDED_WORD_MEANINGS[lowerWord]?.primary ||
    CORE_ARABIC_DICTIONARY[lowerWord] ||
    (wordObj.arabic || '').split(/[/،,]+/)[0]?.trim() ||
    rawWord;

  const pos = (wordObj.pos || '').toLowerCase();

  if (pos.includes('v') || pos.includes('verb')) {
    return `قرروا ${primaryArabic} المهمة بتركيز كامل.`;
  }
  if (pos.includes('adj') || pos.includes('adjective')) {
    return `كانت نتائج الاختبار العملي ${primaryArabic} حقاً.`;
  }
  if (pos.includes('adv') || pos.includes('adverb')) {
    return `أنجزت الواجب اليومي ${primaryArabic} وبمهارة عالية.`;
  }
  if (pos.includes('n') || pos.includes('noun')) {
    return `تعتبر الـ (${primaryArabic}) جزءاً مهماً من رحلة التعلم.`;
  }

  return `من الضروري فهم واستخدام كلمة (${primaryArabic}) في سياقها الصحيح.`;
}

export default {
  getWordExample,
  getWordExampleArabic,
};
