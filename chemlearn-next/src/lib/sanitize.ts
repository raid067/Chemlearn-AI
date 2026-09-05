import DOMPurify from 'dompurify';

export const CHEMISTRY_ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's',
  'sub', 'sup',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
  'code', 'pre', 'blockquote',
];

export const CHEMISTRY_ALLOWED_ATTR = [
  'class', 'className', 'id', 'align', 'colspan', 'rowspan',
];

/**
 * Universal HTML sanitizer optimized for scientific and chemistry content.
 * Strips XSS vectors (<script>, <iframe>, event handlers, javascript: URIs)
 * while preserving essential chemical formulas, equations, subscripts, and structural tags.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  if (typeof window === 'undefined') {
    try {
      if (typeof DOMPurify?.sanitize === 'function') {
        return DOMPurify.sanitize(dirty, {
          ALLOWED_TAGS: CHEMISTRY_ALLOWED_TAGS,
          ALLOWED_ATTR: CHEMISTRY_ALLOWED_ATTR,
          FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'href', 'style'],
        });
      }
    } catch {
      // Fallback in pure SSR without window/DOM
    }

    // Defensive regex sanitization for server environments without DOM
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/style\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
      .replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '')
      .replace(/javascript\s*:/gi, '');
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: CHEMISTRY_ALLOWED_TAGS,
    ALLOWED_ATTR: CHEMISTRY_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });
}
