import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Remove the entire <nav class="global-navbar"> block.
    // Use a robust regex that matches up to the closing </nav> tag
    content = content.replace(/<nav class="global-navbar">[\s\S]*?<\/nav>/, '');

    fs.writeFileSync(path.join(__dirname, file), content);
});
console.log('Stripped navbars from all HTML files');
