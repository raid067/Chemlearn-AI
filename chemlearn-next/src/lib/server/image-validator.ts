/**
 * Server-side Image Validator with Magic Bytes Verification
 * Protects against polyglot file uploads, malicious binaries, and quota exhaustion.
 */

export class ImageValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ImageValidationError';
    this.statusCode = statusCode;
  }
}

export interface ValidatedImage {
  buffer: Buffer;
  cleanBase64: string;
  detectedMimeType: string;
  sizeBytes: number;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates Base64 image data using file magic numbers (signatures)
 * Supported formats: JPEG, PNG, WebP
 */
export function validateImageBase64(
  rawBase64: string,
  declaredMimeType?: string,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES
): ValidatedImage {
  if (!rawBase64 || typeof rawBase64 !== 'string') {
    throw new ImageValidationError('Image data is missing or invalid');
  }

  // Strip Data URL scheme if present (e.g. data:image/png;base64,...)
  const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();

  if (cleanBase64.length === 0) {
    throw new ImageValidationError('Image payload is empty');
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleanBase64, 'base64');
  } catch {
    throw new ImageValidationError('Failed to decode Base64 image data');
  }

  if (buffer.length === 0) {
    throw new ImageValidationError('Image buffer is empty');
  }

  if (buffer.length > maxSizeBytes) {
    throw new ImageValidationError(
      `Image size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of ${(
        maxSizeBytes /
        (1024 * 1024)
      ).toFixed(2)} MB`
    );
  }

  const detectedMimeType = detectMimeFromMagicBytes(buffer);
  if (!detectedMimeType) {
    throw new ImageValidationError(
      'Invalid or unsupported image format. Only authentic JPEG, PNG, and WebP images are allowed.'
    );
  }

  if (declaredMimeType) {
    const normalizedDeclared = declaredMimeType.toLowerCase().trim();
    if (
      normalizedDeclared !== detectedMimeType &&
      !(normalizedDeclared === 'image/jpg' && detectedMimeType === 'image/jpeg')
    ) {
      throw new ImageValidationError(
        `Declared MIME type (${declaredMimeType}) does not match inspected file content (${detectedMimeType})`
      );
    }
  }

  return {
    buffer,
    cleanBase64,
    detectedMimeType,
    sizeBytes: buffer.length,
  };
}

/**
 * Inspects the initial bytes of a buffer for valid image signatures.
 */
function detectMimeFromMagicBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  // JPEG: Starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: Starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: Starts with RIFF (52 49 46 46) ... WEBP (57 45 42 50) at offset 8
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}
