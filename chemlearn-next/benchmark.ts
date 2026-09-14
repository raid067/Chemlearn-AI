import { isValidKSSMTopic } from './src/lib/server/curriculum-validator';

const testCases = [
  'chapter-6',
  'Acids, Bases and Salts',
  '6-1',
  '6.1',
  'role of water',
  'pH Value',
  'Standard Solutions',
  'something else entirely',
  'not a topic',
  '8.4',
  'composite materials',
  'chapter 6'
];

console.log('Warming up...');
for (let i = 0; i < 10000; i++) {
  for (const tc of testCases) {
    isValidKSSMTopic(tc);
  }
}

console.log('Benchmarking...');
const start = performance.now();
const ITERATIONS = 100000;

for (let i = 0; i < ITERATIONS; i++) {
  for (const tc of testCases) {
    isValidKSSMTopic(tc);
  }
}

const end = performance.now();
console.log(`Time taken: ${(end - start).toFixed(2)} ms for ${ITERATIONS * testCases.length} calls`);
console.log(`Average time per call: ${((end - start) / (ITERATIONS * testCases.length) * 1000).toFixed(4)} μs`);
