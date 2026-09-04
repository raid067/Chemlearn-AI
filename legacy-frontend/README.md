# ChemLearn AI 🧪

> **Interactive KSSM Chemistry Learning Platform powered by AI and Virtual Lab Simulations**

ChemLearn AI is an innovative, open-access web platform designed specifically for high school students studying **Malaysian KSSM Form 4 & Form 5 Chemistry (SPM)**. It bridges the gap between abstract chemical theory and practical lab experience through real-time AI tutoring, virtual lab simulations, interactive quizzes, and gamified progress tracking.

---

## 🌟 Key Features

1. **🧪 Chapter 6 Virtual Lab Simulator (`experiment.html`)**
   - **Thermal Decomposition**: Observe gas evolution and color changes of metal carbonates & nitrates.
   - **Cation & Anion Tests**: Test white/colored precipitates with $\text{NaOH}$ and $\text{NH}_3$.
   - **Volumetric Titration & Dilution**: Practice neutralization calculations ($M_1V_1 = M_2V_2$) with dynamic meniscus feedback.
   - **Gas Identification Simulator**: Test gases with lighted/glowing splints and limewater.

2. **🤖 SPM AI Chemistry Tutor (`index.html`)**
   - Real-time chemistry Q&A trained on Malaysian KSSM DSKP syllabus.
   - Generates structured SPM-style answers (Definitions, Observations, Balanced Chemical Equations, and Exam Tips).
   - Instant response streaming powered by Firebase Vertex AI / Gemini 2.5 Flash.

3. **📊 Gamified Dashboard (`dashboard.html`)**
   - Live XP points, streak counters, and achievement badges (*First Blood*, *Diligent Scholar*, *Lab Master*).
   - Real-time leaderboard and personalized study goal tracking.

4. **📚 KSSM Form 4 & Form 5 Core Lessons (`lessons.html` & `resources.html`)**
   - **Chapter 6**: Acids, Bases, and Salts
   - **Chapter 8**: Manufactured Substances in Industry (Alloys, Glass, Ceramics, Composite Materials)
   - PDF Downloadable Summaries and Exam Cheat-Sheets.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism design, custom particle animations), JavaScript (ES6 Modules).
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Firebase App Check, Express.js (Node.js backend API).
- **AI Integration**: Firebase Vertex AI (`@firebase/ai` SDK running `gemini-2.5-flash`) & OpenAI API (`gpt-4o-mini`).
- **Build Tool**: Vite (`npm run dev`).

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation & Running

1. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Running the Backend Server (Optional)**:
   ```bash
   cd ../backend
   npm install
   node server.js
   ```

---

## 🏆 Science Fair & Innovation Pitch Highlights

- **Real Problem Solved**: SPM Chemistry is widely considered one of the hardest SPM subjects due to expensive physical lab apparatus limits and abstract formulas. ChemLearn AI provides 100% free virtual lab access to every student.
- **Dual Language Compatible**: Designed for Dual Language Programme (DLP) students in Malaysia.
- **Production-Ready Architecture**: Built with authenticated Firebase rules, rate-limited AI API routes, and cloud-synced progress.

---

## 👤 Author & Credits

Created for the **National Youth Innovation Competition**. Designed & developed by a 16-year-old student passionate about EdTech, AI, and Chemistry! 🚀
