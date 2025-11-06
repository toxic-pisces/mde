// Firebase PLC Status Simulation
// Simuliert die Kommunikation mit einer SPS (PLC) über Firebase Realtime Database

const FirebasePLC = {
    isConnected: false,
    statusRef: null,
    lastStatus: null,
    isLocalUpdate: false,  // Flag to prevent double execution

    // Status-Codes
    STATUS_CODES: {
        MALFUNCTION: -10,      // Störung
        READY: 10,            // Betriebsbereit / Idle
        PRODUCTIVE: 20,       // Produktiv / Test starten
        SHUTDOWN: 0           // Heruntergefahren
    },

    // Firebase PLC Listener initialisieren
    init: function() {
        console.log('🔧 Firebase PLC Simulator wird initialisiert...');

        // Prüfe ob Firebase initialisiert ist
        if (!window.firebaseDatabase) {
            console.error('✗ Firebase ist nicht initialisiert. Bitte führen Sie initFirebase() aus.');
            return false;
        }

        // Referenz zum Status-Knoten in der Datenbank
        this.statusRef = firebase.database().ref('plc/status');

        // Listener für Status-Änderungen registrieren
        this.statusRef.on('value', (snapshot) => {
            const status = snapshot.val();
            this.handleStatusChange(status);
        });

        // Initiale Status-Werte in Firebase setzen (falls nicht vorhanden)
        this.statusRef.once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                console.log('📝 Initialer Status wird in Firebase gesetzt...');
                this.setStatus(this.STATUS_CODES.READY);
            }
        });

        // Zusätzliche PLC-Datenfelder initialisieren
        this.initPLCDataFields();

        this.isConnected = true;
        console.log('✓ Firebase PLC Simulator erfolgreich gestartet');
        this.showNotification('PLC Simulator verbunden', 'success');

        return true;
    },

    // Initialisiere zusätzliche PLC-Datenfelder für Testzahlen
    initPLCDataFields: function() {
        const plcRef = firebase.database().ref('plc');

        plcRef.once('value').then((snapshot) => {
            const data = snapshot.val() || {};

            // Setze Default-Werte wenn nicht vorhanden
            if (!data.testData) {
                plcRef.update({
                    testData: {
                        io: 0,          // i.O. Teile
                        nio: 0,         // n.i.O. Teile
                        total: 0,       // Gesamt
                        startzeit: null,
                        endzeit: null
                    },
                    lastUpdate: new Date().toISOString()
                });
            }
        });
    },

    // Status-Änderung behandeln
    handleStatusChange: function(newStatus) {
        if (newStatus === null || newStatus === undefined) {
            console.warn('⚠ Ungültiger Status empfangen:', newStatus);
            return;
        }

        // Ignoriere wenn Status sich nicht geändert hat
        if (this.lastStatus === newStatus) {
            return;
        }

        console.log(`📡 PLC Status geändert: ${this.lastStatus} → ${newStatus}`);
        this.lastStatus = newStatus;

        // Status-Code zu Beschreibung mappen
        const statusDesc = this.getStatusDescription(newStatus);
        console.log(`   Bedeutung: ${statusDesc}`);

        // Wenn das Update lokal ausgelöst wurde, nur Firebase aktualisieren, aber keine Aktion ausführen
        if (this.isLocalUpdate) {
            console.log('   ℹ Lokale Änderung - keine Aktion wird ausgeführt');
            this.isLocalUpdate = false;
            return;
        }

        // Entsprechende Aktion ausführen (nur bei externen Änderungen)
        this.executeAction(newStatus);
    },

    // Status-Beschreibung abrufen
    getStatusDescription: function(status) {
        switch(status) {
            case this.STATUS_CODES.MALFUNCTION:
                return 'Störung (-10)';
            case this.STATUS_CODES.READY:
                return 'Betriebsbereit (10)';
            case this.STATUS_CODES.PRODUCTIVE:
                return 'Produktiv / Test starten (20)';
            case this.STATUS_CODES.SHUTDOWN:
                return 'Heruntergefahren (0)';
            default:
                return `Unbekannt (${status})`;
        }
    },

    // Aktion basierend auf Status ausführen
    executeAction: function(status) {
        // Prüfe ob mdeState existiert
        if (!window.mdeState) {
            console.error('✗ window.mdeState ist nicht initialisiert! Warte 2 Sekunden...');
            // Versuche nochmal nach 2 Sekunden
            setTimeout(() => {
                if (window.mdeState) {
                    console.log('✓ mdeState jetzt verfügbar, führe Aktion aus...');
                    this.executeAction(status);
                } else {
                    console.error('✗ mdeState immer noch nicht verfügbar. App nicht geladen?');
                }
            }, 2000);
            return;
        }

        const state = window.mdeState;

        switch(status) {
            case this.STATUS_CODES.MALFUNCTION: // -10 = Störung
                this.triggerMalfunction();
                break;

            case this.STATUS_CODES.READY: // 10 = Betriebsbereit
                this.triggerReady();
                break;

            case this.STATUS_CODES.PRODUCTIVE: // 20 = Test starten
                this.triggerStartTest();
                break;

            case this.STATUS_CODES.SHUTDOWN: // 0 = Herunterfahren
                this.triggerShutdown();
                break;

            default:
                console.warn(`⚠ Unbekannter Status-Code: ${status}`);
        }
    },

    // Störung auslösen
    triggerMalfunction: function() {
        console.log('🔴 Störung wird ausgelöst...');
        this.showNotification('PLC: Störung erkannt (-10)', 'error');

        if (!window.mdeState) {
            console.error('✗ window.mdeState nicht verfügbar');
            return;
        }

        const state = window.mdeState;

        // Wenn eine Prüfung läuft, öffne erst das Summary Modal
        if (state.prüfungAktiv) {
            console.log('   ℹ Laufende Prüfung wird beendet - öffne Summary Modal');

            const zyklus = state.currentZyklus || 1;

            // Öffne Prüfung Summary Modal
            if (typeof PrüfungSummary !== 'undefined' && PrüfungSummary.open) {
                setTimeout(() => {
                    PrüfungSummary.open(zyklus);
                }, 300);
            }
        }

        // Setze Maschinenstatus auf Störung
        console.log('   ✅ Setze Maschinenstatus auf STÖRUNG');
        state.machineState = 'störung';

        // Stoppe Live Timeline Update
        if (state.liveUpdateInterval) {
            clearInterval(state.liveUpdateInterval);
            state.liveUpdateInterval = null;
            console.log('   ℹ Live Timeline Update gestoppt');
        }

        // Update Timeline ein letztes Mal
        if (typeof updateTimeline === 'function') {
            updateTimeline();
        }

        // Triggere Störungs-Modal - versuche alle Methoden
        if (typeof window.openStörungModal === 'function') {
            console.log('   ✅ Öffne Störungs-Modal');
            setTimeout(() => {
                window.openStörungModal();
            }, 700);
        } else {
            console.error('   ✗ openStörungModal Funktion nicht gefunden!');
            console.log('   ℹ Verfügbare window Funktionen:', Object.keys(window).filter(k => k.toLowerCase().includes('störung')));
        }

        // Update UI
        if (typeof AutoMode !== 'undefined' && AutoMode.updateButton) {
            AutoMode.updateButton();
        }
        if (typeof updateContentGlow === 'function') {
            updateContentGlow();
        }
    },

    // Betriebsbereit setzen
    triggerReady: function() {
        console.log('🟢 Betriebsbereit-Modus wird aktiviert...');
        this.showNotification('PLC: Betriebsbereit (10)', 'success');

        if (!window.mdeState) {
            console.error('✗ window.mdeState nicht verfügbar');
            return;
        }

        const state = window.mdeState;

        // Wenn eine Prüfung läuft, öffne erst das Summary Modal
        if (state.prüfungAktiv) {
            console.log('   ℹ Laufende Prüfung wird beendet - öffne Summary Modal');

            const zyklus = state.currentZyklus || 1;

            // Öffne Prüfung Summary Modal
            if (typeof PrüfungSummary !== 'undefined' && PrüfungSummary.open) {
                setTimeout(() => {
                    PrüfungSummary.open(zyklus);
                }, 300);
            }
        }

        // Setze Status auf idle
        console.log('   ✅ Setze Maschinenstatus auf IDLE (bereit)');
        state.machineState = 'idle';
        state.prüfungAktiv = false;

        // Stoppe Live Timeline Update
        if (state.liveUpdateInterval) {
            clearInterval(state.liveUpdateInterval);
            state.liveUpdateInterval = null;
            console.log('   ℹ Live Timeline Update gestoppt');
        }

        // Update Timeline ein letztes Mal
        if (typeof updateTimeline === 'function') {
            updateTimeline();
        }

        // Maschine aktivieren falls deaktiviert
        if (!state.machineActive) {
            console.log('   ✅ Aktiviere Maschine');
            state.machineActive = true;
        }

        // Update UI Toggle
        const toggle = document.getElementById('statusToggle');
        const text = document.getElementById('statusText');
        if (toggle) {
            toggle.classList.remove('inactive');
            toggle.classList.add('active');
        }
        if (text) {
            text.textContent = 'In Betrieb';
        }

        // Update UI
        if (typeof AutoMode !== 'undefined' && AutoMode.updateButton) {
            AutoMode.updateButton();
        }
        if (typeof updateContentGlow === 'function') {
            updateContentGlow();
        }
    },

    // Test starten (simuliert Button-Klick)
    triggerStartTest: function() {
        console.log('🟡 Test wird gestartet (simuliert "Prüfung starten" Button)...');
        this.showNotification('PLC: Test starten (20)', 'info');

        if (!window.mdeState) {
            console.error('✗ window.mdeState nicht verfügbar');
            return;
        }

        const state = window.mdeState;

        // Setze Maschine auf idle falls nicht schon
        if (state.machineState !== 'idle') {
            console.log(`   ⚠ Maschine war in '${state.machineState}' - wird auf 'idle' gesetzt`);
            state.machineState = 'idle';
            state.prüfungAktiv = false;
        }

        // Stelle sicher dass Maschine aktiv ist
        if (!state.machineActive) {
            console.log('   ℹ Maschine wird aktiviert');
            state.machineActive = true;
        }

        // SOFORT Prüfung als aktiv markieren für Timeline
        console.log('   ✅ Setze prüfungAktiv = true für Timeline');
        state.prüfungAktiv = true;
        state.prüfungStartzeit = new Date();

        // Starte Live Timeline Update
        if (state.liveUpdateInterval) {
            clearInterval(state.liveUpdateInterval);
        }
        state.liveUpdateInterval = setInterval(() => {
            if (typeof updateTimeline === 'function') {
                updateTimeline();
            }
        }, 1000);

        // Update Timeline sofort
        if (typeof updateTimeline === 'function') {
            updateTimeline();
        }

        // Im Auto-Mode: Starte Prüfung Zyklus 1
        if (state.modeVersion === 1) {
            console.log('   ✅ Auto-Mode: Öffne Barcode Scanner');

            // Versuche AutoMode
            if (typeof AutoMode !== 'undefined' && AutoMode.startPrüfungZyklus1) {
                setTimeout(() => {
                    AutoMode.startPrüfungZyklus1();
                }, 500);
            }
            // Falls AutoMode nicht verfügbar, öffne direkt Barcode Scanner
            else if (typeof window.openBarcodeScanner === 'function') {
                console.log('   ℹ AutoMode nicht verfügbar - öffne Barcode Scanner direkt');
                setTimeout(() => {
                    window.openBarcodeScanner();
                }, 500);
            } else {
                console.error('   ✗ Keine Methode zum Starten der Prüfung gefunden!');
            }
        }
        // Im Manual-Mode: Öffne Teil-Auswahl
        else if (state.modeVersion === 2) {
            console.log('   ✅ Manual-Mode: Öffne Teil-Auswahl');
            if (typeof ManualMode !== 'undefined' && ManualMode.openTeilAuswahlModal) {
                setTimeout(() => {
                    ManualMode.openTeilAuswahlModal();
                }, 500);
            } else {
                console.error('   ✗ ManualMode nicht verfügbar!');
            }
        }

        // Update UI
        if (typeof AutoMode !== 'undefined' && AutoMode.updateButton) {
            AutoMode.updateButton();
        }
        if (typeof updateContentGlow === 'function') {
            updateContentGlow();
        }
        if (typeof updatePartSection === 'function') {
            updatePartSection();
        }
    },

    // Herunterfahren
    triggerShutdown: function() {
        console.log('⚫ System wird heruntergefahren...');
        this.showNotification('PLC: System heruntergefahren (0)', 'warning');

        if (!window.mdeState) {
            console.error('✗ window.mdeState nicht verfügbar');
            return;
        }

        const state = window.mdeState;

        // Stoppe alle laufenden Prozesse
        if (state.prüfungAktiv) {
            state.prüfungAktiv = false;
        }

        // Deaktiviere Maschine
        state.machineActive = false;

        if (typeof toggleStatus === 'function') {
            const toggle = document.getElementById('statusToggle');
            const text = document.getElementById('statusText');
            if (toggle) {
                toggle.classList.remove('active');
                toggle.classList.add('inactive');
            }
            if (text) {
                text.textContent = 'Außer Betrieb';
            }
        }

        // Update UI
        if (typeof updateContentGlow === 'function') {
            updateContentGlow();
        }
    },

    // Status in Firebase setzen (für manuelle Tests)
    setStatus: function(statusCode, fromLocalAction = false) {
        if (!this.statusRef) {
            console.error('✗ Firebase PLC ist nicht initialisiert');
            return false;
        }

        // Setze Flag wenn von lokaler Aktion (Button) ausgelöst
        if (fromLocalAction) {
            this.isLocalUpdate = true;
        }

        this.statusRef.set(statusCode)
            .then(() => {
                console.log(`✓ Status in Firebase gesetzt: ${statusCode} (${this.getStatusDescription(statusCode)})`);
            })
            .catch((error) => {
                console.error('✗ Fehler beim Setzen des Status:', error);
                this.isLocalUpdate = false;  // Reset bei Fehler
            });

        return true;
    },

    // Test-Daten von Firebase abrufen (für io, nio, total)
    getTestData: function() {
        return firebase.database().ref('plc/testData').once('value')
            .then(snapshot => snapshot.val());
    },

    // Test-Daten in Firebase setzen
    setTestData: function(io, nio, startzeit = null, endzeit = null) {
        const testData = {
            io: io || 0,
            nio: nio || 0,
            total: (io || 0) + (nio || 0),
            startzeit: startzeit || new Date().toISOString(),
            endzeit: endzeit || new Date().toISOString()
        };

        return firebase.database().ref('plc/testData').set(testData);
    },

    // Benachrichtigung anzeigen
    showNotification: function(message, type = 'info') {
        const toast = document.createElement('div');

        let bgColor;
        let icon;
        switch(type) {
            case 'success':
                bgColor = 'linear-gradient(135deg, #10b981, #059669)';
                icon = '✓';
                break;
            case 'error':
                bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
                icon = '✗';
                break;
            case 'warning':
                bgColor = 'linear-gradient(135deg, #f59e0b, #d97706)';
                icon = '⚠';
                break;
            case 'info':
            default:
                bgColor = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                icon = 'ℹ';
        }

        toast.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            font-weight: 600;
            z-index: 10001;
            font-size: 14px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        toast.textContent = `${icon} ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // Verbindung trennen
    disconnect: function() {
        if (this.statusRef) {
            this.statusRef.off();
            console.log('✓ Firebase PLC Listener deaktiviert');
        }
        this.isConnected = false;
    }
};

// Bei Seiten-Load automatisch initialisieren
window.addEventListener('load', function() {
    // Warte bis Firebase initialisiert ist
    setTimeout(() => {
        if (window.firebaseDatabase) {
            FirebasePLC.init();
        } else {
            console.warn('⚠ Firebase wurde nicht initialisiert. PLC Simulator nicht verfügbar.');
        }
    }, 1000);
});

// Exportiere für globalen Zugriff
window.FirebasePLC = FirebasePLC;
