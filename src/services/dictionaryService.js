/**
 * Integrated Free Dictionary API & Datamuse API Service.
 * Fetches real human audio MP3, IPA phonetics, definitions, synonyms, and antonyms.
 */

const FREE_DICT_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DATAMUSE_BASE = 'https://api.datamuse.com/words';

/**
 * Fetch human MP3 audio link and IPA phonetics from Free Dictionary API.
 */
export async function fetchFreeDictDetails(word) {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim().toLowerCase();

  try {
    const res = await fetch(`${FREE_DICT_BASE}/${encodeURIComponent(cleanWord)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const entry = data[0];
        const audioObj = entry.phonetics?.find((p) => p.audio && p.audio.trim());
        const audioUrl = audioObj ? audioObj.audio : null;

        const meanings = entry.meanings || [];
        const definitions = meanings.flatMap((m) => m.definitions?.map((d) => d.definition)).filter(Boolean);

        return {
          ipa: entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || '',
          audioUrl,
          definitions: definitions.slice(0, 3),
        };
      }
    }
  } catch (err) {
    console.warn('FreeDict API fetch error:', err);
  }

  return null;
}

/**
 * Fetch synonyms, antonyms, and IPA phonetics from Datamuse API.
 */
export async function fetchDatamuseDetails(word) {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim().toLowerCase();

  try {
    const res = await fetch(`${DATAMUSE_BASE}?sp=${encodeURIComponent(cleanWord)}&md=d,r,p&ipa=1`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const entry = data[0];

        // Fetch synonyms
        const synRes = await fetch(`${DATAMUSE_BASE}?rel_syn=${encodeURIComponent(cleanWord)}&max=5`);
        let synonyms = [];
        if (synRes.ok) {
          const synData = await synRes.json();
          synonyms = synData.map((s) => s.word);
        }

        // Fetch antonyms
        const antRes = await fetch(`${DATAMUSE_BASE}?rel_ant=${encodeURIComponent(cleanWord)}&max=5`);
        let antonyms = [];
        if (antRes.ok) {
          const antData = await antRes.json();
          antonyms = antData.map((a) => a.word);
        }

        const ipaTag = entry.tags?.find((t) => t.startsWith('ipa_pron:'));
        const ipa = ipaTag ? ipaTag.replace('ipa_pron:', '') : '';

        return {
          definitions: entry.defs || [],
          synonyms,
          antonyms,
          ipa,
        };
      }
    }
  } catch (err) {
    console.warn('Datamuse API fetch error:', err);
  }

  return null;
}
