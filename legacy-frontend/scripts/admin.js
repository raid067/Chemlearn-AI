// SECURITY: Hide all admin content until admin token is verified server-side
document.documentElement.style.visibility = 'hidden';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase public web config — safe to expose in client code.
// The Firebase web SDK config (apiKey, appId) is NOT a secret.
// Real security is enforced exclusively by firestore.rules checking request.auth.token.admin == true.
const firebaseConfig = {
    apiKey: "AIzaSyBcAA7uU-bKuFkBtpqLCFyB4b4PsZWlHzw",
    authDomain: "chemlearn-67.firebaseapp.com",
    projectId: "chemlearn-67",
    storageBucket: "chemlearn-67.firebasestorage.app",
    messagingSenderId: "639221527001",
    appId: "1:639221527001:web:2b8ee1713b0a9606d5e9c8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authLoader = document.getElementById('authLoader');
const logoutBtn = document.getElementById('logoutBtn');
const statStudents = document.getElementById('stat-students');
const statQuizzes = document.getElementById('stat-quizzes');
const statAvgScore = document.getElementById('stat-avgScore');
const feedbackTbody = document.getElementById('feedbackTbody');

// XSS sanitizer for table injections
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getRatingClass(rating) {
    if (rating === 5) return 'rating-5';
    if (rating === 4) return 'rating-4';
    return 'rating-low';
}

// 1. Auth Guard & Claims Check
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'index.html?error=unauthorized';
        return;
    }

    try {
        // Force refresh to get latest custom claims from Firebase server
        const idTokenResult = await user.getIdTokenResult(true);

        if (idTokenResult.claims.admin !== true) {
            console.error("Unauthorized: User does not have admin claim.");
            window.location.href = 'index.html?error=unauthorized';
            return;
        }

        // ✅ Admin claim verified — reveal the admin UI
        document.documentElement.style.visibility = 'visible';
        authLoader.style.opacity = '0';
        setTimeout(() => authLoader.style.display = 'none', 500);

        initializeAdminDashboard();
    } catch (error) {
        console.error("Error verifying admin token:", error);
        window.location.href = 'index.html?error=unauthorized';
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});

// 2. Initialize Data Binding
function initializeAdminDashboard() {
    // Listen to System Stats
    const statsRef = doc(db, 'system_stats', 'overview');
    onSnapshot(statsRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            statStudents.innerText = data.totalStudents || 0;
            statQuizzes.innerText = data.totalQuizzesCompleted || 0;

            const avg = data.averageScore || 0;
            statAvgScore.innerText = avg > 0 ? avg.toFixed(1) + '%' : '0';
        } else {
            console.warn("System stats document not found.");
            statStudents.innerText = '0';
            statQuizzes.innerText = '0';
            statAvgScore.innerText = '0';
        }
    }, (error) => {
        console.error("Error fetching system stats:", error);
    });

    // Listen to Recent Feedback (Limit 10)
    const feedbackQuery = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'), limit(10));
    onSnapshot(feedbackQuery, (snapshot) => {
        if (snapshot.empty) {
            feedbackTbody.innerHTML = '<tr><td colspan="4" class="no-data">No feedback available.</td></tr>';
            return;
        }

        feedbackTbody.innerHTML = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const ratingClass = getRatingClass(Number(data.rating));

            const tr = document.createElement('tr');
            // All user-supplied values passed through escapeHtml() before injection
            tr.innerHTML = `
                <td>${escapeHtml(formatDate(data.timestamp))}</td>
                <td><strong>${escapeHtml(data.userName || 'Anonymous')}</strong></td>
                <td><span class="rating-badge ${ratingClass}">${escapeHtml(data.rating || '-')} Stars</span></td>
                <td>${escapeHtml(data.text || '')}</td>
            `;
            feedbackTbody.appendChild(tr);
        });
    }, (error) => {
        console.error("Error fetching feedbacks:", error);
        feedbackTbody.innerHTML = '<tr><td colspan="4" class="no-data" style="color: red;">Failed to load data.</td></tr>';
    });
}
