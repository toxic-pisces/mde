# 🏭 Maschinen Prüfsystem

Eine moderne Web-App für Tablets an Produktionsmaschinen zur Erfassung von Prüfergebnissen und Störungsmeldungen.

## ✨ Features

- 🔐 **Login mit Prüfnummer** - Sichere Anmeldung für jeden Prüfer
- ⚙️ **Maschinenübersicht** - Klare Darstellung der Maschine und des Teils
- 📦 **Teilauswahl** - Dropdown zur schnellen Auswahl des Teils
- ✅ **Prüfung abgeschlossen** - Erfassung von i.O. und n.i.O. Teileanzahlen
- ⚠️ **Störungsmeldung** - Auswahl aus 3 Störungstypen mit Zeiterfassung (1-120 Min)
- 💾 **Datenspeicherung** - Alle Daten werden im Browser lokal gespeichert
- 📱 **PWA Support** - Installierbar auf Tablets, funktioniert offline

## 🚀 Installation

### Lokale Entwicklung

1. **Repository klonen:**
```bash
git clone <repository-url>
cd app
```

2. **Mit lokalem Server starten:**
```bash
# Python 3
python -m http.server 8000

# oder Node.js
npx http-server
```

3. **Im Browser öffnen:**
```
http://localhost:8000
```

### Auf Tablet installieren

1. Website im Browser öffnen
2. "Zur Startseite hinzufügen" wählen
3. App wie eine native Anwendung nutzen

## 📊 Datenstruktur

### Prüfungen
```javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  prüfnummer: "12345",
  part: "Housing A",
  io: 150,      // i.O. Teile
  nio: 5        // n.i.O. Teile
}
```

### Störungen
```javascript
{
  timestamp: "2024-01-15T11:00:00.000Z",
  prüfnummer: "12345",
  type: "Technischer Defekt",
  duration: 30  // Minuten
}
```

## 🎨 Design-Prinzipien

- **Modern & Clean** - Inspiriert von test2.html mit gradient backgrounds
- **Touch-optimiert** - Große Buttons, intuitive Bedienung
- **Responsive** - Optimiert für Tablet-Displays (Landscape)
- **Smooth Animations** - Professionelle Übergänge und Hover-Effekte

## 🛠️ Technologie-Stack

- **HTML5** - Semantische Struktur
- **CSS3** - Modern styling mit Gradients, Shadows, Transitions
- **Vanilla JavaScript** - Kein Framework, maximale Performance
- **Service Worker** - PWA mit Offline-Funktionalität
- **Web App Manifest** - Native App-Experience

## 📱 Browser-Kompatibilität

- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Optimiert für iPad/Android Tablets

## 🔄 Geplante Erweiterungen

- [ ] Backend-Integration (REST API)
- [ ] Export-Funktion (CSV/Excel)
- [ ] Statistiken und Auswertungen
- [ ] Multi-Maschinen-Verwaltung
- [ ] Barcode-Scanner für Teile
- [ ] Foto-Upload bei Störungen
- [ ] Push-Benachrichtigungen
- [ ] Dark Mode

## 📝 Git Setup

```bash
# Repository initialisieren
git init

# Dateien hinzufügen
git add .

# Erster Commit
git commit -m "Initial commit: Maschinen Prüfsystem v1.0"

# Remote Repository verbinden
git remote add origin <your-repository-url>

# Push
git push -u origin main
```

## 👨‍💻 Entwicklung

Entwickelt für industrielle Produktionsumgebungen mit Fokus auf:
- ⚡ Schnelle Dateneingabe
- 🎯 Intuitive Bedienung
- 💪 Robustheit
- 📴 Offline-Fähigkeit

## 📄 Lizenz

Für interne Verwendung in der Produktion.

---

**Version:** 1.0  
**Erstellt:** 2024
