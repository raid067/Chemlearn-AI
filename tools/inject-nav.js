const fs = require('fs');
const path = require('path');

const navHtml = `
    <nav class="global-navbar">
        <a href="index.html" class="brand-logo">
            <svg width="20" height="24" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; margin-right:6px;">
                <path d="M2 2H20M2 24H20M3.5 2C3.5 2 5 10.5 11 13C5 15.5 3.5 24 3.5 24M18.5 2C18.5 2 17 10.5 11 13C17 15.5 18.5 24 18.5 24" 
                    stroke="#b85ee6" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ChemLearn
        </a>
        <div class="center-nav-links">
            <a href="index.html">Home</a>
            <a href="lessons.html">Lessons</a>
            <a href="quizzes.html">Quizzes</a>
            <a href="resources.html">Resources</a>
            <a href="experiment.html">Experiments</a>
            <a href="dashboard.html">Dashboard</a>
            <a href="teacher.html">Educator Portal</a>
        </div>
        <div class="right-auth-links">
            <div class="login-btn" id="openLoginBtn">Login</div>
            <button class="signup-btn" id="openSignupBtn">Sign Up</button>
        </div>
    </nav>
`;

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let successCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove existing injected navbar if it was ever manually added
    content = content.replace(/<nav class="global-navbar">[\s\S]*?<\/nav>/g, '');
    
    // Inject the navbar right after <body> or <body ...>
    if (content.match(/<body[^>]*>/i)) {
        content = content.replace(/(<body[^>]*>)/i, `$1\n${navHtml}`);
        fs.writeFileSync(file, content);
        successCount++;
        console.log(`Injected nav into ${file}`);
    } else {
        console.log(`No body tag found in ${file}`);
    }
});
console.log(`Finished injecting. Updated ${successCount} files.`);
