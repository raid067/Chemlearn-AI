const fs = require('fs');
const filePath = 'chemlearn-next/__tests__/rate-limit.test.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/doc: \(id\) =>/g, 'doc: (id: string) =>');
code = code.replace(/set: async \(data\) =>/g, 'set: async (data: any) =>');
code = code.replace(/update: async \(data\) =>/g, 'update: async (data: any) =>');
code = code.replace(/runTransaction: async \(cb\) =>/g, 'runTransaction: async (cb: any) =>');
code = code.replace(/get: async \(ref\) =>/g, 'get: async (ref: any) =>');
code = code.replace(/set: \(ref, data\) =>/g, 'set: (ref: any, data: any) =>');
code = code.replace(/update: \(ref, data\) =>/g, 'update: (ref: any, data: any) =>');

fs.writeFileSync(filePath, code);
