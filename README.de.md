# 🐧 LingoPingo

[English](README.md) · **Deutsch**

Verspielte Sprachlern-App im Duolingo-Stil in **9 Sprachen**: Deutsch, Englisch, Spanisch, Französisch, Italienisch, Kroatisch, Türkisch, Chinesisch und Japanisch.
Jede davon kann die eigene Sprache (Oberfläche + Aufgaben) oder die Lernsprache sein – 72 Sprachkombinationen.
Mobile-first, läuft im Browser, in Docker, als **Android-App** und als **Windows-App**. Keine externen Abhängigkeiten.

## Download

| Plattform | So geht's |
|---|---|
| 📱 **Android** | [LingoPingo.apk](https://github.com/TherapyCenter/lingopingo/releases/latest/download/LingoPingo.apk) – auf dem Handy öffnen und die Installation aus unbekannten Quellen erlauben |
| 🪟 **Windows** | `LingoPingo-Setup-x.y.z.exe` aus dem [neuesten Release](https://github.com/TherapyCenter/lingopingo/releases/latest) – die App sucht selbst nach Updates und bietet sie zur Installation an |
| 🌐 **Browser / Server** | `docker compose up -d --build`, siehe unten |

> Der Windows-Installer ist nicht signiert, deshalb kann Windows SmartScreen warnen: *Weitere Informationen → Trotzdem ausführen*.

## Server starten

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
| **Lernpfad** | 32 Einheiten (Begrüßung, Essen, Tiere, Farben, Zahlen, Familie, Reisen, Alltag, Gefühle, Wetter, Restaurant, Kleidung, Körper, Zuhause, Einkaufen, Berufe, Wochentage, Fragen, Natur, Freizeit, Beim Arzt, Tagesablauf, Stadt, Schule, Technik, Sport, Feiern, Obst & Gemüse, Zoo, Urlaub, Gegensätze, Jahreszeiten) mit je 4 Lektionen + Meisterprüfung mit Timer 👑 |
| **Mehrsprachig** | Beim Anlegen des Profils (oder später unter *Profil → Meine Sprache*) wählt man die eigene Sprache. Danach richten sich Oberfläche, Tipps und Aufgaben; gelernt werden kann jede andere Sprache. Der Fortschritt hängt an der Lernsprache und bleibt beim Wechsel erhalten. |
| **Chinesisch & Japanisch** | Schriftzeichen mit Pinyin/Romaji als Lesehilfe. Beim Tippen reicht Pinyin/Romaji – Töne, Längenzeichen und Leerzeichen sind optional (`wo he shui` = 我喝水, `arigatou` = ありがとう). |
| **Aufgabentypen** | Bild wählen, Übersetzung wählen, Hören & wählen, Paare finden, Satz aus Bausteinen bauen, Wort/Satz tippen, Diktat, Sprechen 🎤 |
| **Steigende Schwierigkeit** | Die Schwierigkeit (0–10) ergibt sich aus Einheit, Lektion, Level und Trefferquote. Sie bestimmt Aufgabentypen (von Bildkarten bis zum freien Schreiben), die Anzahl der Antwortoptionen, zusätzliche Ablenker-Bausteine und weniger Bild-Hilfen. Über 92 % Trefferquote wird es schwerer, bei vielen Fehlern leichter. |
| **Punkte** | XP mit Combo-Multiplikator (×1,5 ab 5, ×2 ab 10), Perfekt-Bonus, doppelte XP in der Prüfung, Level, Ligen (Bronze → Diamant), Tagesziel, Streak 🔥 mit Streak-Schutz, Perlen 💎, 14 Erfolge |
| **Herzen** | 5 ❤️, ein Fehler kostet ein Herz, alle 30 Min. kommt eines zurück. Auffüllen über Üben oder mit Perlen. |
| **Üben** | Schwächen trainieren (Spaced Repetition), Hörtraining, Sprechtraining, Turbo-Runde (60 s) |
| **Rangliste** | Alle Profile auf dem Server, wöchentlich und gesamt |
| **Sound & Sprache** | Synthetisierte Soundeffekte, Vorlesen (mit 🐢-Langsam-Taste), Spracherkennung |
| **Antwortprüfung** | Groß-/Kleinschreibung und Satzzeichen sind egal. Fehlende Akzente (á, č, đ …) und kleine Tippfehler gelten mit Hinweis als richtig, mehrere Übersetzungen sind möglich. |

## Android-App (APK)

```bash
node android/build.mjs        # oder: npm run apk
```

* Braucht ein JDK (17+) und das Android-SDK (build-tools + platform), **kein** Gradle/Android Studio.
* Ergebnis: `android/dist/LingoPingo.apk`. Eine Kopie landet in `public/download/`, sodass der Server sie unter **/download/LingoPingo.apk** anbietet.
* Die App enthält die komplette Web-App und funktioniert offline. Vorlesen und Spracherkennung laufen über die Android-Dienste.
* Rangliste/Sync: in der App unter *Profil → Server für Rangliste* die Server-Adresse eintragen, z. B. `192.168.1.10:8080`.
* Signiert wird mit `android/lingopingo.keystore` (wird beim ersten Build erzeugt, nicht im Git). Das Passwort steht in
  `android/keystore.pass` (nicht im Git) oder in der Umgebungsvariable `LINGOPINGO_KS_PASS`. Immer denselben Schlüssel
  verwenden, sonst muss die App vor einem Update deinstalliert werden.

## Windows-App

```bash
cd desktop
npm install
npm start          # App starten
npm run dist       # Installer bauen -> desktop/dist/LingoPingo-Setup-x.y.z.exe
```

* Electron-Hülle um die mitgelieferte Web-App (`public/` steckt in der App, funktioniert offline).
* Vorlesen nutzt die Windows-Stimmen; Spracherkennung gibt es dort nicht, Sprechaufgaben werden übersprungen.
  Fehlende Stimmen: *Einstellungen → Zeit & Sprache → Sprache & Region → Sprache hinzufügen* (mit Sprachausgabe).
* **Updates:** Beim Start (und alle 4 Stunden) prüft die App die GitHub-Releases. Gibt es eine neue Version, fragt sie, ob sie
  heruntergeladen werden soll, und bietet danach Neustart und Installation an. Der Fortschritt bleibt erhalten.

## Automatische Releases (GitHub Actions)

Der Workflow `.github/workflows/release.yml` baut beide Apps und veröffentlicht sie unter **Releases**:

* Wird auf `main` die Version in `package.json` erhöht (z. B. `1.3.0` → `1.4.0`), entsteht automatisch das Release `v1.4.0`
  mit `LingoPingo.apk` und `LingoPingo-Setup-1.4.0.exe` (plus `latest.yml` für die Windows-Updates).
* Manuell starten (*Actions → Release → Run workflow*) baut die aktuelle Version neu und ersetzt die Dateien.
* Einmalig nötig sind zwei Repository-Secrets mit dem Android-Signaturschlüssel:
  ```bash
  base64 -w0 android/lingopingo.keystore | gh secret set ANDROID_KEYSTORE_B64
  gh secret set LINGOPINGO_KS_PASS < android/keystore.pass
  ```

## Hinweise zu Sprache/Audio

* **Vorlesen** nutzt die Stimmen des Geräts. Android/Chrome hat meist alle Sprachen; unter Windows brauchen manche Sprachen ein Sprachpaket.
* **Spracherkennung** funktioniert in Chrome, Edge und Safari (nicht Firefox) und braucht `localhost` oder HTTPS. Ist sie nicht verfügbar,
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
public/js/lang/*.js    Sprachpakete Italienisch, Französisch, Türkisch, Chinesisch, Japanisch
public/js/i18n.js      Oberflächen-Übersetzung (t()), Texte je Sprache in public/js/i18n/xx.js
public/js/audio.js     Soundeffekte, Vorlesen, Spracherkennung (inkl. Android-Brücke)
public/js/mascot.js    Maskottchen „Pingo“ (SVG)
android/               Android-App (WebView + native Sprachausgabe/-erkennung), Build-Skript build.mjs
desktop/               Windows-App (Electron + automatische Updates)
.github/workflows/     Automatische Releases
```
