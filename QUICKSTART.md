# 🚀 Quick Start - Firebase PLC Simulator

## ✅ Schritt 1: Datenbank-Regeln setzen (WICHTIG!)

1. Gehen Sie zur [Firebase Console](https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/rules)
2. Klicken Sie auf **"Realtime Database"** im linken Menü
3. Klicken Sie auf den Tab **"Regeln"**
4. Ersetzen Sie die Regeln mit:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

5. Klicken Sie auf **"Veröffentlichen"**

⚠️ **Hinweis**: Diese Regeln sind für Tests. Später sollten Sie diese einschränken!

---

## ✅ Schritt 2: Initiale Daten importieren

### Option A: Über Firebase Console (Empfohlen)

1. Gehen Sie zur [Firebase Database Data](https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/data)
2. Klicken Sie auf die **drei Punkte (⋮)** oben rechts
3. Wählen Sie **"JSON importieren"**
4. Wählen Sie die Datei `firebase-initial-data.json` aus diesem Ordner
5. Klicken Sie auf **"Importieren"**

### Option B: Manuell erstellen

1. Gehen Sie zur [Firebase Database Data](https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/data)
2. Klicken Sie auf das **+** Symbol neben der Datenbank-URL
3. Geben Sie ein:
   - **Name**: `plc`
   - **Wert**: `{}`
4. Klicken Sie auf das **+** Symbol neben `plc`
5. Geben Sie ein:
   - **Name**: `status`
   - **Wert**: `10`
6. Fertig! (Die App erstellt die anderen Felder automatisch)

---

## ✅ Schritt 3: App öffnen und testen

1. Öffnen Sie `index.html` in einem Browser
2. Öffnen Sie die Browser-Konsole (F12)
3. Sie sollten sehen:
   ```
   ✓ Firebase erfolgreich initialisiert
   🔧 Firebase PLC Simulator wird initialisiert...
   ✓ Firebase PLC Simulator erfolgreich gestartet
   🚀 Firebase PLC Simulator bereit
   ```

---

## ✅ Schritt 4: Status-Codes testen

Öffnen Sie die [Firebase Database Data](https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/data)

### Test 1: Test automatisch starten
1. Klicken Sie auf den Wert bei `plc/status` (aktuell `10`)
2. Ändern Sie ihn auf `20`
3. **Ergebnis**: Die App öffnet automatisch den Barcode-Scanner! 🎉

### Test 2: Störung auslösen
1. Ändern Sie `plc/status` auf `-10`
2. **Ergebnis**: Das Störungs-Modal erscheint! ⚠️

### Test 3: Zurück zu Betriebsbereit
1. Ändern Sie `plc/status` auf `10`
2. **Ergebnis**: Die App ist wieder im Idle-Modus ✅

### Test 4: Herunterfahren
1. Ändern Sie `plc/status` auf `0`
2. **Ergebnis**: Die Maschine wird deaktiviert 🔴

---

## 🎮 Status-Codes Referenz

| Code | Bedeutung | Was passiert |
|------|-----------|--------------|
| **20** | Produktiv | ▶️ Startet automatisch eine Prüfung (öffnet Barcode-Scanner) |
| **10** | Betriebsbereit | ✅ Maschine im Idle-Modus, bereit für Prüfungen |
| **0** | Heruntergefahren | ⚫ Maschine deaktiviert |
| **-10** | Störung | 🔴 Störungs-Modal wird geöffnet |

---

## 💡 Pro-Tipp: Browser-Konsole verwenden

Sie können auch direkt in der Browser-Konsole (F12) Befehle eingeben:

```javascript
// Test starten
FirebasePLC.setStatus(20);

// Störung
FirebasePLC.setStatus(-10);

// Zurück zu Bereit
FirebasePLC.setStatus(10);

// Aktuellen Status anzeigen
console.log('Aktueller Status:', FirebasePLC.lastStatus);
```

---

## 🔗 Nützliche Links

- **Firebase Console**: https://console.firebase.google.com/project/mdee-90798
- **Realtime Database Data**: https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/data
- **Database Rules**: https://console.firebase.google.com/project/mdee-90798/database/mdee-90798-default-rtdb/rules
- **Project Settings**: https://console.firebase.google.com/project/mdee-90798/settings/general

---

## ❓ Probleme?

### "Permission denied" Fehler
→ Überprüfen Sie, ob die Datenbank-Regeln auf `".read": true, ".write": true` gesetzt sind

### Keine Reaktion auf Status-Änderungen
→ Öffnen Sie die Browser-Konsole (F12) und suchen Sie nach Fehlermeldungen
→ Stellen Sie sicher, dass die App geladen ist wenn Sie den Status ändern

### Firebase nicht initialisiert
→ Prüfen Sie, ob in `js/firebase-config.js` die Konfiguration korrekt ist
→ Aktualisieren Sie die Seite (F5)

---

**Viel Erfolg! 🚀**

Bei Fragen schauen Sie in die ausführliche Dokumentation: `FIREBASE_PLC_SETUP.md`
