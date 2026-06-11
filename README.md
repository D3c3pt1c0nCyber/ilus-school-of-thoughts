# Ilu's School of Thoughts

> *Dare to know. Learn to reason.*

A self-contained, single-file Learning Management System for philosophy and atheism education — built in dark academia style, deployable anywhere.

**Live site →** [ilus-school-of-thoughts.onrender.com](https://ilus-school-of-thoughts.onrender.com)

---

## What it is

Three progressive levels of study — Beginner, Intermediate, and Expert — covering the philosophical foundations of secular thought, the classical arguments for and against theism, and the deeper questions of meaning, mortality, and ethics.

| Level | Name | Duration | Credential |
|---|---|---|---|
| I | First Light | ~10 hrs · 4 wks | Certificate of Foundation |
| II | The Crucible | ~18 hrs · 6 wks | Certificate of Argumentation |
| III | Illumination | ~30 hrs · 10 wks | Advanced Certificate + Master Diploma |

Each lesson follows the **Learn → Drill → Spar → Reflect** pedagogy:
- **Read** — a short editorial essay (~3 paragraphs)
- **Terms** — key concepts defined precisely
- **Quiz** — 3 multiple-choice questions with explanations
- **Arena** — debate prompts and Socratic challenges

---

## Structure

```
index.html              ← the entire LMS (single file)
lesson-drafts/          ← 18 long-form essay drafts (source material)
  INDEX.md              ← index of all drafts
  tier-I-course-*.md
  tier-II-course-*.md
  tier-III-course-*.md
firestore.rules         ← Firestore security rules (progress, directory, friendships, debates)
functions/              ← Firebase Cloud Functions
  index.js              ← AI debate adjudicator (Claude judges live debates)
  package.json
firebase.json           ← Firebase deploy config (rules + functions)
.firebaserc             ← Firebase project alias (iluschoolotthoughts)
Dockerfile              ← nginx:alpine container
nginx.conf              ← static file serving config
docker-compose.yml      ← one-command local run
render.yaml             ← Render static site config
```

---

## Social features (Friends + Live Debate)

Logged-in students can connect and debate each other, with **Claude as the adjudicator**:

- **Friends** — search the member directory by name, send/accept friend requests.
- **Live Debate** — challenge a friend to a real-time, three-phase debate (Opening → Cross-Examination → Closing) on a chosen motion, each side on a synchronized timer.
- **AI adjudicator** — when the closing bell rings, a Firebase Cloud Function sends both transcripts to Claude (`claude-opus-4-8`), which scores each side (argumentation, evidence, rebuttal, clarity), declares a winner, and returns written reasoning — shown live to both debaters.

Data lives in three Firestore collections: `directory/{uid}`, `friendships/{pairId}`, and `debates/{debateId}`. The Anthropic API key is held server-side in the Cloud Function as a Secret — it never touches the client.

### Deploying the backend (one-time)

The static site deploys as before; the social/AI features additionally need Firestore rules + the Cloud Function:

```bash
# 1. Firebase project must be on the Blaze plan (Functions requires it; free tier covers light use)
# 2. Install the Firebase CLI and log in
npm i -g firebase-tools && firebase login

# 3. Install function deps and set the Anthropic key as a secret
cd functions && npm install && cd ..
firebase functions:secrets:set ANTHROPIC_API_KEY     # paste your Anthropic API key

# 4. Deploy rules + functions
firebase deploy --only firestore:rules,functions
```

> The Firestore directory search needs a single-field index on `directory.nameLower` (Firestore usually auto-creates it; if a query errors, follow the console link it prints).

---

## Run locally

**Option A — just open the file:**
```
double-click index.html
```

**Option B — Python server:**
```bash
python -m http.server 7575
# → http://localhost:7575
```

**Option C — Docker:**
```bash
docker compose up -d
# → http://localhost:7575
# (requires Docker Desktop with working port forwarding)
```

---

## Deploy

**Netlify Drop** (instant, no account needed):
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag `index.html` onto the page
3. Done — live in 5 seconds

**Render** (auto-deploys on every push):
1. Connect this repo at [render.com](https://render.com)
2. New → Static Site → select this repo
3. Publish directory: `.` · Build command: *(empty)*
4. Deploy

**GitHub Pages:**
1. Settings → Pages → Source: Deploy from branch `master` / `/ (root)`
2. Done

---

## Curriculum content

The `lesson-drafts/` folder contains 18 long-form philosophical essays (~650 words each) covering the full curriculum. These were written in a belletristic, scholarly voice — contemplative, charitable to theism, never contemptuous.

Each draft includes:
- Drop-cap lede
- Three numbered sections (I. II. III.)
- Pull quote with real attribution
- 3–4 footnotes citing canonical philosophical texts
- ∴ closing flourish

These serve as both standalone reading and source material for the structured lesson format.

---

## Tech

- **Frontend** — single-file HTML/CSS/JavaScript (no build step)
- **Auth + data** — Firebase Auth (Google + email) and Cloud Firestore (modular SDK 12.x)
- **AI adjudicator** — Firebase Cloud Function (Node 20) calling the Anthropic API (`@anthropic-ai/sdk`, `claude-opus-4-8`) with structured JSON output
- **Fonts** — Fraunces (display), Spectral (body), Spline Sans Mono (meta) via Google Fonts
- **Design** — dark academia: warm parchment, oxblood, brass, ink-black
- **Data** — curriculum defined in a single `CURRICULUM` JS array in `index.html`
- **Lesson content** — `LESSON_CONTENT` object in `index.html` (currently one showcase lesson)

---

## Roadmap

- [ ] Populate all 54 lesson slots with `read` + `terms` + `quiz` content
- [ ] Record narration audio for the audio player
- [x] User accounts and progress tracking
- [x] Arena (debate / Socratic sparring) feature — vs-bot practice **and** live human-vs-human debates
- [x] Friends / social graph
- [x] AI adjudicator for live debates
- [ ] Custom domain

---

## License

MIT — free to use, adapt, and build upon.

---

*Built with [Claude Code](https://claude.ai/claude-code). Philosophy is for everyone.*
