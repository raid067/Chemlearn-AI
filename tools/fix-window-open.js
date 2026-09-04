const fs = require('fs');
const file = 'c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/quizzes.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/window\.open\('([^']+)'(?:,\s*'_blank')?\)/g, "window.open('$1', '_blank', 'noopener,noreferrer')");
fs.writeFileSync(file, content);
console.log('Replaced window.open calls in quizzes.html');
