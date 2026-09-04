const fs = require('fs');

let content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/index.html', 'utf8');

// Remove markdown stripping
content = content.replace(/\.replace\(\/\\\*\\\*\/g, ""\)\s*/, '');
content = content.replace(/\.replace\(\/\\\*\/g, ""\)\s*/, '');
content = content.replace(/\.replace\(\/#\/g, ""\)\s*/, '');

// Replace escapeHtml with marked.parse
content = content.replace(/const\s+escapedCleanText\s*=\s*escapeHtml\(cleanText\)\.replace\(\/\\n\/g,\s*'<br>'\);/, 'const escapedCleanText = typeof marked !== "undefined" ? marked.parse(cleanText) : escapeHtml(cleanText).replace(/\\n/g, "<br>");');

// Also update the chat history loop
content = content.replace(/\$\{escapeHtml\(data\.answer\)\.replace\(\/\\n\/g,\s*'<br>'\)\}/g, '');

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/index.html', content);
console.log('Fixed markdown parsing in index.html');
