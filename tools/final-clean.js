const fs = require('fs');
let file = 'c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/lessons.html';
let content = fs.readFileSync(file, 'utf8');

// Replace the vertexAI stuff
content = content.replace(/import \{ getVertexAI, getGenerativeModel \} from "https:\/\/www\.gstatic\.com\/firebasejs\/12\.15\.0\/firebase-vertexai\.js";/g, '');
content = content.replace(/import \{ app, auth, db \} from "\.\/firebase-config\.js";/g, 'import { app, auth, db, getChemLearnAI } from "./js/firebase-config.js";');
content = content.replace(/const vertexAI = getVertexAI\(app\);/g, '');
content = content.replace(/const model = getGenerativeModel\(vertexAI, \{ model: "gemini-2.5-flash" \}\);/g, '');
content = content.replace(/const result = await model.generateContent\(prompt\);\s*let text = result.response.text\(\);/g, 'let text = await getChemLearnAI(prompt);');

fs.writeFileSync(file, content);
console.log("Cleaned final lessons.html");
