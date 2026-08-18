/**
 * Oxford 3000™ Shared Dialogue Scenarios & Roleplay Topics
 * Feature 0604: Consolidates duplicate dialogue objects across DualPlayerHub and PersonalTutor.
 */

export const DIALOGUE_TOPICS = [
  {
    id: 'airport',
    title: 'مطار دبي الدولي (Airport Check-in)',
    icon: '✈️',
    cefr: 'A2',
    roles: {
      player1: { name: 'مسافر (Passenger)', avatar: '🧳', goal: 'إتمام إجراءات السفر وطلب مقعد بجانب النافذة' },
      player2: { name: 'موظف الطيران (Agent)', avatar: '👔', goal: 'فحص التذكرة وجواز السفر وتأكيد الوزن' },
    },
    starterTurns: [
      { speaker: 'player1', english: 'Hello! I would like to check in for flight EK203 to London.', arabic: 'مرحباً! أود إتمام إجراءات السفر للرحلة EK203 إلى لندن.' },
      { speaker: 'player2', english: 'Good morning! May I see your passport and ticket, please?', arabic: 'صباح الخير! هل يمكنني رؤية جواز سفرك وتذكرتك من فضلك؟' },
    ],
    targetWords: ['flight', 'passport', 'luggage', 'window', 'boarding'],
  },
  {
    id: 'coffee_shop',
    title: 'مقهى سياحي (Cafe Order)',
    icon: '☕',
    cefr: 'A1',
    roles: {
      player1: { name: 'زبون (Customer)', avatar: '🧑', goal: 'طلب قهوة ومعجنات ودفع الحساب' },
      player2: { name: 'باريستا (Barista)', avatar: '☕', goal: 'تقديم الخيارات واقتراح العروض' },
    },
    starterTurns: [
      { speaker: 'player1', english: 'Hi there! Could I get an iced vanilla latte, please?', arabic: 'مرحباً! هل يمكنني الحصول على لاتيه مثلج بالفانيليا من فضلك؟' },
      { speaker: 'player2', english: 'Certainly! What size would you prefer? Small, medium, or large?', arabic: 'بالتأكيد! ما الحجم الذي تفضله؟ صغير، متوسط، أم كبير؟' },
    ],
    targetWords: ['coffee', 'sugar', 'large', 'receipt', 'delicious'],
  },
  {
    id: 'job_interview',
    title: 'مقابلة وظيفية (Tech Job Interview)',
    icon: '💼',
    cefr: 'B2',
    roles: {
      player1: { name: 'المتقدم للوظيفة (Candidate)', avatar: '👨‍💼', goal: 'استعراض الخبرات وإبراز نقاط القوة' },
      player2: { name: 'مدير التوظيف (Interviewer)', avatar: '👩‍💼', goal: 'طرح أسئلة تقنية وسلوكية لتقييم المهارة' },
    },
    starterTurns: [
      { speaker: 'player2', english: 'Welcome! Can you start by telling us about your core strengths and achievements?', arabic: 'أهلاً بك! هل يمكنك البدء بإخبارنا عن نقاط قوتك الأساسية وإنجازاتك؟' },
      { speaker: 'player1', english: 'Thank you. Over the past four years, I have successfully led software engineering projects and solved complex challenges.', arabic: 'شكراً لك. على مدار السنوات الأربع الماضية، قمت بقيادة مشاريع هندسة برمجيات بنجاح وحل تحديات معقدة.' },
    ],
    targetWords: ['achievement', 'challenge', 'experience', 'skill', 'professional'],
  },
  {
    id: 'doctor_clinic',
    title: 'عيادة الطبيب (Doctor Appointment)',
    icon: '🩺',
    cefr: 'B1',
    roles: {
      player1: { name: 'مريض (Patient)', avatar: '🤒', goal: 'شرح الأعراض ومدة الشعور بالألم' },
      player2: { name: 'طبيب (Doctor)', avatar: '👨‍⚕️', goal: 'التشخيص وتقديم الوصفة الطبية والنصائح' },
    },
    starterTurns: [
      { speaker: 'player2', english: 'Hello! How can I help you today? What symptoms are you feeling?', arabic: 'مرحباً! كيف يمكنني مساعدتك اليوم؟ ما الأعراض التي تشعر بها؟' },
      { speaker: 'player1', english: 'Doctor, I have had a severe headache and throat pain since yesterday.', arabic: 'يا دكتور، لدي صداع حاد وألم في الحلق منذ الأمس.' },
    ],
    targetWords: ['symptom', 'medicine', 'pain', 'healthy', 'recover'],
  },
];

export default {
  DIALOGUE_TOPICS,
};
