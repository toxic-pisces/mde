// MDE System v2 - Hauptsteuerung

// Globaler State
window.mdeState = {
    prüfnummer: '',
    currentPart: 'Housing',
    machineActive: true,
    prüfungen: [],
    störungen: [],
    prüfungAktiv: false,
    currentTeilekarte: null,
    prüfungStartzeit: null,
    modeVersion: 1, // 1 = Automatisch, 2 = Manuell
    machineState: 'idle', // idle, prüfung_zyklus1, prüfung_zyklus2, stillstand, störung
    currentZyklus: null,
    timeline: [],
    currentStillstand: null,
    currentStörung: null
};

// ========== VERSION SWITCHING ==========
function switchVersion(version) {
    window.mdeState.modeVersion = version;

    document.getElementById('versionBtn1').classList.toggle('active', version === 1);
    document.getElementById('versionBtn2').classList.toggle('active', version === 2);

    document.getElementById('autoModeSection').classList.toggle('hidden', version !== 1);
    document.getElementById('manualModeSection').classList.toggle('hidden', version !== 2);

    resetMachineState();
    updateUI();
}

function resetMachineState() {
    window.mdeState.machineState = 'idle';
    window.mdeState.prüfungAktiv = false;
    window.mdeState.currentTeilekarte = null;
    window.mdeState.currentZyklus = null;
    AutoMode.hideStillstandOverlay();
    AutoMode.hideStörungOverlay();
}

function updateUI() {
    if (window.mdeState.modeVersion === 1) {
        AutoMode.updateButton();
    } else {
        ManualMode.updateButtons();
    }
    updatePartSection();
    Timeline.update();
}

// ========== HANDLER FUNCTIONS ==========
function handleSimulationAction() {
    AutoMode.handleAction();
}

function handleManualStart() {
    ManualMode.handleStart();
}

function handleManualComplete() {
    ManualMode.handleComplete();
}

function handleManualInterrupt() {
    ManualMode.handleInterrupt();
}

// ========== PART SECTION UPDATE ==========
function updatePartSection() {
    const section = document.getElementById('partSection');
    if (!section) return;

    if (!window.mdeState.prüfungAktiv || !window.mdeState.currentTeilekarte) {
        section.innerHTML = '<div class="no-active-inspection">Keine aktive Prüfung</div>';
        return;
    }

    const tk = window.mdeState.currentTeilekarte;
    const zyklus = window.mdeState.currentZyklus || 1;

    section.innerHTML = `
        <div class="part-info-row">
            <span class="part-info-label">Teil</span>
            <span class="part-info-value highlight">${tk.teil}</span>
        </div>
        <div class="part-info-row">
            <span class="part-info-label">Zyklus</span>
            <span class="part-info-value">${zyklus}</span>
        </div>
        <div class="part-info-row">
            <span class="part-info-label">TBK-Nr.</span>
            <span class="part-info-value">${tk.teilekartenNr}</span>
        </div>
        <div class="part-info-row">
            <span class="part-info-label">Charge</span>
            <span class="part-info-value">${tk.chargeNr}</span>
        </div>
        <div class="part-info-row">
            <span class="part-info-label">Laufkarte</span>
            <span class="part-info-value">${tk.laufkartenNr}</span>
        </div>
    `;
}

