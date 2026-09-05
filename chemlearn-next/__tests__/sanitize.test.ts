import { sanitizeHtml } from '@/lib/sanitize';

describe('Sanitize Utility (XSS Prevention & Chemistry Allowlist)', () => {
  it('strips dangerous <script> tags and payloads', () => {
    const malicious = '<p>Normal text</p><script>alert("xss")</script>';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert("xss")');
    expect(cleaned).toContain('<p>Normal text</p>');
  });

  it('strips inline event handlers like onerror and onload', () => {
    const malicious = '<img src="invalid.jpg" onerror="alert(1)" /><b onload="malicious()">Bold</b>';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('onload');
    expect(cleaned).not.toContain('alert(1)');
  });

  it('strips iframe and embed tags', () => {
    const malicious = '<iframe src="https://attacker.com"></iframe><embed src="malware.swf" />';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('<iframe');
    expect(cleaned).not.toContain('<embed');
  });

  it('preserves chemical formulas with subscripts and superscripts', () => {
    const chemical = 'Reaction: 2H<sub>2</sub> + O<sub>2</sub> &rarr; 2H<sub>2</sub>O and Cu<sup>2+</sup> ion.';
    const cleaned = sanitizeHtml(chemical);
    expect(cleaned).toContain('<sub>2</sub>');
    expect(cleaned).toContain('<sup>2+</sup>');
  });

  it('preserves structured chemistry markdown elements (headings, tables, lists)', () => {
    const table = '<h3>SPM Table</h3><table><thead><tr><th>Cation</th><th>Color</th></tr></thead><tbody><tr><td>Cu2+</td><td>Blue</td></tr></tbody></table>';
    const cleaned = sanitizeHtml(table);
    expect(cleaned).toContain('<h3>SPM Table</h3>');
    expect(cleaned).toContain('<table>');
    expect(cleaned).toContain('<th>Cation</th>');
    expect(cleaned).toContain('<td>Cu2+</td>');
  });

  it('handles empty and null inputs safely', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });
});
