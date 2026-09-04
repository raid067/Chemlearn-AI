const fs = require('fs');
let content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/lessons.html', 'utf8');

// Load from local storage at start
content = content.replace(/let flashcards = \[([\s\S]*?)\];/, 'let defaultFlashcards = [];\n        let flashcards = JSON.parse(localStorage.getItem("chemlearn_flashcards")) || defaultFlashcards;');

// Save on setFlashcards
content = content.replace(/flashcards = newCards\.map\(c => \(\{\.\.\.c, status: null\}\)\);/, 'flashcards = newCards.map(c => ({...c, status: null}));\n            localStorage.setItem("chemlearn_flashcards", JSON.stringify(flashcards));');

// Save on markFlashcard
content = content.replace(/flashcards\[fcIndex\]\.status = status;/, 'flashcards[fcIndex].status = status;\n            localStorage.setItem("chemlearn_flashcards", JSON.stringify(flashcards));');

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/lessons.html', content);
console.log('Fixed flashcards storage in lessons.html');
