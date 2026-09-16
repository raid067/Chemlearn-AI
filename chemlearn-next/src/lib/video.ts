/**
 * Helper to parse, validate, and convert various video URLs (YouTube, Vimeo, direct MP4/WebM)
 * into safe, embeddable or playable formats.
 */

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | 'empty' | 'unsupported';
  embedUrl?: string;
  directUrl?: string;
  originalUrl: string;
}

export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { type: 'empty', originalUrl: '' };
  }

  const trimmed = rawUrl.trim();

  // 1. YouTube Formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&autoplay=0`,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo Formats:
  // - https://vimeo.com/123456789
  // - https://player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // 3. Direct video files or local paths (.mp4, .webm, .mov, .ogg, blob, /path)
  const isDirectExtension = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(trimmed);
  const isBlobOrData = trimmed.startsWith('blob:') || trimmed.startsWith('data:video/');
  const isRelativeOrLocal = trimmed.startsWith('/') || !trimmed.includes('://');

  if (isDirectExtension || isBlobOrData || isRelativeOrLocal) {
    return {
      type: 'direct',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  // Fallback: If it is a generic http/https URL, try as direct media
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: 'direct',
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return {
    type: 'unsupported',
    originalUrl: trimmed,
  };
}
