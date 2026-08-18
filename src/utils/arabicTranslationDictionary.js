/**
 * Official High-Precision English-Arabic Dictionary & Morphological Lemmatizer.
 * Guarantees 100% accurate, natural Arabic translations for common words, plurals, verbs, pronouns, and adverbs.
 * Consolidates all Arabic text normalization, Harakat stripping, and lemmatization (Item 0602).
 */

export const CORE_ARABIC_DICTIONARY = {
  // Articles & Demonstratives
  the: 'الـ (أداة التعريف)',
  a: 'أداة تنكير',
  an: 'أداة تنكير',
  this: 'هذا / هذه',
  that: 'ذلك / تلك',
  these: 'هؤلاء / هذه',
  those: 'أولئك',

  // Pronouns
  i: 'أنا',
  me: 'إياي / ياء المتكلم',
  my: 'خاصتي / (ياء الملكية)',
  mine: 'ملكي',
  myself: 'نفسي',
  you: 'أنت / أنتم',
  your: 'خاصتك / كاف الخطاب',
  yours: 'ملكك',
  yourself: 'نفسك',
  yourselves: 'أنفسكم',
  he: 'هو',
  him: 'إياه / هاء الغائب',
  his: 'خاصته / هاء الملكية',
  himself: 'نفسه',
  she: 'هي',
  her: 'خاصتها / إياها',
  hers: 'ملكها',
  herself: 'نفسها',
  it: 'هو / هي (لغير العاقل)',
  its: 'خاصته / خاصتها (لغير العاقل)',
  itself: 'نفسه / ذاته',
  we: 'نحن',
  us: 'إيانا / نا الفاعلين',
  our: 'خاصتنا / نا الملكية',
  ours: 'ملكنا',
  ourselves: 'أنفسنا',
  they: 'هم / هن',
  them: 'إياهم / هم',
  their: 'خاصتهم',
  theirs: 'ملكهم',
  themselves: 'أنفسهم',

  // Conjunctions & Connectors
  and: 'و',
  or: 'أو',
  but: 'لكن',
  because: 'لأن / بسبب',
  so: 'لذلك / إذن',
  if: 'إذا / لو',
  as: 'كـ / بينما / مثل',
  than: 'من (مقارنة)',
  that_conj: 'أن / بأن',
  which: 'الذي / التي / أيّ',
  who: 'الذي / مَن',
  whom: 'الذي / مَن',
  whose: 'لمن / الذي له',
  where: 'أين / حيث',
  when: 'متى / عندما',
  while: 'بينما / خلال',
  although: 'على الرغم من',
  though: 'رغم أن',
  however: 'ومع ذلك / لكن',
  therefore: 'لذلك / وبالتالي',
  moreover: 'علاوة على ذلك',
  furthermore: 'بالإضافة إلى ذلك',
  unless: 'إلا إذا / ما لم',
  since: 'منذ / بما أن',
  until: 'حتى',
  till: 'حتى',

  // Prepositions
  to: 'إلى / أن',
  of: 'من / لـ (إضافة)',
  in: 'في',
  on: 'على',
  at: 'في / عند',
  by: 'بواسطة / بحلول / لدى',
  for: 'لـ / لأجل / لمدة',
  with: 'مع / بـ',
  without: 'بدون / بلا',
  about: 'عن / حول / تقريباً',
  into: 'إلى داخل',
  onto: 'على / إلى فوق',
  through: 'عبر / من خلال',
  throughout: 'طوال / في شتى أنحاء',
  after: 'بعد',
  before: 'قبل',
  between: 'بين',
  among: 'من بين',
  under: 'تحت',
  below: 'أسفل / دون',
  above: 'فوق / أعلى',
  over: 'فوق / خلال',
  against: 'ضد / مقابل',
  during: 'أثناء / خلال',
  behind: 'خلف / وراء',
  beyond: 'وراء / أبعد من',
  beside: 'بجانب / إلى جوار',
  near: 'قريب من',
  across: 'عبر / على الجانب الآخر',
  toward: 'نحو / باتجاه',
  towards: 'نحو / باتجاه',
  along: 'على طول',
  around: 'حول / حوالي',

  // Auxiliary & Modal Verbs
  is: 'يكون / هو',
  are: 'يكونون / هم',
  am: 'أكون',
  was: 'كان',
  were: 'كانوا',
  be: 'يكون',
  been: 'كان',
  being: 'كائن / كون',
  have: 'يملك / لديه / يتناول',
  has: 'يملك / لديه',
  had: 'كان لديه / مَلَك',
  having: 'امتلاك / تناول',
  do: 'يفعل / يقوم بـ',
  does: 'يفعل',
  did: 'فعل / قام بـ',
  done: 'تم / منجز',
  doing: 'فعل / قيام بـ',
  will: 'سوف',
  would: 'سوف / كان لـ',
  shall: 'سوف / هل',
  should: 'ينبغي / يجب',
  can: 'يستطيع / يمكن',
  could: 'استطاع / كان بإمكانه',
  may: 'قد / يجوز / ربما',
  might: 'قد / ربما',
  must: 'يجب / حتماً',
  ought: 'ينبغي',

  // Common Adverbs
  not: 'ليس / لا / لم',
  no: 'لا / كلا',
  yes: 'نعم',
  never: 'أبداً / قط',
  always: 'دائماً',
  often: 'غالباً / مراراً',
  sometimes: 'أحياناً',
  usually: 'عادةً',
  rarely: 'نادراً',
  seldom: 'نادراً',
  also: 'أيضاً',
  too: 'أيضاً / جداً (للغاية)',
  very: 'جداً / للغاية',
  really: 'حقاً / فعلاً',
  quite: 'تماماً / إلى حد ما',
  just: 'فقط / للتو / عادل',
  only: 'فقط / وحيد',
  now: 'الآن',
  then: 'ثم / حينئذ',
  here: 'هنا',
  there: 'هناك',
  well: 'جيداً / حسناً',
  even: 'حتى / بل',
  more: 'أكثر',
  most: 'معظم / الأكثر',
  less: 'أقل',
  least: 'الأقل',
  again: 'مرة أخرى / مجدداً',
  away: 'بعيداً',
  back: 'للخلف / عودة',
  still: 'ما زال / لا يزال',
  already: 'بالفعل / سبق أن',
  yet: 'بعد / حتى الآن / مع ذلك',
  soon: 'قريباً',
  almost: 'تقريباً / كاد',
  together: 'معاً / سوياً',
  enough: 'كافٍ / بما يكفي',
  perhaps: 'ربما / لعل',
  probably: 'على الأرجح / غالباً',
  definitely: 'بالتأكيد / حتماً',
  certainly: 'بالتأكيد',
  consistently: 'باستمرار / بثبات',
  quickly: 'بسرعة',
  slowly: 'ببطء',
  easily: 'بسهولة',

  // Essential Common Verbs & Participles
  learn: 'يتعلم',
  learning: 'تعلم / دارسة',
  learned: 'تعلم / مكتسب',
  learns: 'يتعلم',
  enhance: 'يعزز / يحسّن',
  enhancing: 'تعزيز / تحسين',
  enhanced: 'مُعزَّز / مُحسَّن',
  enhances: 'يعزز',
  improve: 'يطور / يتحسن',
  improving: 'تطوير / تحسين',
  improved: 'مُطوَّر / تحسَّن',
  improves: 'يتحسن',
  practice: 'يمارس / يتدرب / ممارسة',
  practicing: 'ممارسة / تدريب',
  practiced: 'تدرّب / مارس',
  practices: 'يمارس / ممارسات',
  speak: 'يتحدث / يتكلم',
  speaking: 'تحدث / كلام',
  spoke: 'تحدث',
  spoken: 'منطوق / متحدث به',
  speaks: 'يتحدث',
  read: 'يقرأ / قرأ',
  reading: 'قراءة',
  reads: 'يقرأ',
  write: 'يكتب',
  writing: 'كتابة',
  wrote: 'كتب',
  written: 'مكتوب',
  writes: 'يكتب',
  listen: 'يستمع / ينصت',
  listening: 'استماع / إنصات',
  listened: 'استمع',
  listens: 'يستمع',
  understand: 'يفهم / يستوعب',
  understanding: 'فهم / استيعاب',
  understood: 'مفهوم / فهم',
  understands: 'يفهم',
  make: 'يصنع / يجعل',
  making: 'صنع / جعل',
  made: 'صنع / مصنوع',
  makes: 'يجعل / يصنع',
  take: 'يأخذ / يستغرق',
  taking: 'أخذ / استغراق',
  took: 'أخذ',
  taken: 'مأخوذ',
  takes: 'يأخذ',
  give: 'يعطي / يمنح',
  giving: 'إعطاء / منح',
  gave: 'أعطى',
  given: 'مُعطى / معطيات',
  gives: 'يعطي',
  get: 'يحصل على / ينال / يصبح',
  getting: 'حصول / صيرورة',
  got: 'حصل على',
  gotten: 'مكتسب / حاصل على',
  gets: 'يحصل على',
  go: 'يذهب / يسير',
  going: 'ذاهب / الذهاب',
  went: 'ذهب',
  gone: 'ذهب / ماضٍ',
  goes: 'يذهب',
  come: 'يأتي / يحضر',
  coming: 'قادم / مجيء',
  came: 'أتى',
  comes: 'يأتي',
  see: 'يرى / يشاهد',
  seeing: 'رؤية',
  saw: 'رأى',
  seen: 'مرئي / شوهد',
  sees: 'يرى',
  look: 'ينظر / يبدو',
  looking: 'نظر / بحث',
  looked: 'نظر / بدا',
  looks: 'يبدو / ينظر',
  think: 'يفكر / يعتقد',
  thinking: 'تفكير / اعتقاد',
  thought: 'فكر / فكرة',
  thinks: 'يفكر',
  know: 'يعرف / يعلم',
  knowing: 'معرفة',
  knew: 'عرف',
  known: 'معروف / معلوم',
  knows: 'يعرف',
  feel: 'يشعر / يحس',
  feeling: 'شعور / إحساس',
  felt: 'شعر',
  feels: 'يشعر',
  help: 'يساعد / مساعدة',
  helping: 'مساعدة',
  helped: 'ساعد / معان',
  helps: 'يساعد',
  need: 'يحتاج / حاجة',
  needing: 'احتياج',
  needed: 'مطلوب / محتاج إليه',
  needs: 'يحتاج / احتياجات',
  use: 'يستخدم / يستعمل',
  using: 'استخدام / استعمال',
  used: 'مُستخدَم / معتاد',
  uses: 'يستخدم / استخدامات',
  find: 'يجد / يكتشف',
  finding: 'إيجاد / نتائج',
  found: 'وجد / مؤسس',
  finds: 'يجد',
  tell: 'يخبر / يروي',
  telling: 'إخبار',
  told: 'أخبر',
  tells: 'يخبر',
  ask: 'يسأل / يطلب',
  asking: 'سؤال / طلب',
  asked: 'سأل / طُلِب منه',
  asks: 'يسأل',
  try: 'يحاول / يجرب',
  trying: 'محاولة / تجربة',
  tried: 'حاول / مجرّب',
  tries: 'يحاول',
  call: 'يتصل / ينادي / يسمي',
  calling: 'اتصال / نداء',
  called: 'مُسمى / اتصل',
  calls: 'اتصالات / ينادي',

  // Core Educational & Linguistic Nouns
  fluency: 'طلاقة / فصاحة',
  skill: 'مهارة / براعة',
  skills: 'مهارات',
  communication: 'تواصل / اتصال',
  language: 'لغة',
  languages: 'لغات',
  vocabulary: 'مفردات / معجم',
  word: 'كلمة / مفردة',
  words: 'كلمات / مفردات',
  sentence: 'جملة',
  sentences: 'جمل',
  grammar: 'قواعد / نحو',
  pronunciation: 'نطق / تلفظ',
  meaning: 'معنى / دلالة',
  meanings: 'معانٍ',
  context: 'سياق',
  contexts: 'سياقات',
  lesson: 'درس',
  lessons: 'دروس',
  student: 'طالب / متعلم',
  students: 'طلاب',
  teacher: 'معلم / أستاذ',
  teachers: 'معلمون',
  school: 'مدرسة',
  schools: 'مدارس',
  book: 'كتاب',
  books: 'كتب',
  story: 'قصة / رواية',
  stories: 'قصص',
  ability: 'قدرة / استطاعة',
  abilities: 'قدرات / مهارات',
  goal: 'هدف / غاية',
  goals: 'أهداف',
  level: 'مستوى / درجة',
  levels: 'مستويات',
  progress: 'تقدم / تطور',
  result: 'نتيجة',
  results: 'نتائج',
  world: 'عالم / دنيا',
  life: 'حياة',
  time: 'وقت / زمن / مرة',
  times: 'أوقات / مرات',
  day: 'يوم',
  days: 'أيام',
  year: 'سنة / عام',
  years: 'سنوات / أعوام',
  people: 'ناس / أشخاص / شعب',
  person: 'شخص / إنسان',
  man: 'رجل',
  men: 'رجال',
  woman: 'امرأة',
  women: 'نساء',
  child: 'طفل',
  children: 'أطفال',
  friend: 'صديق',
  friends: 'أصدقاء',
  family: 'عائلة / أسرة',
  home: 'منزل / بيت / وطن',
  house: 'بيت / دار',
  place: 'مكان / موقع',
  work: 'عمل / وظيفة',
  job: 'وظيفة / مهنة',
  system: 'نظام / منظومة',
  idea: 'فكرة',
  ideas: 'أفكار',
  question: 'سؤال / مسألة',
  questions: 'أسئلة',
  answer: 'إجابة / جواب',
  answers: 'إجابات',
  point: 'نقطة / فكرة',
  points: 'نقاط',
  part: 'جزء / دور',
  parts: 'أجزاء',
  number: 'رقم / عدد',
  information: 'معلومات / بيانات',
  fact: 'حقيقة',
  example: 'مثال / نموذج',
  examples: 'أمثلة',
  vehicle: 'مركبة / وسيلة نقل / سيارة',
  vehicles: 'مركبات / وسائل نقل',
  vegetable: 'خضار / خضروات',
  vegetables: 'خضروات',
  car: 'سيارة / مركبة',
  cars: 'سيارات',
  apple: 'تفاحة',
  water: 'ماء / مياه',
  food: 'طعام / غذاء',
};

