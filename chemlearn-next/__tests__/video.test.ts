import { parseVideoUrl } from '@/lib/video';

describe('Video URL Parsing and Embed Generation', () => {
  describe('YouTube Video URLs', () => {
    it('parses standard youtube.com/watch?v= URLs', () => {
      const parsed = parseVideoUrl('https://www.youtube.com/watch?v=ANi709MYnWg');
      expect(parsed.type).toBe('youtube');
      expect(parsed.embedUrl).toBe('https://www.youtube-nocookie.com/embed/ANi709MYnWg?rel=0&autoplay=0');
    });

    it('parses youtu.be short links', () => {
      const parsed = parseVideoUrl('https://youtu.be/kYJc7pW8x2c');
      expect(parsed.type).toBe('youtube');
      expect(parsed.embedUrl).toBe('https://www.youtube-nocookie.com/embed/kYJc7pW8x2c?rel=0&autoplay=0');
    });

    it('parses youtube.com/embed/ URLs', () => {
      const parsed = parseVideoUrl('https://www.youtube.com/embed/Xeuyc55LqiY');
      expect(parsed.type).toBe('youtube');
      expect(parsed.embedUrl).toBe('https://www.youtube-nocookie.com/embed/Xeuyc55LqiY?rel=0&autoplay=0');
    });

    it('parses youtube.com/shorts/ URLs', () => {
      const parsed = parseVideoUrl('https://www.youtube.com/shorts/F0vA7Y4g1QY');
      expect(parsed.type).toBe('youtube');
      expect(parsed.embedUrl).toBe('https://www.youtube-nocookie.com/embed/F0vA7Y4g1QY?rel=0&autoplay=0');
    });
  });

  describe('Vimeo Video URLs', () => {
    it('parses standard vimeo.com URLs', () => {
      const parsed = parseVideoUrl('https://vimeo.com/76979871');
      expect(parsed.type).toBe('vimeo');
      expect(parsed.embedUrl).toBe('https://player.vimeo.com/video/76979871');
    });
  });

  describe('Direct Video Files and Fallbacks', () => {
    it('recognizes direct .mp4 files', () => {
      const parsed = parseVideoUrl('https://cdn.example.com/chemistry/lesson.mp4');
      expect(parsed.type).toBe('direct');
      expect(parsed.directUrl).toBe('https://cdn.example.com/chemistry/lesson.mp4');
    });

    it('handles relative paths and local video names', () => {
      const parsed = parseVideoUrl('8.1.1.mp4');
      expect(parsed.type).toBe('direct');
      expect(parsed.directUrl).toBe('8.1.1.mp4');
    });

    it('handles empty or whitespace strings cleanly', () => {
      expect(parseVideoUrl('').type).toBe('empty');
      expect(parseVideoUrl('   ').type).toBe('empty');
      expect(parseVideoUrl(null).type).toBe('empty');
      expect(parseVideoUrl(undefined).type).toBe('empty');
    });
  });
});
