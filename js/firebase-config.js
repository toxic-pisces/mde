// Firebase Configuration
// WICHTIG: Bitte ersetzen Sie diese Werte mit Ihren eigenen Firebase-Projektwerten
// Sie finden diese in der Firebase Console unter: Project Settings > General > Your apps

const firebaseConfig = {
  apiKey: "AIzaSyDOt2f94DSXcEryqN0ZHrlLPwxQMSG4_V8",
  authDomain: "mdee-90798.firebaseapp.com",
  databaseURL: "https://mdee-90798-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mdee-90798",
  storageBucket: "mdee-90798.firebasestorage.app",
  messagingSenderId: "102939691135",
  appId: "1:102939691135:web:dbb91a0a800f94b0c8174a",
  measurementId: "G-P0M88KFQEP"
};

// Firebase initialisieren
let app, database;

function initFirebase() {
    try {
        // Firebase App initialisieren
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // Exportiere die Firebase-Instanzen (NACH Initialisierung!)
        window.firebaseApp = app;
        window.firebaseDatabase = database;

        console.log('✓ Firebase erfolgreich initialisiert');
        return true;
    } catch (error) {
        console.error('✗ Firebase Initialisierung fehlgeschlagen:', error);
        return false;
    }
}

// Exportiere die Init-Funktion
window.initFirebase = initFirebase;
