// Prüfungszusammenfassung für MDE System v2

const PrüfungSummary = {
    inputValues: { io: '', nio: '' },
    hasConfirmedIO: false,
    currentInputField: 'io',

    // Prüfungszusammenfassung öffnen
    open: function(zyklus) {
        this.inputValues = { io: '', nio: '' };
        this.hasConfirmedIO = false;
        this.currentInputField = 'io';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'prüfungModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>✓ Prüfung Zyklus ${zyklus}</h2>
                </div>
                <div class="modal-body">
                    <div class="numpad-container">
                        <div class="numpad-left">
                            <div class="input-tabs">
                                <div class="input-tab active" id="tab-io" onclick="PrüfungSummary.switchField('io')">
                                    <div class="input-tab-label">i.O. Teile</div>
                                    <div class="input-tab-value" id="display-io">0</div>
                                </div>
                                <div class="input-tab" id="tab-nio" onclick="PrüfungSummary.switchField('nio')">
                                    <div class="input-tab-label">n.i.O. Teile</div>
                                    <div class="input-tab-value" id="display-nio">0</div>
                                </div>
                            </div>

                            <div class="number-input-display active" id="activeDisplay">
                                <div class="number-input-label" id="activeLabel">i.O. Teileanzahl eingeben</div>
                                <div class="number-input-value" id="activeValue">0</div>
                            </div>

                            <div class="modal-buttons">
                                <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                                <button class="btn-primary" id="confirmBtn" onclick="PrüfungSummary.handleConfirm(${zyklus})">Weiter zu n.i.O.</button>
                            </div>
                        </div>

                        <div class="numpad">
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('1')">1</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('2')">2</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('3')">3</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('4')">4</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('5')">5</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('6')">6</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('7')">7</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('8')">8</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('9')">9</button>
                            <button class="numpad-btn special" onclick="PrüfungSummary.clearInput()">⌫</button>
                            <button class="numpad-btn" onclick="PrüfungSummary.addDigit('0')">0</button>
                            <button class="numpad-btn special" onclick="PrüfungSummary.clearAll()">C</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.updateDisplay();
    },

    // Ziffer hinzufügen
    addDigit: function(digit) {
        this.inputValues[this.currentInputField] += digit;
        this.updateDisplay();
    },

    // Letzte Ziffer löschen
    clearInput: function() {
        this.inputValues[this.currentInputField] = this.inputValues[this.currentInputField].slice(0, -1);
        this.updateDisplay();
    },

    // Alles löschen
    clearAll: function() {
        this.inputValues[this.currentInputField] = '';
        this.updateDisplay();
    },

    // Feld wechseln
    switchField: function(field) {
        this.currentInputField = field;
        document.getElementById('tab-io').classList.toggle('active', field === 'io');
        document.getElementById('tab-nio').classList.toggle('active', field === 'nio');

        const label = field === 'io' ? 'i.O. Teileanzahl eingeben' : 'n.i.O. Teileanzahl eingeben';
        document.getElementById('activeLabel').textContent = label;

        const confirmBtn = document.getElementById('confirmBtn');
        if (field === 'io' && !this.hasConfirmedIO) {
            confirmBtn.textContent = 'Weiter zu n.i.O.';
        } else {
            confirmBtn.textContent = 'Bestätigen';
        }

        this.updateDisplay();
    },

    // Display aktualisieren
    updateDisplay: function() {
        const ioValue = this.inputValues.io || '0';
        const nioValue = this.inputValues.nio || '0';

        document.getElementById('display-io').textContent = ioValue;
        document.getElementById('display-nio').textContent = nioValue;

        const activeValue = this.inputValues[this.currentInputField] || '0';
        document.getElementById('activeValue').textContent = activeValue;
    },

    // Bestätigung behandeln
    handleConfirm: function(zyklus) {
        if (this.currentInputField === 'io' && !this.hasConfirmedIO) {
            this.hasConfirmedIO = true;
            this.switchField('nio');
        } else {
            this.showSummary(zyklus);
        }
    },

    // Zusammenfassung anzeigen
    showSummary: function(zyklus) {
        const ioCount = parseInt(this.inputValues.io) || 0;
        const nioCount = parseInt(this.inputValues.nio) || 0;
        const total = ioCount + nioCount;

        const modal = document.getElementById('prüfungModal');
        if (!modal) return;

        const tbkInfo = (zyklus === 1 && window.mdeState.currentTeilekarte) ? `
            <div style="margin-bottom: 16px;">
                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">TBK-Nr.</div>
                <div style="font-size: 18px; font-weight: 700; color: #2a5298;">${window.mdeState.currentTeilekarte.teilekartenNr}</div>
            </div>
        ` : '';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📊 Prüfungszusammenfassung - Zyklus ${zyklus}</h2>
                </div>
                <div class="modal-body">
                    <div class="summary-box">
                        <div style="text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 20px;">
                            <div style="font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Teil</div>
                            <div style="font-size: 28px; font-weight: 700; color: #1a202c;">📦 ${window.mdeState.currentPart}</div>
                        </div>
                        ${tbkInfo}
                        <div class="summary-stats">
                            <div class="summary-stat-item">
                                <div class="summary-stat-label summary-stat-io">✓ i.O.</div>
                                <div class="summary-stat-value summary-stat-io">${ioCount}</div>
                            </div>
                            <div class="summary-stat-item">
                                <div class="summary-stat-label summary-stat-nio">✗ n.i.O.</div>
                                <div class="summary-stat-value summary-stat-nio">${nioCount}</div>
                            </div>
                            <div class="summary-stat-item">
                                <div class="summary-stat-label summary-stat-total">Σ Gesamt</div>
                                <div class="summary-stat-value summary-stat-total">${total}</div>
                            </div>
                        </div>
                    </div>
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Prüfung bestätigen und ${zyklus === 1 ? 'zu Stillstand wechseln' : 'abschließen'}?
                    </p>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                        <button class="btn-primary" onclick="PrüfungSummary.confirm(${zyklus})">Bestätigen</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Prüfung bestätigen
    confirm: function(zyklus) {
        const ioCount = parseInt(this.inputValues.io) || 0;
        const nioCount = parseInt(this.inputValues.nio) || 0;

        // Timeline-Eintrag hinzufügen
        Timeline.add(zyklus === 1 ? 'prüfung_z1' : 'prüfung_z2', {
            teil: window.mdeState.currentPart,
            tbk: window.mdeState.currentTeilekarte ? window.mdeState.currentTeilekarte.teilekartenNr : '-',
            io: ioCount,
            nio: nioCount
        });

        // Prüfung speichern
        const prüfung = {
            id: Date.now(),
            startzeit: window.mdeState.prüfungStartzeit ? window.mdeState.prüfungStartzeit.toLocaleString('de-DE') : '-',
            endzeit: new Date().toLocaleString('de-DE'),
            prüfnummer: window.mdeState.prüfnummer,
            part: window.mdeState.currentPart,
            teilekarte: window.mdeState.currentTeilekarte,
            io: ioCount,
            nio: nioCount,
            total: ioCount + nioCount,
            zyklus: zyklus,
            type: 'prüfung'
        };
        window.mdeState.prüfungen.push(prüfung);

        closeModal();

        // Automatischer Modus: Nach Zyklus 1 -> Stillstand
        if (window.mdeState.modeVersion === 1 && zyklus === 1) {
            AutoMode.simulateStillstand();
        } else {
            // Zurück zu Idle
            window.mdeState.machineState = 'idle';
            window.mdeState.prüfungAktiv = false;
            window.mdeState.currentTeilekarte = null;
            window.mdeState.currentZyklus = null;
            updatePartSection();
            if (window.mdeState.modeVersion === 1) {
                AutoMode.updateButton();
            } else {
                ManualMode.updateButtons();
            }
            showSuccess('Prüfung abgeschlossen!');
        }
    }
};

// Globale Funktion für Kompatibilität
window.openPrüfungZusammenfassung = function(zyklus) {
    PrüfungSummary.open(zyklus);
};

console.log('Prüfung Summary module loaded');
