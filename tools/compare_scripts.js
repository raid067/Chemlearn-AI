const fs = require('fs');
const content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/experiment.js', 'utf8');

const blocks = content.split('/* --- Next Script Block --- */');
console.log('Number of script blocks:', blocks.length);

blocks.forEach((b, i) => {
    console.log('Block', i, 'Length:', b.length);
});

// Let's just keep the last block because it usually contains all the additions (or maybe the longest block)
let longest = blocks[0];
for (let b of blocks) {
    if (b.length > longest.length) longest = b;
}

fs.writeFileSync('c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/experiment.js', longest);
console.log('experiment.js updated to only contain the longest block (length ' + longest.length + ').');
