const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.js'));
const defs = new Set();
const calls = new Map();
files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  [...code.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)].forEach(m => defs.add(m[1]));
  [...code.matchAll(/([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>)/g)].forEach(m => defs.add(m[1]));
  [...code.matchAll(/(?:window\.)?([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?function/g)].forEach(m => defs.add(m[1]));
  if (f.endsWith('.html')) {
    [...code.matchAll(/onclick\s*=\s*["']([^"'(]+)\s*\(/g)].forEach(m => {
      const fn = m[1].trim();
      if (!fn.match(/^(window\.|document\.|if|alert|event\.|console\.)/)) {
        if (!calls.has(fn)) calls.set(fn, new Set());
        calls.get(fn).add(f);
      }
    });
  }
});
let c = 0;
calls.forEach((fileSet, fn) => {
  if (!defs.has(fn)) {
    console.log(fn + ' in ' + [...fileSet].join(', '));
    c++;
  }
});
console.log(c + ' total missing');
