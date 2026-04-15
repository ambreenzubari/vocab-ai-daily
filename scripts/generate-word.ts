/**
 * generate-word.ts
 *
 * Fetches a new vocabulary word from the Free Dictionary API (dictionaryapi.dev)
 * and appends it to data/words.json. Run via: npm run generate
 * Or triggered automatically by GitHub Actions at 9 AM UTC daily.
 *
 * No API key required — dictionaryapi.dev is free and open source.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VocabWord {
  date: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
}

interface DictApiDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface DictApiMeaning {
  partOfSpeech: string;
  definitions?: DictApiDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: DictApiMeaning[];
}

// ─── Curated word list ────────────────────────────────────────────────────────
// Interesting, educational words that are well-covered by the dictionary API.

const WORD_LIST = [
  'serendipity', 'ephemeral', 'melancholy', 'eloquent', 'resilience',
  'ambiguous', 'ubiquitous', 'paradigm', 'aesthetic', 'cacophony',
  'diligence', 'enigmatic', 'fervent', 'gregarious', 'hedonism',
  'idiosyncrasy', 'juxtapose', 'labyrinth', 'magnanimous', 'nuance',
  'ostracize', 'paradox', 'quintessential', 'rhetoric', 'stoic',
  'tenacious', 'venerate', 'whimsical', 'ambivalent', 'benevolent',
  'candid', 'didactic', 'empirical', 'fastidious', 'garrulous',
  'halcyon', 'insipid', 'jocular', 'laconic', 'mendacious',
  'nonchalant', 'oblivious', 'pedantic', 'querulous', 'recalcitrant',
  'sagacious', 'taciturn', 'umbrage', 'verbose', 'wistful',
  'acumen', 'bucolic', 'cogent', 'duplicity', 'esoteric',
  'facetious', 'germane', 'hubris', 'iconoclast', 'kismet',
  'loquacious', 'nefarious', 'opulent', 'pernicious', 'quixotic',
  'rapacious', 'sycophant', 'trepidation', 'unequivocal', 'vicarious',
  'zeitgeist', 'alacrity', 'beguile', 'capricious', 'derision',
  'effervescent', 'furtive', 'gratuitous', 'harbinger', 'impeccable',
  'juggernaut', 'luminous', 'malevolent', 'nebulous', 'ostentatious',
  'perfidious', 'rancorous', 'sanguine', 'truculent', 'vociferous',
  'aberrant', 'belligerent', 'circumspect', 'deferential', 'equanimity',
  'forlorn', 'glib', 'hapless', 'indelible', 'judicious',
  'kinetic', 'languid', 'maudlin', 'nascent', 'officious',
  'poignant', 'remorse', 'soliloquy', 'temerity', 'uncanny',
  'veracious', 'wan', 'xenial', 'yearn', 'zealous',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferDifficulty(word: string): 'easy' | 'medium' | 'hard' | 'advanced' {
  const len = word.length;
  if (len <= 5) return 'easy';
  if (len <= 8) return 'medium';
  if (len <= 12) return 'hard';
  return 'advanced';
}

async function fetchWordData(word: string): Promise<DictApiResponse | null> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  if (!res.ok) return null;
  const data = (await res.json()) as DictApiResponse[];
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const dataPath = join(process.cwd(), 'data', 'words.json');

  // Load existing words
  let existingWords: VocabWord[] = [];
  try {
    existingWords = JSON.parse(readFileSync(dataPath, 'utf-8'));
  } catch {
    console.log('📝 No existing words.json found, starting fresh.');
  }

  // Check if today already has a word
  const today = new Date().toISOString().split('T')[0];
  if (existingWords.some((w) => w.date === today)) {
    console.log(`✅ Word for ${today} already exists. Nothing to do.`);
    process.exit(0);
  }

  // Filter out already-used words
  const usedWords = new Set(existingWords.map((w) => w.word.toLowerCase()));
  let available = WORD_LIST.filter((w) => !usedWords.has(w.toLowerCase()));

  if (available.length === 0) {
    console.log('⚠️  All words used! Cycling back through the full list.');
    available = [...WORD_LIST];
  }

  // Pick deterministically by day-of-year so re-runs on the same day get the same word
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / 86_400_000);
  const startIndex = dayOfYear % available.length;

  // Try up to 5 candidates in case the API doesn't know a word
  let data: DictApiResponse | null = null;
  let chosenWord = '';

  for (let i = 0; i < Math.min(5, available.length); i++) {
    const candidate = available[(startIndex + i) % available.length];
    console.log(`🔍 Fetching "${candidate}" from Free Dictionary API...`);
    data = await fetchWordData(candidate);
    if (data) {
      chosenWord = candidate;
      break;
    }
    console.log(`   ⚠️  Not found, trying next word...`);
  }

  if (!data) {
    throw new Error('Could not fetch any word from the Free Dictionary API. Check your internet connection.');
  }

  // Extract the primary meaning
  const meaning = data.meanings?.[0];
  const primaryDef = meaning?.definitions?.[0];

  // Collect example sentences from all meanings
  const examples: string[] = [];
  for (const m of data.meanings ?? []) {
    for (const d of m.definitions ?? []) {
      if (d.example) examples.push(d.example);
      if (examples.length >= 3) break;
    }
    if (examples.length >= 3) break;
  }

  // Collect synonyms and antonyms (meaning-level + definition-level)
  const synonymSet = new Set<string>();
  const antonymSet = new Set<string>();
  for (const m of data.meanings ?? []) {
    (m.synonyms ?? []).forEach((s) => synonymSet.add(s));
    (m.antonyms ?? []).forEach((a) => antonymSet.add(a));
    for (const d of m.definitions ?? []) {
      (d.synonyms ?? []).forEach((s) => synonymSet.add(s));
      (d.antonyms ?? []).forEach((a) => antonymSet.add(a));
    }
  }

  // Pronunciation — prefer phonetic field, fall back to first phonetics entry
  const pronunciation =
    data.phonetic ??
    data.phonetics?.find((p) => p.text)?.text ??
    `/${chosenWord}/`;

  const newWord: VocabWord = {
    date: today,
    word: data.word ?? chosenWord,
    partOfSpeech: meaning?.partOfSpeech ?? 'unknown',
    pronunciation,
    definition: primaryDef?.definition ?? 'Definition not available.',
    etymology: 'Etymology sourced from Free Dictionary (dictionaryapi.dev).',
    examples,
    synonyms: Array.from(synonymSet).slice(0, 4),
    antonyms: Array.from(antonymSet).slice(0, 3),
    difficulty: inferDifficulty(chosenWord),
  };

  // Prepend so newest word is always first
  const updatedWords = [newWord, ...existingWords];
  writeFileSync(dataPath, JSON.stringify(updatedWords, null, 2));

  console.log(`\n✅ Word generated successfully!`);
  console.log(`   Word:       ${newWord.word} (${newWord.partOfSpeech})`);
  console.log(`   Difficulty: ${newWord.difficulty}`);
  console.log(`   Definition: ${newWord.definition.slice(0, 90)}`);
  console.log(`   Total words in collection: ${updatedWords.length}`);
}

main().catch((err) => {
  console.error('❌ Failed to generate word:', err);
  process.exit(1);
});
