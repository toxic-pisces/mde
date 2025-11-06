# Firebase PLC Status Simulation - Setup Anleitung

Diese Anleitung erklärt, wie Sie die Firebase PLC Status-Simulation für Ihr Tablet-Prüfsystem einrichten.

## 📋 Übersicht

Die Firebase PLC Simulation ermöglicht es, die Kommunikation mit einer echten SPS (Speicherprogrammierbare Steuerung) zu simulieren. Über eine Firebase Realtime Database können Sie Status-Codes setzen, die verschiedene Aktionen in der App auslösen.

### Status-Codes

| Code | Bedeutung | Aktion |
|------|-----------|--------|
| `-10` | Störung (Malfunction) | Öffnet das Störungs-Modal |
| `10` | Betriebsbereit (Ready) | Setzt Maschine auf Idle-Status |
| `20` | Produktiv (Productive) | Startet automatisch eine Prüfung (simuliert "Test starten" Button) |
| `0` | Heruntergefahren (Shutdown) | Deaktiviert die Maschine |

## 🚀 Einrichtung

### Schritt 1: Firebase Projekt erstellen

1. Gehen Sie zu [Firebase Console](https://console.firebase.google.com/)
2. Klicken Sie auf "Projekt hinzufügen"
3. Geben Sie einen Projektnamen ein (z.B. "MDE-PLC-Simulator")
4. Folgen Sie den Anweisungen (Google Analytics ist optional)

### Schritt 2: Realtime Database erstellen

1. In Ihrem Firebase Projekt: Klicken Sie im linken Menü auf "Realtime Database"
2. Klicken Sie auf "Datenbank erstellen"
3. Wählen Sie eine Region (z.B. `europe-west1`)
4. Wählen Sie **"Im Testmodus starten"** für die Entwicklung
   - ⚠️ **Wichtig**: Im Testmodus ist die Datenbank öffentlich zugänglich. Für Produktion sollten Sie Sicherheitsregeln konfigurieren!

### Schritt 3: Firebase Konfiguration abrufen

1. Klicken Sie auf das Zahnrad-Symbol ⚙️ neben "Projektübersicht"
2. Wählen Sie "Projekteinstellungen"
3. Scrollen Sie nach unten zu "Ihre Apps"
4. Klicken Sie auf das Web-Symbol `</>` (Web-App hinzufügen)
5. Geben Sie einen App-Namen ein (z.B. "MDE-Tablet-App")
6. Kopieren Sie die Firebase-Konfiguration

### Schritt 4: Konfiguration in die App einfügen

1. Öffnen Sie die Datei `js/firebase-config.js`
2. Ersetzen Sie die Platzhalter mit Ihren Firebase-Werten:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",  // Ihre echten Werte hier einfügen
    authDomain: "mde-plc-simulator.firebaseapp.com",
    databaseURL: "https://mde-plc-simulator-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mde-plc-simulator",
    storageBucket: "mde-plc-simulator.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

### Schritt 5: Initiale Datenstruktur erstellen

1. Gehen Sie zurück zur Firebase Console → Realtime Database
2. Klicken Sie auf das `+` Symbol neben der Datenbank-URL
3. Erstellen Sie folgende Struktur:

```json
{
  "plc": {
    "status": 10,
    "testData": {
      "io": 0,
      "nio": 0,
      "total": 0,
      "startzeit": null,
      "endzeit": null
    },
    "lastUpdate": "2024-01-15T10:00:00.000Z"
  }
}
```

**Oder kopieren Sie einfach diese Struktur:**
- Klicken Sie oben rechts auf die drei Punkte (⋮)
- Wählen Sie "Daten importieren"
- Erstellen Sie eine JSON-Datei mit obiger Struktur
- Importieren Sie die Datei

## 🎮 Verwendung

### Die App starten

1. Öffnen Sie `index.html` in einem Browser
2. In der Konsole sollten Sie folgende Meldungen sehen:
   ```
   ✓ Firebase erfolgreich initialisiert
   🔧 Firebase PLC Simulator wird initialisiert...
   ✓ Firebase PLC Simulator erfolgreich gestartet
   🚀 Firebase PLC Simulator bereit
   ```

### Status-Codes testen

#### Methode 1: Firebase Console (empfohlen für Tests)

1. Öffnen Sie die Firebase Console → Realtime Database
2. Navigieren Sie zu `plc/status`
3. Klicken Sie auf den Wert und ändern Sie ihn
4. Die App reagiert **sofort** auf die Änderung!

**Beispiel-Workflow:**
1. Setzen Sie `status` auf `20` → Die App startet automatisch eine Prüfung
2. Setzen Sie `status` auf `-10` → Die App zeigt das Störungs-Modal
3. Setzen Sie `status` auf `10` → Die App geht zurück in den Bereitschafts-Modus

#### Methode 2: Browser-Konsole

Sie können auch direkt aus der Browser-Konsole Befehle senden:

```javascript
// Status auf "Test starten" setzen
FirebasePLC.setStatus(20);

// Status auf "Störung" setzen
FirebasePLC.setStatus(-10);

// Status auf "Betriebsbereit" setzen
FirebasePLC.setStatus(10);

// Status auf "Heruntergefahren" setzen
FirebasePLC.setStatus(0);

// Aktuellen Status abrufen
FirebasePLC.lastStatus;

// Test-Daten setzen (optional, für zukünftige Erweiterungen)
FirebasePLC.setTestData(150, 5);  // 150 i.O., 5 n.i.O.
```

## 📊 Datenstruktur

### plc/status
Der aktuelle Status-Code der SPS/Maschine.

### plc/testData
Zusätzliche Daten, die von der SPS kommen könnten:
- `io`: Anzahl der guten Teile (in Ordnung)
- `nio`: Anzahl der fehlerhaften Teile (nicht in Ordnung)
- `total`: Gesamtanzahl der Teile
- `startzeit`: Prüfungs-Startzeit (ISO 8601 Format)
- `endzeit`: Prüfungs-Endzeit (ISO 8601 Format)

**Hinweis**: Diese Felder sind vorbereitet für zukünftige Erweiterungen, werden aber aktuell noch nicht automatisch in die App übernommen.

## 🔍 Fehlerbehebung

### "Firebase ist nicht initialisiert"
- Überprüfen Sie, ob die Firebase-Konfiguration in `js/firebase-config.js` korrekt ist
- Öffnen Sie die Browser-Konsole (F12) und suchen Sie nach Fehlermeldungen
- Stellen Sie sicher, dass Sie die richtigen Firebase-URLs verwenden

### "Permission denied" Fehler
- Gehen Sie zur Firebase Console → Realtime Database → Regeln
- Für Entwicklung/Tests verwenden Sie diese Regeln:
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
- ⚠️ **Warnung**: Diese Regeln sind nur für Tests geeignet!

### Änderungen werden nicht erkannt
- Stellen Sie sicher, dass Sie mit dem Internet verbunden sind
- Überprüfen Sie in der Firebase Console, ob die Werte tatsächlich geändert wurden
- Aktualisieren Sie die Seite (F5)
- Überprüfen Sie die Browser-Konsole auf Fehler

## 🔐 Sicherheitsregeln für Produktion

Für den Produktionseinsatz sollten Sie die Sicherheitsregeln anpassen:

```json
{
  "rules": {
    "plc": {
      ".read": true,
      "status": {
        ".write": "auth != null"  // Nur authentifizierte Benutzer
      },
      "testData": {
        ".write": "auth != null"
      }
    }
  }
}
```

## 📱 Integration mit echter SPS

Wenn Sie später eine echte SPS anbinden möchten:

1. **Option A: SPS → Firebase** (empfohlen)
   - Implementieren Sie einen Dienst auf der SPS oder einem Edge-Gateway
   - Dieser Dienst schreibt Status-Codes direkt in Firebase
   - Die Tablet-App reagiert automatisch (bereits implementiert!)

2. **Option B: Direktverbindung**
   - Ersetzen Sie die Firebase-Integration durch eine direkte REST/WebSocket-Verbindung
   - Passen Sie `js/firebase-plc.js` entsprechend an

## 💡 Tipps

1. **Mehrere Tablets**: Sie können beliebig viele Tablets mit derselben Firebase-Datenbank verbinden. Alle reagieren synchron auf Status-Änderungen!

2. **Logging**: Alle Status-Änderungen werden in der Browser-Konsole protokolliert. Öffnen Sie die Konsole (F12) für Debugging.

3. **Benachrichtigungen**: Die App zeigt Toast-Benachrichtigungen bei Status-Änderungen an.

4. **Offline-Modus**: Firebase Realtime Database unterstützt Offline-Synchronisation. Änderungen werden automatisch synchronisiert, wenn die Verbindung wiederhergestellt wird.

## 🎯 Nächste Schritte

- [ ] Firebase-Projekt erstellen
- [ ] Konfiguration in `js/firebase-config.js` eintragen
- [ ] App öffnen und testen
- [ ] Status-Codes in Firebase Console ändern und Reaktionen beobachten
- [ ] Für Produktion: Sicherheitsregeln anpassen

## ❓ Fragen?

Bei Problemen oder Fragen überprüfen Sie:
1. Browser-Konsole (F12) auf Fehlermeldungen
2. Firebase Console → Realtime Database → Daten Tab
3. Netzwerk-Tab in den Browser DevTools

---

**Viel Erfolg mit Ihrem Prüfsystem! 🚀**
