console.log('Testing Audio Service Logic for Mobile...');
// Verify audio chunking logic
const text = "Late into the rainy night, Detective Jameson stood near his desk inspecting an unusual wax-sealed envelope. The mysterious letter requested his unique ability to decode an ancient manuscript that had puzzled scholars for over a century.";

function chunkTextForAudio(t) {
  if (!t) return [];
  const rawSentences = t.match(/[^.!?]+[.!?]+/g) || [t];
  const chunks = [];
  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 150) {
      chunks.push(trimmed);
    } else {
      const parts = trimmed.split(/,\s*/);
      let current = '';
      for (const part of parts) {
        if ((current + ' ' + part).length <= 150) {
          current = (current + ' ' + part).trim();
        } else {
          if (current) chunks.push(current);
          current = part.trim();
        }
      }
      if (current) chunks.push(current);
    }
  }
  return chunks.length > 0 ? chunks : [t.trim()];
}

const chunks = chunkTextForAudio(text);
console.log('Chunks generated for story paragraph:', chunks.length);
chunks.forEach((c, idx) => console.log(`Chunk ${idx + 1}:`, c));
