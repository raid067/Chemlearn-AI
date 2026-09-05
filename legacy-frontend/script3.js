

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAnalytics }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    orderBy,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    limit
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getAI, getGenerativeModel, GoogleAIBackend }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-ai.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js";


const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "chemlearn-67.firebaseapp.com",
  projectId: "chemlearn-67",
  storageBucket: "chemlearn-67.firebasestorage.app",
  messagingSenderId: "639221527001",
  appId: "1:639221527001:web:2b8ee1713b0a9606d5e9c8",
  measurementId: "G-W11M94C9N1"
};


// Firebase initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdT2F8tAAAAAIiwdIbs6N8N_x-iZXGMwqb5qdB2"),
  isTokenAutoRefreshEnabled: true,
});

window.auth = auth;

const openLoginBtnFirebase = document.getElementById("openLoginBtn");
if (openLoginBtnFirebase) {
    openLoginBtnFirebase.addEventListener('click', () => {
        if (auth.currentUser) {
            if (confirm("Logout?")) {
                signOut(auth);
            }
        } else {
            // Need to call openModal which is in global scope
            if (typeof window.openModal === 'function') {
                window.openModal('signin');
            } else {
                console.error("openModal is not defined in global scope");
            }
        }
    });
}


const authForm = document.getElementById("authForm");

authForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const name = document.getElementById("authName").value.trim();

    try{
if(document.body.classList.contains("auth-mode-signup")){


    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );


    const user = userCredential.user;


    // Create student profile in Firestore
    await setDoc(
        doc(db,"students",user.uid),
        {
            name:name,
            email:user.email,
            level:"Form 4",
            quizScore:0,
            completedLessons:0,
            streak:1,
            createdAt:serverTimestamp()
        }
    );


    alert("🎉 Account created successfully!");

}
      else{

            await signInWithEmailAndPassword(auth,email,password);

            alert("✅ Welcome back!");

        }

        closeModal();

    }catch(error){

        alert(error.message);

    }

window.loadHistory = async function() {
    const user = auth.currentUser;
    const chatBox = document.getElementById("chatBox");
    if (!user || !chatBox) return;

    try {
        const historyRef = collection(db, "users", user.uid, "chatHistory");
        const q = query(historyRef, orderBy("timestamp", "asc"), limit(15));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        chatBox.innerHTML = `
            <div class="ai-message">
                <strong>ChemLearn AI:</strong><br>
                Welcome back! Loaded your previous study history below:
            </div>
        `;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            chatBox.innerHTML += `
                <div class="user-message">You: ${escapeHtml(data.question)}</div>
                <div class="ai-message"><strong>ChemLearn AI:</strong><br>${escapeHtml(data.answer)}</div>
            `;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        console.log("Chat history status:", err.message);
    }
};

window.newChat = function() {
    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
        chatBox.innerHTML = `
            <div class="ai-message">
                <strong>ChemLearn AI:</strong><br>
                👋 Hello! I'm your SPM Chemistry AI Tutor. Ask me any question about Form 4 or Form 5 Chemistry!
            </div>
        `;
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in:", user.email);
        const loginBtn = document.getElementById("openLoginBtn");
        const signupBtn = document.getElementById("openSignupBtn");
        if (loginBtn) loginBtn.textContent = user.email.split("@")[0];
        if (signupBtn) signupBtn.style.display = "none";
        window.loadHistory();
    } else {
        console.log("Not logged in");
        const loginBtn = document.getElementById("openLoginBtn");
        const signupBtn = document.getElementById("openSignupBtn");
        if (loginBtn) loginBtn.textContent = "Login";
        if (signupBtn) signupBtn.style.display = "inline-block";
    }
});

getAnalytics(app);


// Gemini setup
const ai = getAI(app, {
    backend: new GoogleAIBackend()
});


const model = getGenerativeModel(ai, {
    model: "gemini-3.5-flash"
});
async function generateWithRetry(model, prompt, retries = 3) {

    for (let i = 0; i < retries; i++) {

        try {
            return await model.generateContent(prompt);

        } catch (error) {

            console.error(error);

            const message = error.message || "";

            // Retry temporary server errors
            if (
                (message.includes("500") ||
                 message.includes("503")) &&
                i < retries - 1
            ) {

                console.log(`Retrying in ${2 * (i + 1)} seconds...`);

                await new Promise(resolve =>
                    setTimeout(resolve, 2000 * (i + 1))
                );

                continue;
            }

            throw error;
        }
    }
}

// AI function
window.askChemLearn = async function(){

const input=document.getElementById("userMessage");
const question=input.value.trim();

if(question===""){
return;
}

input.value="";


const chatBox=document.getElementById("chatBox");

const loading=document.createElement("div");

loading.className="ai-message";
loading.innerHTML="ChemLearn AI is thinking...";

chatBox.appendChild(loading);


try{


const prompt=`

You are ChemLearn AI Tutor for Malaysian SPM Chemistry.

Keep every answer concise, clean and easy to read.

Rules:

- Maximum 250 words unless the student asks for more.
- Avoid repeating information.
- Simple English and nowadays language and example
- No introduction.
- limit emojis but still use them if necessary.
- No markdown symbols.
- Use plain chemistry formulas.use-> for equations
-seperate each section with a line break.
-use bullet point if necessary.
-

Answer format:

Explanation:
(short explanation)

Example:
(one example)

SPM Answer:
(marking points)

SPM Tip:
(exam advice)


Student question:

${question}

`;


const result=
await generateWithRetry(
model,
prompt
);


const text=result.response.text();


let cleanText=text
.replace(/\*\*/g,"")
.replace(/\*/g,"")
.replace(/#/g,"")
.replace(/\$/g,"")
.trim();



if(auth.currentUser){

await addDoc(

collection(
db,
"users",
auth.currentUser.uid,
"chatHistory"
),

{
question,
answer:cleanText,
timestamp:serverTimestamp()
}

);

}



loading.remove();


chatBox.innerHTML +=`

<div class="user-message">

You:
${question}

</div>


<div class="ai-message">

ChemLearn:
<br>

${cleanText}

</div>

`;


chatBox.scrollTop=
chatBox.scrollHeight;


}

catch(error){


loading.remove();


console.error(error);



let msg=
"AI is temporarily unavailable.";


if(error.message.includes("429")){

msg=
"Too many requests. Please wait.";

}


else if(error.message.includes("500")
||
error.message.includes("503")){

msg=
"AI server is busy. Try again later.";

}



chatBox.innerHTML+=`

<div class="ai-message">

${msg}

</div>

`;

}

};
