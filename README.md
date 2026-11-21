# 🐧 LingoPingo

Verspielte Sprachlern-Web-App (Duolingo-Stil) für **Deutsch → Spanisch, Englisch, Kroatisch**.
Mobile-first, läuft in Docker, keine externen Abhängigkeiten.

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
| **Lernpfad** | 21 Einheiten (Begrüßung, Essen, Tiere, Farben, Zahlen, Familie, Reisen, Alltag, Gefühle, Wetter, Restaurant, Kleidung, Körper, Zuhause, Einkaufen, Berufe, Wochentage, Fragen, Natur, Freizeit, Beim Arzt) mit je 4 Lektionen + Meisterprüfung 👑 |
| **Aufgabentypen** | Bild wählen, Übersetzung wählen, Hören & wählen, Paare finden, Satz aus Bausteinen bauen, Wort/Satz tippen, Diktat, Sprechen 🎤 |
| **Steigende Schwierigkeit** | Die Schwierigkeit (0–10) ergibt sich aus Einheit, Lektion, Level und deiner Trefferquote. Sie bestimmt Aufgabentypen (von Bildkarten bis zum freien Schreiben), die Anzahl der Antwortoptionen, zusätzliche Ablenker-Bausteine und weniger Bild-Hilfen. Wer >92 % richtig hat, bekommt schwerere Aufgaben, bei vielen Fehlern wird es leichter. |
| **Punkte** | XP mit Combo-Multiplikator (×1,5 ab 5, ×2 ab 10), Perfekt-Bonus, doppelte XP in der Prüfung, Level, Ligen (Bronze → Diamant), Tagesziel, Streak 🔥 mit Streak-Schutz, Perlen 💎, 14 Erfolge |
| **Herzen** | 5 ❤️, ein Fehler kostet ein Herz, alle 30 Min. kommt eines zurück. Wieder auffüllen geht über Üben oder mit Perlen. |
| **Üben** | Schwächen trainieren (Spaced Repetition), Hörtraining, Sprechtraining, Turbo-Runde (60 s) |
| **Rangliste** | Alle Profile auf dem Server, wöchentlich und gesamt |
| **Sound & Sprache** | Synthetisierte Soundeffekte, Vorlesen per Web Speech API (mit 🐢-Langsam-Taste), Spracherkennung |
| **Antwortprüfung** | Großschreibung und Satzzeichen sind egal. Fehlende Akzente (á, č, đ …) und kleine Tippfehler gelten mit Hinweis als richtig, mehrere Übersetzungen sind möglich. |

## Hinweise zu Sprache/Audio

* **Vorlesen** nutzt die Stimmen des Geräts. Android/Chrome hat meist alle drei Sprachen. Unter Windows braucht man für Kroatisch eventuell
  ein Sprachpaket (*Einstellungen → Zeit & Sprache → Sprache → Kroatisch hinzufügen*, inkl. Sprachausgabe).
* **Spracherkennung** funktioniert in Chrome, Edge und Safari, nicht in Firefox. Sie braucht `localhost` oder HTTPS. Ist sie nicht verfügbar,
  werden Sprechaufgaben automatisch durch andere Aufgaben ersetzt.

## Neue Sprache hinzufügen

In `public/js/course.js`:
1. In `LANGS` einen Eintrag ergänzen, z. B. `it: { name: 'Italienisch', native: 'Italiano', flag: '🇮🇹', tts: 'it-IT', accents: 'àèéìòù' }`
2. Bei jedem Wort und Satz den Schlüssel `it: '…'` ergänzen (Alternativen mit `|` trennen)
3. Optional eine SVG-Flagge in `FLAGS` ergänzen

Neue Einheiten sind einfach weitere Objekte im Array `UNITS`.

## Struktur

```
server.js              Node-Server (statische Dateien + /api/profiles), ohne npm-Abhängigkeiten
public/index.html
public/css/style.css   Gesamtes Styling (inkl. Dark Mode)
public/js/app.js       Oberfläche: Screens, Lektionsablauf, Aufgaben-Renderer
public/js/lesson.js    Lektionsgenerator, Schwierigkeit, Antwortprüfung
public/js/store.js     Profile, XP/Level/Streak/Herzen/Erfolge, Sync Server ↔ localStorage
public/js/course.js    Kursinhalte
public/js/audio.js     Soundeffekte, Vorlesen, Spracherkennung
public/js/mascot.js    Maskottchen „Pingo“ (SVG)
```
