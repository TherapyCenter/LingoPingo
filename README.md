# 🐧 LingoPingo

Verspielte Sprachlern-Web-App (Duolingo-Stil) in **8 Sprachen**: Deutsch, Englisch, Spanisch, Französisch, Italienisch, Kroatisch, Türkisch, Chinesisch.
Jede davon kann Muttersprache (Oberfläche + Aufgaben) oder Lernsprache sein – also 56 Sprachkombinationen.
Mobile-first, läuft in Docker oder als Android-App, keine externen Abhängigkeiten.

## Starten

```bash
docker compose up -d --build
```

* Browser: **http://localhost:8080**
* Handy im Heimnetz: **https://&lt;IP-des-Rechners&gt;:8443**. Das Zertifikat ist selbstsigniert, also die Warnung einmal bestätigen.
  HTTPS ist nötig, damit Mikrofon/Spracherkennung auf dem Handy funktionieren.
* Auf dem Handy über „Zum Startbildschirm hinzufügen“ öffnet sich die App wie eine native App.

Ohne Docker: `node server.js` (Node ≥ 18), dann http://localhost:8080.

Profile und Fortschritt liegen im Volume `lingopingo-data` (`/data/profiles.json`).

## Features

| Bereich | Was drin ist |
|---|---|
| **Lernpfad** | 27 Einheiten (Begrüßung, Essen, Tiere, Farben, Zahlen, Familie, Reisen, Alltag, Gefühle, Wetter, Restaurant, Kleidung, Körper, Zuhause, Einkaufen, Berufe, Wochentage, Fragen, Natur, Freizeit, Beim Arzt, Tagesablauf, Stadt, Schule, Technik, Sport, Feiern) mit je 4 Lektionen + Meisterprüfung 👑 |
| **Mehrsprachig** | Beim Anlegen des Profils (oder später unter *Profil → Meine Sprache*) wählt man die eigene Sprache. Danach richten sich Oberfläche, Tipps und Aufgaben; gelernt werden kann jede andere Sprache. Der Fortschritt hängt an der Lernsprache und bleibt beim Wechsel erhalten. |
| **Chinesisch** | Zeichen mit Pinyin als Lesehilfe. Beim Tippen reicht Pinyin, Töne und Leerzeichen sind optional (`wo he shui` = 我喝水). |
| **Aufgabentypen** | Bild wählen, Übersetzung wählen, Hören & wählen, Paare finden, Satz aus Bausteinen bauen, Wort/Satz tippen, Diktat, Sprechen 🎤 |
| **Steigende Schwierigkeit** | Die Schwierigkeit (0–10) ergibt sich aus Einheit, Lektion, Level und deiner Trefferquote. Sie bestimmt Aufgabentypen (von Bildkarten bis zum freien Schreiben), die Anzahl der Antwortoptionen, zusätzliche Ablenker-Bausteine und weniger Bild-Hilfen. Wer >92 % richtig hat, bekommt schwerere Aufgaben, bei vielen Fehlern wird es leichter. |
| **Punkte** | XP mit Combo-Multiplikator (×1,5 ab 5, ×2 ab 10), Perfekt-Bonus, doppelte XP in der Prüfung, Level, Ligen (Bronze → Diamant), Tagesziel, Streak 🔥 mit Streak-Schutz, Perlen 💎, 14 Erfolge |
| **Herzen** | 5 ❤️, ein Fehler kostet ein Herz, alle 30 Min. kommt eines zurück. Wieder auffüllen geht über Üben oder mit Perlen. |
| **Üben** | Schwächen trainieren (Spaced Repetition), Hörtraining, Sprechtraining, Turbo-Runde (60 s) |
| **Rangliste** | Alle Profile auf dem Server, wöchentlich und gesamt |
| **Sound & Sprache** | Synthetisierte Soundeffekte, Vorlesen per Web Speech API (mit 🐢-Langsam-Taste), Spracherkennung |
| **Antwortprüfung** | Großschreibung und Satzzeichen sind egal. Fehlende Akzente (á, č, đ …) und kleine Tippfehler gelten mit Hinweis als richtig, mehrere Übersetzungen sind möglich. |

## Android-App (APK)

```bash
node android/build.mjs        # oder: npm run apk
```

* Braucht ein JDK (17+) und das Android-SDK (build-tools + platform), **kein** Gradle/Android Studio.
* Ergebnis: `android/dist/LingoPingo.apk`. Eine Kopie landet in `public/download/`, sodass der Server sie unter
  **/download/LingoPingo.apk** zum Herunterladen anbietet. Auf dem Handy öffnen und die Installation aus „unbekannten Quellen“ erlauben.
