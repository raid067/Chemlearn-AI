const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Remove old imports
    content = content.replace(/import\s+\{\s*initializeApp\s*\}\s*from\s*['"]https:\/\/www\.gstatic\.com\/firebasejs\/12\.15\.0\/firebase-app\.js['"];?\s*/g, '');
    
    // Sometimes getAuth, getFirestore, getGenerativeModel etc are imported. We need to KEEP what we need, but strip the initialization.
    // It's safer to just replace the config block and initializeApp, getAuth(app), getFirestore(app)
    
    const configRegex = /const\s+firebaseConfig\s*=\s*\{[\s\S]*?appId:\s*['"][^'"]+['"]\s*\};\s*(?:const\s+app\s*=\s*initializeApp\(firebaseConfig\);)?\s*(?:const\s+auth\s*=\s*getAuth\(app\);)?\s*(?:const\s+db\s*=\s*getFirestore\(app\);)?\s*(?:const\s+model\s*=\s*getGenerativeModel\(getAI\(app\),\s*\{[^}]+\}\);)?/;
    
    if (configRegex.test(content)) {
        content = content.replace(configRegex, 'import { app, auth, db, model } from "./js/firebase-config.js";');
        fs.writeFileSync(path.join(__dirname, file), content);
        console.log('Fixed ' + file);
    }
});