// ========== BARCODE SCANNER (von original übernommen) ==========
function openBarcodeScanner() {
    let scanInProgress = false;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'barcodeModal';
    modal.onclick = (e) => { if (e.target === modal) closeBarcodeScanner(); };

    modal.innerHTML = `
        <div class="scanner-modal">
            <div class="scanner-header">
                <h2>📷 Barcode Scanner</h2>
                <button class="scanner-close-btn" onclick="closeBarcodeScanner()">×</button>
            </div>
            <div class="scanner-body">
                <div id="reader"></div>
                <div class="scanner-status" id="scannerStatus">
                    <p class="scanner-status-text">Richte die Kamera auf einen Barcode...</p>
                </div>
                <div class="scanner-fallback">
                    <p class="scanner-fallback-text">oder gib den Code manuell ein:</p>
                    <input type="text" id="manualBarcodeInput" placeholder="Barcode eingeben"
                           onkeypress="if(event.key === 'Enter') submitManualBarcode()"/>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    startBarcodeScanner();
}

function startBarcodeScanner() {
    window.html5QrcodeScanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    window.html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            if (!window.scanInProgress) {
                window.scanInProgress = true;
                onBarcodeScanSuccess(decodedText);
            }
        },
        (error) => {
            // Ignore scan errors
        }
    ).catch(err => {
        console.error("Scanner error:", err);
        document.getElementById('scannerStatus').innerHTML =
            '<p class="scanner-status-text" style="color: #ef4444;">Kamera nicht verfügbar. Bitte manuell eingeben.</p>';
    });
}

function submitManualBarcode() {
    const input = document.getElementById('manualBarcodeInput');
    const barcode = input.value.trim();
    if (barcode) {
        onBarcodeScanSuccess(barcode);
    }
}

function onBarcodeScanSuccess(barcode) {
    if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.stop().then(() => {
            window.html5QrcodeScanner.clear();
            window.html5QrcodeScanner = null;
        }).catch(err => {
            console.error("Error stopping scanner:", err);
            window.html5QrcodeScanner = null;
        });
    }

    const modal = document.getElementById('barcodeModal');
    if (modal) modal.remove();

    // Simuliere TBK-Daten
    const teilekartenNr = barcode;
    const chargeNr = 'CH-' + Math.floor(Math.random() * 900 + 100);
    const laufkartenNr = 'LK-' + Math.floor(Math.random() * 9000 + 1000);
    const parts = window.availableParts || ['Housing', 'Bremskolben', 'Ventil'];
    const teil = parts[Math.floor(Math.random() * parts.length)];

    showTeilekartenInfo(teilekartenNr, chargeNr, laufkartenNr, teil);
}

function closeBarcodeScanner() {
    if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.stop().then(() => {
            window.html5QrcodeScanner.clear();
            window.html5QrcodeScanner = null;
        }).catch(err => {
            console.error("Error stopping scanner:", err);
            window.html5QrcodeScanner = null;
        });
    }

    const modal = document.getElementById('barcodeModal');
    if (modal) modal.remove();

    window.scanInProgress = false;
}

function showTeilekartenInfo(teilekartenNr, chargeNr, laufkartenNr, teil) {
    closeModal();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'teilekartenModal';
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>✓ Teilekarte erfasst</h2>
            </div>
            <div class="modal-body">
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 3px solid #2a5298; border-radius: 16px;">
                        <div style="display: grid; gap: 16px;">
                            <div>
                                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Teil</div>
                                <div style="font-size: 24px; font-weight: 700; color: #1a202c;">📦 ${teil}</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                <div>
                                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Teilekarten-Nr.</div>
                                    <div style="font-size: 18px; font-weight: 700; color: #2a5298;">${teilekartenNr}</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Charge-Nr.</div>
                                    <div style="font-size: 18px; font-weight: 700; color: #2a5298;">${chargeNr}</div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Laufkarten-Nr.</div>
                                <div style="font-size: 18px; font-weight: 700; color: #2a5298;">${laufkartenNr}</div>
                            </div>
                        </div>
                    </div>
                    <p style="text-align: center; color: #64748b; font-size: 16px;">Bitte überprüfen Sie die Daten und bestätigen Sie.</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn-secondary" onclick="closeModal()">Abbrechen</button>
                    <button class="btn-primary" onclick="startPrüfung('${teilekartenNr}', '${chargeNr}', '${laufkartenNr}', '${teil}')">Bestätigen & Starten</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function startPrüfung(teilekartenNr, chargeNr, laufkartenNr, teil) {
    window.mdeState.prüfungAktiv = true;
    window.mdeState.prüfungStartzeit = new Date();
    window.mdeState.currentTeilekarte = {
        teilekartenNr: teilekartenNr,
        chargeNr: chargeNr,
        laufkartenNr: laufkartenNr,
        teil: teil
    };
    window.mdeState.currentPart = teil;
    window.mdeState.currentZyklus = window.mdeState.currentZyklus || 1;

    // Setze Maschinenzustand
    if (window.mdeState.modeVersion === 1) {
        window.mdeState.machineState = window.mdeState.currentZyklus === 1 ? 'prüfung_zyklus1' : 'prüfung_zyklus2';
    }

    updateUI();
    closeModal();
    showSuccess(`Prüfung Zyklus ${window.mdeState.currentZyklus} gestartet für ${teil}`);
}

// ========== UTILITY FUNCTIONS ==========
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

function showSuccess(message) {
    // Einfache Success-Nachricht (kann später verbessert werden)
    console.log('SUCCESS:', message);
    // Optional: Toast-Benachrichtigung anzeigen
}

// Expose globale Funktionen für Barcode-Scanner
window.openBarcodeScanner = openBarcodeScanner;
window.closeBarcodeScanner = closeBarcodeScanner;

console.log('MDE Main module loaded');
console.log('All modules initialized successfully!');
