/**
 * Oxford 3000 CEFR Lexicon Dataset & Helper Utilities Module
 * Module Path: src/data/oxford3000.js
 *
 * Provides a representative, rich dataset of English vocabulary spanning CEFR levels A1, A2, B1, and B2.
 * Schema per item: { id, word, pos, cefr, arabic, example, ipa }
 */

export const oxford3000Data = [
  // ==========================================
  // LEVEL A1 (Beginner / Breakthrough)
  // ==========================================
  { id: 101, word: 'about', pos: 'preposition', cefr: 'A1', arabic: 'عَنْ / حَوْلَ', example: 'What is this book about?', ipa: '/əˈbaʊt/' },
  { id: 102, word: 'above', pos: 'preposition', cefr: 'A1', arabic: 'فَوْقَ', example: 'The picture hangs above the fireplace.', ipa: '/əˈbʌv/' },
  { id: 103, word: 'across', pos: 'preposition', cefr: 'A1', arabic: 'عَبْرَ', example: 'He walked across the street safely.', ipa: '/əˈkrɒs/' },
  { id: 104, word: 'action', pos: 'noun', cefr: 'A1', arabic: 'عَمَل / فِعْل', example: 'We need to take action right now.', ipa: '/ˈæk.ʃən/' },
  { id: 105, word: 'activity', pos: 'noun', cefr: 'A1', arabic: 'نَشاط', example: 'Swimming is a great summer activity.', ipa: '/ækˈtɪv.ə.ti/' },
  { id: 106, word: 'actor', pos: 'noun', cefr: 'A1', arabic: 'مُمَثِّل', example: 'He wants to become a famous actor.', ipa: '/ˈæk.tər/' },
  { id: 107, word: 'add', pos: 'verb', cefr: 'A1', arabic: 'يُضيف', example: 'Please add some sugar to my tea.', ipa: '/æd/' },
  { id: 108, word: 'address', pos: 'noun', cefr: 'A1', arabic: 'عُنْوان', example: 'Write your address on this envelope.', ipa: '/əˈdres/' },
  { id: 109, word: 'adult', pos: 'noun', cefr: 'A1', arabic: 'بَالِغ', example: 'Adult tickets cost more than child tickets.', ipa: '/ˈæd.ʌlt/' },
  { id: 110, word: 'advice', pos: 'noun', cefr: 'A1', arabic: 'نَصيحَة', example: 'Thank you for your helpful advice.', ipa: '/ədˈvaɪs/' },
  { id: 111, word: 'afraid', pos: 'adjective', cefr: 'A1', arabic: 'خائِف', example: 'Do not be afraid of making mistakes.', ipa: '/əˈfreɪd/' },
  { id: 112, word: 'after', pos: 'preposition', cefr: 'A1', arabic: 'بَعْدَ', example: 'We went home after the movie ended.', ipa: '/ˈɑːf.tər/' },
  { id: 113, word: 'afternoon', pos: 'noun', cefr: 'A1', arabic: 'بَعْدَ الظُّهْر', example: 'I will call you tomorrow afternoon.', ipa: '/ˌɑːf.təˈnuːn/' },
  { id: 114, word: 'again', pos: 'adverb', cefr: 'A1', arabic: 'مَرَّةً أُخْرى', example: 'Could you please repeat that again?', ipa: '/əˈɡen/' },
  { id: 115, word: 'against', pos: 'preposition', cefr: 'A1', arabic: 'ضِدّ', example: 'They played against a very strong team.', ipa: '/əˈɡenst/' },
  { id: 116, word: 'age', pos: 'noun', cefr: 'A1', arabic: 'عُمْر', example: 'She left school at the age of eighteen.', ipa: '/eɪdʒ/' },
  { id: 117, word: 'ago', pos: 'adverb', cefr: 'A1', arabic: 'مُنْذُ', example: 'He graduated two years ago.', ipa: '/əˈɡəʊ/' },
  { id: 118, word: 'agree', pos: 'verb', cefr: 'A1', arabic: 'يُوافِق', example: 'I completely agree with your suggestion.', ipa: '/əˈɡriː/' },
  { id: 119, word: 'air', pos: 'noun', cefr: 'A1', arabic: 'هَواء', example: 'I love breathing fresh mountain air.', ipa: '/eər/' },
  { id: 120, word: 'airport', pos: 'noun', cefr: 'A1', arabic: 'مَطار', example: 'The airplane landed safely at the airport.', ipa: '/ˈeə.pɔːt/' },
  { id: 121, word: 'all', pos: 'pronoun', cefr: 'A1', arabic: 'كُلّ', example: 'All students passed the final test.', ipa: '/ɔːl/' },
  { id: 122, word: 'almost', pos: 'adverb', cefr: 'A1', arabic: 'تَقْريبًا', example: 'Dinner is almost ready to be served.', ipa: '/ˈɔːl.məʊst/' },
  { id: 123, word: 'alone', pos: 'adjective', cefr: 'A1', arabic: 'بِمُفْرَدِهِ', example: 'He prefers studying alone in the library.', ipa: '/əˈləʊn/' },
  { id: 124, word: 'along', pos: 'preposition', cefr: 'A1', arabic: 'عَلى طول', example: 'We strolled along the sandy beach.', ipa: '/əˈlɒŋ/' },
  { id: 125, word: 'already', pos: 'adverb', cefr: 'A1', arabic: 'بِالْفِعْل', example: 'I have already finished reading the report.', ipa: '/ɔːlˈred.i/' },
  { id: 126, word: 'also', pos: 'adverb', cefr: 'A1', arabic: 'أَيْضًا', example: 'She speaks English and also reads French.', ipa: '/ˈɔːl.səʊ/' },
  { id: 127, word: 'always', pos: 'adverb', cefr: 'A1', arabic: 'دَائِمًا', example: 'He always greets everyone with a warm smile.', ipa: '/ˈɔːl.weɪz/' },
  { id: 128, word: 'amazing', pos: 'adjective', cefr: 'A1', arabic: 'مُذْهِل', example: 'The sunset over the ocean was amazing.', ipa: '/əˈmeɪ.zɪŋ/' },
  { id: 129, word: 'and', pos: 'conjunction', cefr: 'A1', arabic: 'وَ', example: 'Tea and coffee are served on the table.', ipa: '/ænd/' },
  { id: 130, word: 'angry', pos: 'adjective', cefr: 'A1', arabic: 'غاضِب', example: 'Why are you so angry about the delay?', ipa: '/ˈæŋ.ɡri/' },
  { id: 131, word: 'animal', pos: 'noun', cefr: 'A1', arabic: 'حَيَوان', example: 'The elephant is the largest land animal.', ipa: '/ˈæn.ɪ.məl/' },
  { id: 132, word: 'answer', pos: 'noun', cefr: 'A1', arabic: 'إِجابَة', example: 'Raise your hand if you know the answer.', ipa: '/ˈɑːn.sər/' },
  { id: 133, word: 'any', pos: 'pronoun', cefr: 'A1', arabic: 'أَيّ', example: 'Do you have any questions for the speaker?', ipa: '/ˈen.i/' },
  { id: 134, word: 'anyone', pos: 'pronoun', cefr: 'A1', arabic: 'أَيّ شَخْص', example: 'Does anyone have a spare pen?', ipa: '/ˈen.i.wʌn/' },
  { id: 135, word: 'anything', pos: 'pronoun', cefr: 'A1', arabic: 'أَيّ شَيْء', example: 'Is there anything I can do to help?', ipa: '/ˈen.i.θɪŋ/' },
  { id: 136, word: 'apartment', pos: 'noun', cefr: 'A1', arabic: 'شَقَّة', example: 'They rented a cozy apartment downtown.', ipa: '/əˈpɑːt.mənt/' },
  { id: 137, word: 'apple', pos: 'noun', cefr: 'A1', arabic: 'تُفَّاحَة', example: 'She ate a crisp red apple for lunch.', ipa: '/ˈæp.əl/' },
  { id: 138, word: 'area', pos: 'noun', cefr: 'A1', arabic: 'مِنْطَقَة', example: 'This is a quiet residential area.', ipa: '/ˈeə.ri.ə/' },
  { id: 139, word: 'arm', pos: 'noun', cefr: 'A1', arabic: 'ذِراع', example: 'He rested his arm on the wooden chair.', ipa: '/ɑːm/' },
  { id: 140, word: 'around', pos: 'preposition', cefr: 'A1', arabic: 'حَوْلَ', example: 'They sat around the warm campfire.', ipa: '/əˈraʊnd/' },
  { id: 141, word: 'arrive', pos: 'verb', cefr: 'A1', arabic: 'يَصِل', example: 'The train will arrive at platform three.', ipa: '/əˈraɪv/' },
  { id: 142, word: 'art', pos: 'noun', cefr: 'A1', arabic: 'فَنّ', example: 'She loves studying modern visual art.', ipa: '/ɑːt/' },
  { id: 143, word: 'article', pos: 'noun', cefr: 'A1', arabic: 'مَقالَة', example: 'Read this article about climate change.', ipa: '/ˈɑː.tɪ.kəl/' },
  { id: 144, word: 'artist', pos: 'noun', cefr: 'A1', arabic: 'فَنَّان', example: 'The artist painted a scenic portrait.', ipa: '/ˈɑː.tɪst/' },
  { id: 145, word: 'ask', pos: 'verb', cefr: 'A1', arabic: 'يَسْأَل', example: 'Feel free to ask questions anytime.', ipa: '/ɑːsk/' },
  { id: 146, word: 'at', pos: 'preposition', cefr: 'A1', arabic: 'في / عِنْدَ', example: 'Meet me at the central station.', ipa: '/æt/' },
  { id: 147, word: 'aunt', pos: 'noun', cefr: 'A1', arabic: 'عَمَّة / خالَة', example: 'My aunt sent me a lovely birthday present.', ipa: '/ɑːnt/' },
  { id: 148, word: 'autumn', pos: 'noun', cefr: 'A1', arabic: 'خَريف', example: 'Golden leaves fall during autumn.', ipa: '/ˈɔː.təm/' },
  { id: 149, word: 'away', pos: 'adverb', cefr: 'A1', arabic: 'بَعيدًا', example: 'The birds flew away to the south.', ipa: '/əˈweɪ/' },
  { id: 150, word: 'awesome', pos: 'adjective', cefr: 'A1', arabic: 'رَائِع', example: 'That musical performance was awesome!', ipa: '/ˈɔː.səm/' },
  { id: 151, word: 'baby', pos: 'noun', cefr: 'A1', arabic: 'طِفْل رَضيع', example: 'The baby fell asleep peacefully.', ipa: '/ˈbeɪ.bi/' },
  { id: 152, word: 'back', pos: 'adverb', cefr: 'A1', arabic: 'إِلى الخَلْف / ظَهْر', example: 'Please step back from the train track.', ipa: '/bæk/' },
  { id: 153, word: 'bad', pos: 'adjective', cefr: 'A1', arabic: 'سَيِّئ', example: 'It was a very bad stormy day.', ipa: '/bæd/' },
  { id: 154, word: 'bag', pos: 'noun', cefr: 'A1', arabic: 'حَقيبَة', example: 'Pack your books into your backpack bag.', ipa: '/bæɡ/' },
  { id: 155, word: 'ball', pos: 'noun', cefr: 'A1', arabic: 'كُرَة', example: 'Children are kicking a ball in the garden.', ipa: '/bɔːl/' },
  { id: 156, word: 'banana', pos: 'noun', cefr: 'A1', arabic: 'مَوْزَة', example: 'I had a sweet banana for breakfast.', ipa: '/bəˈnɑː.nə/' },
  { id: 157, word: 'bank', pos: 'noun', cefr: 'A1', arabic: 'بَنْك / مَصْرِف', example: 'He deposited money into his bank account.', ipa: '/bæŋk/' },
  { id: 158, word: 'bar', pos: 'noun', cefr: 'A1', arabic: 'لوح / حانَة', example: 'He bought a bar of dark chocolate.', ipa: '/bɑːr/' },
  { id: 159, word: 'bath', pos: 'noun', cefr: 'A1', arabic: 'حَمَّام', example: 'A warm bath relaxes tired muscles.', ipa: '/bɑːθ/' },
  { id: 160, word: 'bathroom', pos: 'noun', cefr: 'A1', arabic: 'دَوْرَة مِيَاه', example: 'The bathroom is at the end of the hall.', ipa: '/ˈbɑːθ.ruːm/' },
  { id: 161, word: 'beautiful', pos: 'adjective', cefr: 'A1', arabic: 'جَميل', example: 'What a beautiful flower arrangement!', ipa: '/ˈbjuː.tɪ.fəl/' },
  { id: 162, word: 'because', pos: 'conjunction', cefr: 'A1', arabic: 'لِأَنَّ', example: 'I stayed inside because it was raining.', ipa: '/bɪˈkɒz/' },
  { id: 163, word: 'become', pos: 'verb', cefr: 'A1', arabic: 'يُصْبِح', example: 'He worked hard to become an engineer.', ipa: '/bɪˈkʌm/' },
  { id: 164, word: 'bed', pos: 'noun', cefr: 'A1', arabic: 'سَرير', example: 'She goes to bed at ten o’clock.', ipa: '/bed/' },
  { id: 165, word: 'bedroom', pos: 'noun', cefr: 'A1', arabic: 'غُرْفَة نَوْم', example: 'His bedroom gets plenty of sunlight.', ipa: '/ˈbed.ruːm/' },
  { id: 166, word: 'before', pos: 'preposition', cefr: 'A1', arabic: 'قَبْلَ', example: 'Wash your hands before eating dinner.', ipa: '/bɪˈfɔːr/' },
  { id: 167, word: 'begin', pos: 'verb', cefr: 'A1', arabic: 'يَبْدَأ', example: 'Class will begin in five minutes.', ipa: '/bɪˈɡɪn/' },
  { id: 168, word: 'beginning', pos: 'noun', cefr: 'A1', arabic: 'بِدايَة', example: 'Read the story from the beginning.', ipa: '/bɪˈɡɪn.ɪŋ/' },
  { id: 169, word: 'behind', pos: 'preposition', cefr: 'A1', arabic: 'وَرَاء', example: 'The sun disappeared behind the clouds.', ipa: '/bɪˈhaɪnd/' },
  { id: 170, word: 'believe', pos: 'verb', cefr: 'A1', arabic: 'يُؤْمِن / يُصَدِّق', example: 'I believe you can accomplish your goals.', ipa: '/bɪˈliːv/' },

  // ==========================================
  // LEVEL A2 (Elementary)
  // ==========================================
  { id: 201, word: 'ability', pos: 'noun', cefr: 'A2', arabic: 'قُدْرَة', example: 'She has the ability to solve hard math problems.', ipa: '/əˈbɪl.ə.ti/' },
  { id: 202, word: 'accept', pos: 'verb', cefr: 'A2', arabic: 'يَقْبَل', example: 'Please accept this small token of appreciation.', ipa: '/əkˈsept/' },
  { id: 203, word: 'accident', pos: 'noun', cefr: 'A2', arabic: 'حادِث', example: 'Always wear a seatbelt to prevent injury in an accident.', ipa: '/ˈæk.sɪ.dənt/' },
  { id: 204, word: 'according to', pos: 'preposition', cefr: 'A2', arabic: 'وَفْقًا لِـ', example: 'According to the weather report, snow is coming.', ipa: '/əˈkɔː.dɪŋ tuː/' },
  { id: 205, word: 'active', pos: 'adjective', cefr: 'A2', arabic: 'نَشيط', example: 'He maintains an active lifestyle by running daily.', ipa: '/ˈæk.tɪv/' },
  { id: 206, word: 'adapter', pos: 'noun', cefr: 'A2', arabic: 'مُحَوِّل', example: 'You need an electric adapter when traveling abroad.', ipa: '/əˈdæp.tər/' },
  { id: 207, word: 'addition', pos: 'noun', cefr: 'A2', arabic: 'إِضافَة', example: 'In addition to swimming, she enjoys tennis.', ipa: '/əˈdɪʃ.ən/' },
  { id: 208, word: 'admire', pos: 'verb', cefr: 'A2', arabic: 'يُعْجَب بِـ', example: 'I admire her dedication to community work.', ipa: '/ədˈmaɪər/' },
  { id: 209, word: 'admit', pos: 'verb', cefr: 'A2', arabic: 'يَعْتَرِف', example: 'He admitted that he had made a calculation error.', ipa: '/ədˈmɪt/' },
  { id: 210, word: 'advantage', pos: 'noun', cefr: 'A2', arabic: 'ميزَة', example: 'Fluency in two languages is a huge advantage.', ipa: '/ədˈvɑːn.tɪdʒ/' },
  { id: 211, word: 'adventure', pos: 'noun', cefr: 'A2', arabic: 'مُغامَرَة', example: 'Hiking in the mountains was an exciting adventure.', ipa: '/ədˈven.tʃər/' },
  { id: 212, word: 'advertisement', pos: 'noun', cefr: 'A2', arabic: 'إِعْلان', example: 'They posted a job advertisement online.', ipa: '/ədˈvɜː.tɪs.mənt/' },
  { id: 213, word: 'afford', pos: 'verb', cefr: 'A2', arabic: 'يَتَحَمَّل تَكْلِفَة', example: 'We cannot afford to buy a new house right now.', ipa: '/əˈfɔːd/' },
  { id: 214, word: 'agent', pos: 'noun', cefr: 'A2', arabic: 'وَكيل', example: 'The real estate agent showed us several properties.', ipa: '/ˈeɪ.dʒənt/' },
  { id: 215, word: 'airline', pos: 'noun', cefr: 'A2', arabic: 'شَرِكَة طَيَران', example: 'Which airline did you choose for your flight?', ipa: '/ˈeə.laɪn/' },
  { id: 216, word: 'allow', pos: 'verb', cefr: 'A2', arabic: 'يَسْمَح', example: 'Visitors are not allowed to feed animals in the zoo.', ipa: '/əˈlaʊ/' },
  { id: 217, word: 'alphabet', pos: 'noun', cefr: 'A2', arabic: 'أَبْجَدِيَّة', example: 'Children learn the alphabet in primary school.', ipa: '/ˈæl.fə.bet/' },
  { id: 218, word: 'amount', pos: 'noun', cefr: 'A2', arabic: 'كَمِّيَّة', example: 'A large amount of work was completed today.', ipa: '/əˈmaʊnt/' },
  { id: 219, word: 'ancient', pos: 'adjective', cefr: 'A2', arabic: 'قَديم جِدًّا', example: 'They explored ancient pyramids in Egypt.', ipa: '/ˈeɪn.ʃənt/' },
  { id: 220, word: 'annoy', pos: 'verb', cefr: 'A2', arabic: 'يُزْعِج', example: 'Loud background noise really annoys me.', ipa: '/əˈnɔɪ/' },
  { id: 221, word: 'anxious', pos: 'adjective', cefr: 'A2', arabic: 'قَلِق', example: 'She felt anxious right before her oral examination.', ipa: '/ˈæŋk.ʃəs/' },
  { id: 222, word: 'apologize', pos: 'verb', cefr: 'A2', arabic: 'يَعْتَذِر', example: 'He apologized sincerely for breaking the vase.', ipa: '/əˈpɒl.ə.dʒaɪz/' },
  { id: 223, word: 'appearance', pos: 'noun', cefr: 'A2', arabic: 'مَظْهَر', example: 'Clean professional appearance makes a great impression.', ipa: '/əˈpɪə.rəns/' },
  { id: 224, word: 'apply', pos: 'verb', cefr: 'A2', arabic: 'يَتَقَدَّم بِطَلَب', example: 'She decided to apply for a research grant.', ipa: '/əˈplaɪ/' },
  { id: 225, word: 'appointment', pos: 'noun', cefr: 'A2', arabic: 'مَوْعِد', example: 'I scheduled a doctor appointment for Monday.', ipa: '/ˈæp.pɔɪnt.mənt/' },
  { id: 226, word: 'appreciate', pos: 'verb', cefr: 'A2', arabic: 'يُقَدِّر', example: 'I truly appreciate your assistance during the project.', ipa: '/əˈpriː.ʃi.eɪt/' },
  { id: 227, word: 'approach', pos: 'verb', cefr: 'A2', arabic: 'يَقْتَرِب', example: 'Winter is fast approaching, so dress warmly.', ipa: '/əˈprəʊtʃ/' },
  { id: 228, word: 'approve', pos: 'verb', cefr: 'A2', arabic: 'يُوافِق', example: 'The manager approved our budget request.', ipa: '/əˈpruːv/' },
  { id: 229, word: 'architect', pos: 'noun', cefr: 'A2', arabic: 'مُهَنْدِس مِعْماري', example: 'An architect designed this modern building.', ipa: '/ˈɑː.kɪ.tekt/' },
  { id: 230, word: 'arrange', pos: 'verb', cefr: 'A2', arabic: 'يُرَتِّب', example: 'Please arrange the chairs in a semi-circle.', ipa: '/əˈreɪndʒ/' },
  { id: 231, word: 'assistant', pos: 'noun', cefr: 'A2', arabic: 'مُساعِد', example: 'The store assistant guided us to the right aisle.', ipa: '/əˈsɪs.tənt/' },
  { id: 232, word: 'athlete', pos: 'noun', cefr: 'A2', arabic: 'رِيَاضِي', example: 'The professional athlete trains six hours daily.', ipa: '/ˈæθ.liːt/' },
  { id: 233, word: 'attach', pos: 'verb', cefr: 'A2', arabic: 'يُرْفِق', example: 'Remember to attach your resume to the email.', ipa: '/əˈtætʃ/' },
  { id: 234, word: 'attend', pos: 'verb', cefr: 'A2', arabic: 'يَحْضُر', example: 'Over a hundred delegates attended the conference.', ipa: '/əˈtend/' },
  { id: 235, word: 'attitude', pos: 'noun', cefr: 'A2', arabic: 'مَوْقِف / اتِّجاه', example: 'A positive attitude makes learning easier.', ipa: '/ˈæt.ɪ.tʃuːd/' },
  { id: 236, word: 'attract', pos: 'verb', cefr: 'A2', arabic: 'يَجْذِب', example: 'Bright flowers attract bees and butterflies.', ipa: '/əˈtrækt/' },
  { id: 237, word: 'audience', pos: 'noun', cefr: 'A2', arabic: 'جُمْهور', example: 'The audience clapped enthusiastically after the show.', ipa: '/ˈɔː.di.əns/' },
  { id: 238, word: 'author', pos: 'noun', cefr: 'A2', arabic: 'مُؤَلِّف', example: 'She is the author of several novel series.', ipa: '/ˈɔː.θər/' },
  { id: 239, word: 'automatic', pos: 'adjective', cefr: 'A2', arabic: 'تِلْقائِي', example: 'The garage has automatic sliding doors.', ipa: '/ˌɔː.təˈmæt.ɪk/' },
  { id: 240, word: 'available', pos: 'adjective', cefr: 'A2', arabic: 'مُتاح', example: 'Fresh fruits are available at the local market.', ipa: '/əˈveɪ.lə.bəl/' },
  { id: 241, word: 'average', pos: 'adjective', cefr: 'A2', arabic: 'مُتَوَسِّط', example: 'The average height of adults varies worldwide.', ipa: '/ˈæv.ər.ɪdʒ/' },
  { id: 242, word: 'avoid', pos: 'verb', cefr: 'A2', arabic: 'يَتَجَنَّب', example: 'Drivers should avoid high-speed traffic zones.', ipa: '/əˈvɔɪd/' },
  { id: 243, word: 'award', pos: 'noun', cefr: 'A2', arabic: 'جائِزَة', example: 'She won an award for academic excellence.', ipa: '/əˈwɔːd/' },
  { id: 244, word: 'awful', pos: 'adjective', cefr: 'A2', arabic: 'مُرِيع / سَيِّئ', example: 'The weather was awful with rain and hail.', ipa: '/ˈɔː.fəl/' },
  { id: 245, word: 'background', pos: 'noun', cefr: 'A2', arabic: 'خَلْفِيَّة', example: 'He comes from an engineering background.', ipa: '/ˈbæk.ɡraʊnd/' },
  { id: 246, word: 'baggage', pos: 'noun', cefr: 'A2', arabic: 'أَمْتِعَة', example: 'Please claim your baggage at belt number four.', ipa: '/ˈbæɡ.ɪdʒ/' },
  { id: 247, word: 'balance', pos: 'noun', cefr: 'A2', arabic: 'تَوازُن', example: 'Work-life balance is essential for well-being.', ipa: '/ˈbæl.əns/' },
  { id: 248, word: 'bargain', pos: 'noun', cefr: 'A2', arabic: 'صَفْقَة رابِحَة', example: 'Buying this coat on sale was a great bargain.', ipa: '/ˈbɑː.ɡɪn/' },
  { id: 249, word: 'basic', pos: 'adjective', cefr: 'A2', arabic: 'أَساسِي', example: 'Clean water is a basic human right.', ipa: '/ˈbeɪ.sɪk/' },
  { id: 250, word: 'battery', pos: 'noun', cefr: 'A2', arabic: 'بَطَّارِيَّة', example: 'My phone battery is running low.', ipa: '/ˈbæt.ər.i/' },

  // ==========================================
  // LEVEL B1 (Intermediate)
  // ==========================================
  { id: 301, word: 'absolute', pos: 'adjective', cefr: 'B1', arabic: 'مُطْلَق', example: 'I have absolute confidence in our team.', ipa: '/ˈæb.sə.luːt/' },
  { id: 302, word: 'absorb', pos: 'verb', cefr: 'B1', arabic: 'يَمْتَصّ', example: 'Sponges absorb water very quickly.', ipa: '/əbˈzɔːb/' },
  { id: 303, word: 'abstract', pos: 'adjective', cefr: 'B1', arabic: 'مُجَرَّد', example: 'Abstract concepts can be difficult to define.', ipa: '/ˈæb.strækt/' },
  { id: 304, word: 'accent', pos: 'noun', cefr: 'B1', arabic: 'لَهْجَة', example: 'He speaks fluent English with a mild French accent.', ipa: '/ˈæk.sənt/' },
  { id: 305, word: 'acceptable', pos: 'adjective', cefr: 'B1', arabic: 'مَقْبول', example: 'The candidate gave an acceptable explanation.', ipa: '/əkˈsep.tə.bəl/' },
  { id: 306, word: 'access', pos: 'noun', cefr: 'B1', arabic: 'وُصول / مَدْخَل', example: 'Students have free access to digital journals.', ipa: '/ˈæk.ses/' },
  { id: 307, word: 'accidentally', pos: 'adverb', cefr: 'B1', arabic: 'بِالخَطَأ', example: 'She accidentally dropped her keys into the bag.', ipa: '/ˌæk.sɪˈden.təl.i/' },
  { id: 308, word: 'accommodate', pos: 'verb', cefr: 'B1', arabic: 'يَسْتَوْعِب', example: 'The new auditorium can accommodate 500 guests.', ipa: '/əˈkɒm.ə.deɪt/' },
  { id: 309, word: 'accompany', pos: 'verb', cefr: 'B1', arabic: 'يُرافِق', example: 'Soft piano music accompanied the vocal performance.', ipa: '/əˈkʌm.pə.ni/' },
  { id: 310, word: 'accomplish', pos: 'verb', cefr: 'B1', arabic: 'يُنْجِز', example: 'With teamwork we can accomplish great milestones.', ipa: '/əˈkʌm.plɪʃ/' },
  { id: 311, word: 'accountant', pos: 'noun', cefr: 'B1', arabic: 'مُحاسِب', example: 'The accountant verified all annual expenditures.', ipa: '/əˈkaʊn.tənt/' },
  { id: 312, word: 'accurate', pos: 'adjective', cefr: 'B1', arabic: 'دَقيق', example: 'Scientists need accurate measurements for experiments.', ipa: '/ˈæk.jə.rət/' },
  { id: 313, word: 'accuse', pos: 'verb', cefr: 'B1', arabic: 'يَتَّهِم', example: 'Never accuse anyone without verifying facts first.', ipa: '/əˈkjuːz/' },
  { id: 314, word: 'accustomed', pos: 'adjective', cefr: 'B1', arabic: 'مُعْتاد', example: 'She is accustomed to working under pressure.', ipa: '/əˈkʌs.təmd/' },
  { id: 315, word: 'achievement', pos: 'noun', cefr: 'B1', arabic: 'إِنْجاز', example: 'Earning a degree is a major personal achievement.', ipa: '/əˈtʃiːv.mənt/' },
  { id: 316, word: 'achieve', pos: 'verb', cefr: 'B1', arabic: 'يُحَقِّق', example: 'Focus and perseverance help achieve success.', ipa: '/əˈtʃiːv/' },
  { id: 317, word: 'adapt', pos: 'verb', cefr: 'B1', arabic: 'يَتَكَيَّف', example: 'Living in another country requires you to adapt.', ipa: '/əˈdæpt/' },
  { id: 318, word: 'adequate', pos: 'adjective', cefr: 'B1', arabic: 'كافٍ / مُناسِب', example: 'Ensure there is adequate light for reading.', ipa: '/ˈæd.ə.kwət/' },
  { id: 319, word: 'adjust', pos: 'verb', cefr: 'B1', arabic: 'يَضْبِط / يُعَدِّل', example: 'Adjust the screen brightness to protect your eyes.', ipa: '/əˈdʒʌst/' },
  { id: 320, word: 'administration', pos: 'noun', cefr: 'B1', arabic: 'إِدارَة', example: 'Hospital administration improved patient services.', ipa: '/ədˌmɪn.ɪˈstreɪ.ʃən/' },
  { id: 321, word: 'adopt', pos: 'verb', cefr: 'B1', arabic: 'يَتَبَنَّى', example: 'The company decided to adopt new eco-friendly rules.', ipa: '/əˈdɒpt/' },
  { id: 322, word: 'advance', pos: 'noun', cefr: 'B1', arabic: 'تَقَدُّم', example: 'Medical advances have extended life expectancy.', ipa: '/ədˈvɑːns/' },
  { id: 323, word: 'adverse', pos: 'adjective', cefr: 'B1', arabic: 'سَلْبِي / عَكْسِي', example: 'Severe storms had adverse effects on crop yields.', ipa: '/ˈæd.vɜːs/' },
  { id: 324, word: 'advertise', pos: 'verb', cefr: 'B1', arabic: 'يُعْلِن', example: 'Businesses advertise online to reach customers.', ipa: '/ˈæd.və.taɪz/' },
  { id: 325, word: 'affect', pos: 'verb', cefr: 'B1', arabic: 'يُؤَثِّر عَلى', example: 'Sleep deprivation affects cognitive performance.', ipa: '/əˈfekt/' },
  { id: 326, word: 'affection', pos: 'noun', cefr: 'B1', arabic: 'مَوَدَّة', example: 'Grandparents show deep affection for grandchildren.', ipa: '/əˈfek.ʃən/' },
  { id: 327, word: 'aggressive', pos: 'adjective', cefr: 'B1', arabic: 'عُدْوانِي', example: 'The wild animal showed aggressive behavior.', ipa: '/əˈɡres.ɪv/' },
  { id: 328, word: 'agriculture', pos: 'noun', cefr: 'B1', arabic: 'زِراعَة', example: 'Modern agriculture uses automated machinery.', ipa: '/ˈæɡ.rɪ.kʌl.tʃər/' },
  { id: 329, word: 'ahead', pos: 'adverb', cefr: 'B1', arabic: 'في الأَما م', example: 'Look ahead and plan your future carefully.', ipa: '/əˈhed/' },
  { id: 330, word: 'aim', pos: 'noun', cefr: 'B1', arabic: 'هَدَف', example: 'Our primary aim is to deliver high quality.', ipa: '/eɪm/' },
  { id: 331, word: 'alarm', pos: 'noun', cefr: 'B1', arabic: 'إِنْذار', example: 'The security alarm rang when the door opened.', ipa: '/əˈlɑːm/' },
  { id: 332, word: 'alert', pos: 'adjective', cefr: 'B1', arabic: 'مُنَتَبِه', example: 'Stay alert while driving through heavy traffic.', ipa: '/əˈlɜːt/' },
  { id: 333, word: 'alien', pos: 'noun', cefr: 'B1', arabic: 'كائِن غَريب', example: 'Sci-fi movies depict encounters with alien life.', ipa: '/ˈeɪ.li.ən/' },
  { id: 334, word: 'align', pos: 'verb', cefr: 'B1', arabic: 'يُحاذي / يَتَماشى', example: 'Please align the text boxes evenly on the slide.', ipa: '/əˈlaɪn/' },
  { id: 335, word: 'allergic', pos: 'adjective', cefr: 'B1', arabic: 'مُصاب بِحَسَّاسِيَّة', example: 'He is allergic to cat dander.', ipa: '/əˈlɜː.dʒɪk/' },
  { id: 336, word: 'allocate', pos: 'verb', cefr: 'B1', arabic: 'يُخَصِّص', example: 'Managers allocate tasks according to team skills.', ipa: '/ˈæl.ə.keɪt/' },
  { id: 337, word: 'allowance', pos: 'noun', cefr: 'B1', arabic: 'مَصْروف / مَبْلَغ', example: 'Passengers have a baggage allowance of 20kg.', ipa: '/əˈlaʊ.əns/' },
  { id: 338, word: 'ally', pos: 'noun', cefr: 'B1', arabic: 'حَليف', example: 'They remained strong allies in international trade.', ipa: '/ˈæl.aɪ/' },
  { id: 339, word: 'alter', pos: 'verb', cefr: 'B1', arabic: 'يُغَيِّر', example: 'You may need to alter your schedule slightly.', ipa: '/ˈɔːl.tər/' },
  { id: 340, word: 'alternative', pos: 'noun', cefr: 'B1', arabic: 'بَديل', example: 'Wind power is a clean energy alternative.', ipa: '/ɒlˈtɜː.nə.tɪv/' },
  { id: 341, word: 'altitude', pos: 'noun', cefr: 'B1', arabic: 'ارْتِفاع', example: 'The mountain peak reaches a high altitude.', ipa: '/ˈæl.tɪ.tʃuːd/' },
  { id: 342, word: 'ambition', pos: 'noun', cefr: 'B1', arabic: 'طُموح', example: 'Her chief ambition is to launch her own business.', ipa: '/æmˈbɪʃ.ən/' },
  { id: 343, word: 'ambitious', pos: 'adjective', cefr: 'B1', arabic: 'طَمُوح', example: 'The city announced an ambitious transit project.', ipa: '/æmˈbɪʃ.əs/' },
  { id: 344, word: 'analyse', pos: 'verb', cefr: 'B1', arabic: 'يُحَلِّل', example: 'Researchers analyse data to discover trends.', ipa: '/ˈæn.əl.aɪz/' },
  { id: 345, word: 'analysis', pos: 'noun', cefr: 'B1', arabic: 'تَحْليل', example: 'Detailed statistical analysis confirmed the hypothesis.', ipa: '/əˈnæl.ə.sɪs/' },
  { id: 346, word: 'ancestor', pos: 'noun', cefr: 'B1', arabic: 'سَلَف', example: 'His ancestors migrated here over a century ago.', ipa: '/ˈæn.ses.tər/' },
  { id: 347, word: 'anger', pos: 'noun', cefr: 'B1', arabic: 'غَضَب', example: 'He managed his anger with calm breathing exercises.', ipa: '/ˈæŋ.ɡər/' },
  { id: 348, word: 'anniversary', pos: 'noun', cefr: 'B1', arabic: 'ذِكْرى سَنَوِيَّة', example: 'They celebrated their silver wedding anniversary.', ipa: '/ˌæn.ɪˈvɜː.sər.i/' },
  { id: 349, word: 'announce', pos: 'verb', cefr: 'B1', arabic: 'يُعْلِن', example: 'The speaker announced the winner of the competition.', ipa: '/əˈnaʊns/' },
  { id: 350, word: 'annual', pos: 'adjective', cefr: 'B1', arabic: 'سَنَوِي', example: 'The company holds its annual meeting in May.', ipa: '/ˈæn.ju.əl/' },

  // ==========================================
  // LEVEL B2 (Upper-Intermediate)
  // ==========================================
  { id: 401, word: 'abandon', pos: 'verb', cefr: 'B2', arabic: 'يَتَخَلَّى عَنْ', example: 'They had to abandon the ship due to severe damage.', ipa: '/əˈbændən/' },
  { id: 402, word: 'academic', pos: 'adjective', cefr: 'B2', arabic: 'أَكاديمي', example: 'He was praised for his outstanding academic work.', ipa: '/ˌæk.əˈdem.ɪk/' },
  { id: 403, word: 'accelerate', pos: 'verb', cefr: 'B2', arabic: 'يُسَرِّع', example: 'Digital adoption accelerates commercial productivity.', ipa: '/əkˈsel.ə.reɪt/' },
  { id: 404, word: 'accessible', pos: 'adjective', cefr: 'B2', arabic: 'مُتاح / سَهْل الوُصول', example: 'Public buildings must be accessible to all individuals.', ipa: '/əkˈses.ə.bəl/' },
  { id: 405, word: 'accomplishment', pos: 'noun', cefr: 'B2', arabic: 'إِنْجاز كَبير', example: 'Completing the marathon was an astounding accomplishment.', ipa: '/əˈkʌm.plɪʃ.mənt/' },
  { id: 406, word: 'accountable', pos: 'adjective', cefr: 'B2', arabic: 'مَسْؤول', example: 'Leaders are accountable for their team decisions.', ipa: '/əˈkaʊn.tə.bəl/' },
  { id: 407, word: 'accumulate', pos: 'verb', cefr: 'B2', arabic: 'يَتَراكَم', example: 'Wealth and knowledge accumulate gradually over time.', ipa: '/əˈkjuː.mjə.leɪt/' },
  { id: 408, word: 'accusation', pos: 'noun', cefr: 'B2', arabic: 'اتِّهام', example: 'The attorney refuted the false accusation in court.', ipa: '/ˌæk.juˈzeɪ.ʃən/' },
  { id: 409, word: 'acknowledge', pos: 'verb', cefr: 'B2', arabic: 'يُقِرّ / يَعْتَرِف', example: 'She acknowledged receiving the official memo.', ipa: '/əkˈnɒl.ɪdʒ/' },
  { id: 410, word: 'acquire', pos: 'verb', cefr: 'B2', arabic: 'يَكْتَسِب', example: 'Students acquire fluency through immersive practice.', ipa: '/əˈkwaɪər/' },
  { id: 411, word: 'acquisition', pos: 'noun', cefr: 'B2', arabic: 'اسْتِحْواذ / اكْتِساب', example: 'Language acquisition is faster in young children.', ipa: '/ˌæk.wɪˈzɪʃ.ən/' },
  { id: 412, word: 'activate', pos: 'verb', cefr: 'B2', arabic: 'يُنَشِّط / يُفَعِّل', example: 'Click the link to activate your online account.', ipa: '/ˈæk.tɪ.veɪt/' },
  { id: 413, word: 'acute', pos: 'adjective', cefr: 'B2', arabic: 'حادّ / شَديد', example: 'The region suffers from an acute water shortage.', ipa: '/əˈkjuːt/' },
  { id: 414, word: 'adaptability', pos: 'noun', cefr: 'B2', arabic: 'قابِلِيَّة التَّكَيُّف', example: 'Career success requires high adaptability to change.', ipa: '/əˌdæp.təˈbɪl.ə.ti/' },
  { id: 415, word: 'adjacent', pos: 'adjective', cefr: 'B2', arabic: 'مُجاوِر', example: 'The office building is adjacent to the metro station.', ipa: '/əˈdʒeɪ.sənt/' },
  { id: 416, word: 'administrative', pos: 'adjective', cefr: 'B2', arabic: 'إِدارِي', example: 'She oversees all administrative operations.', ipa: '/ədˈmɪn.ɪ.strə.tɪv/' },
  { id: 417, word: 'advocate', pos: 'verb', cefr: 'B2', arabic: 'يُدافِع / يُؤَيِّد', example: 'He advocates for renewable energy transition.', ipa: '/ˈæd.və.keɪt/' },
  { id: 418, word: 'aesthetic', pos: 'adjective', cefr: 'B2', arabic: 'جَمالِي', example: 'The structure blends functionality with aesthetic charm.', ipa: '/esˈθet.ɪk/' },
  { id: 419, word: 'affiliation', pos: 'noun', cefr: 'B2', arabic: 'انْتِماء', example: 'Scholars declare their institutional affiliations.', ipa: '/əˌfɪl.iˈeɪ.ʃən/' },
  { id: 420, word: 'affirm', pos: 'verb', cefr: 'B2', arabic: 'يُؤَكِّد', example: 'The spokesperson affirmed the company commitment.', ipa: '/əˈfɜːm/' },
  { id: 421, word: 'affluent', pos: 'adjective', cefr: 'B2', arabic: 'ثَري / غَني', example: 'They built homes in an affluent coastal suburb.', ipa: '/ˈæf.lu.ənt/' },
  { id: 422, word: 'agenda', pos: 'noun', cefr: 'B2', arabic: 'جَدْوَل أَعْمال', example: 'The chairman reviewed the annual meeting agenda.', ipa: '/əˈdʒen.də/' },
  { id: 423, word: 'allocation', pos: 'noun', cefr: 'B2', arabic: 'تَخْصيص', example: 'Resource allocation was optimized across departments.', ipa: '/ˌæl.əˈkeɪ.ʃən/' },
  { id: 424, word: 'alteration', pos: 'noun', cefr: 'B2', arabic: 'تَعْديل', example: 'Architects made minor alterations to the floor plan.', ipa: '/ˌɔːl.təˈreɪ.ʃən/' },
  { id: 425, word: 'ambiguity', pos: 'noun', cefr: 'B2', arabic: 'غُموض', example: 'Clear legal drafting eliminates ambiguity.', ipa: '/ˌæm.bɪˈɡjuː.ə.ti/' },
  { id: 426, word: 'amend', pos: 'verb', cefr: 'B2', arabic: 'يُعَدِّل', example: 'Lawmakers voted to amend the traffic safety law.', ipa: '/əˈmend/' },
  { id: 427, word: 'amendment', pos: 'noun', cefr: 'B2', arabic: 'تَعْديل دُسْتورِي', example: 'The constitutional amendment passed unanimously.', ipa: '/əˈmend.mənt/' },
  { id: 428, word: 'analogy', pos: 'noun', cefr: 'B2', arabic: 'تَشْبيه', example: 'He used a clear analogy to explain neural networks.', ipa: '/əˈnæl.ə.dʒi/' },
  { id: 429, word: 'analytical', pos: 'adjective', cefr: 'B2', arabic: 'تَحْليلِي', example: 'Engineers need strong analytical problem-solving skills.', ipa: '/ˌæn.əlˈɪt.ɪ.kəl/' },
  { id: 430, word: 'anecdote', pos: 'noun', cefr: 'B2', arabic: 'قِصَّة قَصيرة', example: 'The speaker shared a witty anecdote during his lecture.', ipa: '/ˈæn.ɪk.dəʊt/' },
  { id: 431, word: 'anticipate', pos: 'verb', cefr: 'B2', arabic: 'يَتَوَقَّع', example: 'Analysts anticipate positive market growth next quarter.', ipa: '/ænˈtɪs.ɪ.peɪt/' },
  { id: 432, word: 'apparatus', pos: 'noun', cefr: 'B2', arabic: 'جَهاز / مَعِدَّات', example: 'Laboratory apparatus must be calibrated regularly.', ipa: '/ˌæp.əˈreɪ.təs/' },
  { id: 433, word: 'apparent', pos: 'adjective', cefr: 'B2', arabic: 'ظاهِر / واضِح', example: 'The apparent cause of the error was quickly fixed.', ipa: '/əˈpær.ənt/' },
  { id: 434, word: 'apprehension', pos: 'noun', cefr: 'B2', arabic: 'خَوْف / قَلَق', example: 'She felt a wave of apprehension before her public speech.', ipa: '/ˌæp.rɪˈhen.ʃən/' },
  { id: 435, word: 'arbitrary', pos: 'adjective', cefr: 'B2', arabic: 'عَشْوائِي', example: 'Selections were made systematically, not by arbitrary choice.', ipa: '/ˈɑː.bɪ.trər.i/' },
  { id: 436, word: 'articulate', pos: 'adjective', cefr: 'B2', arabic: 'فَصيح', example: 'She is an articulate advocate for social change.', ipa: '/ɑːˈtɪk.jə.lət/' },
  { id: 437, word: 'assert', pos: 'verb', cefr: 'B2', arabic: 'يُؤَكِّد / يَجْزِم', example: 'The report asserts that early intervention works best.', ipa: '/əˈsɜːt/' },
  { id: 438, word: 'assertion', pos: 'noun', cefr: 'B2', arabic: 'تَأْكيد', example: 'Her assertion was backed by thorough research.', ipa: '/əˈsɜː.ʃən/' },
  { id: 439, word: 'assessment', pos: 'noun', cefr: 'B2', arabic: 'تَقْييم', example: 'Comprehensive risk assessment is mandatory for safety.', ipa: '/əˈses.mənt/' },
  { id: 440, word: 'asset', pos: 'noun', cefr: 'B2', arabic: 'أَصْل / ميزَة', example: 'Critical thinking is a valuable asset in leadership.', ipa: '/ˈæs.et/' },
  { id: 441, word: 'assimilate', pos: 'verb', cefr: 'B2', arabic: 'يَسْتَوْعِب', example: 'Students assimilate complex information step by step.', ipa: '/əˈsɪm.ɪ.leɪt/' },
  { id: 442, word: 'assumption', pos: 'noun', cefr: 'B2', arabic: 'افْتِراض', example: 'Challenging old assumptions leads to fresh insights.', ipa: '/əˈsʌmp.ʃən/' },
  { id: 443, word: 'assurance', pos: 'noun', cefr: 'B2', arabic: 'تَأْكيد / ضَمان', example: 'Quality assurance processes guarantee excellence.', ipa: '/əˈʃɔː.rəns/' },
  { id: 444, word: 'attribute', pos: 'verb', cefr: 'B2', arabic: 'يَعْزو إِلَى', example: 'Scientists attribute global warming to greenhouse gases.', ipa: '/əˈtrɪb.juːt/' },
  { id: 445, word: 'authentic', pos: 'adjective', cefr: 'B2', arabic: 'أَصيل / حَقيقِي', example: 'The museum displays authentic historic artifacts.', ipa: '/ɔːˈθen.tɪk/' },
  { id: 446, word: 'authorize', pos: 'verb', cefr: 'B2', arabic: 'يُخَوِّل / يُصَرِّح', example: 'Only supervisors can authorize high-value refunds.', ipa: '/ˈɔː.θər.aɪz/' },
  { id: 447, word: 'autonomous', pos: 'adjective', cefr: 'B2', arabic: 'مُسْتَقِلّ / ذاتِيّ', example: 'Autonomous drones navigate complex environments.', ipa: '/ɔːˈtɒn.ə.məs/' },
  { id: 448, word: 'barrier', pos: 'noun', cefr: 'B2', arabic: 'حاجِز', example: 'Language skills help eliminate communication barriers.', ipa: '/ˈbær.i.ər/' },
  { id: 449, word: 'benchmark', pos: 'noun', cefr: 'B2', arabic: 'مِعْيار / مَرْجِع', example: 'This framework sets the benchmark for quality.', ipa: '/ˈbentʃ.mɑːk/' },
  { id: 450, word: 'bias', pos: 'noun', cefr: 'B2', arabic: 'تَحَيُّز', example: 'Researchers work to minimize cognitive bias in surveys.', ipa: '/ˈbaɪ.əs/' },
  { id: 451, word: 'boundary', pos: 'noun', cefr: 'B2', arabic: 'حَدّ / حُدود', example: 'Respecting professional boundaries ensures harmony.', ipa: '/ˈbaʊn.dər.i/' },
  { id: 452, word: 'breakthrough', pos: 'noun', cefr: 'B2', arabic: 'إِنْجاز مُهِمّ', example: 'The medical discovery represented a major breakthrough.', ipa: '/ˈbreɪk.θruː/' },
  { id: 453, word: 'candidate', pos: 'noun', cefr: 'B2', arabic: 'مُرَشَّح', example: 'She is a top candidate for the executive position.', ipa: '/ˈkæn.dɪ.dət/' },
  { id: 454, word: 'capacity', pos: 'noun', cefr: 'B2', arabic: 'سَعَة / قُدْرَة', example: 'The conference hall has a seating capacity of 800.', ipa: '/kəˈpæs.ə.ti/' },
  { id: 455, word: 'category', pos: 'noun', cefr: 'B2', arabic: 'فِئَة', example: 'Lexicon items are organized into CEFR categories.', ipa: '/ˈkæt.ə.ɡri/' },
  { id: 456, word: 'collaborate', pos: 'verb', cefr: 'B2', arabic: 'يَتَعاوَن', example: 'International teams collaborate on global research.', ipa: '/kəˈlæb.ə.reɪt/' },
  { id: 457, word: 'collaboration', pos: 'noun', cefr: 'B2', arabic: 'تَعاوُن', example: 'Effective collaboration accelerates project success.', ipa: '/kəˌlæb.əˈreɪ.ʃən/' },
  { id: 458, word: 'commitment', pos: 'noun', cefr: 'B2', arabic: 'الْتِزام', example: 'Her commitment to quality earned high recognition.', ipa: '/kəˈmɪt.mənt/' },
  { id: 459, word: 'comprehensive', pos: 'adjective', cefr: 'B2', arabic: 'شامِل', example: 'The user manual provides comprehensive setup steps.', ipa: '/ˌkɒm.prɪˈhen.sɪv/' },
  { id: 460, word: 'crucial', pos: 'adjective', cefr: 'B2', arabic: 'حاسِم / حَيَوِي', example: 'Timely communication is crucial during emergency response.', ipa: '/ˈkruː.ʃəl/' }
];

