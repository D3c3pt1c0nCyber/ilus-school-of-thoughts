# Local testing — Friends, Live Debate & the AI adjudicator

Run the whole app against the **Firebase Emulator Suite** on your machine — no production data touched, no deploy needed. The client auto-connects to the emulators **only** when you open it on `localhost` / `127.0.0.1` (the deployed site is never affected).

---

## Prerequisites (already installed on this machine)

| Tool | Status | Notes |
|---|---|---|
| Node.js | ✅ v25 | The Functions emulator warns `requested "20" doesn't match "25"` and runs anyway — harmless locally. To mirror production exactly, use `nvm use 20`. |
| Firebase CLI | ✅ 15.20.0 | `firebase --version` |
| JDK | ✅ OpenJDK 21 | Required by the Firestore + Auth emulators. **Open a new terminal** so `java -version` resolves. |
| Function deps | ✅ installed | `functions/node_modules` (@anthropic-ai/sdk, firebase-admin, firebase-functions) |

---

## 1. Add your Anthropic API key (for the AI judge)

Edit **`functions/.secret.local`** and replace the placeholder with your real key:

```
ANTHROPIC_API_KEY=sk-ant-...your key...
```

This file is **gitignored** — it never gets committed or deployed. The Functions emulator loads it automatically. (Without a real key, everything works *except* the final verdict, which will land the debate in an `error` state.)

---

## 2. Start the emulators (terminal 1)

From the project root (`Ilus-School-of-Thoughts`):

```bash
firebase emulators:start
```

Wait for **“All emulators ready”**. You get:

- Emulator UI → http://127.0.0.1:4000  (inspect Firestore data, Auth users, and Functions logs)
- Auth :9099 · Firestore :8080 · Functions :5001

Leave this running. The AI-judge function loads here; when a debate reaches the closing phase, the Firestore write trips the `onDocumentUpdated` trigger and you'll see the Claude call in this terminal's **Functions** logs.

> First run downloads the emulator binaries (a few MB) — give it a moment.

## 3. Serve the static site (terminal 2)

```bash
python -m http.server 7575
```

Open **http://localhost:7575** (or `http://127.0.0.1:7575`). The console should log:
`[Ilu] Local dev: connected to Firebase Auth + Firestore emulators.`
That confirms the client is talking to the emulators, not production.

---

## 4. Create two test accounts

The two debaters need to be two different signed-in users:

1. In your normal browser window, open the site → **Sign in** → use **email + password** to create account **A** (e.g. `alice@test.dev` / `password1`).
2. Open a **second** browser profile or an **incognito window** → create account **B** (e.g. `bob@test.dev` / `password2`).

> Use **email/password**, not Google. Against the Auth emulator, "Continue with Google" opens a *synthetic* emulator account-picker (a mock — not the real Google consent screen). Email/password behaves exactly like production. New emulator accounts are wiped when the emulator stops (see persistence note below).

## 5. Walk the full flow

1. **A** → **Friends** → search **B**'s name → **Add friend**.
2. **B** → **Friends** → **Accept** the request.
3. **A** → **Live Debate** → **Challenge a friend**: pick B, a motion, a side → **Send challenge**.
4. **B** → **Live Debate** → **Accept** the incoming challenge.
5. Both argue **Opening → Cross-Examination → Closing** against the shared timer (submit each phase; a phase advances when both submit or the clock runs out).
6. After the closing phase the debate flips to **judging**; within a few seconds the **verdict panel** (winner, per-criterion scores, reasoning) appears for **both** users.

Watch terminal 1's Functions logs for `Judging debate …` → `judged: winner=…`.

---

## Persisting test data between runs (optional)

Emulator data is in-memory by default. To keep your accounts/friendships across restarts:

```bash
firebase emulators:start --import=./.emulator-data --export-on-exit
```

(`./.emulator-data` is gitignored via `.firebase/`-style patterns — keep it out of commits.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `java: command not found` when starting emulators | Open a **new** terminal (winget updated PATH); confirm `java -version` shows 21. |
| Client logs no `[Ilu] Local dev…` line | You opened a non-loopback URL. Use `localhost`/`127.0.0.1`, not a LAN IP. |
| Verdict never appears, debate shows an error | Real key not set in `functions/.secret.local`, or no internet for the Claude call. Check terminal 1 Functions logs. |
| `Your requested "node" version "20" doesn't match "25"` | Harmless local warning. Optionally `nvm use 20`. |
| Port already in use | Edit the ports in `firebase.json` → `emulators`, and the matching `connect*Emulator` ports in `index.html`. |

---

## What is and isn't exercised locally

- **Exercised:** auth, Firestore rules (`directory`/`friendships`/`debates`), real-time sync, the live debate state machine, and the **real Claude verdict** (the function calls the live Anthropic API with your key).
- **Not the real thing:** Google sign-in popup (synthetic in the emulator). Validate that against a staging Firebase project if needed.