* Die App enthält die komplette Web-App und funktioniert offline. Vorlesen und Spracherkennung laufen über die
  Android-Dienste (Google-Sprachausgabe bzw. Google-Spracherkennung).
* Rangliste/Sync: in der App unter *Profil → Server für Rangliste* die Adresse des Servers eintragen, z. B. `192.168.1.10:8080`.
* Signiert wird mit `android/lingopingo.keystore` (wird beim ersten Build erzeugt, nicht im Git). Das Passwort steht in
  `android/keystore.pass` (ebenfalls nicht im Git) oder in der Umgebungsvariable `LINGOPINGO_KS_PASS`. Für Updates immer
  denselben Schlüssel verwenden, sonst muss die App vorher deinstalliert werden.

### Automatische Releases (GitHub Actions)

Der Workflow `.github/workflows/android-release.yml` baut die APK auf GitHub und veröffentlicht sie unter **Releases**:

* Wird auf `main` die Version in `package.json` erhöht (z. B. `1.2.0` → `1.3.0`), entsteht automatisch das Release `v1.3.0`
  mit `LingoPingo.apk`.
* Manuell starten (*Actions → Android APK release → Run workflow*) baut die APK der aktuellen Version neu.
* Einmalig nötig sind zwei Repository-Secrets mit dem Signaturschlüssel:
  ```bash
  base64 -w0 android/lingopingo.keystore | gh secret set ANDROID_KEYSTORE_B64
  gh secret set LINGOPINGO_KS_PASS < android/keystore.pass
  ```
* Neueste APK direkt: `https://github.com/<user>/lingopingo/releases/latest/download/LingoPingo.apk`

## Hinweise zu Sprache/Audio

* **Vorlesen** nutzt die Stimmen des Geräts. Android/Chrome hat meist alle drei Sprachen. Unter Windows braucht man für Kroatisch eventuell
  ein Sprachpaket (*Einstellungen → Zeit & Sprache → Sprache → Kroatisch hinzufügen*, inkl. Sprachausgabe).
* **Spracherkennung** funktioniert in Chrome, Edge und Safari, nicht in Firefox. Sie braucht `localhost` oder HTTPS. Ist sie nicht verfügbar,
  werden Sprechaufgaben automatisch durch andere Aufgaben ersetzt.

## Neue Sprache hinzufügen

1. `public/js/lang/xx.js` anlegen (Vorlage: `it.js`): pro Einheit 8 Wörter und 4 Sätze in derselben Reihenfolge wie in `course.js`,
   Alternativen mit `|` trennen
2. In `public/js/course.js` importieren, in `PACKS` und `LANGS` eintragen, z. B. `pt: { name: 'Portugiesisch', native: 'Português', flag: '🇵🇹', tts: 'pt-PT', accents: 'áâãàçéêíóôõú' }`
3. Optional eine SVG-Flagge in `FLAGS` ergänzen
4. Als Oberflächensprache: `public/js/i18n/xx.js` anlegen (Vorlage: `en.js`) und in `public/js/i18n.js` eintragen

Neue Einheiten sind einfach weitere Objekte im Array `UNITS`.

## Struktur

```
server.js              Node-Server (statische Dateien + /api/profiles), ohne npm-Abhängigkeiten
public/index.html
public/css/style.css   Gesamtes Styling (inkl. Dark Mode)
public/js/app.js       Oberfläche: Screens, Lektionsablauf, Aufgaben-Renderer
public/js/lesson.js    Lektionsgenerator, Schwierigkeit, Antwortprüfung
public/js/store.js     Profile, XP/Level/Streak/Herzen/Erfolge, Sync Server ↔ localStorage
public/js/course.js    Kursinhalte (DE/ES/EN/HR) + Zusammenführung der Sprachpakete
public/js/lang/*.js    Sprachpakete Italienisch, Französisch, Türkisch, Chinesisch
public/js/i18n.js      Oberflächen-Übersetzung (t()), Texte je Sprache in public/js/i18n/xx.js
android/               Android-App (WebView + native Sprachausgabe/-erkennung), Build-Skript build.mjs
public/js/audio.js     Soundeffekte, Vorlesen, Spracherkennung
public/js/mascot.js    Maskottchen „Pingo“ (SVG)
```
