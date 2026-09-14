const fs = require('fs');
const filePath = 'chemlearn-next/e2e/student-journey.spec.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/await expect\(page\.getByText\('Manufactured Substances in Industry'\)\)\.toBeVisible\(\);/g, "await expect(page.getByText('Manufactured Substances in Industry').first()).toBeVisible();");

fs.writeFileSync(filePath, code);
