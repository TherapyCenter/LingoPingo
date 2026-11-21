# 🐧 LingoPingo

**English** · [Deutsch](README.de.md)

A playful, Duolingo-style language learning app in **9 languages**: German, English, Spanish, French, Italian, Croatian, Turkish, Chinese and Japanese.
Each of them can be your own language (interface + exercises) or the language you learn – 72 language pairs.
Mobile-first, runs in the browser, in Docker, as an **Android app** and as a **Windows app**. No external dependencies.

## Download

| Platform | How |
|---|---|
| 📱 **Android** | [LingoPingo.apk](https://github.com/TherapyCenter/LingoPingo/releases/latest/download/LingoPingo.apk) – open it on your phone and allow installing from unknown sources |
| 🪟 **Windows** | `LingoPingo-Setup-x.y.z.exe` from the [latest release](https://github.com/TherapyCenter/LingoPingo/releases/latest) – the app checks for updates and offers to install them |
| 🌐 **Browser / server** | `docker compose up -d --build`, see below |

> The Windows installer is not code-signed, so Windows SmartScreen may show a warning: *More info → Run anyway*.

## Running the server

```bash
docker compose up -d --build
```

* Browser: **http://localhost:8080**
* Phone in your home network: **https://&lt;your-computer's-IP&gt;:8443**. The certificate is self-signed, so confirm the warning once.
  HTTPS is required for the microphone/speech recognition on phones.
* On a phone, "Add to Home screen" opens the app like a native app.

Without Docker: `node server.js` (Node ≥ 18), then open http://localhost:8080.
Profiles and progress are stored in the volume `lingopingo-data` (`/data/profiles.json`).

## Features

| Area | What's included |
|---|---|
| **Learning path** | 32 units (greetings, food, animals, colours, numbers, family, travel, everyday life, feelings, weather, restaurant, clothes, body, home, shopping, jobs, days of the week, questions, nature, free time, at the doctor, daily routine, city, school, technology, sports, celebrations, fruit & vegetables, zoo, holidays, opposites, seasons), each with 4 lessons + a timed mastery exam 👑 |
| **Multilingual** | When creating a profile (or later under *Profile → My language*) you choose your own language. The interface, tips and exercises follow it; any other language can be learned. Progress belongs to the learned language and is kept when switching. |
| **Chinese & Japanese** | Characters with pinyin/romaji as a reading aid. When typing, pinyin/romaji is enough – tones, long-vowel marks and spaces are optional (`wo he shui` = 我喝水, `arigatou` = ありがとう). |
| **Exercise types** | Pick the picture, pick the translation, listen & pick, match pairs, build sentences from tiles, type words/sentences, dictation, speaking 🎤 |
| **Increasing difficulty** | Difficulty (0–10) depends on unit, lesson, level and your accuracy. It controls exercise types (from picture cards to free writing), the number of options, extra distractor tiles and fewer picture hints. Above 92 % accuracy it gets harder, with many mistakes it gets easier. |
| **Points** | XP with combo multiplier (×1.5 from 5, ×2 from 10), perfect bonus, double XP in exams, levels, leagues (Bronze → Diamond), daily goal, streak 🔥 with streak freeze, gems 💎, 14 achievements |
| **Hearts** | 5 ❤️, every mistake costs a heart, one comes back every 30 minutes. Refill by practising or with gems. |
| **Practice** | Train weak spots (spaced repetition), listening, speaking, turbo round (60 s) |
| **Leaderboard** | All profiles on the server, weekly and all time |
| **Sound & speech** | Synthesized sound effects, read-aloud (with a 🐢 slow button), speech recognition |
| **Answer checking** | Case and punctuation don't matter. Missing accents (á, č, đ …) and small typos count as correct with a hint; several translations are accepted. |

## Android app (APK)

```bash
node android/build.mjs        # or: npm run apk
```

* Needs a JDK (17+) and the Android SDK (build-tools + platform), **no** Gradle/Android Studio.
* Output: `android/dist/LingoPingo.apk`. A copy goes to `public/download/`, so the server offers it at **/download/LingoPingo.apk**.
* The app contains the complete web app and works offline. Read-aloud and speech recognition use the Android services.
* Leaderboard/sync: enter your server address in the app under *Profile → Leaderboard server*, e.g. `192.168.1.10:8080`.
* Signed with `android/lingopingo.keystore` (created on the first build, not in git). The password is read from
  `android/keystore.pass` (not in git) or the environment variable `LINGOPINGO_KS_PASS`. Always use the same key –
  otherwise the app has to be uninstalled before an update.

## Windows app

```bash
cd desktop
npm install
npm start          # run the app
npm run dist       # build the installer -> desktop/dist/LingoPingo-Setup-x.y.z.exe
```

* Electron wrapper around the bundled web app (`public/` is shipped inside the app, works offline).
* Read-aloud uses the Windows voices; speech recognition is not available there, so speaking exercises are skipped.
  Missing voices: *Settings → Time & language → Language & region → Add a language* (with text-to-speech).
* **Updates:** on start (and every 4 hours) the app checks the GitHub releases. If there is a newer version it asks whether to
  download it and then offers to restart and install it. Progress is kept.

## Automatic releases (GitHub Actions)

The workflow `.github/workflows/release.yml` builds both apps and publishes them under **Releases**:

* Raising the version in `package.json` on `main` (e.g. `1.3.0` → `1.4.0`) automatically creates the release `v1.4.0`
  with `LingoPingo.apk` and `LingoPingo-Setup-1.4.0.exe` (plus `latest.yml` for the Windows updater).
* A manual run (*Actions → Release → Run workflow*) rebuilds the current version and replaces its files.
* Two repository secrets with the Android signing key are needed once:
  ```bash
  base64 -w0 android/lingopingo.keystore | gh secret set ANDROID_KEYSTORE_B64
  gh secret set LINGOPINGO_KS_PASS < android/keystore.pass
  ```

## Notes on speech/audio

* **Read-aloud** uses the device's voices. Android/Chrome usually has all languages; on Windows some languages need a language pack.
* **Speech recognition** works in Chrome, Edge and Safari (not Firefox) and needs `localhost` or HTTPS. If it isn't available,
  speaking exercises are replaced by other exercises automatically.

## Adding a language

1. Create `public/js/lang/xx.js` (template: `it.js`): per unit 8 words and 4 sentences in the same order as in `course.js`,
   alternatives separated by `|`
2. Import it in `public/js/course.js` and add it to `PACKS` and `LANGS`, e.g. `pt: { name: 'Portugiesisch', native: 'Português', flag: '🇵🇹', tts: 'pt-PT', accents: 'áâãàçéêíóôõú' }`
3. Optionally add an SVG flag to `FLAGS`
4. As an interface language: create `public/js/i18n/xx.js` (template: `en.js`) and register it in `public/js/i18n.js`

New units are simply more objects in the `UNITS` array.

## Project structure

```
server.js              Node server (static files + /api/profiles), no npm dependencies
public/index.html
public/css/style.css   All styles (incl. dark mode)
public/js/app.js       UI: screens, lesson flow, exercise renderers
public/js/lesson.js    Lesson generator, difficulty, answer checking
public/js/store.js     Profiles, XP/level/streak/hearts/achievements, sync server ↔ localStorage
public/js/course.js    Course content (DE/ES/EN/HR) + merging of the language packs
public/js/lang/*.js    Language packs: Italian, French, Turkish, Chinese, Japanese
public/js/i18n.js      Interface translation (t()), texts per language in public/js/i18n/xx.js
public/js/audio.js     Sound effects, read-aloud, speech recognition (incl. Android bridge)
public/js/mascot.js    Mascot "Pingo" (SVG)
android/               Android app (WebView + native speech), build script build.mjs
desktop/               Windows app (Electron + auto-update)
.github/workflows/     Automatic releases
```
