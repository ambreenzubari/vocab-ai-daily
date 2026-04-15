import { readFileSync } from 'fs';
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

// ─── Data helpers ─────────────────────────────────────────────────────────────


function getWords(): VocabWord[] {
  try {
    const dataPath = join(process.cwd(), 'data', 'words.json');
    return JSON.parse(readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}


function calcStreak(words: VocabWord[]): number {
  if (!words.length) return 0;
  const dates = new Set(words.map((w) => w.date));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const s = d.toISOString().split('T')[0];
    if (dates.has(s)) streak++;
    else break;
  }
  return streak;
}

// ─── Difficulty config ────────────────────────────────────────────────────────

const difficultyConfig = {
  easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  hard: { label: 'Hard', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-200' },
};

// ─── Components ───────────────────────────────────────────────────────────────

function ContributionGraph({ words }: { words: VocabWord[] }) {
  const wordDates = new Set(words.map((w) => w.date));

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Align start to the most recent Sunday, going back ~52 weeks
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // rewind to Sunday

  const weeks: Array<Array<{ date: string; hasWord: boolean; isFuture: boolean }>> = [];
  let currentWeek: Array<{ date: string; hasWord: boolean; isFuture: boolean }> = [];

  const curr = new Date(startDate);
  while (curr <= today) {
    const dateStr = curr.toISOString().split('T')[0];
    currentWeek.push({
      date: dateStr,
      hasWord: wordDates.has(dateStr),
      isFuture: dateStr > todayStr,
    });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    curr.setDate(curr.getDate() + 1);
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-[3px] min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map(({ date, hasWord, isFuture }) => (
              <div
                key={date}
                title={`${date}${hasWord ? ' ✓ Word added' : ''}`}
                className={`w-[11px] h-[11px] rounded-[2px] transition-colors ${
                  isFuture
                    ? 'bg-gray-100'
                    : hasWord
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function WordCard({ word, featured = false }: { word: VocabWord; featured?: boolean }) {
  const diff = difficultyConfig[word.difficulty] ?? difficultyConfig.medium;

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
        featured ? 'shadow-lg border-emerald-200' : 'shadow-sm border-gray-200'
      }`}
    >
      {featured && (
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
      )}

      <div className={`p-6 ${featured ? 'p-8' : ''}`}>
        {/* Word header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-extrabold text-gray-900 leading-tight tracking-tight ${
                featured ? 'text-4xl' : 'text-xl'
              }`}
            >
              {word.word}
            </h3>
            <p className="text-gray-400 text-sm mt-0.5 font-mono">{word.pronunciation}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
              {word.partOfSpeech}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${diff.color}`}>
              {diff.label}
            </span>
          </div>
        </div>

        {/* Definition */}
        <p
          className={`text-gray-700 leading-relaxed mb-4 ${
            featured ? 'text-lg' : 'text-sm'
          }`}
        >
          {word.definition}
        </p>

        {/* Etymology */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-4">
          <p className="text-xs font-semibold text-amber-600 mb-1">📜 Etymology</p>
          <p className={`text-amber-800 leading-relaxed ${featured ? 'text-sm' : 'text-xs'}`}>
            {word.etymology}
          </p>
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Examples
          </p>
          <ul className="space-y-1.5">
            {word.examples.slice(0, featured ? 3 : 2).map((ex, i) => (
              <li
                key={i}
                className={`italic pl-3 border-l-2 border-emerald-200 text-gray-600 ${
                  featured ? 'text-sm' : 'text-xs'
                }`}
              >
                &ldquo;{ex}&rdquo;
              </li>
            ))}
          </ul>
        </div>

        {/* Synonyms / Antonyms */}
        <div className="flex flex-wrap gap-4">
          {word.synonyms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Synonyms
              </p>
              <div className="flex flex-wrap gap-1">
                {word.synonyms.slice(0, featured ? 5 : 3).map((s) => (
                  <span
                    key={s}
                    className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {word.antonyms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Antonyms
              </p>
              <div className="flex flex-wrap gap-1">
                {word.antonyms.slice(0, featured ? 3 : 2).map((a) => (
                  <span
                    key={a}
                    className="bg-rose-50 text-rose-700 text-xs px-2.5 py-0.5 rounded-full border border-rose-100"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-gray-300 mt-4 text-right">{word.date}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const words = getWords();
  const streak = calcStreak(words);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayWord = words.find((w) => w.date === todayStr);
  const previousWords = words.filter((w) => w.date !== todayStr);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl">📚</span>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">VocabAI Daily</h1>
              <p className="text-emerald-200 mt-1 text-lg">
                One new word, every day — generated by Claude AI
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-bold">{words.length}</div>
              <div className="text-emerald-200 text-sm mt-0.5">Words learned</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-bold">{streak} 🔥</div>
              <div className="text-emerald-200 text-sm mt-0.5">Day streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4 text-center">
              <div className="text-3xl font-bold">{todayWord ? '✅' : '⏳'}</div>
              <div className="text-emerald-200 text-sm mt-0.5">Today&apos;s word</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* ── Contribution Graph ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">
              🟩 Contribution Graph &mdash; Last 52 Weeks
            </h2>
            <span className="text-xs text-gray-400">{words.length} contributions</span>
          </div>
          <ContributionGraph words={words} />
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <span>Less</span>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-200" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-300" />
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500" />
            <span>More</span>
          </div>
        </section>

        {/* ── Today's Word ── */}
        {todayWord ? (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Word of the Day</h2>
              <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-semibold border border-emerald-200">
                Today · {todayStr}
              </span>
            </div>
            <WordCard word={todayWord} featured />
          </section>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">⏰</div>
            <p className="text-yellow-800 font-semibold text-lg">
              Today&apos;s word hasn&apos;t been generated yet
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              The GitHub Action runs at 9 AM UTC — check back soon!
            </p>
          </div>
        )}

        {/* ── Archive ── */}
        {previousWords.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Word Archive
              <span className="text-base font-normal text-gray-400 ml-2">
                {previousWords.length} word{previousWords.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previousWords.map((word) => (
                <WordCard key={word.date} word={word} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {words.length === 0 && (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Starting Fresh!</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Run the generator script or wait for the GitHub Action to fire at 9 AM UTC. Words
              will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t bg-white mt-12 py-8 text-center text-sm text-gray-400">
        <p>
          Built with{' '}
          <span className="font-medium text-gray-600">Next.js + Tailwind CSS</span> ·
          Powered by{' '}
          <span className="font-medium text-gray-600">Free Dictionary API</span> ·
          Automated via{' '}
          <span className="font-medium text-gray-600">GitHub Actions</span>
        </p>
        <p className="mt-1">Updates daily · Deploys automatically on Vercel</p>
      </footer>
    </main>
  );
}
