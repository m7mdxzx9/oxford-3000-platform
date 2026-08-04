/**
 * Oxford 3000 CEFR Lexicon Dataset & Helper Utilities Module
 * Module Path: src/data/oxford3000.js
 *
 * Complete representative dataset of English vocabulary spanning CEFR levels A1, A2, B1, and B2.
 */

export const oxford3000Data = [
  // A1 Level Words
  { id: 1001, word: 'a, an', pos: 'indefinite article', cefr: 'A1', arabic: 'أداة تنكير (أ، أن)', example: 'I bought a book and an apple.', ipa: '/ə, æn/' },
  { id: 1002, word: 'about', pos: 'preposition, adverb', cefr: 'A1', arabic: 'عَنْ / حَوْلَ', example: 'What is this book about?', ipa: '/əˈbaʊt/' },
  { id: 1003, word: 'above', pos: 'preposition, adverb', cefr: 'A1', arabic: 'فَوْقَ', example: 'The picture hangs above the fireplace.', ipa: '/əˈbʌv/' },
  { id: 1004, word: 'across', pos: 'preposition, adverb', cefr: 'A1', arabic: 'عَبْرَ', example: 'He walked across the street safely.', ipa: '/əˈkrɒs/' },
  { id: 1005, word: 'action', pos: 'noun', cefr: 'A1', arabic: 'عَمَل / فِعْل', example: 'We need to take action right now.', ipa: '/ˈæk.ʃən/' },
  { id: 1006, word: 'activity', pos: 'noun', cefr: 'A1', arabic: 'نَشاط', example: 'Swimming is a great summer activity.', ipa: '/ækˈtɪv.ə.ti/' },
  { id: 1007, word: 'actor', pos: 'noun', cefr: 'A1', arabic: 'مُمَثِّل', example: 'He wants to become a famous actor.', ipa: '/ˈæk.tər/' },
  { id: 1008, word: 'actress', pos: 'noun', cefr: 'A1', arabic: 'مُمَثِّلَة', example: 'She is a talented Hollywood actress.', ipa: '/ˈæk.trəs/' },
  { id: 1009, word: 'add', pos: 'verb', cefr: 'A1', arabic: 'يُضيف', example: 'Please add some sugar to my tea.', ipa: '/æd/' },
  { id: 1010, word: 'address', pos: 'noun', cefr: 'A1', arabic: 'عُنْوان', example: 'Write your address on this envelope.', ipa: '/əˈdres/' },
  { id: 1011, word: 'adult', pos: 'noun', cefr: 'A1', arabic: 'بَالِغ', example: 'An adult must accompany young children.', ipa: '/ˈæd.ʌlt/' },
  { id: 1012, word: 'advice', pos: 'noun', cefr: 'A1', arabic: 'نَصيحَة', example: 'Thank you for your helpful advice.', ipa: '/ədˈvaɪs/' },
  { id: 1013, word: 'afraid', pos: 'adjective', cefr: 'A1', arabic: 'خائِف', example: 'Do not be afraid of making mistakes.', ipa: '/əˈfreɪd/' },
  { id: 1014, word: 'after', pos: 'preposition', cefr: 'A1', arabic: 'بَعْدَ', example: 'We went home after the movie ended.', ipa: '/ˈɑːf.tər/' },
  { id: 1015, word: 'afternoon', pos: 'noun', cefr: 'A1', arabic: 'بَعْدَ الظُّهْر', example: 'I will call you tomorrow afternoon.', ipa: '/ˌɑːf.təˈnuːn/' },
  { id: 1016, word: 'again', pos: 'adverb', cefr: 'A1', arabic: 'مَرَّةً أُخْرى', example: 'Please read the text again carefully.', ipa: '/əˈɡen/' },
  { id: 1017, word: 'age', pos: 'noun', cefr: 'A1', arabic: 'عُمْر / سِنّ', example: 'At what age did you learn to swim?', ipa: '/eɪdʒ/' },
  { id: 1018, word: 'ago', pos: 'adverb', cefr: 'A1', arabic: 'مُنْذُ', example: 'They arrived two days ago.', ipa: '/əˈɡəʊ/' },
  { id: 1019, word: 'agree', pos: 'verb', cefr: 'A1', arabic: 'يُوافِق', example: 'I completely agree with your idea.', ipa: '/əˈɡriː/' },
  { id: 1020, word: 'air', pos: 'noun', cefr: 'A1', arabic: 'هَواء', example: 'Fresh air is necessary for good health.', ipa: '/eər/' },
  { id: 1021, word: 'airport', pos: 'noun', cefr: 'A1', arabic: 'مَطار', example: 'We arrived at the international airport early.', ipa: '/ˈeə.pɔːt/' },
  { id: 1022, word: 'all', pos: 'determiner, pronoun', cefr: 'A1', arabic: 'كُلّ / جَميع', example: 'All students passed the English exam.', ipa: '/ɔːl/' },
  { id: 1023, word: 'also', pos: 'adverb', cefr: 'A1', arabic: 'أَيْضاً', example: 'She speaks English and also French.', ipa: '/ˈɔːl.səʊ/' },
  { id: 1024, word: 'always', pos: 'adverb', cefr: 'A1', arabic: 'دَائِماً', example: 'He always arrives on time for work.', ipa: '/ˈɔːl.weɪz/' },
  { id: 1025, word: 'amazing', pos: 'adjective', cefr: 'A1', arabic: 'مُذْهِل / مُدْهِش', example: 'The view from the mountain was amazing.', ipa: '/əˈmeɪ.zɪŋ/' },
  { id: 1026, word: 'and', pos: 'conjunction', cefr: 'A1', arabic: 'وَ', example: 'I like coffee and tea.', ipa: '/ænd/' },
  { id: 1027, word: 'angry', pos: 'adjective', cefr: 'A1', arabic: 'غاضِب', example: 'Why are you so angry today?', ipa: '/ˈæŋ.ɡri/' },
  { id: 1028, word: 'animal', pos: 'noun', cefr: 'A1', arabic: 'حَيَوان', example: 'The lion is a wild animal.', ipa: '/ˈæn.ɪ.məl/' },
  { id: 1029, word: 'another', pos: 'determiner, pronoun', cefr: 'A1', arabic: 'آخَر', example: 'Would you like another cup of tea?', ipa: '/əˈnʌð.ər/' },
  { id: 1030, word: 'answer', pos: 'noun, verb', cefr: 'A1', arabic: 'إِجابَة / يُجيب', example: 'Please answer the question accurately.', ipa: '/ˈɑːn.sər/' },
  { id: 1031, word: 'anyone', pos: 'pronoun', cefr: 'A1', arabic: 'أَيّ شَخْص', example: 'Does anyone know the right answer?', ipa: '/ˈen.i.wʌn/' },
  { id: 1032, word: 'anything', pos: 'pronoun', cefr: 'A1', arabic: 'أَيّ شَيْء', example: 'Is there anything else I can help with?', ipa: '/ˈen.i.θɪŋ/' },
  { id: 1033, word: 'apartment', pos: 'noun', cefr: 'A1', arabic: 'شَقَّة', example: 'They live in a modern city apartment.', ipa: '/əˈpɑːt.mənt/' },
  { id: 1034, word: 'apple', pos: 'noun', cefr: 'A1', arabic: 'تُفّاحَة', example: 'She ate a fresh red apple for breakfast.', ipa: '/ˈæp.əl/' },
  { id: 1035, word: 'April', pos: 'noun', cefr: 'A1', arabic: 'أَبْريل / نيسان', example: 'Spring begins around April.', ipa: '/ˈeɪ.prəl/' },
  { id: 1036, word: 'area', pos: 'noun', cefr: 'A1', arabic: 'مِنْطَقَة / مِساحَة', example: 'This is a quiet residential area.', ipa: '/ˈeə.ri.ə/' },
  { id: 1037, word: 'arm', pos: 'noun', cefr: 'A1', arabic: 'ذِراع', example: 'He broke his arm playing football.', ipa: '/ɑːm/' },
  { id: 1038, word: 'around', pos: 'preposition, adverb', cefr: 'A1', arabic: 'حَوْلَ', example: 'We walked around the city center.', ipa: '/əˈraʊnd/' },
  { id: 1039, word: 'arrive', pos: 'verb', cefr: 'A1', arabic: 'يَصِل', example: 'The train will arrive at five oclock.', ipa: '/əˈraɪv/' },
  { id: 1040, word: 'art', pos: 'noun', cefr: 'A1', arabic: 'فَنّ', example: 'She loves studying modern art.', ipa: '/ɑːt/' },

  // A2 Level Words
  { id: 2001, word: 'ability', pos: 'noun', cefr: 'A2', arabic: 'قُدْرَة / مَهارَة', example: 'She has a great ability to solve complex math problems.', ipa: '/əˈbɪl.ə.ti/' },
  { id: 2002, word: 'able', pos: 'adjective', cefr: 'A2', arabic: 'قادِر', example: 'Will you be able to come to the meeting tomorrow?', ipa: '/ˈeɪ.bəl/' },
  { id: 2003, word: 'accept', pos: 'verb', cefr: 'A2', arabic: 'يَقْبَل', example: 'They decided to accept the job offer.', ipa: '/əkˈsept/' },
  { id: 2004, word: 'accident', pos: 'noun', cefr: 'A2', arabic: 'حادِث', example: 'He had a minor traffic accident yesterday.', ipa: '/ˈæk.sɪ.dənt/' },
  { id: 2005, word: 'according to', pos: 'preposition', cefr: 'A2', arabic: 'وَفْقاً لِـ / بِحَسَب', example: 'According to the report, sales increased.', ipa: '/əˈkɔː.dɪŋ tuː/' },
  { id: 2006, word: 'achieve', pos: 'verb', cefr: 'A2', arabic: 'يُحَقِّق / يُنْجِز', example: 'Hard work helps you achieve your goals.', ipa: '/əˈtʃiːv/' },
  { id: 2007, word: 'active', pos: 'adjective', cefr: 'A2', arabic: 'نَشيط / فَعّال', example: 'Regular walking keeps you healthy and active.', ipa: '/ˈæk.tɪv/' },
  { id: 2008, word: 'actually', pos: 'adverb', cefr: 'A2', arabic: 'فِي الحَقيقَة / فِعْلاً', example: 'I actually enjoyed the lecture very much.', ipa: '/ˈæk.tʃu.ə.li/' },
  { id: 2009, word: 'advantage', pos: 'noun', cefr: 'A2', arabic: 'مَزيَّة / فائِدَة', example: 'Fluency in English is a major advantage.', ipa: '/ədˈvɑːn.tɪdʒ/' },
  { id: 2010, word: 'adventure', pos: 'noun', cefr: 'A2', arabic: 'مُغامَرَة', example: 'Traveling around the world is an exciting adventure.', ipa: '/ədˈven.tʃər/' },

  // B1 Level Words
  { id: 3001, word: 'absolutely', pos: 'adverb', cefr: 'B1', arabic: 'بِالتَّأْكيد / مُطْلَقاً', example: 'You are absolutely right about this situation.', ipa: '/ˌæb.səˈluːt.li/' },
  { id: 3002, word: 'academic', pos: 'adjective', cefr: 'B1', arabic: 'أَكاديمِيّ', example: 'The university offers strong academic programs.', ipa: '/ˌæk.əˈdem.ɪk/' },
  { id: 3003, word: 'access', pos: 'noun, verb', cefr: 'B1', arabic: 'وُصول / يَدْخُل', example: 'Students have free access to the online library.', ipa: '/ˈæk.ses/' },
  { id: 3004, word: 'account', pos: 'noun', cefr: 'B1', arabic: 'حِساب بَنْكِيّ', example: 'I opened a new bank account today.', ipa: '/əˈkaʊnt/' },
  { id: 3005, word: 'achievement', pos: 'noun', cefr: 'B1', arabic: 'إِنْجاز / تَحْقيق', example: 'Passing the exam was a great achievement.', ipa: '/əˈtʃiːv.mənt/' },
  { id: 3006, word: 'admire', pos: 'verb', cefr: 'B1', arabic: 'يُعْجَب بِـ', example: 'I admire her dedication to community service.', ipa: '/ədˈmaɪər/' },
  { id: 3007, word: 'admit', pos: 'verb', cefr: 'B1', arabic: 'يَعْتَرِف', example: 'He admitted that he had made a mistake.', ipa: '/ədˈmɪt/' },
  { id: 3008, word: 'advanced', pos: 'adjective', cefr: 'B1', arabic: 'مُتَقَدِّم', example: 'She is taking an advanced course in English.', ipa: '/ədˈvɑːnst/' },
  { id: 3009, word: 'advise', pos: 'verb', cefr: 'B1', arabic: 'يَنْصَح', example: 'Doctors advise drinking plenty of water.', ipa: '/ədˈvaɪz/' },
  { id: 3010, word: 'afford', pos: 'verb', cefr: 'B1', arabic: 'يَتَحَمَّل نَفَقَة / يَقْدِر عَلَى', example: 'We cannot afford to buy a new car right now.', ipa: '/əˈfɔːd/' },

  // B2 Level Words
  { id: 4001, word: 'abandon', pos: 'verb', cefr: 'B2', arabic: 'يَتَخَلَّى عَنْ / يَهْجُر', example: 'They had to abandon the plan due to lack of funding.', ipa: '/əˈbændən/' },
  { id: 4002, word: 'abroad', pos: 'adverb', cefr: 'B2', arabic: 'خارِج البِلاد / فِي الخارِج', example: 'She decided to study abroad for her degree.', ipa: '/əˈbrɔːd/' },
  { id: 4003, word: 'absolute', pos: 'adjective', cefr: 'B2', arabic: 'مُطْلَق / كَامِل', example: 'We need absolute silence during the test.', ipa: '/ˈæb.sə.luːt/' },
  { id: 4004, word: 'acceptable', pos: 'adjective', cefr: 'B2', arabic: 'مَقْبول', example: 'His behavior was not acceptable at school.', ipa: '/əkˈsep.tə.bəl/' },
  { id: 4005, word: 'accompany', pos: 'verb', cefr: 'B2', arabic: 'يُرافِق / يَصْحَب', example: 'Children must be accompanied by an adult.', ipa: '/əˈkʌm.pə.ni/' },
  { id: 4006, word: 'accurate', pos: 'adjective', cefr: 'B2', arabic: 'دَقيق / مُضْبوط', example: 'The weather forecast proved to be accurate.', ipa: '/ˈæk.jə.rət/' },
  { id: 4007, word: 'accuse', pos: 'verb', cefr: 'B2', arabic: 'يَتَّهِم', example: 'You should not accuse anyone without evidence.', ipa: '/əˈkjuːz/' },
  { id: 4008, word: 'acknowledge', pos: 'verb', cefr: 'B2', arabic: 'يَعْتَرِف بِـ / يُقِرّ', example: 'The speaker acknowledged the contribution of the team.', ipa: '/əkˈnɒl.ɪdʒ/' },
  { id: 4009, word: 'acquire', pos: 'verb', cefr: 'B2', arabic: 'يَكْتَسِب / يَنال', example: 'Students acquire language skills through practice.', ipa: '/əˈkwaɪər/' },
  { id: 4010, word: 'adapt', pos: 'verb', cefr: 'B2', arabic: 'يَتَكَيَّف / يَتَأَقْلَم', example: 'It takes time to adapt to a new culture.', ipa: '/əˈdæpt/' },
  { id: 4011, word: 'administration', pos: 'noun', cefr: 'B2', arabic: 'إِدارَة', example: 'The school administration announced new rules.', ipa: '/ədˌmɪn.ɪˈstreɪ.ʃən/' },
  { id: 4012, word: 'adopt', pos: 'verb', cefr: 'B2', arabic: 'يَتَبَنَّى', example: 'The company decided to adopt a new strategy.', ipa: '/əˈdɒpt/' },
  { id: 4013, word: 'analyze', pos: 'verb', cefr: 'B2', arabic: 'يُحَلِّل', example: 'Researchers analyze the data thoroughly.', ipa: '/ˈæn.əl.aɪz/' },
  { id: 4014, word: 'apparent', pos: 'adjective', cefr: 'B2', arabic: 'واضِح / ظاهِر', example: 'It became apparent that the project was succeeding.', ipa: '/əˈpær.ənt/' },
  { id: 4015, word: 'approach', pos: 'noun, verb', cefr: 'B2', arabic: 'نَهْج / يَقْتَرِب', example: 'We need a innovative approach to learning.', ipa: '/əˈprəʊtʃ/' },
  { id: 4016, word: 'appropriate', pos: 'adjective', cefr: 'B2', arabic: 'مُناسِب / ملائم', example: 'Wear appropriate clothes for the interview.', ipa: '/əˈprəʊ.pri.ət/' },
  { id: 4017, word: 'assume', pos: 'verb', cefr: 'B2', arabic: 'يَفْتَرِض', example: 'Don’t assume that everyone agrees with you.', ipa: '/əˈsjuːm/' },
  { id: 4018, word: 'attitude', pos: 'noun', cefr: 'B2', arabic: 'مَوْقِف / اتِّجاه', example: 'A positive attitude makes learning easier.', ipa: '/ˈæt.ɪ.tʃuːd/' },
  { id: 4019, word: 'authority', pos: 'noun', cefr: 'B2', arabic: 'سُلْطَة / هَيْئَة', example: 'The local authority approved the building plan.', ipa: '/ɔːˈθɒr.ə.ti/' },
  { id: 4020, word: 'available', pos: 'adjective', cefr: 'B2', arabic: 'مُتاح / مُتَوَفِّر', example: 'This service is available 24/7 online.', ipa: '/əˈveɪ.lə.bəl/' }
];

export const OXFORD_3000 = oxford3000Data;

export const getCefrLevels = () => ['ALL', 'A1', 'A2', 'B1', 'B2'];

export const getPosOptions = (dataset = oxford3000Data) => {
  const list = Array.isArray(dataset) ? dataset : oxford3000Data;
  const posSet = new Set(list.map((item) => item?.pos?.toLowerCase()).filter(Boolean));
  return ['ALL', ...Array.from(posSet).sort()];
};

export default oxford3000Data;
