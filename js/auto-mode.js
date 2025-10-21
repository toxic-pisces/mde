// Automatischer Modus für MDE System v2

const AutoMode = {
    // Haupt-Action-Handler
    handleAction: function() {
        const state = window.mdeState.machineState;

        if (state === 'idle') {
            this.startPrüfungZyklus1();
        } else if (state === 'prüfung_zyklus1') {
            this.confirmPrüfung(1);
        } else if (state === 'prüfung_zyklus2') {
            this.confirmPrüfung(2);
        } else if (state === 'stillstand') {
            this.endStillstand();
        } else if (state === 'störung') {
            this.endStörung();
        }
    },

    // Simulation-Button aktualisieren
    updateButton: function() {
        const btn = document.getElementById('simulationActionBtn');
        const icon = document.getElementById('simActionIcon');
        const text = document.getElementById('simActionText');

        if (!btn) return;

        const state = window.mdeState.machineState;

        if (state === 'idle') {
            icon.textContent = '▶';
            text.textContent = 'Prüfung starten (Zyklus 1)';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (state === 'prüfung_zyklus1' || state === 'prüfung_zyklus2') {
            icon.textContent = '✓';
            text.textContent = 'Prüfung bestätigen';
            btn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        } else if (state === 'stillstand') {
            icon.textContent = '▶';
            text.textContent = 'Stillstand beenden';
            btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else if (state === 'störung') {
            icon.textContent = '▶';
            text.textContent = 'Störung behoben';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
    },

    // Prüfung Zyklus 1 starten (mit TBK-Scan)
    startPrüfungZyklus1: function() {
        window.openBarcodeScanner();
    },

    // Prüfung Zyklus 2 starten (ohne TBK-Scan)
    startPrüfungZyklus2: function() {
        this.openTeilAuswahlModal(2);
    },

    // Teil-Auswahl-Modal
    openTeilAuswahlModal: function(zyklus) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'teilAuswahlModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        const parts = window.availableParts || ['Housing', 'Bremskolben', 'Ventil'];
        const optionsHTML = parts.map(teil =>
            `<div class="störung-option" onclick="AutoMode.selectTeil('${teil}', ${zyklus})">
                <h3>📦 ${teil}</h3>
            </div>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📦 Teil auswählen (Zyklus ${zyklus})</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Wählen Sie das zu prüfende Teil aus:
                    </p>
                    <div class="störung-options">
                        ${optionsHTML}
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Teil auswählen
    selectTeil: function(teil, zyklus) {
        closeModal();

        window.mdeState.prüfungAktiv = true;
        window.mdeState.prüfungStartzeit = new Date();
        window.mdeState.currentZyklus = zyklus;
        window.mdeState.currentPart = teil;
        window.mdeState.currentTeilekarte = {
            teil: teil,
            teilekartenNr: '-',
            chargeNr: '-',
            laufkartenNr: '-'
        };

        if (zyklus === 2) {
            window.mdeState.machineState = 'prüfung_zyklus2';
        }

        updatePartSection();
        this.updateButton();
        Timeline.update();
        showSuccess(`Prüfung Zyklus ${zyklus} gestartet für ${teil}`);
    },

    // Prüfung bestätigen
    confirmPrüfung: function(zyklus) {
        window.openPrüfungZusammenfassung(zyklus);
    },

    // Stillstand simulieren
    simulateStillstand: function() {
        window.mdeState.machineState = 'stillstand';
        const entryId = Date.now();
        window.mdeState.currentStillstand = {
            id: entryId,
            startTime: new Date(),
            grund: null
        };

        Timeline.add('stillstand', {
            grund: null,
            dauer: null,
            missingInfo: true,
            isActive: true,
            entryId: entryId
        });

        this.showStillstandOverlay();
        this.updateButton();

        // Öffne Grund-Modal nach kurzer Verzögerung
        setTimeout(() => {
            this.openStillstandGrundModal(entryId);
        }, 500);
    },

    // Stillstand-Grund-Modal
    openStillstandGrundModal: function(entryId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'stillstandGrundModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Stillstand-Grund angeben</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Bitte wählen Sie den Grund für den Stillstand (optional):
                    </p>
                    <div class="störung-options">
                        <div class="störung-option" onclick="AutoMode.selectStillstandGrund(${entryId}, 'Pause')">
                            <h3>☕ Pause</h3>
                        </div>
                        <div class="störung-option" onclick="AutoMode.selectStillstandGrund(${entryId}, 'Materialmangel')">
                            <h3>📦 Materialmangel</h3>
                        </div>
                        <div class="störung-option" onclick="AutoMode.selectStillstandGrund(${entryId}, 'Rüsten')">
                            <h3>🔧 Rüsten</h3>
                        </div>
                        <div class="störung-option" onclick="AutoMode.selectStillstandGrund(${entryId}, 'Sonstiges')">
                            <h3>📝 Sonstiges</h3>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Überspringen</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Stillstand-Grund auswählen
    selectStillstandGrund: function(entryId, grund) {
        const entry = window.mdeState.timeline.find(e => e.data.entryId === entryId);
        if (entry) {
            entry.data.grund = grund;
            entry.missingInfo = false;
            Timeline.update();
        }

        if (window.mdeState.currentStillstand && window.mdeState.currentStillstand.id === entryId) {
            window.mdeState.currentStillstand.grund = grund;
            const typEl = document.getElementById('stillstandTyp');
            if (typEl) typEl.textContent = `Grund: ${grund}`;
        }

        closeModal();
        showSuccess('Stillstand-Grund gespeichert');
    },

    // Stillstand beenden
    endStillstand: function() {
        if (!window.mdeState.currentStillstand) return;

        const endTime = new Date();
        const durationMs = endTime - window.mdeState.currentStillstand.startTime;
        const durationMin = Math.round(durationMs / 60000);

        // Timeline aktualisieren
        const entry = window.mdeState.timeline.find(e => e.data.entryId === window.mdeState.currentStillstand.id);
        if (entry) {
            entry.data.dauer = `${durationMin} Min`;
            entry.data.isActive = false;
            Timeline.update();
        }

        this.hideStillstandOverlay();
        window.mdeState.currentStillstand = null;
        window.mdeState.machineState = 'idle';

        showSuccess(`Stillstand beendet (${durationMin} Min) - Bereit für Zyklus 2`);

        // Auto-start Zyklus 2
        setTimeout(() => {
            this.startPrüfungZyklus2();
        }, 1000);
    },

    // Störung simulieren
    simulateStörung: function() {
        window.mdeState.machineState = 'störung';
        const entryId = Date.now();
        window.mdeState.currentStörung = {
            id: entryId,
            startTime: new Date(),
            grund: null
        };

        Timeline.add('störung', {
            grund: null,
            dauer: null,
            missingInfo: true,
            isActive: true,
            entryId: entryId
        });

        this.showStörungOverlay();
        this.updateButton();

        setTimeout(() => {
            this.openStörungGrundModal(entryId);
        }, 500);
    },

    // Störungs-Grund-Modal
    openStörungGrundModal: function(entryId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'störungGrundModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        const options = [
            { icon: '🔧', text: 'Kalibrierung fehlgeschlagen' },
            { icon: '📦', text: 'NIO voll' },
            { icon: '⬇️', text: 'Teile Zuführung' },
            { icon: '🔨', text: 'Reparatur' },
            { icon: '🐰', text: 'Rabbit Prüfung' },
            { icon: '❌', text: 'Keine Rohlinge' },
            { icon: '⬆️', text: 'Teile Abführung' },
            { icon: '📄', text: 'Dokumentation' },
            { icon: '👷', text: 'Monteur Einsatz' },
            { icon: '⚠️', text: 'Ablauffehler' },
            { icon: '🔄', text: 'Aushilfe andere Anlage' },
            { icon: '📝', text: 'Sonstiges' }
        ];

        const optionsHTML = options.map(opt =>
            `<div class="störung-option" onclick="AutoMode.selectStörungGrund(${entryId}, '${opt.text}')">
                <h3>${opt.icon} ${opt.text}</h3>
            </div>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🚨 Störungsgrund angeben</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Bitte wählen Sie den Störungsgrund (optional):
                    </p>
                    <div class="störung-options">
                        ${optionsHTML}
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Überspringen</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Störungs-Grund auswählen
    selectStörungGrund: function(entryId, grund) {
        const entry = window.mdeState.timeline.find(e => e.data.entryId === entryId);
        if (entry) {
            entry.data.grund = grund;
            entry.missingInfo = false;
            Timeline.update();
        }

        if (window.mdeState.currentStörung && window.mdeState.currentStörung.id === entryId) {
            window.mdeState.currentStörung.grund = grund;
            const typEl = document.getElementById('störungTypInfo');
            if (typEl) typEl.textContent = `Grund: ${grund}`;
        }

        closeModal();
        showSuccess('Störungsgrund gespeichert');
    },

    // Störung beenden
    endStörung: function() {
        if (!window.mdeState.currentStörung) return;

        const endTime = new Date();
        const durationMs = endTime - window.mdeState.currentStörung.startTime;
        const durationMin = Math.round(durationMs / 60000);

        const entry = window.mdeState.timeline.find(e => e.data.entryId === window.mdeState.currentStörung.id);
        if (entry) {
            entry.data.dauer = `${durationMin} Min`;
            entry.data.isActive = false;
            Timeline.update();
        }

        this.hideStörungOverlay();
        window.mdeState.currentStörung = null;
        window.mdeState.machineState = 'idle';

        showSuccess(`Störung behoben (${durationMin} Min)`);
        this.updateButton();
    },

    // Overlays anzeigen/verstecken
    showStillstandOverlay: function() {
        const overlay = document.getElementById('stillstandOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.updateStillstandTimer();
            if (!window.stillstandTimerInterval) {
                window.stillstandTimerInterval = setInterval(() => this.updateStillstandTimer(), 1000);
            }
        }
    },

    hideStillstandOverlay: function() {
        const overlay = document.getElementById('stillstandOverlay');
        if (overlay) overlay.classList.add('hidden');
        if (window.stillstandTimerInterval) {
            clearInterval(window.stillstandTimerInterval);
            window.stillstandTimerInterval = null;
        }
    },

    updateStillstandTimer: function() {
        if (!window.mdeState.currentStillstand || !window.mdeState.currentStillstand.startTime) return;
        const start = new Date(window.mdeState.currentStillstand.startTime);
        const now = new Date();
        let diff = Math.floor((now - start) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        diff = diff % 3600;
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        const dauerEl = document.getElementById('stillstandDauer');
        if (dauerEl) dauerEl.textContent = `Dauer: ${h}:${m}:${s}`;
    },

    showStörungOverlay: function() {
        const overlay = document.getElementById('störungOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.updateStörungTimer();
            if (!window.störungTimerInterval) {
                window.störungTimerInterval = setInterval(() => this.updateStörungTimer(), 1000);
            }
        }
    },

    hideStörungOverlay: function() {
        const overlay = document.getElementById('störungOverlay');
        if (overlay) overlay.classList.add('hidden');
        if (window.störungTimerInterval) {
            clearInterval(window.störungTimerInterval);
            window.störungTimerInterval = null;
        }
    },

    updateStörungTimer: function() {
        if (!window.mdeState.currentStörung || !window.mdeState.currentStörung.startTime) return;
        const start = new Date(window.mdeState.currentStörung.startTime);
        const now = new Date();
        let diff = Math.floor((now - start) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        diff = diff % 3600;
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        const dauerEl = document.getElementById('störungDauerInfo');
        if (dauerEl) dauerEl.textContent = `Dauer: ${h}:${m}:${s}`;
    }
};

// Tastatur-Shortcuts für Simulation (Taste 1 = Stillstand, Taste 2 = Störung)
window.addEventListener('keypress', (e) => {
    if (window.mdeState.modeVersion !== 1) return;
    const state = window.mdeState.machineState;

    if (e.key === '1' && (state === 'prüfung_zyklus1' || state === 'prüfung_zyklus2')) {
        AutoMode.simulateStillstand();
    } else if (e.key === '2' && (state === 'prüfung_zyklus1' || state === 'prüfung_zyklus2')) {
        AutoMode.simulateStörung();
    }
});

console.log('Auto Mode module loaded');
