# 📚 VocabAI Daily

An automated vocabulary website that generates and publishes one new English word every day using **Claude AI**, **GitHub Actions**, and **Vercel**.

- ⏰ GitHub Action fires at **9 AM UTC** daily
- 🤖 **Claude Opus 4.6** generates the word, definition, etymology, examples & more
- 📦 Auto-commits to `data/words.json` in the repo
- 🌐 **Vercel** detects the push and auto-deploys the updated Next.js site
- 🟩 Tracks your contribution streak with a GitHub-style graph

---

## 🚀 One-Time Setup (5 minutes)

### 1. Fork & clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/vocab-ai-daily.git
cd vocab-ai-daily
npm install
```

### 2. Add your Anthropic API key to GitHub Secrets

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Go to your repo → **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY` · Value: your key

That's it — the Action uses `GITHUB_TOKEN` automatically for the commit.

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Vercel auto-detects Next.js — no config needed
3. Click **Deploy**

Now every time the GitHub Action commits a new word, Vercel rebuilds and deploys your site automatically.

---

## 🧪 Test Locally

```bash
# Copy the example env file
cp .env.example .env
# Add your key to .env

# Generate today's word manually
npm run generate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

---

## 📁 Project Structure

```
vocab-ai-daily/
├── .github/
│   └── workflows/
│       └── daily-word.yml    # ⏰ Cron job — runs at 9 AM UTC
│
├── app/
│   ├── layout.tsx            # Root layout + metadata
│   ├── page.tsx              # Main page (reads words.json at build time)
│   └── globals.css           # Tailwind CSS
│
├── data/
│   └── words.json            # 📦 All generated words live here
│
├── scripts/
│   └── generate-word.ts      # 🤖 Calls Claude API, writes to words.json
│
└── package.json
```

---

## 🔧 How It Works

```
9 AM UTC
   │
   ▼
GitHub Actions
   │  1. Checkout repo
   │  2. npm ci
   │  3. npm run generate  ──► Claude Opus 4.6 generates word
   │                            Appends to data/words.json
   │  4. git commit & push
   │
   ▼
Vercel detects push
   │
   ▼
Rebuilds Next.js site (reads updated words.json)
   │
   ▼
🌐 Live website updated — new green square added!
```

---

## 🎨 Features

- **GitHub-style contribution graph** — visualize your streak
- **Word of the Day** hero section with full details
- **Word archive** — all previous words in a card grid
- **Rich word data**: pronunciation, etymology, examples, synonyms, antonyms, difficulty level
- **Fully static** — fast loading, no server required
- **Mobile responsive**

---

## ⚙️ Manual Trigger

You can trigger the workflow manually anytime:

1. Go to your repo on GitHub
2. Click **Actions** tab
3. Select **Generate Daily Vocabulary Word**
4. Click **Run workflow**

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| **Claude Opus 4.6** | AI word generation with structured JSON output |
| **Next.js 14** | Static site framework (App Router) |
| **Tailwind CSS** | Styling |
| **GitHub Actions** | Daily cron automation |
| **Vercel** | Hosting + auto-deploy on push |
