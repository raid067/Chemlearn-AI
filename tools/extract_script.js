const fs = require('fs');
const content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/experiment.html', 'utf8');

const regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let scripts = [];
while ((match = regex.exec(content)) !== null) {
    scripts.push(match[1]);
}

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/experiment.js', scripts.join('\n\n/* --- Next Script Block --- */\n\n'));

console.log('Scripts extracted to experiment.js. You can now clean it up.');
