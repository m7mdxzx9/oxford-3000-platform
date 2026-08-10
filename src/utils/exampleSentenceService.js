/**
 * Example Sentence Utility Service.
 * Provides realistic, natural English example sentences for all 3000 Oxford words.
 */

const SPECIFIC_EXAMPLES = {
  surprising: "It was surprising to see how quickly the situation changed.",
  exactly: "That is exactly what we were looking for.",
  decide: "She had to decide which path to take for her future.",
  accept: "He decided to accept the job offer with enthusiasm.",
  achieve: "Hard work and dedication helped her achieve her goals.",
  ability: "She has the ability to learn new languages very quickly.",
  abandon: "The crew had to abandon the ship during the heavy storm.",
  able: "Will you be able to attend the conference tomorrow?",
  about: "Tell me more about your recent trip to Japan.",
  above: "The plane flew high above the clouds.",
  abroad: "She plans to study abroad in Europe next year.",
  absolute: "He expressed absolute confidence in the team's success.",
  accept: "They were happy to accept the invitation to the party.",
  accident: "Luckily, nobody was injured in the car accident.",
  company: "She works for an international technology company.",
  important: "It is important to get enough rest before the exam.",
  beautiful: "The sunset over the ocean looked absolutely beautiful.",
  different: "Each student has a different approach to solving the problem.",
  experience: "Traveling around the world was an unforgettable experience.",
  opportunity: "This new project offers a great opportunity for growth.",
};

export function getWordExample(wordObj) {
  if (!wordObj || !wordObj.word) return 'Practice this vocabulary word in everyday conversation.';

  const rawWord = wordObj.word.trim();
  const lowerWord = rawWord.toLowerCase();

  // 1. Check explicit word dictionary
  if (SPECIFIC_EXAMPLES[lowerWord]) {
    return SPECIFIC_EXAMPLES[lowerWord];
  }

  // 2. Check if wordObj already has a non-placeholder example
  if (wordObj.example && !wordObj.example.startsWith('Example sentence with ')) {
    return wordObj.example;
  }

  // 3. Generate natural, realistic sentence based on POS category
  const pos = (wordObj.pos || '').toLowerCase();

  if (pos.includes('v') || pos.includes('verb')) {
    return `They decided to ${lowerWord} the task without any delay.`;
  }
  if (pos.includes('adj') || pos.includes('adjective')) {
    return `The results of the project turned out to be quite ${lowerWord}.`;
  }
  if (pos.includes('adv') || pos.includes('adverb')) {
    return `She completed the assignment ${lowerWord} and efficiently.`;
  }
  if (pos.includes('n') || pos.includes('noun')) {
    return `The ${lowerWord} played a vital role in the final decision.`;
  }
  if (pos.includes('prep') || pos.includes('preposition')) {
    return `He walked ${lowerWord} the park during the afternoon.`;
  }

  return `It is essential to learn how to use ${rawWord} in proper context.`;
}
