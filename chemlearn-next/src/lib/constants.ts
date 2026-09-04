import { chapter6 } from '../content/chapter6';
import { chapter8 } from '../content/chapter8';

export const BRAND = {
  purple: '#6d28d9',
  violet: '#b85ee6',
  darkBg: '#0f172a',
  cardBg: '#ffffff',
  textPrimary: '#1e1b4b',
  textSecondary: '#64748b',
  border: '#eef0f6',
} as const;

export const CHAPTERS = [chapter6, chapter8];

// Flatten topics for backward compatibility in Quiz components
export const TOPICS = CHAPTERS.flatMap(chapter => chapter.topics.map(topic => ({
  id: topic.id,
  label: topic.title,
  emoji: chapter.emoji,
  bg: chapter.bg,
  color: chapter.color
})));

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/lessons', label: 'Lessons' },
  { href: '/quizzes', label: 'Quizzes' },
  { href: '/resources', label: 'Resources' },
  { href: '/experiments', label: 'Experiment' },
  { href: '/dashboard', label: 'Dashboard' },
] as const;

export const LEVEL_TITLES = [
  { min: 80, title: 'Master Chemist' },
  { min: 50, title: 'Advanced Chemist' },
  { min: 20, title: 'Apprentice Chemist' },
  { min: 0, title: 'Novice Chemist' },
] as const;
