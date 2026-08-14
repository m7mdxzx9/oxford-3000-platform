/**
 * Visual Mnemonic Hooks & Memory Anchors
 * Feature 33: الربط بالصور الذهنية
 */

export const MNEMONIC_HOOKS = {
  abandon: {
    hook: "تخيّل فرقة موسيقية (A Band) تُركت على جزيرة مهجورة وتخلت عنها السفينة!",
    visualDesc: "A musical band stranded on a deserted island with their instruments.",
    keyword: "A Band On",
  },
  ability: {
    hook: "تخيّل نحلة نشيطة (A Bee) لديها مهارة وقدرة مذهلة على حمل تفاحة عملاقة!",
    visualDesc: "A tiny bee with super muscles lifting an apple.",
    keyword: "A Bee - Lity",
  },
  absent: {
    hook: "تخيّل شخصاً يرسل (App Sent) رسالة اعتذار لأنه غائب عن المدرسة.",
    visualDesc: "An empty classroom desk with a glowing smartphone saying 'Absent'.",
    keyword: "App Sent",
  },
  abroad: {
    hook: "تخيّل شخصاً يركب قارب عريض (A Broad boat) ليسافر إلى خارج البلاد.",
    visualDesc: "A suitcase with travel stickers boarding a wide boat overseas.",
    keyword: "A Broad",
  },
  accident: {
    hook: "تخيّل فأساً (Axe) سقطت بالخطأ فسببت حادثاً وسكب الدهان!",
    visualDesc: "A cartoon car slipping on a banana peel and bumping into a cloud.",
    keyword: "Axe-ident",
  },
  accompany: {
    hook: "تخيّل شركة (A Company) من الأصدقاء يرافقونك في رحلتك.",
    visualDesc: "Two friendly backpackers walking together towards the sunrise.",
    keyword: "A Company",
  },
  accurate: {
    hook: "تخيّل سهم رماية يصيب مركز الهدف بدقة متناهية (Accurate hit).",
    visualDesc: "A target with an arrow hitting the exact dead center bullseye.",
    keyword: "Accurate Aim",
  },
  achieve: {
    hook: "تخيّل تسلق قمة جبل ورفع راية النصر لتحقيق الإنجاز.",
    visualDesc: "A smiling hiker placing a golden victory flag at the peak of Everest.",
    keyword: "A-Chief",
  },
  acquire: {
    hook: "تخيّل شخصاً ينضم إلى جوقة ترتيل (A Choir) ليكتسب مهارة الغناء.",
    visualDesc: "A person picking up a glowing golden book filled with wisdom.",
    keyword: "A Choir",
  },
  adapt: {
    hook: "تخيّل حرباء ذكية تضع شاحن (Adapter) وتغير لونها لتتكيف مع البيئة.",
    visualDesc: "A colorful chameleon adjusting its skin to match a neon background.",
    keyword: "Adapter",
  },
};

/**
 * Returns a mnemonic hook for a word or generates a smart memory association
 */
export function getMnemonicForWord(word, arabic, example) {
  const clean = (word || '').trim().toLowerCase();
  if (MNEMONIC_HOOKS[clean]) {
    return MNEMONIC_HOOKS[clean];
  }

  // Generative memory template
  return {
    hook: `اربط كلمة "${word}" بمعنى "${arabic || 'المعنى'}" في جملة خيالية: "${example || word}" لتثبيتها في الذاكرة طويلة المدى!`,
    visualDesc: `A colorful conceptual illustration depicting the Oxford meaning of '${word}'.`,
    keyword: word,
  };
}
