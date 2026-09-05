import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-ai.js";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "chemlearn-67.firebaseapp.com",
    projectId: "chemlearn-67",
    storageBucket: "chemlearn-67.firebasestorage.app",
    messagingSenderId: "639221527001",
    appId: "1:639221527001:web:2b8ee1713b0a9606d5e9c8",
    measurementId: "G-W11M94C9N1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let model = null;
try {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
} catch (e) {
    console.warn("AI initialization note:", e);
}

export { app, auth, db, model, firebaseConfig };
