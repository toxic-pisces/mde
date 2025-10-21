// Manueller Modus für MDE System v2

const ManualMode = {
    // Buttons aktualisieren
    updateButtons: function() {
        const startBtn = document.getElementById('manualStartBtn');
        const completeBtn = document.getElementById('manualCompleteBtn');
        const interruptBtn = document.getElementById('manualInterruptBtn');

        if (!startBtn) return;

        if (window.mdeState.prüfungAktiv) {
            startBtn.disabled = true;
            completeBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            completeBtn.disabled = true;
        }
    },

    // Prüfung starten
    handleStart: function() {
        // Zyklus-Auswahl-Modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'zyklusModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔄 Prüfzyklus auswählen</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px; font-size: 16px;">
                        Welchen Prüfzyklus möchten Sie starten?
                    </p>
                    <div class="störung-options">
                        <div class="störung-option" onclick="ManualMode.selectZyklus(1)">
                            <h3>1️⃣ Prüfzyklus 1 (mit TBK)</h3>
                        </div>
                        <div class="störung-option" onclick="ManualMode.selectZyklus(2)">
                            <h3>2️⃣ Prüfzyklus 2 (ohne TBK)</h3>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Zyklus auswählen
    selectZyklus: function(zyklus) {
        closeModal();

        window.mdeState.currentZyklus = zyklus;

        if (zyklus === 1) {
            // Mit TBK-Scan
            window.openBarcodeScanner();
        } else {
            // Ohne TBK - Teil auswählen
            AutoMode.openTeilAuswahlModal(zyklus);
        }
    },

    // Prüfung abgeschlossen
    handleComplete: function() {
        if (!window.mdeState.prüfungAktiv) return;

        const zyklus = window.mdeState.currentZyklus || 1;
        window.openPrüfungZusammenfassung(zyklus);
    },

    // Unterbrechung melden
    handleInterrupt: function() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'interruptModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Unterbrechung melden</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Welche Art von Unterbrechung möchten Sie melden?
                    </p>
                    <div class="störung-options">
                        <div class="störung-option" onclick="ManualMode.selectUnterbrechung('stillstand')">
                            <h3>⏸️ Stillstand</h3>
                        </div>
                        <div class="störung-option" onclick="ManualMode.selectUnterbrechung('störung')">
                            <h3>🚨 Störung</h3>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // Unterbrechungs-Typ auswählen
    selectUnterbrechung: function(type) {
        closeModal();

        if (type === 'stillstand') {
            AutoMode.simulateStillstand();
        } else {
            AutoMode.simulateStörung();
        }
    }
};

console.log('Manual Mode module loaded');
