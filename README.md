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
index.html              ← the entire LMS (single file, ~88 KB)
lesson-drafts/          ← 18 long-form essay drafts (source material)
  INDEX.md              ← index of all drafts
  tier-I-course-*.md
  tier-II-course-*.md
  tier-III-course-*.md
Dockerfile              ← nginx:alpine container
nginx.conf              ← static file serving config
docker-compose.yml      ← one-command local run
render.yaml             ← Render static site config
```

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

- **Zero dependencies** — pure HTML, CSS, JavaScript
- **Fonts** — Fraunces (display), Spectral (body), Spline Sans Mono (meta) via Google Fonts
- **Design** — dark academia: warm parchment, oxblood, brass, ink-black
- **Data** — curriculum defined in a single `CURRICULUM` JS array in `index.html`
- **Lesson content** — `LESSON_CONTENT` object in `index.html` (currently one showcase lesson)

---

## Roadmap

- [ ] Populate all 54 lesson slots with `read` + `terms` + `quiz` content
- [ ] Record narration audio for the audio player
- [ ] User accounts and progress tracking
- [ ] Arena (debate / Socratic sparring) feature
- [ ] Custom domain

---

## License

MIT — free to use, adapt, and build upon.

---

*Built with [Claude Code](https://claude.ai/claude-code). Philosophy is for everyone.*
