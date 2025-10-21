// Timeline-Modul für MDE System v2

const Timeline = {
    // Timeline-Eintrag hinzufügen
    add: function(type, data) {
        const entry = {
            id: Date.now(),
            type: type, // 'prüfung_z1', 'prüfung_z2', 'stillstand', 'störung'
            timestamp: new Date(),
            data: data,
            missingInfo: data.missingInfo || false
        };
        window.mdeState.timeline.push(entry);
        this.update();
    },

    // Timeline aktualisieren
    update: function() {
        const content = document.getElementById('timelineContent');
        if (!content) return;

        if (window.mdeState.timeline.length === 0) {
            content.className = 'timeline-empty';
            content.innerHTML = 'Noch keine Einträge vorhanden';
            return;
        }

        content.className = '';
        const sortedTimeline = [...window.mdeState.timeline].reverse();

        content.innerHTML = sortedTimeline.map(entry => {
            const typeClass = entry.type.includes('prüfung') ? 'prüfung' : entry.type;
            const missingClass = entry.missingInfo ? 'missing-info' : '';
            const activeClass = entry.data.isActive ? 'active' : '';

            let icon = '📋';
            let title = '';
            let details = '';

            if (entry.type === 'prüfung_z1') {
                icon = '✓';
                title = 'Prüfung Zyklus 1';
                details = `Teil: ${entry.data.teil}<br>TBK: ${entry.data.tbk}<br>i.O.: ${entry.data.io || 0} | n.i.O.: ${entry.data.nio || 0}`;
            } else if (entry.type === 'prüfung_z2') {
                icon = '✓';
                title = 'Prüfung Zyklus 2';
                details = `Teil: ${entry.data.teil}<br>i.O.: ${entry.data.io || 0} | n.i.O.: ${entry.data.nio || 0}`;
            } else if (entry.type === 'stillstand') {
                icon = '⚠️';
                title = 'Stillstand';
                const grund = entry.data.grund || '<span class="timeline-missing-badge">Keine Angabe</span>';
                details = `Grund: ${grund}<br>Dauer: ${entry.data.dauer || 'läuft...'}`;
            } else if (entry.type === 'störung') {
                icon = '🚨';
                title = 'Störung';
                const grund = entry.data.grund || '<span class="timeline-missing-badge">Keine Angabe</span>';
                details = `Grund: ${grund}<br>Dauer: ${entry.data.dauer || 'läuft...'}`;
            }

            const timeStr = entry.timestamp.toLocaleTimeString('de-DE');

            return `
                <div class="timeline-item ${typeClass} ${missingClass} ${activeClass}" onclick="Timeline.handleClick(${entry.id})">
                    <div class="timeline-item-header">
                        <div class="timeline-item-title">
                            <span>${icon}</span>
                            <span>${title}</span>
                        </div>
                        <div class="timeline-item-time">${timeStr}</div>
                    </div>
                    <div class="timeline-item-details">${details}</div>
                </div>
            `;
        }).join('');
    },

    // Timeline-Klick behandeln
    handleClick: function(entryId) {
        const entry = window.mdeState.timeline.find(e => e.id === entryId);
        if (!entry) return;

        // Ermögliche nachträgliche Eingabe bei fehlenden Infos
        if (entry.missingInfo) {
            if (entry.type === 'stillstand') {
                this.openStillstandReasonModal(entryId);
            } else if (entry.type === 'störung') {
                this.openStörungReasonModal(entryId);
            }
        }
    },

    // Modal für nachträgliche Stillstand-Grund-Eingabe
    openStillstandReasonModal: function(entryId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'reasonModal';
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚠️ Stillstand-Grund nachtragen</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Bitte wählen Sie den Grund für den Stillstand:
                    </p>
                    <div class="störung-options">
                        <div class="störung-option" onclick="Timeline.saveStillstandReason(${entryId}, 'Pause')">
                            <h3>☕ Pause</h3>
                        </div>
                        <div class="störung-option" onclick="Timeline.saveStillstandReason(${entryId}, 'Materialmangel')">
                            <h3>📦 Materialmangel</h3>
                        </div>
                        <div class="störung-option" onclick="Timeline.saveStillstandReason(${entryId}, 'Rüsten')">
                            <h3>🔧 Rüsten</h3>
                        </div>
                        <div class="störung-option" onclick="Timeline.saveStillstandReason(${entryId}, 'Sonstiges')">
                            <h3>📝 Sonstiges</h3>
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

    // Stillstand-Grund speichern
    saveStillstandReason: function(entryId, grund) {
        const entry = window.mdeState.timeline.find(e => e.id === entryId);
        if (entry) {
            entry.data.grund = grund;
            entry.missingInfo = false;
            this.update();
        }
        closeModal();
        showSuccess('Stillstand-Grund nachgetragen');
    },

    // Modal für nachträgliche Störungs-Grund-Eingabe
    openStörungReasonModal: function(entryId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'reasonModal';
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
            `<div class="störung-option" onclick="Timeline.saveStörungReason(${entryId}, '${opt.text}')">
                <h3>${opt.icon} ${opt.text}</h3>
            </div>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🚨 Störungs-Grund nachtragen</h2>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
                        Bitte wählen Sie den Störungsgrund:
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

    // Störungs-Grund speichern
    saveStörungReason: function(entryId, grund) {
        const entry = window.mdeState.timeline.find(e => e.id === entryId);
        if (entry) {
            entry.data.grund = grund;
            entry.missingInfo = false;
            this.update();
        }
        closeModal();
        showSuccess('Störungsgrund nachgetragen');
    }
};

console.log('Timeline module loaded');