// ==========================================
// HELPER UTILITY FUNCTIONS
// ==========================================

/**
 * Filter the lexicon dataset by CEFR level, starting letter, part of speech, and text search query.
 *
 * @param {Array} [dataset=oxford3000Data] - Array of lexicon objects.
 * @param {Object} [options={}] - Filter options.
 * @param {string} [options.cefr='ALL'] - CEFR level ('ALL', 'A1', 'A2', 'B1', 'B2').
 * @param {string} [options.letter='ALL'] - Starting letter ('ALL', 'A'-'Z').
 * @param {string} [options.pos='ALL'] - Part of speech ('ALL', 'noun', 'verb', etc.).
 * @param {string} [options.searchQuery=''] - Free text search query matching word, translation, or example.
 * @returns {Array} Filtered array of lexicon objects.
 */
export const filterLexicon = (dataset = oxford3000Data, options = {}) => {
  let list = dataset;
  let opts = options;

  // Handle single argument call filterLexicon({ cefr: 'A1' })
  if (!Array.isArray(dataset) && typeof dataset === 'object' && dataset !== null) {
    opts = dataset;
    list = oxford3000Data;
  } else if (!Array.isArray(list)) {
    list = oxford3000Data;
  }

  const { cefr = 'ALL', letter = 'ALL', pos = 'ALL', searchQuery = '' } = opts;

  const query = (searchQuery || '').trim().toLowerCase();
  const targetLetter = (letter || 'ALL').toUpperCase();
  const targetCefr = (cefr || 'ALL').toUpperCase();
  const targetPos = (pos || 'ALL').toUpperCase();

  return list.filter((item) => {
    if (!item) return false;

    // CEFR filter
    if (targetCefr !== 'ALL' && item.cefr?.toUpperCase() !== targetCefr) {
      return false;
    }

    // Letter filter (starting letter of word)
    if (targetLetter !== 'ALL') {
      const firstChar = (item.word || '').trim().charAt(0).toUpperCase();
      if (firstChar !== targetLetter) {
        return false;
      }
    }

    // Part of speech filter
    if (targetPos !== 'ALL' && item.pos?.toUpperCase() !== targetPos) {
      return false;
    }

    // Search query filter (matches word, arabic translation, pos, example, or ipa)
    if (query) {
      const wordMatch = item.word?.toLowerCase().includes(query);
      const arabicMatch = item.arabic?.toLowerCase().includes(query);
      const posMatch = item.pos?.toLowerCase().includes(query);
      const exampleMatch = item.example?.toLowerCase().includes(query);
      const ipaMatch = item.ipa?.toLowerCase().includes(query);

      if (!wordMatch && !arabicMatch && !posMatch && !exampleMatch && !ipaMatch) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Quick search matching word, arabic, pos, example, or ipa.
 * Supports: searchLexicon('query') OR searchLexicon(customDataset, 'query')
 *
 * @param {Array|string} datasetOrQuery - Dataset array or string query.
 * @param {string} [query=''] - Text query if dataset passed first.
 * @returns {Array} Matching items.
 */
export const searchLexicon = (datasetOrQuery = oxford3000Data, query = '') => {
  let list = oxford3000Data;
  let q = query;

  if (typeof datasetOrQuery === 'string') {
    q = datasetOrQuery;
  } else if (Array.isArray(datasetOrQuery)) {
    list = datasetOrQuery;
  }

  return filterLexicon(list, { searchQuery: q });
};

/**
 * Filter words strictly by CEFR level.
 * Supports: getWordsByCefr('A1') OR getWordsByCefr(customDataset, 'A1')
 *
 * @param {Array|string} datasetOrLevel - Dataset array or CEFR level string.
 * @param {string} [cefrLevel='A1'] - Level string ('A1', 'A2', 'B1', 'B2').
 * @returns {Array} Filtered list.
 */
export const getWordsByCefr = (datasetOrLevel = oxford3000Data, cefrLevel = 'A1') => {
  let list = oxford3000Data;
  let level = cefrLevel;

  if (typeof datasetOrLevel === 'string') {
    level = datasetOrLevel;
  } else if (Array.isArray(datasetOrLevel)) {
    list = datasetOrLevel;
  }

  return filterLexicon(list, { cefr: level });
};

/**
 * Retrieve a single word item by ID.
 * Supports: getWordById(101) OR getWordById(customDataset, 101)
 *
 * @param {Array|number|string} datasetOrId - Dataset array or item ID.
 * @param {number|string} [id] - Item ID if dataset passed first.
 * @returns {Object|null} Matching lexicon object or null.
 */
export const getWordById = (datasetOrId = oxford3000Data, id) => {
  let list = oxford3000Data;
  let targetId = id;

  if (typeof datasetOrId === 'number' || (typeof datasetOrId === 'string' && !Array.isArray(datasetOrId))) {
    targetId = datasetOrId;
  } else if (Array.isArray(datasetOrId)) {
    list = datasetOrId;
  }

  if (!Array.isArray(list) || targetId === undefined || targetId === null) return null;
  return list.find((item) => String(item.id) === String(targetId)) || null;
};

/**
 * Retrieve a single word item by term (case-insensitive).
 * Supports: getWordByTerm('abandon') OR getWordByTerm(customDataset, 'abandon')
 *
 * @param {Array|string} datasetOrTerm - Dataset array or word token string.
 * @param {string} [wordTerm] - Word token if dataset passed first.
 * @returns {Object|null} Matching lexicon object or null.
 */
export const getWordByTerm = (datasetOrTerm = oxford3000Data, wordTerm) => {
  let list = oxford3000Data;
  let term = wordTerm;

  if (typeof datasetOrTerm === 'string' && wordTerm === undefined) {
    term = datasetOrTerm;
  } else if (Array.isArray(datasetOrTerm)) {
    list = datasetOrTerm;
  }

  if (!Array.isArray(list) || !term) return null;
  const cleanTerm = String(term).trim().toLowerCase();
  return list.find((item) => item.word?.toLowerCase() === cleanTerm) || null;
};

/**
 * Compute statistics and totals across CEFR levels and Parts of Speech.
 *
 * @param {Array} [dataset=oxford3000Data] - Lexicon dataset array.
 * @returns {Object} Stats object: { total, cefr: { A1, A2, B1, B2 }, pos: { ... } }
 */
export const getLexiconStats = (dataset = oxford3000Data) => {
  const list = Array.isArray(dataset) ? dataset : oxford3000Data;

  const stats = {
    total: list.length,
    cefr: {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0
    },
    pos: {}
  };

  list.forEach((item) => {
    if (!item) return;

    // CEFR tally
    const level = (item.cefr || '').toUpperCase();
    if (Object.prototype.hasOwnProperty.call(stats.cefr, level)) {
      stats.cefr[level] += 1;
    }

    // POS tally
    const pos = (item.pos || 'other').toLowerCase();
    stats.pos[pos] = (stats.pos[pos] || 0) + 1;
  });

  return stats;
};

/**
 * Returns the list of alphabet filter options.
 * @returns {string[]} Alphabet list starting with 'ALL'.
 */
export const getAlphabetList = () => [
  'ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

/**
 * Returns the list of available CEFR levels.
 * @returns {string[]} CEFR level array starting with 'ALL'.
 */
export const getCefrLevels = () => ['ALL', 'A1', 'A2', 'B1', 'B2'];

/**
 * Returns unique array of Parts of Speech present in dataset.
 *
 * @param {Array} [dataset=oxford3000Data] - Lexicon dataset array.
 * @returns {string[]} Array of unique parts of speech starting with 'ALL'.
 */
export const getPosOptions = (dataset = oxford3000Data) => {
  const list = Array.isArray(dataset) ? dataset : oxford3000Data;
  const posSet = new Set(list.map((item) => item?.pos?.toLowerCase()).filter(Boolean));
  return ['ALL', ...Array.from(posSet).sort()];
};

// Default Export
export default oxford3000Data;
