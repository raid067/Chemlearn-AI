import { validateImageBase64, ImageValidationError } from '@/lib/server/image-validator';

describe('Image Validator (Magic Bytes & Payload Inspection)', () => {
  // Valid magic byte buffers
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const validWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // file size
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20  // VP8 chunk
  ]);

  it('validates authentic JPEG images and strips data URI headers', () => {
    const raw = `data:image/jpeg;base64,${validJpegBuffer.toString('base64')}`;
    const result = validateImageBase64(raw, 'image/jpeg');
    expect(result.detectedMimeType).toBe('image/jpeg');
    expect(result.cleanBase64).toBe(validJpegBuffer.toString('base64'));
    expect(result.sizeBytes).toBe(validJpegBuffer.length);
  });

  it('validates authentic PNG images', () => {
    const raw = validPngBuffer.toString('base64');
    const result = validateImageBase64(raw, 'image/png');
    expect(result.detectedMimeType).toBe('image/png');
  });

  it('validates authentic WebP images', () => {
    const raw = validWebpBuffer.toString('base64');
    const result = validateImageBase64(raw, 'image/webp');
    expect(result.detectedMimeType).toBe('image/webp');
  });

  it('rejects fake images masquerading as JPEG with invalid signatures', () => {
    // Malicious shell script masked as image
    const scriptBuffer = Buffer.from('#!/bin/bash\necho "exploit"\n');
    const raw = scriptBuffer.toString('base64');
    expect(() => validateImageBase64(raw, 'image/jpeg')).toThrow(ImageValidationError);
    expect(() => validateImageBase64(raw, 'image/jpeg')).toThrow(
      /Only authentic JPEG, PNG, and WebP images are allowed/
    );
  });

  it('rejects MIME type mismatches (e.g. declared PNG but file is JPEG)', () => {
    const raw = validJpegBuffer.toString('base64');
    expect(() => validateImageBase64(raw, 'image/png')).toThrow(ImageValidationError);
    expect(() => validateImageBase64(raw, 'image/png')).toThrow(/does not match inspected file content/);
  });

  it('rejects empty or missing payload', () => {
    expect(() => validateImageBase64('')).toThrow(ImageValidationError);
    expect(() => validateImageBase64('data:image/jpeg;base64,')).toThrow(ImageValidationError);
  });

  it('rejects oversized images exceeding size limit', () => {
    const raw = validPngBuffer.toString('base64'); // 10 bytes
    // Buffer is 10 bytes, if limit is 5 bytes:
    expect(() => validateImageBase64(raw, 'image/png', 5)).toThrow(/exceeds maximum limit/);
  });
});