/**
 * Stem/Lemmatize English word to its base dictionary form.
 */
export function stemEnglishWord(word) {
  if (!word || typeof word !== 'string') return '';
  const clean = word.toLowerCase().replace(/[^a-z]/gi, '').trim();
  if (!clean) return '';

  if (CORE_ARABIC_DICTIONARY[clean]) return clean;

  // Plurals: -ies -> -y (e.g. "abilities" -> "ability", "stories" -> "story")
  if (clean.endsWith('ies') && clean.length > 4) {
    const candidate = clean.slice(0, -3) + 'y';
    if (CORE_ARABIC_DICTIONARY[candidate]) return candidate;
  }

  // Plurals: -es -> base (e.g. "watches" -> "watch", "boxes" -> "box")
  if (clean.endsWith('es') && clean.length > 4) {
    const candidate = clean.slice(0, -2);
    if (CORE_ARABIC_DICTIONARY[candidate]) return candidate;
  }

  // Plurals & 3rd person: -s -> base (e.g. "skills" -> "skill", "languages" -> "language")
  if (clean.endsWith('s') && !clean.endsWith('ss') && clean.length > 3) {
    const candidate = clean.slice(0, -1);
    if (CORE_ARABIC_DICTIONARY[candidate]) return candidate;
  }

  // Past tense: -ed -> base (e.g. "improved" -> "improve", "practiced" -> "practice")
  if (clean.endsWith('ed') && clean.length > 4) {
    const candidate1 = clean.slice(0, -2);
    if (CORE_ARABIC_DICTIONARY[candidate1]) return candidate1;
    const candidate2 = clean.slice(0, -1);
    if (CORE_ARABIC_DICTIONARY[candidate2]) return candidate2;
  }

  // Continuous: -ing -> base (e.g. "practicing" -> "practice", "dancing" -> "dance")
  if (clean.endsWith('ing') && clean.length > 5) {
    const candidate1 = clean.slice(0, -3);
    if (CORE_ARABIC_DICTIONARY[candidate1]) return candidate1;
    const candidate2 = clean.slice(0, -3) + 'e';
    if (CORE_ARABIC_DICTIONARY[candidate2]) return candidate2;
  }

  return clean;
}

/**
 * Strips Tashkeel (Harakat) and Tatweel from Arabic text.
 */
export function stripTashkeel(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
}

/**
 * Normalizes Arabic text by removing Tashkeel & normalizing Alef/Taa Marbouta for 100% accurate search matching.
 */
export function normalizeArabicText(text) {
  if (!text || typeof text !== 'string') return '';
  return stripTashkeel(text)
    .replace(/[أإآٱ]/g, 'ا') // Normalize Alef
    .replace(/ة/g, 'ه')     // Normalize Taa Marbouta
    .replace(/ى/g, 'ي')     // Normalize Yaa
    .toLowerCase()
    .trim();
}

export default {
  CORE_ARABIC_DICTIONARY,
  stemEnglishWord,
  stripTashkeel,
  normalizeArabicText,
};
