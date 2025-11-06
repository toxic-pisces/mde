// Firebase Configuration
// WICHTIG: Bitte ersetzen Sie diese Werte mit Ihren eigenen Firebase-Projektwerten
// Sie finden diese in der Firebase Console unter: Project Settings > General > Your apps

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase initialisieren
let app, database;

function initFirebase() {
    try {
        // Firebase App initialisieren
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✓ Firebase erfolgreich initialisiert');
        return true;
    } catch (error) {
        console.error('✗ Firebase Initialisierung fehlgeschlagen:', error);
        return false;
    }
}

// Exportiere die Firebase-Instanzen
window.firebaseApp = app;
window.firebaseDatabase = database;
window.initFirebase = initFirebase;
